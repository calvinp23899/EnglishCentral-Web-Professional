import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorMessage, toastDanger, toastSuccess } from "@/components/ui";
import {
  adminMetadataApi,
  type MetadataOption,
} from "@/features/admin/shared/api/admin-metadata-api";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import {
  adminExamTypesApi,
  type ExamTypePayload,
} from "../api/admin-exam-types-api";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";

type Props = { mode: "create" | "edit" };

type FormState = {
  code: string;
  description: string;
  family: string;
  isActive: boolean;
  name: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const defaultForm: FormState = {
  code: "",
  description: "",
  family: "",
  isActive: true,
  name: "",
};

export function ExamTypeFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const isEditMode = mode === "edit";
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [familyOptions, setFamilyOptions] = useState<MetadataOption[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadFamilyOptions = async () => {
      try {
        const options = await adminMetadataApi.getExamFamilyOptions();
        if (!isMounted) return;
        setFamilyOptions(options);
        setForm((current) => ({
          ...current,
          family: current.family || options[0]?.value || "",
        }));
      } catch (error) {
        if (isMounted) toastDanger(getAuthErrorMessage(error));
      }
    };

    void loadFamilyOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditMode || !recordId) return;

    let isMounted = true;

    const loadRecord = async () => {
      setIsLoading(true);
      try {
        const record = await adminExamTypesApi.getById(recordId);
        if (!isMounted) return;

        setForm({
          code: record.code ?? "",
          description: record.description ?? "",
          family: String(record.family ?? ""),
          isActive: record.isActive,
          name: record.name ?? "",
        });
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
  }, [isEditMode, recordId]);

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.code.trim()) nextErrors.code = "Vui lòng nhập code.";
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập name.";
    if (!form.family.trim()) nextErrors.family = "Vui lòng nhập family.";
    if (form.description.trim().length > 2000) {
      nextErrors.description = "Mô tả không được vượt quá 2000 ký tự.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;

    const payload: ExamTypePayload = {
      code: form.code.trim(),
      name: form.name.trim(),
      family: form.family.trim(),
      description: form.description.trim() || null,
      isActive: form.isActive,
    };

    setIsSubmitting(true);
    try {
      if (isEditMode && recordId) {
        await adminExamTypesApi.update(recordId, payload);
        toastSuccess("Cập nhật dạng bài kiểm tra thành công.");
      } else {
        await adminExamTypesApi.create(payload);
        toastSuccess("Tạo dạng bài kiểm tra thành công.");
      }

      navigate("/admin/exam-types");
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
          <Link className={styles.backLink} to="/admin/exam-types">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>{isEditMode ? "Chỉnh sửa dạng bài kiểm tra" : "Tạo dạng bài kiểm tra"}</h1>
        </div>
      </section>

      <form className={styles.panel} onSubmit={handleSubmit}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Thông tin dạng bài kiểm tra</h2>
            <p>Thiết lập code, name, family và trạng thái để dùng cho Exam Templates và đề thi.</p>
          </div>
        </div>

        {isLoading ? (
          <p className={styles.accountState}>Đang tải thông tin dạng bài kiểm tra...</p>
        ) : (
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Code <em className={styles.requiredMark}>*</em></span>
              <input
                placeholder="IELTS_READING"
                value={form.code}
                onChange={(event) => updateField("code", event.target.value)}
              />
              <ErrorMessage message={errors.code} />
            </label>

            <label className={styles.field}>
              <span>Name <em className={styles.requiredMark}>*</em></span>
              <input
                placeholder="IELTS Academic Reading"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
              <ErrorMessage message={errors.name} />
            </label>

            <label className={styles.field}>
              <span>Family <em className={styles.requiredMark}>*</em></span>
              <select
                value={form.family}
                onChange={(event) => updateField("family", event.target.value)}
              >
                <option value="">Chọn family</option>
                {familyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
              <ErrorMessage message={errors.family} />
            </label>

            <label className={styles.field}>
              <span>Trạng thái <em className={styles.requiredMark}>*</em></span>
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
                placeholder="Mô tả mục đích sử dụng của dạng bài kiểm tra"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
              <ErrorMessage message={errors.description} />
            </label>
          </div>
        )}

        <div className={styles.formActions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => navigate("/admin/exam-types")}
          >
            Hủy
          </button>
          <button disabled={isLoading || isSubmitting} type="submit">
            <Save aria-hidden="true" size={16} />
            {isSubmitting ? "Đang lưu..." : "Lưu dạng bài"}
          </button>
        </div>
      </form>
    </div>
  );
}
