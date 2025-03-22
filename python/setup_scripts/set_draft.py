import sys
import random

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

leagueId = sys.argv[1]
if leagueId is None:
    print("League id not specified")
    sys.exit(1)

cred = credentials.Certificate("../credentials.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

players = list(db.collection(f"leagues/{leagueId}/players").stream())
for player in players:
    player_ref = db.collection(f"leagues/{leagueId}/players").document(player.id)
    player_ref.update({"teamId": ''})

teams = list(db.collection(f"leagues/{leagueId}/teams").stream())
teamIds = []
for team in teams:
    teamIds.append({"team": team.id})
random.shuffle(teamIds)

draftOrder = []
for i in range(8):
    if i % 2 == 0:
        draftOrder += teamIds
    else:
        draftOrder += teamIds[::-1]

print(draftOrder)
league_ref = db.collection("leagues").document(leagueId)
league_ref.update({"draftPlace": 0, "draftOrder": draftOrder})
