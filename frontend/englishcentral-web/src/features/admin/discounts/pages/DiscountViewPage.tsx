import { useEffect, useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { toastDanger } from "@/components/ui";
import { adminDiscountsApi, type AdminDiscount } from "@/features/admin/discounts/api/admin-discounts-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

const typeLabels: Record<string, string> = { "1": "Số tiền", "2": "Phần trăm", Percentage: "Phần trăm", Percent: "Phần trăm", FixedAmount: "Số tiền", Amount: "Số tiền" };
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "Chưa cập nhật";
const formatMoney = (value: number) => new Intl.NumberFormat("en-US").format(value);
const formatValue = (record: AdminDiscount) => {
  const type = String(record.type).toLowerCase();
  return type.includes("percent") || type === "2" ? `${formatMoney(record.value)}%` : `${formatMoney(record.value)} đ`;
};
const formatUsage = (record: AdminDiscount) => `${formatMoney(record.usedCount ?? 0)} / ${record.maxUsageCount === null || record.maxUsageCount === undefined ? "Không giới hạn" : formatMoney(record.maxUsageCount)}`;

export function DiscountViewPage() {
  const { recordId } = useParams();
  const [record, setRecord] = useState<AdminDiscount | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));
  useEffect(() => {
    if (!recordId) return;
    let isMounted = true;
    adminDiscountsApi.getById(recordId).then((result) => { if (isMounted) setRecord(result); }).catch((error) => toastDanger(getAuthErrorMessage(error))).finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [recordId]);
  const field = (label: string, value: string | number) => <label className={styles.field}><span>{label}</span><input readOnly value={value} /></label>;

  return <div className={styles.page}><section className={styles.header}><div><Link className={styles.backLink} to="/admin/finance/discounts"><ArrowLeft size={16} /> Quay lại danh sách</Link><h1>Chi tiết giảm giá</h1></div>{record && <Link className={listStyles.createButton} to={`/admin/finance/discounts/${record.id}/edit`}><Edit3 size={16} /> Chỉnh sửa</Link>}</section>
    <section className={styles.panel}><div className={styles.panelHeader}><div><h2>Thông tin giảm giá</h2><p>Xem voucher và ưu đãi học phí đang lưu trong hệ thống.</p></div></div>
      {isLoading ? <p className={styles.accountState}>Đang tải thông tin giảm giá...</p> : record ? <div className={styles.formGrid}>
        {field("Mã giảm giá", record.code)}
        {field("Loại giảm giá", typeLabels[String(record.type)] ?? String(record.type))}
        {field("Giá trị", formatValue(record))}
        {field("Ngày bắt đầu", formatDate(record.validFrom))}
        {field("Ngày kết thúc", formatDate(record.validTo))}
        {field("Đã dùng", formatUsage(record))}
        {field("Mỗi học viên được dùng tối đa", record.maxUsagePerStudent ?? "Không giới hạn")}
        {field("Trạng thái", record.isActive ? "Hoạt động" : "Ngừng hoạt động")}
        <label className={`${styles.field} ${styles.notesField}`}><span>Ghi chú</span><textarea readOnly rows={5} value={record.description ?? "Chưa cập nhật"} /></label>
      </div> : <p className={styles.accountState}>Không tìm thấy giảm giá.</p>}
    </section>
  </div>;
}
