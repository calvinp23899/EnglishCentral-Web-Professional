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

import {
  genderLabels,
  statusLabels,
  students,
  type StudentGender,
  type StudentStatus,
} from "@/features/admin/students/data/mockStudents";

import styles from "./StudentCreatePage.module.scss";

type StudentInfoForm = {
  fullName: string;
  dateOfBirth: string;
  gender: StudentGender;
  email: string;
  phoneNumber: string;
  address: string;
  parentName: string;
  parentPhoneNumber: string;
  enrollmentDate: string;
  status: StudentStatus;
  notes: string;
};

type AccountForm = {
  email: string;
  phoneNumber: string;
  fullName: string;
  password: string;
};

type AccountMode = "existing" | "new";

const initialStudentInfo: StudentInfoForm = {
  fullName: "",
  dateOfBirth: "2026-05-23",
  gender: 1,
  email: "",
  phoneNumber: "",
  address: "",
  parentName: "",
  parentPhoneNumber: "",
  enrollmentDate: "2026-05-23",
  status: 1,
  notes: "",
};

const initialAccountForm: AccountForm = {
  email: "",
  phoneNumber: "",
  fullName: "",
  password: "",
};

const accountRecords = students.map((student) => ({
  id: student.id,
  fullName: student.fullName,
  email: student.email,
  phoneNumber: student.phoneNumber,
  status: statusLabels[student.status],
}));

export function StudentCreatePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [studentInfo, setStudentInfo] =
    useState<StudentInfoForm>(initialStudentInfo);
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

  const updateStudentInfo = <Key extends keyof StudentInfoForm>(
    field: Key,
    value: StudentInfoForm[Key],
  ) => {
    setStudentInfo((currentValue) => ({
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

    navigate("/admin/students");
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
                <span>Full name</span>
                <input
                  value={studentInfo.fullName}
                  onChange={(event) =>
                    updateStudentInfo("fullName", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Date of birth</span>
                <input
                  type="date"
                  value={studentInfo.dateOfBirth}
                  onChange={(event) =>
                    updateStudentInfo("dateOfBirth", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Gender</span>
                <select
                  value={studentInfo.gender}
                  onChange={(event) =>
                    updateStudentInfo(
                      "gender",
                      Number(event.target.value) as StudentGender,
                    )
                  }
                >
                  {Object.entries(genderLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span>Email</span>
                <input
                  value={studentInfo.email}
                  onChange={(event) => updateStudentInfo("email", event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span>Phone number</span>
                <input
                  value={studentInfo.phoneNumber}
                  onChange={(event) =>
                    updateStudentInfo("phoneNumber", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Address</span>
                <input
                  value={studentInfo.address}
                  onChange={(event) =>
                    updateStudentInfo("address", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Parent name</span>
                <input
                  value={studentInfo.parentName}
                  onChange={(event) =>
                    updateStudentInfo("parentName", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Parent phone number</span>
                <input
                  value={studentInfo.parentPhoneNumber}
                  onChange={(event) =>
                    updateStudentInfo("parentPhoneNumber", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Enrollment date</span>
                <input
                  type="date"
                  value={studentInfo.enrollmentDate}
                  onChange={(event) =>
                    updateStudentInfo("enrollmentDate", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Status</span>
                <select
                  value={studentInfo.status}
                  onChange={(event) =>
                    updateStudentInfo(
                      "status",
                      Number(event.target.value) as StudentStatus,
                    )
                  }
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={`${styles.field} ${styles.notesField}`}>
                <span>Notes</span>
                <textarea
                  rows={5}
                  value={studentInfo.notes}
                  onChange={(event) => updateStudentInfo("notes", event.target.value)}
                />
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
                  <span>Tạo account mới và gắn với hồ sơ học viên.</span>
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
                </div>
              ) : (
                <div className={styles.accountFormGrid}>
                  <label className={styles.field}>
                    <span>Email</span>
                    <input
                      value={accountForm.email}
                      onChange={(event) =>
                        updateAccountForm("email", event.target.value)
                      }
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
                      onChange={(event) =>
                        updateAccountForm("fullName", event.target.value)
                      }
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
            {currentStep === 1 ? "Tiếp tục" : "Tạo học viên"}
            <ChevronRight aria-hidden="true" size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}
