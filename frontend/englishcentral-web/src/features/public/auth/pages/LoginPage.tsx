import { Link } from "react-router-dom";
import { Button, Container, Input } from "@/components/ui";

import styles from "./LoginPage.module.scss";

export function LoginPage() {
  return (
    <section className={styles.page}>
      <Container className={styles.inner}>
        <div className={styles.branding}>
          <span className={styles.badge}>English Central</span>

          <h1>Chào mừng bạn quay trở lại</h1>

          <p>
            Đăng nhập để tiếp tục hành trình học tiếng Anh, theo dõi tiến độ và
            truy cập khóa học của bạn.
          </p>

          <div className={styles.featureList}>
            <div>✓ Theo dõi lộ trình học</div>
            <div>✓ Truy cập tài liệu & bài học</div>
            <div>✓ Quản lý kết quả luyện tập</div>
          </div>
        </div>

        <div className={styles.formCard}>
          <h2>Đăng nhập</h2>

          <form className={styles.form}>
            <Input placeholder="Email" type="email" />
            <Input placeholder="Mật khẩu" type="password" />

            <div className={styles.options}>
              <label>
                <input type="checkbox" />
                Ghi nhớ đăng nhập
              </label>

              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            <Button fullWidth size="lg">
              Đăng nhập
            </Button>
          </form>
          <button type="button" className={styles.googleButton}>
            <span>G</span>
            Tiếp tục với Google
          </button>
          <p className={styles.footerText}>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </Container>
    </section>
  );
}