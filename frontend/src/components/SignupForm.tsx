import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import styles from "./AuthForm.module.css";

export default function SignupForm() {
  const navigate = useNavigate();
  const { signup, signin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signup({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "会員登録に失敗しました");
      setIsSubmitting(false);
      return;
    }

    try {
      await signin({ email, password });
      navigate("/");
    } catch {
      setError(
        "アカウントは作成されました。ログイン画面からログインしてください",
      );
      setIsSubmitting(false);
      navigate("/login");
      return;
    }

    setIsSubmitting(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Dra Vincit</h1>
        <p className={styles.subtitle}>新規アカウント登録</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">
              メールアドレス
            </label>
            <input
              id="email"
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">
              パスワード
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </div>
          <button
            className={styles.submitButton}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "登録中..." : "会員登録"}
          </button>
        </form>
        <p className={styles.switchText}>
          既にアカウントをお持ちの方は{" "}
          <button
            className={styles.switchLink}
            type="button"
            onClick={() => navigate("/login")}
          >
            ログインはこちら
          </button>
        </p>
      </div>
    </div>
  );
}
