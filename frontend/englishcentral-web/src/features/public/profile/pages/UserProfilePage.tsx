import { useState } from "react";
import { CheckCircle2, Pencil, X } from "lucide-react";
import { Container } from "@/components/ui";
import styles from "./UserProfilePage.module.scss";

const latestSkillResults = [
  { skill: "Reading", band: 4.5 },
  { skill: "Listening", band: 6.0 },
  { skill: "Writing", band: 7.5 },
];

const getEncouragement = (band: number) => {
  if (band < 5) {
    return "Đừng nản chí, bạn đang xây nền rất quan trọng. Cứ đều tay thêm một chút mỗi ngày nhé.";
  }

  if (band > 7) {
    return "Tuyệt vời, phong độ rất đáng tự hào. Giữ nhịp luyện tập để bứt phá thêm nhé.";
  }

  if (band > 6.5) {
    return "Rất tốt, bạn đã chạm vùng điểm mạnh. Tập trung sửa lỗi nhỏ là sẽ lên thêm nữa.";
  }

  return "Có tiến bộ rõ rệt rồi, tiếp tục giữ nhịp và luyện kỹ phần còn yếu nhé.";
};

export function UserProfilePage() {
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordModalOpen(false);
    setShowSuccessMessage(true);
    window.setTimeout(() => setShowSuccessMessage(false), 2600);
  };

  return (
    <section className={styles.page}>
      <Container>
        {showSuccessMessage && (
          <div className={styles.successMessage}>
            <CheckCircle2 aria-hidden="true" />
            <span>Thay đổi mật khẩu thành công</span>
          </div>
        )}

        <div className={styles.profileHero}>
          <div className={styles.avatar}>A</div>
          <div>
            <span>Hồ sơ học viên</span>
            <h1>Nguyễn Minh Anh</h1>
            <p>minhanh@englishcentral.vn</p>
          </div>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2>Thông tin cá nhân</h2>
            <div className={styles.infoList}>
              <p><strong>Họ tên</strong><span>Nguyễn Minh Anh</span></p>
              <p><strong>Email</strong><span>minhanh@englishcentral.vn</span></p>
              <p><strong>SDT</strong><span>0912 345 678</span></p>
              <p><strong>Giới Tính</strong><span>Nữ</span></p>
              <p><strong>Ngày Sinh</strong><span>**/**/****</span></p>
              <p>
                <strong>Mật Khẩu</strong>
                <span className={styles.passwordValue}>
                  ********
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(true)}
                  >
                    <Pencil aria-hidden="true" />
                    Thay đổi
                  </button>
                </span>
              </p>
            </div>
          </section>

          <section className={`${styles.card} ${styles.overallCard}`}>
            <h2>Tiến độ luyện tập</h2>
            <div className={styles.skillCharts}>
              {latestSkillResults.map((item) => {
                const percent = Math.min(100, (item.band / 9) * 100);

                return (
                  <article key={item.skill} className={styles.skillChartCard}>
                    <div
                      className={styles.pieChart}
                      style={{
                        background: `conic-gradient(#0ea5a4 ${percent}%, #e2e8f0 0)`,
                      }}
                    >
                      <div>
                        <strong>{item.band.toFixed(1)}</strong>
                        <span>Band</span>
                      </div>
                    </div>
                    <div>
                      <h3>{item.skill}</h3>
                      <p>{getEncouragement(item.band)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </Container>

      {isPasswordModalOpen && (
        <div className={styles.modalOverlay}>
          <form
            className={styles.passwordModal}
            onSubmit={handlePasswordSubmit}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setPasswordModalOpen(false)}
            >
              <X aria-hidden="true" />
            </button>

            <h3>Thay đổi mật khẩu</h3>
            <label>
              <span>Mật khẩu mới</span>
              <input type="password" required minLength={6} />
            </label>
            <label>
              <span>Repeat mật khẩu mới</span>
              <input type="password" required minLength={6} />
            </label>

            <button type="submit">Đổi Mật Khẩu</button>
          </form>
        </div>
      )}
    </section>
  );
}
