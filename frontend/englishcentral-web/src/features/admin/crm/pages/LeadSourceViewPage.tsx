import { useEffect, useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { toastDanger } from "@/components/ui";
import {
  adminCrmApi,
  getLeadSourceChannelLabel,
  type AdminLeadSource,
} from "@/features/admin/crm/api/admin-crm-api";
import { formatDateTime, formatMoney } from "@/features/admin/crm/pages/crm-page-utils";
import crmStyles from "@/features/admin/crm/pages/CrmPages.module.scss";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

export function LeadSourceViewPage() {
  const { recordId } = useParams();
  const [record, setRecord] = useState<AdminLeadSource | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));

  useEffect(() => {
    if (!recordId) return;
    let mounted = true;
    adminCrmApi.leadSources
      .getById(recordId)
      .then((result) => mounted && setRecord(result))
      .catch((error) => mounted && toastDanger(getAuthErrorMessage(error)))
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, [recordId]);

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to="/admin/crm-sales/lead-sources"><ArrowLeft size={16} /> Quay lại danh sách</Link>
          <h1>Chi tiết nguồn lead</h1>
        </div>
        {record && <Link className={listStyles.createButton} to={`/admin/crm-sales/lead-sources/${record.id}/edit`}><Edit3 size={16} /> Chỉnh sửa</Link>}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}><div><h2>Thông tin nguồn lead</h2><p>Xem cấu hình nguồn khách hàng tiềm năng đang lưu trong hệ thống.</p></div></div>
        {isLoading ? <p className={styles.accountState}>Đang tải thông tin...</p> : record ? (
          <div className={crmStyles.detailGrid}>
            <div className={crmStyles.detailCard}><span>Mã nguồn</span><strong>{record.code}</strong></div>
            <div className={crmStyles.detailCard}><span>Tên nguồn</span><strong>{record.name}</strong></div>
            <div className={crmStyles.detailCard}><span>Kênh</span><strong>{getLeadSourceChannelLabel(record.channel)}</strong></div>
            <div className={crmStyles.detailCard}><span>Trạng thái</span><strong>{record.isActive ? "Hoạt động" : "Ngừng hoạt động"}</strong></div>
            <div className={crmStyles.detailCard}><span>Chiến dịch</span><strong>{record.campaignName || "Chưa cập nhật"}</strong></div>
            <div className={crmStyles.detailCard}><span>Chi phí</span><strong>{formatMoney(record.cost)}</strong></div>
            <div className={crmStyles.detailCard}><span>Ngày tạo</span><strong>{formatDateTime(record.createdAt)}</strong></div>
            <div className={crmStyles.detailCard}><span>Ngày cập nhật</span><strong>{formatDateTime(record.updatedAt)}</strong></div>
            <div className={`${crmStyles.detailCard} ${crmStyles.wide}`}><span>Mô tả</span><strong>{record.description || "Chưa cập nhật"}</strong></div>
          </div>
        ) : <p className={styles.accountState}>Không tìm thấy nguồn lead.</p>}
      </section>
    </div>
  );
}
