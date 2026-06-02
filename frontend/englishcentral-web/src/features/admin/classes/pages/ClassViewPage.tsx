import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Search, UserRoundPlus } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { SidePanel, toastDanger, toastSuccess } from "@/components/ui";
import { adminClassesApi, type AdminClass, type ClassStudent } from "@/features/admin/classes/api/admin-classes-api";
import { adminEnrollmentsApi, type EnrollmentPaymentPlanPayload, type EnrollmentStudentOption } from "@/features/admin/classes/api/admin-enrollments-api";
import { adminRoomsApi, type AdminRoom } from "@/features/admin/classes/api/admin-rooms-api";
import { adminBillingPoliciesApi, type AdminBillingPolicy } from "@/features/admin/billing-policies/api/admin-billing-policies-api";
import { adminCoursesApi, type AdminCourse } from "@/features/admin/courses/api/admin-courses-api";
import type { AdminEnrollment } from "@/features/admin/enrollments/api/admin-enrollment-finance-api";
import type { AdminPaymentPlan } from "@/features/admin/payment-plans/api/admin-payment-plans-api";
import { adminMetadataApi, type MetadataOption } from "@/features/admin/shared/api/admin-metadata-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import formStyles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { adminTeachersApi, type AdminTeacher } from "@/features/admin/teachers/api/admin-teachers-api";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import styles from "./ClassViewPage.module.scss";

