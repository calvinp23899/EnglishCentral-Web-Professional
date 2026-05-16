import { Container } from "@/components/ui";
import { CourseCard } from "../components/CourseCard/CourseCard";
import { mockCourses } from "../data/mockCourses";

import styles from "./CoursesPage.module.scss";

const categories = [
  { label: "Tất cả", value: "all" },
  { label: "IELTS", value: "ielts" },
  { label: "TOEIC", value: "toeic" },
  { label: "Giao tiếp", value: "communication" },
  { label: "Thiếu nhi", value: "kids" },
];

export function CoursesPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <span>Khóa học</span>
          <h1>Khám phá lộ trình học phù hợp với mục tiêu của bạn</h1>
          <p>
            Chọn khóa học theo trình độ, mục tiêu đầu ra và thời gian học phù hợp.
          </p>
        </Container>
      </section>

      <section className={styles.content}>
        <Container>
          <div className={styles.categoryTabs}>
            {categories.map((category) => (
              <button key={category.value}>{category.label}</button>
            ))}
          </div>

          <div className={styles.courseGrid}>
            {mockCourses.map((course) => (
              <CourseCard course={course} key={course.id} />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}