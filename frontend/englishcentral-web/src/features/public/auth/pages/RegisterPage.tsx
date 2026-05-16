import { Link } from "react-router-dom";
import { Button, Container, Input } from "@/components/ui";

import styles from "./RegisterPage.module.scss";

export function RegisterPage() {
  return (
    <section className={styles.page}>
      <Container className={styles.inner}>
        <div className={styles.formCard}>
          <h2>Đăng ký tài khoản</h2>

          <form className={styles.form}>
            <Input placeholder="Họ và tên" />
            <Input placeholder="Email" type="email" />
            <Input placeholder="Số điện thoại" />
            <Input placeholder="Mật khẩu" type="password" />
            <Input placeholder="Xác nhận mật khẩu" type="password" />

            <Button fullWidth size="lg">
              Tạo tài khoản
            </Button>
          </form>

          <p className={styles.footerText}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>

        <div className={styles.branding}>
          <span className={styles.badge}>Bắt đầu ngay</span>

          <h1>Gia nhập cộng đồng học viên English Central</h1>

          <p>
            Nhận lộ trình học cá nhân hóa, tài liệu độc quyền và đồng hành cùng
            đội ngũ giáo viên chất lượng.
          </p>
        </div>
      </Container>
    </section>
  );
}