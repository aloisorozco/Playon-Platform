map_names = {
    'Nikola JokiÄ\x87': 'Nikola Jokic',
    'Luka DonÄ\x8diÄ\x87': 'Luka Doncic',
    'Kristaps PorziÅ\x86Ä£is': 'Kristaps Porzingis',
    'Alperen Å\x9eengÃ¼n': 'Alperen Sengun',
    'Nikola VuÄ\x8deviÄ\x87': 'Nikola Vucevic',
    'Jonas ValanÄ\x8diÅ«nas': 'Jonas Valanciunas',
    'Dennis SchrÃ¶der': 'Dennis Schroder',
    'Bogdan BogdanoviÄ\x87': 'Bogdan Bogdanovic',
    'Nikola JoviÄ\x87': 'Nikola Jovic'
}

class Player:

    def __init__(self, name, position, team, total_points, total_rebounds, total_assists, total_blocks, total_steals, total_turnovers):
        self.name = self.getName(name)
        self.position = position
        self.team = team
        self.total_points = total_points
        self.total_rebounds = total_rebounds
        self.total_assists = total_assists
        self.total_blocks = total_blocks
        self.total_steals = total_steals
        self.total_turnovers = total_turnovers
        self.points_accumulated = int(total_points) + (int(total_rebounds)*1.2) + (int(total_assists)*1.5) + (int(total_blocks)*3) + (int(total_steals)*3) + (int(total_turnovers)*(-1))


    def getName(self, name):
        if name in map_names:
            return map_names[name]
        return name

    def __str__(self):
        return f"{self.name} {self.position} {self.team} {self.total_points} {self.total_rebounds} {self.total_assists} {self.total_blocks} {self.total_steals} {self.total_turnovers} {self.points_accumulated.string}"
