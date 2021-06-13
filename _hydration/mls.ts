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
  slug: string;
  leagueMatchTitle: string;
  home: {
    fullName: string;
    shortName: string;
    abbreviation: string;
    logoColorUrl: string;
  };
  away: {
    fullName: string;
    shortName: string;
    abbreviation: string;
    logoColorUrl: string;
  };
  matchDate: string;
  competition: {
    name: string;
  };
  isTimeTbd: boolean;
}

function getMLSSchedule(): Promise<RawMLSGame[]> {
  // TODO get the non league games too
  const options: RequestOptions = {
    method: 'GET',
    hostname: 'sportapi.mlssoccer.com',
    path: '/api/matches?culture=en-us&dateFrom=2021-06-01&dateTo=2021-12-31&competition=98&matchType=Regular&matchType=Cup&excludeSecondaryTeams=true&excludeVenue=true',
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
    description: game.competition.name,
    status: (game.isTimeTbd) ? 'tbd' : 'future',
    home: {
      abbreviation: game.home.abbreviation,
      nickname: game.home.shortName, // TODO better model a team to avoid this
      city: game.home.shortName
    },
    away: {
      abbreviation: game.away.abbreviation,
      nickname: game.away.shortName, // TODO better model a team to avoid this
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
