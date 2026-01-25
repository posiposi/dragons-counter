import { Game } from "@/types/game";
import { ScrapedGame } from "./scrape";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchGames(): Promise<Game[]> {
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  const response = await fetch(`${API_BASE_URL}/games`);

  if (!response.ok) {
    throw new Error(
      "レスポンス取得で予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  return response.json();
}

export async function deleteGame(gameId: string): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    throw new Error("指定された試合記録が見つかりません");
  }
  if (response.status === 500) {
    throw new Error(
      "サーバーエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }
}

export interface BulkSaveGameInput {
  gameDate: string;
  opponent: string;
  dragonsScore: number;
  opponentScore: number;
  stadiumId: number;
}

export interface BulkSaveResult {
  savedCount: number;
  skippedCount: number;
  errors: string[];
}

export async function bulkSaveGames(
  games: ScrapedGame[]
): Promise<BulkSaveResult> {
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください"
    );
  }

  const gamesWithStadiumId: BulkSaveGameInput[] = games.map((game) => ({
    gameDate: game.gameDate,
    opponent: game.opponent,
    dragonsScore: game.dragonsScore,
    opponentScore: game.opponentScore,
    stadiumId: getStadiumId(game.stadium),
  }));

  const response = await fetch(`${API_BASE_URL}/games/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ games: gamesWithStadiumId }),
  });

  if (!response.ok) {
    throw new Error("試合結果の保存に失敗しました");
  }

  return response.json();
}

function getStadiumId(stadiumName: string): number {
  const stadiumMap: Record<string, number> = {
    バンテリンドーム: 1,
    "バンテリンドーム ナゴヤ": 1,
    東京ドーム: 2,
    横浜スタジアム: 3,
    甲子園球場: 4,
    阪神甲子園球場: 4,
    マツダスタジアム: 5,
    "MAZDA Zoom-Zoom スタジアム広島": 5,
    神宮球場: 6,
    明治神宮野球場: 6,
  };

  return stadiumMap[stadiumName] || 1;
}
