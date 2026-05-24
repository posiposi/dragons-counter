import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import GameScrapePanel from "@/components/GameScrapePanel";
import GameResultBadge from "@/components/GameResultBadge";
import { fetchGames } from "@/lib/api/games";
import { formatGameDate, formatCreatedAt } from "@/lib/format";
import { getPageNumbers } from "@/lib/pagination";
import { usePagination } from "@/hooks/usePagination";
import type { Game } from "@/types/game";
import styles from "./AdminGamesPage.module.css";

const ITEMS_PER_PAGE = 6;

export default function AdminGamesPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGames();
      setGames(data);
    } catch {
      setError("試合データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const sortedGames = useMemo(
    () =>
      [...games].sort(
        (a, b) =>
          new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime(),
      ),
    [games],
  );

  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems,
    goToPage,
    goToNextPage,
    goToPrevPage,
    isFirstPage,
    isLastPage,
  } = usePagination(sortedGames, ITEMS_PER_PAGE);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>試合データ管理</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.navLink}
              onClick={() => navigate("/admin/users")}
            >
              <Users size={18} />
              <span>ユーザー管理</span>
            </button>
            <button className={styles.backLink} onClick={() => navigate("/")}>
              <ArrowLeft size={18} />
              <span>ホームへ戻る</span>
            </button>
          </div>
        </div>
      </header>

      <GameScrapePanel onGameSaved={loadGames} />

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>試合データを読み込み中...</div>
      ) : (
        <>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>試合一覧</h2>
            <span className={styles.totalCount}>全 {totalItems} 件</span>
          </div>

          {sortedGames.length === 0 ? (
            <div className={styles.emptyState}>
              登録されている試合データはありません
            </div>
          ) : (
            <>
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>日付</th>
                      <th>対戦相手</th>
                      <th>スコア</th>
                      <th>結果</th>
                      <th>球場</th>
                      <th>登録日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((game) => (
                      <tr key={game.id}>
                        <td data-label="日付">
                          {formatGameDate(game.gameDate)}
                        </td>
                        <td data-label="対戦相手">{game.opponent}</td>
                        <td data-label="スコア">
                          {game.dragonsScore} - {game.opponentScore}
                        </td>
                        <td data-label="結果">
                          <GameResultBadge result={game.result} />
                        </td>
                        <td data-label="球場">{game.stadium}</td>
                        <td data-label="登録日">
                          {formatCreatedAt(game.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageButton}
                    onClick={goToPrevPage}
                    disabled={isFirstPage}
                  >
                    前へ
                  </button>
                  {getPageNumbers(currentPage, totalPages).map((page, index) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className={styles.ellipsis}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        className={`${styles.pageButton} ${currentPage === page ? styles.pageButtonActive : ""}`}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    className={styles.pageButton}
                    onClick={goToNextPage}
                    disabled={isLastPage}
                  >
                    次へ
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
