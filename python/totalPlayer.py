class Player:

    def __init__(self, name, position, team, total_points, total_rebounds, total_assists, total_blocks, total_steals, total_turnovers):
        self.name = name
        self.position = position
        self.team = team
        self.total_points = total_points
        self.total_rebounds = total_rebounds
        self.total_assists = total_assists
        self.total_blocks = total_blocks
        self.total_steals = total_steals
        self.total_turnovers = total_turnovers
        self.f_points = int(total_points) + (int(total_rebounds)*1.2) + (int(total_assists)*1.5) + (int(total_blocks)*3) + (int(total_steals)*3) + (int(total_turnovers)*(-1))


    def __str__(self):
        return f"{self.name} {self.position} {self.team} {self.total_points} {self.total_rebounds} {self.total_assists} {self.total_blocks} {self.total_steals} {self.total_turnovers} {self.f_points.string}"

