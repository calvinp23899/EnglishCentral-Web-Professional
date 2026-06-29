import { Link, useParams } from "react-router-dom";
import { Button, Container } from "@/components/ui";
import { mockNews } from "../data/mockNews";

import styles from "./NewsDetailPage.module.scss";

export function NewsDetailPage() {
  const { slug } = useParams();

  const article = mockNews.find((item) => item.slug === slug);

  if (!article) {
    return (
      <Container className={styles.notFound}>
        <h1>Không tìm thấy bài viết</h1>
        <p>Bài viết bạn đang tìm kiếm hiện không tồn tại.</p>

        <Link to="/news">
          <Button>Quay lại tin tức</Button>
        </Link>
      </Container>
    );
  }

  return (
    <article className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <div className={styles.breadcrumb}>
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/news">Tin tức</Link>
            <span>/</span>
            <strong>{article.title}</strong>
          </div>

          <span className={styles.category}>{article.category}</span>

          <h1>{article.title}</h1>

          <div className={styles.meta}>
            <span>{article.date}</span>
            <span>{article.readTime}</span>
          </div>
        </Container>
      </section>

      <section className={styles.content}>
        <Container className={styles.contentInner}>
          <div className={styles.articleBody}>
            {article.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.ctaCard}>
              <h3>Cần tư vấn lộ trình?</h3>
              <p>English Central sẽ giúp bạn chọn khóa học phù hợp với mục tiêu.</p>

              <Link to="/contact">
                <Button fullWidth>Đăng ký tư vấn</Button>
              </Link>
            </div>
          </aside>
        </Container>
      </section>
    </article>
  );
}