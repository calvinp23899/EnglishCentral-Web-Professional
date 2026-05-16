import { Container } from "@/components/ui";

import styles from "./TeachersSection.module.scss";

const teachers = [
  {
    name: "Ms. Anna Nguyễn",
    role: "IELTS Instructor",
    bio: "8 năm kinh nghiệm luyện IELTS, chuyên Writing & Speaking.",
  },
  {
    name: "Mr. Minh Trần",
    role: "TOEIC Instructor",
    bio: "Giúp học viên xây nền ngữ pháp và tăng điểm TOEIC thực chiến.",
  },
  {
    name: "Ms. Sophie Lê",
    role: "Communication Coach",
    bio: "Tập trung phát âm, phản xạ và giao tiếp trong môi trường làm việc.",
  },
];

export function TeachersSection() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.sectionHeader}>
          <span>Đội ngũ giáo viên</span>
          <h2>Đồng hành cùng bạn trong từng giai đoạn học</h2>
        </div>

        <div className={styles.teacherGrid}>
          {teachers.map((teacher) => (
            <article className={styles.teacherCard} key={teacher.name}>
              <div className={styles.avatar}>{teacher.name.charAt(0)}</div>
              <h3>{teacher.name}</h3>
              <span>{teacher.role}</span>
              <p>{teacher.bio}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}