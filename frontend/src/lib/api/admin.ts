import { AdminUser } from "@/types/admin";
import { getCsrfToken } from "../csrf";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "ユーザー一覧の取得に失敗しました");
  }

  return response.json();
}

export async function fetchAdminUser(id: string): Promise<AdminUser> {
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "ユーザー情報の取得に失敗しました");
  }

  return response.json();
}

export async function approveUser(id: string): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  const csrfToken = getCsrfToken();
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}/approve`, {
    method: "PATCH",
    credentials: "include",
    ...(csrfToken ? { headers: { "X-CSRF-Token": csrfToken } } : {}),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "ユーザーの承認に失敗しました");
  }
}

export async function rejectUser(id: string): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
  }

  const csrfToken = getCsrfToken();
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}/reject`, {
    method: "PATCH",
    credentials: "include",
    ...(csrfToken ? { headers: { "X-CSRF-Token": csrfToken } } : {}),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "ユーザーの拒否に失敗しました");
  }
}
