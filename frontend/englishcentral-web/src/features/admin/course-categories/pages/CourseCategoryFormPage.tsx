import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorMessage, toastDanger, toastSuccess } from "@/components/ui";
import {
  adminCourseCategoriesApi,
  type CourseCategoryFormPayload,
} from "@/features/admin/course-categories/api/admin-course-categories-api";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type Props = {
  mode: "create" | "edit";
};

type FormState = {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  code: "",
  name: "",
  description: "",
  isActive: true,
};

export function CourseCategoryFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const isEditMode = mode === "edit";
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode || !recordId) {
      return;
    }

    let isMounted = true;

    adminCourseCategoriesApi
      .getById(recordId)
      .then((record) => {
        if (isMounted) {
          setForm({
            code: record.code,
            name: record.name,
            description: record.description ?? "",
            isActive: record.isActive,
          });
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
  }, [isEditMode, recordId]);

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const nameMaxLength = isEditMode ? 255 : 20;
    const descriptionMaxLength = isEditMode ? 1000 : 250;

    if (isEditMode && !form.code.trim()) {
      nextErrors.code = "Vui lòng nhập mã danh mục.";
    } else if (form.code.trim().length > 50) {
      nextErrors.code = "Mã danh mục không được vượt quá 50 ký tự.";
    }

    if (!form.name.trim()) {
      nextErrors.name = "Vui lòng nhập tên danh mục.";
    } else if (form.name.trim().length > nameMaxLength) {
      nextErrors.name = `Tên danh mục không được vượt quá ${nameMaxLength} ký tự.`;
    }

    if (form.description.trim().length > descriptionMaxLength) {
      nextErrors.description = `Mô tả không được vượt quá ${descriptionMaxLength} ký tự.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate() || isSubmitting) {
      return;
    }

    const payload: CourseCategoryFormPayload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      isActive: form.isActive,
    };

    setIsSubmitting(true);

    try {
      if (isEditMode && recordId) {
        await adminCourseCategoriesApi.update(recordId, {
          ...payload,
          id: Number(recordId),
          code: form.code.trim(),
        });
        toastSuccess("Cập nhật danh mục khóa học thành công.");
      } else {
        await adminCourseCategoriesApi.create(payload);
        toastSuccess("Tạo danh mục khóa học thành công.");
      }

      navigate("/admin/course-categories");
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
          <Link className={styles.backLink} to="/admin/course-categories">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>{isEditMode ? "Chỉnh sửa danh mục khóa học" : "Tạo danh mục khóa học"}</h1>
        </div>
      </section>

      <form className={styles.panel} onSubmit={handleSubmit}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Thông tin danh mục</h2>
            <p>
              {isEditMode
                ? "Cập nhật thông tin phân loại khóa học."
                : "Nhập thông tin phân loại khóa học mới. Mã danh mục sẽ được hệ thống tự tạo."}
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className={styles.accountState}>Đang tải thông tin danh mục...</p>
        ) : (
          <div className={styles.formGrid}>
            {isEditMode && (
              <label className={styles.field}>
                <span>Mã danh mục <em className={styles.requiredMark}>*</em></span>
                <input
                  aria-describedby="course-category-code-error"
                  value={form.code}
                  onChange={(event) => updateField("code", event.target.value)}
                />
                <ErrorMessage id="course-category-code-error" message={errors.code} />
              </label>
            )}

            <label className={styles.field}>
              <span>Tên danh mục <em className={styles.requiredMark}>*</em></span>
              <input
                aria-describedby="course-category-name-error"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
              <ErrorMessage id="course-category-name-error" message={errors.name} />
            </label>

            <label className={styles.field}>
              <span>Trạng thái <em className={styles.requiredMark}>*</em></span>
              <select
                value={String(form.isActive)}
                onChange={(event) => updateField("isActive", event.target.value === "true")}
              >
                <option value="true">Hoạt động</option>
                <option value="false">Ngừng hoạt động</option>
              </select>
            </label>

            <label className={`${styles.field} ${styles.notesField}`}>
              <span>Mô tả</span>
              <textarea
                aria-describedby="course-category-description-error"
                rows={5}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
              <ErrorMessage
                id="course-category-description-error"
                message={errors.description}
              />
            </label>
          </div>
        )}

        <div className={styles.formActions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => navigate("/admin/course-categories")}
          >
            Hủy
          </button>
          <button type="submit" disabled={isLoading || isSubmitting}>
            <Save aria-hidden="true" size={16} />
            {isSubmitting ? "Đang lưu..." : "Lưu danh mục"}
          </button>
        </div>
      </form>
    </div>
  );
}
