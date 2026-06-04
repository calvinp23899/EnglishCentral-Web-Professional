import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CloudDownload, Eye, Plus, Send, Search, UserRoundPlus, UserX, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { SidePanel, toastDanger, toastSuccess } from "@/components/ui";
import { adminClassesApi, type AdminClass, type ClassStudent } from "@/features/admin/classes/api/admin-classes-api";
import { adminEnrollmentsApi, type EnrollmentDiscountPayload, type EnrollmentPaymentPlanPayload, type EnrollmentStudentOption } from "@/features/admin/classes/api/admin-enrollments-api";
import { adminRoomsApi, type AdminRoom } from "@/features/admin/classes/api/admin-rooms-api";
import { adminBillingPoliciesApi, type AdminBillingPolicy } from "@/features/admin/billing-policies/api/admin-billing-policies-api";
import { adminCoursesApi, type AdminCourse } from "@/features/admin/courses/api/admin-courses-api";
import { adminDiscountsApi, type AdminDiscount } from "@/features/admin/discounts/api/admin-discounts-api";
import type { AdminEnrollment } from "@/features/admin/enrollments/api/admin-enrollment-finance-api";
import type { AdminPaymentPlan } from "@/features/admin/payment-plans/api/admin-payment-plans-api";
import { adminMetadataApi, type MetadataOption } from "@/features/admin/shared/api/admin-metadata-api";
import { adminStudentsApi } from "@/features/admin/students/api/admin-students-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import formStyles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { adminTeachersApi, type AdminTeacher } from "@/features/admin/teachers/api/admin-teachers-api";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import styles from "./ClassViewPage.module.scss";

type TabKey = "info" | "students" | "schedule" | "tuition";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "info", label: "Thông tin lớp" },
  { key: "students", label: "Danh sách học viên" },
  { key: "schedule", label: "Lịch học" },
  { key: "tuition", label: "Học phí" },
];

const statusLabels: Record<string, string> = {
  "1": "Nháp",
  "2": "Mở đăng ký",
  "3": "Đang học",
  "4": "Hoàn thành",
  "5": "Đã hủy",
  Draft: "Nháp",
  Open: "Mở đăng ký",
  Ongoing: "Đang học",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};

const studentStatusLabels: Record<string, string> = {
  "1": "Đang học",
  "2": "Chờ tư vấn",
  "3": "Tạm dừng",
};

const studentStatusTone: Record<string, "active" | "pending" | "inactive"> = {
  "1": "active",
  "2": "pending",
  "3": "inactive",
};

const formatDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "Chưa cập nhật";

const truncateText = (value: string, maxLength = 10) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
const paymentPlanTypeLabels: Record<string, string> = { "1": "Thanh toán đủ", "2": "Theo tháng", "3": "Trả góp", FullPayment: "Thanh toán đủ", Monthly: "Theo tháng", Installment: "Trả góp" };
const formatMoney = (value: number) => `${new Intl.NumberFormat("en-US").format(value)} đ`;
const toMoney = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;
const moneyInput = (value: string | number) => new Intl.NumberFormat("en-US").format(toMoney(String(value)));
type PlanItemForm = { sequenceNumber: number; name: string; dueDate: string; amount: string };
const newPlanItem = (sequenceNumber: number, amount = 0): PlanItemForm => ({
  sequenceNumber,
  name: `Đợt ${sequenceNumber}`,
  dueDate: "",
  amount: moneyInput(amount),
});
const buildPlanItems = (count: number, totalAmount = 0) => {
  const safeCount = Math.max(1, count);
  const regularAmount = Math.floor(totalAmount / safeCount);
  return Array.from({ length: safeCount }, (_, index) =>
    newPlanItem(index + 1, index === safeCount - 1 ? totalAmount - regularAmount * (safeCount - 1) : regularAmount),
  );
};
const installmentPlanTypeCode = "3";
const billingPolicyTypeCodes: Record<string, string> = {
  fullpayment: "1",
  monthly: "2",
  installment: "3",
};
const discountTypeCodes: Record<string, string> = {
  fixedamount: "1",
  amount: "1",
  percentage: "2",
  percent: "2",
};
const getPolicyTypeCode = (value: string | number | null | undefined, metadata: MetadataOption[]) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "number") return String(value);
  const rawType = String(value);
  return String(billingPolicyTypeCodes[rawType.toLowerCase()] ?? metadata.find((type) => type.value === rawType || String(type.code) === rawType)?.code ?? rawType);
};
const getDiscountTypeCode = (value: string | number | null | undefined, metadata: MetadataOption[]) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "number") return String(value);
  const rawType = String(value);
  return String(discountTypeCodes[rawType.toLowerCase()] ?? metadata.find((type) => type.value === rawType || String(type.code) === rawType)?.code ?? rawType);
};
const toPaymentPlanType = (value: string) => {
  if (value === "1" || value === "FullPayment") return "FullPayment";
  if (value === "2" || value === "Monthly") return "Monthly";
  return "Installment";
};
const toEnrollmentDiscountType = (value: string) => value === "2" || value === "Percentage" ? "Percentage" : "FixedAmount";

