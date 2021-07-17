module.exports = {
  eleventyComputed: {
    games: data => {
      const leagueData = data[data.league];
      if (leagueData) {
        return leagueData.games;
      } else if (data.league === 'all') {
        return data.leagues
          .filter(league => league !== 'all')
          .map(league => data[league])
          .map(leagueData => leagueData.games)
          .reduce((result, games) => result.concat(games), []);
      } else {
        return [];
      }
    }
  }
}
