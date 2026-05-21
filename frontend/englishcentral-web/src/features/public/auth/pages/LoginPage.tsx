import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Container, Input } from "@/components/ui";
import {
  authApi,
  getAuthErrorMessage,
  saveAuthSession,
} from "@/features/public/auth/api/auth-api";

import styles from "./LoginPage.module.scss";

export function LoginPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const session = await authApi.login({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });

      saveAuthSession(session, formData.get("rememberLogin") === "on");
      navigate("/practice");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <form className={styles.form} onSubmit={handleLogin}>
            <Input name="email" placeholder="Email" required type="email" />
            <Input
              name="password"
              placeholder="Mật khẩu"
              required
              showPasswordToggle
              type="password"
            />

            <div className={styles.options}>
              <label>
                <input name="rememberLogin" type="checkbox" />
                Ghi nhớ đăng nhập
              </label>

              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

            <Button disabled={isSubmitting} fullWidth size="lg" type="submit">
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <button type="button" className={styles.googleButton}>
            <svg
              aria-hidden="true"
              className={styles.googleIcon}
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Đăng nhập với Google
          </button>

          <p className={styles.footerText}>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
