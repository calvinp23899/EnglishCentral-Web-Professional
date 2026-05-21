import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Container, ErrorMessage, Input, toastDanger } from "@/components/ui";
import {
  authApi,
  getAuthErrorMessage,
  saveAuthSession,
} from "@/features/public/auth/api/auth-api";

import styles from "./RegisterPage.module.scss";

type RegisterErrors = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
};

const getFormValue = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();

const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

export function RegisterPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const fullName = getFormValue(formData, "fullName");
    const email = getFormValue(formData, "email");
    const phoneNumber = getFormValue(formData, "phoneNumber");
    const password = getFormValue(formData, "password");
    const confirmPassword = getFormValue(formData, "confirmPassword");
    const nextErrors: RegisterErrors = {};

    if (!fullName) {
      nextErrors.fullName = "Vui lòng nhập họ và tên.";
    }

    if (!email) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Email không đúng định dạng.";
    }

    if (!phoneNumber) {
      nextErrors.phoneNumber = "Vui lòng nhập số điện thoại.";
    }

    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 6) {
      nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await authApi.register({
        fullName,
        email,
        phoneNumber,
        password,
      });

      saveAuthSession(session);
      navigate("/profile");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <Container className={styles.inner}>
        <div className={styles.formCard}>
          <h2>Đăng ký tài khoản</h2>

          <form className={styles.form} onSubmit={handleRegister} noValidate>
            <Input
              aria-describedby={errors.fullName ? "register-full-name-error" : undefined}
              aria-invalid={Boolean(errors.fullName)}
              name="fullName"
              onChange={() =>
                setErrors((current) => ({ ...current, fullName: undefined }))
              }
              placeholder="Họ và tên"
            />
            <ErrorMessage id="register-full-name-error" message={errors.fullName} />
            <Input
              aria-describedby={errors.email ? "register-email-error" : undefined}
              aria-invalid={Boolean(errors.email)}
              name="email"
              onChange={() =>
                setErrors((current) => ({ ...current, email: undefined }))
              }
              placeholder="Email"
              type="email"
            />
            <ErrorMessage id="register-email-error" message={errors.email} />
            <Input
              aria-describedby={errors.phoneNumber ? "register-phone-error" : undefined}
              aria-invalid={Boolean(errors.phoneNumber)}
              name="phoneNumber"
              onChange={() =>
                setErrors((current) => ({ ...current, phoneNumber: undefined }))
              }
              placeholder="Số điện thoại"
            />
            <ErrorMessage id="register-phone-error" message={errors.phoneNumber} />
            <Input
              aria-describedby={errors.password ? "register-password-error" : undefined}
              aria-invalid={Boolean(errors.password)}
              name="password"
              onChange={() =>
                setErrors((current) => ({ ...current, password: undefined }))
              }
              placeholder="Mật khẩu"
              showPasswordToggle
              type="password"
            />
            <ErrorMessage id="register-password-error" message={errors.password} />
            <Input
              aria-describedby={
                errors.confirmPassword ? "register-confirm-password-error" : undefined
              }
              aria-invalid={Boolean(errors.confirmPassword)}
              name="confirmPassword"
              onChange={() =>
                setErrors((current) => ({ ...current, confirmPassword: undefined }))
              }
              placeholder="Xác nhận mật khẩu"
              showPasswordToggle
              type="password"
            />
            <ErrorMessage
              id="register-confirm-password-error"
              message={errors.confirmPassword}
            />

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
