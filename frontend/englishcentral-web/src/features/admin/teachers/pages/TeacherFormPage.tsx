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
  Save,
  UserPlus,
  UserRoundCheck,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorMessage, toastDanger, toastSuccess } from "@/components/ui";
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
  contractType: string;
  dateOfBirth: string;
  degree: string;
  email: string;
  fullName: string;
  gender: string;
  hireDate: string;
  hourlyRate: number | null;
  nationalId: string;
  nationalIdIssuedDate: string;
  nationalIdIssuedPlace: string;
  phoneNumber: string;
  role: string;
  salaryType: string;
  specialization: string;
  status: string;
  taxCode: string;
  yearsOfExperience: number;
};

type AccountForm = {
  password: string;
};

type AccountMode = "existing" | "new";
type TeacherCreateErrors = Partial<
  Record<keyof TeacherInfoForm | "accountPassword" | "selectedAccountId", string>
>;
type TeacherInfoErrors = Partial<Record<keyof TeacherInfoForm, string>>;
function getToday() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

const formatAmount = (value: number | null) =>
  value === null
    ? ""
    : new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
      }).format(value);

const parseAmount = (value: string) => {
  const normalizedValue = value.replace(/,/g, "").trim();

  if (!normalizedValue) {
    return null;
  }

  const amount = Number(normalizedValue);

  return Number.isNaN(amount) ? null : amount;
};

type TeacherValidationOptions = {
  contractTypes: MetadataOption[];
  genders: MetadataOption[];
  includeRole?: boolean;
  salaryTypes: MetadataOption[];
  statuses: MetadataOption[];
};

const validateTeacherFields = (
  value: TeacherInfoForm,
  options: TeacherValidationOptions,
) => {
  const nextErrors: TeacherInfoErrors = {};
  const today = getToday();
  const certifications = splitCertifications(value.certifications);

  if (!value.fullName.trim()) nextErrors.fullName = "Vui lòng nhập họ tên.";
  else if (value.fullName.trim().length > 20) nextErrors.fullName = "Họ tên không được quá 20 ký tự.";

  if (!value.email.trim()) nextErrors.email = "Vui lòng nhập email.";
  else if (!isValidEmail(value.email.trim())) nextErrors.email = "Email không đúng định dạng.";
  else if (value.email.trim().length > 20) nextErrors.email = "Email không được quá 20 ký tự.";

  if (!value.phoneNumber.trim()) nextErrors.phoneNumber = "Vui lòng nhập số điện thoại.";
  else if (!isValidPhoneNumber(value.phoneNumber.trim())) nextErrors.phoneNumber = "Số điện thoại không đúng định dạng.";
  else if (value.phoneNumber.trim().length > 20) nextErrors.phoneNumber = "Số điện thoại không được quá 20 ký tự.";

  if (!value.dateOfBirth) nextErrors.dateOfBirth = "Vui lòng chọn ngày sinh.";
  else if (value.dateOfBirth >= today) nextErrors.dateOfBirth = "Ngày sinh phải nhỏ hơn ngày hiện tại.";

  if (options.genders.length > 0 && !options.genders.some((option) => option.value === value.gender)) {
    nextErrors.gender = "Giới tính không hợp lệ.";
  }

  if (value.address.length > 500) nextErrors.address = "Địa chỉ không được quá 500 ký tự.";

  if (!value.nationalId.trim()) nextErrors.nationalId = "Vui lòng nhập CMND/CCCD.";
  else if (value.nationalId.trim().length > 50) nextErrors.nationalId = "CMND/CCCD không được quá 50 ký tự.";

  if (!value.nationalIdIssuedDate) nextErrors.nationalIdIssuedDate = "Vui lòng chọn ngày cấp CMND/CCCD.";
  else if (value.nationalIdIssuedDate > today) nextErrors.nationalIdIssuedDate = "Ngày cấp CMND/CCCD không được lớn hơn ngày hiện tại.";

  if (!value.nationalIdIssuedPlace.trim()) nextErrors.nationalIdIssuedPlace = "Vui lòng nhập nơi cấp CMND/CCCD.";
  else if (value.nationalIdIssuedPlace.trim().length > 255) nextErrors.nationalIdIssuedPlace = "Nơi cấp CMND/CCCD không được quá 255 ký tự.";

  if (value.specialization.length > 255) nextErrors.specialization = "Chuyên môn không được quá 255 ký tự.";
  if (value.degree.length > 255) nextErrors.degree = "Bằng cấp không được quá 255 ký tự.";
  if (value.bio.length > 500) nextErrors.bio = "Mô tả bản thân không được quá 500 ký tự.";
  if (value.yearsOfExperience < 0 || value.yearsOfExperience > 60) nextErrors.yearsOfExperience = "Số năm kinh nghiệm phải từ 0 đến 60.";
  if (certifications.some((certification) => certification.length > 255)) nextErrors.certifications = "Mỗi chứng chỉ không được quá 255 ký tự.";

  if (!value.hireDate) nextErrors.hireDate = "Vui lòng chọn ngày tuyển dụng.";
  if (options.contractTypes.length > 0 && !options.contractTypes.some((option) => option.value === value.contractType)) nextErrors.contractType = "Loại hợp đồng không hợp lệ.";
  if (value.contractEndDate && value.hireDate && value.contractEndDate <= value.hireDate) nextErrors.contractEndDate = "Ngày kết thúc hợp đồng phải lớn hơn ngày tuyển dụng.";
  if (options.statuses.length > 0 && !options.statuses.some((option) => option.value === value.status)) nextErrors.status = "Trạng thái không hợp lệ.";
  if (options.salaryTypes.length > 0 && !options.salaryTypes.some((option) => option.value === value.salaryType)) nextErrors.salaryType = "Loại lương không hợp lệ.";
  if (value.baseSalary < 0) nextErrors.baseSalary = "Lương cơ bản phải lớn hơn hoặc bằng 0.";
  if (value.hourlyRate !== null && value.hourlyRate < 0) nextErrors.hourlyRate = "Rate theo giờ phải lớn hơn hoặc bằng 0.";

  if (!value.bankAccountNumber.trim()) nextErrors.bankAccountNumber = "Vui lòng nhập số tài khoản ngân hàng.";
  else if (value.bankAccountNumber.trim().length > 50) nextErrors.bankAccountNumber = "Số tài khoản ngân hàng không được quá 50 ký tự.";

  if (!value.bankName.trim()) nextErrors.bankName = "Vui lòng nhập tên ngân hàng.";
  else if (value.bankName.trim().length > 50) nextErrors.bankName = "Tên ngân hàng không được quá 50 ký tự.";

  if (!value.taxCode.trim()) nextErrors.taxCode = "Vui lòng nhập mã số thuế.";
  else if (value.taxCode.trim().length > 50) nextErrors.taxCode = "Mã số thuế không được quá 50 ký tự.";

  if (options.includeRole && !value.role) nextErrors.role = "Vui lòng chọn role.";

  return nextErrors;
};

