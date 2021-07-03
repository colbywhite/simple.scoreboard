import { Game, Team } from './model';
import * as fs from 'fs';

export function writeJson<T>(dataDir: string, filename: string, data: T): T {
  try {
    fs.readdirSync(dataDir)
  } catch (e) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const fileName = `${dataDir}/${filename}`;
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  return data;
}

export function combineGameFiles(games: Game[][], outputDir: string) {
  const allGames: Game[] = games.reduce((allGames: Game[], games: Game[]) => allGames.concat(games), [] as Game[]);
  allGames.sort((a: Game, b: Game) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
  return writeJson(outputDir, 'games.json', allGames);
}

export function tap<T>(func: (data: T) => void): (data: T) => T {
  return (data: T) => {
    func(data);
    return data;
  }
}

export function parseTeams(games: Game[]): Team[] {
  const teamMap: Map<string, Team> = games
    .map(game => [game.home, game.away])
    .reduce((teams: Map<string, Team>, currentTeams: Team[]) => {
      currentTeams.forEach(team => teams.set(team.abbreviation, team));
      return teams;
    }, new Map<string, Team>());
  return Array.from(teamMap.values());
}

export function parseTeamSchedules(allGames: Game[], teams: Team[]): Map<string, Game[]> {
  return allGames
    .reduce((teamGames: Map<string, Game[]>, currentGame: Game) => {
      const teams = [currentGame.home, currentGame.away];
      teams.forEach(team => {
        const key = team.abbreviation.toLowerCase();
        if (teamGames.has(key)) {
          const games = teamGames.get(key) as Game[];
          teamGames.set(key, games.concat(currentGame))
        } else {
          teamGames.set(key, [currentGame]);
        }
      })
      return teamGames;
    }, new Map<string, Game[]>());
}
