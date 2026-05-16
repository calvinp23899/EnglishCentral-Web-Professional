import { Link } from "react-router-dom";
import { Button, Container } from "@/components/ui";

import styles from "./NotFoundPage.module.scss";

export function NotFoundPage() {
  return (
    <section className={styles.page}>
      <Container className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.badge}>404</span>

          <h1>Trang bạn tìm kiếm không tồn tại</h1>

          <p>
            Có thể đường dẫn đã thay đổi hoặc tính năng này đang được phát triển.
            Vui lòng quay lại trang chủ hoặc xem các khóa học hiện có.
          </p>

          <div className={styles.actions}>
            <Link to="/">
              <Button>Về trang chủ</Button>
            </Link>

            <Link to="/courses">
              <Button variant="outline">Xem khóa học</Button>
            </Link>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.card}>
            <strong>Oops!</strong>
            <span>Page not found</span>
            <p>English Central đang hoàn thiện nội dung này.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}