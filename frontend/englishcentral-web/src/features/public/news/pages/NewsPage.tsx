import { Container } from "@/components/ui";
import { NewsCard } from "../components/NewsCard/NewsCard";
import { mockNews } from "../data/mockNews";

import styles from "./NewsPage.module.scss";

export function NewsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <span>Tin tức & kiến thức</span>

          <h1>Khám phá kiến thức tiếng Anh, chiến lược thi và lộ trình học hiệu quả</h1>

          <p>
            Cập nhật liên tục các bài viết chuyên sâu về IELTS, TOEIC, kỹ năng học tập và giáo dục.
          </p>
        </Container>
      </section>

      <section className={styles.content}>
        <Container>
          <div className={styles.categoryTabs}>
            <button>Tất cả</button>
            <button>IELTS</button>
            <button>TOEIC</button>
            <button>Grammar</button>
            <button>Speaking</button>
            <button>Lộ trình học</button>
          </div>

          <div className={styles.newsGrid}>
            {mockNews.map((article) => (
              <NewsCard article={article} key={article.id} />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}