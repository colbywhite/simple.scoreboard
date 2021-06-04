module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('index.css');
  eleventyConfig.addPassthroughCopy('/logos');
};
