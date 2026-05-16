import { Button, Container } from "@/components/ui";

import styles from "./HeroSection.module.scss";

export function HeroSection() {
  return (
    <section className={styles.heroSection}>
      <Container className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h1>Học tiếng Anh hiệu quả cùng English Central</h1>

          <p>
            Lộ trình học cá nhân hóa, giáo viên chất lượng và môi trường học tập
            tương tác giúp bạn cải thiện tiếng Anh rõ rệt mỗi ngày.
          </p>

          <div className={styles.actions}>
            <Button size="lg">Đăng ký tư vấn</Button>
            <Button variant="outline" size="lg">
              Xem khóa học
            </Button>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.visualCard}>
            <div className={styles.cardHeader}>
              <span>EC</span>
              <strong>English Central</strong>
            </div>

            <div className={styles.statGrid}>
              <div>
                <strong>1,200+</strong>
                <span>Học viên</span>
              </div>

              <div>
                <strong>25+</strong>
                <span>Giáo viên</span>
              </div>

              <div>
                <strong>4.9/5</strong>
                <span>Đánh giá</span>
              </div>

              <div>
                <strong>95%</strong>
                <span>Hài lòng</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}