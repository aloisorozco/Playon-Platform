# takes a leagueId in command line to start draft

import sys
import random

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

league_ref = db.collection("leagues").document(leagueId)
league_ref.update({'startDraft': True})