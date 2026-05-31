import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Check,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  Search,
  WandSparkles,
  Save,
  UserPlus,
  UserRoundCheck,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { toastDanger, toastSuccess } from "@/components/ui";
import {
  adminAccountsApi,
  type AdminAccount,
} from "@/features/admin/accounts/api/admin-accounts-api";
import {
  adminMetadataApi,
  type MetadataOption,
  type RoleMetadataOption,
} from "@/features/admin/shared/api/admin-metadata-api";
import { generatePassword } from "@/features/admin/shared/utils/password";
import {
  adminTeachersApi,
  type AdminTeacher,
  type TeacherFormPayload,
} from "@/features/admin/teachers/api/admin-teachers-api";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import { teacherRecords } from "./teacherCrud.config";
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
  role: string;
};

type AccountMode = "existing" | "new";
type EditTabKey = "info" | "performance";
type PerformanceForm = {
  averageRating: number;
  completionRate: number;
  completedClasses: number;
  feedbackScore: number;
  monthlyRevenue: number;
  note: string;
  teachingHours: number;
  totalClasses: number;
};

const editTabs: Array<{ key: EditTabKey; label: string }> = [
  { key: "info", label: "Thông tin" },
  { key: "performance", label: "Hiệu Suất" },
];

const performanceByTeacherId: Record<string, PerformanceForm> = {
  "1": {
    averageRating: 4.9,
    completionRate: 97,
    completedClasses: 30,
    feedbackScore: 96,
    monthlyRevenue: 68000000,
    note: "Giữ chất lượng phản hồi writing ổn định, ưu tiên thêm lớp Speaking Clinic.",
    teachingHours: 64,
    totalClasses: 32,
  },
  "2": {
    averageRating: 4.7,
    completionRate: 94,
    completedClasses: 24,
    feedbackScore: 92,
    monthlyRevenue: 52000000,
    note: "Tăng bài luyện listening theo format mới.",
    teachingHours: 52,
    totalClasses: 26,
  },
  "3": {
    averageRating: 4.6,
    completionRate: 90,
    completedClasses: 14,
    feedbackScore: 89,
    monthlyRevenue: 30000000,
    note: "Cần theo dõi thêm sau giai đoạn onboarding.",
    teachingHours: 28,
    totalClasses: 16,
  },
  "4": {
    averageRating: 4.8,
    completionRate: 96,
    completedClasses: 18,
    feedbackScore: 95,
    monthlyRevenue: 41000000,
    note: "Writing reviewer ổn định, có thể phân thêm lớp band cao.",
    teachingHours: 40,
    totalClasses: 19,
  },
};

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
  role: "",
};

const toTeacherInfoForm = (teacher: AdminTeacher): TeacherInfoForm => ({
  address: teacher.address ?? "",
  bankAccountNumber: teacher.bankAccountNumber ?? "",
  bankName: teacher.bankName ?? "",
  baseSalary: teacher.baseSalary ?? 0,
  bio: teacher.bio ?? "",
  certifications: teacher.certifications?.join(", ") ?? "",
  contractEndDate: teacher.contractEndDate ?? "",
  contractType: teacher.contractType ?? 0,
  dateOfBirth: teacher.dateOfBirth ?? "",
  degree: teacher.degree ?? "",
  email: teacher.email ?? "",
  fullName: teacher.fullName,
  gender: teacher.gender,
  hireDate: teacher.hireDate ?? "",
  hourlyRate: teacher.hourlyRate ?? null,
  nationalId: teacher.nationalId ?? "",
  nationalIdIssuedDate: teacher.nationalIdIssuedDate ?? "",
  nationalIdIssuedPlace: teacher.nationalIdIssuedPlace ?? "",
  phoneNumber: teacher.phoneNumber ?? "",
  salaryType: teacher.salaryType,
  specialization: teacher.specialization ?? "",
  status: Number(teacher.status),
  taxCode: teacher.taxCode ?? "",
  yearsOfExperience: teacher.yearsOfExperience ?? 0,
});

