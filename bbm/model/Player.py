class Player:

    def __init__(self, id : int, name : str, team_id : int, picture_url = None : str, regular_season_stats = None : RegularSeasonStats, playoff_stats = None : PlayoffStats):
        self.id = id
        self.name = name
        self.team_id = team_id
        self.picture_url = picture_url
        self.regular_season_stats = regular_season_stats
        self.playoff_stats = playoff_stats


class RegularSeasonStats:

    def __init__(self, games_played: int, points_per_game : float, assists_per_game : float, rebounds_per_game : float, steals_per_game : float, blocks_per_game : float, turnovers_per_game : float):
        self.games_played = games_played
        self.points_per_game = points_per_game
        self.assists_per_game = assists_per_game
        self.rebounds_per_game = rebounds_per_game
        self.steals_per_game = steals_per_game
        self.blocks_per_game = blocks_per_game
        self.turnovers_per_game = turnovers_per_game

class PlayoffStats:

    def __init__(self, games_played: int, points : float, assists : float, rebounds : float, steals : float, blocks : float, turnovers : float):
        self.games_played = games_played
        self.points = points
        self.assists = assists
        self.rebounds = rebounds
        self.steals = steals
        self.blocks = blocks
        self.turnovers = turnovers