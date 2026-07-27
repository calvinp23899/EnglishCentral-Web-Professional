import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorMessage, toastDanger, toastSuccess } from "@/components/ui";
import { adminCoursesApi, type AdminCourse } from "@/features/admin/courses/api/admin-courses-api";
import {
  adminCrmApi,
  getLeadLostReasonValue,
  getLeadStatusValue,
  leadLostReasonOptions,
  leadStatusOptions,
  type AdminLeadSource,
  type LeadPayload,
} from "@/features/admin/crm/api/admin-crm-api";
import { emptyToNull, numberOrNull, toIsoFromLocal, toLocalDateTime } from "@/features/admin/crm/pages/crm-page-utils";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type Props = { mode: "create" | "edit" };
type FormState = {
  fullName: string;
  phoneNumber: string;
  email: string;
  leadSourceId: string;
  assignedToUserId: string;
  interestedCourseId: string;
  status: string;
  nextFollowUpAt: string;
  demandNote: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrerUrl: string;
  landingPageUrl: string;
  lostReason: string;
  lostReasonNote: string;
};
type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  fullName: "",
  phoneNumber: "",
  email: "",
  leadSourceId: "",
  assignedToUserId: "",
  interestedCourseId: "",
  status: "New",
  nextFollowUpAt: "",
  demandNote: "",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  referrerUrl: "",
  landingPageUrl: "",
  lostReason: "",
  lostReasonNote: "",
};

