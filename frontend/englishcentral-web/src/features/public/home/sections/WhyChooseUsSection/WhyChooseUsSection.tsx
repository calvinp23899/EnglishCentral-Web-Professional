import { Container } from "@/components/ui";

import styles from "./WhyChooseUsSection.module.scss";

const reasons = [
  "Giáo viên chất lượng",
  "Lộ trình cá nhân hóa",
  "Lớp học tương tác",
  "Theo dõi tiến độ",
];

export function WhyChooseUsSection() {
  return (
    <section className={styles.section}>
      <Container className={styles.container}>
        <div>
          <span className={styles.label}>Vì sao chọn chúng tôi?</span>
          <h2>Học có định hướng, luyện tập có phản hồi, tiến bộ có đo lường</h2>
        </div>

        <div className={styles.reasonList}>
          {reasons.map((reason, index) => (
            <div className={styles.reasonItem} key={reason}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{reason}</strong>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}