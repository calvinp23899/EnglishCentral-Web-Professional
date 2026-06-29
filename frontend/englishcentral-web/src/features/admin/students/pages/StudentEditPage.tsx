import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Save,
  UserRoundPen,
  WandSparkles,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ConfirmModal,
  ErrorMessage,
  toastDanger,
  toastSuccess,
} from "@/components/ui";
import {
  adminMetadataApi,
  type MetadataOption,
} from "@/features/admin/shared/api/admin-metadata-api";
import {
  adminStudentsApi,
  type AdminStudent,
} from "@/features/admin/students/api/admin-students-api";
import { generatePassword } from "@/features/admin/shared/utils/password";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import styles from "./StudentEditPage.module.scss";

type StudentForm = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phoneNumber: string;
  address: string;
  parentName: string;
  parentPhoneNumber: string;
  enrollmentDate: string;
  status: string;
  notes: string;
};

type StudentEditErrors = Partial<Record<keyof StudentForm, string>>;
type StudentEditTab = "info" | "account";

const emptyForm: StudentForm = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  phoneNumber: "",
  address: "",
  parentName: "",
  parentPhoneNumber: "",
  enrollmentDate: "",
  status: "",
  notes: "",
};

const toInputDate = (value?: string | null) => {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
};

const toStudentForm = (student: AdminStudent): StudentForm => ({
  fullName: student.fullName ?? "",
  dateOfBirth: toInputDate(student.dateOfBirth),
  gender: student.gender === undefined ? "" : String(student.gender),
  email: student.email ?? "",
  phoneNumber: student.phoneNumber ?? "",
  address: student.address ?? "",
  parentName: student.parentName ?? "",
  parentPhoneNumber: student.parentPhoneNumber ?? "",
  enrollmentDate: toInputDate(student.enrollmentDate),
  status: student.status ?? "",
  notes: student.notes ?? "",
});

const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

function StudentEditSkeleton() {
  return (
    <>
      <div className={styles.formGrid}>
        {Array.from({ length: 9 }).map((_, index) => (
          <label className={styles.field} key={`student-edit-skeleton-${index}`}>
            <Skeleton height={14} width={index % 2 === 0 ? 130 : 90} />
            <Skeleton borderRadius={8} height={44} />
          </label>
        ))}
        <label className={`${styles.field} ${styles.notesField}`}>
          <Skeleton height={14} width={70} />
          <Skeleton borderRadius={8} height={110} />
        </label>
      </div>
      <div className={styles.formActions}>
        <Skeleton borderRadius={8} height={40} width={76} />
        <Skeleton borderRadius={8} height={40} width={138} />
      </div>
    </>
  );
}

