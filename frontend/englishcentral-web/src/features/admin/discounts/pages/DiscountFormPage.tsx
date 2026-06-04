import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorMessage, toastDanger, toastSuccess } from "@/components/ui";
import { adminDiscountsApi, type DiscountFormPayload } from "@/features/admin/discounts/api/admin-discounts-api";
import { adminMetadataApi, type MetadataOption } from "@/features/admin/shared/api/admin-metadata-api";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type Props = { mode: "create" | "edit" };
type FormState = { code: string; type: string; value: string; validFrom: string; validTo: string; isActive: boolean; maxUsageCount: string; maxUsagePerStudent: string; description: string };
type FormErrors = Partial<Record<keyof FormState, string>>;

const formatMoneyInput = (value: string | number) => new Intl.NumberFormat("en-US").format(Number(String(value).replace(/[^\d]/g, "")) || 0);
const toNumber = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;
const toInputDate = (value?: string | null) => value ? value.slice(0, 10) : "";
const typeValues: Record<string, string> = { "1": "FixedAmount", "2": "Percentage" };
const isPercentageType = (type: string, options: MetadataOption[]) => {
  const option = options.find((item) => item.value === type || String(item.code) === type || item.label === type);
  const rawType = `${option?.value ?? type} ${option?.label ?? ""} ${option?.code ?? ""}`.toLowerCase();
  return rawType.includes("percent") || rawType.includes("percentage") || rawType.split(" ").includes("2");
};

