export type GameStatus = 'complete' | 'active' | 'future' | 'tbd';

export interface Team {
  abbreviation: string;
  city: string;
  nickname: string;
  logoClass: string;
}

export interface Game {
  code: string;
  description: string;
  status: GameStatus;
  home: Team;
  away: Team;
  date: Date;
  competitionDescription: string;
  league: 'NBA' | 'MLS';
}
