const {DateTime} = require('luxon');
const fs = require('fs');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('logos');
  eleventyConfig.addPassthroughCopy('js');
  eleventyConfig.addCollection('logos', _api => {
    const regex = /(.*)\.png/;
    return fs.readdirSync('logos').map(logo => ({path: `logos/${logo}`, name: logo.match(regex)[1]}));
  });
  eleventyConfig.addFilter('toDate', dateString => new Date(dateString));
  eleventyConfig.addFilter('iso', date => date.toISOString());
  eleventyConfig.addFilter('utcDate', date => {
    const formatOptions = {timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short'};
    return date.toLocaleString(undefined, formatOptions);
  });
  eleventyConfig.addFilter('utcTime', date => {
    const formatOptions = {timeZone: 'UTC', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'};
    return date.toLocaleString(undefined, formatOptions);
  });
  eleventyConfig.addFilter('next15', games => {
    const startOfDay = DateTime.now().setZone('America/New_York').startOf('day');
    return games.filter(game => startOfDay <= DateTime.fromISO(game.date));
  });
};
