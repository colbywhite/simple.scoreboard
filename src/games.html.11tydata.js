module.exports = {
  eleventyComputed: {
    games: data => {
      const leagueData = data[data.sport];
      if (leagueData) {
        return leagueData.games;
      } else if (data.sport === 'all') {
        return data.sports
          .filter(sport => sport !== 'all')
          .map(sport => data[sport])
          .map(sportData => sportData.games)
          .reduce((result, games) => result.concat(games), []);
      } else {
        return [];
      }
    }
  }
}
