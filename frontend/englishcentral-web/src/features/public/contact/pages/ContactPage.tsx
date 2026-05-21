import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Button, Container, Input } from "@/components/ui";

import styles from "./ContactPage.module.scss";

const contactItems = [
  {
    icon: Phone,
    label: "Hotline",
    value: "0909 123 456",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@englishcentral.vn",
  },
  {
    icon: MapPin,
    label: "Địa chỉ",
    value: "123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
  },
  {
    icon: Clock,
    label: "Giờ làm việc",
    value: "08:00 - 21:00 (Thứ 2 - Chủ nhật)",
  },
];

export function ContactPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <span>Liên hệ</span>
          <h1>Liên hệ với English Central</h1>
          <p>
            Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn lựa chọn lộ trình học
            phù hợp nhất.
          </p>
        </Container>
      </section>

      <section className={styles.content}>
        <Container className={styles.grid}>
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <h3>Thông tin liên hệ</h3>

              {contactItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div className={styles.infoItem} key={item.label}>
                    <span className={styles.infoIcon}>
                      <Icon size={22} strokeWidth={2.2} />
                    </span>
                    <span className={styles.infoText}>
                      <strong>{item.label}</strong>
                      <span>{item.value}</span>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className={styles.mapPlaceholder}>
              <span>Bản đồ trung tâm</span>
            </div>
          </div>

          <div className={styles.formCard}>
            <h3>Đăng ký tư vấn</h3>

            <form className={styles.form}>
              <Input placeholder="Họ và tên" />
              <Input placeholder="Số điện thoại" />
              <Input placeholder="Mục tiêu học (IELTS, TOEIC...)" />
              <textarea placeholder="Tin nhắn của bạn" rows={5} />

              <Button fullWidth size="lg">
                Gửi yêu cầu tư vấn
              </Button>
            </form>
          </div>
        </Container>
      </section>
    </div>
  );
}
