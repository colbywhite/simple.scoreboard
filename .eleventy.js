const {DateTime} = require('luxon');
const fs = require('fs');

module.exports = eleventyApi => {
  ['js', 'css', 'logos'].forEach(dir => {
    const srcDir = `src/_${dir}`;
    eleventyApi.addPassthroughCopy({[srcDir]: dir});
    eleventyApi.addWatchTarget(srcDir);
  });
  eleventyApi.addPassthroughCopy('src/favicon.ico');
  eleventyApi.addCollection('mlsLogos', () => {
    const regex = /(.*)\.png/;
    return fs.readdirSync('src/_logos/mls').map(logo => ({path: `logos/mls/${logo}`, name: logo.match(regex)[1]}));
  });
  eleventyApi.addCollection('nbaLogos', () => {
    const regex = /(.*)\.png/;
    return fs.readdirSync('src/_logos/nba').map(logo => ({path: `logos/nba/${logo}`, name: logo.match(regex)[1]}));
  });
  eleventyApi.addCollection('logos', () => {
    const mls = eleventyApi.getCollections()['mlsLogos'];
    const nba = eleventyApi.getCollections()['nbaLogos'];
    return [...mls(), ...nba()];
  });
  eleventyApi.addFilter('toDate', dateString => new Date(dateString));
  eleventyApi.addFilter('iso', date => date.toISOString());
  eleventyApi.addFilter('json', obj => JSON.stringify(obj));
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
  eleventyApi.addFilter('nextWeek', games => {
    const startOfDay = DateTime.now().setZone('America/New_York').startOf('day');
    const endOfWeek = startOfDay.plus({week: 1}).endOf('day');
    return games.filter(game => {
      const dateTime = DateTime.fromISO(game.date);
      return startOfDay <= dateTime && dateTime <= endOfWeek;
    });
  });
  eleventyApi.addFilter('groupByDay', games => {
    const groupedGames = {};
    games.forEach(game => {
      const gameDate = DateTime.fromISO(game.date).setZone('America/New_York').startOf('day').toISO();
      if (groupedGames[gameDate]) {
        groupedGames[gameDate].push(game);
      } else {
        groupedGames[gameDate] = [game];
      }
    });
    return groupedGames;
  });

  return {dir: {input: 'src', layouts: '_layouts'}};
};
