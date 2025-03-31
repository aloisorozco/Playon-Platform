import time
import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

from classes.connection_manager import DraftConnectionManager

app = FastAPI()

cred = credentials.Certificate("credentials.json")
firebase_admin.initialize_app(cred)

db = firestore.client()
draft_managers = {}

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <h2>Your ID: <span id="ws-id"></span></h2>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            var league_id = 'O28U9IaSpd6hZj7fBOZ1';
            var client_id = Date.now()
            document.querySelector("#ws-id").textContent = client_id;
            var ws = new WebSocket(`ws://localhost:8000/draft/${league_id}/${client_id}`);
            ws.onmessage = function(event) {
                var messages = document.getElementById('messages')
                var message = document.createElement('li')
                var content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(JSON.stringify({test: input.value}))
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""

@app.get("/")
async def get():
    return HTMLResponse(html)

@app.websocket("/draft/{league_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, league_id: str, client_id: str):
    print(league_id)
    print(client_id)
    if league_id not in draft_managers:
        draft_managers[league_id] = DraftConnectionManager(league_id, db)
    await draft_managers[league_id].connect(websocket, client_id)
    await draft_managers[league_id].send_draft_info(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            print('data received from client: ' + str(data))
            await draft_managers[league_id].draft(data['playerId'], client_id)

            #await draft_managers[league_id].send_personal_message(f"You wrote: {data['test']}", websocket)
            #await draft_managers[league_id].broadcast(f"Client #{client_id} says: {data['test']}")
    except WebSocketDisconnect as e:
        print(e)
        draft_managers[league_id].disconnect(websocket, client_id)
        # await draft_managers[league_id].broadcast(f"Client #{client_id} left the chat")