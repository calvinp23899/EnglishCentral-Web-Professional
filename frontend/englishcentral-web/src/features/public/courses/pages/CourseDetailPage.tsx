import { Link, useParams } from "react-router-dom";
import { Button, Container } from "@/components/ui";
import { mockCourses } from "../data/mockCourses";

import styles from "./CourseDetailPage.module.scss";

export function CourseDetailPage() {
  const { category, slug } = useParams();

  const course = mockCourses.find(
    (item) => item.category === category && item.slug === slug
  );

  if (!course) {
    return (
      <Container className={styles.notFound}>
        <h1>Không tìm thấy khóa học</h1>
        <p>Khóa học bạn đang tìm kiếm hiện không tồn tại.</p>
        <Link to="/courses">
          <Button>Quay lại danh sách khóa học</Button>
        </Link>
      </Container>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Container className={styles.heroInner}>
          <div>
            <div className={styles.breadcrumb}>
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <Link to="/courses">Khóa học</Link>
              <span>/</span>
              <strong>{course.title}</strong>
            </div>

            <span className={styles.badge}>{course.level}</span>

            <h1>{course.title}</h1>

            <p>{course.description}</p>

            <div className={styles.actions}>
              <Button variant="outline" size="lg">
                Nhận kiểm tra đầu vào
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.content}>
        <Container className={styles.contentGrid}>
          <div className={styles.mainContent}>
            <section className={styles.block}>
              <h2>Bạn sẽ đạt được gì?</h2>

              <div className={styles.highlightGrid}>
                {course.highlights.map((item) => (
                  <div className={styles.highlightItem} key={item}>
                    <span>✓</span>
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.block}>
              <h2>Lộ trình học</h2>

              <div className={styles.timeline}>
                <div>
                  <span>01</span>
                  <strong>Kiểm tra đầu vào</strong>
                  <p>
                    Đánh giá trình độ hiện tại và xác định mục tiêu học tập.
                  </p>
                </div>

                <div>
                  <span>02</span>
                  <strong>Xây nền kỹ năng</strong>
                  <p>
                    Củng cố kiến thức cốt lõi, từ vựng, ngữ pháp và phương pháp
                    học.
                  </p>
                </div>

                <div>
                  <span>03</span>
                  <strong>Luyện tập chuyên sâu</strong>
                  <p>
                    Luyện bài theo format thực tế, nhận feedback và sửa lỗi liên
                    tục.
                  </p>
                </div>

                <div>
                  <span>04</span>
                  <strong>Thi thử & tối ưu điểm</strong>
                  <p>
                    Mock test định kỳ và điều chỉnh chiến lược trước kỳ thi thật.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className={styles.sideContent}>
            <div className={styles.summaryCard}>
              <h3>Thông tin khóa học</h3>

              <div>
                <span>Thời lượng</span>
                <strong>{course.duration}</strong>
              </div>

              <div>
                <span>Hình thức</span>
                <strong>Online / Offline</strong>
              </div>

              <Link to="/contact">
                <Button fullWidth>Đăng ký ngay</Button>
              </Link>
            </div>
          </aside>
        </Container>
      </section>
    </div>
  );
}
