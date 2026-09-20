class Team:
    
    def __init__(self, id, name):
        self.id = id
        self.name = name

class NbaTeam(Team):

    def __init__(self, id, name, eliminated):
        super().__init__(id, name)
        self.eliminated = eliminated

class FantasyTeam(Team):

    def __init__(self, id, name, player_ids = [], points = 0):
        super().__init__(id, name)
        self.player_ids = player_ids
        self.points = points