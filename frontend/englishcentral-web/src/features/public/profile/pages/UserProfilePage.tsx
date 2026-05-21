import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Pencil, X } from "lucide-react";
import { Container } from "@/components/ui";
import {
  authApi,
  getStoredUser,
  saveAuthSession,
  type AuthUser,
} from "@/features/public/auth/api/auth-api";
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

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || "E";

const formatValue = (value?: string) => value || "Chưa cập nhật";

export function UserProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(!getStoredUser());
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncProfile = async () => {
      try {
        const profile = await authApi.getProfile();
        saveAuthSession({ user: profile });

        if (isMounted) {
          setUser(profile);
        }
      } catch {
        try {
          const session = await authApi.refresh();
          saveAuthSession(session);

          const profile = await authApi.getProfile();
          saveAuthSession({ user: profile });

          if (isMounted) {
            setUser(profile);
          }
        } catch {
          navigate("/login");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void syncProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordModalOpen(false);
    setShowSuccessMessage(true);
    window.setTimeout(() => setShowSuccessMessage(false), 2600);
  };

  if (isLoading) {
    return (
      <section className={styles.page}>
        <Container>
          <div className={styles.statusCard}>Đang tải hồ sơ...</div>
        </Container>
      </section>
    );
  }

  if (!user) {
    return null;
  }

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
          <div className={styles.avatar}>{getInitial(user.name)}</div>
          <div>
            <span>Hồ sơ học viên</span>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2>Thông tin cá nhân</h2>
            <div className={styles.infoList}>
              <p>
                <strong>Họ tên</strong>
                <span>{formatValue(user.name)}</span>
              </p>
              <p>
                <strong>Email</strong>
                <span>{formatValue(user.email)}</span>
              </p>
              <p>
                <strong>SĐT</strong>
                <span>{formatValue(user.phoneNumber)}</span>
              </p>
              <p>
                <strong>Giới tính</strong>
                <span>{formatValue(user.gender)}</span>
              </p>
              <p>
                <strong>Ngày sinh</strong>
                <span>{formatValue(user.dateOfBirth)}</span>
              </p>
              <p>
                <strong>Mật khẩu</strong>
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
              <span>Nhập lại mật khẩu mới</span>
              <input type="password" required minLength={6} />
            </label>

            <button type="submit">Đổi mật khẩu</button>
          </form>
        </div>
      )}
    </section>
  );
}
