import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import GameScrapePanel from "@/components/GameScrapePanel";
import styles from "./AdminGamesPage.module.css";

export default function AdminGamesPage() {
  const navigate = useNavigate();

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
      <GameScrapePanel onGameSaved={() => {}} />
    </div>
  );
}
