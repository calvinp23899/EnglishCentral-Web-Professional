import { Link } from "react-router-dom";
import { Button, Container, Input } from "@/components/ui";

import styles from "./ForgotPasswordPage.module.scss";

export function ForgotPasswordPage() {
  return (
    <section className={styles.page}>
      <Container className={styles.inner}>
        <div className={styles.formCard}>
          <span className={styles.badge}>Khôi phục tài khoản</span>

          <h1>Quên mật khẩu?</h1>

          <p>
            Nhập email đã đăng ký. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
            cho bạn.
          </p>

          <form className={styles.form}>
            <Input placeholder="Email" type="email" />

            <Button fullWidth size="lg">
              Khôi phục lại mật khẩu
            </Button>
          </form>

          <p className={styles.footerText}>
            Nhớ mật khẩu rồi? <Link to="/login">Quay lại đăng nhập</Link>
          </p>
        </div>
      </Container>
    </section>
  );
}