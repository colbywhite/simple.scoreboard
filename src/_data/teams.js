const sports = require('./sports')();
const sportPromises = sports
    .filter(sport => sport !== 'all')
    .map(sport => require(`./${sport}`));
module.exports = Promise.all(sportPromises)
    .then(([mls, nba]) => [...mls.teams, ...nba.teams]);
