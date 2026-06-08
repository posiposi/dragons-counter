import { getCsrfToken } from "@/lib/csrf";

vi.mock("@/lib/csrf", () => ({
  getCsrfToken: vi.fn(),
}));

const getCsrfTokenMock = vi.mocked(getCsrfToken);

async function importDeleteUserGame() {
  const module = await import("@/lib/api/user-games");
  return module.deleteUserGame;
}

describe("deleteUserGame", () => {
  const gameId = "game-123";

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "http://localhost:3000");
    getCsrfTokenMock.mockReturnValue("csrf-token-value");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("正しいURL・メソッド・認証情報・CSRFヘッダでfetchを呼び出す", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));
    const deleteUserGame = await importDeleteUserGame();

    await deleteUserGame(gameId);

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:3000/user-games/game-123",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": "csrf-token-value",
        },
        credentials: "include",
      },
    );
  });

  it("CSRFトークンが取得できない場合はX-CSRF-Tokenヘッダを付与しない", async () => {
    getCsrfTokenMock.mockReturnValue(null);
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));
    const deleteUserGame = await importDeleteUserGame();

    await deleteUserGame(gameId);

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:3000/user-games/game-123",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
  });

  it("レスポンスが失敗のときはbodyのmessageをメッセージにErrorをthrowする", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "削除できませんでした" }), {
        status: 400,
      }),
    );
    const deleteUserGame = await importDeleteUserGame();

    await expect(deleteUserGame(gameId)).rejects.toThrow(
      "削除できませんでした",
    );
  });

  it("レスポンスが失敗でbodyが無いときは既定のメッセージでErrorをthrowする", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );
    const deleteUserGame = await importDeleteUserGame();

    await expect(deleteUserGame(gameId)).rejects.toThrow(
      "観戦記録の削除に失敗しました",
    );
  });

  it("API_BASE_URLが未設定のときはErrorをthrowする", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "");
    const fetchSpy = vi.spyOn(global, "fetch");
    const deleteUserGame = await importDeleteUserGame();

    await expect(deleteUserGame(gameId)).rejects.toThrow(
      "予期しないエラーが発生しました。しばらく経ってから再度お試しください",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
