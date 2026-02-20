import { RegistrationStatus } from "@/types/admin";
import styles from "./UserStatusBadge.module.css";

interface Props {
  status: RegistrationStatus;
}

export default function UserStatusBadge({ status }: Props) {
  const getStatusClass = (status: RegistrationStatus): string => {
    switch (status) {
      case "PENDING":
        return styles.pending;
      case "APPROVED":
        return styles.approved;
      case "REJECTED":
        return styles.rejected;
      case "BANNED":
        return styles.banned;
      default:
        return "";
    }
  };

  const getStatusText = (status: RegistrationStatus): string => {
    switch (status) {
      case "PENDING":
        return "承認待ち";
      case "APPROVED":
        return "承認済み";
      case "REJECTED":
        return "拒否";
      case "BANNED":
        return "凍結";
      default:
        return status;
    }
  };

  return (
    <span className={`${styles.badge} ${getStatusClass(status)}`}>
      {getStatusText(status)}
    </span>
  );
}
