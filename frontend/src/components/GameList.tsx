import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserGame } from "@/types/user-game";
import {
  fetchUserGames,
  registerUserGame,
  deleteUserGame,
} from "@/lib/api/user-games";
import {
  formatGameDate,
  getResultText,
  getResultBadgeClass,
} from "@/lib/game-utils";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Settings, Plus, Trash2 } from "lucide-react";
import GameSelectModal from "./GameSelectModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import styles from "./GameList.module.css";

export default function GameList() {
  const navigate = useNavigate();
  const { user, signout } = useAuth();
  const [games, setGames] = useState<UserGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserGame | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUserGames();
  }, []);

  const loadUserGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const userGames = await fetchUserGames();
      setGames(userGames || []);
    } catch (err) {
      setError("試合データの取得に失敗しました");
      console.error("Failed to fetch user games:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (gameId: string) => {
    await registerUserGame(gameId);
    await loadUserGames();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await deleteUserGame(deleteTarget.gameId);
    } catch (err) {
      setDeleteError("観戦記録の削除に失敗しました");
      console.error("Failed to delete user game:", err);
      return;
    } finally {
      setIsDeleting(false);
    }
    setDeleteTarget(null);
    await loadUserGames();
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
    setDeleteError(null);
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
          <div className={styles.headerActions}>
            {user?.role === "ADMIN" && (
              <Link to="/admin/users" className={styles.adminLink}>
                <Settings size={18} />
                <span>管理画面</span>
              </Link>
            )}
            <button
              className={styles.signoutButton}
              onClick={() => {
                signout()
                  .then(() => navigate("/login"))
                  .catch((err: unknown) => {
                    console.error("Failed to sign out:", err);
                  });
              }}
            >
              <LogOut size={18} />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </header>

      {games.length > 0 ? (
        <>
          <div className={styles.addButtonWrapper}>
            <button
              className={styles.addButton}
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              観戦記録を追加
            </button>
          </div>

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
                    {formatGameDate(game.gameDate)}
                  </span>
                  <div className={styles.gameHeaderActions}>
                    <span
                      className={`${styles.resultBadge} ${getResultBadgeClass(game.result, styles)}`}
                    >
                      {getResultText(game.result)}
                    </span>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      aria-label="削除"
                      onClick={() => setDeleteTarget(game)}
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
          <button
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)}
          >
            観戦記録を追加
          </button>
        </div>
      )}

      <GameSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegister={handleRegister}
        registeredGameIds={games.map((game) => game.gameId)}
      />

      <DeleteConfirmDialog
        isOpen={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        opponent={deleteTarget?.opponent ?? ""}
        gameDate={deleteTarget?.gameDate ?? ""}
        errorMessage={deleteError}
        isProcessing={isDeleting}
      />
    </div>
  );
}
