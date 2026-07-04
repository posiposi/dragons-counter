import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteConfirmDialog from "../DeleteConfirmDialog";

describe("DeleteConfirmDialog", () => {
  const baseProps = {
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    opponent: "巨人",
    gameDate: "2024-04-01",
  };

  it("isOpenがfalseのとき何も表示しない", () => {
    const { container } = render(
      <DeleteConfirmDialog {...baseProps} isOpen={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("isOpenがtrueのとき観戦記録向けのタイトルを表示する", () => {
    render(<DeleteConfirmDialog {...baseProps} isOpen={true} />);
    expect(screen.getByText("観戦記録を削除しますか？")).toBeInTheDocument();
  });

  it("対象の観戦記録（対戦相手）が分かる本文を表示する", () => {
    render(<DeleteConfirmDialog {...baseProps} isOpen={true} />);
    const body = screen.getByText(/巨人/);
    expect(body).toBeInTheDocument();
    expect(body).toHaveTextContent("観戦記録");
  });

  it("OKボタン押下でonConfirmが呼ばれる", async () => {
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmDialog
        {...baseProps}
        isOpen={true}
        onConfirm={onConfirm}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタン押下でonCancelが呼ばれる", async () => {
    const onCancel = vi.fn();
    render(
      <DeleteConfirmDialog {...baseProps} isOpen={true} onCancel={onCancel} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("errorMessageが渡されたときダイアログ内にエラーを表示する", () => {
    render(
      <DeleteConfirmDialog
        {...baseProps}
        isOpen={true}
        errorMessage="観戦記録の削除に失敗しました"
      />,
    );
    expect(
      screen.getByText("観戦記録の削除に失敗しました"),
    ).toBeInTheDocument();
  });

  it("isProcessingがtrueのとき確定ボタンを無効化する", () => {
    render(
      <DeleteConfirmDialog {...baseProps} isOpen={true} isProcessing={true} />,
    );
    expect(screen.getByRole("button", { name: "削除中..." })).toBeDisabled();
  });
});
