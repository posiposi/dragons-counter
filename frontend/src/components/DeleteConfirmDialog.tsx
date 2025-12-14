import styles from "./DeleteConfirmDialog.module.css";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  opponent: string;
  gameDate: string;
}

export default function DeleteConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  opponent,
  gameDate,
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
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>試合記録を削除しますか？</h3>
        <p className={styles.message}>
          {formatDate(gameDate)} の {opponent} 戦の記録を削除します。
          <br />
          この操作は取り消せません。
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            キャンセル
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
