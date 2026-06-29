import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, FilePlus2, WalletCards } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { toastDanger, toastSuccess } from "@/components/ui";
import { adminClassesApi, type AdminClass } from "@/features/admin/classes/api/admin-classes-api";
import { adminEnrollmentFinanceApi, type AdminEnrollment, type AdminInvoice, type BillingSummary } from "@/features/admin/enrollments/api/admin-enrollment-finance-api";
import { adminPaymentPlansApi, type AdminPaymentPlan } from "@/features/admin/payment-plans/api/admin-payment-plans-api";
import formStyles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { adminStudentsApi, type AdminStudent } from "@/features/admin/students/api/admin-students-api";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import styles from "./EnrollmentFinancePage.module.scss";

const money = (value: number) => `${new Intl.NumberFormat("en-US").format(value)} đ`;
const date = (value: string) => new Intl.DateTimeFormat("vi-VN").format(new Date(value));
const planTypeLabels: Record<string, string> = { "1": "Thanh toán đủ", "2": "Theo tháng", "3": "Trả góp", FullPayment: "Thanh toán đủ", Monthly: "Theo tháng", Installment: "Trả góp" };
const invoiceStatusLabels: Record<string, string> = { "1": "Nháp", "2": "Đã phát hành", "3": "Thanh toán một phần", "4": "Đã thanh toán", "5": "Quá hạn", "6": "Đã hủy", Draft: "Nháp", Issued: "Đã phát hành", PartiallyPaid: "Thanh toán một phần", Paid: "Đã thanh toán", Overdue: "Quá hạn", Cancelled: "Đã hủy" };
const planItemStatusLabels: Record<string, string> = { "1": "Chờ thu", "2": "Đã xuất hóa đơn", "3": "Đã thanh toán", "4": "Quá hạn", "5": "Đã hủy", Pending: "Chờ thu", Invoiced: "Đã xuất hóa đơn", Paid: "Đã thanh toán", Overdue: "Quá hạn", Cancelled: "Đã hủy" };

export function EnrollmentDetailPage() {
  const { recordId } = useParams();
  const [enrollment, setEnrollment] = useState<AdminEnrollment | null>(null);
  const [student, setStudent] = useState<AdminStudent | null>(null);
  const [classroom, setClassroom] = useState<AdminClass | null>(null);
  const [plan, setPlan] = useState<AdminPaymentPlan | null>(null);
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadData = useCallback(async () => {
    if (!recordId) return;
    try {
      const nextEnrollment = await adminEnrollmentFinanceApi.getEnrollment(recordId);
      const [planResult, invoiceResult, nextSummary, nextStudent, nextClassroom] = await Promise.all([
        adminPaymentPlansApi.getList({ page: 1, pageSize: 1, enrollmentId: nextEnrollment.id }),
        adminEnrollmentFinanceApi.getInvoices(nextEnrollment.id),
        adminEnrollmentFinanceApi.getSummary(nextEnrollment.id),
        adminStudentsApi.getById(nextEnrollment.studentId),
        adminClassesApi.getById(nextEnrollment.classId),
      ]);
      setEnrollment(nextEnrollment);
      setPlan(planResult.items[0] ?? null);
      setInvoices(invoiceResult.items);
      setSummary(nextSummary);
      setStudent(nextStudent);
      setClassroom(nextClassroom);
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    }
  }, [recordId]);

  useEffect(() => {
    // The loader updates state only after its API requests resolve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);
  const generateInvoices = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      await adminEnrollmentFinanceApi.generateInvoices();
      await loadData();
      toastSuccess("Sinh hóa đơn thành công.");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  };
  const field = (label: string, value: string | number) => <label className={formStyles.field}><span>{label}</span><input readOnly value={value} /></label>;

  return <div className={`${formStyles.page} ${styles.page}`}>
    <section className={formStyles.header}><div><Link className={formStyles.backLink} to="/admin/classes"><ArrowLeft size={16} /> Quay lại lớp học</Link><h1>Chi tiết đăng ký học</h1></div>{enrollment && summary && summary.outstandingAmount > 0 && <Link className={formStyles.backLink} to={`/admin/enrollments/${enrollment.id}/payments/create`}><WalletCards size={16} /> Ghi nhận thanh toán</Link>}</section>
    {enrollment && <section className={formStyles.panel}><div className={formStyles.panelHeader}><div><h2>Thông tin đăng ký</h2><p>Học viên, lớp học và số liệu công nợ hiện tại.</p></div></div><div className={formStyles.formGrid}>
      {field("Mã đăng ký", enrollment.enrollmentCode)}
      {field("Học viên", student ? `${student.studentCode} - ${student.fullName}` : `#${enrollment.studentId}`)}
      {field("Lớp học", classroom ? `${classroom.code} - ${classroom.name}` : `#${enrollment.classId}`)}
      {field("Ngày đăng ký", date(enrollment.enrolledAt))}
    </div></section>}
    {summary && <section className={styles.summary}><article className={styles.card}><span>Học phí sau giảm</span><strong>{money(summary.finalAmount)}</strong></article><article className={styles.card}><span>Đã thu</span><strong>{money(summary.paidAmount)}</strong></article><article className={styles.card}><span>Còn nợ</span><strong>{money(summary.outstandingAmount)}</strong></article><article className={styles.card}><span>Hóa đơn quá hạn</span><strong>{summary.overdueInvoiceCount}</strong></article></section>}
    <section className={styles.section}><div className={styles.sectionHeader}><div><h2>Kế hoạch thanh toán</h2><p>{plan ? `${planTypeLabels[String(plan.type)] ?? String(plan.type)} · ${plan.items.length} kỳ` : "Không phát sinh kế hoạch thanh toán."}</p></div></div>{plan ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Kỳ</th><th>Ngày đến hạn</th><th>Số tiền</th><th>Trạng thái</th></tr></thead><tbody>{plan.items.map((item) => <tr key={item.id}><td>{item.name}</td><td>{date(item.dueDate)}</td><td>{money(item.amount)}</td><td>{planItemStatusLabels[String(item.status)] ?? String(item.status)}</td></tr>)}</tbody></table></div> : <div className={styles.empty}>Không có kỳ thanh toán.</div>}</section>
    <section className={styles.section}><div className={styles.sectionHeader}><div><h2>Hóa đơn</h2><p>Danh sách hóa đơn thuộc đăng ký học này.</p></div><button disabled={isGenerating} type="button" onClick={generateInvoices}><FilePlus2 size={16} /> {isGenerating ? "Đang sinh..." : "Sinh hóa đơn"}</button></div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Số hóa đơn</th><th>Ngày đến hạn</th><th>Tổng tiền</th><th>Đã thu</th><th>Còn nợ</th><th>Trạng thái</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id}><td>{invoice.invoiceNo}</td><td>{date(invoice.dueDate)}</td><td>{money(invoice.totalAmount)}</td><td>{money(invoice.paidAmount)}</td><td>{money(invoice.outstandingAmount)}</td><td>{invoiceStatusLabels[String(invoice.status)] ?? String(invoice.status)}</td></tr>)}</tbody></table>{invoices.length === 0 && <div className={styles.empty}>Chưa có hóa đơn. Có thể bấm Sinh hóa đơn để xử lý ngay.</div>}</div></section>
  </div>;
}
