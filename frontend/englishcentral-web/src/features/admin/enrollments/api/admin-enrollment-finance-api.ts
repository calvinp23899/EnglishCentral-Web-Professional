import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type AdminEnrollment = {
  publicId: string;
  id: number;
  studentId: number;
  classId: number;
  enrollmentCode: string;
  enrolledAt: string;
  startDate?: string | null;
  endDate?: string | null;
  status: string | number;
  tuitionFee: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  notes?: string | null;
};

export type AdminInvoice = {
  publicId: string;
  id: number;
  enrollmentId: number;
  paymentPlanItemId?: number | null;
  invoiceNo: string;
  issuedAt: string;
  dueDate: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string | number;
  notes?: string | null;
};

export type BillingSummary = {
  enrollmentId?: number | null;
  studentId?: number | null;
  finalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  invoiceCount: number;
  overdueInvoiceCount: number;
};

export type PaymentResult = {
  publicId: string;
  id: number;
  studentId: number;
  paymentNo: string;
  paidAt: string;
  amount: number;
  method: string | number;
  status: string | number;
  referenceCode?: string | null;
  payerName?: string | null;
  payerPhone?: string | null;
  notes?: string | null;
  receiptNo?: string | null;
  allocations: Array<{ invoiceId: number; amount: number }>;
};

export type ReceiptResult = {
  publicId: string;
  id: number;
  paymentId: number;
  receiptNo: string;
  issuedAt: string;
  amount: number;
  notes?: string | null;
};

type PagedResult<T> = { items: T[]; page: number; pageSize: number; totalItems: number; totalPages: number };
type ApiResult<T> = { isSuccess: boolean; data?: T; error?: string };
const unwrap = <T>(response: ApiResult<T>, message: string) => {
  if (!response.isSuccess || response.data === undefined) throw new Error(response.error ?? message);
  return response.data;
};

export const adminEnrollmentFinanceApi = {
  async getEnrollment(id: string | number) {
    const response = await api.get<ApiResult<AdminEnrollment>>(ENDPOINTS.ADMIN_ENROLLMENTS.GET_BY_ID(id));
    return unwrap(response.data, "Không thể tải thông tin đăng ký học.");
  },

  async getInvoices(enrollmentId: string | number) {
    const response = await api.get<ApiResult<PagedResult<AdminInvoice>>>(ENDPOINTS.ADMIN_INVOICES.GET_LIST, {
      params: { EnrollmentId: enrollmentId, Page: 1, PageSize: 200 },
    });
    return unwrap(response.data, "Không thể tải danh sách hóa đơn.");
  },

  async getInvoiceById(id: string | number) {
    const response = await api.get<ApiResult<AdminInvoice>>(ENDPOINTS.ADMIN_INVOICES.GET_BY_ID(id));
    return unwrap(response.data, "Không thể tải chi tiết hóa đơn.");
  },

  async updateInvoice(id: string | number, payload: { dueDate: string; notes: string }) {
    const response = await api.put<ApiResult<AdminInvoice>>(ENDPOINTS.ADMIN_INVOICES.UPDATE(id), payload);
    return unwrap(response.data, "Không thể cập nhật hóa đơn.");
  },

  async downloadInvoicePdf(id: string | number) {
    const response = await api.get<Blob>(
      ENDPOINTS.ADMIN_INVOICES.DOWNLOAD_PDF(id),
      { responseType: "blob" },
    );
    return response.data;
  },

  async createInvoiceFromPaymentPlanItem(paymentPlanItemId: string | number) {
    const response = await api.post<ApiResult<AdminInvoice>>(ENDPOINTS.ADMIN_INVOICES.CREATE_FROM_PAYMENT_PLAN_ITEM, {
      paymentPlanItemId,
    });
    return unwrap(response.data, "Không thể tạo hóa đơn từ kỳ thu.");
  },

  async bulkCreateInvoicesFromPaymentPlanItems(payload: {
    paymentPlanId: number;
    paymentPlanItemIds: number[];
    notes?: string | null;
  }) {
    const response = await api.post<ApiResult<AdminInvoice[]>>(
      ENDPOINTS.ADMIN_INVOICES.BULK_CREATE_FROM_PAYMENT_PLAN_ITEMS,
      payload,
    );
    return unwrap(response.data, "Không thể tạo nhiều hóa đơn từ các kỳ thu.");
  },

  async getSummary(enrollmentId: string | number) {
    const response = await api.get<ApiResult<BillingSummary>>(ENDPOINTS.ADMIN_BILLING_SUMMARIES.GET, {
      params: { EnrollmentId: enrollmentId },
    });
    return unwrap(response.data, "Không thể tải tổng hợp công nợ.");
  },

  async generateInvoices() {
    await api.post(ENDPOINTS.ADMIN_BILLING_JOBS.GENERATE_INVOICES);
  },

  async createPayment(payload: {
    studentId: number;
    amount: number;
    method: string | number;
    referenceCode?: string | null;
    payerName?: string | null;
    payerPhone?: string | null;
    notes?: string | null;
    allocations: Array<{ invoiceId: number; amount: number }>;
  }) {
    const response = await api.post<Blob>(
      ENDPOINTS.ADMIN_PAYMENTS.CREATE,
      {
        ...payload,
        paymentNo: null,
        paidAt: null,
      },
      { responseType: "blob" },
    );
    return response.data;
  },

  async getReceipts(paymentId: string | number) {
    const response = await api.get<ApiResult<PagedResult<ReceiptResult>>>(ENDPOINTS.ADMIN_RECEIPTS.GET_LIST, {
      params: { PaymentId: paymentId, Page: 1, PageSize: 20 },
    });
    return unwrap(response.data, "Không thể tải phiếu thu.");
  },
};
