import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import type { PublicCourse } from "../../data/mockCourses";

import styles from "./CourseCard.module.scss";

type CourseCardProps = {
  course: PublicCourse;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.badge}>{course.level}</div>

      <h3>{course.title}</h3>
      <p>{course.description}</p>

      <ul>
        {course.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className={styles.meta}>
        <span>{course.duration}</span>
      </div>

      <Link to={`/courses/${course.category}/${course.slug}`}>
        <Button fullWidth>Tư vấn Khoá Học</Button>
      </Link>
    </article>
  );
}