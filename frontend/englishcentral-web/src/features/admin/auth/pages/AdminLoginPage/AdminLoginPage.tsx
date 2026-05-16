import { Button } from "@/components/ui/button/Button";
import { Card } from "@/components/ui/card/Card";
import { Input } from "@/components/ui/input/Input";

import styles from "./AdminLoginPage.module.scss";
import {
  BookOpen,
  ShieldCheck,
  MessagesSquare,
  Lock
} from "lucide-react";

export function AdminLoginPage() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.brandingSection}>
        <div className={styles.brandingCard}>
          <div className={styles.logo}>EC</div>

          <h1>English Central</h1>
          <p className={styles.subtitle}>Administration Portal</p>

          <p className={styles.tagline}>
            Manage courses, students, teachers, and all educational content from one centralized platform.
          </p>

          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <BookOpen size={18}/>
              </div>
              Course Management
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <ShieldCheck size={18}/>
              </div>
              User Control
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <MessagesSquare size={18}/>
              </div>
              Communication
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <Card>
          <div className={styles.formWrapper}>
            <div className={styles.header}>
              <span className={styles.badge}>ADMIN PORTAL</span>

              <h2>Welcome Back</h2>
              <p>Please sign in to access the admin dashboard</p>
            </div>

            <div className={styles.form}>
              <div className={styles.field}>
                <label>Email Address</label>
                <Input placeholder="admin@englishcentral.com" />
              </div>

              <div className={styles.field}>
                <label>Password</label>
                <Input type="password" placeholder="Enter your password" showPasswordToggle />
              </div>

              <div className={styles.actionsRow}>
                <label className={styles.rememberMe}>
                  <input type="checkbox" />
                  Remember me
                </label>

                <button className={styles.forgotButton} type="submit">
                  Forgot password?
                </button>
              </div>

              <Button>Sign In to Dashboard</Button>
            </div>

            <div className={styles.helpText}>
              Need help? <a href="mailto:support@englishcentral.com">Contact IT Support</a>
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
              <p>All login attempts are monitored and logged for security purposes.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}