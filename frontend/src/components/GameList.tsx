import { useState, useEffect } from "react";
import { Game } from "@/types/game";
import { fetchGames, deleteGame } from "@/lib/api/games";
import { Trash2, LogOut } from "lucide-react";
import GameScrapePanel from "./GameScrapePanel";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import DeleteResultDialog from "./DeleteResultDialog";
import styles from "./GameList.module.css";

interface GameListProps {
  onSignout: () => Promise<void>;
}

export default function GameList({ onSignout }: GameListProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTargetGame, setDeleteTargetGame] = useState<Game | null>(null);
  const [deleteResult, setDeleteResult] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: "" });

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const games = await fetchGames();
      setGames(games || []);
    } catch (err) {
      setError("試合データの取得に失敗しました");
      console.error("Failed to fetch games:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (game: Game) => {
    setDeleteTargetGame(game);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetGame) return;

    try {
      await deleteGame(deleteTargetGame.id);

      setGames((prevGames) =>
        prevGames.filter((game) => game.id !== deleteTargetGame.id),
      );

      setDeleteResult({
        show: true,
        success: true,
        message: "試合記録を削除しました",
      });

      setDeleteTargetGame(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "削除中に予期しないエラーが発生しました";

      setDeleteResult({
        show: true,
        success: false,
        message: errorMessage,
      });

      setDeleteTargetGame(null);

      await loadGames();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTargetGame(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const getResultBadgeClass = (result: string) => {
    switch (result) {
      case "WIN":
        return styles.resultWin;
      case "LOSE":
        return styles.resultLose;
      case "DRAW":
        return styles.resultDraw;
      default:
        return "";
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case "win":
        return "勝利";
      case "lose":
        return "敗北";
      case "draw":
        return "引き分け";
      default:
        return result;
    }
  };

  const calculateStats = () => {
    const wins = games.filter((g) => g.result === "win").length;
    const losses = games.filter((g) => g.result === "lose").length;
    const draws = games.filter((g) => g.result === "draw").length;
    const winRate =
      games.length > 0 ? ((wins / games.length) * 100).toFixed(1) : "0.0";

    return { wins, losses, draws, total: games.length, winRate };
  };

  if (loading) {
    return <div className={styles.loading}>試合データを読み込み中...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Dra Vincit</h1>
            <p className={styles.subtitle}>中日ドラゴンズ観戦記録</p>
          </div>
          <button className={styles.signoutButton} onClick={onSignout}>
            <LogOut size={18} />
            <span>ログアウト</span>
          </button>
        </div>
      </header>

      <GameScrapePanel onGameSaved={loadGames} />

      {games.length > 0 ? (
        <>
          <div className={styles.statsCard}>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.total}</div>
                <div className={styles.statLabel}>観戦試合</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.wins}</div>
                <div className={styles.statLabel}>勝利</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.losses}</div>
                <div className={styles.statLabel}>敗北</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.draws}</div>
                <div className={styles.statLabel}>引き分け</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.winRate}%</div>
                <div className={styles.statLabel}>勝率</div>
              </div>
            </div>
          </div>

          <div className={styles.gameGrid}>
            {games.map((game) => (
              <div key={game.id} className={styles.gameCard}>
                <div className={styles.gameHeader}>
                  <span className={styles.gameDate}>
                    {formatDate(game.gameDate)}
                  </span>
                  <div className={styles.gameHeaderActions}>
                    <span
                      className={`${styles.resultBadge} ${getResultBadgeClass(game.result)}`}
                    >
                      {getResultText(game.result)}
                    </span>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteClick(game)}
                      aria-label="delete_game"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className={styles.gameContent}>
                  <div className={styles.opponent}>vs {game.opponent}</div>
                  <div className={styles.score}>
                    {game.dragonsScore} - {game.opponentScore}
                  </div>
                  <div className={styles.stadium}>📍 {game.stadium}</div>
                </div>
                {game.notes && <div className={styles.notes}>{game.notes}</div>}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyStateTitle}>まだ観戦記録がありません</h2>
          <p className={styles.emptyStateText}>
            最初の観戦記録を追加して、思い出を記録しましょう
          </p>
          <button className={styles.addButton}>観戦記録を追加</button>
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={!!deleteTargetGame}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        opponent={deleteTargetGame?.opponent || ""}
        gameDate={deleteTargetGame?.gameDate || ""}
      />

      <DeleteResultDialog
        isOpen={deleteResult.show}
        isSuccess={deleteResult.success}
        message={deleteResult.message}
        onClose={() => setDeleteResult({ ...deleteResult, show: false })}
      />
    </div>
  );
}
