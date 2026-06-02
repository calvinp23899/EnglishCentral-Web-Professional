import { useEffect, useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { toastDanger } from "@/components/ui";
import { adminBillingPoliciesApi, type AdminBillingPolicy } from "@/features/admin/billing-policies/api/admin-billing-policies-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

const typeLabels: Record<string, string> = { "1": "Thanh toán đủ", "2": "Theo tháng", "3": "Trả góp", "4": "Tùy chỉnh", FullPayment: "Thanh toán đủ", Monthly: "Theo tháng", Installment: "Trả góp", Custom: "Tùy chỉnh" };

export function BillingPolicyViewPage() {
  const { recordId } = useParams();
  const [record, setRecord] = useState<AdminBillingPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));
  useEffect(() => {
    if (!recordId) return;
    let isMounted = true;
    adminBillingPoliciesApi.getById(recordId).then((result) => { if (isMounted) setRecord(result); }).catch((error) => toastDanger(getAuthErrorMessage(error))).finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [recordId]);
  const field = (label: string, value: string | number) => <label className={styles.field}><span>{label}</span><input readOnly value={value} /></label>;

  return <div className={styles.page}><section className={styles.header}><div><Link className={styles.backLink} to="/admin/finance/tuition-policies"><ArrowLeft size={16} /> Quay lại danh sách</Link><h1>Chi tiết chính sách học phí</h1></div>{record && <Link className={listStyles.createButton} to={`/admin/finance/tuition-policies/${record.id}/edit`}><Edit3 size={16} /> Chỉnh sửa</Link>}</section>
    <section className={styles.panel}><div className={styles.panelHeader}><div><h2>Thông tin chính sách</h2><p>Xem quy tắc thanh toán học phí đang lưu trong hệ thống.</p></div></div>
      {isLoading ? <p className={styles.accountState}>Đang tải thông tin chính sách...</p> : record ? <div className={styles.formGrid}>
        {field("Mã chính sách", `BP-${record.id}`)}
        {field("Tên chính sách", record.name)}
        {field("Loại chính sách", typeLabels[String(record.type)] ?? String(record.type))}
        {field("Số kỳ trả góp", record.numberOfInstallments ?? "-")}
        {field("Chính sách mặc định", record.isDefault ? "Có" : "Không")}
        {field("Trạng thái", record.isActive ? "Hoạt động" : "Ngừng hoạt động")}
        <label className={`${styles.field} ${styles.notesField}`}><span>Ghi chú</span><textarea readOnly rows={5} value={record.notes ?? "Chưa cập nhật"} /></label>
      </div> : <p className={styles.accountState}>Không tìm thấy chính sách học phí.</p>}
    </section>
  </div>;
}
