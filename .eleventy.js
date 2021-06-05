const fs = require('fs');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('logos');
  eleventyConfig.addCollection('logos', _api => {
    const regex = /(.*)\.png/;
    return fs.readdirSync('logos').map(logo => ({path: `logos/${logo}`, name: logo.match(regex)[1]}));
  });
};
