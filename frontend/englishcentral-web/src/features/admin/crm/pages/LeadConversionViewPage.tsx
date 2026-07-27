import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { toastDanger } from "@/components/ui";
import { adminCrmApi, type AdminLeadConversion } from "@/features/admin/crm/api/admin-crm-api";
import { formatDateTime, formatMoney } from "@/features/admin/crm/pages/crm-page-utils";
import crmStyles from "@/features/admin/crm/pages/CrmPages.module.scss";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

export function LeadConversionViewPage() {
  const { recordId } = useParams();
  const [record, setRecord] = useState<AdminLeadConversion | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));

  useEffect(() => {
    if (!recordId) return;
    let mounted = true;
    adminCrmApi.leadConversions.getById(recordId)
      .then((result) => mounted && setRecord(result))
      .catch((error) => mounted && toastDanger(getAuthErrorMessage(error)))
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, [recordId]);

  return (
    <div className={styles.page}>
      <section className={styles.header}><div><Link className={styles.backLink} to="/admin/crm-sales/lead-conversions"><ArrowLeft size={16} /> Quay lại danh sách</Link><h1>Chi tiết chuyển đổi lead</h1></div></section>
      <section className={styles.panel}>
        <div className={styles.panelHeader}><div><h2>Thông tin chuyển đổi</h2><p>Snapshot dữ liệu tại thời điểm lead được chuyển đổi thành học viên.</p></div></div>
        {isLoading ? <p className={styles.accountState}>Đang tải thông tin...</p> : record ? (
          <div className={crmStyles.detailGrid}>
            <div className={crmStyles.detailCard}><span>Lead ID</span><strong>#{record.leadId}</strong></div>
            <div className={crmStyles.detailCard}><span>Học viên</span><strong>{record.studentName || record.studentCode || `#${record.studentId}`}</strong></div>
            <div className={crmStyles.detailCard}><span>Enrollment</span><strong>{record.enrollmentCode || (record.enrollmentId ? `#${record.enrollmentId}` : "Chưa cập nhật")}</strong></div>
            <div className={crmStyles.detailCard}><span>Người chuyển đổi</span><strong>{record.convertedByUserName || `#${record.convertedByUserId}`}</strong></div>
            <div className={crmStyles.detailCard}><span>Nguồn snapshot</span><strong>{record.sourceNameSnapshot || "Chưa cập nhật"}</strong></div>
            <div className={crmStyles.detailCard}><span>Kênh snapshot</span><strong>{record.channelSnapshot || "Chưa cập nhật"}</strong></div>
            <div className={crmStyles.detailCard}><span>Khóa học snapshot</span><strong>{record.courseNameSnapshot || "Chưa cập nhật"}</strong></div>
            <div className={crmStyles.detailCard}><span>Doanh thu snapshot</span><strong>{formatMoney(record.revenueSnapshot)}</strong></div>
            <div className={crmStyles.detailCard}><span>Ngày chuyển đổi</span><strong>{formatDateTime(record.convertedAt)}</strong></div>
            <div className={crmStyles.detailCard}><span>Ngày tạo</span><strong>{formatDateTime(record.createdAt)}</strong></div>
            <div className={`${crmStyles.detailCard} ${crmStyles.wide}`}><span>Ghi chú</span><strong>{record.note || "Chưa cập nhật"}</strong></div>
          </div>
        ) : <p className={styles.accountState}>Không tìm thấy chuyển đổi lead.</p>}
      </section>
    </div>
  );
}
