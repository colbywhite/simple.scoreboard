import { loadNbaGames } from './leagues/nba';
import { loadMlsGames } from './leagues/mls';
import { tap } from './utils';

const nba = loadNbaGames()
  .then(tap(data => console.log('NBA games loaded to', data)));
const mls = loadMlsGames()
  .then(tap(data => console.log('MLS games loaded to', data)));

Promise.all([nba, mls])
  .then(tap(_ => console.log('Data hydration complete')));
