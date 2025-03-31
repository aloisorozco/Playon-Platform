import threading
import asyncio
import json

from fastapi import WebSocket
from google.cloud.firestore_v1.base_query import FieldFilter
from firebase_admin import firestore

class DraftConnectionManager:
    def __init__(self, league_id, db):
        self.db = db
        self.league_id = league_id
        self.callback_done = threading.Event()
        self.active_connections = {}
        self.draft_events = {}
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
            if hasattr(self, 'draft_info'):
                await self.broadcast(self.draft_info)
            self.callback_done = threading.Event()

    def wrap_async_func(self):
        asyncio.run(self.wait_for_snapshot())

    async def connect(self, websocket: WebSocket, client_id):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, websocket: WebSocket, client_id):
        del self.active_connections[client_id]
            
    async def send_personal_message(self, message, websocket: WebSocket):
        print('sending personal msg: ' + str(message))
        await websocket.send_json(message)

    async def broadcast(self, message):
        print('broadcasting: ' + str(message))
        for key in self.active_connections:
            await self.active_connections[key].send_json(message)
    
    async def send_draft_info(self, websocket):
        if hasattr(self, 'draft_info'):
            await self.send_personal_message(self.draft_info, websocket)

    async def draft(self, player_id, client_id):
        league = self.league_ref.get().to_dict()

        try:
            if league['draftOrder'][league['draftPlace']]['team'] != client_id:
                return
        except:
            await self.broadcast({"remainingTime": None})
            return
        
        self.db.collection(f'leagues/{self.league_id}/players').document(player_id).update({
            'teamId': client_id
        })
        
        league['draftOrder'][league['draftPlace']] = {
            'team': league['draftOrder'][league['draftPlace']]['team'],
            'player': player_id
        }
        self.draft_events[self.league_info['draftPlace']].set()
        league['draftPlace'] += 1
        self.league_ref.update(league)


    def auto_draft(self):
        player_query = self.db.collection(f'leagues/{self.league_id}/players').where(filter=FieldFilter("teamId", "==", '')).limit(1).order_by('avgFantasyPoints', direction=firestore.Query.DESCENDING)
        
        results = player_query.get()
        print('results')
        print(results)
        player_to_draft =  player_query.get()[0]

        league = self.league_ref.get().to_dict()
        
        self.db.collection(f'leagues/{self.league_id}/players').document(player_to_draft.id).update({
            'teamId': self.draft_info['curTeamToDraft']
        })
        
        league['draftOrder'][league['draftPlace']] = {
            'team': league['draftOrder'][league['draftPlace']]['team'],
            'player': player_to_draft.id
        }
        league['draftPlace'] += 1
        self.league_ref.update(league)
    
    def wrap_start_auto_draft_timer(self):
        asyncio.run(self.start_auto_draft_timer(self.league_info['draftPlace']))

    async def start_auto_draft_timer(self, draftPlace):
        await asyncio.sleep(1)
        remainingTime = 30
        while not self.draft_events[draftPlace].is_set():
            if remainingTime <= 0:
                self.auto_draft()
                break
            
            await self.send_personal_message({"remainingTime": remainingTime}, self.active_connections[self.draft_info['curTeamToDraft']])
            remainingTime -= 1
            await asyncio.sleep(1)

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
                try:
                    self.draft_info = {
                        "curTeamToDraft": self.league_info["draftOrder"][self.league_info["draftPlace"]]["team"]
                    }
                except:
                    del self.draft_info
            
            if 'startDraft' in self.league_info and self.league_info['startDraft'] == True and self.league_info['draftPlace'] < len(self.league_info['draftOrder']):
                self.draft_events[self.league_info['draftPlace']] = threading.Event()
                timer_thread = threading.Thread(target=self.wrap_start_auto_draft_timer)
                timer_thread.start()

        self.callback_done.set()
