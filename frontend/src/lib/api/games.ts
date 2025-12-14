import { Game } from "@/types/game";

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
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
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
