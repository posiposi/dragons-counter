export interface ScrapedGameData {
  gameDate: string;
  opponent: string;
  dragonsScore: number;
  opponentScore: number;
  stadium: string;
}

export interface ScrapeSuccessResult {
  game: ScrapedGameData;
}

export interface ScrapeNoGameResult {
  game: null;
  message: string;
}

export interface ScrapeErrorResult {
  error: string;
  details?: string;
}

export type ScrapeResult =
  | ScrapeSuccessResult
  | ScrapeNoGameResult
  | ScrapeErrorResult;

export interface ScrapingPort {
  scrapeGameResult(date: string): Promise<ScrapeResult>;
}