const splitCertifications = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toPayload = (value: TeacherInfoForm): TeacherFormPayload => ({
  ...value,
  address: value.address.trim() || null,
  bankAccountNumber: value.bankAccountNumber.trim() || null,
  bankName: value.bankName.trim() || null,
  bio: value.bio.trim() || null,
  certifications: splitCertifications(value.certifications),
  contractEndDate: value.contractEndDate || null,
  dateOfBirth: value.dateOfBirth || null,
  degree: value.degree.trim() || null,
  email: value.email.trim() || null,
  fullName: value.fullName.trim(),
  hourlyRate: value.hourlyRate,
  nationalId: value.nationalId.trim() || null,
  nationalIdIssuedDate: value.nationalIdIssuedDate || null,
  nationalIdIssuedPlace: value.nationalIdIssuedPlace.trim() || null,
  phoneNumber: value.phoneNumber.trim() || null,
  specialization: value.specialization.trim() || null,
  taxCode: value.taxCode.trim() || null,
});

export function TeacherFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfoForm>(initialTeacherInfo);
  const [editTeacherInfo, setEditTeacherInfo] = useState<TeacherInfoForm>(initialTeacherInfo);
  const [initialEditTeacherInfo, setInitialEditTeacherInfo] = useState<TeacherInfoForm>(initialTeacherInfo);
  const [performanceForm, setPerformanceForm] = useState<PerformanceForm>(
    () => performanceByTeacherId[String(recordId ?? teacherRecords[0].id)] ?? performanceByTeacherId["1"],
  );
  const [editActiveTab, setEditActiveTab] = useState<EditTabKey>("info");
  const [accountMode, setAccountMode] = useState<AccountMode>("existing");
  const [accountSearch, setAccountSearch] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [accountForm, setAccountForm] = useState<AccountForm>(initialAccountForm);
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [accountRecords, setAccountRecords] = useState<AdminAccount[]>([]);
  const [statusOptions, setStatusOptions] = useState<MetadataOption[]>([]);
  const [genderOptions, setGenderOptions] = useState<MetadataOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleMetadataOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      adminMetadataApi.getTeacherStatusOptions(),
      adminMetadataApi.getGenderOptions(),
      adminMetadataApi.getRoleOptions(),
    ])
      .then(([statuses, genders, roles]) => {
        setStatusOptions(statuses);
        setGenderOptions(genders);
        setRoleOptions(roles);
        setAccountForm((current) => ({
          ...current,
          role: current.role || roles.find((role) => role.roleName === "Teacher")?.roleName || roles[0]?.roleName || "",
        }));
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !recordId) {
      return;
    }

    adminTeachersApi
      .getById(recordId)
      .then((teacher) => {
        const value = toTeacherInfoForm(teacher);
        setEditTeacherInfo(value);
        setInitialEditTeacherInfo(value);
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, [mode, recordId]);

  useEffect(() => {
    if (mode !== "create" || accountMode !== "existing") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      adminAccountsApi
        .getAccounts(accountSearch)
        .then(setAccountRecords)
        .catch((error) => toastDanger(getAuthErrorMessage(error)));
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [accountMode, accountSearch, mode]);

  const matchedAccounts = useMemo(() => {
    const searchTerm = accountSearch.trim().toLowerCase();

    if (searchTerm.length === 0) {
      return accountRecords.slice(0, 4);
    }

    return accountRecords.filter((account) =>
      [account.email, account.phoneNumber].join(" ").toLowerCase().includes(searchTerm),
    );
  }, [accountRecords, accountSearch]);

  const updateTeacherInfo = <Key extends keyof TeacherInfoForm>(
    field: Key,
    value: TeacherInfoForm[Key],
  ) => {
    setTeacherInfo((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const updateEditTeacherInfo = <Key extends keyof TeacherInfoForm>(
    field: Key,
    value: TeacherInfoForm[Key],
  ) => {
    setEditTeacherInfo((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const updatePerformanceForm = <Key extends keyof PerformanceForm>(
    field: Key,
    value: PerformanceForm[Key],
  ) => {
    setPerformanceForm((currentValue) => ({
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

  const handleGeneratePassword = () => {
    updateAccountForm("password", generatePassword());
    setShowAccountPassword(true);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!recordId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await adminTeachersApi.update(recordId, toPayload(editTeacherInfo));
      toastSuccess("Lưu thay đổi giáo viên thành công.");
      navigate("/admin/teachers");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePerformanceSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toastSuccess("Lưu hiệu suất giáo viên thành công.");
  };

  if (mode === "edit") {
    return (
      <div className={styles.page}>
        <section className={styles.header}>
          <div>
            <Link className={styles.backLink} to="/admin/teachers">
              <ArrowLeft aria-hidden="true" size={16} />
              Quay lại danh sách
            </Link>
            <h1>Chỉnh sửa giáo viên</h1>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.editTabs} role="tablist" aria-label="Teacher edit tabs">
            {editTabs.map((tab) => (
              <button
                className={editActiveTab === tab.key ? styles.activeEditTab : ""}
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={editActiveTab === tab.key}
                onClick={() => setEditActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {editActiveTab === "info" && (
            <form onSubmit={handleEditSubmit}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Thông tin giáo viên</h2>
                  <p>Cập nhật theo cấu trúc thông tin ở flow tạo giáo viên.</p>
                </div>
              </div>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Họ Tên</span>
                  <input
                    value={editTeacherInfo.fullName}
                    onChange={(event) => updateEditTeacherInfo("fullName", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    type="email"
                    value={editTeacherInfo.email}
                    onChange={(event) => updateEditTeacherInfo("email", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Số Điện Thoại</span>
                  <input
                    value={editTeacherInfo.phoneNumber}
                    onChange={(event) => updateEditTeacherInfo("phoneNumber", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Ngày Sinh</span>
                  <input
                    type="date"
                    value={editTeacherInfo.dateOfBirth}
                    onChange={(event) => updateEditTeacherInfo("dateOfBirth", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Giới Tính</span>
                  <select
                    value={editTeacherInfo.gender}
                    onChange={(event) => updateEditTeacherInfo("gender", Number(event.target.value))}
                  >
                    {genderOptions.map((option) => (
                      <option key={option.code} value={option.code}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Địa Chỉ</span>
                  <input
                    value={editTeacherInfo.address}
                    onChange={(event) => updateEditTeacherInfo("address", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>CMND/CCCD</span>
                  <input
                    value={editTeacherInfo.nationalId}
                    onChange={(event) => updateEditTeacherInfo("nationalId", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Ngày cấp CMND/CCCD</span>
                  <input
                    type="date"
                    value={editTeacherInfo.nationalIdIssuedDate}
                    onChange={(event) =>
                      updateEditTeacherInfo("nationalIdIssuedDate", event.target.value)
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Địa điểm cấp CMND/CCCD</span>
                  <input
                    value={editTeacherInfo.nationalIdIssuedPlace}
                    onChange={(event) =>
                      updateEditTeacherInfo("nationalIdIssuedPlace", event.target.value)
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Chuyên môn</span>
                  <input
                    value={editTeacherInfo.specialization}
                    onChange={(event) => updateEditTeacherInfo("specialization", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Bằng cấp</span>
                  <input
                    value={editTeacherInfo.degree}
                    onChange={(event) => updateEditTeacherInfo("degree", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Số Năm Kinh Nghiệm</span>
                  <input
                    min={0}
                    type="number"
                    value={editTeacherInfo.yearsOfExperience}
                    onChange={(event) =>
                      updateEditTeacherInfo("yearsOfExperience", Number(event.target.value))
                    }
                  />
                </label>
                <label className={`${styles.field} ${styles.notesField}`}>
                  <span>Chứng Chỉ</span>
                  <input
                    placeholder="IELTS 8.0, CELTA, TESOL"
                    value={editTeacherInfo.certifications}
                    onChange={(event) => updateEditTeacherInfo("certifications", event.target.value)}
                  />
                </label>
                <label className={`${styles.field} ${styles.notesField}`}>
                  <span>Mô Tả Bản Thân</span>
                  <textarea
                    rows={4}
                    value={editTeacherInfo.bio}
                    onChange={(event) => updateEditTeacherInfo("bio", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Ngày Tuyển Dụng</span>
                  <input
                    type="date"
                    value={editTeacherInfo.hireDate}
                    onChange={(event) => updateEditTeacherInfo("hireDate", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Loại Hợp Đồng</span>
                  <select
                    value={editTeacherInfo.contractType}
                    onChange={(event) =>
                      updateEditTeacherInfo("contractType", Number(event.target.value))
                    }
                  >
                    <option value={0}>Full-time</option>
                    <option value={1}>Part-time</option>
                    <option value={2}>Contract</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Ngày Kết Thúc Hợp Đồng</span>
                  <input
                    type="date"
                    value={editTeacherInfo.contractEndDate}
                    onChange={(event) => updateEditTeacherInfo("contractEndDate", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Trạng Thái</span>
                  <select
                    value={editTeacherInfo.status}
                    onChange={(event) => updateEditTeacherInfo("status", Number(event.target.value))}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.code} value={option.code}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Loại Lương</span>
                  <select
                    value={editTeacherInfo.salaryType}
                    onChange={(event) =>
                      updateEditTeacherInfo("salaryType", Number(event.target.value))
                    }
                  >
                    <option value={0}>Lương cơ bản</option>
                    <option value={1}>Theo giờ</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Lương cơ bản</span>
                  <input
                    min={0}
                    type="number"
                    value={editTeacherInfo.baseSalary}
                    onChange={(event) =>
                      updateEditTeacherInfo("baseSalary", Number(event.target.value))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Rate theo giờ</span>
                  <input
                    min={0}
                    type="number"
                    value={editTeacherInfo.hourlyRate ?? ""}
                    onChange={(event) =>
                      updateEditTeacherInfo(
                        "hourlyRate",
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Số tài khoản ngân hàng</span>
                  <input
                    value={editTeacherInfo.bankAccountNumber}
                    onChange={(event) =>
                      updateEditTeacherInfo("bankAccountNumber", event.target.value)
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Tên ngân hàng</span>
                  <input
                    value={editTeacherInfo.bankName}
                    onChange={(event) => updateEditTeacherInfo("bankName", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Mã số thuế</span>
                  <input
                    value={editTeacherInfo.taxCode}
                    onChange={(event) => updateEditTeacherInfo("taxCode", event.target.value)}
                  />
                </label>
              </div>

              <div className={styles.formActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => setEditTeacherInfo(initialEditTeacherInfo)}
                >
                  Hủy
                </button>
                <button type="submit">
                  <Save aria-hidden="true" size={17} />
                  Lưu thay đổi
                </button>
              </div>
            </form>
          )}

          {editActiveTab === "performance" && (
            <form onSubmit={handlePerformanceSubmit}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Hiệu Suất</h2>
                  <p>Mock các chỉ số hiệu suất, có thể cập nhật trực tiếp.</p>
                </div>
              </div>

              <div className={styles.performanceFormGrid}>
                <label className={styles.field}>
                  <span>Tổng lớp phụ trách</span>
                  <input
                    min={0}
                    type="number"
                    value={performanceForm.totalClasses}
                    onChange={(event) =>
                      updatePerformanceForm("totalClasses", Number(event.target.value))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Lớp đã hoàn thành</span>
                  <input
                    min={0}
                    type="number"
                    value={performanceForm.completedClasses}
                    onChange={(event) =>
                      updatePerformanceForm("completedClasses", Number(event.target.value))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Tổng giờ dạy</span>
                  <input
                    min={0}
                    type="number"
                    value={performanceForm.teachingHours}
                    onChange={(event) =>
                      updatePerformanceForm("teachingHours", Number(event.target.value))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Tỷ lệ hoàn thành (%)</span>
                  <input
                    max={100}
                    min={0}
                    type="number"
                    value={performanceForm.completionRate}
                    onChange={(event) =>
                      updatePerformanceForm("completionRate", Number(event.target.value))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Đánh giá trung bình</span>
                  <input
                    max={5}
                    min={0}
                    step="0.1"
                    type="number"
                    value={performanceForm.averageRating}
                    onChange={(event) =>
                      updatePerformanceForm("averageRating", Number(event.target.value))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Điểm phản hồi (%)</span>
                  <input
                    max={100}
                    min={0}
                    type="number"
                    value={performanceForm.feedbackScore}
                    onChange={(event) =>
                      updatePerformanceForm("feedbackScore", Number(event.target.value))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Doanh thu tháng</span>
                  <input
                    min={0}
                    type="number"
                    value={performanceForm.monthlyRevenue}
                    onChange={(event) =>
                      updatePerformanceForm("monthlyRevenue", Number(event.target.value))
                    }
                  />
                </label>
                <label className={`${styles.field} ${styles.notesField}`}>
                  <span>Ghi chú hiệu suất</span>
                  <textarea
                    rows={4}
                    value={performanceForm.note}
                    onChange={(event) => updatePerformanceForm("note", event.target.value)}
                  />
                </label>
              </div>

              <div className={styles.performanceSummary}>
                <article>
                  <BarChart3 aria-hidden="true" size={20} />
                  <span>Tỷ lệ hoàn thành</span>
                  <strong>{performanceForm.completionRate}%</strong>
                </article>
                <article>
                  <Clock aria-hidden="true" size={20} />
                  <span>Tổng giờ dạy</span>
                  <strong>{performanceForm.teachingHours}h</strong>
                </article>
                <article>
                  <UserRoundCheck aria-hidden="true" size={20} />
                  <span>Đánh giá</span>
                  <strong>{performanceForm.averageRating}/5</strong>
                </article>
              </div>

              <div className={styles.formActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() =>
                    setPerformanceForm(
                      performanceByTeacherId[String(recordId ?? teacherRecords[0].id)] ??
                        performanceByTeacherId["1"],
                    )
                  }
                >
                  Hủy
                </button>
                <button type="submit">
                  <Save aria-hidden="true" size={17} />
                  Lưu hiệu suất
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (isSubmitting) {
      return;
    }

    const selectedAccount = accountRecords.find((account) => String(account.id) === selectedAccountId);
    const payload = {
      ...toPayload(teacherInfo),
      isAccountExists: accountMode === "existing",
      account:
        accountMode === "existing"
          ? {
              userId: selectedAccount?.id ?? null,
              role: accountForm.role,
            }
          : {
              userId: null,
              email: accountForm.email.trim(),
              phoneNumber: accountForm.phoneNumber.trim() || null,
              fullName: accountForm.fullName.trim(),
              role: accountForm.role,
              password: accountForm.password.trim(),
            },
    };

    setIsSubmitting(true);

    try {
      await adminTeachersApi.create(payload);
      toastSuccess("Tạo giáo viên thành công.");
      navigate("/admin/teachers");
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
                <p>Nhập thông tin hồ sơ giáo viên.</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Họ Tên</span>
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
                <span>Số Điện Thoại</span>
                <input
                  value={teacherInfo.phoneNumber}
                  onChange={(event) => updateTeacherInfo("phoneNumber", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Ngày Sinh</span>
                <input
                  type="date"
                  value={teacherInfo.dateOfBirth}
                  onChange={(event) => updateTeacherInfo("dateOfBirth", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Giới Tính</span>
                <select
                  value={teacherInfo.gender}
                  onChange={(event) => updateTeacherInfo("gender", Number(event.target.value))}
                >
                  {genderOptions.map((option) => (
                    <option key={option.code} value={option.code}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Địa Chỉ</span>
                <input
                  value={teacherInfo.address}
                  onChange={(event) => updateTeacherInfo("address", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>CMND/CCCD</span>
                <input
                  value={teacherInfo.nationalId}
                  onChange={(event) => updateTeacherInfo("nationalId", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Ngày cấp CMND/CCCD</span>
                <input
                  type="date"
                  value={teacherInfo.nationalIdIssuedDate}
                  onChange={(event) =>
                    updateTeacherInfo("nationalIdIssuedDate", event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Địa điểm cấp CMND/CCCD</span>
                <input
                  value={teacherInfo.nationalIdIssuedPlace}
                  onChange={(event) =>
                    updateTeacherInfo("nationalIdIssuedPlace", event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Chuyên môn</span>
                <input
                  value={teacherInfo.specialization}
                  onChange={(event) =>
                    updateTeacherInfo("specialization", event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Bằng cấp</span>
                <input
                  value={teacherInfo.degree}
                  onChange={(event) => updateTeacherInfo("degree", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Số Năm Kinh Nghiệm</span>
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
                <span>Chứng Chỉ</span>
                <input
                  placeholder="IELTS 8.0, CELTA, TESOL"
                  value={teacherInfo.certifications}
                  onChange={(event) => updateTeacherInfo("certifications", event.target.value)}
                />
              </label>
              <label className={`${styles.field} ${styles.notesField}`}>
                <span>Mô Tả Bản Thân</span>
                <textarea
                  rows={4}
                  value={teacherInfo.bio}
                  onChange={(event) => updateTeacherInfo("bio", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Ngày Tuyển Dụng</span>
                <input
                  type="date"
                  value={teacherInfo.hireDate}
                  onChange={(event) => updateTeacherInfo("hireDate", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Loại Hợp Đồng</span>
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
                <span>Ngày Kết Thúc Hợp Đồng</span>
                <input
                  type="date"
                  value={teacherInfo.contractEndDate}
                  onChange={(event) =>
                    updateTeacherInfo("contractEndDate", event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Trạng Thái</span>
                <select
                  value={teacherInfo.status}
                  onChange={(event) => updateTeacherInfo("status", Number(event.target.value))}
                >
                  {statusOptions.map((option) => (
                    <option key={option.code} value={option.code}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Loại Lương</span>
                <select
                  value={teacherInfo.salaryType}
                  onChange={(event) =>
                    updateTeacherInfo("salaryType", Number(event.target.value))
                  }
                >
                  <option value={0}>Lương cơ bản</option>
                  <option value={1}>Theo giờ</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Lương cơ bản</span>
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
                <span>Rate theo giờ</span>
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
                <span>Số tài khoản ngân hàng</span>
                <input
                  value={teacherInfo.bankAccountNumber}
                  onChange={(event) =>
                    updateTeacherInfo("bankAccountNumber", event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Tên ngân hàng</span>
                <input
                  value={teacherInfo.bankName}
                  onChange={(event) => updateTeacherInfo("bankName", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Mã số thuế</span>
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
              <label className={styles.field}>
                <span>Role</span>
                <select
                  value={accountForm.role}
                  onChange={(event) => updateAccountForm("role", event.target.value)}
                >
                  {roleOptions.map((role) => (
                    <option key={role.roleId} value={role.roleName}>{role.roleName}</option>
                  ))}
                </select>
              </label>

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
                          selectedAccountId === String(account.id) ? styles.selectedAccount : ""
                        }
                        key={account.id}
                        type="button"
                        onClick={() => setSelectedAccountId(String(account.id))}
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
                      <LockKeyhole aria-hidden="true" className={styles.passwordIcon} size={16} />
                      <input
                        type={showAccountPassword ? "text" : "password"}
                        autoComplete="new-password"
                        name="teacher-account-password"
                        value={accountForm.password}
                        onChange={(event) =>
                          updateAccountForm("password", event.target.value)
                        }
                      />
                      <span className={styles.passwordActions}>
                        <button
                          type="button"
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
                          aria-label="Tự sinh mật khẩu"
                          title="Tự sinh mật khẩu"
                          onClick={handleGeneratePassword}
                        >
                          <WandSparkles aria-hidden="true" size={17} />
                        </button>
                      </span>
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
              disabled={isSubmitting}
              onClick={() => setCurrentStep(1)}
            >
              Quay lại
            </button>
          )}
          <button type="submit" disabled={isSubmitting}>
            {currentStep === 1 ? "Tiếp tục" : isSubmitting ? "Đang tạo..." : "Tạo giáo viên"}
            <ChevronRight aria-hidden="true" size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}
