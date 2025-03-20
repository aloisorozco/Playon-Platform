class Player:

    def __init__(self, name, position, team, avg_points, avg_rebounds, avg_assists, avg_blocks, avg_steals, avg_turnovers):
        self.name = name
        self.position = position
        self.team = team
        self.avg_points = float(avg_points)
        self.avg_rebounds = float(avg_rebounds)
        self.avg_assists = float(avg_assists)
        self.avg_blocks = float(avg_blocks)
        self.avg_steals = float(avg_steals)
        self.avg_turnovers = float(avg_turnovers)
        self.avgFantasyPoints = self.avg_points + 1.2 * self.avg_rebounds + 1.5 * self.avg_assists + 3 * self.avg_steals + 3 * self.avg_blocks - self.avg_turnovers
        self.teamId = ''

    def __str__(self):
        return f"{self.name} {self.position} {self.team} {self.avg_points} {self.avg_rebounds} {self.avg_assists} {self.avg_blocks} {self.avg_steals} {self.avg_turnovers} {self.teamId}"

