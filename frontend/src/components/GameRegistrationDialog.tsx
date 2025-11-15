"use client";

import { useState, useEffect } from "react";
import styles from "./GameRegistrationDialog.module.css";

interface GameRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NPB_TEAMS = [
  "読売ジャイアンツ",
  "阪神タイガース",
  "横浜DeNAベイスターズ",
  "広島東洋カープ",
  "東京ヤクルトスワローズ",
  "福岡ソフトバンクホークス",
  "千葉ロッテマリーンズ",
  "埼玉西武ライオンズ",
  "オリックス・バファローズ",
  "北海道日本ハムファイターズ",
  "東北楽天ゴールデンイーグルス",
];

export default function GameRegistrationDialog({
  isOpen,
  onClose,
  onSuccess,
}: GameRegistrationDialogProps) {
  const [formData, setFormData] = useState({
    gameDate: "",
    opponent: "",
    dragonsScore: "",
    opponentScore: "",
    stadium: "",
    notes: "",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showConfirmation) {
          setShowConfirmation(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => {
        document.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isOpen, showConfirmation, onClose]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_BASE_URL) {
        throw new Error("API URL is not configured");
      }

      const response = await fetch(`${API_BASE_URL}/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameDate: formData.gameDate,
          opponent: formData.opponent,
          dragonsScore: parseInt(formData.dragonsScore),
          opponentScore: parseInt(formData.opponentScore),
          stadium: formData.stadium,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        throw new Error("登録に失敗しました");
      }

      alert("試合が登録されました");
      setFormData({
        gameDate: "",
        opponent: "",
        dragonsScore: "",
        opponentScore: "",
        stadium: "",
        notes: "",
      });
      setShowConfirmation(false);
      onSuccess();
      onClose();
    } catch (error) {
      alert("登録に失敗しました");
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h2>試合登録</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="gameDate">
              日付 <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="date"
              id="gameDate"
              name="gameDate"
              value={formData.gameDate}
              onChange={handleInputChange}
              required
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="opponent">
              対戦相手 <span style={{ color: "red" }}>*</span>
            </label>
            <select
              id="opponent"
              name="opponent"
              value={formData.opponent}
              onChange={handleInputChange}
              required
            >
              <option value="">選択してください</option>
              {NPB_TEAMS.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dragonsScore">
              ドラゴンズ得点 <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="number"
              id="dragonsScore"
              name="dragonsScore"
              value={formData.dragonsScore}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="opponentScore">
              対戦相手得点 <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="number"
              id="opponentScore"
              name="opponentScore"
              value={formData.opponentScore}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="stadium">
              球場 <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="stadium"
              name="stadium"
              value={formData.stadium}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes">
              備考{" "}
              <span style={{ color: "#666", fontSize: "0.9em" }}>(任意)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className={styles.dialogFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              キャンセル
            </button>
            <button type="submit" className={styles.submitButton}>
              OK
            </button>
          </div>
        </form>
      </div>

      {showConfirmation && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setShowConfirmation(false)}
          />
          <div className={styles.confirmDialog}>
            <h3>確認</h3>
            <p>この内容で試合を登録しますか？</p>
            <div className={styles.confirmDetails}>
              <p>日付: {formData.gameDate}</p>
              <p>対戦相手: {formData.opponent}</p>
              <p>
                スコア: {formData.dragonsScore} - {formData.opponentScore}
              </p>
              <p>球場: {formData.stadium}</p>
              {formData.notes && <p>備考: {formData.notes}</p>}
            </div>
            <div className={styles.confirmFooter}>
              <button
                onClick={() => setShowConfirmation(false)}
                className={styles.cancelButton}
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "登録中..." : "OK"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
