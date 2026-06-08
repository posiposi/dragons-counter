import styles from "./DeleteConfirmDialog.module.css";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  opponent: string;
  gameDate: string;
  errorMessage?: string | null;
  isProcessing?: boolean;
}

export default function DeleteConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  opponent,
  gameDate,
  errorMessage = null,
  isProcessing = false,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.title}>観戦記録を削除しますか？</h3>
        <p className={styles.message}>
          {formatDate(gameDate)} の {opponent} 戦の観戦記録を削除します。
          <br />
          この操作は取り消せません。
        </p>
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isProcessing}
          >
            キャンセル
          </button>
          <button
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "削除中..." : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
