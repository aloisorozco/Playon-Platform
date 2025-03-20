import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

import random

cred = credentials.Certificate("credentials.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

leagues = db.collection("leagues").stream()

for league in leagues:
    print(f"{league.id} => {league.to_dict()}")

    teams = list(db.collection(f"leagues/{league.id}/teams").stream())
    teamIds = []
    for team in teams:
        teamIds.append(team.id)
    random.shuffle(teamIds)

    draftOrder = []
    for i in range(8):
        if i % 2 == 0:
            draftOrder += teamIds
        else:
            draftOrder += teamIds[::-1]

    print(draftOrder)
    league_ref = db.collection("leagues").document(league.id)
    league_ref.update({"draftPlace": 0, "draftOrder": draftOrder})