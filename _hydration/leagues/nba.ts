/**
 * This is a script to update the schedule data via the NBA's schedule JSON at
 * https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2020/league/00_full_schedule.json
 *
 * TODO: do this as part of the 11ty build; have to figure out how to add Typescript support
 */
import * as http from 'https';
import { RequestOptions } from 'https';
import { Game, GameStatus, Team } from '../model';
import { parseTeams, parseTeamSchedules, writeJson } from '../utils';

interface RawNBAGame {
  gcode: string;
  seri: string;
  stt: string;
  v: {
    ta: string;
    tn: string;
    tc: string;
  }
  h: {
    ta: string;
    tn: string;
    tc: string;
  }
  gdutc: string;
  gdte: string;
  utctm: string;
  etm: string;
}

interface RawNBASchedule {
  lscd: Array<{
    mscd: {
      g: RawNBAGame[]
    }
  }>
}

function getNBASchedule(): Promise<RawNBASchedule> {
  const options: RequestOptions = {
    method: 'GET',
    hostname: 'data.nba.com',
    path: '/data/10s/v2015/json/mobile_teams/nba/2020/league/00_full_schedule.json',
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

function parseRawGames(games: RawNBASchedule): Game[] {
  return games.lscd.reduce((games: Game[], currentMonth) => {
    const parsedMonth: Game[] = currentMonth.mscd.g
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
          logoClass: `nba-${game.h.ta.toLowerCase()}`
        },
        away: {
          abbreviation: game.v.ta,
          nickname: game.v.tn,
          city: game.v.tc,
          logoClass: `nba-${game.v.ta.toLowerCase()}`
        },
        date: (game.stt === 'TBD') ? new Date(`${game.gdte}T19:00:00-0400`) : new Date(`${game.etm}-0400`)
      }));
    return games.concat(parsedMonth);
  }, [] as Game[]);
}

function parseStatus(game: RawNBAGame): GameStatus {
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

export function loadNbaGames(): Promise<Game[]> {
  const parsedGames: Promise<Game[]> = getNBASchedule()
    .then(parseRawGames);

  const games: Promise<Game[]> = parsedGames
    .then(writeJson.bind(null, 'src/_data/nba', 'games.json') as (g: Game[]) => Game[]);
  const teams: Promise<Team[]> = parsedGames
    .then(parseTeams)
    .then(writeJson.bind(null, 'src/_data/nba', 'teams.json') as (t: Team[]) => Team[]);
  return Promise.all([games, teams])
    .then(([games, teams]) => {
      const teamSchedules: Map<string, Game[]> = parseTeamSchedules(games, teams);
      teams.forEach(team => {
        const key = team.abbreviation.toLowerCase();
        const schedule = teamSchedules.get(key);
        if (schedule) {
          writeJson('src/_data/nba', `${key}.json`, schedule);
        }
      });
      return games;
    });
}
