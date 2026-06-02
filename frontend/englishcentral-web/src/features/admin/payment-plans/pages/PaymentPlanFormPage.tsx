import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorMessage, toastDanger, toastSuccess } from "@/components/ui";
import {
  adminPaymentPlansApi,
  type PaymentPlanFormPayload,
  type PaymentPlanItemStatus,
  type PaymentPlanStatus,
  type PaymentPlanType,
} from "@/features/admin/payment-plans/api/admin-payment-plans-api";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import paymentStyles from "./PaymentPlanPage.module.scss";

type Props = { mode: "create" | "edit" };
type ItemForm = { sequenceNumber: number; name: string; dueDate: string; amount: string; status: PaymentPlanItemStatus };
type FormState = { enrollmentId: string; billingPolicyId: string; type: PaymentPlanType; numberOfInstallments: string; status: PaymentPlanStatus; notes: string; items: ItemForm[] };
type FormErrors = Partial<Record<"enrollmentId" | "billingPolicyId" | "numberOfInstallments" | "items", string>>;

const typeLabels: Record<PaymentPlanType, string> = { FullPayment: "Thanh toán đủ", Monthly: "Theo tháng", Installment: "Trả góp", Custom: "Tùy chỉnh" };
const statusLabels: Record<PaymentPlanStatus, string> = { Draft: "Nháp", Active: "Đang áp dụng", Completed: "Hoàn thành", Cancelled: "Đã hủy" };
const itemStatusLabels: Record<PaymentPlanItemStatus, string> = { Pending: "Chờ thu", Invoiced: "Đã xuất hóa đơn", Paid: "Đã thanh toán", Overdue: "Quá hạn", Cancelled: "Đã hủy" };
const typeValues: Record<string, PaymentPlanType> = { "1": "FullPayment", "2": "Monthly", "3": "Installment", "4": "Custom" };
const statusValues: Record<string, PaymentPlanStatus> = { "1": "Draft", "2": "Active", "3": "Completed", "4": "Cancelled" };
const itemStatusValues: Record<string, PaymentPlanItemStatus> = { "1": "Pending", "2": "Invoiced", "3": "Paid", "4": "Overdue", "5": "Cancelled" };
const today = () => new Date().toISOString().slice(0, 10);
const money = (value: string | number) => new Intl.NumberFormat("en-US").format(Number(String(value).replace(/,/g, "")) || 0);
const amount = (value: string) => Number(value.replace(/,/g, ""));
const newItem = (sequenceNumber: number): ItemForm => ({ sequenceNumber, name: `Kỳ ${sequenceNumber}`, dueDate: today(), amount: "0", status: "Pending" });

