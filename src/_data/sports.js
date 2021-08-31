const fs = require('fs');
const path = require('path');

//TODO switch to a sport-based model as opposed to a league-based model since soccer has _multiple_ club competitions
// and international competitions that are equally important.
module.exports = () => {
  const dataFiles = fs.readdirSync(__dirname);
  const leagueNames = dataFiles
    .filter((filename) => filename.match(/\.js$/))
    .filter((filename) => filename !== path.basename(__filename))
    .map((filename) => path.basename(filename, '.js'));
  return ['all', ...leagueNames];
};
