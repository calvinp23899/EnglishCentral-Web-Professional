import { BookOpen, FileText, Headphones, PenTool } from "lucide-react";
import { Link } from "react-router-dom";

import styles from "./IeltsHubPage.module.scss";

const skillCards = [
  {
    title: "Reading",
    description: "Quản lý passage, question groups, answer key và preview đề đọc.",
    path: "/admin/practice-bank/ielts/reading",
    icon: FileText,
    stats: "18 đề",
  },
  {
    title: "Writing",
    description: "Quản lý Task 1, Task 2, rubric, sample answer và band guide.",
    path: "/admin/practice-bank/ielts/writing",
    icon: PenTool,
    stats: "12 đề",
  },
  {
    title: "Listening",
    description: "Quản lý audio sections, transcript, question groups và đáp án.",
    path: "/admin/practice-bank/ielts/listening",
    icon: Headphones,
    stats: "15 đề",
  },
];

export function IeltsHubPage() {
  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <h1>IELTS Practice Bank</h1>
          <p>Chọn kỹ năng để quản lý đề, tạo bản nháp và xuất bản nội dung luyện tập.</p>
        </div>
        <div className={styles.headerBadge}>
          <BookOpen aria-hidden="true" size={20} />
          <span>Academic test builder</span>
        </div>
      </section>

      <section className={styles.cardGrid}>
        {skillCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link className={styles.skillCard} key={card.title} to={card.path}>
              <span className={styles.icon}>
                <Icon aria-hidden="true" size={24} />
              </span>
              <div>
                <strong>{card.title}</strong>
                <p>{card.description}</p>
              </div>
              <em>{card.stats}</em>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
