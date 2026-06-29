import { useEffect, useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { toastDanger } from "@/components/ui";
import {
  adminCourseCategoriesApi,
  type AdminCourseCategory,
} from "@/features/admin/course-categories/api/admin-course-categories-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

export function CourseCategoryViewPage() {
  const { recordId } = useParams();
  const [record, setRecord] = useState<AdminCourseCategory | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));

  useEffect(() => {
    if (!recordId) {
      return;
    }

    let isMounted = true;

    adminCourseCategoriesApi
      .getById(recordId)
      .then((result) => {
        if (isMounted) {
          setRecord(result);
        }
      })
      .catch((error) => {
        if (isMounted) {
          toastDanger(getAuthErrorMessage(error));
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
  }, [recordId]);

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to="/admin/course-categories">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>Chi tiết danh mục khóa học</h1>
        </div>

        {record && (
          <Link
            className={listStyles.createButton}
            to={`/admin/course-categories/${record.id}/edit`}
          >
            <Edit3 aria-hidden="true" size={16} />
            Chỉnh sửa
          </Link>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Thông tin danh mục</h2>
            <p>Xem thông tin phân loại khóa học đang lưu trong hệ thống.</p>
          </div>
        </div>

        {isLoading ? (
          <p className={styles.accountState}>Đang tải thông tin danh mục...</p>
        ) : record ? (
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Mã danh mục</span>
              <input readOnly value={record.code} />
            </label>

            <label className={styles.field}>
              <span>Tên danh mục</span>
              <input readOnly value={record.name} />
            </label>

            <label className={styles.field}>
              <span>Trạng thái</span>
              <input readOnly value={record.isActive ? "Hoạt động" : "Ngừng hoạt động"} />
            </label>

            <label className={`${styles.field} ${styles.notesField}`}>
              <span>Mô tả</span>
              <textarea readOnly rows={5} value={record.description ?? "Chưa cập nhật"} />
            </label>
          </div>
        ) : (
          <p className={styles.accountState}>Không tìm thấy danh mục khóa học.</p>
        )}
      </section>
    </div>
  );
}