export function ClassViewPage() {
  const { recordId } = useParams();
  const [record, setRecord] = useState<AdminClass | null>(null);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [isStudentPanelOpen, setIsStudentPanelOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<EnrollmentStudentOption | null>(null);
  const [studentOptions, setStudentOptions] = useState<EnrollmentStudentOption[]>([]);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [selectedTuitionStudent, setSelectedTuitionStudent] = useState<ClassStudent | null>(null);
  const [isTuitionDetailOpen, setIsTuitionDetailOpen] = useState(false);
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState<{
    period: string;
    dueDate: string;
    amount: number;
    status: string;
    invoiceCode: string;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank-transfer">("cash");
  const [paymentNote, setPaymentNote] = useState("");
  const [isConfirmPaymentOpen, setIsConfirmPaymentOpen] = useState(false);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);
  const [isRegisteringStudent, setIsRegisteringStudent] = useState(false);
  const [cancellingStudent, setCancellingStudent] = useState<ClassStudent | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonError, setCancelReasonError] = useState("");
  const [isCancellingEnrollment, setIsCancellingEnrollment] = useState(false);
  const [recentEnrollment, setRecentEnrollment] = useState<{ enrollment: AdminEnrollment; paymentPlan: AdminPaymentPlan | null } | null>(null);
  const [isCustomPaymentPlan, setIsCustomPaymentPlan] = useState(false);
  const [billingPolicies, setBillingPolicies] = useState<AdminBillingPolicy[]>([]);
  const [planTypes, setPlanTypes] = useState<MetadataOption[]>([]);
  const [billingPolicyId, setBillingPolicyId] = useState("");
  const [planType, setPlanType] = useState("3");
  const [numberOfInstallments, setNumberOfInstallments] = useState("2");
  const [planNotes, setPlanNotes] = useState("");
  const [planItems, setPlanItems] = useState<PlanItemForm[]>([newPlanItem(1), newPlanItem(2)]);
  const [inheritedPlanItems, setInheritedPlanItems] = useState<PlanItemForm[]>([]);
  const [paymentPlanError, setPaymentPlanError] = useState("");
  const [discountOptions, setDiscountOptions] = useState<AdminDiscount[]>([]);
  const [discountTypes, setDiscountTypes] = useState<MetadataOption[]>([]);
  const [discountMode, setDiscountMode] = useState<"none" | "existing">("none");
  const [discountId, setDiscountId] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [discountError, setDiscountError] = useState("");

  useEffect(() => {
    Promise.all([
      adminCoursesApi.getList({ page: 1, pageSize: 1000 }),
      adminTeachersApi.getList({ page: 1, pageSize: 1000 }),
      adminRoomsApi.getList(),
    ])
      .then(([courseResult, teacherResult, roomResult]) => {
        setCourses(courseResult.items);
        setTeachers(teacherResult.items);
        setRooms(roomResult);
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!isStudentPanelOpen) return;
    Promise.all([
      adminBillingPoliciesApi.getList({ page: 1, pageSize: 20, isActive: true }),
      adminMetadataApi.getBillingPolicyTypeOptions(),
      adminDiscountsApi.getList({ page: 1, pageSize: 20, isActive: true }),
      adminMetadataApi.getDiscountTypeOptions(),
    ])
      .then(([policyResult, typeResult, discountResult, discountTypeResult]) => {
        setBillingPolicies(policyResult.items);
        setPlanTypes(typeResult);
        setDiscountOptions(discountResult.items);
        setDiscountTypes(discountTypeResult);
        const customPolicies = policyResult.items.filter((policy) => !policy.isDefault);
        if (!billingPolicyId && customPolicies.length > 0) {
          const policy = customPolicies[0];
          setBillingPolicyId(String(policy.id));
          const typeValue = getPolicyTypeCode(policy.type, typeResult);
          setPlanType(typeValue);
          const count = typeValue === "1" ? 1 : policy.numberOfInstallments ?? 2;
          setNumberOfInstallments(String(count));
          setPlanItems(buildPlanItems(count, record?.tuitionFeeSnapshot ?? 0));
        }
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, [billingPolicyId, isStudentPanelOpen, record?.tuitionFeeSnapshot]);

  useEffect(() => {
    if (!recordId) return;
    let isMounted = true;
    adminClassesApi
      .getById(recordId)
      .then((result) => {
        if (isMounted) setRecord(result);
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [recordId]);

  const loadClassStudents = async (classId: string | number) => {
    try {
      const [students, enrollments] = await Promise.all([
        adminClassesApi.getStudents(classId),
        adminEnrollmentsApi.getByClass(classId),
      ]);
      const enrollmentPairs = await Promise.all(
        enrollments.items.map(async (enrollment) => {
          const student = await adminStudentsApi.getById(enrollment.studentId);
          return [student.studentCode, enrollment] as const;
        }),
      );
      const enrollmentByStudentCode = new Map(enrollmentPairs);
      setClassStudents(students.map((student) => {
        const enrollment = enrollmentByStudentCode.get(student.studentCode);
        return { ...student, studentId: enrollment?.studentId, enrollmentId: enrollment?.id };
      }));
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    }
  };

  useEffect(() => {
    if (!recordId) return;
    let isMounted = true;
    Promise.all([
      adminClassesApi.getStudents(recordId),
      adminEnrollmentsApi.getByClass(recordId),
    ])
      .then(async ([students, enrollments]) => {
        const enrollmentPairs = await Promise.all(
          enrollments.items.map(async (enrollment) => {
            const student = await adminStudentsApi.getById(enrollment.studentId);
            return [student.studentCode, enrollment] as const;
          }),
        );
        const enrollmentByStudentCode = new Map(enrollmentPairs);
        if (isMounted) {
          setClassStudents(students.map((student) => {
            const enrollment = enrollmentByStudentCode.get(student.studentCode);
            return { ...student, studentId: enrollment?.studentId, enrollmentId: enrollment?.id };
          }));
        }
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
    return () => {
      isMounted = false;
    };
  }, [recordId]);

  useEffect(() => {
    if (!isStudentPanelOpen) return;
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingStudents(true);
      try {
        setStudentOptions(await adminEnrollmentsApi.searchStudents(studentSearch.trim()));
      } catch (error) {
        toastDanger(getAuthErrorMessage(error));
        setStudentOptions([]);
      } finally {
        setIsSearchingStudents(false);
      }
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [isStudentPanelOpen, studentSearch]);

  const availableStudents = useMemo(
    () => studentOptions.filter((student) => !classStudents.some((item) => item.studentCode === student.studentCode)),
    [classStudents, studentOptions],
  );

  const field = (label: string, value: string | number) => (
    <label className={formStyles.field}>
      <span>{label}</span>
      <input readOnly value={value} />
    </label>
  );
  const tuitionTotal = 7500000;
  const tuitionPaid = 0;
  const tuitionOutstanding = tuitionTotal - tuitionPaid;
  const tuitionInstallmentAmount = tuitionTotal / 2;
  const tuitionInstallments = [
    { period: "Đợt 1", dueDate: "2026-06-04", amount: tuitionInstallmentAmount, status: "Pending", invoiceCode: "Chưa tạo" },
    { period: "Đợt 2", dueDate: "2026-07-04", amount: tuitionInstallmentAmount, status: "Pending", invoiceCode: "INV-0002" },
  ];
  const selectedDiscount = discountOptions.find((discount) => discount.id === Number(discountId));
  const selectedDiscountTypeCode = getDiscountTypeCode(selectedDiscount?.type, discountTypes);
  const isSelectedDiscountPercentage =
    selectedDiscountTypeCode === "2" || String(selectedDiscount?.type ?? "").toLowerCase().includes("percent");
  const originalTuitionFee = record?.tuitionFeeSnapshot ?? 0;
  const discountAmount = discountMode === "existing" && selectedDiscount
    ? Math.min(originalTuitionFee, isSelectedDiscountPercentage ? Math.floor(originalTuitionFee * selectedDiscount.value / 100) : selectedDiscount.value)
    : 0;
  const netTuitionFee = Math.max(0, originalTuitionFee - discountAmount);
  const selectedDiscountValue = selectedDiscount
    ? isSelectedDiscountPercentage
      ? `${new Intl.NumberFormat("en-US").format(selectedDiscount.value)}%`
      : `${new Intl.NumberFormat("en-US").format(selectedDiscount.value)} đ`
    : "";
  const resetPaymentPlan = () => {
    setIsCustomPaymentPlan(false);
    setBillingPolicyId("");
    setPlanType("3");
    setNumberOfInstallments("2");
    setPlanNotes("");
    setPaymentPlanError("");
    setPlanItems(buildPlanItems(2, originalTuitionFee));
    setInheritedPlanItems([]);
    setDiscountMode("none");
    setDiscountId("");
    setDiscountReason("");
    setDiscountError("");
  };
  const closeStudentPanel = () => {
    resetPaymentPlan();
    setRecentEnrollment(null);
    setSelectedStudent(null);
    setStudentSearch("");
    setIsStudentPanelOpen(false);
  };

  const registerStudent = async () => {
    if (!selectedStudent || !record || isRegisteringStudent) return;
    let paymentPlan: EnrollmentPaymentPlanPayload | null = null;
    let discounts: EnrollmentDiscountPayload[] | null = null;
    if (isCustomPaymentPlan) {
      if (!selectedBillingPolicy) {
        setPaymentPlanError("Vui lòng chọn chính sách tham chiếu.");
        return;
      }
      const items = isSelectedBillingPolicyInstallment ? planItems.map((item) => ({ ...item, amount: toMoney(item.amount) })) : undefined;
      if (isSelectedBillingPolicyInstallment && items?.some((item) => !item.name.trim() || !item.dueDate || item.amount <= 0)) {
        setPaymentPlanError("Vui lòng nhập đầy đủ ngày đến hạn và số tiền của từng kỳ.");
        return;
      }
      if (isSelectedBillingPolicyInstallment && items && items.reduce((sum, item) => sum + item.amount, 0) !== netTuitionFee) {
        setPaymentPlanError("Tổng tiền các kỳ phải bằng số còn phải thu.");
        return;
      }
      paymentPlan = {
        billingPolicyId: selectedBillingPolicy.id,
        type: toPaymentPlanType(selectedBillingPolicyTypeCode || planType),
        numberOfInstallments: isSelectedBillingPolicyInstallment ? Number(numberOfInstallments) : null,
        notes: planNotes.trim() || null,
        items,
      };
    } else if (isInheritedInstallmentPlan && inheritedBillingPolicy) {
      const items = inheritedPaymentPlanItems.map((item) => ({ ...item, amount: toMoney(item.amount) }));
      if (items.some((item) => !item.name.trim() || !item.dueDate || item.amount <= 0)) {
        setPaymentPlanError("Vui lòng nhập đầy đủ ngày đến hạn và số tiền của từng kỳ.");
        return;
      }
      if (items.reduce((sum, item) => sum + item.amount, 0) !== netTuitionFee) {
        setPaymentPlanError("Tổng tiền các kỳ phải bằng số còn phải thu.");
        return;
      }
      paymentPlan = {
        billingPolicyId: inheritedBillingPolicy.id,
        type: toPaymentPlanType(isInheritedInstallmentPlan ? installmentPlanTypeCode : inheritedBillingPolicyTypeCode),
        numberOfInstallments: inheritedInstallmentCount,
        notes: null,
        items,
      };
    }
    if (discountMode === "existing") {
      const selectedDiscount = discountOptions.find((discount) => discount.id === Number(discountId));
      if (!selectedDiscount) {
        setDiscountError("Vui lòng chọn mã giảm giá.");
        return;
      }
      discounts = [{
        discountId: selectedDiscount.id,
        name: null,
        type: toEnrollmentDiscountType(getDiscountTypeCode(selectedDiscount.type, discountTypes)),
        value: 0,
        amount: null,
        reason: discountReason.trim() || null,
      }];
    }
    setPaymentPlanError("");
    setDiscountError("");
    setIsRegisteringStudent(true);
    try {
      await adminEnrollmentsApi.create(selectedStudent.studentId, record.id, record.tuitionFeeSnapshot, paymentPlan, discounts);
      await loadClassStudents(record.id);
      closeStudentPanel();
      toastSuccess("Đăng ký học viên vào lớp thành công.");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsRegisteringStudent(false);
    }
  };

  const courseName = courses.find((item) => item.id === record?.courseId)?.name;
  const teacherName = teachers.find((item) => item.id === record?.teacherId)?.fullName;
  const roomName = rooms.find((item) => item.id === record?.roomId)?.name;
  const updatePlanItem = (index: number, field: keyof PlanItemForm, value: string) =>
    setPlanItems((current) => {
      const next = current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: field === "amount" ? moneyInput(value) : value } : item);
      if (field !== "amount") return next;
      const changedAmount = toMoney(next[index]?.amount ?? "0");
      const otherIndexes = next.map((_, itemIndex) => itemIndex).filter((itemIndex) => itemIndex !== index);
      if (otherIndexes.length === 0) return next;
      const remainingAmount = Math.max(0, netTuitionFee - changedAmount);
      const regularAmount = Math.floor(remainingAmount / otherIndexes.length);
      return next.map((item, itemIndex) => {
        const remainingIndex = otherIndexes.indexOf(itemIndex);
        if (remainingIndex === -1) return item;
        const amount = remainingIndex === otherIndexes.length - 1 ? remainingAmount - regularAmount * (otherIndexes.length - 1) : regularAmount;
        return { ...item, amount: moneyInput(amount) };
      });
    });
  const updateInheritedPlanItem = (index: number, field: keyof PlanItemForm, value: string) =>
    setInheritedPlanItems((current) => {
      const items = current.length > 0 ? current : inheritedDefaultPlanItems;
      const next = items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: field === "amount" ? moneyInput(value) : value } : item);
      if (field !== "amount") return next;
      const changedAmount = toMoney(next[index]?.amount ?? "0");
      const otherIndexes = next.map((_, itemIndex) => itemIndex).filter((itemIndex) => itemIndex !== index);
      if (otherIndexes.length === 0) return next;
      const remainingAmount = Math.max(0, netTuitionFee - changedAmount);
      const regularAmount = Math.floor(remainingAmount / otherIndexes.length);
      return next.map((item, itemIndex) => {
        const remainingIndex = otherIndexes.indexOf(itemIndex);
        if (remainingIndex === -1) return item;
        const amount = remainingIndex === otherIndexes.length - 1 ? remainingAmount - regularAmount * (otherIndexes.length - 1) : regularAmount;
        return { ...item, amount: moneyInput(amount) };
      });
    });
  const chooseDiscount = (value: string) => {
    const discount = discountOptions.find((item) => item.id === Number(value));
    const typeCode = getDiscountTypeCode(discount?.type, discountTypes);
    const nextDiscountAmount = discount
      ? Math.min(originalTuitionFee, typeCode === "2" || String(discount.type).toLowerCase().includes("percent") ? Math.floor(originalTuitionFee * discount.value / 100) : discount.value)
      : 0;
    const nextNetTuitionFee = Math.max(0, originalTuitionFee - nextDiscountAmount);
    setDiscountId(value);
    setPlanItems(buildPlanItems(Number(numberOfInstallments) || 2, nextNetTuitionFee));
    setInheritedPlanItems([]);
  };
  const resizePlanItems = (count: number) => {
    setPlanItems(buildPlanItems(count, netTuitionFee));
  };
  const cancelRegistration = async () => {
    if (!cancellingStudent?.enrollmentId || !record || isCancellingEnrollment) return;
    if (!cancelReason.trim()) {
      setCancelReasonError("Vui lòng nhập lý do hủy đăng ký.");
      return;
    }
    setIsCancellingEnrollment(true);
    try {
      await adminEnrollmentsApi.cancel(cancellingStudent.enrollmentId, cancelReason.trim());
      await loadClassStudents(record.id);
      setCancellingStudent(null);
      setCancelReason("");
      setCancelReasonError("");
      toastSuccess("Hủy đăng ký học viên thành công.");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsCancellingEnrollment(false);
    }
  };
  const closeCancelModal = () => {
    if (isCancellingEnrollment) return;
    setCancellingStudent(null);
    setCancelReason("");
    setCancelReasonError("");
  };
  const chooseBillingPolicy = (value: string) => {
    setBillingPolicyId(value);
    const policy = billingPolicies.find((item) => item.id === Number(value));
    if (!policy) return;
    const typeValue = getPolicyTypeCode(policy.type, planTypes);
    setPlanType(typeValue);
    const count = typeValue === "1" ? 1 : policy.numberOfInstallments ?? Math.max(2, Number(numberOfInstallments) || 2);
    setNumberOfInstallments(String(count));
    resizePlanItems(count);
  };
  const defaultBillingPolicy = billingPolicies.find((policy) => policy.isDefault);
  const selectedCourse = courses.find((course) => course.id === record?.courseId);
  const courseDefaultBillingPolicyId = selectedCourse?.defaultBillingPolicyId;
  const classBillingPolicy = record?.billingPolicy ?? billingPolicies.find((policy) => policy.id === record?.billingPolicyId);
  const courseBillingPolicy = billingPolicies.find((policy) => policy.id === courseDefaultBillingPolicyId);
  const inheritedBillingPolicy = classBillingPolicy ?? courseBillingPolicy ?? defaultBillingPolicy;
  const customBillingPolicies = billingPolicies.filter((policy) => policy.id !== inheritedBillingPolicy?.id);
  const selectedBillingPolicy = customBillingPolicies.find((policy) => policy.id === Number(billingPolicyId));
  const selectedBillingPolicyTypeCode = getPolicyTypeCode(selectedBillingPolicy?.type, planTypes);
  const isSelectedBillingPolicyInstallment =
    selectedBillingPolicyTypeCode === installmentPlanTypeCode ||
    String(selectedBillingPolicy?.type ?? "").toLowerCase() === "installment";
  const inheritedBillingPolicyName =
    record?.billingPolicy?.name ??
    record?.effectiveBillingPolicyName ??
    record?.billingPolicyName ??
    inheritedBillingPolicy?.name ??
    selectedCourse?.defaultBillingPolicyName ??
    null;
  const inheritedBillingPolicyIsDefault =
    record?.billingPolicy?.isDefault ??
    record?.effectiveBillingPolicyIsDefault ??
    record?.billingPolicyIsDefault ??
    inheritedBillingPolicy?.isDefault ??
    selectedCourse?.defaultBillingPolicyIsDefault ??
    false;
  const inheritedBillingPolicyScope = classBillingPolicy
    ? "Lớp học"
    : courseBillingPolicy || selectedCourse?.defaultBillingPolicyName
      ? "Khóa học"
      : defaultBillingPolicy || record?.effectiveBillingPolicyName
        ? "Mặc định hệ thống"
        : "";
  const inheritedBillingPolicyTypeCode =
    record?.effectiveBillingPolicyType !== undefined && record.effectiveBillingPolicyType !== null
      ? String(record.effectiveBillingPolicyType)
      : record?.billingPolicy?.type !== undefined && record.billingPolicy.type !== null
        ? String(record.billingPolicy.type)
        : record?.billingPolicyType !== undefined && record.billingPolicyType !== null
          ? String(record.billingPolicyType)
          : getPolicyTypeCode(inheritedBillingPolicy?.type, planTypes);
  const billingPolicyDisplay = inheritedBillingPolicyName
    ? `${inheritedBillingPolicyName}${inheritedBillingPolicyIsDefault ? " (default)" : ""}`
    : "Chưa có chính sách áp dụng";
  const isInheritedInstallmentPlan =
    inheritedBillingPolicyTypeCode === installmentPlanTypeCode ||
    String(record?.effectiveBillingPolicyType ?? record?.billingPolicy?.type ?? record?.billingPolicyType ?? inheritedBillingPolicy?.type ?? "").toLowerCase() === "installment";
  const inheritedInstallmentCount = Math.max(1, record?.billingPolicy?.numberOfInstallments ?? inheritedBillingPolicy?.numberOfInstallments ?? 2);
  const inheritedDefaultPlanItems = isInheritedInstallmentPlan ? buildPlanItems(inheritedInstallmentCount, netTuitionFee) : [];
  const inheritedPaymentPlanItems = inheritedPlanItems.length > 0 ? inheritedPlanItems : inheritedDefaultPlanItems;
  const chooseCustomMode = () => {
    setIsCustomPaymentPlan(true);
    const hasSelectedCustomPolicy = customBillingPolicies.some((policy) => policy.id === Number(billingPolicyId));
    if (!hasSelectedCustomPolicy && customBillingPolicies.length > 0) {
      chooseBillingPolicy(String(customBillingPolicies[0].id));
    } else if (!hasSelectedCustomPolicy) {
      setBillingPolicyId("");
    }
  };

  return (
    <>
      <div className={formStyles.page}>
        <section className={formStyles.header}>
          <div>
            <Link className={formStyles.backLink} to="/admin/classes">
              <ArrowLeft size={16} /> Quay lại danh sách
            </Link>
            <h1>Chi tiết lớp học</h1>
          </div>
        </section>

        <section className={formStyles.panel}>
          <div className={styles.tabs} role="tablist" aria-label="Chi tiết lớp học">
            {tabs.map((tab) => (
              <button
                className={activeTab === tab.key ? styles.activeTab : ""}
                disabled={tab.key === "tuition"}
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => {
                  if (tab.key !== "tuition") {
                    setActiveTab(tab.key);
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className={formStyles.accountState}>Đang tải thông tin lớp học...</p>
          ) : !record ? (
            <p className={formStyles.accountState}>Không tìm thấy lớp học.</p>
          ) : activeTab === "info" ? (
            <>
              <div className={formStyles.panelHeader}>
                <div><h2>Thông tin lớp học</h2><p>Xem cấu hình lớp học đang lưu trong hệ thống.</p></div>
              </div>
              <div className={formStyles.formGrid}>
                {field("Khóa học", courseName ?? `#${record.courseId}`)}
                {field("Nhân viên", teacherName ?? `#${record.teacherId}`)}
                {field("Phòng học", roomName ?? "Chưa chọn phòng")}
                {field("Mã lớp", record.code)}
                {field("Tên lớp", record.name)}
                {field("Ngày bắt đầu", formatDate(record.startDate))}
                {field("Ngày kết thúc", formatDate(record.endDate))}
                {field("Sĩ số", record.capacity)}
                {field("Học phí lớp", `${new Intl.NumberFormat("en-US").format(record.tuitionFeeSnapshot)} đ`)}
                {field("Tổng số buổi", record.totalSessions)}
                {field("Số buổi đã hoàn thành", record.completedSessions)}
                {field("Trạng thái", statusLabels[String(record.status)] ?? String(record.status))}
                {field("Chính sách học phí", billingPolicyDisplay)}
                {field("Ngày mở lớp", formatDate(record.openedAt))}
                {field("Ngày đóng lớp", formatDate(record.closedAt))}
                <label className={`${formStyles.field} ${formStyles.notesField}`}>
                  <span>Ghi chú</span>
                  <textarea readOnly rows={5} value={record.notes ?? "Chưa cập nhật"} />
                </label>
              </div>
            </>
          ) : activeTab === "students" ? (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <div><h2>Danh sách học viên</h2><p>Danh sách học viên đã đăng ký vào lớp.</p></div>
                <button type="button" onClick={() => { resetPaymentPlan(); setRecentEnrollment(null); setSelectedStudent(null); setIsStudentPanelOpen(true); }}>
                  <Plus size={15} /> Thêm học viên
                </button>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Mã học viên</th><th>Tên học viên</th><th>Điện thoại</th><th>Email</th><th>Tình trạng</th><th>Action</th></tr></thead>
                  <tbody>
                    {classStudents.length === 0 ? (
                      <tr><td colSpan={6}><div className={styles.emptyState}>Chưa có học viên trong lớp.</div></td></tr>
                    ) : classStudents.map((student) => <tr key={student.studentCode}><td><strong>{student.studentCode}</strong></td><td>{student.fullName}</td><td>{student.phoneNumber ?? "Chưa cập nhật"}</td><td>{student.email ?? "Chưa cập nhật"}</td><td><span className={`${listStyles.statusBadge} ${listStyles[studentStatusTone[String(student.status)] ?? "pending"]}`}>{studentStatusLabels[String(student.status)] ?? String(student.status)}</span></td><td><div className={styles.studentActions}><button aria-label="Xem học phí" className={styles.tuitionAction} disabled={!student.enrollmentId} title="Xem học phí" type="button" onClick={() => { setSelectedTuitionStudent(student); setIsTuitionDetailOpen(false); setActiveTab("tuition"); }}><Eye size={16} /></button><button aria-label="Hủy đăng ký" className={styles.cancelEnrollmentButton} disabled={!student.enrollmentId} title={student.enrollmentId ? "Hủy đăng ký học viên khỏi lớp" : "Chưa có mã đăng ký để hủy"} type="button" onClick={() => { setCancellingStudent(student); setCancelReason(""); setCancelReasonError(""); }}><UserX size={16} /></button></div></td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "tuition" ? (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <div><h2>Học phí</h2><p>Xem thông tin học viên và tình trạng công nợ trong lớp.</p></div>
              </div>
              {!selectedTuitionStudent ? (
                <div className={styles.emptyState}>Vui lòng chọn Xem học phí tại danh sách học viên.</div>
              ) : (
                <>
                  <div className={formStyles.formGrid}>
                    {field("Tên học viên", selectedTuitionStudent.fullName)}
                    {field("Mã học viên", selectedTuitionStudent.studentCode)}
                    {field("SĐT", selectedTuitionStudent.phoneNumber ?? "Chưa cập nhật")}
                    {field("Email", selectedTuitionStudent.email ?? "Chưa cập nhật")}
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead><tr><th>Tổng tiền</th><th>Đã thanh toán</th><th>Còn nợ</th><th>Plan</th><th>Trạng thái</th><th>Action</th></tr></thead>
                      <tbody>
                        <tr>
                          <td>{formatMoney(tuitionTotal)}</td>
                          <td>{formatMoney(tuitionPaid)}</td>
                          <td>{formatMoney(tuitionOutstanding)}</td>
                          <td>Trả góp 2 kỳ</td>
                          <td><span className={`${listStyles.statusBadge} ${listStyles.pending}`}>Đang nợ</span></td>
                          <td><button className={styles.iconActionButton} title="Xem chi tiết kỳ thu" type="button" onClick={() => setIsTuitionDetailOpen((current) => !current)}><Eye size={16} /></button></td>
                        </tr>
                        {isTuitionDetailOpen && (
                          <tr>
                            <td colSpan={6}>
                              <div className={styles.installmentDetail}>
                                <table className={styles.table}>
                                  <thead><tr><th>Kỳ</th><th>Hạn thanh toán</th><th>Số tiền</th><th>Trạng thái</th><th>Hóa đơn</th><th>Action</th></tr></thead>
                                  <tbody>
                                    {tuitionInstallments.map((item) => (
                                      <tr key={item.period}>
                                        <td>{item.period}</td>
                                        <td>{item.dueDate}</td>
                                        <td>{formatMoney(item.amount)}</td>
                                        <td>{item.status}</td>
                                        <td>{item.invoiceCode}</td>
                                        <td>
                                          {item.invoiceCode === "Chưa tạo" ? (
                                            <button className={styles.iconActionButton} title="Tạo hóa đơn" type="button" onClick={() => toastSuccess("Đã chọn tạo hóa đơn cho kỳ thu.")}>
                                              <Plus size={16} />
                                            </button>
                                          ) : (
                                            <button className={styles.iconActionButton} title="Xem chi tiết hóa đơn" type="button" onClick={() => setSelectedInvoiceItem(item)}>
                                              <Eye size={16} />
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>Nội dung tab {tabs.find((tab) => tab.key === activeTab)?.label} sẽ được tích hợp sau.</div>
          )}
        </section>
      </div>

      <SidePanel
        description="Tìm theo email, số điện thoại hoặc mã học viên, sau đó chọn học viên cần đăng ký."
        footer={<div className={styles.panelActions}><button type="button" onClick={closeStudentPanel}>Hủy</button><button disabled={!selectedStudent || isRegisteringStudent} type="button" onClick={registerStudent}>{isRegisteringStudent ? "Đang đăng ký..." : "Đăng ký vào lớp"}</button></div>}
        isOpen={isStudentPanelOpen}
        title="Thêm học viên"
        width="lg"
        onClose={closeStudentPanel}
      >
        <label className={styles.studentSearch}>
          <Search size={18} />
          <input placeholder="Email, SĐT hoặc mã học viên" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} />
        </label>
        <div className={styles.studentResults}>
          {availableStudents.map((student) => (
            <button className={selectedStudent?.studentId === student.studentId ? styles.selectedStudent : ""} key={student.studentId} type="button" onClick={() => { setSelectedStudent(student); setRecentEnrollment(null); }}>
              <UserRoundPlus size={18} />
              <span><strong>{student.fullName}</strong><small><span title={student.studentCode}>{truncateText(student.studentCode)}</span> · {student.email} · {student.phoneNumber}</small></span>
            </button>
          ))}
          {!isSearchingStudents && availableStudents.length === 0 && <div className={styles.emptyState}>Không tìm thấy học viên phù hợp.</div>}
        </div>
        {selectedStudent && <section className={styles.paymentPlanConfig}>
          <div><strong>Giảm giá / Ưu đãi</strong><p>Chọn voucher đang hoạt động để áp dụng cho học viên.</p></div>
          <label><input checked={discountMode === "none"} name="discount-mode" type="radio" onChange={() => { setDiscountMode("none"); setDiscountError(""); setPlanItems(buildPlanItems(Number(numberOfInstallments) || 2, originalTuitionFee)); setInheritedPlanItems([]); }} /> Không áp dụng giảm giá</label>
          <label><input checked={discountMode === "existing"} name="discount-mode" type="radio" onChange={() => { setDiscountMode("existing"); setDiscountError(""); }} /> Chọn mã giảm giá có sẵn</label>
          {discountMode === "existing" && <div className={styles.customPlanFields}>
            <label><span>Mã giảm giá</span><select disabled={discountOptions.length === 0} value={discountId} onChange={(event) => chooseDiscount(event.target.value)}><option value="">{discountOptions.length === 0 ? "Không có mã giảm giá" : "--- mã giảm giá ---"}</option>{discountOptions.map((discount) => <option key={discount.id} value={discount.id}>{discount.code}</option>)}</select></label>
            <label><span>Lý do</span><input placeholder="Ưu đãi nhập học" value={discountReason} onChange={(event) => setDiscountReason(event.target.value)} /></label>
            {selectedDiscount && <p className={styles.discountPreview}>Được giảm {selectedDiscountValue}</p>}
            {selectedDiscount && <div className={styles.discountSummary}><div><span>Học phí gốc</span><strong>{formatMoney(originalTuitionFee)}</strong></div><div><span>Giảm giá</span><strong>-{formatMoney(discountAmount)}</strong></div><div><span>Còn phải thu</span><strong>{formatMoney(netTuitionFee)}</strong></div></div>}
          </div>}
          {discountError && <p className={styles.planError}>{discountError}</p>}
        </section>}
        {selectedStudent && <section className={styles.paymentPlanConfig}>
          <div><strong>Phương án thanh toán riêng cho học viên</strong><p>Mặc định kế thừa chính sách của lớp. Chỉ cấu hình khi học viên có ngoại lệ.</p></div>
          <label><input checked={!isCustomPaymentPlan} name="payment-plan-mode" type="radio" onChange={() => { setIsCustomPaymentPlan(false); setPaymentPlanError(""); }} /> Kế thừa từ lớp học</label>
          {!isCustomPaymentPlan && <>
            <div className={styles.inheritedPolicyPreview}><span>Chính sách áp dụng</span><strong>{inheritedBillingPolicyName ? `${inheritedBillingPolicyName}${inheritedBillingPolicyIsDefault ? " (default)" : ""}` : "Chưa có chính sách áp dụng"}</strong>{inheritedBillingPolicyScope && <small>{inheritedBillingPolicyScope}</small>}</div>
            {isInheritedInstallmentPlan && <div className={styles.planItems}>
              {inheritedPaymentPlanItems.map((item, index) => <div className={styles.planItem} key={item.sequenceNumber}>
                <strong>Kỳ {item.sequenceNumber}</strong>
                <input disabled placeholder="Tên đợt" value={item.name} onChange={(event) => updateInheritedPlanItem(index, "name", event.target.value)} />
                <input type="date" value={item.dueDate} onChange={(event) => updateInheritedPlanItem(index, "dueDate", event.target.value)} />
                <input inputMode="numeric" placeholder="Số tiền" value={item.amount} onChange={(event) => updateInheritedPlanItem(index, "amount", event.target.value)} />
              </div>)}
            </div>}
          </>}
          <label><input checked={isCustomPaymentPlan} name="payment-plan-mode" type="radio" onChange={chooseCustomMode} /> Tùy chỉnh cho học viên</label>
          {isCustomPaymentPlan && <div className={styles.customPlanFields}>
            <label><span>Chính sách tham chiếu</span><select disabled={customBillingPolicies.length === 0} value={selectedBillingPolicy ? billingPolicyId : ""} onChange={(event) => chooseBillingPolicy(event.target.value)}>{!selectedBillingPolicy && <option value="">Chọn chính sách</option>}{customBillingPolicies.length === 0 ? <option value="">Không có chính sách khác</option> : customBillingPolicies.map((policy) => <option key={policy.id} value={policy.id}>{policy.name}</option>)}</select></label>
            <label className={styles.planNotes}><span>Ghi chú</span><textarea rows={2} value={planNotes} onChange={(event) => setPlanNotes(event.target.value)} /></label>
            {isSelectedBillingPolicyInstallment && <div className={styles.planItems}>
              {planItems.map((item, index) => <div className={styles.planItem} key={item.sequenceNumber}>
                <strong>Kỳ {item.sequenceNumber}</strong>
                <input disabled placeholder="Tên đợt" value={item.name} onChange={(event) => updatePlanItem(index, "name", event.target.value)} />
                <input type="date" value={item.dueDate} onChange={(event) => updatePlanItem(index, "dueDate", event.target.value)} />
                <input inputMode="numeric" placeholder="Số tiền" value={item.amount} onChange={(event) => updatePlanItem(index, "amount", event.target.value)} />
              </div>)}
            </div>}
          </div>}
          {paymentPlanError && <p className={styles.planError}>{paymentPlanError}</p>}
        </section>}
        {recentEnrollment && <section className={styles.enrollmentResult}>
          <div><strong>Đăng ký thành công</strong><span>{recentEnrollment.enrollment.enrollmentCode}</span></div>
          {recentEnrollment.paymentPlan ? <><div><span>Tổng học phí sau giảm</span><strong>{formatMoney(recentEnrollment.paymentPlan.totalAmount)}</strong></div><div><span>Loại plan</span><strong>{paymentPlanTypeLabels[String(recentEnrollment.paymentPlan.type)] ?? String(recentEnrollment.paymentPlan.type)}</strong></div><div><span>Số kỳ</span><strong>{recentEnrollment.paymentPlan.items.length}</strong></div><Link to={`/admin/enrollments/${recentEnrollment.enrollment.id}/view`}>Xem chi tiết công nợ</Link></> : <span>Đăng ký này không phát sinh công nợ.</span>}
        </section>}
      </SidePanel>
      <SidePanel
        description="Thông tin hóa đơn của kỳ thu."
        footer={<div className={styles.panelActions}><button type="button" onClick={() => setSelectedInvoiceItem(null)}>Hủy</button><button type="button" onClick={() => setIsConfirmPaymentOpen(true)}>Thu tiền</button></div>}
        isOpen={Boolean(selectedInvoiceItem)}
        title="Chi tiết hóa đơn"
        width="lg"
        onClose={() => setSelectedInvoiceItem(null)}
      >
        {selectedInvoiceItem && (
          <div className={styles.invoiceInfoBox}>
            <div><span>Hóa đơn</span><strong>{selectedInvoiceItem.invoiceCode}</strong></div>
            <div><span>Kỳ thu</span><strong>{selectedInvoiceItem.period}</strong></div>
            <div><span>Hạn thanh toán</span><strong>{selectedInvoiceItem.dueDate}</strong></div>
            <div><span>Total</span><strong>{formatMoney(selectedInvoiceItem.amount)}</strong></div>
            <div><span>Paid</span><strong>{formatMoney(0)}</strong></div>
            <div><span>Outstanding</span><strong>{formatMoney(selectedInvoiceItem.amount)}</strong></div>
            <div><span>Trạng thái</span><strong>Invoice Issued</strong></div>
          </div>
        )}
        {selectedInvoiceItem && (
          <div className={styles.paymentFormBox}>
            <label>
              <span>Phương thức thanh toán</span>
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)}>
                <option value="cash">Tiền mặt</option>
                <option value="bank-transfer">Chuyển khoản</option>
              </select>
            </label>
            <label>
              <span>Ghi chú</span>
              <textarea placeholder="Nhập ghi chú thanh toán" rows={4} value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} />
            </label>
          </div>
        )}
      </SidePanel>
      {isConfirmPaymentOpen && selectedInvoiceItem && <div className={styles.invoicePreviewBackdrop} role="presentation" onMouseDown={() => setIsConfirmPaymentOpen(false)}>
        <section aria-modal="true" className={styles.invoicePreviewModal} role="dialog" onMouseDown={(event) => event.stopPropagation()}>
          <button aria-label="Đóng" className={styles.invoicePreviewClose} type="button" onClick={() => setIsConfirmPaymentOpen(false)}><X size={18} /></button>
          <div className={styles.invoiceConfirmIntro}>
            <h2>Xác nhận thu tiền</h2>
            <p>Kiểm tra preview invoice trước khi ghi nhận thanh toán.</p>
          </div>
          <div className={styles.invoicePreviewHeader}>
            <div>
              <h2>English Central</h2>
              <p>123 Awesome Street, Denver CO</p>
              <p>billing@englishcentral.com</p>
            </div>
            <div>
              <span>Amount Due:</span>
              <strong>{formatMoney(selectedInvoiceItem.amount)}</strong>
            </div>
          </div>
          <div className={styles.invoicePreviewMeta}>
            <div>
              <strong>Billed to:</strong>
              <p>{selectedTuitionStudent?.fullName ?? "Học viên"}</p>
              <p>{selectedTuitionStudent?.studentCode ?? "STU-0000"}</p>
              <p>{selectedTuitionStudent?.email ?? "student@email.com"}</p>
            </div>
            <div>
              <strong>Invoice Number:</strong>
              <p>{selectedInvoiceItem.invoiceCode}</p>
              <strong>Date Of Issue:</strong>
              <p>{selectedInvoiceItem.dueDate}</p>
            </div>
          </div>
          <table className={styles.invoicePreviewTable}>
            <thead><tr><th>QTY</th><th>DESCRIPTION</th><th>PRICE</th><th>AMOUNT</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>{selectedInvoiceItem.period} - Học phí lớp</td><td>{formatMoney(selectedInvoiceItem.amount)}</td><td>{formatMoney(selectedInvoiceItem.amount)}</td></tr>
            </tbody>
          </table>
          <div className={styles.invoicePreviewTotals}>
            <div><span>SUBTOTAL</span><strong>{formatMoney(selectedInvoiceItem.amount)}</strong></div>
            <div><span>TAX</span><strong>{formatMoney(0)}</strong></div>
            <div><span>DISCOUNT</span><strong>{formatMoney(0)}</strong></div>
            <div><span>TOTAL</span><strong>{formatMoney(selectedInvoiceItem.amount)}</strong></div>
          </div>
          <div className={styles.invoicePreviewNote}>
            {paymentNote.trim() || "Thanks for learning with English Central!"}
          </div>
          <div className={styles.paymentConfirmSummaryInInvoice}>
            <div><span>Phương thức</span><strong>{paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}</strong></div>
            <div><span>Ghi chú</span><strong>{paymentNote.trim() || "Không có ghi chú"}</strong></div>
          </div>
          <div className={styles.invoicePreviewActions}>
            <button type="button" onClick={() => { setIsConfirmPaymentOpen(false); toastSuccess("Đã xác nhận thu tiền."); }}><Send size={15} /> Xác nhận thu tiền</button>
            <button type="button" onClick={() => setIsConfirmPaymentOpen(false)}><CloudDownload size={15} /> Hủy</button>
          </div>
        </section>
      </div>}
      {cancellingStudent && <div className={styles.cancelModalBackdrop} role="presentation" onMouseDown={closeCancelModal}>
        <section aria-modal="true" className={styles.cancelModal} role="dialog" onMouseDown={(event) => event.stopPropagation()}>
          <button aria-label="Đóng" className={styles.cancelModalClose} disabled={isCancellingEnrollment} type="button" onClick={closeCancelModal}><X size={18} /></button>
          <div className={styles.cancelModalIcon}><AlertTriangle size={22} /></div>
          <div className={styles.cancelModalContent}>
            <h2>Xác nhận hủy đăng ký</h2>
            <p>Bạn có chắc muốn hủy đăng ký của {cancellingStudent.fullName} khỏi lớp này?</p>
            <label><span>Lý do hủy đăng ký <em>*</em></span><textarea rows={4} value={cancelReason} onChange={(event) => { setCancelReason(event.target.value); setCancelReasonError(""); }} /></label>
            {cancelReasonError && <strong>{cancelReasonError}</strong>}
          </div>
          <div className={styles.cancelModalActions}>
            <button disabled={isCancellingEnrollment} type="button" onClick={closeCancelModal}>Hủy</button>
            <button disabled={isCancellingEnrollment} type="button" onClick={cancelRegistration}>{isCancellingEnrollment ? "Đang hủy..." : "Hủy đăng ký"}</button>
          </div>
        </section>
      </div>}
    </>
  );
}
