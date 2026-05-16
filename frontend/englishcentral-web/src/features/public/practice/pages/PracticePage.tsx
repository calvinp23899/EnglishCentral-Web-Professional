import { useMemo, useState } from "react";
import { Container } from "@/components/ui";
import { PracticeCard } from "../components/PracticeCard/PracticeCard";
import {
  mockPractices,
  practiceMenus,
  type PracticeCategory,
  type PracticeSkill,
} from "../data/mockPractice";

import styles from "./PracticePage.module.scss";
const PAGE_SIZE = 3;

export function PracticePage() {
  const [selectedCategory, setSelectedCategory] =
    useState<PracticeCategory | "all">("all");

  const [selectedSkill, setSelectedSkill] =
    useState<PracticeSkill | "all">("all");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPractices = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return mockPractices.filter((item) => {
      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const matchSkill =
        selectedSkill === "all" || item.skill === selectedSkill;

      const matchSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.level.toLowerCase().includes(keyword);

      return matchCategory && matchSkill && matchSearch;
    });
  }, [selectedCategory, selectedSkill, searchTerm]);

  const totalPages = Math.ceil(filteredPractices.length / PAGE_SIZE);

  const paginatedPractices = filteredPractices.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleCategoryChange = (category: PracticeCategory | "all") => {
    setSelectedCategory(category);
    setSelectedSkill("all");
    setCurrentPage(1);
  };

  const handleSkillChange = (skill: PracticeSkill) => {
    setSelectedSkill(skill);
    setCurrentPage(1);
  };
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <span>Luyện tập & thi thử</span>
          <h1>
            Cập nhật liên tục các bài kiểm tra chuyên sâu về IELTS, TOEIC, kỹ năng học tập và giáo dục.
          </h1>
        </Container>
      </section>

      <section className={styles.content}>
        <Container>
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <h3>Nội dung</h3>
              {practiceMenus.map((menu) => (
                <div key={menu.value} className={styles.filterGroup}>
                  <label className={styles.checkOption}>
                    <input
                      type="checkbox"
                      checked={selectedCategory === menu.value}
                      onChange={() =>
                        handleCategoryChange(menu.value as PracticeCategory)
                      }
                    />
                    <span>{menu.label}</span>
                  </label>

                  {"children" in menu &&
                    selectedCategory === menu.value &&
                    menu.children?.map((child) => (
                      <label key={child.value} className={styles.childCheckOption}>
                        <input
                          type="checkbox"
                          checked={selectedSkill === child.value}
                          onChange={() =>
                            handleSkillChange(child.value as PracticeSkill)
                          }
                        />
                        <span>{child.label}</span>
                      </label>
                    ))}
                </div>
              ))}
            </aside>

            <div className={styles.mainContent}>
              <div className={styles.toolbar}>
                <div>
                  <h2>Nội dung luyện tập</h2>
                  <p>
                    Hiển thị <strong>{paginatedPractices.length}</strong> /{" "}
                    <strong>{filteredPractices.length}</strong> nội dung
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Tìm IELTS Reading, TOEIC ETS..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {paginatedPractices.length > 0 ? (
                <div className={styles.practiceGrid}>
                  {paginatedPractices.map((item) => (
                    <PracticeCard practice={item} key={item.id} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <h3>Không tìm thấy nội dung phù hợp</h3>
                  <p>Thử đổi danh mục hoặc từ khóa tìm kiếm.</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Trước
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      className={currentPage === index + 1 ? styles.activePage : ""}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}