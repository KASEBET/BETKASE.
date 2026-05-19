export type Sport = 'futbol' | 'tenis' | 'nba' | 'all';
export type BetType = 'gratis' | 'premium';
export type BetResult = 'win' | 'loss' | 'void' | null;

export interface Team {
  name: string;
  logo: string;
  sport?: string;
  id?: string;
}

export interface Bet {
  id: string;
  match: string;
  prediction: string;
  odds: string;
  image: string;
  awayImage: string;
  type: BetType;
  sport: string;
  status: 'active' | 'completed';
  result: BetResult;
  createdAt: number;
  userId: string;
  userEmail: string;
  liveMatchId?: string;
  ligaSlug?: string;
}

export interface MatchStats {
  goalsLocal: number;
  goalsAway: number;
  yellowLocal: number;
  yellowAway: number;
  redLocal: number;
  redAway: number;
  cornersLocal: number;
  cornersAway: number;
  shotsLocal: number;
  shotsAway: number;
  shotsOnTargetLocal: number;
  shotsOnTargetAway: number;
  updatedAt: number;
}
