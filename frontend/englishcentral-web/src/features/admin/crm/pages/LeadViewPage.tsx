import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Edit3, MessageSquarePlus, RefreshCw, UserCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { SidePanel, toastDanger, toastSuccess } from "@/components/ui";
import { adminStudentsApi, type AdminStudent } from "@/features/admin/students/api/admin-students-api";
import {
  adminCrmApi,
  getLeadActivityTypeLabel,
  getLeadLostReasonLabel,
  getLeadStatusLabel,
  leadActivityTypeOptions,
  leadLostReasonOptions,
  type AdminLead,
} from "@/features/admin/crm/api/admin-crm-api";
import { emptyToNull, formatDateTime, formatMoney, getCurrentAdminNumericId, numberOrNull, toIsoFromLocal } from "@/features/admin/crm/pages/crm-page-utils";
import crmStyles from "@/features/admin/crm/pages/CrmPages.module.scss";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import toolbarStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type ActivityForm = { activityType: string; note: string; outcome: string; nextFollowUpAt: string; createdByUserId: string };
type LostForm = { lostReason: string; lostReasonNote: string };
type ConvertForm = { studentId: string; enrollmentId: string; convertedByUserId: string; revenueSnapshot: string; note: string };

const initialActivityForm = (): ActivityForm => ({
  activityType: "Call",
  note: "",
  outcome: "",
  nextFollowUpAt: "",
  createdByUserId: String(getCurrentAdminNumericId() ?? ""),
});
const initialLostForm: LostForm = { lostReason: "NoResponse", lostReasonNote: "" };
const initialConvertForm = (): ConvertForm => ({
  studentId: "",
  enrollmentId: "",
  convertedByUserId: String(getCurrentAdminNumericId() ?? ""),
  revenueSnapshot: "",
  note: "",
});

