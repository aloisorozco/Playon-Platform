class DraftPlace:
    def __init__(self, id : int, owner_id : int, player_id = None : int):
        self.id = id
        self.owner_id = owner_id
        self.player_id = player_id

class DraftOrder:
    ## factory class to create a draft order from a FantasySeasonConfig