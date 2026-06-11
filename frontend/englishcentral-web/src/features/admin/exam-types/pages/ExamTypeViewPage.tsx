import { useEffect, useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { toastDanger } from "@/components/ui";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import {
  adminExamTypesApi,
  type AdminExamType,
} from "../api/admin-exam-types-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";

const statusLabel = (isActive?: boolean) => (isActive ? "Active" : "Inactive");

export function ExamTypeViewPage() {
  const { recordId } = useParams();
  const [record, setRecord] = useState<AdminExamType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!recordId) return;

    let isMounted = true;

    const loadRecord = async () => {
      setIsLoading(true);
      try {
        const result = await adminExamTypesApi.getById(recordId);
        if (isMounted) setRecord(result);
      } catch (error) {
        toastDanger(getAuthErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadRecord();

    return () => {
      isMounted = false;
    };
  }, [recordId]);

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to="/admin/exam-types">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>Chi tiết dạng bài kiểm tra</h1>
        </div>
        {record && (
          <Link className={listStyles.createButton} to={`/admin/exam-types/${record.id}/edit`}>
            <Edit3 aria-hidden="true" size={17} />
            Chỉnh sửa
          </Link>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Thông tin dạng bài</h2>
            <p>Xem cấu hình Exam Type đang lưu trong hệ thống.</p>
          </div>
        </div>

        {isLoading ? (
          <p className={styles.accountState}>Đang tải thông tin dạng bài kiểm tra...</p>
        ) : !record ? (
          <p className={styles.accountState}>Không tìm thấy dạng bài kiểm tra.</p>
        ) : (
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Code</span>
              <input readOnly value={record.code} />
            </label>
            <label className={styles.field}>
              <span>Name</span>
              <input readOnly value={record.name} />
            </label>
            <label className={styles.field}>
              <span>Family</span>
              <input readOnly value={String(record.family)} />
            </label>
            <label className={styles.field}>
              <span>Trạng thái</span>
              <input readOnly value={statusLabel(record.isActive)} />
            </label>
            <label className={`${styles.field} ${styles.notesField}`}>
              <span>Mô tả</span>
              <textarea readOnly rows={5} value={record.description || "Không có mô tả"} />
            </label>
          </div>
        )}
      </section>
    </div>
  );
}
