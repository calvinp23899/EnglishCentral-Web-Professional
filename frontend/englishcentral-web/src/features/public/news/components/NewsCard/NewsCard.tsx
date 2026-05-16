import { Link } from "react-router-dom";
import type { NewsArticle } from "../../data/mockNews";

import styles from "./NewsCard.module.scss";

type NewsCardProps = {
  article: NewsArticle;
};

export function NewsCard({ article }: NewsCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.thumbnail}>
        <span>{article.category}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.meta}>
          <span>{article.date}</span>
          <span>{article.readTime}</span>
        </div>

        <h3>{article.title}</h3>

        <p>{article.excerpt}</p>

        <Link to={`/news/${article.slug}`}>Đọc thêm →</Link>
      </div>
    </article>
  );
}