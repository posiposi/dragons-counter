import { User, AuthRequest, SigninResponse } from "@/types/user";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function signup(request: AuthRequest): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "ユーザー登録に失敗しました");
  }
}

export async function signin(request: AuthRequest): Promise<SigninResponse> {
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "ログインに失敗しました");
  }

  return (await response.json()) as SigninResponse;
}

export function signout(): void {
  localStorage.removeItem("accessToken");
}

export async function fetchCurrentUser(accessToken: string): Promise<User> {
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "ユーザー情報の取得に失敗しました");
  }

  return (await response.json()) as User;
}
