# creates a new league with me as default manager

from bs4 import BeautifulSoup
import requests

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

from classes.avg_player import Player

cred = credentials.Certificate("credentials.json")
firebase_admin.initialize_app(cred)

non_playoff_teams = {'POR', 'CHO', 'UTA', 'WAS', 'SAS', 'PHI', 'BRK', 'NOP'}

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
    if tr.has_attr('class') and tr['class'][0] == 'partial_table':
        counter += 1
        if num_of_teams == counter and num_of_teams != 0:
            p.team = tr.find("td", {"data-stat" : "team_name_abbr"}).string
            num_of_teams = 0
            print(p.__dict__)
            db.collection(f"leagues/{league_ref.id}/players").add(p.__dict__)
        continue
    
    try:
        p = Player(tr.find("td", {"data-stat" : "name_display"}).string, tr.find("td", {"data-stat" : "pos"}).string, tr.find("td", {"data-stat" : "team_name_abbr"}).string, tr.find("td", {"data-stat" : "pts_per_g"}).string, tr.find("td", {"data-stat" : "trb_per_g"}).string, tr.find("td", {"data-stat" : "ast_per_g"}).string, tr.find("td", {"data-stat" : "blk_per_g"}).string, tr.find("td", {"data-stat" : "stl_per_g"}).string, tr.find("td", {"data-stat" : "tov_per_g"}).string)
        # removing players under 18 fantasy points (no one will draft them) and non playoff teams
        if p.avgFantasyPoints < 18 or p.team in non_playoff_teams:
            continue
        
        if 'TM' in p.team:
            num_of_teams = int(p.team[0])
            counter = 0
            continue

        num_of_teams = 0
        print(p.__dict__)
        db.collection(f"leagues/{league_ref.id}/players").add(p.__dict__)
    except:
        continue