const initialTeacherInfo: TeacherInfoForm = {
  address: "",
  bankAccountNumber: "",
  bankName: "",
  baseSalary: 0,
  bio: "",
  certifications: "",
  contractEndDate: "",
  contractType: "FullTime",
  dateOfBirth: "",
  degree: "",
  email: "",
  fullName: "",
  gender: "Male",
  hireDate: getToday(),
  hourlyRate: null,
  nationalId: "",
  nationalIdIssuedDate: "",
  nationalIdIssuedPlace: "",
  phoneNumber: "",
  role: "",
  salaryType: "Fixed",
  specialization: "",
  status: "Active",
  taxCode: "",
  yearsOfExperience: 0,
};

const initialAccountForm: AccountForm = {
  password: "",
};

const toTeacherInfoForm = (teacher: AdminTeacher): TeacherInfoForm => ({
  address: teacher.address ?? "",
  bankAccountNumber: teacher.bankAccountNumber ?? "",
  bankName: teacher.bankName ?? "",
  baseSalary: teacher.baseSalary ?? 0,
  bio: teacher.bio ?? "",
  certifications: teacher.certifications?.join(", ") ?? "",
  contractEndDate: teacher.contractEndDate ?? "",
  contractType: String(teacher.contractType ?? "FullTime"),
  dateOfBirth: teacher.dateOfBirth ?? "",
  degree: teacher.degree ?? "",
  email: teacher.email ?? "",
  fullName: teacher.fullName,
  gender: String(teacher.gender),
  hireDate: teacher.hireDate ?? "",
  hourlyRate: teacher.hourlyRate ?? null,
  nationalId: teacher.nationalId ?? "",
  nationalIdIssuedDate: teacher.nationalIdIssuedDate ?? "",
  nationalIdIssuedPlace: teacher.nationalIdIssuedPlace ?? "",
  phoneNumber: teacher.phoneNumber ?? "",
  role: "",
  salaryType: String(teacher.salaryType),
  specialization: teacher.specialization ?? "",
  status: String(teacher.status),
  taxCode: teacher.taxCode ?? "",
  yearsOfExperience: teacher.yearsOfExperience ?? 0,
});

