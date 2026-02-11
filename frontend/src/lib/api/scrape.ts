const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

export interface ScrapedGame {
  gameDate: string;
  opponent: string;
  dragonsScore: number;
  opponentScore: number;
  stadium: string;
}

export interface ScrapeSuccessResponse {
  game: ScrapedGame;
}

export interface ScrapeNoGameResponse {
  game: null;
  message: string;
}

export interface ScrapeErrorResponse {
  error: string;
  details?: string;
}

export type ScrapeResult =
  | ScrapeSuccessResponse
  | ScrapeNoGameResponse
  | ScrapeErrorResponse;

export function isScrapeError(
  result: ScrapeResult,
): result is ScrapeErrorResponse {
  return "error" in result;
}

export function hasGame(result: ScrapeResult): result is ScrapeSuccessResponse {
  return "game" in result && result.game !== null;
}

export async function scrapeGameResult(date: string): Promise<ScrapeResult> {
  if (!API_GATEWAY_URL) {
    throw new Error(
      "API Gateway URLが設定されていません。環境変数を確認してください",
    );
  }

  const response = await fetch(`${API_GATEWAY_URL}/scrape?date=${date}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("試合結果の取得に失敗しました");
  }

  return response.json();
}
