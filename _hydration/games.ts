import { loadNbaGames } from './leagues/nba';
import { loadMlsGames } from './leagues/mls';
import { combineGameFiles, tap } from './utils';
import { Game } from './model';

const nba = loadNbaGames()
  .then(tap(_ => console.log('NBA games loaded')));
const mls = loadMlsGames()
  .then(tap(_ => console.log('MLS games loaded')));

Promise.all([nba, mls])
  .then((games: [Game[], Game[]]) => combineGameFiles(games, 'src/_data'))
  .then(tap(_ => console.log('All games loaded')))
  .then(tap(_ => console.log('Data hydration complete')));