export function StudentEditPage() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [student, setStudent] = useState<AdminStudent | null>(null);
  const [formValue, setFormValue] = useState<StudentForm>(emptyForm);
  const [initialFormValue, setInitialFormValue] = useState<StudentForm>(emptyForm);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errors, setErrors] = useState<StudentEditErrors>({});
  const [newPasswordError, setNewPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState<StudentEditTab>("info");
  const [statusOptions, setStatusOptions] = useState<MetadataOption[]>([]);
  const [genderOptions, setGenderOptions] = useState<MetadataOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!studentId) {
        setErrorMessage("Không tìm thấy mã học viên.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setIsLoadingMetadata(true);
      setErrorMessage("");

      try {
        const [studentResult, statuses, genders] = await Promise.all([
          adminStudentsApi.getById(studentId),
          adminMetadataApi.getStatusOptions(),
          adminMetadataApi.getGenderOptions(),
        ]);

        if (!isMounted) {
          return;
        }

        const nextFormValue = toStudentForm(studentResult);
        setStudent(studentResult);
        setFormValue(nextFormValue);
        setInitialFormValue(nextFormValue);
        setStatusOptions(statuses);
        setGenderOptions(genders);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getAuthErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsLoadingMetadata(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const studentBadge = useMemo(() => {
    if (!student) {
      return null;
    }

    return `${student.studentCode} - ${student.fullName}`;
  }, [student]);

  const hasLinkedAccount = Boolean(student?.account?.accountEmail);

  const handleGeneratePassword = () => {
    setNewPassword(generatePassword());
    setNewPasswordError("");
    setShowNewPassword(true);
  };

  const updateField = <Key extends keyof StudentForm>(
    field: Key,
    value: StudentForm[Key]
  ) => {
    setFormValue((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };

  const validateForm = () => {
    const nextErrors: StudentEditErrors = {};

    if (!formValue.fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ tên học viên.";
    } else if (formValue.fullName.trim().length > 255) {
      nextErrors.fullName = "Họ tên học viên không được quá 255 ký tự.";
    }

    if (formValue.email.trim() && !isValidEmail(formValue.email.trim())) {
      nextErrors.email = "Email không đúng định dạng.";
    } else if (formValue.email.trim().length > 255) {
      nextErrors.email = "Email không được quá 255 ký tự.";
    }

    if (formValue.phoneNumber.trim().length > 20) {
      nextErrors.phoneNumber = "Số điện thoại không được quá 20 ký tự.";
    }

    if (formValue.parentPhoneNumber.trim().length > 20) {
      nextErrors.parentPhoneNumber = "SĐT phụ huynh không được quá 20 ký tự.";
    }

    if (formValue.address.trim().length > 500) {
      nextErrors.address = "Địa chỉ không được quá 500 ký tự.";
    }

    if (
      genderOptions.length > 0 &&
      !genderOptions.some((option) => String(option.value) === String(formValue.gender))
    ) {
      nextErrors.gender = "Giới tính không hợp lệ.";
    }

    if (
      statusOptions.length > 0 &&
      !statusOptions.some((option) => String(option.value) === String(formValue.status))
    ) {
      nextErrors.status = "Trạng thái không hợp lệ.";
    }

    return nextErrors;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm();
    const trimmedNewPassword = newPassword.trim();
    const nextPasswordError =
      hasLinkedAccount && trimmedNewPassword.length > 0 && trimmedNewPassword.length < 6
        ? "Mật khẩu mới cần tối thiểu 6 ký tự."
        : "";
    setErrors(nextErrors);
    setNewPasswordError(nextPasswordError);

    if (Object.keys(nextErrors).length > 0 || nextPasswordError) {
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (isSubmitting) {
      return;
    }

    if (!studentId) {
      return;
    }

    setIsSubmitting(true);

    try {
      await adminStudentsApi.update(studentId, {
        fullName: formValue.fullName.trim(),
        dateOfBirth: formValue.dateOfBirth || null,
        gender: formValue.gender,
        email: formValue.email.trim() || null,
        phoneNumber: formValue.phoneNumber.trim() || null,
        address: formValue.address.trim() || null,
        parentName: formValue.parentName.trim() || null,
        parentPhoneNumber: formValue.parentPhoneNumber.trim() || null,
        enrollmentDate: formValue.enrollmentDate || initialFormValue.enrollmentDate,
        status: formValue.status,
        notes: formValue.notes.trim() || null,
        newPassword: hasLinkedAccount && newPassword.trim() ? newPassword.trim() : null,
      });

      setIsConfirmOpen(false);
      toastSuccess("Lưu thay đổi học viên thành công.");
      navigate("/admin/students");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.page}>
        <section className={styles.header}>
          <div>
            <Link className={styles.backLink} to="/admin/students">
              <ArrowLeft aria-hidden="true" size={16} />
              Quay lại danh sách
            </Link>
            <h1>Chỉnh sửa học viên</h1>
          </div>

          {studentBadge && (
            <div className={styles.studentBadge}>
              <UserRoundPen aria-hidden="true" size={20} />
              <div>
                <strong>{student?.studentCode}</strong>
                <span>{student?.fullName}</span>
              </div>
            </div>
          )}
        </section>

        <form className={styles.formPanel} onSubmit={handleSubmit}>
          <div className={styles.tabs} role="tablist" aria-label="Chỉnh sửa học viên">
            <button
              className={activeTab === "info" ? styles.activeTab : ""}
              type="button"
              role="tab"
              aria-selected={activeTab === "info"}
              onClick={() => setActiveTab("info")}
            >
              Thông tin học viên
            </button>
            <button
              className={activeTab === "account" ? styles.activeTab : ""}
              type="button"
              role="tab"
              aria-selected={activeTab === "account"}
              onClick={() => setActiveTab("account")}
            >
              Tài khoản
            </button>
          </div>

          {isLoading && <StudentEditSkeleton />}

          {!isLoading && errorMessage && (
            <div className={styles.stateBlock}>{errorMessage}</div>
          )}

          {!isLoading && !errorMessage && (
            <>
              {activeTab === "info" && (
                <>
                  <div className={styles.formHeader}>
                    <div>
                      <h2>Thông tin học viên</h2>
                      <p>Cập nhật hồ sơ học viên theo dữ liệu từ hệ thống.</p>
                    </div>
                  </div>
                  <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>
                    Họ tên học viên <em className={styles.requiredMark}>*</em>
                  </span>
                  <input
                    aria-describedby={errors.fullName ? "student-edit-full-name-error" : undefined}
                    aria-invalid={Boolean(errors.fullName)}
                    value={formValue.fullName}
                    disabled={isSubmitting}
                    onChange={(event) => updateField("fullName", event.target.value)}
                  />
                  <ErrorMessage id="student-edit-full-name-error" message={errors.fullName} />
                </label>

                <label className={styles.field}>
                  <span>Ngày sinh</span>
                  <input
                    type="date"
                    value={formValue.dateOfBirth}
                    disabled={isSubmitting}
                    onChange={(event) => updateField("dateOfBirth", event.target.value)}
                  />
                </label>

                <label className={styles.field}>
                  <span>Giới tính</span>
                  <select
                    aria-describedby={errors.gender ? "student-edit-gender-error" : undefined}
                    aria-invalid={Boolean(errors.gender)}
                    value={formValue.gender}
                    disabled={isSubmitting || isLoadingMetadata}
                    onChange={(event) => updateField("gender", event.target.value)}
                  >
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                  <ErrorMessage id="student-edit-gender-error" message={errors.gender} />
                </label>

                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    aria-describedby={errors.email ? "student-edit-email-error" : undefined}
                    aria-invalid={Boolean(errors.email)}
                    type="email"
                    value={formValue.email}
                    disabled={isSubmitting}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                  <ErrorMessage id="student-edit-email-error" message={errors.email} />
                </label>

                <label className={styles.field}>
                  <span>Số điện thoại</span>
                  <input
                    aria-describedby={errors.phoneNumber ? "student-edit-phone-error" : undefined}
                    aria-invalid={Boolean(errors.phoneNumber)}
                    value={formValue.phoneNumber}
                    disabled={isSubmitting}
                    onChange={(event) => updateField("phoneNumber", event.target.value)}
                  />
                  <ErrorMessage id="student-edit-phone-error" message={errors.phoneNumber} />
                </label>

                <label className={styles.field}>
                  <span>Địa chỉ</span>
                  <input
                    aria-describedby={errors.address ? "student-edit-address-error" : undefined}
                    aria-invalid={Boolean(errors.address)}
                    value={formValue.address}
                    disabled={isSubmitting}
                    onChange={(event) => updateField("address", event.target.value)}
                  />
                  <ErrorMessage id="student-edit-address-error" message={errors.address} />
                </label>

                <label className={styles.field}>
                  <span>Họ tên phụ huynh</span>
                  <input
                    value={formValue.parentName}
                    disabled={isSubmitting}
                    onChange={(event) => updateField("parentName", event.target.value)}
                  />
                </label>

                <label className={styles.field}>
                  <span>SĐT phụ huynh</span>
                  <input
                    aria-describedby={
                      errors.parentPhoneNumber ? "student-edit-parent-phone-error" : undefined
                    }
                    aria-invalid={Boolean(errors.parentPhoneNumber)}
                    value={formValue.parentPhoneNumber}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      updateField("parentPhoneNumber", event.target.value)
                    }
                  />
                  <ErrorMessage
                    id="student-edit-parent-phone-error"
                    message={errors.parentPhoneNumber}
                  />
                </label>

                <label className={styles.field}>
                  <span>Trạng thái</span>
                  <select
                    aria-describedby={errors.status ? "student-edit-status-error" : undefined}
                    aria-invalid={Boolean(errors.status)}
                    value={formValue.status}
                    disabled={isSubmitting || isLoadingMetadata}
                    onChange={(event) => updateField("status", event.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                  <ErrorMessage id="student-edit-status-error" message={errors.status} />
                </label>

                <label className={`${styles.field} ${styles.notesField}`}>
                  <span>Ghi chú</span>
                  <textarea
                    rows={5}
                    value={formValue.notes}
                    disabled={isSubmitting}
                    onChange={(event) => updateField("notes", event.target.value)}
                  />
                </label>
                  </div>
                </>
              )}

              {activeTab === "account" && (
                <>
                  <div className={styles.formHeader}>
                    <div>
                      <h2>Tài khoản</h2>
                      <p>Cập nhật thông tin đăng nhập của học viên.</p>
                    </div>
                  </div>

                  {hasLinkedAccount ? (
                    <div className={styles.accountGrid}>
                      <label className={styles.field}>
                        <span>Email</span>
                        <input
                          type="email"
                          value={student?.account?.accountEmail ?? ""}
                          readOnly
                        />
                      </label>

                      <label className={styles.field}>
                        <span>Mật khẩu mới</span>
                        <span className={styles.passwordInput}>
                          <LockKeyhole
                            aria-hidden="true"
                            className={styles.passwordIcon}
                            size={16}
                          />
                          <input
                            aria-describedby={
                              newPasswordError ? "student-edit-new-password-error" : undefined
                            }
                            aria-invalid={Boolean(newPasswordError)}
                            autoComplete="new-password"
                            name="student-edit-new-password"
                            placeholder="Để trống nếu không đổi mật khẩu"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            disabled={isSubmitting}
                            onChange={(event) => {
                              setNewPassword(event.target.value);
                              setNewPasswordError("");
                            }}
                          />
                          <span className={styles.passwordActions}>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                              title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                              onClick={() => setShowNewPassword((currentValue) => !currentValue)}
                            >
                              {showNewPassword ? (
                                <EyeOff aria-hidden="true" size={17} />
                              ) : (
                                <Eye aria-hidden="true" size={17} />
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              aria-label="Tự sinh mật khẩu"
                              title="Tự sinh mật khẩu"
                              onClick={handleGeneratePassword}
                            >
                              <WandSparkles aria-hidden="true" size={17} />
                            </button>
                          </span>
                        </span>
                        <ErrorMessage
                          id="student-edit-new-password-error"
                          message={newPasswordError}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className={styles.stateBlock}>Chưa có tài khoản liên kết</div>
                  )}
                </>
              )}

              <div className={styles.formActions}>
                <button
                  className={styles.cancelButton}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setFormValue(initialFormValue);
                    setNewPassword("");
                    setShowNewPassword(false);
                    setErrors({});
                    setNewPasswordError("");
                  }}
                >
                  Hủy
                </button>
                <button type="submit" disabled={isSubmitting}>
                  <Save aria-hidden="true" size={17} />
                  Lưu thay đổi
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      <ConfirmModal
        cancelText="Hủy"
        confirmText={isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
        description="Bạn có chắc muốn lưu các thay đổi thông tin học viên này?"
        isConfirmDisabled={isSubmitting}
        isOpen={isConfirmOpen}
        title="Xác nhận lưu thông tin"
        tone="primary"
        onCancel={() => {
          if (!isSubmitting) {
            setIsConfirmOpen(false);
          }
        }}
        onConfirm={handleConfirmSave}
      />
    </>
  );
}
