import { Game } from './model';
import * as fs from 'fs';

export function writeGamesJson(dataDir: string, games: Game[]): Game[] {
  try {
    fs.readdirSync(dataDir)
  } catch (e) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const fileName = `${dataDir}/games.json`;
  fs.writeFileSync(fileName, JSON.stringify(games, null, 2));
  return games;
}

export function combineGameFiles(games: Game[][], outputDir: string) {
  const allGames: Game[] = games.reduce((allGames: Game[], games: Game[]) => allGames.concat(games), [] as Game[]);
  allGames.sort((a: Game, b: Game) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
  return writeGamesJson(outputDir, allGames);
}

export function tap<T>(func: (data: T) => void): (data: T) => T {
  return (data: T) => {
    func(data);
    return data;
  }
}
