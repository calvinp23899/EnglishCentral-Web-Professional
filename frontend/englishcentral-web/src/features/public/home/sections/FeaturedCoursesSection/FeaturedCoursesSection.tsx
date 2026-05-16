import { Container } from "@/components/ui";

import styles from "./FeaturedCoursesSection.module.scss";

const courses = [
  {
    title: "IELTS",
    description: "Lộ trình từ nền tảng đến mục tiêu 6.5+ / 7.0+.",
    icon: "🎯",
  },
  {
    title: "Giao tiếp",
    description: "Tăng phản xạ nói, phát âm và tự tin giao tiếp hằng ngày.",
    icon: "💬",
  },
  {
    title: "TOEIC",
    description: "Ôn luyện TOEIC theo format mới, tập trung điểm số thực tế.",
    icon: "📘",
  },
  {
    title: "Tiếng Anh thiếu nhi",
    description: "Học qua hoạt động, trò chơi và tương tác phù hợp độ tuổi.",
    icon: "🌱",
  },
];

export function FeaturedCoursesSection() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.sectionHeader}>
          <span>Khóa học nổi bật</span>
          <h2>Chọn lộ trình phù hợp với mục tiêu của bạn</h2>
        </div>

        <div className={styles.courseGrid}>
          {courses.map((course) => (
            <article className={styles.courseCard} key={course.title}>
              <div className={styles.icon}>{course.icon}</div>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}