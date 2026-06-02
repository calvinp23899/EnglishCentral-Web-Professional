import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorMessage, toastDanger, toastSuccess } from "@/components/ui";
import {
  adminCourseCategoriesApi,
  type AdminCourseCategory,
} from "@/features/admin/course-categories/api/admin-course-categories-api";
import { adminCoursesApi, type CourseFormPayload } from "@/features/admin/courses/api/admin-courses-api";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type Props = { mode: "create" | "edit" };
type FormState = {
  courseCategoryId: string;
  code: string;
  name: string;
  description: string;
  level: string;
  durationWeeks: string;
  totalSessions: string;
  sessionDurationMinutes: string;
  tuitionFee: string;
  maxStudents: string;
  displayOrder: string;
  isPublished: boolean;
  isActive: boolean;
};
type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  courseCategoryId: "",
  code: "",
  name: "",
  description: "",
  level: "",
  durationWeeks: "0",
  totalSessions: "0",
  sessionDurationMinutes: "0",
  tuitionFee: "0",
  maxStudents: "0",
  displayOrder: "0",
  isPublished: false,
  isActive: true,
};
const formatMoneyInput = (value: string | number) =>
  new Intl.NumberFormat("en-US").format(Number(String(value).replace(/,/g, "")) || 0);
const toNumber = (value: string) => Number(value.replace(/,/g, ""));

