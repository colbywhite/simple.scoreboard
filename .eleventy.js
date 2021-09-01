const {DateTime} = require('luxon');
const { parseTeams } = require('./src/_utils/utils');

module.exports = eleventyApi => {
  ['js', 'css', 'logos'].forEach(dir => {
    const srcDir = `src/_${dir}`;
    eleventyApi.addPassthroughCopy({[srcDir]: dir});
    eleventyApi.addWatchTarget(srcDir);
  });
  eleventyApi.addPassthroughCopy('src/favicon.ico');
  eleventyApi.addFilter('concat', (arr1, arr2) => arr1.concat(arr2));
  eleventyApi.addFilter('noAll', (sports) => sports.filter(sport => sport !== 'all'));
  eleventyApi.addFilter('toDate', dateString => new Date(dateString));
  eleventyApi.addFilter('iso', date => date.toISOString());
  eleventyApi.addFilter('json', obj => JSON.stringify(obj, null, 2));
  eleventyApi.addFilter('utcDate', date => {
    const formatOptions = {timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short'};
    return date.toLocaleString(undefined, formatOptions);
  });
  eleventyApi.addFilter('easternDate', date => {
    const formatOptions = {timeZone: 'America/New_York', weekday: 'short', day: 'numeric', month: 'short'};
    return date.toLocaleString(undefined, formatOptions);
  });
  eleventyApi.addFilter('utcTime', date => {
    const formatOptions = {timeZone: 'UTC', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'};
    return date.toLocaleString(undefined, formatOptions);
  });
  eleventyApi.addFilter('orderByDate', games => games.sort((a, b) => {
    const aDate = DateTime.fromISO(a.date.toISOString ? a.date.toISOString() : a.date);
    const bDate = DateTime.fromISO(b.date.toISOString ? b.date.toISOString() : b.date);
    return (aDate > bDate) ? 1 : (aDate < bDate) ? -1 : 0;
  }));
  eleventyApi.addFilter('groupByDay', games => {
    const groupedGames = {};
    games.forEach(game => {
      const gameDate = DateTime.fromISO(game.date.toISOString ? game.date.toISOString() : game.date)
        .setZone('America/New_York')
        .startOf('day')
        .toISO();
      if (groupedGames[gameDate]) {
        groupedGames[gameDate].push(game);
      } else {
        groupedGames[gameDate] = [game];
      }
    });
    return groupedGames;
  });
  eleventyApi.addFilter('parseTeams', parseTeams);
  return {dir: {input: 'src', layouts: '_layouts'}};
};
