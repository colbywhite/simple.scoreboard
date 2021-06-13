import { loadNbaGames } from './nba';
import { loadMlsGames } from './mls';

const nba = loadNbaGames()
  .then(file => console.log('NBA games loaded to', file));
const mls = loadMlsGames()
  .then(file => console.log('MLS games loaded to', file));

Promise.all([nba, mls])
  .then(() => console.log('Data hydration complete'));
