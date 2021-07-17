const fs = require('fs');
const path = require('path');

module.exports = () => {
  const dataFiles = fs.readdirSync(__dirname);
  const leagueNames = dataFiles
    .filter((filename) => filename.match(/\.js$/))
    .filter((filename) => filename !== path.basename(__filename))
    .map((filename) => path.basename(filename, '.js'));
  return ['all', ...leagueNames];
};
