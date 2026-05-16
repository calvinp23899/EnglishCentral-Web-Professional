import { Link } from "react-router-dom";
import { Button, Container } from "@/components/ui";

import styles from "./PublicHeader.module.scss";

export function PublicHeader() {
  return (
    <header className={styles.header}>
      <Container className={styles.headerInner}>
        <Link to="/" className={styles.logo}>
          <span>EC</span>
          English Central
        </Link>

        <nav className={styles.nav}>
          <Link to="/">Trang chủ</Link>

          <div className={styles.coursesMenu}>
            <Link to="/courses">Khóa học</Link>

            <div className={styles.megaMenu}>
              <div className={styles.menuColumn}>
                <h4>IELTS</h4>
                <Link to="/courses/ielts/ielts-0-3">IELTS 0 - 3.0</Link>
                <Link to="/courses/ielts/ielts-3-5">IELTS 3.0 - 5.0</Link>
                <Link to="/courses/ielts/ielts-5-6-5">IELTS 5.0 - 6.5+</Link>
                <Link to="/courses/ielts/ielts-7-5">IELTS 7.5+</Link>
              </div>

              <div className={styles.menuColumn}>
                <h4>TOEIC</h4>
                <Link to="/courses/toeic/450">TOEIC 450</Link>
                <Link to="/courses/toeic/900">TOEIC 900</Link>
              </div>

              <div className={styles.menuColumn}>
                <h4>Giao tiếp</h4>
                <Link to="/courses/communication/basic">Sơ cấp</Link>
                <Link to="/courses/communication/business">Cao cấp</Link>
              </div>

              <div className={styles.menuColumn}>
                <h4>Thiếu nhi</h4>
                <Link to="/courses/kids/starters">Starters</Link>
                <Link to="/courses/kids/movers">Movers</Link>
                <Link to="/courses/kids/ket">KET</Link>
                <Link to="/courses/kids/pet">PET</Link>
              </div>
            
            </div>
          </div>

          <Link to="/mock-test">Thi thử</Link>
          <Link to="/books">Sách</Link>
          <Link to="/news">Tin tức</Link>
          <Link to="/contact">Liên hệ</Link>
        </nav>

        <div className={styles.actions}>
          <Link to="/login">
            <Button variant="outline" size="sm">
              Đăng nhập
            </Button>
          </Link>

          <Link to="/register">
            <Button size="sm">
              Đăng ký 
            </Button>
          </Link>
        </div>
      </Container>
    </header>
  );
}