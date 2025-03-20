from bs4 import BeautifulSoup
import requests

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

from avgPlayer import Player

cred = credentials.Certificate("credentials.json")
firebase_admin.initialize_app(cred)

url = "https://www.basketball-reference.com/leagues/NBA_2025_per_game.html"
result = requests.get(url)
doc = BeautifulSoup(result.text, "html.parser")
div = doc.find(["div"], id="all_per_game_stats")
main_table = div.find(["tbody"])
trs = main_table.find_all(["tr"])

db = firestore.client()
update_time, league_ref = db.collection("leagues").add({"managerId": "vGKvxz77lfRbONIVjHsI32kDk7E3", "name": "YMCA"})
print(league_ref.id)

for tr in trs:
    p = Player(tr.find("td", {"data-stat" : "name_display"}).string, tr.find("td", {"data-stat" : "pos"}).string, tr.find("td", {"data-stat" : "team_name_abbr"}).string,tr.find("td", {"data-stat" : "pts_per_g"}).string, tr.find("td", {"data-stat" : "trb_per_g"}).string, tr.find("td", {"data-stat" : "ast_per_g"}).string, tr.find("td", {"data-stat" : "blk_per_g"}).string, tr.find("td", {"data-stat" : "stl_per_g"}).string, tr.find("td", {"data-stat" : "tov_per_g"}).string)
    print(p.__dict__)
    db.collection(f"leagues/{league_ref.id}/players").add(p.__dict__)
