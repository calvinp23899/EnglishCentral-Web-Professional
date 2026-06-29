import styles from "./SubmitResultModal.module.scss";

type SubmitResultModalProps = {
  onClose: () => void;
  onComplete: () => void;
};

export function SubmitResultModal({
  onClose,
  onComplete,
}: SubmitResultModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Bạn có chắc chắn muốn kết thúc phần bài làm của mình ?</h2>

        <div className={styles.actions}>
          <button onClick={onClose}>Tiếp tục làm bài</button>
          <button className={styles.primaryButton} onClick={onComplete}>
            Hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
}
