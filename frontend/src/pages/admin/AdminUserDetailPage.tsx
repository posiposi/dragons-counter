import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { AdminUser } from "@/types/admin";
import { fetchAdminUser, approveUser, rejectUser } from "@/lib/api/admin";
import UserStatusBadge from "@/components/admin/UserStatusBadge";
import styles from "./AdminUserDetailPage.module.css";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUser = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminUser(id);
      setUser(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ユーザー情報の取得に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleApprove = async () => {
    if (!id || !window.confirm("このユーザーを承認しますか?")) return;
    setActionLoading(true);
    setError(null);
    try {
      await approveUser(id);
      const updated = await fetchAdminUser(id);
      setUser(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "承認処理に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || !window.confirm("このユーザーを拒否しますか?")) return;
    setActionLoading(true);
    setError(null);
    try {
      await rejectUser(id);
      const updated = await fetchAdminUser(id);
      setUser(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "拒否処理に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>ユーザー情報を読み込み中...</div>;
  }

  if (!user && !error) {
    return <div className={styles.notFound}>ユーザーが見つかりません</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          className={styles.backLink}
          onClick={() => navigate("/admin/users")}
        >
          <ArrowLeft size={18} />
          <span>ユーザー一覧に戻る</span>
        </button>
        <h1 className={styles.title}>ユーザー詳細</h1>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {user && (
        <>
          <div className={styles.card}>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>メールアドレス</span>
                <span className={styles.fieldValue}>{user.email}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>ステータス</span>
                <div className={styles.fieldValue}>
                  <UserStatusBadge status={user.registrationStatus} />
                </div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>ロール</span>
                <span className={styles.fieldValue}>{user.role}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>ユーザーID</span>
                <span className={styles.fieldValue}>{user.id}</span>
              </div>
            </div>
          </div>

          {user.registrationStatus === "PENDING" && (
            <div className={styles.actions}>
              <button
                className={styles.approveButton}
                onClick={handleApprove}
                disabled={actionLoading}
              >
                <CheckCircle size={18} />
                <span>{actionLoading ? "処理中..." : "承認"}</span>
              </button>
              <button
                className={styles.rejectButton}
                onClick={handleReject}
                disabled={actionLoading}
              >
                <XCircle size={18} />
                <span>{actionLoading ? "処理中..." : "拒否"}</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
