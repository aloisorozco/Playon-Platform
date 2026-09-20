required from bbm.model.FantasySeason import FantasySeason

class League:
    def __init__(self, id : int, name : str, owner_id : int, seasons = [] : list[FantasySeason]):
        self.id = id
        self.name = name
        self.owner_id = owner_id
        self.seasons = seasons