export function CourseFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const isEditMode = mode === "edit";
  const [categories, setCategories] = useState<AdminCourseCategory[]>([]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    adminCourseCategoriesApi
      .getList({ page: 1, pageSize: 1000, sortBy: "name", isDescending: false })
      .then((result) => setCategories(result.items))
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!isEditMode || !recordId) return;
    let isMounted = true;
    adminCoursesApi.getById(recordId)
      .then((record) => {
        if (!isMounted) return;
        setForm({
          courseCategoryId: String(record.courseCategoryId),
          code: record.code,
          name: record.name,
          description: record.description ?? "",
          level: record.level ?? "",
          durationWeeks: String(record.durationWeeks),
          totalSessions: String(record.totalSessions),
          sessionDurationMinutes: String(record.sessionDurationMinutes),
          tuitionFee: formatMoneyInput(record.tuitionFee),
          maxStudents: String(record.maxStudents),
          displayOrder: String(record.displayOrder),
          isPublished: record.isPublished,
          isActive: record.isActive,
        });
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)))
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [isEditMode, recordId]);

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const nameMaxLength = isEditMode ? 255 : 50;
    const descriptionMaxLength = isEditMode ? 2000 : 500;
    if (!form.courseCategoryId) nextErrors.courseCategoryId = "Vui lòng chọn danh mục khóa học.";
    if (!form.code.trim()) nextErrors.code = "Vui lòng nhập mã khóa học.";
    else if (form.code.trim().length > 50) nextErrors.code = "Mã khóa học không được vượt quá 50 ký tự.";
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên khóa học.";
    else if (form.name.trim().length > nameMaxLength) nextErrors.name = `Tên khóa học không được vượt quá ${nameMaxLength} ký tự.`;
    if (form.description.trim().length > descriptionMaxLength) nextErrors.description = `Mô tả không được vượt quá ${descriptionMaxLength} ký tự.`;
    if (form.level.trim().length > 100) nextErrors.level = "Cấp độ không được vượt quá 100 ký tự.";
    (["durationWeeks", "totalSessions", "sessionDurationMinutes", "tuitionFee", "maxStudents"] as const).forEach((key) => {
      if (toNumber(form[key]) < 0) nextErrors[key] = "Giá trị không được nhỏ hơn 0.";
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    const payload: CourseFormPayload = {
      courseCategoryId: Number(form.courseCategoryId),
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      level: form.level.trim() || null,
      durationWeeks: Number(form.durationWeeks),
      totalSessions: Number(form.totalSessions),
      sessionDurationMinutes: Number(form.sessionDurationMinutes),
      tuitionFee: toNumber(form.tuitionFee),
      maxStudents: Number(form.maxStudents),
      displayOrder: Number(form.displayOrder),
      isPublished: form.isPublished,
      isActive: form.isActive,
    };
    setIsSubmitting(true);
    try {
      if (isEditMode && recordId) {
        await adminCoursesApi.update(recordId, { ...payload, id: Number(recordId) });
        toastSuccess("Cập nhật khóa học thành công.");
      } else {
        await adminCoursesApi.create(payload);
        toastSuccess("Tạo khóa học thành công.");
      }
      navigate("/admin/courses");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const numberField = (key: keyof Pick<FormState, "durationWeeks" | "totalSessions" | "sessionDurationMinutes" | "maxStudents" | "displayOrder">, label: string) => (
    <label className={styles.field}>
      <span>{label} <em className={styles.requiredMark}>*</em></span>
      <input min={0} type="number" value={form[key]} onChange={(event) => updateField(key, event.target.value)} />
      <ErrorMessage message={errors[key]} />
    </label>
  );

  return (
    <div className={styles.page}>
      <section className={styles.header}><div>
        <Link className={styles.backLink} to="/admin/courses"><ArrowLeft size={16} /> Quay lại danh sách</Link>
        <h1>{isEditMode ? "Chỉnh sửa khóa học" : "Tạo khóa học"}</h1>
      </div></section>
      <form className={styles.panel} onSubmit={handleSubmit}>
        <div className={styles.panelHeader}><div><h2>Thông tin khóa học</h2><p>Nhập thông tin chi tiết dùng để mở bán và tổ chức khóa học.</p></div></div>
        {isLoading ? <p className={styles.accountState}>Đang tải thông tin khóa học...</p> : (
          <div className={styles.formGrid}>
            <label className={styles.field}><span>Danh mục <em className={styles.requiredMark}>*</em></span><select value={form.courseCategoryId} onChange={(event) => updateField("courseCategoryId", event.target.value)}><option value="">Chọn danh mục</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><ErrorMessage message={errors.courseCategoryId} /></label>
            <label className={styles.field}><span>Mã khóa học <em className={styles.requiredMark}>*</em></span><input value={form.code} onChange={(event) => updateField("code", event.target.value)} /><ErrorMessage message={errors.code} /></label>
            <label className={styles.field}><span>Tên khóa học <em className={styles.requiredMark}>*</em></span><input value={form.name} onChange={(event) => updateField("name", event.target.value)} /><ErrorMessage message={errors.name} /></label>
            <label className={styles.field}><span>Cấp độ</span><input value={form.level} onChange={(event) => updateField("level", event.target.value)} /><ErrorMessage message={errors.level} /></label>
            {numberField("durationWeeks", "Số tuần")}
            {numberField("totalSessions", "Tổng số buổi")}
            {numberField("sessionDurationMinutes", "Thời lượng mỗi buổi (phút)")}
            {numberField("maxStudents", "Số học viên tối đa")}
            {numberField("displayOrder", "Thứ tự hiển thị")}
            <label className={styles.field}><span>Học phí <em className={styles.requiredMark}>*</em></span><input inputMode="numeric" value={form.tuitionFee} onChange={(event) => updateField("tuitionFee", formatMoneyInput(event.target.value.replace(/[^\d]/g, "")))} /><ErrorMessage message={errors.tuitionFee} /></label>
            <label className={styles.field}><span>Xuất bản <em className={styles.requiredMark}>*</em></span><select value={String(form.isPublished)} onChange={(event) => updateField("isPublished", event.target.value === "true")}><option value="false">Chưa xuất bản</option><option value="true">Đã xuất bản</option></select></label>
            <label className={styles.field}><span>Trạng thái <em className={styles.requiredMark}>*</em></span><select value={String(form.isActive)} onChange={(event) => updateField("isActive", event.target.value === "true")}><option value="true">Hoạt động</option><option value="false">Ngừng hoạt động</option></select></label>
            <label className={`${styles.field} ${styles.notesField}`}><span>Mô tả</span><textarea rows={5} value={form.description} onChange={(event) => updateField("description", event.target.value)} /><ErrorMessage message={errors.description} /></label>
          </div>
        )}
        <div className={styles.formActions}><button className={styles.secondaryButton} type="button" onClick={() => navigate("/admin/courses")}>Hủy</button><button disabled={isLoading || isSubmitting} type="submit"><Save size={16} />{isSubmitting ? "Đang lưu..." : "Lưu khóa học"}</button></div>
      </form>
    </div>
  );
}
