import styles from "./SubmitResultModal.module.scss";

type SubmitResultModalProps = {
  totalQuestions: number;
  answeredQuestions: number;
  onClose: () => void;
  onBackToPractice: () => void;
};

export function SubmitResultModal({
  totalQuestions,
  answeredQuestions,
  onClose,
  onBackToPractice,
}: SubmitResultModalProps) {
  const unansweredQuestions = totalQuestions - answeredQuestions;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Kết quả bài làm</h2>

        <p className={styles.subtitle}>
          Đây là kết quả tạm thời. Sau này phần này sẽ nối với chấm điểm thật.
        </p>

        <div className={styles.stats}>
          <div>
            <strong>{totalQuestions}</strong>
            <span>Tổng số câu</span>
          </div>

          <div>
            <strong>{answeredQuestions}</strong>
            <span>Đã trả lời</span>
          </div>

          <div>
            <strong>{unansweredQuestions}</strong>
            <span>Chưa trả lời</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose}>Tiếp tục làm bài</button>
          <button className={styles.primaryButton} onClick={onBackToPractice}>
            Quay lại luyện tập
          </button>
        </div>
      </div>
    </div>
  );
}