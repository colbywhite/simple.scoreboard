export type GameStatus = 'complete' | 'active' | 'future' | 'tbd';

export interface Game {
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
