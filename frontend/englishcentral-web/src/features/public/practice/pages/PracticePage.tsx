import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui";
import { PracticeCard } from "../components/PracticeCard/PracticeCard";
import {
  practiceMenus,
  type PublicPractice,
  type PracticeCategory,
  type PracticeSkill,
} from "../data/mockPractice";
import { publicPracticeApi } from "../api/public-practice-api";

import styles from "./PracticePage.module.scss";

const PAGE_SIZE = 20;

export function PracticePage() {
  const [practices, setPractices] = useState<PublicPractice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] =
    useState<PracticeCategory | "all">("ielts");
  const [selectedSkill, setSelectedSkill] =
    useState<PracticeSkill | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    if (selectedCategory !== "ielts") {
      setPractices([]);
      setTotalItems(0);
      setTotalPages(1);
      setIsLoading(false);

      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    publicPracticeApi
      .getPublishedIeltsPractices({
        keyword: searchTerm,
        page: currentPage,
        pageSize: PAGE_SIZE,
      })
      .then((result) => {
        if (isMounted) {
          setPractices(result.items);
          setTotalItems(result.totalItems);
          setTotalPages(Math.max(result.totalPages, 1));
        }
      })
      .catch(() => {
        if (isMounted) {
          setPractices([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, searchTerm, selectedCategory]);

  const filteredPractices = useMemo(() => {
    return practices.filter((item) => {
      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchSkill =
        selectedSkill === "all" || item.skill === selectedSkill;

      return matchCategory && matchSkill;
    });
  }, [practices, selectedCategory, selectedSkill]);

  const totalDisplayItems =
    selectedCategory === "ielts" && selectedSkill === "all"
      ? totalItems
      : filteredPractices.length;

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
            Cập nhật liên tục các bài kiểm tra chuyên sâu về IELTS, TOEIC, kỹ
            năng học tập và giáo dục.
          </h1>
        </Container>
      </section>

      <section className={styles.content}>
        <div className={styles.contentShell}>
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
                    Hiển thị <strong>{filteredPractices.length}</strong> /{" "}
                    <strong>{totalDisplayItems}</strong> nội dung
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Tìm IELTS Reading, TOEIC ETS..."
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {isLoading ? (
                <div className={styles.emptyState}>
                  <h3>Đang tải nội dung IELTS...</h3>
                  <p>Hệ thống đang lấy các bài IELTS đã được publish.</p>
                </div>
              ) : filteredPractices.length > 0 ? (
                <div className={styles.practiceGrid}>
                  {filteredPractices.map((item) => (
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

                  <span>
                    Trang <strong>{currentPage}</strong> / {totalPages}
                  </span>

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
        </div>
      </section>
    </div>
  );
}
