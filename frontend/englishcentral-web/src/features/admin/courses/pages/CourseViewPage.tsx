import { useEffect, useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { toastDanger } from "@/components/ui";
import { adminCourseCategoriesApi, type AdminCourseCategory } from "@/features/admin/course-categories/api/admin-course-categories-api";
import { adminCoursesApi, type AdminCourse } from "@/features/admin/courses/api/admin-courses-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

const formatMoney = (value: number) => new Intl.NumberFormat("en-US").format(value);

export function CourseViewPage() {
  const { recordId } = useParams();
  const [record, setRecord] = useState<AdminCourse | null>(null);
  const [categories, setCategories] = useState<AdminCourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));

  useEffect(() => {
    adminCourseCategoriesApi.getList({ page: 1, pageSize: 1000 })
      .then((result) => setCategories(result.items))
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!recordId) return;
    let isMounted = true;
    adminCoursesApi.getById(recordId)
      .then((result) => { if (isMounted) setRecord(result); })
      .catch((error) => toastDanger(getAuthErrorMessage(error)))
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [recordId]);

  const field = (label: string, value: string | number) => <label className={styles.field}><span>{label}</span><input readOnly value={value} /></label>;
  const categoryName = categories.find((category) => category.id === record?.courseCategoryId)?.name ?? (record ? `#${record.courseCategoryId}` : "");

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div><Link className={styles.backLink} to="/admin/courses"><ArrowLeft size={16} /> Quay lại danh sách</Link><h1>Chi tiết khóa học</h1></div>
        {record && <Link className={listStyles.createButton} to={`/admin/courses/${record.id}/edit`}><Edit3 size={16} /> Chỉnh sửa</Link>}
      </section>
      <section className={styles.panel}>
        <div className={styles.panelHeader}><div><h2>Thông tin khóa học</h2><p>Xem cấu hình khóa học đang lưu trong hệ thống.</p></div></div>
        {isLoading ? <p className={styles.accountState}>Đang tải thông tin khóa học...</p> : record ? (
          <div className={styles.formGrid}>
            {field("Danh mục", categoryName)}
            {field("Mã khóa học", record.code)}
            {field("Tên khóa học", record.name)}
            {field("Cấp độ", record.level || "Chưa cập nhật")}
            {field("Số tuần", record.durationWeeks)}
            {field("Tổng số buổi", record.totalSessions)}
            {field("Thời lượng mỗi buổi", `${record.sessionDurationMinutes} phút`)}
            {field("Số học viên tối đa", record.maxStudents)}
            {field("Thứ tự hiển thị", record.displayOrder)}
            {field("Học phí", `${formatMoney(record.tuitionFee)} đ`)}
            {field("Xuất bản", record.isPublished ? "Đã xuất bản" : "Chưa xuất bản")}
            {field("Trạng thái", record.isActive ? "Hoạt động" : "Ngừng hoạt động")}
            <label className={`${styles.field} ${styles.notesField}`}><span>Mô tả</span><textarea readOnly rows={5} value={record.description ?? "Chưa cập nhật"} /></label>
          </div>
        ) : <p className={styles.accountState}>Không tìm thấy khóa học.</p>}
      </section>
    </div>
  );
}
