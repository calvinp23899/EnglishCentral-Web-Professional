import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorMessage, toastDanger, toastSuccess } from "@/components/ui";
import {
  adminBillingPoliciesApi,
  type BillingPolicyFormPayload,
  type BillingPolicyType,
} from "@/features/admin/billing-policies/api/admin-billing-policies-api";
import { adminMetadataApi, type MetadataOption } from "@/features/admin/shared/api/admin-metadata-api";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type Props = { mode: "create" | "edit" };
type FormState = { name: string; type: BillingPolicyType; numberOfInstallments: string; isActive: boolean; notes: string };
type FormErrors = Partial<Record<keyof FormState, string>>;
const typeValues: Record<string, BillingPolicyType> = { "1": "FullPayment", "2": "Monthly", "3": "Installment" };

export function BillingPolicyFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const isEditMode = mode === "edit";
  const [form, setForm] = useState<FormState>({ name: "", type: "FullPayment", numberOfInstallments: "", isActive: true, notes: "" });
  const [typeOptions, setTypeOptions] = useState<MetadataOption[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    adminMetadataApi.getBillingPolicyTypeOptions()
      .then(setTypeOptions)
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!isEditMode || !recordId) return;
    let isMounted = true;
    adminBillingPoliciesApi.getById(recordId)
      .then((record) => {
        if (!isMounted) return;
        setForm({ name: record.name, type: typeValues[String(record.type)] ?? record.type as BillingPolicyType, numberOfInstallments: record.numberOfInstallments ? String(record.numberOfInstallments) : "", isActive: record.isActive, notes: record.notes ?? "" });
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)))
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [isEditMode, recordId]);

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const validate = () => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Vui lòng nhập tên chính sách.";
    else if (form.name.trim().length > 255) next.name = "Tên chính sách không được vượt quá 255 ký tự.";
    if (form.type === "Installment" && (!Number.isInteger(Number(form.numberOfInstallments)) || Number(form.numberOfInstallments) <= 1)) next.numberOfInstallments = "Số kỳ trả góp phải lớn hơn 1.";
    if (form.notes.trim().length > 2000) next.notes = "Ghi chú không được vượt quá 2000 ký tự.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    const payload: BillingPolicyFormPayload = { name: form.name.trim(), type: form.type, numberOfInstallments: form.type === "Installment" ? Number(form.numberOfInstallments) : null, isActive: form.isActive, notes: form.notes.trim() || null };
    setIsSubmitting(true);
    try {
      if (isEditMode && recordId) {
        await adminBillingPoliciesApi.update(recordId, { ...payload, id: Number(recordId) });
        toastSuccess("Cập nhật chính sách học phí thành công.");
      } else {
        await adminBillingPoliciesApi.create(payload);
        toastSuccess("Tạo chính sách học phí thành công.");
      }
      navigate("/admin/finance/tuition-policies");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className={styles.page}><section className={styles.header}><div><Link className={styles.backLink} to="/admin/finance/tuition-policies"><ArrowLeft size={16} /> Quay lại danh sách</Link><h1>{isEditMode ? "Chỉnh sửa chính sách học phí" : "Tạo chính sách học phí"}</h1></div></section>
    <form className={styles.panel} onSubmit={handleSubmit}><div className={styles.panelHeader}><div><h2>Thông tin chính sách</h2><p>Thiết lập quy tắc thanh toán học phí dùng trong hệ thống.</p></div></div>
      {isLoading ? <p className={styles.accountState}>Đang tải thông tin chính sách...</p> : <div className={styles.formGrid}>
        <label className={styles.field}><span>Tên chính sách <em className={styles.requiredMark}>*</em></span><input value={form.name} onChange={(event) => updateField("name", event.target.value)} /><ErrorMessage message={errors.name} /></label>
        <label className={styles.field}><span>Loại chính sách <em className={styles.requiredMark}>*</em></span><select value={form.type} onChange={(event) => updateField("type", event.target.value as BillingPolicyType)}>{typeOptions.map((option) => <option key={option.value} value={option.value}>{option.value}</option>)}</select></label>
        {form.type === "Installment" && <label className={styles.field}><span>Số kỳ trả góp <em className={styles.requiredMark}>*</em></span><input min={2} type="number" value={form.numberOfInstallments} onChange={(event) => updateField("numberOfInstallments", event.target.value)} /><ErrorMessage message={errors.numberOfInstallments} /></label>}
        <label className={styles.field}><span>Trạng thái <em className={styles.requiredMark}>*</em></span><select value={String(form.isActive)} onChange={(event) => updateField("isActive", event.target.value === "true")}><option value="true">Hoạt động</option><option value="false">Ngừng hoạt động</option></select></label>
        <label className={`${styles.field} ${styles.notesField}`}><span>Ghi chú</span><textarea rows={5} value={form.notes} onChange={(event) => updateField("notes", event.target.value)} /><ErrorMessage message={errors.notes} /></label>
      </div>}
      <div className={styles.formActions}><button className={styles.secondaryButton} type="button" onClick={() => navigate("/admin/finance/tuition-policies")}>Hủy</button><button disabled={isLoading || isSubmitting} type="submit"><Save size={16} />{isSubmitting ? "Đang lưu..." : "Lưu chính sách"}</button></div>
    </form>
  </div>;
}
