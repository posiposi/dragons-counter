import { useState, useEffect, useCallback } from "react";
import { Game } from "@/types/game";
import { fetchGames } from "@/lib/api/games";
import { X, MapPin } from "lucide-react";
import styles from "./GameSelectModal.module.css";

interface GameSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (gameId: string) => Promise<void>;
  registeredGameIds: string[];
}

export default function GameSelectModal({
  isOpen,
  onClose,
  onRegister,
  registeredGameIds,
}: GameSelectModalProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allGames = await fetchGames();
      setGames(allGames || []);
    } catch {
      setError("試合データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadGames();
    }
  }, [isOpen, loadGames]);

  const handleRegister = async (gameId: string) => {
    try {
      setRegisteringId(gameId);
      setError(null);
      await onRegister(gameId);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "登録に失敗しました";
      setError(message);
    } finally {
      setRegisteringId(null);
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

  const getResultText = (result: string) => {
    switch (result) {
      case "win":
        return "勝利";
      case "lose":
        return "敗北";
      case "draw":
        return "引分";
      default:
        return result;
    }
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

  if (!isOpen) return null;

  const unregisteredGames = games.filter(
    (game) => !registeredGameIds.includes(game.id),
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>観戦試合を登録</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="close_modal"
          >
            <X size={20} />
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>試合データを読み込み中...</div>
        ) : unregisteredGames.length === 0 ? (
          <div className={styles.empty}>登録可能な試合がありません</div>
        ) : (
          <div className={styles.gameList}>
            {unregisteredGames.map((game) => (
              <div key={game.id} className={styles.gameItem}>
                <div className={styles.gameInfo}>
                  <span className={styles.gameDate}>
                    {formatDate(game.gameDate)}
                  </span>
                  <span className={styles.gameOpponent}>
                    vs {game.opponent}
                  </span>
                  <div className={styles.gameDetails}>
                    <span className={styles.gameScore}>
                      {game.dragonsScore} - {game.opponentScore}
                    </span>
                    <span
                      className={`${styles.resultBadge} ${getResultBadgeClass(game.result)}`}
                    >
                      {getResultText(game.result)}
                    </span>
                    <span>
                      <MapPin size={14} /> {game.stadium}
                    </span>
                  </div>
                </div>
                <button
                  className={styles.registerButton}
                  onClick={() => handleRegister(game.id)}
                  disabled={registeringId !== null}
                >
                  {registeringId === game.id ? "登録中..." : "登録"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
