import { GameResult } from "@/types/game";

export function formatGameDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function getResultText(result: GameResult): string {
  switch (result) {
    case "win":
      return "勝利";
    case "lose":
      return "敗北";
    case "draw":
      return "引き分け";
  }
}

export function getResultBadgeClass(
  result: GameResult,
  styles: Record<string, string>,
): string {
  switch (result) {
    case "win":
      return styles.resultWin;
    case "lose":
      return styles.resultLose;
    case "draw":
      return styles.resultDraw;
  }
}
