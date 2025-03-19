from bs4 import BeautifulSoup
import requests
import mysql.connector

from totalPlayer import Player


#WILL HAVE TO BE SCHEDULED FOR EVERY MORNING
url = "https://www.basketball-reference.com/playoffs/NBA_2022_totals.html"#playoff totals page instead

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

    p = Player(tr.find("td", {"data-stat" : "player"}).string, tr.find("td", {"data-stat" : "pos"}).string, tr.find("td", {"data-stat" : "team_id"}).string,tr.find("td", {"data-stat" : "pts"}).string, tr.find("td", {"data-stat" : "trb"}).string, tr.find("td", {"data-stat" : "ast"}).string, tr.find("td", {"data-stat" : "blk"}).string, tr.find("td", {"data-stat" : "stl"}).string, tr.find("td", {"data-stat" : "tov"}).string)
    cursor.execute("UPDATE players SET total_points = %s, total_rebounds = %s, total_assists = %s, total_blocks = %s, total_steals = %s, total_turnovers = %s, f_points = %s WHERE name = %s", (str(p.total_points), str(p.total_rebounds), str(p.total_assists), str(p.total_blocks), str(p.total_steals), str(p.total_turnovers), str(p.f_points), str(p.name)))
    db.commit()