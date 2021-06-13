/**
 * This is a script to update the schedule data via the MLS's API at
 * https://sportapi.mlssoccer.com/api/matches?culture=en-us&dateFrom=2021-05-27&dateTo=2021-06-21
 *
 * TODO: do this as part of the 11ty build; have to figure out how to add Typescript support
 */
import { RequestOptions } from 'https';
import * as http from 'https';
import { Game } from './model';
import { writeGamesJson } from './utils';

interface RawMLSGame {
  slug: string,
  leagueMatchTitle: string,
  home: {
    fullName: string,
    shortName: string,
    abbreviation: string
  },
  away: {
    fullName: string,
    shortName: string,
    abbreviation: string
  },
  matchDate: string,
  isTimeTbd: boolean
}

function getMLSSchedule(): Promise<RawMLSGame[]> {
  const options: RequestOptions = {
    method: 'GET',
    hostname: 'sportapi.mlssoccer.com',
    path: 'https://sportapi.mlssoccer.com/api/matches?culture=en-us&dateFrom=2021-05-27&dateTo=2021-06-21&excludeSecondaryTeams=true&excludeVenue=true',
    port: null
  };
  return new Promise((resolve, reject) => {
    const req = http.request(options, response => {
      const chunks: any[] = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())));
    });
    req.on('error', reject);
    req.end();
  })
}

function parseRawGames(games: RawMLSGame[]): Game[] {
  return games.map(game => ({
    code: game.slug,
    description: game.leagueMatchTitle,
    status: (game.isTimeTbd) ? 'tbd' : 'future',
    home: {
      abbreviation: game.home.abbreviation,
      nickname: game.home.fullName, // TODO better model a team to avoid this
      city: game.home.shortName
    },
    away: {
      abbreviation: game.away.abbreviation,
      nickname: game.away.fullName, // TODO better model a team to avoid this
      city: game.away.shortName
    },
    date: new Date(game.matchDate)
  }));
}

export function loadMlsGames(): Promise<any> {
  return getMLSSchedule()
    .then(parseRawGames)
    .then(writeGamesJson.bind(null, '_data/mls'));
}
