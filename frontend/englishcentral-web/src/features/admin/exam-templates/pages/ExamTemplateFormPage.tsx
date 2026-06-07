import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorMessage, toastDanger, toastSuccess } from "@/components/ui";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";
import {
  adminExamTemplatesApi,
  type AdminExamType,
  type ExamTemplatePayload,
} from "../api/admin-exam-templates-api";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";

type Props = { mode: "create" | "edit" };
type FormState = {
  examTypeId: string;
  code: string;
  name: string;
  durationMinutes: string;
  totalScore: string;
  description: string;
  isActive: boolean;
};
type FormErrors = Partial<Record<keyof FormState, string>>;

const defaultForm: FormState = {
  examTypeId: "",
  code: "IELTS_READING",
  name: "IELTS Academic Reading",
  durationMinutes: "60",
  totalScore: "40",
  description: "",
  isActive: true,
};

const toPositiveNumber = (value: string) => Number(value.replace(/[^\d.]/g, "")) || 0;
const isIeltsType = (type: AdminExamType) =>
  `${type.code} ${type.name} ${type.family}`.toLowerCase().includes("ielts");

export function ExamTemplateFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const isEditMode = mode === "edit";
  const [form, setForm] = useState<FormState>(defaultForm);
  const [examTypes, setExamTypes] = useState<AdminExamType[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const typesResult = await adminExamTemplatesApi.getTypes({ pageSize: 100, isActive: true });
        if (!isMounted) return;
        setExamTypes(typesResult.items);
        const ieltsType = typesResult.items.find(isIeltsType);
        setForm((current) => ({
          ...current,
          examTypeId: current.examTypeId || (ieltsType?.id ? String(ieltsType.id) : ""),
        }));

        if (isEditMode && recordId) {
          const record = await adminExamTemplatesApi.getById(recordId);
          if (!isMounted) return;
          setForm({
            examTypeId: String(record.examTypeId),
            code: record.code,
            name: record.name,
            durationMinutes: String(record.durationMinutes ?? 60),
            totalScore: String(record.totalScore ?? 40),
            description: record.description ?? "",
            isActive: record.isActive,
          });
        }
      } catch (error) {
        toastDanger(getAuthErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [isEditMode, recordId]);

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.examTypeId && examTypes.length > 0) nextErrors.examTypeId = "Vui lòng chọn Exam Type.";
    if (!form.code.trim()) nextErrors.code = "Vui lòng nhập code.";
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập name.";
    if (toPositiveNumber(form.durationMinutes) <= 0) nextErrors.durationMinutes = "Duration phải lớn hơn 0.";
    if (toPositiveNumber(form.totalScore) <= 0) nextErrors.totalScore = "Total Score phải lớn hơn 0.";
    if (form.description.trim().length > 2000) nextErrors.description = "Mô tả không được vượt quá 2000 ký tự.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resolveExamTypeId = async () => {
    if (form.examTypeId) return Number(form.examTypeId);

    const ieltsType = examTypes.find(isIeltsType);
    if (ieltsType) return ieltsType.id;

    const createdType = await adminExamTemplatesApi.createType({
      code: "IELTS",
      name: "IELTS",
      family: "IELTS",
      description: "IELTS exam family",
      isActive: true,
    });
    return createdType.id;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const examTypeId = await resolveExamTypeId();
      const payload: ExamTemplatePayload = {
        examTypeId,
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        durationMinutes: toPositiveNumber(form.durationMinutes),
        totalScore: toPositiveNumber(form.totalScore),
        isActive: form.isActive,
      };

      if (isEditMode && recordId) {
        await adminExamTemplatesApi.update(recordId, payload);
        toastSuccess("Cập nhật mẫu đề kiểm tra thành công.");
      } else {
        await adminExamTemplatesApi.create(payload);
        toastSuccess("Tạo mẫu đề kiểm tra thành công.");
      }

      navigate("/admin/exams");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to="/admin/exams">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>{isEditMode ? "Chỉnh sửa mẫu đề kiểm tra" : "Tạo mẫu đề kiểm tra"}</h1>
        </div>
      </section>

      <form className={styles.panel} onSubmit={handleSubmit}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Thông tin Exam Template</h2>
            <p>Thiết lập loại đề, code, tên đề, thời lượng và tổng điểm.</p>
          </div>
        </div>

        {isLoading ? (
          <p className={styles.accountState}>Đang tải thông tin mẫu đề...</p>
        ) : (
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Exam Type <em className={styles.requiredMark}>*</em></span>
              <select
                value={form.examTypeId}
                onChange={(event) => updateField("examTypeId", event.target.value)}
              >
                {examTypes.length === 0 && <option value="">IELTS - tạo mới khi lưu</option>}
                {examTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name || type.code}
                  </option>
                ))}
              </select>
              <ErrorMessage message={errors.examTypeId} />
            </label>

            <label className={styles.field}>
              <span>Code <em className={styles.requiredMark}>*</em></span>
              <input value={form.code} onChange={(event) => updateField("code", event.target.value)} />
              <ErrorMessage message={errors.code} />
            </label>

            <label className={styles.field}>
              <span>Name <em className={styles.requiredMark}>*</em></span>
              <input value={form.name} onChange={(event) => updateField("name", event.target.value)} />
              <ErrorMessage message={errors.name} />
            </label>

            <label className={styles.field}>
              <span>Duration <em className={styles.requiredMark}>*</em></span>
              <input
                inputMode="numeric"
                value={form.durationMinutes}
                onChange={(event) => updateField("durationMinutes", event.target.value.replace(/[^\d]/g, ""))}
              />
              <ErrorMessage message={errors.durationMinutes} />
            </label>

            <label className={styles.field}>
              <span>Total Score <em className={styles.requiredMark}>*</em></span>
              <input
                inputMode="decimal"
                value={form.totalScore}
                onChange={(event) => updateField("totalScore", event.target.value.replace(/[^\d.]/g, ""))}
              />
              <ErrorMessage message={errors.totalScore} />
            </label>

            <label className={styles.field}>
              <span>Active <em className={styles.requiredMark}>*</em></span>
              <select
                value={String(form.isActive)}
                onChange={(event) => updateField("isActive", event.target.value === "true")}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>

            <label className={`${styles.field} ${styles.notesField}`}>
              <span>Mô tả</span>
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
              <ErrorMessage message={errors.description} />
            </label>
          </div>
        )}

        <div className={styles.formActions}>
          <button className={styles.secondaryButton} type="button" onClick={() => navigate("/admin/exams")}>
            Hủy
          </button>
          <button disabled={isLoading || isSubmitting} type="submit">
            <Save aria-hidden="true" size={16} />
            {isSubmitting ? "Đang lưu..." : "Lưu mẫu đề"}
          </button>
        </div>
      </form>
    </div>
  );
}
