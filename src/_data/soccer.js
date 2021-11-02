/**
 * This is a script to update the schedule data via the MLS's API at
 * https://sportapi.mlssoccer.com/api/matches?culture=en-us&dateFrom=2021-05-27&dateTo=2021-06-21
 *
 * TODO: do this as part of the 11ty build; have to figure out how to add Typescript support
 */
const Cache = require('@11ty/eleventy-cache-assets');
const utils = require('../_utils/utils');
const cheerio = require("cheerio");

const SPORT = 'soccer';
const MLS_ID = 98;
const WORLD_CUP_QUALIFIER = 339;
const MLS_URL = `https://sportapi.mlssoccer.com/api/matches?culture=en-us`
    + `&dateFrom=2021-06-01&dateTo=2021-12-31`
    + `&excludeSecondaryTeams=true&excludeVenue=true`;

function getCompetitionName(comp) {
  if (comp.optaId === MLS_ID) {
    return 'MLS';
  } else if (comp.optaId === WORLD_CUP_QUALIFIER) {
    return 'WC Qualifier'
  }
  return comp.shortName;
}

function getMLSSchedule() {
  return Cache(MLS_URL, {duration: '1d', type: 'json'});
}

/**
 * There are some teams whose abbreviation on powerrankingsguru.com don't match the ones on mlssoccer.com.
 * This resolves the differences.
 */
const ABBREVIATION_MAP = {
  nwe: 'ne',
  nwy: 'rbny',
  mnu: 'min',
  dcu: 'dc',
  lag: 'la',
  san: 'sj',
}

function getRankings() {
  const source = 'http://www.powerrankingsguru.com/soccer/mls/team-power-rankings.php';
  return Cache(source, { duration: '1d', type: 'text' })
      .then(cheerio.load)
      .then(parser => parser('table.gfc-rankings-table > tbody > tr > td:nth-child(2) > div.gfc-team-name > span.abbrv'))
      .then(spanNodes => spanNodes.toArray()
          .map(node => node.children[0].data.toLowerCase())
          .map(abbreviation => ABBREVIATION_MAP[abbreviation] || abbreviation)
      );
}

function parseRawGames(games, rankings) {
  return games.map(game => ({
    code: game.slug,
    description: '',
    competitionDescription: parseDescription(game),
    league: getCompetitionName(game.competition),
    status: (game.isTimeTbd) ? 'tbd' : 'future',
    home: {
      abbreviation: game.home.abbreviation,
      nickname: game.home.shortName, // TODO better model a team to avoid this
      city: game.home.shortName,
      logoClass: `${SPORT}-${game.home.abbreviation.toLowerCase()}`,
      rank: findTeamRank(game.home.abbreviation, rankings),
      sport: SPORT
    },
    away: {
      abbreviation: game.away.abbreviation,
      nickname: game.away.shortName, // TODO better model a team to avoid this
      city: game.away.shortName,
      logoClass: `${SPORT}-${game.away.abbreviation.toLowerCase()}`,
      rank: findTeamRank(game.away.abbreviation, rankings),
      sport: SPORT
    },
    date: new Date(game.matchDate)
  }));
}

function parseDescription(game) {
  return game.leagueMatchTitle || (game.competition.matchType === 'Regular') ? game.competition.name : game.competition.shortName
}

function findTeamRank(teamName, rankings) {
  const zeroIndexedRank = rankings.findIndex(name => teamName.toLowerCase() === name.toLowerCase());
  return zeroIndexedRank + 1;
}

const getGames = Promise.all([getMLSSchedule(), getRankings()])
    .then(([schedule, rankings]) => parseRawGames(schedule, rankings));
const getTeams = getGames.then(utils.parseTeams)
module.exports = Promise.all([getGames, getTeams])
  .then(([games, teams]) => {
    return {
      games: games,
      teams: teams,
      teamSchedules: utils.parseTeamSchedules(games)
    }
  });
