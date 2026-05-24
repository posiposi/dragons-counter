import type { GameResult } from "@/types/game";
import styles from "./GameResultBadge.module.css";

interface Props {
  result: GameResult;
}

const RESULT_CLASS: Record<GameResult, string> = {
  win: styles.win,
  lose: styles.lose,
  draw: styles.draw,
};

const RESULT_TEXT: Record<GameResult, string> = {
  win: "勝利",
  lose: "敗北",
  draw: "引分",
};

export default function GameResultBadge({ result }: Props) {
  return (
    <span className={`${styles.badge} ${RESULT_CLASS[result]}`}>
      {RESULT_TEXT[result]}
    </span>
  );
}
