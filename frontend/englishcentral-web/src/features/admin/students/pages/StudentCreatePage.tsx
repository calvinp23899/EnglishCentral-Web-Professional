import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  Search,
  WandSparkles,
  UserPlus,
  UserRoundCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { ErrorMessage, toastDanger, toastSuccess } from "@/components/ui";
import {
  adminMetadataApi,
  type MetadataOption,
} from "@/features/admin/shared/api/admin-metadata-api";
import {
  adminStudentsApi,
} from "@/features/admin/students/api/admin-students-api";
import {
  statusLabels,
  students,
} from "@/features/admin/students/data/mockStudents";
import { generatePassword } from "@/features/admin/shared/utils/password";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import styles from "./StudentCreatePage.module.scss";

type StudentInfoForm = {
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

type AccountForm = {
  password: string;
};

type AccountMode = "existing" | "new";

type StudentCreateErrors = Partial<
  Record<
    | keyof StudentInfoForm
    | keyof AccountForm
    | "accountPassword"
    | "selectedAccountId",
    string
  >
>;

const getTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const todayInputValue = getTodayInputValue();

const initialStudentInfo: StudentInfoForm = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  phoneNumber: "",
  address: "",
  parentName: "",
  parentPhoneNumber: "",
  enrollmentDate: todayInputValue,
  status: "",
  notes: "",
};

const initialAccountForm: AccountForm = {
  password: "",
};

const accountRecords = students.map((student) => ({
  id: student.id,
  fullName: student.fullName,
  email: student.email,
  phoneNumber: student.phoneNumber,
  status: statusLabels[student.status],
}));

const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

