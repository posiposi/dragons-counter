import { useState } from "react";
import {
  Calendar,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  scrapeGameResult,
  hasGame,
  isScrapeError,
  ScrapedGame,
} from "@/lib/api/scrape";
import { bulkSaveGames } from "@/lib/api/games";
import styles from "./GameScrapePanel.module.css";

interface GameScrapePanelProps {
  onGameSaved: () => void;
}

type Status = "idle" | "scraping" | "saving" | "success" | "error" | "noGame";

export default function GameScrapePanel({ onGameSaved }: GameScrapePanelProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [scrapedGame, setScrapedGame] = useState<ScrapedGame | null>(null);

  const handleScrape = async () => {
    if (!selectedDate) {
      setMessage("観戦日を選択してください");
      setStatus("error");
      return;
    }

    try {
      setStatus("scraping");
      setMessage("");
      setScrapedGame(null);

      const result = await scrapeGameResult(selectedDate);

      if (isScrapeError(result)) {
        setStatus("error");
        setMessage(result.error);
        return;
      }

      if (!hasGame(result)) {
        setStatus("noGame");
        setMessage(result.message || "指定された日付に試合はありませんでした");
        return;
      }

      setScrapedGame(result.game);
      setStatus("saving");

      const saveResult = await bulkSaveGames([result.game]);

      if (saveResult.savedCount > 0) {
        setStatus("success");
        setMessage("試合結果を保存しました");
        onGameSaved();
      } else if (saveResult.skippedCount > 0) {
        setStatus("success");
        setMessage("この試合は既に登録されています");
      } else {
        setStatus("error");
        setMessage("試合結果の保存に失敗しました");
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました",
      );
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

  const getStatusIcon = () => {
    switch (status) {
      case "scraping":
      case "saving":
        return <Loader2 className={styles.spinnerIcon} size={20} />;
      case "success":
        return <CheckCircle className={styles.successIcon} size={20} />;
      case "error":
        return <XCircle className={styles.errorIcon} size={20} />;
      case "noGame":
        return <Calendar className={styles.noGameIcon} size={20} />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "scraping":
        return "試合結果を取得中...";
      case "saving":
        return "保存中...";
      default:
        return message;
    }
  };

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>観戦記録を追加</h2>

      <div className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="gameDate" className={styles.label}>
            観戦日
          </label>
          <div className={styles.dateInputWrapper}>
            <Calendar className={styles.calendarIcon} size={18} />
            <input
              type="date"
              id="gameDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={styles.dateInput}
              disabled={status === "scraping" || status === "saving"}
            />
          </div>
        </div>

        <button
          onClick={handleScrape}
          disabled={status === "scraping" || status === "saving"}
          className={styles.scrapeButton}
        >
          {status === "scraping" || status === "saving" ? (
            <>
              <Loader2 className={styles.buttonSpinner} size={18} />
              <span>処理中...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>試合結果を取得</span>
            </>
          )}
        </button>
      </div>

      {(status !== "idle" || message) && (
        <div
          className={`${styles.statusMessage} ${
            status === "success"
              ? styles.statusSuccess
              : status === "error"
                ? styles.statusError
                : status === "noGame"
                  ? styles.statusNoGame
                  : styles.statusLoading
          }`}
        >
          {getStatusIcon()}
          <span>{getStatusMessage()}</span>
        </div>
      )}

      {scrapedGame && status === "success" && (
        <div className={styles.gamePreview}>
          <div className={styles.previewHeader}>
            <span className={styles.previewDate}>
              {formatDate(scrapedGame.gameDate)}
            </span>
          </div>
          <div className={styles.previewContent}>
            <div className={styles.previewOpponent}>
              vs {scrapedGame.opponent}
            </div>
            <div className={styles.previewScore}>
              {scrapedGame.dragonsScore} - {scrapedGame.opponentScore}
            </div>
            <div className={styles.previewStadium}>{scrapedGame.stadium}</div>
          </div>
        </div>
      )}
    </div>
  );
}
