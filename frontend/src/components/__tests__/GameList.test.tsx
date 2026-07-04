import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import GameList from "../GameList";
import { UserGame } from "@/types/user-game";

vi.mock("@/lib/api/user-games", () => ({
  fetchUserGames: vi.fn(),
  registerUserGame: vi.fn(),
  deleteUserGame: vi.fn(),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

import { fetchUserGames, deleteUserGame } from "@/lib/api/user-games";
import { useAuth } from "@/hooks/use-auth";

const fetchUserGamesMock = vi.mocked(fetchUserGames);
const deleteUserGameMock = vi.mocked(deleteUserGame);
const useAuthMock = vi.mocked(useAuth);

// id（中間レコードid）と gameId は別値を維持し、削除APIに渡す値の取り違えを検出する
const firstGame: UserGame = {
  id: "user-game-1",
  gameId: "game-abc",
  gameDate: "2024-04-01",
  opponent: "巨人",
  dragonsScore: 5,
  opponentScore: 3,
  result: "win",
  stadium: "バンテリンドーム",
  impression: null,
  createdAt: "2024-04-01T00:00:00.000Z",
};

const secondGame: UserGame = {
  id: "user-game-2",
  gameId: "game-xyz",
  gameDate: "2024-04-05",
  opponent: "阪神",
  dragonsScore: 1,
  opponentScore: 4,
  result: "lose",
  stadium: "甲子園",
  impression: null,
  createdAt: "2024-04-05T00:00:00.000Z",
};

function renderGameList() {
  return render(
    <MemoryRouter>
      <GameList />
    </MemoryRouter>,
  );
}

describe("GameList 削除UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: { role: "USER" },
      signout: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useAuth>);
  });

  it("削除ボタン押下で確認ダイアログが表示される", async () => {
    fetchUserGamesMock.mockResolvedValue([firstGame]);
    renderGameList();

    await waitFor(() =>
      expect(screen.getByText("vs 巨人")).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("button", { name: "削除" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("観戦記録を削除しますか？")).toBeInTheDocument();
  });

  it("ダイアログ確認でdeleteUserGameがgameIdで呼ばれ、再読込される", async () => {
    fetchUserGamesMock.mockResolvedValue([firstGame]);
    deleteUserGameMock.mockResolvedValue(undefined);
    renderGameList();

    await waitFor(() =>
      expect(screen.getByText("vs 巨人")).toBeInTheDocument(),
    );
    expect(fetchUserGamesMock).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: "削除" }));

    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "OK" }));

    await waitFor(() =>
      expect(deleteUserGameMock).toHaveBeenCalledWith("game-abc"),
    );
    await waitFor(() => expect(fetchUserGamesMock).toHaveBeenCalledTimes(2));
  });

  it("2番目の試合の削除ボタン押下でその試合のgameIdが削除APIに渡る", async () => {
    fetchUserGamesMock.mockResolvedValue([firstGame, secondGame]);
    deleteUserGameMock.mockResolvedValue(undefined);
    renderGameList();

    await waitFor(() =>
      expect(screen.getByText("vs 阪神")).toBeInTheDocument(),
    );

    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    await userEvent.click(deleteButtons[1]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/阪神/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "OK" }));

    await waitFor(() =>
      expect(deleteUserGameMock).toHaveBeenCalledWith("game-xyz"),
    );
  });

  it("キャンセル押下でdeleteUserGameは呼ばれずダイアログが閉じる", async () => {
    fetchUserGamesMock.mockResolvedValue([firstGame]);
    renderGameList();

    await waitFor(() =>
      expect(screen.getByText("vs 巨人")).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "キャンセル" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(deleteUserGameMock).not.toHaveBeenCalled();
  });

  it("削除成功後の再読込が失敗しても削除失敗エラーは表示されない", async () => {
    fetchUserGamesMock
      .mockResolvedValueOnce([firstGame])
      .mockRejectedValueOnce(new Error("再読込に失敗"));
    deleteUserGameMock.mockResolvedValue(undefined);
    renderGameList();

    await waitFor(() =>
      expect(screen.getByText("vs 巨人")).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "OK" }),
    );

    await waitFor(() => expect(deleteUserGameMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(fetchUserGamesMock).toHaveBeenCalledTimes(2));

    expect(
      screen.queryByText("観戦記録の削除に失敗しました"),
    ).not.toBeInTheDocument();
  });

  it("削除失敗時はダイアログ内にエラーを表示しリストを残して再試行できる", async () => {
    fetchUserGamesMock.mockResolvedValue([firstGame]);
    deleteUserGameMock
      .mockRejectedValueOnce(new Error("削除に失敗"))
      .mockResolvedValueOnce(undefined);
    renderGameList();

    await waitFor(() =>
      expect(screen.getByText("vs 巨人")).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "OK" }),
    );

    await waitFor(() =>
      expect(
        within(screen.getByRole("dialog")).getByText(
          "観戦記録の削除に失敗しました",
        ),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("vs 巨人")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "OK" }),
    );

    await waitFor(() => expect(deleteUserGameMock).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});
