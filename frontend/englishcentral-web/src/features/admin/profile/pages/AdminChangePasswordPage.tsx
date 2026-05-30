import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Save } from "lucide-react";

import { ErrorMessage } from "@/components/ui";
import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader/AdminPageHeader";

import styles from "./AdminChangePasswordPage.module.scss";

type PasswordForm = {
  newPassword: string;
  confirmPassword: string;
};

type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;
type PasswordField = keyof PasswordForm;

const initialForm: PasswordForm = {
  newPassword: "",
  confirmPassword: "",
};

const passwordFields: Array<{
  hint?: string;
  key: PasswordField;
  label: string;
}> = [
  {
    hint: "Mật khẩu mới cần tối thiểu 6 ký tự.",
    key: "newPassword",
    label: "Mật khẩu mới",
  },
  {
    key: "confirmPassword",
    label: "Xác nhận mật khẩu mới",
  },
];

export function AdminChangePasswordPage() {
  const [formValue, setFormValue] = useState<PasswordForm>(initialForm);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [visibleFields, setVisibleFields] = useState<Record<PasswordField, boolean>>({
    confirmPassword: false,
    newPassword: false,
  });
  const [formStatus, setFormStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: PasswordField, value: string) => {
    setFormValue((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setFormStatus("");
  };

  const validateForm = () => {
    const nextErrors: PasswordErrors = {};

    if (formValue.newPassword.length < 6) {
      nextErrors.newPassword = "Mật khẩu mới cần tối thiểu 6 ký tự.";
    }

    if (!formValue.confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới.";
    } else if (formValue.confirmPassword !== formValue.newPassword) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    return nextErrors;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setFormStatus("API đổi mật khẩu chưa được tích hợp từ BE.");
    setIsSubmitting(false);
  };

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Đổi mật khẩu"
        description="Cập nhật mật khẩu đăng nhập cho tài khoản quản trị của bạn."
      />

      <form className={styles.passwordPanel} onSubmit={handleSubmit}>
        <div className={styles.panelHeader}>
          <span>
            <LockKeyhole aria-hidden="true" size={20} />
          </span>
          <div>
            <h2>Bảo mật tài khoản</h2>
            <p>Nhập mật khẩu mới để thay đổi thông tin đăng nhập.</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          {passwordFields.map((field) => {
            const isVisible = visibleFields[field.key];
            const errorId = `admin-change-password-${field.key}-error`;

            return (
              <label className={styles.field} key={field.key}>
                <span>{field.label}</span>
                <span className={styles.passwordInput}>
                  <LockKeyhole
                    aria-hidden="true"
                    className={styles.passwordIcon}
                    size={16}
                  />
                  <input
                    aria-describedby={errors[field.key] ? errorId : undefined}
                    aria-invalid={Boolean(errors[field.key])}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    type={isVisible ? "text" : "password"}
                    value={formValue[field.key]}
                    onChange={(event) => updateField(field.key, event.target.value)}
                  />
                  <button
                    className={styles.toggleButton}
                    type="button"
                    disabled={isSubmitting}
                    aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    title={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() =>
                      setVisibleFields((currentValue) => ({
                        ...currentValue,
                        [field.key]: !isVisible,
                      }))
                    }
                  >
                    {isVisible ? (
                      <EyeOff aria-hidden="true" size={17} />
                    ) : (
                      <Eye aria-hidden="true" size={17} />
                    )}
                  </button>
                </span>
                {field.hint && <p className={styles.hint}>{field.hint}</p>}
                <ErrorMessage id={errorId} message={errors[field.key]} />
              </label>
            );
          })}

          {formStatus && <p className={styles.formStatus}>{formStatus}</p>}
        </div>

        <div className={styles.formActions}>
          <button
            className={styles.secondaryButton}
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setFormValue(initialForm);
              setErrors({});
              setFormStatus("");
            }}
          >
            Hủy
          </button>
          <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
            <Save aria-hidden="true" size={17} />
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
