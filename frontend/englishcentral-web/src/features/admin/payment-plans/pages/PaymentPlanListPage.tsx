import { useEffect, useState } from "react";
import { Columns3, Download, Edit3, Eye, Funnel, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, SidePanel, toastDanger, toastSuccess, toastWarning } from "@/components/ui";
import {
  adminPaymentPlansApi,
  type AdminPaymentPlan,
  type PaymentPlanStatus,
  type PaymentPlanType,
} from "@/features/admin/payment-plans/api/admin-payment-plans-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import toolbarStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type ColumnKey = "id" | "enrollmentId" | "type" | "installments" | "totalAmount" | "status" | "actions";
type Filters = { type: "all" | PaymentPlanType; status: "all" | PaymentPlanStatus };

const emptyFilters: Filters = { type: "all", status: "all" };
const columns: ColumnKey[] = ["id", "enrollmentId", "type", "installments", "totalAmount", "status"];
const labels: Record<ColumnKey, string> = {
  id: "Mã kế hoạch",
  enrollmentId: "Mã đăng ký",
  type: "Loại kế hoạch",
  installments: "Số kỳ",
  totalAmount: "Tổng tiền",
  status: "Trạng thái",
  actions: "Action",
};
const initialVisibleColumns = Object.fromEntries([...columns, "actions"].map((column) => [column, true])) as Record<ColumnKey, boolean>;
const typeLabels: Record<string, string> = {
  "1": "Thanh toán đủ",
  "2": "Theo tháng",
  "3": "Trả góp",
  "4": "Tùy chỉnh",
  FullPayment: "Thanh toán đủ",
  Monthly: "Theo tháng",
  Installment: "Trả góp",
};
const statusLabels: Record<string, string> = {
  "1": "Nháp",
  "2": "Đang áp dụng",
  "3": "Hoàn thành",
  "4": "Đã hủy",
  Draft: "Nháp",
  Active: "Đang áp dụng",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};
const typeOptions: PaymentPlanType[] = ["FullPayment", "Monthly", "Installment"];
const statusOptions: PaymentPlanStatus[] = ["Draft", "Active", "Completed", "Cancelled"];
const formatMoney = (value: number) => `${new Intl.NumberFormat("en-US").format(value)} đ`;
const statusTone = (status: AdminPaymentPlan["status"]) =>
  status === "Cancelled" || status === 4
    ? "inactive"
    : status === "Draft" || status === 1
      ? "pending"
      : "active";

