import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorMessage, toastDanger, toastSuccess } from "@/components/ui";
import {
  adminCrmApi,
  getLeadSourceChannelValue,
  leadSourceChannelOptions,
  type LeadSourcePayload,
} from "@/features/admin/crm/api/admin-crm-api";
import { emptyToNull, numberOrNull } from "@/features/admin/crm/pages/crm-page-utils";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type Props = { mode: "create" | "edit" };
type FormState = {
  name: string;
  channel: string;
  campaignName: string;
  cost: string;
  isActive: boolean;
  description: string;
};
type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  name: "",
  channel: "Ads",
  campaignName: "",
  cost: "",
  isActive: true,
  description: "",
};

export function LeadSourceFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const isEditMode = mode === "edit";
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode || !recordId) {
      return;
    }

    let mounted = true;
    adminCrmApi.leadSources
      .getById(recordId)
      .then((record) => {
        if (!mounted) return;
        setForm({
          name: record.name,
          channel: getLeadSourceChannelValue(record.channel) || "Ads",
          campaignName: record.campaignName ?? "",
          cost: record.cost === null || record.cost === undefined ? "" : String(record.cost),
          isActive: record.isActive,
          description: record.description ?? "",
        });
      })
      .catch((error) => mounted && toastDanger(getAuthErrorMessage(error)))
      .finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, [isEditMode, recordId]);

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên nguồn.";
    if (form.cost && Number(form.cost) < 0) nextErrors.cost = "Chi phí không được nhỏ hơn 0.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;

    const payload: LeadSourcePayload = {
      name: form.name.trim(),
      channel: form.channel,
      campaignName: emptyToNull(form.campaignName),
      description: emptyToNull(form.description),
      cost: numberOrNull(form.cost),
      isActive: form.isActive,
    };

    setIsSubmitting(true);
    try {
      if (isEditMode && recordId) {
        await adminCrmApi.leadSources.update(recordId, { ...payload, id: Number(recordId) });
        toastSuccess("Cập nhật nguồn lead thành công.");
      } else {
        await adminCrmApi.leadSources.create(payload);
        toastSuccess("Tạo nguồn lead thành công.");
      }
      navigate("/admin/crm-sales/lead-sources");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to="/admin/crm-sales/lead-sources"><ArrowLeft size={16} /> Quay lại danh sách</Link>
          <h1>{isEditMode ? "Chỉnh sửa nguồn lead" : "Tạo nguồn lead"}</h1>
        </div>
      </section>

      <form className={styles.panel} onSubmit={handleSubmit}>
        <div className={styles.panelHeader}><div><h2>Thông tin nguồn lead</h2><p>Nguồn lead cho biết khách hàng đến từ kênh nào, chiến dịch nào và chi phí marketing tương ứng.</p></div></div>
        {isLoading ? <p className={styles.accountState}>Đang tải thông tin nguồn lead...</p> : (
          <div className={styles.formGrid}>
            <label className={styles.field}><span>Tên nguồn <em className={styles.requiredMark}>*</em></span><input value={form.name} onChange={(event) => updateField("name", event.target.value)} /><ErrorMessage id="lead-source-name" message={errors.name} /></label>
            <label className={styles.field}><span>Kênh <em className={styles.requiredMark}>*</em></span><select value={form.channel} onChange={(event) => updateField("channel", event.target.value)}>{leadSourceChannelOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className={styles.field}><span>Trạng thái</span><select value={String(form.isActive)} onChange={(event) => updateField("isActive", event.target.value === "true")}><option value="true">Hoạt động</option><option value="false">Ngừng hoạt động</option></select></label>
            <label className={styles.field}><span>Chiến dịch</span><input value={form.campaignName} onChange={(event) => updateField("campaignName", event.target.value)} /></label>
            <label className={styles.field}><span>Chi phí</span><input min="0" type="number" value={form.cost} onChange={(event) => updateField("cost", event.target.value)} /><ErrorMessage id="lead-source-cost" message={errors.cost} /></label>
            <label className={`${styles.field} ${styles.notesField}`}><span>Mô tả</span><textarea rows={5} value={form.description} onChange={(event) => updateField("description", event.target.value)} /></label>
          </div>
        )}
        <div className={styles.formActions}><button className={styles.secondaryButton} type="button" onClick={() => navigate("/admin/crm-sales/lead-sources")}>Hủy</button><button type="submit" disabled={isLoading || isSubmitting}><Save size={16} /> {isSubmitting ? "Đang lưu..." : "Lưu nguồn lead"}</button></div>
      </form>
    </div>
  );
}