export function LeadFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const isEditMode = mode === "edit";
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [leadSources, setLeadSources] = useState<AdminLeadSource[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      adminCrmApi.leadSources.getList({ page: 1, pageSize: 100, isActive: true }),
      adminCoursesApi.getList({ page: 1, pageSize: 100, isActive: true }),
    ])
      .then(([sourceResult, courseResult]) => {
        setLeadSources(sourceResult.items);
        setCourses(courseResult.items);
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!isEditMode || !recordId) return;
    let mounted = true;
    adminCrmApi.leads
      .getById(recordId)
      .then((record) => {
        if (!mounted) return;
        setForm({
          fullName: record.fullName,
          phoneNumber: record.phoneNumber,
          email: record.email ?? "",
          leadSourceId: String(record.leadSourceId),
          assignedToUserId: record.assignedToUserId ? String(record.assignedToUserId) : "",
          interestedCourseId: record.interestedCourseId ? String(record.interestedCourseId) : "",
          status: getLeadStatusValue(record.status) || "New",
          nextFollowUpAt: toLocalDateTime(record.nextFollowUpAt),
          demandNote: record.demandNote ?? "",
          utmSource: record.utmSource ?? "",
          utmMedium: record.utmMedium ?? "",
          utmCampaign: record.utmCampaign ?? "",
          referrerUrl: record.referrerUrl ?? "",
          landingPageUrl: record.landingPageUrl ?? "",
          lostReason: getLeadLostReasonValue(record.lostReason),
          lostReasonNote: record.lostReasonNote ?? "",
        });
      })
      .catch((error) => mounted && toastDanger(getAuthErrorMessage(error)))
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, [isEditMode, recordId]);

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Vui lòng nhập họ tên lead.";
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = "Vui lòng nhập số điện thoại.";
    if (!form.leadSourceId) nextErrors.leadSourceId = "Vui lòng chọn nguồn lead.";
    if (form.status === "Lost" && !form.lostReason) nextErrors.lostReason = "Vui lòng chọn lý do thất bại.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = (): LeadPayload => ({
    fullName: form.fullName.trim(),
    phoneNumber: form.phoneNumber.trim(),
    email: emptyToNull(form.email),
    leadSourceId: Number(form.leadSourceId),
    assignedToUserId: numberOrNull(form.assignedToUserId),
    interestedCourseId: numberOrNull(form.interestedCourseId),
    status: form.status,
    demandNote: emptyToNull(form.demandNote),
    utmSource: emptyToNull(form.utmSource),
    utmMedium: emptyToNull(form.utmMedium),
    utmCampaign: emptyToNull(form.utmCampaign),
    referrerUrl: emptyToNull(form.referrerUrl),
    landingPageUrl: emptyToNull(form.landingPageUrl),
    nextFollowUpAt: toIsoFromLocal(form.nextFollowUpAt),
    lostReason: form.status === "Lost" ? form.lostReason : null,
    lostReasonNote: form.status === "Lost" ? emptyToNull(form.lostReasonNote) : null,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (isEditMode && recordId) {
        await adminCrmApi.leads.update(recordId, { ...buildPayload(), id: Number(recordId), status: form.status });
        toastSuccess("Cập nhật lead thành công.");
      } else {
        const { status: _status, lostReason: _lostReason, lostReasonNote: _lostReasonNote, ...createPayload } = buildPayload();
        await adminCrmApi.leads.create(createPayload);
        toastSuccess("Tạo lead thành công.");
      }
      navigate("/admin/crm-sales/leads");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.header}><div><Link className={styles.backLink} to="/admin/crm-sales/leads"><ArrowLeft size={16} /> Quay lại danh sách</Link><h1>{isEditMode ? "Chỉnh sửa lead" : "Tạo lead"}</h1></div></section>
      <form className={styles.panel} onSubmit={handleSubmit}>
        <div className={styles.panelHeader}><div><h2>Thông tin lead</h2><p>Lead là khách hàng tiềm năng, có nguồn, nhu cầu, lịch chăm sóc và trạng thái xử lý.</p></div></div>
        {isLoading ? <p className={styles.accountState}>Đang tải thông tin lead...</p> : (
          <div className={styles.formGrid}>
            <label className={styles.field}><span>Họ tên <em className={styles.requiredMark}>*</em></span><input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} /><ErrorMessage id="lead-fullName" message={errors.fullName} /></label>
            <label className={styles.field}><span>SĐT <em className={styles.requiredMark}>*</em></span><input value={form.phoneNumber} onChange={(event) => updateField("phoneNumber", event.target.value)} /><ErrorMessage id="lead-phone" message={errors.phoneNumber} /></label>
            <label className={styles.field}><span>Email</span><input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} /></label>
            <label className={styles.field}><span>Nguồn lead <em className={styles.requiredMark}>*</em></span><select value={form.leadSourceId} onChange={(event) => updateField("leadSourceId", event.target.value)}><option value="">Chọn nguồn lead</option>{leadSources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</select><ErrorMessage id="lead-source" message={errors.leadSourceId} /></label>
            <label className={styles.field}><span>Khóa học quan tâm</span><select value={form.interestedCourseId} onChange={(event) => updateField("interestedCourseId", event.target.value)}><option value="">Chưa chọn</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
            <label className={styles.field}><span>Nhân viên phụ trách ID</span><input min="1" type="number" value={form.assignedToUserId} onChange={(event) => updateField("assignedToUserId", event.target.value)} /></label>
            {isEditMode && <label className={styles.field}><span>Trạng thái</span><select value={form.status} onChange={(event) => updateField("status", event.target.value)}>{leadStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>}
            <label className={styles.field}><span>Lịch chăm sóc tiếp theo</span><input type="datetime-local" value={form.nextFollowUpAt} onChange={(event) => updateField("nextFollowUpAt", event.target.value)} /></label>
            {isEditMode && form.status === "Lost" && <><label className={styles.field}><span>Lý do thất bại <em className={styles.requiredMark}>*</em></span><select value={form.lostReason} onChange={(event) => updateField("lostReason", event.target.value)}><option value="">Chọn lý do</option>{leadLostReasonOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ErrorMessage id="lead-lost-reason" message={errors.lostReason} /></label><label className={styles.field}><span>Ghi chú thất bại</span><input value={form.lostReasonNote} onChange={(event) => updateField("lostReasonNote", event.target.value)} /></label></>}
            <label className={styles.field}><span>UTM Source</span><input value={form.utmSource} onChange={(event) => updateField("utmSource", event.target.value)} /></label>
            <label className={styles.field}><span>UTM Medium</span><input value={form.utmMedium} onChange={(event) => updateField("utmMedium", event.target.value)} /></label>
            <label className={styles.field}><span>UTM Campaign</span><input value={form.utmCampaign} onChange={(event) => updateField("utmCampaign", event.target.value)} /></label>
            <label className={styles.field}><span>Referrer URL</span><input value={form.referrerUrl} onChange={(event) => updateField("referrerUrl", event.target.value)} /></label>
            <label className={styles.field}><span>Landing Page URL</span><input value={form.landingPageUrl} onChange={(event) => updateField("landingPageUrl", event.target.value)} /></label>
            <label className={`${styles.field} ${styles.notesField}`}><span>Nhu cầu/Ghi chú</span><textarea rows={5} value={form.demandNote} onChange={(event) => updateField("demandNote", event.target.value)} /></label>
          </div>
        )}
        <div className={styles.formActions}><button className={styles.secondaryButton} type="button" onClick={() => navigate("/admin/crm-sales/leads")}>Hủy</button><button type="submit" disabled={isLoading || isSubmitting}><Save size={16} /> {isSubmitting ? "Đang lưu..." : "Lưu lead"}</button></div>
      </form>
    </div>
  );
}