export function PaymentPlanListPage() {
  const [records, setRecords] = useState<AdminPaymentPlan[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingRecord, setDeletingRecord] = useState<AdminPaymentPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const enrollmentId = searchTerm.trim() ? Number(searchTerm.trim()) : undefined;
        const result = await adminPaymentPlansApi.getList({
          page: pageNumber,
          pageSize,
          enrollmentId: enrollmentId && Number.isInteger(enrollmentId) ? enrollmentId : undefined,
          type: filters.type === "all" ? undefined : filters.type,
          status: filters.status === "all" ? undefined : filters.status,
          isDescending: true,
        });
        setRecords(result.items);
        setTotalItems(result.totalItems);
      } catch (error) {
        toastDanger(getAuthErrorMessage(error));
        setRecords([]);
        setTotalItems(0);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [filters, pageNumber, pageSize, refreshVersion, searchTerm]);

  const activeFilterCount = Object.values(filters).filter((value) => value !== "all").length;
  const handleDelete = async () => {
    if (!deletingRecord || isDeleting) return;
    setIsDeleting(true);
    try {
      await adminPaymentPlansApi.delete(deletingRecord.id);
      toastSuccess("Xóa kế hoạch thanh toán thành công.");
      setDeletingRecord(null);
      setRefreshVersion((current) => current + 1);
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={listStyles.page}>
        <section className={listStyles.header}>
          <div>
            <h1>Kế hoạch thanh toán</h1>
            <p>Quản lý lịch thu học phí theo từng đăng ký học và theo dõi trạng thái từng kế hoạch.</p>
          </div>
          <Link className={listStyles.createButton} to="/admin/finance/payment-plans/create">
            <Plus size={18} /> Tạo mới
          </Link>
        </section>

        <section className={`${listStyles.toolbar} ${toolbarStyles.toolbar}`}>
          <label className={listStyles.searchBox}>
            <Search size={18} />
            <input
              placeholder="Tìm theo mã đăng ký"
              value={searchTerm}
              onChange={(event) => { setSearchTerm(event.target.value); setPageNumber(1); }}
            />
          </label>
          <div className={toolbarStyles.toolbarActions}>
            <div className={toolbarStyles.menuWrap}>
              <button
                aria-label="Download"
                className={toolbarStyles.iconButton}
                type="button"
                onClick={() => { setIsDownloadMenuOpen((current) => !current); setIsColumnsMenuOpen(false); }}
              >
                <Download size={18} />
              </button>
              {isDownloadMenuOpen && <div className={toolbarStyles.dropdownMenu}><button type="button" onClick={() => { setIsDownloadMenuOpen(false); toastWarning("Chức năng xuất XLSX chưa được tích hợp."); }}>XLSX</button></div>}
            </div>
            <button className={toolbarStyles.filterButton} type="button" onClick={() => { setDraftFilters(filters); setIsFilterPanelOpen(true); setIsDownloadMenuOpen(false); setIsColumnsMenuOpen(false); }}>
              <Funnel size={17} /> Filter {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
            </button>
            <div className={toolbarStyles.menuWrap}>
              <button className={toolbarStyles.columnsButton} type="button" onClick={() => { setIsColumnsMenuOpen((current) => !current); setIsDownloadMenuOpen(false); }}>
                <Columns3 size={17} /> Columns
              </button>
              {isColumnsMenuOpen && <div className={`${toolbarStyles.dropdownMenu} ${toolbarStyles.columnsMenu}`}>{([...columns, "actions"] as ColumnKey[]).map((column) => <label key={column}><input checked={visibleColumns[column]} type="checkbox" onChange={() => setVisibleColumns((current) => ({ ...current, [column]: !current[column] }))} />{labels[column]}</label>)}</div>}
            </div>
          </div>
        </section>

        <section className={listStyles.tablePanel}>
          <div className={listStyles.tableScroll}>
            <table className={listStyles.table}>
              <thead><tr>{columns.filter((column) => visibleColumns[column]).map((column) => <th key={column}>{labels[column]}</th>)}{visibleColumns.actions && <th>Action</th>}</tr></thead>
              <tbody>{records.map((record) => <tr key={record.id}>
                {visibleColumns.id && <td><strong>PP-{record.id}</strong></td>}
                {visibleColumns.enrollmentId && <td>#{record.enrollmentId}</td>}
                {visibleColumns.type && <td>{typeLabels[String(record.type)] ?? String(record.type)}</td>}
                {visibleColumns.installments && <td>{record.items.length}</td>}
                {visibleColumns.totalAmount && <td>{formatMoney(record.totalAmount)}</td>}
                {visibleColumns.status && <td><span className={`${listStyles.statusBadge} ${listStyles[statusTone(record.status)]}`}>{statusLabels[String(record.status)] ?? String(record.status)}</span></td>}
                {visibleColumns.actions && <td><div className={listStyles.actions}>
                  <Link aria-label="Xem" title="Xem chi tiết" to={`/admin/finance/payment-plans/${record.id}/view`}><Eye size={16} /></Link>
                  <Link aria-label="Sửa" title="Chỉnh sửa" to={`/admin/finance/payment-plans/${record.id}/edit`}><Edit3 size={16} /></Link>
                  <button aria-label="Xóa" title="Xóa" className={listStyles.deleteAction} type="button" onClick={() => setDeletingRecord(record)}><Trash2 size={16} /></button>
                </div></td>}
              </tr>)}</tbody>
            </table>
            {records.length === 0 && <div className={listStyles.emptyState}>Không có kế hoạch thanh toán phù hợp.</div>}
          </div>
          <Pagination pageNumber={pageNumber} pageSize={pageSize} totalItems={totalItems} onPageChange={setPageNumber} onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }} />
        </section>
      </div>

      <SidePanel
        description="Lọc danh sách kế hoạch thanh toán theo loại và trạng thái."
        footer={<div className={toolbarStyles.panelActions}><button type="button" onClick={() => { setDraftFilters(emptyFilters); setFilters(emptyFilters); }}>Xóa bộ lọc</button><button type="button" onClick={() => { setFilters(draftFilters); setPageNumber(1); setIsFilterPanelOpen(false); }}>Áp dụng</button></div>}
        isOpen={isFilterPanelOpen}
        title="Bộ lọc"
        onClose={() => setIsFilterPanelOpen(false)}
      >
        <div className={toolbarStyles.panelForm}>
          <label><span>Loại kế hoạch</span><select value={draftFilters.type} onChange={(event) => setDraftFilters((current) => ({ ...current, type: event.target.value as Filters["type"] }))}><option value="all">Tất cả</option>{typeOptions.map((type) => <option key={type} value={type}>{typeLabels[type]}</option>)}</select></label>
          <label><span>Trạng thái</span><select value={draftFilters.status} onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value as Filters["status"] }))}><option value="all">Tất cả</option>{statusOptions.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
        </div>
      </SidePanel>
      <ConfirmModal confirmText={isDeleting ? "Đang xóa..." : "Xóa"} description={deletingRecord ? `Bạn có chắc muốn xóa kế hoạch PP-${deletingRecord.id}?` : ""} isConfirmDisabled={isDeleting} isOpen={Boolean(deletingRecord)} title="Xác nhận xóa kế hoạch" tone="danger" onCancel={() => setDeletingRecord(null)} onConfirm={handleDelete} />
    </>
  );
}
