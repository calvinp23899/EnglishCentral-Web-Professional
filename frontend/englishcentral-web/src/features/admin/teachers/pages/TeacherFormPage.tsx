import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  LockKeyhole,
  Mail,
  Phone,
  Search,
  UserPlus,
  UserRoundCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { AdminCrudFormPage } from "@/features/admin/shared/components/AdminCrud/AdminCrudFormPage";

import { teacherDefaultValue, teacherFields, teacherRecords } from "./teacherCrud.config";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";

type Props = {
  mode: "create" | "edit";
};

type TeacherInfoForm = {
  address: string;
  bankAccountNumber: string;
  bankName: string;
  baseSalary: number;
  bio: string;
  certifications: string;
  contractEndDate: string;
  contractType: number;
  dateOfBirth: string;
  degree: string;
  email: string;
  fullName: string;
  gender: number;
  hireDate: string;
  hourlyRate: number | null;
  nationalId: string;
  nationalIdIssuedDate: string;
  nationalIdIssuedPlace: string;
  phoneNumber: string;
  salaryType: number;
  specialization: string;
  status: number;
  taxCode: string;
  yearsOfExperience: number;
};

type AccountForm = {
  email: string;
  fullName: string;
  password: string;
  phoneNumber: string;
};

type AccountMode = "existing" | "new";

const initialTeacherInfo: TeacherInfoForm = {
  address: "",
  bankAccountNumber: "",
  bankName: "",
  baseSalary: 0,
  bio: "",
  certifications: "",
  contractEndDate: "",
  contractType: 0,
  dateOfBirth: "",
  degree: "",
  email: "",
  fullName: "",
  gender: 1,
  hireDate: "2026-05-25",
  hourlyRate: null,
  nationalId: "",
  nationalIdIssuedDate: "",
  nationalIdIssuedPlace: "",
  phoneNumber: "",
  salaryType: 0,
  specialization: "",
  status: 1,
  taxCode: "",
  yearsOfExperience: 0,
};

const initialAccountForm: AccountForm = {
  email: "",
  fullName: "",
  password: "",
  phoneNumber: "",
};

const accountRecords = teacherRecords.map((teacher) => ({
  id: String(teacher.id),
  email: String(teacher.email),
  fullName: String(teacher.fullName),
  phoneNumber: String(teacher.phone),
  status: String(teacher.status),
}));

