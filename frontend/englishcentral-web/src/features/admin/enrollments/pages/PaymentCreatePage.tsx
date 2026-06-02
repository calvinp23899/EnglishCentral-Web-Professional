import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { ErrorMessage, toastDanger, toastSuccess } from "@/components/ui";
import { adminEnrollmentFinanceApi, type AdminEnrollment, type AdminInvoice, type ReceiptResult } from "@/features/admin/enrollments/api/admin-enrollment-finance-api";
import { adminMetadataApi, type MetadataOption } from "@/features/admin/shared/api/admin-metadata-api";
import formStyles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import styles from "./EnrollmentFinancePage.module.scss";

const money = (value: string | number) => new Intl.NumberFormat("en-US").format(Number(String(value).replace(/,/g, "")) || 0);
const amount = (value: string) => Number(value.replace(/,/g, ""));

export function PaymentCreatePage() {
  const { recordId } = useParams();
  const [enrollment, setEnrollment] = useState<AdminEnrollment | null>(null);
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [methods, setMethods] = useState<MetadataOption[]>([]);
  const [allocations, setAllocations] = useState<Record<number, string>>({});
  const [method, setMethod] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptResult | null>(null);

  useEffect(() => {
    if (!recordId) return;
    Promise.all([adminEnrollmentFinanceApi.getEnrollment(recordId), adminEnrollmentFinanceApi.getInvoices(recordId), adminMetadataApi.getPaymentMethodOptions()])
      .then(([nextEnrollment, invoiceResult, methodOptions]) => { setEnrollment(nextEnrollment); setInvoices(invoiceResult.items.filter((invoice) => invoice.outstandingAmount > 0)); setMethods(methodOptions); setMethod(String(methodOptions[0]?.code ?? "")); })
      .catch((nextError) => toastDanger(getAuthErrorMessage(nextError)));
  }, [recordId]);

  const total = useMemo(() => Object.values(allocations).reduce((sum, value) => sum + amount(value), 0), [allocations]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!enrollment || isSubmitting) return;
    const selected = Object.entries(allocations).map(([invoiceId, value]) => ({ invoiceId: Number(invoiceId), amount: amount(value) })).filter((allocation) => allocation.amount > 0);
    if (!method) { setError("Vui lòng chọn phương thức thanh toán."); return; }
    if (selected.length === 0) { setError("Vui lòng nhập số tiền phân bổ cho ít nhất một hóa đơn."); return; }
    if (selected.some((allocation) => allocation.amount > (invoices.find((invoice) => invoice.id === allocation.invoiceId)?.outstandingAmount ?? 0))) { setError("Số tiền phân bổ không được vượt quá công nợ của hóa đơn."); return; }
    setError(undefined);
    setIsSubmitting(true);
    try {
      const payment = await adminEnrollmentFinanceApi.createPayment({ studentId: enrollment.studentId, amount: total, method: Number(method), referenceCode: referenceCode.trim() || null, payerName: payerName.trim() || null, payerPhone: payerPhone.trim() || null, notes: notes.trim() || null, allocations: selected });
      const receiptResult = await adminEnrollmentFinanceApi.getReceipts(payment.id);
      setReceipt(receiptResult.items[0] ?? null);
      toastSuccess("Ghi nhận thanh toán thành công.");
    } catch (nextError) {
      toastDanger(getAuthErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className={`${formStyles.page} ${styles.page}`}><section className={formStyles.header}><div><Link className={formStyles.backLink} to={`/admin/enrollments/${recordId}/view`}><ArrowLeft size={16} /> Quay lại công nợ</Link><h1>Ghi nhận thanh toán</h1></div></section>
    {receipt ? <section className={styles.receipt}><h2>Thu tiền thành công</h2><p>Phiếu thu: <strong>{receipt.receiptNo}</strong></p><p>Số tiền: <strong>{money(receipt.amount)} đ</strong></p><p>Ngày phát hành: {new Intl.DateTimeFormat("vi-VN").format(new Date(receipt.issuedAt))}</p><Link to={`/admin/enrollments/${recordId}/view`}>Xem lại công nợ</Link></section> :
    <form className={formStyles.panel} onSubmit={submit}><div className={formStyles.panelHeader}><div><h2>Phân bổ tiền vào hóa đơn</h2><p>Chỉ nhập số tiền cần thu. Backend sẽ cập nhật invoice, kỳ thanh toán, công nợ và phiếu thu.</p></div></div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Số hóa đơn</th><th>Còn nợ</th><th>Số tiền phân bổ</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id}><td>{invoice.invoiceNo}</td><td>{money(invoice.outstandingAmount)} đ</td><td><input inputMode="numeric" placeholder="0" value={allocations[invoice.id] ?? ""} onChange={(event) => setAllocations((current) => ({ ...current, [invoice.id]: money(event.target.value.replace(/[^\d]/g, "")) }))} /></td></tr>)}</tbody></table>{invoices.length === 0 && <div className={styles.empty}>Không có hóa đơn còn nợ.</div>}</div>
      <div className={styles.paymentGrid}><label className={formStyles.field}><span>Phương thức thanh toán <em className={formStyles.requiredMark}>*</em></span><select value={method} onChange={(event) => setMethod(event.target.value)}>{methods.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select></label><label className={formStyles.field}><span>Mã tham chiếu</span><input value={referenceCode} onChange={(event) => setReferenceCode(event.target.value)} /></label><label className={formStyles.field}><span>Người nộp</span><input value={payerName} onChange={(event) => setPayerName(event.target.value)} /></label><label className={formStyles.field}><span>SĐT người nộp</span><input value={payerPhone} onChange={(event) => setPayerPhone(event.target.value)} /></label><label className={`${formStyles.field} ${formStyles.notesField}`}><span>Ghi chú</span><textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} /></label><div><strong>Tổng thu: {money(total)} đ</strong><ErrorMessage message={error} /></div></div>
      <div className={formStyles.formActions}><button className={formStyles.secondaryButton} type="button"><Link to={`/admin/enrollments/${recordId}/view`}>Hủy</Link></button><button disabled={invoices.length === 0 || isSubmitting} type="submit"><Save size={16} />{isSubmitting ? "Đang lưu..." : "Ghi nhận thanh toán"}</button></div>
    </form>}
  </div>;
}
