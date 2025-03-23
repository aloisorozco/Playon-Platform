# goes through all leagues and updates the points accumulated

from bs4 import BeautifulSoup
import requests

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from totalPlayer import Player

cred = credentials.Certificate("credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

#TODO: WILL HAVE TO BE SCHEDULED FOR EVERY MORNING
url = "https://www.basketball-reference.com/playoffs/NBA_2024_totals.html" # playoff totals page instead

leagues = list(db.collection("leagues").stream())
for league in leagues:

    result = requests.get(url)
    doc = BeautifulSoup(result.text, "html.parser")

    trs = doc.find_all(["tr"], class_="full_table")
    for tr in trs:
        p = Player(tr.find("td", {"data-stat" : "player"}).string, tr.find("td", {"data-stat" : "pos"}).string, tr.find("td", {"data-stat" : "team_id"}).string,tr.find("td", {"data-stat" : "pts"}).string, tr.find("td", {"data-stat" : "trb"}).string, tr.find("td", {"data-stat" : "ast"}).string, tr.find("td", {"data-stat" : "blk"}).string, tr.find("td", {"data-stat" : "stl"}).string, tr.find("td", {"data-stat" : "tov"}).string)
        print(p.__dict__)

        player_in_db = (
        db.collection(f"leagues/{league.id}/players")
            .where(filter=FieldFilter("name", "==", p.name))
            .stream()
        )

        for player in player_in_db:
            print(f"{player.id} => {player.to_dict()}")
            league_ref = db.collection(f"leagues/{league.id}/players").document(player.id)
            league_ref.update({'pointsAccumulated': p.points_accumulated})
