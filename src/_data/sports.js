const fs = require('fs');
const path = require('path');

module.exports = () => {
  const dataFiles = fs.readdirSync(__dirname);
  const sportNames = dataFiles
    .filter((filename) => filename.match(/\.js$/))
    .filter((filename) => filename !== path.basename(__filename))
    .filter((filename) => filename !== 'teams.js')
    .map((filename) => path.basename(filename, '.js'));
  return ['all', ...sportNames];
};
