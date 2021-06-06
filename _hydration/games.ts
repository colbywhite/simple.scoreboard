/**
 * This is a script to update the schedule data via the NBA's schedule JSON at
 * https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2020/league/00_full_schedule.json
 *
 * TODO: do this as part of the 11ty build; have to figure out how to add Typescript support
 */
import * as http from 'https';
import { RequestOptions } from 'https';
import * as fs from "fs";

type GameStatus = 'complete' | 'active' | 'future' | 'tbd';

interface Game {
  code: string;
  description: string;
  status: GameStatus;
  home: {
    abbreviation: string;
    city: string;
    nickname: string;
  };
  away: {
    abbreviation: string;
    city: string;
    nickname: string;
  };
  date: Date;
}

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
  // TODO only parse out the last 15 and the next 15
  const june = games.lscd[6].mscd.g;
  return june.map(game => ({
    code: game.gcode,
    description: game.seri,
    status: parseStatus(game),
    home: {
      abbreviation: game.h.ta,
      nickname: game.h.tn,
      city: game.h.tc
    },
    away: {
      abbreviation: game.v.ta,
      nickname: game.v.tn,
      city: game.v.tc
    },
    date: (game.stt === 'TBD') ? new Date(`${game.gdte}T19:00:00-0400`) : new Date(`${game.etm}-0400`)
  }));
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

function getGames(): Promise<Game[]> {
  return getNBASchedule().then(parseRawGames);
}

function writeGames(games: Game[]): void {
  const dataDir = '_data';
  try {
    fs.readdirSync(dataDir)
  } catch (e) {
    fs.mkdirSync(dataDir);
  }
  fs.writeFileSync('_data/games.json', JSON.stringify(games, null, 2));
}

getGames().then(writeGames);