const splitCertifications = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export function TeacherFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfoForm>(initialTeacherInfo);
  const [accountMode, setAccountMode] = useState<AccountMode>("existing");
  const [accountSearch, setAccountSearch] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [accountForm, setAccountForm] = useState<AccountForm>(initialAccountForm);

  const matchedAccounts = useMemo(() => {
    const searchTerm = accountSearch.trim().toLowerCase();

    if (searchTerm.length === 0) {
      return accountRecords.slice(0, 4);
    }

    return accountRecords.filter((account) =>
      [account.email, account.phoneNumber].join(" ").toLowerCase().includes(searchTerm),
    );
  }, [accountSearch]);

  if (mode === "edit") {
    return (
      <AdminCrudFormPage
        defaultValue={teacherDefaultValue}
        fields={teacherFields}
        listPath="/admin/teachers"
        mode={mode}
        records={teacherRecords}
        title="Chỉnh sửa giáo viên"
      />
    );
  }

  const updateTeacherInfo = <Key extends keyof TeacherInfoForm>(
    field: Key,
    value: TeacherInfoForm[Key],
  ) => {
    setTeacherInfo((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const updateAccountForm = <Key extends keyof AccountForm>(
    field: Key,
    value: AccountForm[Key],
  ) => {
    setAccountForm((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    const selectedAccount = accountRecords.find((account) => account.id === selectedAccountId);
    const payload = {
      ...teacherInfo,
      certifications: splitCertifications(teacherInfo.certifications),
      isAccountExists: accountMode === "existing",
      account:
        accountMode === "existing"
          ? {
              userId: selectedAccount?.id ?? null,
              email: selectedAccount?.email ?? "",
              phoneNumber: selectedAccount?.phoneNumber ?? "",
              fullName: selectedAccount?.fullName ?? "",
            }
          : {
              userId: null,
              email: accountForm.email,
              phoneNumber: accountForm.phoneNumber,
              fullName: accountForm.fullName,
              password: accountForm.password,
            },
    };

    console.info("Mock create teacher payload", payload);
    navigate("/admin/teachers");
  };

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to="/admin/teachers">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>Tạo giáo viên mới</h1>
        </div>

        <div className={styles.steps} aria-label="Tiến trình tạo giáo viên">
          <span className={currentStep === 1 ? styles.activeStep : styles.doneStep}>
            <Check aria-hidden="true" size={14} />
            Thông tin giáo viên
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
                <h2>Thông tin giáo viên</h2>
                <p>Mock form theo payload tạo teacher, chưa gọi API.</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Full name</span>
                <input
                  value={teacherInfo.fullName}
                  onChange={(event) => updateTeacherInfo("fullName", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Email</span>
                <input
                  value={teacherInfo.email}
                  onChange={(event) => updateTeacherInfo("email", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Phone number</span>
                <input
                  value={teacherInfo.phoneNumber}
                  onChange={(event) => updateTeacherInfo("phoneNumber", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Date of birth</span>
                <input
                  type="date"
                  value={teacherInfo.dateOfBirth}
                  onChange={(event) => updateTeacherInfo("dateOfBirth", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Gender</span>
                <select
                  value={teacherInfo.gender}
                  onChange={(event) => updateTeacherInfo("gender", Number(event.target.value))}
                >
                  <option value={0}>Nữ</option>
                  <option value={1}>Nam</option>
                  <option value={2}>Khác</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Address</span>
                <input
                  value={teacherInfo.address}
                  onChange={(event) => updateTeacherInfo("address", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>National ID</span>
                <input
                  value={teacherInfo.nationalId}
                  onChange={(event) => updateTeacherInfo("nationalId", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>National ID issued date</span>
                <input
                  type="date"
                  value={teacherInfo.nationalIdIssuedDate}
                  onChange={(event) =>
                    updateTeacherInfo("nationalIdIssuedDate", event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span>National ID issued place</span>
                <input
                  value={teacherInfo.nationalIdIssuedPlace}
                  onChange={(event) =>
                    updateTeacherInfo("nationalIdIssuedPlace", event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Specialization</span>
                <input
                  value={teacherInfo.specialization}
                  onChange={(event) =>
                    updateTeacherInfo("specialization", event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Degree</span>
                <input
                  value={teacherInfo.degree}
                  onChange={(event) => updateTeacherInfo("degree", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Years of experience</span>
                <input
                  min={0}
                  type="number"
                  value={teacherInfo.yearsOfExperience}
                  onChange={(event) =>
                    updateTeacherInfo("yearsOfExperience", Number(event.target.value))
                  }
                />
              </label>
              <label className={`${styles.field} ${styles.notesField}`}>
                <span>Certifications</span>
                <input
                  placeholder="IELTS 8.0, CELTA, TESOL"
                  value={teacherInfo.certifications}
                  onChange={(event) => updateTeacherInfo("certifications", event.target.value)}
                />
              </label>
              <label className={`${styles.field} ${styles.notesField}`}>
                <span>Bio</span>
                <textarea
                  rows={4}
                  value={teacherInfo.bio}
                  onChange={(event) => updateTeacherInfo("bio", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Hire date</span>
                <input
                  type="date"
                  value={teacherInfo.hireDate}
                  onChange={(event) => updateTeacherInfo("hireDate", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Contract type</span>
                <select
                  value={teacherInfo.contractType}
                  onChange={(event) =>
                    updateTeacherInfo("contractType", Number(event.target.value))
                  }
                >
                  <option value={0}>Full-time</option>
                  <option value={1}>Part-time</option>
                  <option value={2}>Contract</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Contract end date</span>
                <input
                  type="date"
                  value={teacherInfo.contractEndDate}
                  onChange={(event) =>
                    updateTeacherInfo("contractEndDate", event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Status</span>
                <select
                  value={teacherInfo.status}
                  onChange={(event) => updateTeacherInfo("status", Number(event.target.value))}
                >
                  <option value={0}>Pending</option>
                  <option value={1}>Active</option>
                  <option value={2}>Inactive</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Salary type</span>
                <select
                  value={teacherInfo.salaryType}
                  onChange={(event) =>
                    updateTeacherInfo("salaryType", Number(event.target.value))
                  }
                >
                  <option value={0}>Base salary</option>
                  <option value={1}>Hourly</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Base salary</span>
                <input
                  min={0}
                  type="number"
                  value={teacherInfo.baseSalary}
                  onChange={(event) =>
                    updateTeacherInfo("baseSalary", Number(event.target.value))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Hourly rate</span>
                <input
                  min={0}
                  type="number"
                  value={teacherInfo.hourlyRate ?? ""}
                  onChange={(event) =>
                    updateTeacherInfo(
                      "hourlyRate",
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Bank account number</span>
                <input
                  value={teacherInfo.bankAccountNumber}
                  onChange={(event) =>
                    updateTeacherInfo("bankAccountNumber", event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Bank name</span>
                <input
                  value={teacherInfo.bankName}
                  onChange={(event) => updateTeacherInfo("bankName", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Tax code</span>
                <input
                  value={teacherInfo.taxCode}
                  onChange={(event) => updateTeacherInfo("taxCode", event.target.value)}
                />
              </label>
            </div>
          </>
        ) : (
          <>
            <div className={styles.panelHeader}>
              <div>
                <h2>Tài khoản đăng nhập</h2>
                <p>Liên kết tài khoản có sẵn hoặc tạo mới cho giáo viên.</p>
              </div>
            </div>

            <div className={styles.accountStep}>
              <div className={styles.optionGrid}>
                <button
                  className={accountMode === "existing" ? styles.selectedOption : ""}
                  type="button"
                  onClick={() => setAccountMode("existing")}
                >
                  <UserRoundCheck aria-hidden="true" size={22} />
                  <strong>Đã có tài khoản</strong>
                  <span>Chọn account bằng email hoặc số điện thoại.</span>
                </button>
                <button
                  className={accountMode === "new" ? styles.selectedOption : ""}
                  type="button"
                  onClick={() => setAccountMode("new")}
                >
                  <UserPlus aria-hidden="true" size={22} />
                  <strong>Chưa có tài khoản</strong>
                  <span>Tạo account mới và gắn với hồ sơ giáo viên.</span>
                </button>
              </div>

              {accountMode === "existing" ? (
                <div className={styles.existingAccount}>
                  <label className={styles.searchBox}>
                    <Search aria-hidden="true" size={18} />
                    <input
                      placeholder="Tìm theo email hoặc SĐT"
                      value={accountSearch}
                      onChange={(event) => setAccountSearch(event.target.value)}
                    />
                  </label>

                  <div className={styles.resultList}>
                    {matchedAccounts.map((account) => (
                      <button
                        className={
                          selectedAccountId === account.id ? styles.selectedAccount : ""
                        }
                        key={account.id}
                        type="button"
                        onClick={() => setSelectedAccountId(account.id)}
                      >
                        <span className={styles.avatar}>{account.fullName.slice(0, 1)}</span>
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
                </div>
              ) : (
                <div className={styles.accountFormGrid}>
                  <label className={styles.field}>
                    <span>Email</span>
                    <input
                      value={accountForm.email}
                      onChange={(event) => updateAccountForm("email", event.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Phone number</span>
                    <input
                      value={accountForm.phoneNumber}
                      onChange={(event) =>
                        updateAccountForm("phoneNumber", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Full name</span>
                    <input
                      value={accountForm.fullName}
                      onChange={(event) => updateAccountForm("fullName", event.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Password</span>
                    <span className={styles.passwordInput}>
                      <LockKeyhole aria-hidden="true" size={16} />
                      <input
                        type="password"
                        value={accountForm.password}
                        onChange={(event) =>
                          updateAccountForm("password", event.target.value)
                        }
                      />
                    </span>
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
              onClick={() => setCurrentStep(1)}
            >
              Quay lại
            </button>
          )}
          <button type="submit">
            {currentStep === 1 ? "Tiếp tục" : "Tạo giáo viên"}
            <ChevronRight aria-hidden="true" size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}
