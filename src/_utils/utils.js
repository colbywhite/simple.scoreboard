const { DateTime } = require("luxon");

function tap(func) {
  return (data) => {
    func(data);
    return data;
  }
}

function parseTeams(games) {
  const garbageAbbreviations = ['', 'f1', 'f2', 'qf1', 'qf2', 'qf3', 'qf4'];
  const teamMap = games
    .map(game => [game.home, game.away])
    .reduce((teams, currentTeams) => {
      currentTeams
          .filter((t) => !garbageAbbreviations.includes(t.abbreviation.toLowerCase()))
          .forEach(team => teams.set(team.abbreviation, team));
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

function isInFuture(game, numWeeksInFuture = undefined) {
    const startOfDay = DateTime.now().setZone('America/New_York').startOf('day');
    const gameTime = DateTime.fromISO(game.date.toISOString ? game.date.toISOString() : game.date);
    if (numWeeksInFuture !== undefined) {
        const endOfWeek = startOfDay.plus({ week: numWeeksInFuture }).endOf('day');
        return startOfDay <= gameTime && gameTime <= endOfWeek;
    } else {
        return startOfDay <= gameTime;
    }
}

module.exports = {parseTeams, parseTeamSchedules, isInFuture, tap};
