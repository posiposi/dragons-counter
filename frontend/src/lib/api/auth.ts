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

  if (response.status === 409) {
    throw new Error("このメールアドレスは既に登録されています");
  }

  if (!response.ok) {
    throw new Error("ユーザー登録に失敗しました");
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

  if (response.status === 401) {
    throw new Error("メールアドレスまたはパスワードが正しくありません");
  }

  if (!response.ok) {
    throw new Error("ログインに失敗しました");
  }

  return await response.json() as SigninResponse;
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

  if (response.status === 401) {
    throw new Error("認証に失敗しました。再度ログインしてください");
  }

  if (!response.ok) {
    throw new Error("ユーザー情報の取得に失敗しました");
  }

  return await response.json() as User;
}
