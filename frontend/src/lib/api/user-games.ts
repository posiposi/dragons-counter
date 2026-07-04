import { UserGame } from "@/types/user-game";
import { getCsrfToken } from "../csrf";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchUserGames(): Promise<UserGame[]> {
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  const response = await fetch(`${API_BASE_URL}/user-games`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      "レスポンス取得で予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  return response.json();
}

export async function registerUserGame(gameId: string): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  const csrfToken = getCsrfToken();
  const response = await fetch(`${API_BASE_URL}/user-games`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    credentials: "include",
    body: JSON.stringify({ gameId }),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("既に登録済みの試合です");
    }
    throw new Error("観戦記録の登録に失敗しました");
  }
}

export async function deleteUserGame(gameId: string): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  const csrfToken = getCsrfToken();
  const response = await fetch(`${API_BASE_URL}/user-games/${gameId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "観戦記録の削除に失敗しました");
  }
}
