function tap(func) {
  return (data) => {
    func(data);
    return data;
  }
}

function parseTeams(games) {
  const teamMap = games
    .map(game => [game.home, game.away])
    .reduce((teams, currentTeams) => {
      currentTeams.forEach(team => teams.set(team.abbreviation, team));
      return teams;
    }, new Map());
  return Array.from(teamMap.values());
}

function parseTeamSchedules(allGames) {
  return allGames
    .reduce((teamGames, currentGame) => {
      const teams = [currentGame.home, currentGame.away];
      teams.forEach(team => {
        const key = team.abbreviation.toLowerCase();
        if (teamGames.has(key)) {
          const games = teamGames.get(key);
          teamGames.set(key, games.concat(currentGame))
        } else {
          teamGames.set(key, [currentGame]);
        }
      })
      return teamGames;
    }, new Map());
}

module.exports = {parseTeams, parseTeamSchedules, tap};