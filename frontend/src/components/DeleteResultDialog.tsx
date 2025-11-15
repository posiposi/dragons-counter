import React from "react";
import styles from "./DeleteResultDialog.module.css";

interface DeleteResultDialogProps {
  isOpen: boolean;
  isSuccess: boolean;
  message: string;
  onClose: () => void;
}

export default function DeleteResultDialog({
  isOpen,
  isSuccess,
  message,
  onClose,
}: DeleteResultDialogProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>
          {isSuccess ? (
            <span className={styles.successIcon}>✓</span>
          ) : (
            <span className={styles.errorIcon}>✕</span>
          )}
        </div>
        <p className={styles.message}>{message}</p>
        <button className={styles.closeButton} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}