export function LeadViewPage() {
  const { recordId } = useParams();
  const [record, setRecord] = useState<AdminLead | null>(null);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isLostOpen, setIsLostOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [activityForm, setActivityForm] = useState<ActivityForm>(initialActivityForm);
  const [lostForm, setLostForm] = useState<LostForm>(initialLostForm);
  const [convertForm, setConvertForm] = useState<ConvertForm>(initialConvertForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRecord = () => {
    if (!recordId) return;
    setIsLoading(true);
    adminCrmApi.leads.getById(recordId)
      .then(setRecord)
      .catch((error) => toastDanger(getAuthErrorMessage(error)))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadRecord, [recordId]);

  useEffect(() => {
    adminStudentsApi.getList({ page: 1, pageSize: 100, keyword: "", isDescending: true })
      .then((result) => setStudents(result.items))
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  const submitActivity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recordId || isSubmitting) return;
    const createdByUserId = Number(activityForm.createdByUserId);
    if (!createdByUserId) {
      toastDanger("Vui lòng nhập ID người tạo hoạt động.");
      return;
    }
    setIsSubmitting(true);
    try {
      await adminCrmApi.leads.createActivity(recordId, {
        activityType: activityForm.activityType,
        note: emptyToNull(activityForm.note),
        outcome: emptyToNull(activityForm.outcome),
        nextFollowUpAt: toIsoFromLocal(activityForm.nextFollowUpAt),
        createdByUserId,
      });
      toastSuccess("Thêm hoạt động lead thành công.");
      setIsActivityOpen(false);
      setActivityForm(initialActivityForm());
      loadRecord();
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recordId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await adminCrmApi.leads.markLost(recordId, { lostReason: lostForm.lostReason, lostReasonNote: emptyToNull(lostForm.lostReasonNote) });
      toastSuccess("Đã đánh dấu lead thất bại.");
      setIsLostOpen(false);
      loadRecord();
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitConvert = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recordId || isSubmitting) return;
    const convertedByUserId = Number(convertForm.convertedByUserId);
    if (!convertForm.studentId || !convertedByUserId) {
      toastDanger("Vui lòng chọn học viên và nhập ID người chuyển đổi.");
      return;
    }
    setIsSubmitting(true);
    try {
      await adminCrmApi.leads.convert(recordId, {
        studentId: Number(convertForm.studentId),
        enrollmentId: numberOrNull(convertForm.enrollmentId),
        convertedByUserId,
        revenueSnapshot: numberOrNull(convertForm.revenueSnapshot),
        note: emptyToNull(convertForm.note),
      });
      toastSuccess("Chuyển đổi lead thành công.");
      setIsConvertOpen(false);
      loadRecord();
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.page}>
        <section className={styles.header}>
          <div><Link className={styles.backLink} to="/admin/crm-sales/leads"><ArrowLeft size={16} /> Quay lại danh sách</Link><h1>Chi tiết lead</h1></div>
          {record && <Link className={listStyles.createButton} to={`/admin/crm-sales/leads/${record.id}/edit`}><Edit3 size={16} /> Chỉnh sửa</Link>}
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHeader}><div><h2>{record?.fullName ?? "Thông tin lead"}</h2><p>Theo dõi nguồn, trạng thái, hoạt động chăm sóc và chuyển đổi của lead.</p></div></div>
          {isLoading ? <p className={styles.accountState}>Đang tải thông tin lead...</p> : record ? (
            <>
              <div className={crmStyles.subActions}>
                <button className={crmStyles.secondaryButton} type="button" onClick={() => setIsActivityOpen(true)}><MessageSquarePlus size={16} /> Thêm hoạt động</button>
                <button className={crmStyles.dangerButton} type="button" onClick={() => setIsLostOpen(true)}><RefreshCw size={16} /> Mark lost</button>
                <button className={crmStyles.successButton} type="button" onClick={() => setIsConvertOpen(true)}><UserCheck size={16} /> Convert</button>
              </div>
              <div className={crmStyles.detailGrid}>
                <div className={crmStyles.detailCard}><span>Mã lead</span><strong>{record.leadCode}</strong></div>
                <div className={crmStyles.detailCard}><span>Trạng thái</span><strong>{getLeadStatusLabel(record.status)}</strong></div>
                <div className={crmStyles.detailCard}><span>SĐT</span><strong>{record.phoneNumber}</strong></div>
                <div className={crmStyles.detailCard}><span>Email</span><strong>{record.email || "Chưa cập nhật"}</strong></div>
                <div className={crmStyles.detailCard}><span>Nguồn lead</span><strong>{record.leadSourceName}</strong></div>
                <div className={crmStyles.detailCard}><span>Khóa học quan tâm</span><strong>{record.interestedCourseName || "Chưa cập nhật"}</strong></div>
                <div className={crmStyles.detailCard}><span>Phụ trách</span><strong>{record.assignedToUserName || "Chưa phân công"}</strong></div>
                <div className={crmStyles.detailCard}><span>Lịch chăm sóc</span><strong>{formatDateTime(record.nextFollowUpAt)}</strong></div>
                <div className={`${crmStyles.detailCard} ${crmStyles.wide}`}><span>Nhu cầu/Ghi chú</span><strong>{record.demandNote || "Chưa cập nhật"}</strong></div>
                {record.lostReason && <div className={crmStyles.detailCard}><span>Lý do thất bại</span><strong>{getLeadLostReasonLabel(record.lostReason)}</strong></div>}
                {record.convertedAt && <div className={crmStyles.detailCard}><span>Ngày chuyển đổi</span><strong>{formatDateTime(record.convertedAt)}</strong></div>}
              </div>
              {record.conversion && <><h3 className={crmStyles.sectionTitle}>Thông tin chuyển đổi</h3><div className={crmStyles.detailGrid}><div className={crmStyles.detailCard}><span>Học viên</span><strong>{record.conversion.studentName || record.conversion.studentCode || `#${record.conversion.studentId}`}</strong></div><div className={crmStyles.detailCard}><span>Doanh thu snapshot</span><strong>{formatMoney(record.conversion.revenueSnapshot)}</strong></div><div className={`${crmStyles.detailCard} ${crmStyles.wide}`}><span>Ghi chú</span><strong>{record.conversion.note || "Chưa cập nhật"}</strong></div></div></>}
              <h3 className={crmStyles.sectionTitle}>Hoạt động chăm sóc</h3>
              <table className={crmStyles.miniTable}><thead><tr><th>Loại</th><th>Ghi chú</th><th>Kết quả</th><th>Follow-up</th><th>Người tạo</th><th>Ngày tạo</th></tr></thead><tbody>{record.activities.map((activity) => <tr key={activity.id}><td>{getLeadActivityTypeLabel(activity.activityType)}</td><td>{activity.note || "-"}</td><td>{activity.outcome || "-"}</td><td>{formatDateTime(activity.nextFollowUpAt)}</td><td>{activity.createdByUserName || `#${activity.createdByUserId}`}</td><td>{formatDateTime(activity.createdAt)}</td></tr>)}</tbody></table>
              {record.activities.length === 0 && <p className={styles.accountState}>Lead này chưa có hoạt động chăm sóc.</p>}
            </>
          ) : <p className={styles.accountState}>Không tìm thấy lead.</p>}
        </section>
      </div>

      <SidePanel description="Ghi nhận một hoạt động chăm sóc mới cho lead." footer={null} isOpen={isActivityOpen} title="Thêm hoạt động" onClose={() => setIsActivityOpen(false)}>
        <form className={toolbarStyles.panelForm} onSubmit={submitActivity}>
          <label><span>Loại hoạt động</span><select value={activityForm.activityType} onChange={(event) => setActivityForm((current) => ({ ...current, activityType: event.target.value }))}>{leadActivityTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label><span>Người tạo ID</span><input min="1" type="number" value={activityForm.createdByUserId} onChange={(event) => setActivityForm((current) => ({ ...current, createdByUserId: event.target.value }))} /></label>
          <label><span>Follow-up tiếp theo</span><input type="datetime-local" value={activityForm.nextFollowUpAt} onChange={(event) => setActivityForm((current) => ({ ...current, nextFollowUpAt: event.target.value }))} /></label>
          <label><span>Kết quả</span><input value={activityForm.outcome} onChange={(event) => setActivityForm((current) => ({ ...current, outcome: event.target.value }))} /></label>
          <label><span>Ghi chú</span><textarea rows={4} value={activityForm.note} onChange={(event) => setActivityForm((current) => ({ ...current, note: event.target.value }))} /></label>
          <div className={toolbarStyles.panelActions}><button type="button" onClick={() => setIsActivityOpen(false)}>Hủy</button><button disabled={isSubmitting} type="submit">{isSubmitting ? "Đang lưu..." : "Lưu"}</button></div>
        </form>
      </SidePanel>

      <SidePanel description="Đánh dấu lead thất bại và lưu lý do để thống kê." footer={null} isOpen={isLostOpen} title="Mark lost" onClose={() => setIsLostOpen(false)}>
        <form className={toolbarStyles.panelForm} onSubmit={submitLost}>
          <label><span>Lý do thất bại</span><select value={lostForm.lostReason} onChange={(event) => setLostForm((current) => ({ ...current, lostReason: event.target.value }))}>{leadLostReasonOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label><span>Ghi chú</span><textarea rows={4} value={lostForm.lostReasonNote} onChange={(event) => setLostForm((current) => ({ ...current, lostReasonNote: event.target.value }))} /></label>
          <div className={toolbarStyles.panelActions}><button type="button" onClick={() => setIsLostOpen(false)}>Hủy</button><button disabled={isSubmitting} type="submit">{isSubmitting ? "Đang lưu..." : "Lưu"}</button></div>
        </form>
      </SidePanel>

      <SidePanel description="Chuyển lead sang học viên và lưu snapshot doanh thu nếu có." footer={null} isOpen={isConvertOpen} title="Convert lead" onClose={() => setIsConvertOpen(false)}>
        <form className={toolbarStyles.panelForm} onSubmit={submitConvert}>
          <label><span>Học viên</span><select value={convertForm.studentId} onChange={(event) => setConvertForm((current) => ({ ...current, studentId: event.target.value }))}><option value="">Chọn học viên</option>{students.map((student) => <option key={student.id} value={student.id}>{student.fullName} - {student.phoneNumber}</option>)}</select></label>
          <label><span>Enrollment ID</span><input min="1" type="number" value={convertForm.enrollmentId} onChange={(event) => setConvertForm((current) => ({ ...current, enrollmentId: event.target.value }))} /></label>
          <label><span>Người chuyển đổi ID</span><input min="1" type="number" value={convertForm.convertedByUserId} onChange={(event) => setConvertForm((current) => ({ ...current, convertedByUserId: event.target.value }))} /></label>
          <label><span>Doanh thu snapshot</span><input min="0" type="number" value={convertForm.revenueSnapshot} onChange={(event) => setConvertForm((current) => ({ ...current, revenueSnapshot: event.target.value }))} /></label>
          <label><span>Ghi chú</span><textarea rows={4} value={convertForm.note} onChange={(event) => setConvertForm((current) => ({ ...current, note: event.target.value }))} /></label>
          <div className={toolbarStyles.panelActions}><button type="button" onClick={() => setIsConvertOpen(false)}>Hủy</button><button disabled={isSubmitting} type="submit">{isSubmitting ? "Đang lưu..." : "Convert"}</button></div>
        </form>
      </SidePanel>
    </>
  );
}
