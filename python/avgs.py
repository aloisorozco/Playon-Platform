from bs4 import BeautifulSoup
import requests
import mysql.connector

from avgPlayer import Player

url = "https://www.basketball-reference.com/leagues/NBA_2022_per_game.html"

result = requests.get(url)
doc = BeautifulSoup(result.text, "html.parser")

trs = doc.find_all(["tr"], class_="full_table")

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="playondb"
)

cursor = db.cursor()

for tr in trs:

    p = Player(tr.find("td", {"data-stat" : "player"}).string, tr.find("td", {"data-stat" : "pos"}).string, tr.find("td", {"data-stat" : "team_id"}).string,tr.find("td", {"data-stat" : "pts_per_g"}).string, tr.find("td", {"data-stat" : "trb_per_g"}).string, tr.find("td", {"data-stat" : "ast_per_g"}).string, tr.find("td", {"data-stat" : "blk_per_g"}).string, tr.find("td", {"data-stat" : "stl_per_g"}).string, tr.find("td", {"data-stat" : "tov_per_g"}).string)
    cursor.execute("INSERT INTO players (name, position, team, avg_points, avg_rebounds, avg_assists, avg_blocks, avg_steals, avg_turnovers) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)", (str(p.name), str(p.position), str(p.team), str(p.avg_points), str(p.avg_rebounds), str(p.avg_assists), str(p.avg_blocks), str(p.avg_steals), str(p.avg_turnovers)))
    db.commit()
