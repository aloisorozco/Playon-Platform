import threading
import asyncio
import json

from fastapi import WebSocket

class DraftConnectionManager:
    def __init__(self, league_id, db):
        self.db = db
        self.league_id = league_id
        self.callback_done = threading.Event()
        self.active_connections = []
        _thread = threading.Thread(target=self.wrap_async_func)
        _thread.start()
        self.league_ref = db.collection("leagues").document(league_id)
        league_watch = self.league_ref.on_snapshot(self.on_snapshot)
    
    async def wait_for_snapshot(self):
        while True:
            tname = threading.current_thread().name
            print(f'wait_for_snapshot thread waiting for event: {tname}')
            self.callback_done.wait()
            print(f'wait_for_snapshot thread got event: {tname}')
            await self.broadcast(self.draft_info)
            self.callback_done = threading.Event()

    def wrap_async_func(self):
        asyncio.run(self.wait_for_snapshot())

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
            
    async def send_personal_message(self, message, websocket: WebSocket):
        print('sending personal msg: ' + str(message))
        await websocket.send_json(message)

    async def broadcast(self, message):
        print('broadcasting: ' + str(message))
        for connection in self.active_connections:
            await connection.send_json(message)
    
    async def send_draft_info(self, websocket):
        if hasattr(self, 'draft_info'):
            await self.send_personal_message(self.draft_info, websocket)

    def draft(self, player_id, client_id):
        league = self.league_ref.get().to_dict()

        if league['draftOrder'][league['draftPlace']]['team'] != client_id:
            return
        
        self.db.collection(f'leagues/{self.league_id}/players').document(player_id).update({
            'teamId': client_id
        })
        
        league['draftOrder'][league['draftPlace']] = {
            'team': league['draftOrder'][league['draftPlace']]['team'],
            'player': player_id
        }
        league['draftPlace'] += 1
        self.league_ref.update(league)

        
        self.draft_event.set()

    def auto_draft(self):
        #TODO: do firebase stuff
        pass

    def start_auto_draft_timer(self):
        print("start_auto_draft_timer thread started")
        
        flag = self.draft_event.wait() # 60
        if flag:
            print("draft_event was set to true()")
        else:
            print("time out occured, executing auto draft without waiting for draft_event")
            self.auto_draft()

    def on_snapshot(self, league_snapshot, changes, read_time):
        for league in league_snapshot:
            print(f"Received document snapshot: {league.id} => {league.to_dict()}")
            self.league_info = league.to_dict()
            try:
                self.draft_info = {
                    "lastDrafted": self.league_info["draftOrder"][self.league_info["draftPlace"] - 1],
                    "curTeamToDraft": self.league_info["draftOrder"][self.league_info["draftPlace"]]["team"]
                }
            except:
                self.draft_info = {
                    "curTeamToDraft": self.league_info["draftOrder"][self.league_info["draftPlace"]]["team"]
                }
            
            if 'startDraft' in self.league_info and self.league_info['draftPlace'] < len(self.league_info['draftOrder']):
                self.draft_event = threading.Event()
                timer_thread = threading.Thread(target=self.start_auto_draft_timer)
                timer_thread.start()

        self.callback_done.set()
