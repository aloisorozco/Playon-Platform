from datetime import datetime
from bbm.model.FantasyTeam import FantasyTeam, NbaTeam

class Season:

    def __init__(self, id : int, name : str, start_date : datetime, end_date : datetime):
        self.id = id
        self.name = name
        self.start_date = start_date
        self.end_date = end_date

class NbaSeason(Season):

    def __init__(self, id : int, name : str, start_date : datetime, end_date : datetime, teams = [] : list[FantasyTeam], players = [] : list[Player]):
        super().__init__(id, name, start_date, end_date)
        self.teams = teams
        self.players = players

class FantasySeason(Season):

    def __init__(self, id : int, name : str, start_date : datetime, end_date : datetime, teams = [] : list[FantasyTeam]):
        super().__init__(id, name, start_date, end_date)
        self.teams = teams

class FantasySeasonConfig:
    
    def __init__(self, id : int, num_of_players : int, num_of_rounds : int, point_calculation_formula = PointCalculationFormula.default_point_calculation_formula() : PointCalculationFormula):
        self.id = id
        self.num_of_players = num_of_players
        self.num_of_rounds = num_of_rounds
        self.point_calculation_formula = point_calculation_formula

class PointCalculationFormula:

    @staticmethod
    def default_point_calculation_formula():
        return PointCalculationFormula(1.0, 1.0, 1.0, 1.0, 1.0, -1.0)

    def __init__(self, id : int, point_multiplier : float, assist_multiplier : float, rebound_multiplier : float, steal_multiplier : float, block_multiplier : float, turnover_multiplier : float):
        self.id = id
        self.point_multiplier = point_multiplier
        self.assist_multiplier = assist_multiplier
        self.rebound_multiplier = rebound_multiplier
        self.steal_multiplier = steal_multiplier
        self.block_multiplier = block_multiplier
        self.turnover_multiplier = turnover_multiplier
