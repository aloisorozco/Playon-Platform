import threading
import sys
import time

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

leagueId = sys.argv[1]
if leagueId is None:
    print("League id not specified")
    sys.exit(1)

cred = credentials.Certificate("credentials.json")
firebase_admin.initialize_app(cred)

db = firestore.client()


# Create an Event for notifying main thread.
callback_done = threading.Event()

# Create a callback on_snapshot function to capture changes
def on_snapshot(doc_snapshot, changes, read_time):
    for doc in doc_snapshot:
        print(f"Received document snapshot: {doc.id} => {doc.to_dict()}")
    callback_done.set()

doc_ref = db.collection("leagues").document(leagueId)

# Watch the document
doc_watch = doc_ref.on_snapshot(on_snapshot)

while True:
    time.sleep(1)