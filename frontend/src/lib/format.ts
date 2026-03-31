const DAY_OF_WEEK = ["日", "月", "火", "水", "木", "金", "土"];

export function formatGameDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dow = DAY_OF_WEEK[date.getDay()];
  return `${y}年${m}月${d}日（${dow}）`;
}

export function formatCreatedAt(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}
