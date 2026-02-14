import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { AdminUser, RegistrationStatus } from "@/types/admin";
import { fetchAdminUsers } from "@/lib/api/admin";
import UserStatusBadge from "@/components/admin/UserStatusBadge";
import styles from "./AdminUsersPage.module.css";

type StatusFilter = RegistrationStatus | "ALL";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "全て" },
  { value: "PENDING", label: "承認待ち" },
  { value: "APPROVED", label: "承認済み" },
  { value: "REJECTED", label: "拒否" },
  { value: "BANNED", label: "凍結" },
];

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAdminUsers();
        setUsers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "ユーザー一覧の取得に失敗しました",
        );
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let result = users;
    if (statusFilter !== "ALL") {
      result = result.filter((u) => u.registrationStatus === statusFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((u) => u.email.toLowerCase().includes(query));
    }
    return result;
  }, [users, statusFilter, searchQuery]);

  if (loading) {
    return <div className={styles.loading}>ユーザーデータを読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>ユーザー管理</h1>
          <button className={styles.backLink} onClick={() => navigate("/")}>
            <ArrowLeft size={18} />
            <span>ホームへ戻る</span>
          </button>
        </div>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <input
        type="text"
        className={styles.searchInput}
        placeholder="メールアドレスで検索..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className={styles.filterGroup}>
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            className={`${styles.filterButton} ${statusFilter === filter.value ? styles.filterButtonActive : ""}`}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className={styles.userCount}>{filteredUsers.length}件のユーザー</div>

      {filteredUsers.length === 0 ? (
        <div className={styles.emptyState}>該当するユーザーはいません</div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>メールアドレス</th>
                <th>ステータス</th>
                <th>ロール</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td data-label="メールアドレス">{user.email}</td>
                  <td data-label="ステータス">
                    <UserStatusBadge status={user.registrationStatus} />
                  </td>
                  <td data-label="ロール">{user.role}</td>
                  <td>
                    <button
                      className={styles.detailButton}
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                    >
                      <span>詳細</span>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