type TabKey = "info" | "students" | "schedule" | "attendance" | "tuition";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "info", label: "Thông tin lớp" },
  { key: "students", label: "Danh sách học viên" },
  { key: "schedule", label: "Lịch học" },
  { key: "attendance", label: "Điểm danh" },
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
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);
  const [isRegisteringStudent, setIsRegisteringStudent] = useState(false);
  const [recentEnrollment, setRecentEnrollment] = useState<{ enrollment: AdminEnrollment; paymentPlan: AdminPaymentPlan | null } | null>(null);
  const [isCustomPaymentPlan, setIsCustomPaymentPlan] = useState(false);
  const [billingPolicies, setBillingPolicies] = useState<AdminBillingPolicy[]>([]);
  const [planTypes, setPlanTypes] = useState<MetadataOption[]>([]);
  const [billingPolicyId, setBillingPolicyId] = useState("");
  const [planType, setPlanType] = useState("3");
  const [numberOfInstallments, setNumberOfInstallments] = useState("2");
  const [planNotes, setPlanNotes] = useState("");
  const [planItems, setPlanItems] = useState<PlanItemForm[]>([newPlanItem(1), newPlanItem(2)]);
  const [paymentPlanError, setPaymentPlanError] = useState("");

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
    ])
      .then(([policyResult, typeResult]) => {
        setBillingPolicies(policyResult.items);
        setPlanTypes(typeResult);
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, [isStudentPanelOpen]);

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
      setClassStudents(await adminClassesApi.getStudents(classId));
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    }
  };

  useEffect(() => {
    if (!recordId) return;
    let isMounted = true;
    adminClassesApi
      .getStudents(recordId)
      .then((students) => {
        if (isMounted) setClassStudents(students);
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
  const resetPaymentPlan = () => {
    setIsCustomPaymentPlan(false);
    setBillingPolicyId("");
    setPlanType("3");
    setNumberOfInstallments("2");
    setPlanNotes("");
    setPaymentPlanError("");
    const regularAmount = record ? Math.floor(record.tuitionFeeSnapshot / 2) : 0;
    setPlanItems([newPlanItem(1, regularAmount), newPlanItem(2, record ? record.tuitionFeeSnapshot - regularAmount : 0)]);
  };

  const registerStudent = async () => {
    if (!selectedStudent || !record || isRegisteringStudent) return;
    let paymentPlan: EnrollmentPaymentPlanPayload | null = null;
    if (isCustomPaymentPlan) {
      const items = planItems.map((item) => ({ ...item, amount: toMoney(item.amount) }));
      if (items.some((item) => !item.name.trim() || !item.dueDate || item.amount <= 0)) {
        setPaymentPlanError("Vui lòng nhập đầy đủ tên đợt, ngày đến hạn và số tiền của từng kỳ.");
        return;
      }
      if (items.reduce((sum, item) => sum + item.amount, 0) !== record.tuitionFeeSnapshot) {
        setPaymentPlanError("Tổng tiền các kỳ phải bằng học phí của lớp.");
        return;
      }
      paymentPlan = {
        billingPolicyId: billingPolicyId ? Number(billingPolicyId) : null,
        type: Number(planType),
        numberOfInstallments: planType === "1" ? null : Number(numberOfInstallments),
        notes: planNotes.trim() || null,
        items,
      };
    }
    setPaymentPlanError("");
    setIsRegisteringStudent(true);
    try {
      const result = await adminEnrollmentsApi.create(selectedStudent.studentId, record.id, paymentPlan);
      await loadClassStudents(record.id);
      setRecentEnrollment(result);
      setSelectedStudent(null);
      setStudentSearch("");
      resetPaymentPlan();
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
    setPlanItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: field === "amount" ? moneyInput(value) : value } : item));
  const resizePlanItems = (count: number) => {
    const safeCount = Math.max(1, count);
    const regularAmount = record ? Math.floor(record.tuitionFeeSnapshot / safeCount) : 0;
    setPlanItems(Array.from({ length: safeCount }, (_, index) => newPlanItem(index + 1, index === safeCount - 1 && record ? record.tuitionFeeSnapshot - regularAmount * (safeCount - 1) : regularAmount)));
  };
  const choosePlanType = (value: string) => {
    setPlanType(value);
    const count = value === "1" ? 1 : Math.max(2, Number(numberOfInstallments) || 2);
    setNumberOfInstallments(String(count));
    resizePlanItems(count);
  };
  const chooseBillingPolicy = (value: string) => {
    setBillingPolicyId(value);
    const policy = billingPolicies.find((item) => item.id === Number(value));
    if (!policy) return;
    const typeValue = String(typeof policy.type === "number" ? policy.type : planTypes.find((item) => item.value === policy.type)?.code ?? 1);
    setPlanType(typeValue);
    const count = typeValue === "1" ? 1 : policy.numberOfInstallments ?? Math.max(2, Number(numberOfInstallments) || 2);
    setNumberOfInstallments(String(count));
    resizePlanItems(count);
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
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
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
                  <Plus size={17} /> Thêm học viên
                </button>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Mã học viên</th><th>Tên học viên</th><th>Điện thoại</th><th>Email</th><th>Tình trạng</th></tr></thead>
                  <tbody>
                    {classStudents.length === 0 ? (
                      <tr><td colSpan={5}><div className={styles.emptyState}>Chưa có học viên trong lớp.</div></td></tr>
                    ) : classStudents.map((student) => <tr key={student.studentCode}><td><strong>{student.studentCode}</strong></td><td>{student.fullName}</td><td>{student.phoneNumber ?? "Chưa cập nhật"}</td><td>{student.email ?? "Chưa cập nhật"}</td><td><span className={`${listStyles.statusBadge} ${listStyles[studentStatusTone[String(student.status)] ?? "pending"]}`}>{studentStatusLabels[String(student.status)] ?? String(student.status)}</span></td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>Nội dung tab {tabs.find((tab) => tab.key === activeTab)?.label} sẽ được tích hợp sau.</div>
          )}
        </section>
      </div>

      <SidePanel
        description="Tìm theo email, số điện thoại hoặc mã học viên, sau đó chọn học viên cần đăng ký."
        footer={<div className={styles.panelActions}><button type="button" onClick={() => setIsStudentPanelOpen(false)}>Hủy</button><button disabled={!selectedStudent || isRegisteringStudent} type="button" onClick={registerStudent}>{isRegisteringStudent ? "Đang đăng ký..." : "Đăng ký vào lớp"}</button></div>}
        isOpen={isStudentPanelOpen}
        title="Thêm học viên"
        width="lg"
        onClose={() => setIsStudentPanelOpen(false)}
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
          <div><strong>Phương án thanh toán riêng cho học viên</strong><p>Mặc định kế thừa chính sách của lớp. Chỉ cấu hình khi học viên có ngoại lệ.</p></div>
          <label><input checked={!isCustomPaymentPlan} name="payment-plan-mode" type="radio" onChange={() => { setIsCustomPaymentPlan(false); setPaymentPlanError(""); }} /> Kế thừa từ lớp học</label>
          <label><input checked={isCustomPaymentPlan} name="payment-plan-mode" type="radio" onChange={() => setIsCustomPaymentPlan(true)} /> Tùy chỉnh cho học viên</label>
          {isCustomPaymentPlan && <div className={styles.customPlanFields}>
            <label><span>Chính sách tham chiếu</span><select value={billingPolicyId} onChange={(event) => chooseBillingPolicy(event.target.value)}><option value="">Không gắn chính sách, dùng lịch riêng</option>{billingPolicies.map((policy) => <option key={policy.id} value={policy.id}>{policy.name}</option>)}</select></label>
            <label><span>Loại phương án</span><select value={planType} onChange={(event) => choosePlanType(event.target.value)}>{planTypes.map((type) => <option key={type.code} value={type.code}>{type.label}</option>)}</select></label>
            {planType !== "1" && <label><span>Số kỳ</span><input min={2} type="number" value={numberOfInstallments} onChange={(event) => { setNumberOfInstallments(event.target.value); resizePlanItems(Number(event.target.value) || 1); }} /></label>}
            <label className={styles.planNotes}><span>Ghi chú</span><textarea rows={2} value={planNotes} onChange={(event) => setPlanNotes(event.target.value)} /></label>
            <div className={styles.planTotal}><span>Tổng học phí</span><strong>{record ? formatMoney(record.tuitionFeeSnapshot) : "0 đ"}</strong></div>
            <div className={styles.planItems}>
              {planItems.map((item, index) => <div className={styles.planItem} key={item.sequenceNumber}>
                <strong>Kỳ {item.sequenceNumber}</strong>
                <input placeholder="Tên đợt" value={item.name} onChange={(event) => updatePlanItem(index, "name", event.target.value)} />
                <input type="date" value={item.dueDate} onChange={(event) => updatePlanItem(index, "dueDate", event.target.value)} />
                <input inputMode="numeric" placeholder="Số tiền" value={item.amount} onChange={(event) => updatePlanItem(index, "amount", event.target.value)} />
              </div>)}
            </div>
            {paymentPlanError && <p className={styles.planError}>{paymentPlanError}</p>}
          </div>}
        </section>}
        {recentEnrollment && <section className={styles.enrollmentResult}>
          <div><strong>Đăng ký thành công</strong><span>{recentEnrollment.enrollment.enrollmentCode}</span></div>
          {recentEnrollment.paymentPlan ? <><div><span>Tổng học phí sau giảm</span><strong>{formatMoney(recentEnrollment.paymentPlan.totalAmount)}</strong></div><div><span>Loại plan</span><strong>{paymentPlanTypeLabels[String(recentEnrollment.paymentPlan.type)] ?? String(recentEnrollment.paymentPlan.type)}</strong></div><div><span>Số kỳ</span><strong>{recentEnrollment.paymentPlan.items.length}</strong></div><Link to={`/admin/enrollments/${recentEnrollment.enrollment.id}/view`}>Xem chi tiết công nợ</Link></> : <span>Đăng ký này không phát sinh công nợ.</span>}
        </section>}
      </SidePanel>
    </>
  );
}
