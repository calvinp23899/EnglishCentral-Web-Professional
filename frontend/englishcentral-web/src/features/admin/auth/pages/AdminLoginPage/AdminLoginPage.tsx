import { Button } from "@/components/ui/button/Button";
import { Card } from "@/components/ui/card/Card";
import { Input } from "@/components/ui/input/Input";

import styles from "./AdminLoginPage.module.scss";

export function AdminLoginPage() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.brandingSection}>
        <div className={styles.overlay} />

        <div className={styles.brandingContent}>
          <div className={styles.logo}>
            EC
          </div>

          <h1>
            EnglishCentral
          </h1>

          <p>
            Smart English Learning &
            Academic Management Platform
          </p>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              Student Management
            </div>

            <div className={styles.featureItem}>
              Academic Tracking
            </div>

            <div className={styles.featureItem}>
              Learning Analytics
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <Card>
          <div className={styles.formWrapper}>
            <div className={styles.header}>
              <span className={styles.badge}>
                ADMIN PORTAL
              </span>

              <h2>
                Welcome Back
              </h2>

              <p>
                Login to manage your
                platform
              </p>
            </div>

            <div className={styles.form}>
              <div className={styles.field}>
                <label>Email</label>

                <Input
                  placeholder="admin@englishcentral.com"
                />
              </div>

              <div className={styles.field}>
                <label>Password</label>

                <Input
                  type="password"
                  placeholder="Enter password"
                />
              </div>

              <Button>
                Login
              </Button>
            </div>

            <div className={styles.footer}>
              EnglishCentral Admin System
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}