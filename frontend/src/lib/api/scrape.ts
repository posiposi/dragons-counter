import { getCsrfToken } from "../csrf";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  const csrfToken = getCsrfToken();
  const response = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    credentials: "include",
    body: JSON.stringify({ date }),
  });

  if (!response.ok) {
    throw new Error("試合結果の取得に失敗しました");
  }

  return response.json();
}
