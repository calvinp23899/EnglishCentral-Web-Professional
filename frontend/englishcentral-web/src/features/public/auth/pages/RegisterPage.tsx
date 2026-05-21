import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Container, Input } from "@/components/ui";
import {
  authApi,
  getAuthErrorMessage,
  saveAuthSession,
} from "@/features/public/auth/api/auth-api";

import styles from "./RegisterPage.module.scss";

export function RegisterPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await authApi.register({
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phoneNumber: String(formData.get("phoneNumber") ?? ""),
        password,
      });

      saveAuthSession(session);
      navigate("/profile");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <Container className={styles.inner}>
        <div className={styles.formCard}>
          <h2>Đăng ký tài khoản</h2>

          <form className={styles.form} onSubmit={handleRegister}>
            <Input name="fullName" placeholder="Họ và tên" required />
            <Input name="email" placeholder="Email" required type="email" />
            <Input name="phoneNumber" placeholder="Số điện thoại" required />
            <Input
              minLength={6}
              name="password"
              placeholder="Mật khẩu"
              required
              showPasswordToggle
              type="password"
            />
            <Input
              minLength={6}
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              required
              showPasswordToggle
              type="password"
            />

            {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

            <Button disabled={isSubmitting} fullWidth size="lg" type="submit">
              {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
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
