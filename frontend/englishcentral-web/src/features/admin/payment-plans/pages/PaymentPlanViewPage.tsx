import { useEffect, useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { toastDanger } from "@/components/ui";
import { adminPaymentPlansApi, type AdminPaymentPlan } from "@/features/admin/payment-plans/api/admin-payment-plans-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import paymentStyles from "./PaymentPlanPage.module.scss";

const typeLabels: Record<string, string> = { "1": "Thanh toán đủ", "2": "Theo tháng", "3": "Trả góp", "4": "Tùy chỉnh", FullPayment: "Thanh toán đủ", Monthly: "Theo tháng", Installment: "Trả góp", Custom: "Tùy chỉnh" };
const statusLabels: Record<string, string> = { "1": "Nháp", "2": "Đang áp dụng", "3": "Hoàn thành", "4": "Đã hủy", "5": "Đã hủy", Draft: "Nháp", Active: "Đang áp dụng", Completed: "Hoàn thành", Cancelled: "Đã hủy", Pending: "Chờ thu", Invoiced: "Đã xuất hóa đơn", Paid: "Đã thanh toán", Overdue: "Quá hạn" };
const money = (value: number) => `${new Intl.NumberFormat("en-US").format(value)} đ`;
const date = (value: string) => new Intl.DateTimeFormat("vi-VN").format(new Date(value));

export function PaymentPlanViewPage() {
  const { recordId } = useParams();
  const [record, setRecord] = useState<AdminPaymentPlan | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));

  useEffect(() => {
    if (!recordId) return;
    let isMounted = true;
    adminPaymentPlansApi.getById(recordId)
      .then((result) => { if (isMounted) setRecord(result); })
      .catch((error) => toastDanger(getAuthErrorMessage(error)))
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [recordId]);

  const field = (label: string, value: string | number) => <label className={styles.field}><span>{label}</span><input readOnly value={value} /></label>;

  return <div className={styles.page}>
    <section className={styles.header}><div><Link className={styles.backLink} to="/admin/finance/payment-plans"><ArrowLeft size={16} /> Quay lại danh sách</Link><h1>Chi tiết kế hoạch thanh toán</h1></div>{record && <Link className={listStyles.createButton} to={`/admin/finance/payment-plans/${record.id}/edit`}><Edit3 size={16} /> Chỉnh sửa</Link>}</section>
    <section className={styles.panel}>
      <div className={styles.panelHeader}><div><h2>Thông tin kế hoạch</h2><p>Xem lịch thu học phí đang lưu trong hệ thống.</p></div></div>
      {isLoading ? <p className={styles.accountState}>Đang tải thông tin kế hoạch...</p> : record ? <>
        <div className={styles.formGrid}>
          {field("Mã kế hoạch", `PP-${record.id}`)}
          {field("Mã đăng ký", `#${record.enrollmentId}`)}
          {field("Mã chính sách học phí", record.billingPolicyId ? `#${record.billingPolicyId}` : "Không áp dụng")}
          {field("Loại kế hoạch", typeLabels[String(record.type)] ?? String(record.type))}
          {field("Tổng tiền", money(record.totalAmount))}
          {field("Số kỳ", record.items.length)}
          {field("Trạng thái", statusLabels[String(record.status)] ?? String(record.status))}
          <label className={`${styles.field} ${styles.notesField}`}><span>Ghi chú</span><textarea readOnly rows={4} value={record.notes ?? "Chưa cập nhật"} /></label>
        </div>
        <div className={paymentStyles.schedule}><div className={paymentStyles.scheduleHeader}><div><h3>Lịch thanh toán</h3><p>Chi tiết từng kỳ thu tiền.</p></div></div><div><table className={paymentStyles.itemsTable}><thead><tr><th>Thứ tự</th><th>Tên kỳ</th><th>Ngày đến hạn</th><th>Số tiền</th><th>Trạng thái</th><th>Hóa đơn</th></tr></thead><tbody>{record.items.map((item) => <tr key={item.id}><td>{item.sequenceNumber}</td><td>{item.name}</td><td>{date(item.dueDate)}</td><td>{money(item.amount)}</td><td>{statusLabels[String(item.status)] ?? String(item.status)}</td><td>{item.invoiceId ? `#${item.invoiceId}` : "Chưa có"}</td></tr>)}</tbody></table></div></div>
      </> : <p className={styles.accountState}>Không tìm thấy kế hoạch thanh toán.</p>}
    </section>
  </div>;
}
