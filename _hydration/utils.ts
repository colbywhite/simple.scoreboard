import { Game } from './model';
import * as fs from 'fs';

export function writeGamesJson(dataDir: string, games: Game[]): string {
  try {
    fs.readdirSync(dataDir)
  } catch (e) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const fileName = `${dataDir}/games.json`;
  fs.writeFileSync(fileName, JSON.stringify(games, null, 2));
  return fileName;
}
