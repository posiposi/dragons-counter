import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GameScrapePanel from "@/components/GameScrapePanel";
import styles from "./AdminGamesPage.module.css";

export default function AdminGamesPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>試合データ管理</h1>
          <button className={styles.backLink} onClick={() => navigate("/")}>
            <ArrowLeft size={18} />
            <span>ホームへ戻る</span>
          </button>
        </div>
      </header>
      <GameScrapePanel onGameSaved={() => {}} />
    </div>
  );
}
