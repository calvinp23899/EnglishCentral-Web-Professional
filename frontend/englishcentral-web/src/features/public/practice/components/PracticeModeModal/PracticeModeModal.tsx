import { useNavigate } from "react-router-dom";
import type { PublicPractice } from "../../data/mockPractice";

import styles from "./PracticeModeModal.module.scss";

type PracticeModeModalProps = {
  practice: PublicPractice;
  onClose: () => void;
};

export function PracticeModeModal({ practice, onClose }: PracticeModeModalProps) {
  const navigate = useNavigate();

  const goToMode = (mode: "real" | "practice") => {
    navigate(`/practice/${practice.category}/${practice.slug}?mode=${mode}`);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <h2>Chọn chế độ làm bài</h2>
        <p className={styles.subtitle}>Bạn muốn làm bài theo chế độ nào?</p>

        <div className={styles.modeGrid}>
          <div className={`${styles.modeCard} ${styles.real}`}>
            <div className={styles.modeHeader}>
              <div className={styles.icon}>⏱</div>
              <h3>Thi thật</h3>
            </div>

            <ul>
              <li>Giao diện giống thi thật trên máy tính</li>
              <li>Bấm giờ nghiêm ngặt</li>
              <li>Không hỗ trợ gợi ý</li>
              <li>Kết quả chính xác nhất</li>
            </ul>

            <button onClick={() => goToMode("real")}>Chọn thi thật</button>
          </div>

          <div className={`${styles.modeCard} ${styles.practice}`}>
            <div className={styles.modeHeader}>
              <div className={styles.icon}>✎</div>
              <h3>Luyện tập</h3>
            </div>

            <ul>
              <li>Giao diện luyện tập đơn giản</li>
              <li>Không bấm giờ nghiêm ngặt</li>
              <li>Hỗ trợ xem đáp án</li>
              <li>Luyện tập thoải mái</li>
            </ul>

            <button onClick={() => goToMode("practice")}>Chọn luyện tập</button>
          </div>
        </div>
      </div>
    </div>
  );
}