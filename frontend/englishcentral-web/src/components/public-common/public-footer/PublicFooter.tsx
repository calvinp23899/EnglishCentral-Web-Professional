import { Container } from "@/components/ui/container/Container";

import styles from "./PublicFooter.module.scss";

export function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div>
          <div className={styles.brand}>English Central</div>

          <p>
            Trung tâm tiếng Anh hiện đại, tập trung vào giao tiếp, IELTS và lộ
            trình học cá nhân hóa cho từng học viên.
          </p>
        </div>

        <div>
          <h4>Khóa học</h4>
          <p>IELTS</p>
          <p>Giao tiếp</p>
          <p>Tiếng Anh thiếu nhi</p>
        </div>

        <div>
          <h4>Liên hệ</h4>
          <p>Email: contact@englishcentral.vn</p>
          <p>Hotline: 0900 000 000</p>
          <p>TP. Hồ Chí Minh, Việt Nam</p>
        </div>
      </Container>

      <div className={styles.copyRight}>
        © 2026 English Central. All rights reserved.
      </div>
    </footer>
  );
}