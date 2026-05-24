/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GameResultBadge from "../GameResultBadge";

describe("GameResultBadge", () => {
  it('"win"の場合に"勝利"テキストが表示される', () => {
    render(<GameResultBadge result="win" />);
    expect(screen.getByText("勝利")).toBeDefined();
  });

  it('"lose"の場合に"敗北"テキストが表示される', () => {
    render(<GameResultBadge result="lose" />);
    expect(screen.getByText("敗北")).toBeDefined();
  });

  it('"draw"の場合に"引分"テキストが表示される', () => {
    render(<GameResultBadge result="draw" />);
    expect(screen.getByText("引分")).toBeDefined();
  });

  it("各結果に対応するCSSクラスが適用される", () => {
    const { rerender } = render(<GameResultBadge result="win" />);
    const winBadge = screen.getByText("勝利");
    expect(winBadge.className).toContain("badge");
    expect(winBadge.className).toContain("win");

    rerender(<GameResultBadge result="lose" />);
    const loseBadge = screen.getByText("敗北");
    expect(loseBadge.className).toContain("badge");
    expect(loseBadge.className).toContain("lose");

    rerender(<GameResultBadge result="draw" />);
    const drawBadge = screen.getByText("引分");
    expect(drawBadge.className).toContain("badge");
    expect(drawBadge.className).toContain("draw");
  });
});
