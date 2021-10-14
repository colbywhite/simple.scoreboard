const Cache = require('@11ty/eleventy-cache-assets');
const utils = require('../_utils/utils');
const { DateTime } = require('luxon');

const SPORT = 'basketball';
const NBA_URL = 'https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2021/league/00_full_schedule.json';
/**
 * Since the feed doesn't distinguish preseason games,
 * all games before this date are considered preseason and thus ignored.
 */
const REGULAR_SEASON_START_DATE = DateTime.fromISO('2021-10-19T00:00:00-0400');

function getNBASchedule() {
  return Cache(NBA_URL, {duration: '1d', type: 'json'});
}

function isRegularSeason(game) {
    const gameDate = DateTime.fromISO(game.date.toISOString());
    return gameDate > REGULAR_SEASON_START_DATE;
}

function parseRawGames(games) {
  return games.lscd.reduce((games, currentMonth) => {
    const parsedMonth = currentMonth.mscd.g
      .map(game => ({
        code: game.gcode,
        description: game.seri,
        competitionDescription: 'NBA',
        league: 'NBA',
        status: parseStatus(game),
        home: {
          abbreviation: game.h.ta,
          nickname: game.h.tn,
          city: game.h.tc,
          logoClass: `${SPORT}-${game.h.ta.toLowerCase()}`,
          sport: SPORT
        },
        away: {
          abbreviation: game.v.ta,
          nickname: game.v.tn,
          city: game.v.tc,
          logoClass: `${SPORT}-${game.v.ta.toLowerCase()}`,
          sport: SPORT
        },
        date: (game.stt === 'TBD') ? new Date(`${game.gdte}T19:00:00-0400`) : new Date(`${game.etm}-0400`)
      }))
        .filter(isRegularSeason);
    return games.concat(parsedMonth);
  }, []);
}

function parseStatus(game) {
  if (game.stt === 'TBD') {
    return 'tbd';
  } else if (game.stt === 'Final') {
    return 'complete';
  } else if (game.stt.match(/\d{1,2}:\d\d [ap]m \w\w/)) {
    return 'future';
  } else {
    // TODO: it's not clear how the feed denotes active
    return 'active';
  }
}

const getGames = getNBASchedule().then(parseRawGames);
const getTeams = getGames.then(utils.parseTeams)
module.exports = Promise.all([getGames, getTeams])
  .then(([games, teams]) => {
    const teamSchedules = utils.parseTeamSchedules(games);
    return {
      games: games,
      teams: teams,
      teamSchedules: teamSchedules
    }
  });
