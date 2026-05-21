import type { FormEvent } from "react";
import { useState } from "react";
import {
  BookOpen,
  Lock,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import { Button, Card, ErrorMessage, Input } from "@/components/ui";

import styles from "./AdminLoginPage.module.scss";

type AdminLoginErrors = {
  email?: string;
  password?: string;
};

const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

export function AdminLoginPage() {
  const [errors, setErrors] = useState<AdminLoginErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    const nextErrors: AdminLoginErrors = {};

    if (!email) {
      nextErrors.email = "Please enter your email address.";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Please enter your password.";
    }

    setErrors(nextErrors);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.brandingSection}>
        <div className={styles.brandingCard}>
          <div className={styles.logo}>EC</div>

          <h1>English Central</h1>
          <p className={styles.subtitle}>Administration Portal</p>

          <p className={styles.tagline}>
            Manage courses, students, teachers, and all educational content from
            one centralized platform.
          </p>

          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <BookOpen size={18} />
              </div>
              Course Management
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <ShieldCheck size={18} />
              </div>
              User Control
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <MessagesSquare size={18} />
              </div>
              Communication
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <Card className={styles.formCard}>
          <div className={styles.formWrapper}>
            <div className={styles.header}>
              <span className={styles.badge}>ADMIN PORTAL</span>

              <h2>Welcome Back</h2>
              <p>Please sign in to access the admin dashboard</p>
            </div>

            <form className={styles.form} noValidate onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="admin-email">Email Address</label>
                <Input
                  aria-describedby={errors.email ? "admin-email-error" : undefined}
                  aria-invalid={Boolean(errors.email)}
                  id="admin-email"
                  name="email"
                  onChange={() =>
                    setErrors((current) => ({ ...current, email: undefined }))
                  }
                  placeholder="admin@englishcentral.com"
                  type="email"
                />
                <ErrorMessage id="admin-email-error" message={errors.email} />
              </div>

              <div className={styles.field}>
                <label htmlFor="admin-password">Password</label>
                <Input
                  aria-describedby={
                    errors.password ? "admin-password-error" : undefined
                  }
                  aria-invalid={Boolean(errors.password)}
                  id="admin-password"
                  name="password"
                  onChange={() =>
                    setErrors((current) => ({ ...current, password: undefined }))
                  }
                  placeholder="Enter your password"
                  showPasswordToggle
                  type="password"
                />
                <ErrorMessage id="admin-password-error" message={errors.password} />
              </div>

              <div className={styles.actionsRow}>
                <label className={styles.rememberMe}>
                  <input id="admin-remember" type="checkbox" />
                  Remember me
                </label>

                <button className={styles.forgotButton} type="button">
                  Forgot password?
                </button>
              </div>

              <Button fullWidth size="lg" type="submit">
                Sign In to Dashboard
              </Button>
            </form>

            <div className={styles.helpText}>
              Need help?{" "}
              <a href="mailto:support@englishcentral.com">Contact IT Support</a>
            </div>
          </div>
        </Card>

        <Card className={styles.securityCard}>
          <div className={styles.securityNote}>
            <div className={styles.noteIcon}>
              <Lock size={18} />
            </div>
            <div>
              <strong>Secure Admin Access</strong>
              <p>
                All login attempts are monitored and logged for security
                purposes.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