export function DiscountFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const isEditMode = mode === "edit";
  const [form, setForm] = useState<FormState>({ code: "", type: "", value: "", validFrom: "", validTo: "", isActive: true, maxUsageCount: "", maxUsagePerStudent: "", description: "" });
  const [typeOptions, setTypeOptions] = useState<MetadataOption[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    adminMetadataApi.getDiscountTypeOptions()
      .then((options) => {
        setTypeOptions(options);
        setForm((current) => current.type || options.length === 0 ? current : { ...current, type: options[0].value });
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!isEditMode || !recordId) return;
    let isMounted = true;
    adminDiscountsApi.getById(recordId)
      .then((record) => {
        if (!isMounted) return;
        setForm({
          code: record.code,
          type: typeValues[String(record.type)] ?? String(record.type),
          value: formatMoneyInput(record.value),
          validFrom: toInputDate(record.validFrom),
          validTo: toInputDate(record.validTo),
          isActive: record.isActive,
          maxUsageCount: record.maxUsageCount ? formatMoneyInput(record.maxUsageCount) : "",
          maxUsagePerStudent: record.maxUsagePerStudent ? formatMoneyInput(record.maxUsagePerStudent) : "",
          description: record.description ?? "",
        });
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)))
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [isEditMode, recordId]);

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const updateType = (value: string) => {
    setForm((current) => {
      const nextValue = isPercentageType(value, typeOptions) && toNumber(current.value) > 100 ? "100" : current.value;
      return { ...current, type: value, value: nextValue };
    });
    setErrors((current) => ({ ...current, type: undefined, value: undefined }));
  };
  const updateDiscountValue = (value: string) => {
    const numericValue = toNumber(value);
    updateField("value", formatMoneyInput(isPercentageType(form.type, typeOptions) && numericValue > 100 ? 100 : numericValue));
  };
  const validate = () => {
    const next: FormErrors = {};
    if (!form.code.trim()) next.code = "Vui lòng nhập mã giảm giá.";
    else if (form.code.trim().length > 100) next.code = "Mã giảm giá không được vượt quá 100 ký tự.";
    if (!form.type) next.type = "Vui lòng chọn loại giảm giá.";
    if (toNumber(form.value) <= 0) next.value = "Giá trị giảm giá phải lớn hơn 0.";
    else if (isPercentageType(form.type, typeOptions) && toNumber(form.value) > 100) next.value = "Giá trị phần trăm không được vượt quá 100.";
    if (form.validFrom && form.validTo && new Date(form.validFrom) > new Date(form.validTo)) next.validTo = "Ngày kết thúc phải sau ngày bắt đầu.";
    if (form.maxUsageCount && toNumber(form.maxUsageCount) <= 0) next.maxUsageCount = "Tổng lượt sử dụng tối đa phải lớn hơn 0.";
    if (form.maxUsagePerStudent && toNumber(form.maxUsagePerStudent) <= 0) next.maxUsagePerStudent = "Số lần mỗi học viên được dùng phải lớn hơn 0.";
    if (form.description.trim().length > 2000) next.description = "Ghi chú không được vượt quá 2000 ký tự.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    const payload: DiscountFormPayload = {
      code: form.code.trim(),
      type: form.type,
      value: toNumber(form.value),
      validFrom: form.validFrom || null,
      validTo: form.validTo || null,
      isActive: form.isActive,
      maxUsageCount: form.maxUsageCount ? toNumber(form.maxUsageCount) : null,
      maxUsagePerStudent: form.maxUsagePerStudent ? toNumber(form.maxUsagePerStudent) : null,
      description: form.description.trim() || null,
    };
    setIsSubmitting(true);
    try {
      if (isEditMode && recordId) {
        await adminDiscountsApi.update(recordId, { ...payload, id: Number(recordId) });
        toastSuccess("Cập nhật giảm giá thành công.");
      } else {
        await adminDiscountsApi.create(payload);
        toastSuccess("Tạo giảm giá thành công.");
      }
      navigate("/admin/finance/discounts");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className={styles.page}><section className={styles.header}><div><Link className={styles.backLink} to="/admin/finance/discounts"><ArrowLeft size={16} /> Quay lại danh sách</Link><h1>{isEditMode ? "Chỉnh sửa giảm giá" : "Tạo giảm giá"}</h1></div></section>
    <form className={styles.panel} onSubmit={handleSubmit}><div className={styles.panelHeader}><div><h2>Thông tin giảm giá</h2><p>Thiết lập voucher, loại ưu đãi, giá trị và thời gian hiệu lực.</p></div></div>
      {isLoading ? <p className={styles.accountState}>Đang tải thông tin giảm giá...</p> : <div className={styles.formGrid}>
        <label className={styles.field}><span>Mã giảm giá <em className={styles.requiredMark}>*</em></span><input value={form.code} onChange={(event) => updateField("code", event.target.value)} /><ErrorMessage message={errors.code} /></label>
        <label className={styles.field}><span>Loại giảm giá <em className={styles.requiredMark}>*</em></span><select value={form.type} onChange={(event) => updateType(event.target.value)}>{typeOptions.map((option) => <option key={option.value} value={option.value}>{option.value}</option>)}</select><ErrorMessage message={errors.type} /></label>
        <label className={styles.field}><span>Giá trị <em className={styles.requiredMark}>*</em></span><input inputMode="numeric" value={form.value} onChange={(event) => updateDiscountValue(event.target.value)} /><ErrorMessage message={errors.value} /></label>
        <label className={styles.field}><span>Ngày bắt đầu</span><input type="date" value={form.validFrom} onChange={(event) => updateField("validFrom", event.target.value)} /><ErrorMessage message={errors.validFrom} /></label>
        <label className={styles.field}><span>Ngày kết thúc</span><input type="date" value={form.validTo} onChange={(event) => updateField("validTo", event.target.value)} /><ErrorMessage message={errors.validTo} /></label>
        <label className={styles.field}><span>Trạng thái <em className={styles.requiredMark}>*</em></span><select value={String(form.isActive)} onChange={(event) => updateField("isActive", event.target.value === "true")}><option value="true">Hoạt động</option><option value="false">Ngừng hoạt động</option></select></label>
        <label className={styles.field}><span>Tổng lượt sử dụng tối đa</span><input inputMode="numeric" placeholder="Để trống nếu không giới hạn" value={form.maxUsageCount} onChange={(event) => updateField("maxUsageCount", formatMoneyInput(event.target.value))} /><ErrorMessage message={errors.maxUsageCount} /></label>
        <label className={styles.field}><span>Mỗi học viên được dùng tối đa</span><input inputMode="numeric" placeholder="Để trống nếu không giới hạn" value={form.maxUsagePerStudent} onChange={(event) => updateField("maxUsagePerStudent", formatMoneyInput(event.target.value))} /><ErrorMessage message={errors.maxUsagePerStudent} /></label>
        <label className={`${styles.field} ${styles.notesField}`}><span>Ghi chú</span><textarea rows={5} value={form.description} onChange={(event) => updateField("description", event.target.value)} /><ErrorMessage message={errors.description} /></label>
      </div>}
      <div className={styles.formActions}><button className={styles.secondaryButton} type="button" onClick={() => navigate("/admin/finance/discounts")}>Hủy</button><button disabled={isLoading || isSubmitting} type="submit"><Save size={16} />{isSubmitting ? "Đang lưu..." : "Lưu giảm giá"}</button></div>
    </form>
  </div>;
}
