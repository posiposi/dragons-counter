import type { GameResult } from "@/types/game";
import styles from "./GameResultBadge.module.css";

interface Props {
  result: GameResult;
}

export default function GameResultBadge({ result }: Props) {
  const getResultClass = (result: GameResult): string => {
    switch (result) {
      case "win":
        return styles.win;
      case "lose":
        return styles.lose;
      case "draw":
        return styles.draw;
    }
  };

  const getResultText = (result: GameResult): string => {
    switch (result) {
      case "win":
        return "勝利";
      case "lose":
        return "敗北";
      case "draw":
        return "引分";
    }
  };

  return (
    <span className={`${styles.badge} ${getResultClass(result)}`}>
      {getResultText(result)}
    </span>
  );
}