export function PaymentPlanFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const isEditMode = mode === "edit";
  const [form, setForm] = useState<FormState>({ enrollmentId: "", billingPolicyId: "", type: "FullPayment", numberOfInstallments: "", status: "Active", notes: "", items: [newItem(1)] });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode || !recordId) return;
    let isMounted = true;
    adminPaymentPlansApi.getById(recordId)
      .then((record) => {
        if (!isMounted) return;
        setForm({
          enrollmentId: String(record.enrollmentId),
          billingPolicyId: record.billingPolicyId ? String(record.billingPolicyId) : "",
          type: typeValues[String(record.type)] ?? record.type as PaymentPlanType,
          numberOfInstallments: record.numberOfInstallments ? String(record.numberOfInstallments) : "",
          status: statusValues[String(record.status)] ?? record.status as PaymentPlanStatus,
          notes: record.notes ?? "",
          items: record.items.map((item) => ({ sequenceNumber: item.sequenceNumber, name: item.name, dueDate: item.dueDate, amount: money(item.amount), status: itemStatusValues[String(item.status)] ?? item.status as PaymentPlanItemStatus })),
        });
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)))
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [isEditMode, recordId]);

  const totalAmount = form.items.reduce((total, item) => total + amount(item.amount), 0);
  const updateField = <Key extends keyof Omit<FormState, "items">>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const updateItem = <Key extends keyof ItemForm>(index: number, key: Key, value: ItemForm[Key]) => {
    setForm((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
    setErrors((current) => ({ ...current, items: undefined }));
  };

  const validate = () => {
    const next: FormErrors = {};
    if (!Number.isInteger(Number(form.enrollmentId)) || Number(form.enrollmentId) <= 0) next.enrollmentId = "Vui lòng nhập mã đăng ký hợp lệ.";
    if (form.billingPolicyId && (!Number.isInteger(Number(form.billingPolicyId)) || Number(form.billingPolicyId) <= 0)) next.billingPolicyId = "Mã chính sách học phí không hợp lệ.";
    if (form.items.some((item) => !item.name.trim() || !item.dueDate || amount(item.amount) <= 0)) next.items = "Mỗi kỳ cần có tên, ngày đến hạn và số tiền lớn hơn 0.";
    if (form.type === "FullPayment" && form.items.length !== 1) next.items = "Thanh toán đủ chỉ được có một kỳ.";
    if (form.type === "Installment" && Number(form.numberOfInstallments) !== form.items.length) next.numberOfInstallments = "Số kỳ trả góp phải bằng số dòng lịch thanh toán.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    const payload: PaymentPlanFormPayload = {
      enrollmentId: Number(form.enrollmentId),
      billingPolicyId: form.billingPolicyId ? Number(form.billingPolicyId) : null,
      type: form.type,
      totalAmount,
      numberOfInstallments: form.type === "Installment" ? Number(form.numberOfInstallments) : null,
      status: form.status,
      notes: form.notes.trim() || null,
      items: form.items.map((item) => ({ ...item, name: item.name.trim(), amount: amount(item.amount) })),
    };
    setIsSubmitting(true);
    try {
      if (isEditMode && recordId) {
        await adminPaymentPlansApi.update(recordId, { ...payload, id: Number(recordId) });
        toastSuccess("Cập nhật kế hoạch thanh toán thành công.");
      } else {
        await adminPaymentPlansApi.create(payload);
        toastSuccess("Tạo kế hoạch thanh toán thành công.");
      }
      navigate("/admin/finance/payment-plans");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className={styles.page}>
    <section className={styles.header}><div><Link className={styles.backLink} to="/admin/finance/payment-plans"><ArrowLeft size={16} /> Quay lại danh sách</Link><h1>{isEditMode ? "Chỉnh sửa kế hoạch thanh toán" : "Tạo kế hoạch thanh toán"}</h1></div></section>
    <form className={styles.panel} onSubmit={handleSubmit}>
      <div className={styles.panelHeader}><div><h2>Thông tin kế hoạch</h2><p>Thiết lập lịch thu học phí theo đăng ký học viên.</p></div></div>
      {isLoading ? <p className={styles.accountState}>Đang tải thông tin kế hoạch...</p> : <>
        <div className={styles.formGrid}>
          <label className={styles.field}><span>Mã đăng ký <em className={styles.requiredMark}>*</em></span><input disabled={isEditMode} min={1} type="number" value={form.enrollmentId} onChange={(event) => updateField("enrollmentId", event.target.value)} /><ErrorMessage message={errors.enrollmentId} /></label>
          <label className={styles.field}><span>Mã chính sách học phí</span><input min={1} type="number" value={form.billingPolicyId} onChange={(event) => updateField("billingPolicyId", event.target.value)} /><ErrorMessage message={errors.billingPolicyId} /></label>
          <label className={styles.field}><span>Loại kế hoạch <em className={styles.requiredMark}>*</em></span><select value={form.type} onChange={(event) => updateField("type", event.target.value as PaymentPlanType)}>{(Object.keys(typeLabels) as PaymentPlanType[]).map((type) => <option key={type} value={type}>{typeLabels[type]}</option>)}</select></label>
          <label className={styles.field}><span>Trạng thái <em className={styles.requiredMark}>*</em></span><select value={form.status} onChange={(event) => updateField("status", event.target.value as PaymentPlanStatus)}>{(Object.keys(statusLabels) as PaymentPlanStatus[]).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
          {form.type === "Installment" && <label className={styles.field}><span>Số kỳ trả góp <em className={styles.requiredMark}>*</em></span><input min={2} type="number" value={form.numberOfInstallments} onChange={(event) => updateField("numberOfInstallments", event.target.value)} /><ErrorMessage message={errors.numberOfInstallments} /></label>}
          <label className={`${styles.field} ${styles.notesField}`}><span>Ghi chú</span><textarea rows={4} value={form.notes} onChange={(event) => updateField("notes", event.target.value)} /></label>
        </div>
        <div className={paymentStyles.schedule}>
          <div className={paymentStyles.scheduleHeader}><div><h3>Lịch thanh toán</h3><p>{isEditMode ? "Có thể chỉnh nội dung các kỳ hiện hữu." : "Thêm các kỳ cần thu tiền cho kế hoạch."}</p></div>{!isEditMode && <button className={paymentStyles.addButton} type="button" onClick={() => setForm((current) => ({ ...current, items: [...current.items, newItem(current.items.length + 1)] }))}><Plus size={16} /> Thêm kỳ</button>}</div>
          {form.items.map((item, index) => <div className={paymentStyles.itemCard} key={item.sequenceNumber}><div className={paymentStyles.itemFields}>
            <label className={styles.field}><span>Thứ tự</span><input readOnly value={item.sequenceNumber} /></label>
            <label className={styles.field}><span>Tên kỳ <em className={styles.requiredMark}>*</em></span><input value={item.name} onChange={(event) => updateItem(index, "name", event.target.value)} /></label>
            <label className={styles.field}><span>Ngày đến hạn <em className={styles.requiredMark}>*</em></span><input type="date" value={item.dueDate} onChange={(event) => updateItem(index, "dueDate", event.target.value)} /></label>
            <label className={styles.field}><span>Số tiền <em className={styles.requiredMark}>*</em></span><input inputMode="numeric" value={item.amount} onChange={(event) => updateItem(index, "amount", money(event.target.value.replace(/[^\d]/g, "")))} /></label>
            <label className={styles.field}><span>Trạng thái <em className={styles.requiredMark}>*</em></span><select value={item.status} onChange={(event) => updateItem(index, "status", event.target.value as PaymentPlanItemStatus)}>{(Object.keys(itemStatusLabels) as PaymentPlanItemStatus[]).map((status) => <option key={status} value={status}>{itemStatusLabels[status]}</option>)}</select></label>
          </div>{!isEditMode && form.items.length > 1 && <button className={paymentStyles.removeButton} title="Xóa kỳ" type="button" onClick={() => setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index).map((currentItem, itemIndex) => ({ ...currentItem, sequenceNumber: itemIndex + 1 })) }))}><Trash2 size={16} /></button>}</div>)}
          <ErrorMessage message={errors.items} /><div className={paymentStyles.total}>Tổng tiền: {money(totalAmount)} đ</div>
        </div>
      </>}
      <div className={styles.formActions}><button className={styles.secondaryButton} type="button" onClick={() => navigate("/admin/finance/payment-plans")}>Hủy</button><button disabled={isLoading || isSubmitting} type="submit"><Save size={16} />{isSubmitting ? "Đang lưu..." : "Lưu kế hoạch"}</button></div>
    </form>
  </div>;
}
