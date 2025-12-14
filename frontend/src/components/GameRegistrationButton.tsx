import styles from "./GameRegistrationButton.module.css";

interface GameRegistrationButtonProps {
  onClick: () => void;
}

export default function GameRegistrationButton({
  onClick,
}: GameRegistrationButtonProps) {
  return (
    <button className={styles.registrationButton} onClick={onClick}>
      試合登録
    </button>
  );
}
