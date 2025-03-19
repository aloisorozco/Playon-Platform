class Player:

    def __init__(self, name, position, team, avg_points, avg_rebounds, avg_assists, avg_blocks, avg_steals, avg_turnovers):
        self.name = name
        self.position = position
        self.team = team
        self.avg_points = avg_points
        self.avg_rebounds = avg_rebounds
        self.avg_assists = avg_assists
        self.avg_blocks = avg_blocks
        self.avg_steals = avg_steals
        self.avg_turnovers = avg_turnovers

    def __str__(self):
        return f"{self.name} {self.position} {self.team} {self.avg_points} {self.avg_rebounds} {self.avg_assists} {self.avg_blocks} {self.avg_steals} {self.avg_turnovers}"

