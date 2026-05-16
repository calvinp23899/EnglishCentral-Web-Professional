import { Button, Container } from "@/components/ui";

import styles from "./CTASection.module.scss";

export function CTASection() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.ctaBox}>
          <h2>Sẵn sàng bắt đầu hành trình học tiếng Anh?</h2>
          <p>
            Đăng ký tư vấn miễn phí để được kiểm tra trình độ và đề xuất lộ trình
            phù hợp.
          </p>

          <Button size="lg" variant="secondary">
            Đăng ký tư vấn ngay
          </Button>
        </div>
      </Container>
    </section>
  );
}