const splitCertifications = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPhoneNumber = (value: string) => /^\+?[0-9\s\-()]+$/.test(value);

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
  const [accountMode, setAccountMode] = useState<AccountMode>("existing");
  const [accountSearch, setAccountSearch] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [accountForm, setAccountForm] = useState<AccountForm>(initialAccountForm);
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [accountRecords, setAccountRecords] = useState<AdminAccount[]>([]);
  const [statusOptions, setStatusOptions] = useState<MetadataOption[]>([]);
  const [genderOptions, setGenderOptions] = useState<MetadataOption[]>([]);
  const [contractTypeOptions, setContractTypeOptions] = useState<MetadataOption[]>([]);
  const [salaryTypeOptions, setSalaryTypeOptions] = useState<MetadataOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleMetadataOption[]>([]);
  const [errors, setErrors] = useState<TeacherCreateErrors>({});
  const [editErrors, setEditErrors] = useState<TeacherInfoErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      adminMetadataApi.getTeacherStatusOptions(),
      adminMetadataApi.getGenderOptions(),
      adminMetadataApi.getContractTypeOptions(),
      adminMetadataApi.getSalaryTypeOptions(),
      adminMetadataApi.getRoleOptions(),
    ])
      .then(([statuses, genders, contractTypes, salaryTypes, roles]) => {
        setStatusOptions(statuses);
        setGenderOptions(genders);
        setContractTypeOptions(contractTypes);
        setSalaryTypeOptions(salaryTypes);
        setRoleOptions(roles);
        setTeacherInfo((current) => ({
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
        .getTeacherAccounts(accountSearch)
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
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };

  const updateEditTeacherInfo = <Key extends keyof TeacherInfoForm>(
    field: Key,
    value: TeacherInfoForm[Key],
  ) => {
    setEditTeacherInfo((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
    setEditErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
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

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!recordId || isSubmitting) {
      return;
    }

    const nextErrors = validateTeacherFields(editTeacherInfo, {
      contractTypes: contractTypeOptions,
      genders: genderOptions,
      salaryTypes: salaryTypeOptions,
      statuses: statusOptions,
    });
    setEditErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
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
          <form onSubmit={handleEditSubmit}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Thông tin giáo viên</h2>
                  <p>Cập nhật theo cấu trúc thông tin ở flow tạo giáo viên.</p>
                </div>
              </div>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Họ Tên <em className={styles.requiredMark}>*</em></span>
                  <input
                    value={editTeacherInfo.fullName}
                    onChange={(event) => updateEditTeacherInfo("fullName", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.fullName} />
                </label>
                <label className={styles.field}>
                  <span>Email <em className={styles.requiredMark}>*</em></span>
                  <input
                    type="email"
                    value={editTeacherInfo.email}
                    onChange={(event) => updateEditTeacherInfo("email", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.email} />
                </label>
                <label className={styles.field}>
                  <span>Số Điện Thoại <em className={styles.requiredMark}>*</em></span>
                  <input
                    value={editTeacherInfo.phoneNumber}
                    onChange={(event) => updateEditTeacherInfo("phoneNumber", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.phoneNumber} />
                </label>
                <label className={styles.field}>
                  <span>Ngày Sinh <em className={styles.requiredMark}>*</em></span>
                  <input
                    type="date"
                    value={editTeacherInfo.dateOfBirth}
                    onChange={(event) => updateEditTeacherInfo("dateOfBirth", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.dateOfBirth} />
                </label>
                <label className={styles.field}>
                  <span>Giới Tính <em className={styles.requiredMark}>*</em></span>
                  <select
                    value={editTeacherInfo.gender}
                    onChange={(event) => updateEditTeacherInfo("gender", event.target.value)}
                  >
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.value}</option>
                    ))}
                  </select>
                  <ErrorMessage message={editErrors.gender} />
                </label>
                <label className={styles.field}>
                  <span>Địa Chỉ</span>
                  <input
                    value={editTeacherInfo.address}
                    onChange={(event) => updateEditTeacherInfo("address", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.address} />
                </label>
                <label className={styles.field}>
                  <span>CMND/CCCD <em className={styles.requiredMark}>*</em></span>
                  <input
                    value={editTeacherInfo.nationalId}
                    onChange={(event) => updateEditTeacherInfo("nationalId", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.nationalId} />
                </label>
                <label className={styles.field}>
                  <span>Ngày cấp CMND/CCCD <em className={styles.requiredMark}>*</em></span>
                  <input
                    type="date"
                    value={editTeacherInfo.nationalIdIssuedDate}
                    onChange={(event) =>
                      updateEditTeacherInfo("nationalIdIssuedDate", event.target.value)
                    }
                  />
                  <ErrorMessage message={editErrors.nationalIdIssuedDate} />
                </label>
                <label className={styles.field}>
                  <span>Địa điểm cấp CMND/CCCD <em className={styles.requiredMark}>*</em></span>
                  <input
                    value={editTeacherInfo.nationalIdIssuedPlace}
                    onChange={(event) =>
                      updateEditTeacherInfo("nationalIdIssuedPlace", event.target.value)
                    }
                  />
                  <ErrorMessage message={editErrors.nationalIdIssuedPlace} />
                </label>
                <label className={styles.field}>
                  <span>Chuyên môn</span>
                  <input
                    value={editTeacherInfo.specialization}
                    onChange={(event) => updateEditTeacherInfo("specialization", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.specialization} />
                </label>
                <label className={styles.field}>
                  <span>Bằng cấp</span>
                  <input
                    value={editTeacherInfo.degree}
                    onChange={(event) => updateEditTeacherInfo("degree", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.degree} />
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
                  <ErrorMessage message={editErrors.yearsOfExperience} />
                </label>
                <label className={`${styles.field} ${styles.notesField}`}>
                  <span>Chứng Chỉ</span>
                  <input
                    placeholder="IELTS 8.0, CELTA, TESOL"
                    value={editTeacherInfo.certifications}
                    onChange={(event) => updateEditTeacherInfo("certifications", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.certifications} />
                </label>
                <label className={`${styles.field} ${styles.notesField}`}>
                  <span>Mô Tả Bản Thân</span>
                  <textarea
                    rows={4}
                    value={editTeacherInfo.bio}
                    onChange={(event) => updateEditTeacherInfo("bio", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.bio} />
                </label>
                <label className={styles.field}>
                  <span>Ngày Tuyển Dụng <em className={styles.requiredMark}>*</em></span>
                  <input
                    type="date"
                    value={editTeacherInfo.hireDate}
                    onChange={(event) => updateEditTeacherInfo("hireDate", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.hireDate} />
                </label>
                <label className={styles.field}>
                  <span>Loại Hợp Đồng</span>
                  <select
                    value={editTeacherInfo.contractType}
                    onChange={(event) =>
                      updateEditTeacherInfo("contractType", event.target.value)
                    }
                  >
                    {contractTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.value}</option>
                    ))}
                  </select>
                  <ErrorMessage message={editErrors.contractType} />
                </label>
                <label className={styles.field}>
                  <span>Ngày Kết Thúc Hợp Đồng</span>
                  <input
                    type="date"
                    value={editTeacherInfo.contractEndDate}
                    onChange={(event) => updateEditTeacherInfo("contractEndDate", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.contractEndDate} />
                </label>
                <label className={styles.field}>
                  <span>Trạng Thái <em className={styles.requiredMark}>*</em></span>
                  <select
                    value={editTeacherInfo.status}
                    onChange={(event) => updateEditTeacherInfo("status", event.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.value}</option>
                    ))}
                  </select>
                  <ErrorMessage message={editErrors.status} />
                </label>
                <label className={styles.field}>
                  <span>Loại Lương <em className={styles.requiredMark}>*</em></span>
                  <select
                    value={editTeacherInfo.salaryType}
                    onChange={(event) =>
                      updateEditTeacherInfo("salaryType", event.target.value)
                    }
                  >
                    {salaryTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.value}</option>
                    ))}
                  </select>
                  <ErrorMessage message={editErrors.salaryType} />
                </label>
                <label className={styles.field}>
                  <span>Lương cơ bản</span>
                  <input
                    inputMode="decimal"
                    value={formatAmount(editTeacherInfo.baseSalary)}
                    onChange={(event) => {
                      const amount = parseAmount(event.target.value);

                      updateEditTeacherInfo("baseSalary", amount ?? 0);
                    }}
                  />
                  <ErrorMessage message={editErrors.baseSalary} />
                </label>
                <label className={styles.field}>
                  <span>Rate theo giờ</span>
                  <input
                    inputMode="decimal"
                    value={formatAmount(editTeacherInfo.hourlyRate)}
                    onChange={(event) =>
                      updateEditTeacherInfo("hourlyRate", parseAmount(event.target.value))
                    }
                  />
                  <ErrorMessage message={editErrors.hourlyRate} />
                </label>
                <label className={styles.field}>
                  <span>Số tài khoản ngân hàng <em className={styles.requiredMark}>*</em></span>
                  <input
                    value={editTeacherInfo.bankAccountNumber}
                    onChange={(event) =>
                      updateEditTeacherInfo("bankAccountNumber", event.target.value)
                    }
                  />
                  <ErrorMessage message={editErrors.bankAccountNumber} />
                </label>
                <label className={styles.field}>
                  <span>Tên ngân hàng <em className={styles.requiredMark}>*</em></span>
                  <input
                    value={editTeacherInfo.bankName}
                    onChange={(event) => updateEditTeacherInfo("bankName", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.bankName} />
                </label>
                <label className={styles.field}>
                  <span>Mã số thuế <em className={styles.requiredMark}>*</em></span>
                  <input
                    value={editTeacherInfo.taxCode}
                    onChange={(event) => updateEditTeacherInfo("taxCode", event.target.value)}
                  />
                  <ErrorMessage message={editErrors.taxCode} />
                </label>
              </div>

              <div className={styles.formActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => {
                    setEditTeacherInfo(initialEditTeacherInfo);
                    setEditErrors({});
                  }}
                >
                  Hủy
                </button>
                <button type="submit">
                  <Save aria-hidden="true" size={17} />
                  Lưu thay đổi
                </button>
              </div>
          </form>
        </section>
      </div>
    );
  }

  const validateTeacherInfo = () => {
    const nextErrors: TeacherCreateErrors = {};
    const today = getToday();
    const certifications = splitCertifications(teacherInfo.certifications);

    if (!teacherInfo.fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ tên.";
    } else if (teacherInfo.fullName.trim().length > 20) {
      nextErrors.fullName = "Họ tên không được quá 20 ký tự.";
    }

    if (!teacherInfo.email.trim()) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!isValidEmail(teacherInfo.email.trim())) {
      nextErrors.email = "Email không đúng định dạng.";
    } else if (teacherInfo.email.trim().length > 20) {
      nextErrors.email = "Email không được quá 20 ký tự.";
    }

    if (!teacherInfo.phoneNumber.trim()) {
      nextErrors.phoneNumber = "Vui lòng nhập số điện thoại.";
    } else if (!isValidPhoneNumber(teacherInfo.phoneNumber.trim())) {
      nextErrors.phoneNumber = "Số điện thoại không đúng định dạng.";
    } else if (teacherInfo.phoneNumber.trim().length > 20) {
      nextErrors.phoneNumber = "Số điện thoại không được quá 20 ký tự.";
    }

    if (!teacherInfo.dateOfBirth) {
      nextErrors.dateOfBirth = "Vui lòng chọn ngày sinh.";
    } else if (teacherInfo.dateOfBirth >= today) {
      nextErrors.dateOfBirth = "Ngày sinh phải nhỏ hơn ngày hiện tại.";
    }

    if (
      genderOptions.length > 0
      && !genderOptions.some((option) => option.value === teacherInfo.gender)
    ) {
      nextErrors.gender = "Giới tính không hợp lệ.";
    }

    if (teacherInfo.address.length > 500) {
      nextErrors.address = "Địa chỉ không được quá 500 ký tự.";
    }

    if (!teacherInfo.nationalId.trim()) {
      nextErrors.nationalId = "Vui lòng nhập CMND/CCCD.";
    } else if (teacherInfo.nationalId.trim().length > 50) {
      nextErrors.nationalId = "CMND/CCCD không được quá 50 ký tự.";
    }

    if (!teacherInfo.nationalIdIssuedDate) {
      nextErrors.nationalIdIssuedDate = "Vui lòng chọn ngày cấp CMND/CCCD.";
    } else if (teacherInfo.nationalIdIssuedDate > today) {
      nextErrors.nationalIdIssuedDate = "Ngày cấp CMND/CCCD không được lớn hơn ngày hiện tại.";
    }

    if (!teacherInfo.nationalIdIssuedPlace.trim()) {
      nextErrors.nationalIdIssuedPlace = "Vui lòng nhập nơi cấp CMND/CCCD.";
    } else if (teacherInfo.nationalIdIssuedPlace.trim().length > 255) {
      nextErrors.nationalIdIssuedPlace = "Nơi cấp CMND/CCCD không được quá 255 ký tự.";
    }

    if (teacherInfo.specialization.length > 255) {
      nextErrors.specialization = "Chuyên môn không được quá 255 ký tự.";
    }

    if (teacherInfo.degree.length > 255) {
      nextErrors.degree = "Bằng cấp không được quá 255 ký tự.";
    }

    if (teacherInfo.bio.length > 500) {
      nextErrors.bio = "Mô tả bản thân không được quá 500 ký tự.";
    }

    if (teacherInfo.yearsOfExperience < 0 || teacherInfo.yearsOfExperience > 60) {
      nextErrors.yearsOfExperience = "Số năm kinh nghiệm phải từ 0 đến 60.";
    }

    if (certifications.some((certification) => certification.length > 255)) {
      nextErrors.certifications = "Mỗi chứng chỉ không được quá 255 ký tự.";
    }

    if (!teacherInfo.hireDate) {
      nextErrors.hireDate = "Vui lòng chọn ngày tuyển dụng.";
    }

    if (
      contractTypeOptions.length > 0
      && !contractTypeOptions.some((option) => option.value === teacherInfo.contractType)
    ) {
      nextErrors.contractType = "Loại hợp đồng không hợp lệ.";
    }

    if (
      teacherInfo.contractEndDate
      && teacherInfo.hireDate
      && teacherInfo.contractEndDate <= teacherInfo.hireDate
    ) {
      nextErrors.contractEndDate = "Ngày kết thúc hợp đồng phải lớn hơn ngày tuyển dụng.";
    }

    if (
      statusOptions.length > 0
      && !statusOptions.some((option) => option.value === teacherInfo.status)
    ) {
      nextErrors.status = "Trạng thái không hợp lệ.";
    }

    if (
      salaryTypeOptions.length > 0
      && !salaryTypeOptions.some((option) => option.value === teacherInfo.salaryType)
    ) {
      nextErrors.salaryType = "Loại lương không hợp lệ.";
    }

    if (teacherInfo.baseSalary < 0) {
      nextErrors.baseSalary = "Lương cơ bản phải lớn hơn hoặc bằng 0.";
    }

    if (teacherInfo.hourlyRate !== null && teacherInfo.hourlyRate < 0) {
      nextErrors.hourlyRate = "Rate theo giờ phải lớn hơn hoặc bằng 0.";
    }

    if (!teacherInfo.bankAccountNumber.trim()) {
      nextErrors.bankAccountNumber = "Vui lòng nhập số tài khoản ngân hàng.";
    } else if (teacherInfo.bankAccountNumber.trim().length > 50) {
      nextErrors.bankAccountNumber = "Số tài khoản ngân hàng không được quá 50 ký tự.";
    }

    if (!teacherInfo.bankName.trim()) {
      nextErrors.bankName = "Vui lòng nhập tên ngân hàng.";
    } else if (teacherInfo.bankName.trim().length > 50) {
      nextErrors.bankName = "Tên ngân hàng không được quá 50 ký tự.";
    }

    if (!teacherInfo.taxCode.trim()) {
      nextErrors.taxCode = "Vui lòng nhập mã số thuế.";
    } else if (teacherInfo.taxCode.trim().length > 50) {
      nextErrors.taxCode = "Mã số thuế không được quá 50 ký tự.";
    }

    if (!teacherInfo.role) {
      nextErrors.role = "Vui lòng chọn role.";
    }

    return nextErrors;
  };

  const validateAccountInfo = () => {
    const nextErrors: TeacherCreateErrors = {};

    if (accountMode === "existing" && !selectedAccountId) {
      nextErrors.selectedAccountId = "Vui lòng chọn tài khoản có sẵn.";
    }

    if (accountMode === "new") {
      if (!teacherInfo.email.trim()) {
        nextErrors.email = "Vui lòng nhập email để tạo tài khoản.";
      } else if (!isValidEmail(teacherInfo.email.trim())) {
        nextErrors.email = "Email không đúng định dạng.";
      }

      if (accountForm.password.trim().length < 6) {
        nextErrors.accountPassword = "Mật khẩu cần tối thiểu 6 ký tự.";
      }
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (currentStep === 1) {
      const nextErrors = validateTeacherInfo();
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      setCurrentStep(2);
      return;
    }

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateAccountInfo();
    setErrors(nextErrors);

    if (nextErrors.email) {
      setCurrentStep(1);
      return;
    }

    if (Object.keys(nextErrors).length > 0) {
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
              role: teacherInfo.role,
            }
          : {
              userId: null,
              email: teacherInfo.email.trim(),
              phoneNumber: teacherInfo.phoneNumber.trim() || null,
              fullName: teacherInfo.fullName.trim(),
              role: teacherInfo.role,
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
                <span>Họ Tên <em className={styles.requiredMark}>*</em></span>
                <input
                  value={teacherInfo.fullName}
                  onChange={(event) => updateTeacherInfo("fullName", event.target.value)}
                />
                <ErrorMessage message={errors.fullName} />
              </label>
              <label className={styles.field}>
                <span>Email <em className={styles.requiredMark}>*</em></span>
                <input
                  value={teacherInfo.email}
                  onChange={(event) => updateTeacherInfo("email", event.target.value)}
                />
                <ErrorMessage message={errors.email} />
              </label>
              <label className={styles.field}>
                <span>Role <em className={styles.requiredMark}>*</em></span>
                <select
                  value={teacherInfo.role}
                  onChange={(event) => updateTeacherInfo("role", event.target.value)}
                >
                  {roleOptions.map((role) => (
                    <option key={role.roleId} value={role.roleName}>{role.roleName}</option>
                  ))}
                </select>
                <ErrorMessage message={errors.role} />
              </label>
              <label className={styles.field}>
                <span>Số Điện Thoại <em className={styles.requiredMark}>*</em></span>
                <input
                  value={teacherInfo.phoneNumber}
                  onChange={(event) => updateTeacherInfo("phoneNumber", event.target.value)}
                />
                <ErrorMessage message={errors.phoneNumber} />
              </label>
              <label className={styles.field}>
                <span>Ngày Sinh <em className={styles.requiredMark}>*</em></span>
                <input
                  type="date"
                  value={teacherInfo.dateOfBirth}
                  onChange={(event) => updateTeacherInfo("dateOfBirth", event.target.value)}
                />
                <ErrorMessage message={errors.dateOfBirth} />
              </label>
              <label className={styles.field}>
                <span>Giới Tính <em className={styles.requiredMark}>*</em></span>
                <select
                  value={teacherInfo.gender}
                  onChange={(event) => updateTeacherInfo("gender", event.target.value)}
                >
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.value}</option>
                  ))}
                </select>
                <ErrorMessage message={errors.gender} />
              </label>
              <label className={styles.field}>
                <span>Địa Chỉ</span>
                <input
                  value={teacherInfo.address}
                  onChange={(event) => updateTeacherInfo("address", event.target.value)}
                />
                <ErrorMessage message={errors.address} />
              </label>
              <label className={styles.field}>
                <span>CMND/CCCD <em className={styles.requiredMark}>*</em></span>
                <input
                  value={teacherInfo.nationalId}
                  onChange={(event) => updateTeacherInfo("nationalId", event.target.value)}
                />
                <ErrorMessage message={errors.nationalId} />
              </label>
              <label className={styles.field}>
                <span>Ngày cấp CMND/CCCD <em className={styles.requiredMark}>*</em></span>
                <input
                  type="date"
                  value={teacherInfo.nationalIdIssuedDate}
                  onChange={(event) =>
                    updateTeacherInfo("nationalIdIssuedDate", event.target.value)
                  }
                />
                <ErrorMessage message={errors.nationalIdIssuedDate} />
              </label>
              <label className={styles.field}>
                <span>Địa điểm cấp CMND/CCCD <em className={styles.requiredMark}>*</em></span>
                <input
                  value={teacherInfo.nationalIdIssuedPlace}
                  onChange={(event) =>
                    updateTeacherInfo("nationalIdIssuedPlace", event.target.value)
                  }
                />
                <ErrorMessage message={errors.nationalIdIssuedPlace} />
              </label>
              <label className={styles.field}>
                <span>Chuyên môn</span>
                <input
                  value={teacherInfo.specialization}
                  onChange={(event) =>
                    updateTeacherInfo("specialization", event.target.value)
                  }
                />
                <ErrorMessage message={errors.specialization} />
              </label>
              <label className={styles.field}>
                <span>Bằng cấp</span>
                <input
                  value={teacherInfo.degree}
                  onChange={(event) => updateTeacherInfo("degree", event.target.value)}
                />
                <ErrorMessage message={errors.degree} />
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
                <ErrorMessage message={errors.yearsOfExperience} />
              </label>
              <label className={`${styles.field} ${styles.notesField}`}>
                <span>Chứng Chỉ</span>
                <input
                  placeholder="IELTS 8.0, CELTA, TESOL"
                  value={teacherInfo.certifications}
                  onChange={(event) => updateTeacherInfo("certifications", event.target.value)}
                />
                <ErrorMessage message={errors.certifications} />
              </label>
              <label className={`${styles.field} ${styles.notesField}`}>
                <span>Mô Tả Bản Thân</span>
                <textarea
                  rows={4}
                  value={teacherInfo.bio}
                  onChange={(event) => updateTeacherInfo("bio", event.target.value)}
                />
                <ErrorMessage message={errors.bio} />
              </label>
              <label className={styles.field}>
                <span>Ngày Tuyển Dụng <em className={styles.requiredMark}>*</em></span>
                <input
                  type="date"
                  value={teacherInfo.hireDate}
                  onChange={(event) => updateTeacherInfo("hireDate", event.target.value)}
                />
                <ErrorMessage message={errors.hireDate} />
              </label>
              <label className={styles.field}>
                <span>Loại Hợp Đồng</span>
                <select
                  value={teacherInfo.contractType}
                  onChange={(event) =>
                    updateTeacherInfo("contractType", event.target.value)
                  }
                >
                  {contractTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.value}</option>
                  ))}
                </select>
                <ErrorMessage message={errors.contractType} />
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
                <ErrorMessage message={errors.contractEndDate} />
              </label>
              <label className={styles.field}>
                <span>Trạng Thái <em className={styles.requiredMark}>*</em></span>
                <select
                  value={teacherInfo.status}
                  onChange={(event) => updateTeacherInfo("status", event.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.value}</option>
                  ))}
                </select>
                <ErrorMessage message={errors.status} />
              </label>
              <label className={styles.field}>
                <span>Loại Lương <em className={styles.requiredMark}>*</em></span>
                <select
                  value={teacherInfo.salaryType}
                  onChange={(event) =>
                    updateTeacherInfo("salaryType", event.target.value)
                  }
                >
                  {salaryTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.value}</option>
                  ))}
                </select>
                <ErrorMessage message={errors.salaryType} />
              </label>
              <label className={styles.field}>
                <span>Lương cơ bản</span>
                <input
                  inputMode="decimal"
                  value={formatAmount(teacherInfo.baseSalary)}
                  onChange={(event) => {
                    const amount = parseAmount(event.target.value);

                    updateTeacherInfo("baseSalary", amount ?? 0);
                  }}
                />
                <ErrorMessage message={errors.baseSalary} />
              </label>
              <label className={styles.field}>
                <span>Rate theo giờ</span>
                <input
                  inputMode="decimal"
                  value={formatAmount(teacherInfo.hourlyRate)}
                  onChange={(event) =>
                    updateTeacherInfo("hourlyRate", parseAmount(event.target.value))
                  }
                />
                <ErrorMessage message={errors.hourlyRate} />
              </label>
              <label className={styles.field}>
                <span>Số tài khoản ngân hàng <em className={styles.requiredMark}>*</em></span>
                <input
                  value={teacherInfo.bankAccountNumber}
                  onChange={(event) =>
                    updateTeacherInfo("bankAccountNumber", event.target.value)
                  }
                />
                <ErrorMessage message={errors.bankAccountNumber} />
              </label>
              <label className={styles.field}>
                <span>Tên ngân hàng <em className={styles.requiredMark}>*</em></span>
                <input
                  value={teacherInfo.bankName}
                  onChange={(event) => updateTeacherInfo("bankName", event.target.value)}
                />
                <ErrorMessage message={errors.bankName} />
              </label>
              <label className={styles.field}>
                <span>Mã số thuế <em className={styles.requiredMark}>*</em></span>
                <input
                  value={teacherInfo.taxCode}
                  onChange={(event) => updateTeacherInfo("taxCode", event.target.value)}
                />
                <ErrorMessage message={errors.taxCode} />
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
                  onClick={() => {
                    setAccountMode("existing");
                    setErrors((currentErrors) => ({
                      ...currentErrors,
                      accountPassword: undefined,
                    }));
                  }}
                >
                  <UserRoundCheck aria-hidden="true" size={22} />
                  <strong>Đã có tài khoản</strong>
                  <span>Chọn account bằng email hoặc số điện thoại.</span>
                </button>
                <button
                  className={accountMode === "new" ? styles.selectedOption : ""}
                  type="button"
                  onClick={() => {
                    setAccountMode("new");
                    setAccountForm(initialAccountForm);
                    setShowAccountPassword(false);
                    setErrors((currentErrors) => ({
                      ...currentErrors,
                      selectedAccountId: undefined,
                    }));
                  }}
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
                  <span className={styles.requiredHint}>
                    Chọn tài khoản có sẵn <em className={styles.requiredMark}>*</em>
                  </span>

                  <div className={styles.resultList}>
                    {matchedAccounts.map((account) => (
                      <button
                        className={
                          selectedAccountId === String(account.id) ? styles.selectedAccount : ""
                        }
                        key={account.id}
                        type="button"
                        onClick={() => {
                          setSelectedAccountId(String(account.id));
                          setErrors((currentErrors) => ({
                            ...currentErrors,
                            selectedAccountId: undefined,
                          }));
                        }}
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
                  <ErrorMessage message={errors.selectedAccountId} />
                </div>
              ) : (
                <div className={styles.accountFormGrid}>
                  <label className={styles.field}>
                    <span>Mật khẩu <em className={styles.requiredMark}>*</em></span>
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
                    <ErrorMessage message={errors.accountPassword} />
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
