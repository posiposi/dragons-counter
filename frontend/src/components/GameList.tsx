import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserGame } from "@/types/game";
import { fetchUserGames } from "@/lib/api/games";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Settings } from "lucide-react";
import styles from "./GameList.module.css";

export default function GameList() {
  const navigate = useNavigate();
  const { user, signout } = useAuth();
  const [games, setGames] = useState<UserGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const games = await fetchUserGames();
      setGames(games || []);
    } catch (err) {
      setError("試合データの取得に失敗しました");
      console.error("Failed to fetch games:", err);
    } finally {
      setLoading(false);
    }
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
      case "win":
        return styles.resultWin;
      case "lose":
        return styles.resultLose;
      case "draw":
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
                  </div>
                </div>
                <div className={styles.gameContent}>
                  <div className={styles.opponent}>vs {game.opponent}</div>
                  <div className={styles.score}>
                    {game.dragonsScore} - {game.opponentScore}
                  </div>
                  <div className={styles.stadium}>📍 {game.stadium}</div>
                </div>
                {game.impression && (
                  <div className={styles.notes}>{game.impression}</div>
                )}
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
    </div>
  );
}
