const fs = require('fs');
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('logos');
  eleventyConfig.addCollection('logos', _api => {
    const regex = /(.*)\.png/;
    return fs.readdirSync('logos').map(logo => ({path: `logos/${logo}`, name: logo.match(regex)[1]}));
  });
  eleventyConfig.addFilter('humanDate', dateString => {
    const date = new Date(dateString);
    const today = new Date();
    // TODO: detect Tomorrow
    if (date.getDay() === today.getDay()
      && date.getDate() === today.getDate()
      && date.getFullYear() === today.getFullYear()
    ) {
      return 'Today' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    } else {
      return new Intl.DateTimeFormat([], {weekday: 'short', day: 'numeric', month: 'short'}).format(date);
    }
  });
  eleventyConfig.addFilter('humanTime', dateString => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat([], {hour: 'numeric', minute: 'numeric', timeZoneName: 'short'}).format(date);
  });
};