export function StudentCreatePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [studentInfo, setStudentInfo] =
    useState<StudentInfoForm>(initialStudentInfo);
  const [accountMode, setAccountMode] = useState<AccountMode>("new");
  const [accountSearch, setAccountSearch] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [accountForm, setAccountForm] = useState<AccountForm>(initialAccountForm);
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<StudentCreateErrors>({});
  const [statusOptions, setStatusOptions] = useState<MetadataOption[]>([]);
  const [genderOptions, setGenderOptions] = useState<MetadataOption[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const [isLoadingGenders, setIsLoadingGenders] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadStatusOptions = async () => {
      setIsLoadingStatuses(true);

      try {
        const options = await adminMetadataApi.getStatusOptions();

        if (!isMounted) {
          return;
        }

        setStatusOptions(options);

        if (options.length > 0) {
          setStudentInfo((currentInfo) => ({
            ...currentInfo,
            status: options[0].value,
          }));
          setErrors((currentErrors) => ({
            ...currentErrors,
            status: undefined,
          }));
        }
      } catch (error) {
        toastDanger(getAuthErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoadingStatuses(false);
        }
      }
    };

    loadStatusOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadGenderOptions = async () => {
      setIsLoadingGenders(true);

      try {
        const options = await adminMetadataApi.getGenderOptions();

        if (!isMounted) {
          return;
        }

        setGenderOptions(options);

        if (options.length > 0) {
          setStudentInfo((currentInfo) => ({
            ...currentInfo,
            gender: options[0].value,
          }));
          setErrors((currentErrors) => ({
            ...currentErrors,
            gender: undefined,
          }));
        }
      } catch (error) {
        toastDanger(getAuthErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoadingGenders(false);
        }
      }
    };

    loadGenderOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const matchedAccounts = useMemo(() => {
    const searchTerm = accountSearch.trim().toLowerCase();

    if (searchTerm.length === 0) {
      return accountRecords.slice(0, 4);
    }

    return accountRecords.filter((account) =>
      [account.email, account.phoneNumber].join(" ").toLowerCase().includes(searchTerm),
    );
  }, [accountSearch]);

  const updateStudentInfo = <Key extends keyof StudentInfoForm>(
    field: Key,
    value: StudentInfoForm[Key],
  ) => {
    setStudentInfo((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };

  const updateAccountForm = <Key extends keyof AccountForm>(
    field: Key,
    value: AccountForm[Key],
  ) => {
    setAccountForm((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      accountPassword: field === "password" ? undefined : currentErrors.accountPassword,
    }));
  };

  const handleGeneratePassword = () => {
    updateAccountForm("password", generatePassword());
    setShowAccountPassword(true);
  };

  const getTrimmedAccountForm = () => ({
    password: accountForm.password.trim(),
  });

  const validateStudentInfo = () => {
    const nextErrors: StudentCreateErrors = {};

    if (!studentInfo.fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ tên học viên.";
    } else if (studentInfo.fullName.trim().length > 255) {
      nextErrors.fullName = "Họ tên học viên không được quá 255 ký tự.";
    }

    if (studentInfo.email.trim() && !isValidEmail(studentInfo.email.trim())) {
      nextErrors.email = "Email không đúng định dạng.";
    } else if (studentInfo.email.trim().length > 255) {
      nextErrors.email = "Email không được quá 255 ký tự.";
    }

    if (!studentInfo.email.trim()) {
      nextErrors.email = "Vui lòng nhập email.";
    }

    if (!studentInfo.phoneNumber.trim()) {
      nextErrors.phoneNumber = "Vui lòng nhập số điện thoại.";
    }

    if (studentInfo.phoneNumber.trim().length > 20) {
      nextErrors.phoneNumber = "Số điện thoại không được quá 20 ký tự.";
    }

    if (studentInfo.parentPhoneNumber.trim().length > 20) {
      nextErrors.parentPhoneNumber = "SĐT phụ huynh không được quá 20 ký tự.";
    }

    if (studentInfo.address.trim().length > 500) {
      nextErrors.address = "Địa chỉ không được quá 500 ký tự.";
    }

    if (
      genderOptions.length > 0 &&
      !genderOptions.some((option) => String(option.value) === String(studentInfo.gender))
    ) {
      nextErrors.gender = "Giới tính không hợp lệ.";
    }

    if (!studentInfo.enrollmentDate) {
      nextErrors.enrollmentDate = "Vui lòng chọn ngày ghi danh.";
    }

    if (!studentInfo.dateOfBirth) {
      nextErrors.dateOfBirth = "Vui lòng chọn ngày sinh.";
    }

    if (
      statusOptions.length > 0 &&
      !statusOptions.some((option) => String(option.value) === String(studentInfo.status))
    ) {
      nextErrors.status = "Trạng thái không hợp lệ.";
    }

    return nextErrors;
  };

  const validateAccountInfo = () => {
    const nextErrors: StudentCreateErrors = {};
    const nextAccountForm = getTrimmedAccountForm();
    const existingUserId = Number(selectedAccountId);

    if (accountMode === "existing" && (!selectedAccountId || Number.isNaN(existingUserId))) {
      nextErrors.selectedAccountId = "Vui lòng chọn tài khoản có sẵn hợp lệ.";
    }

    if (accountMode === "new") {
      if (nextAccountForm.password.length < 6) {
        nextErrors.accountPassword = "Mật khẩu tài khoản cần tối thiểu 6 ký tự.";
      }
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (currentStep === 1) {
      const nextErrors = validateStudentInfo();
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      setCurrentStep(2);
      return;
    }

    const nextAccountForm = getTrimmedAccountForm();
    const existingUserId = Number(selectedAccountId);
    const nextErrors = validateAccountInfo();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await adminStudentsApi.create({
        fullName: studentInfo.fullName.trim(),
        dateOfBirth: studentInfo.dateOfBirth,
        gender: studentInfo.gender,
        email: studentInfo.email.trim(),
        phoneNumber: studentInfo.phoneNumber.trim(),
        address: studentInfo.address.trim() || null,
        parentName: studentInfo.parentName.trim() || null,
        parentPhoneNumber: studentInfo.parentPhoneNumber.trim() || null,
        enrollmentDate: studentInfo.enrollmentDate,
        status: studentInfo.status,
        notes: studentInfo.notes.trim() || null,
        isAccountExists: accountMode === "existing",
        account:
          accountMode === "existing"
            ? {
                userId: existingUserId,
                password: null,
              }
            : {
                userId: null,
                password: nextAccountForm.password,
              },
      });

      toastSuccess("Tạo học viên thành công.");
      navigate("/admin/students");
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
          <Link className={styles.backLink} to="/admin/students">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>Tạo học viên mới</h1>
        </div>

        <div className={styles.steps} aria-label="Tiến trình tạo học viên">
          <span className={currentStep === 1 ? styles.activeStep : styles.doneStep}>
            <Check aria-hidden="true" size={14} />
            Thông tin học sinh
          </span>
          <ChevronRight aria-hidden="true" size={16} />
          <span className={currentStep === 2 ? styles.activeStep : ""}>
            <UserRoundCheck aria-hidden="true" size={14} />
            Tài khoản
          </span>
        </div>
      </section>

      <form className={styles.panel} onSubmit={handleSubmit}>
        {currentStep === 1 ? (
          <>
            <div className={styles.panelHeader}>
              <div>
                <h2>Thông tin học sinh</h2>
                <p>Điền hồ sơ cơ bản và ngày ghi danh.</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>
                  Họ tên học viên <em className={styles.requiredMark}>*</em>
                </span>
                <input
                  aria-describedby={errors.fullName ? "student-full-name-error" : undefined}
                  aria-invalid={Boolean(errors.fullName)}
                  value={studentInfo.fullName}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateStudentInfo("fullName", event.target.value)
                  }
                />
                <ErrorMessage id="student-full-name-error" message={errors.fullName} />
              </label>

              <label className={styles.field}>
                <span>Ngày sinh</span>
                <input
                  aria-describedby={errors.dateOfBirth ? "student-date-of-birth-error" : undefined}
                  aria-invalid={Boolean(errors.dateOfBirth)}
                  type="date"
                  value={studentInfo.dateOfBirth}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateStudentInfo("dateOfBirth", event.target.value)
                  }
                />
                <ErrorMessage id="student-date-of-birth-error" message={errors.dateOfBirth} />
              </label>

              <label className={styles.field}>
                <span>
                  Giới tính <em className={styles.requiredMark}>*</em>
                </span>
                <select
                  aria-describedby={errors.gender ? "student-gender-error" : undefined}
                  aria-invalid={Boolean(errors.gender)}
                  value={studentInfo.gender}
                  disabled={isSubmitting || isLoadingGenders}
                  onChange={(event) =>
                    updateStudentInfo(
                      "gender",
                      event.target.value,
                    )
                  }
                >
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ErrorMessage id="student-gender-error" message={errors.gender} />
              </label>

              <label className={styles.field}>
                <span>Email</span>
                <input
                  aria-describedby={errors.email ? "student-email-error" : undefined}
                  aria-invalid={Boolean(errors.email)}
                  value={studentInfo.email}
                  disabled={isSubmitting}
                  onChange={(event) => updateStudentInfo("email", event.target.value)}
                />
                <ErrorMessage id="student-email-error" message={errors.email} />
              </label>

              <label className={styles.field}>
                <span>Số điện thoại</span>
                <input
                  aria-describedby={errors.phoneNumber ? "student-phone-error" : undefined}
                  aria-invalid={Boolean(errors.phoneNumber)}
                  value={studentInfo.phoneNumber}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateStudentInfo("phoneNumber", event.target.value)
                  }
                />
                <ErrorMessage id="student-phone-error" message={errors.phoneNumber} />
              </label>

              <label className={styles.field}>
                <span>Địa chỉ</span>
                <input
                  aria-describedby={errors.address ? "student-address-error" : undefined}
                  aria-invalid={Boolean(errors.address)}
                  value={studentInfo.address}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateStudentInfo("address", event.target.value)
                  }
                />
                <ErrorMessage id="student-address-error" message={errors.address} />
              </label>

              <label className={styles.field}>
                <span>Họ tên phụ huynh</span>
                <input
                  aria-describedby={errors.parentName ? "student-parent-name-error" : undefined}
                  aria-invalid={Boolean(errors.parentName)}
                  value={studentInfo.parentName}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateStudentInfo("parentName", event.target.value)
                  }
                />
                <ErrorMessage id="student-parent-name-error" message={errors.parentName} />
              </label>

              <label className={styles.field}>
                <span>SĐT phụ huynh</span>
                <input
                  aria-describedby={
                    errors.parentPhoneNumber
                      ? "student-parent-phone-error"
                      : undefined
                  }
                  aria-invalid={Boolean(errors.parentPhoneNumber)}
                  value={studentInfo.parentPhoneNumber}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateStudentInfo("parentPhoneNumber", event.target.value)
                  }
                />
                <ErrorMessage
                  id="student-parent-phone-error"
                  message={errors.parentPhoneNumber}
                />
              </label>

              <label className={styles.field}>
                <span>
                  Ngày ghi danh <em className={styles.requiredMark}>*</em>
                </span>
                <input
                  aria-describedby={
                    errors.enrollmentDate ? "student-enrollment-date-error" : undefined
                  }
                  aria-invalid={Boolean(errors.enrollmentDate)}
                  type="date"
                  value={studentInfo.enrollmentDate}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateStudentInfo("enrollmentDate", event.target.value)
                  }
                />
                <ErrorMessage
                  id="student-enrollment-date-error"
                  message={errors.enrollmentDate}
                />
              </label>

              <label className={styles.field}>
                <span>
                  Trạng thái <em className={styles.requiredMark}>*</em>
                </span>
                <select
                  aria-describedby={errors.status ? "student-status-error" : undefined}
                  aria-invalid={Boolean(errors.status)}
                  value={studentInfo.status}
                  disabled={isSubmitting || isLoadingStatuses}
                  onChange={(event) =>
                    updateStudentInfo(
                      "status",
                      event.target.value,
                    )
                  }
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ErrorMessage id="student-status-error" message={errors.status} />
              </label>

              <label className={`${styles.field} ${styles.notesField}`}>
                <span>Ghi chú</span>
                <textarea
                  aria-describedby={errors.notes ? "student-notes-error" : undefined}
                  aria-invalid={Boolean(errors.notes)}
                  rows={5}
                  value={studentInfo.notes}
                  disabled={isSubmitting}
                  onChange={(event) => updateStudentInfo("notes", event.target.value)}
                />
                <ErrorMessage id="student-notes-error" message={errors.notes} />
              </label>
            </div>
          </>
        ) : (
          <>
            <div className={styles.panelHeader}>
              <div>
                <h2>Tài khoản đăng nhập</h2>
                <p>Liên kết tài khoản có sẵn hoặc tạo mới cho học viên.</p>
              </div>
            </div>

            <div className={styles.accountStep}>
              <div className={styles.optionGrid}>
                <button
                  className={accountMode === "existing" ? styles.selectedOption : ""}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setAccountMode("existing");
                    setErrors({});
                  }}
                >
                  <UserRoundCheck aria-hidden="true" size={22} />
                  <strong>Đã có tài khoản</strong>
                  <span>Chọn tài khoản bằng email hoặc số điện thoại.</span>
                </button>
                <button
                  className={accountMode === "new" ? styles.selectedOption : ""}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setAccountMode("new");
                    setErrors({});
                  }}
                >
                  <UserPlus aria-hidden="true" size={22} />
                  <strong>Chưa có tài khoản</strong>
                  <span>Tạo tài khoản mới và gắn với hồ sơ học viên.</span>
                </button>
              </div>

              {accountMode === "existing" ? (
                <div className={styles.existingAccount}>
                  <label className={styles.searchBox}>
                    <Search aria-hidden="true" size={18} />
                    <input
                      aria-describedby={
                        errors.selectedAccountId
                          ? "student-selected-account-error"
                          : undefined
                      }
                      aria-invalid={Boolean(errors.selectedAccountId)}
                      placeholder="Tìm theo email hoặc SĐT"
                      value={accountSearch}
                      disabled={isSubmitting}
                      onChange={(event) => setAccountSearch(event.target.value)}
                    />
                  </label>
                  <span className={styles.requiredHint}>
                    Chọn tài khoản có sẵn <em className={styles.requiredMark}>*</em>
                  </span>

                  <div className={styles.resultList}>
                    {matchedAccounts.map((account) => (
                      <button
                        className={
                          selectedAccountId === account.id ? styles.selectedAccount : ""
                        }
                        key={account.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setSelectedAccountId(account.id);
                          setErrors((currentErrors) => ({
                            ...currentErrors,
                            selectedAccountId: undefined,
                          }));
                        }}
                      >
                        <span className={styles.avatar}>
                          {account.fullName.slice(0, 1)}
                        </span>
                        <span>
                          <strong>{account.fullName}</strong>
                          <em>
                            <Mail aria-hidden="true" size={13} />
                            {account.email}
                          </em>
                          <em>
                            <Phone aria-hidden="true" size={13} />
                            {account.phoneNumber}
                          </em>
                        </span>
                        <small>{account.status}</small>
                      </button>
                    ))}
                  </div>
                  <ErrorMessage
                    id="student-selected-account-error"
                    message={errors.selectedAccountId}
                  />
                </div>
              ) : (
                <div className={styles.accountFormGrid}>
                  <label className={styles.field}>
                    <span>
                      Mật khẩu <em className={styles.requiredMark}>*</em>
                    </span>
                    <span className={styles.passwordInput}>
                      <LockKeyhole aria-hidden="true" className={styles.passwordIcon} size={16} />
                      <input
                        aria-describedby={
                          errors.accountPassword
                            ? "student-account-password-error"
                            : undefined
                        }
                        aria-invalid={Boolean(errors.accountPassword)}
                        type={showAccountPassword ? "text" : "password"}
                        value={accountForm.password}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          updateAccountForm("password", event.target.value)
                        }
                      />
                      <span className={styles.passwordActions}>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          aria-label={showAccountPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          title={showAccountPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          onClick={() => setShowAccountPassword((currentValue) => !currentValue)}
                        >
                          {showAccountPassword ? (
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
                      id="student-account-password-error"
                      message={errors.accountPassword}
                    />
                  </label>
                </div>
              )}
            </div>
          </>
        )}

        <div className={styles.formActions}>
          {currentStep === 2 && (
            <button
              className={styles.secondaryButton}
              type="button"
              disabled={isSubmitting}
              onClick={() => setCurrentStep(1)}
            >
              Quay lại
            </button>
          )}
          <button type="submit" disabled={isSubmitting}>
            {currentStep === 1
              ? "Tiếp tục"
              : isSubmitting
                ? "Đang tạo..."
                : "Tạo học viên"}
            <ChevronRight aria-hidden="true" size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}
