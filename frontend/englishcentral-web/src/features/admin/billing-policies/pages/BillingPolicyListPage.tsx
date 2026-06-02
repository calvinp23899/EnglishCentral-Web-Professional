import { useEffect, useState } from "react";
import { Columns3, Download, Edit3, Eye, Funnel, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, SidePanel, toastDanger, toastSuccess, toastWarning } from "@/components/ui";
import {
  adminBillingPoliciesApi,
  type AdminBillingPolicy,
  type BillingPolicyType,
} from "@/features/admin/billing-policies/api/admin-billing-policies-api";
import { adminMetadataApi, type MetadataOption } from "@/features/admin/shared/api/admin-metadata-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import toolbarStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type ColumnKey = "id" | "name" | "type" | "installments" | "isDefault" | "status" | "actions";
type Filters = { type: "all" | BillingPolicyType; status: "all" | "active" | "inactive" };

const emptyFilters: Filters = { type: "all", status: "all" };
const columns: ColumnKey[] = ["id", "name", "type", "installments", "isDefault", "status"];
const labels: Record<ColumnKey, string> = {
  id: "Mã chính sách",
  name: "Tên chính sách",
  type: "Loại chính sách",
  installments: "Số kỳ",
  isDefault: "Mặc định",
  status: "Trạng thái",
  actions: "Action",
};
const initialVisibleColumns = Object.fromEntries([...columns, "actions"].map((column) => [column, true])) as Record<ColumnKey, boolean>;
const typeLabels: Record<string, string> = {
  "1": "Thanh toán đủ",
  "2": "Theo tháng",
  "3": "Trả góp",
  FullPayment: "Thanh toán đủ",
  Monthly: "Theo tháng",
  Installment: "Trả góp",
};

export function BillingPolicyListPage() {
  const [records, setRecords] = useState<AdminBillingPolicy[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [typeOptions, setTypeOptions] = useState<MetadataOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingRecord, setDeletingRecord] = useState<AdminBillingPolicy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    adminMetadataApi.getBillingPolicyTypeOptions()
      .then(setTypeOptions)
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await adminBillingPoliciesApi.getList({
          page: pageNumber,
          pageSize,
          keyword: searchTerm.trim(),
          type: filters.type === "all" ? undefined : filters.type,
          isActive: filters.status === "all" ? undefined : filters.status === "active",
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
      await adminBillingPoliciesApi.delete(deletingRecord.id);
      toastSuccess("Xóa chính sách học phí thành công.");
      setDeletingRecord(null);
      setRefreshVersion((current) => current + 1);
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return <>
    <div className={listStyles.page}>
      <section className={listStyles.header}><div><h1>Chính sách học phí</h1><p>Quản lý quy tắc thanh toán học phí dùng cho khóa học, lớp học và đăng ký học viên.</p></div><Link className={listStyles.createButton} to="/admin/finance/tuition-policies/create"><Plus size={18} /> Tạo mới</Link></section>
      <section className={`${listStyles.toolbar} ${toolbarStyles.toolbar}`}>
        <label className={listStyles.searchBox}><Search size={18} /><input placeholder="Tìm theo tên chính sách" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPageNumber(1); }} /></label>
        <div className={toolbarStyles.toolbarActions}>
          <div className={toolbarStyles.menuWrap}><button aria-label="Download" className={toolbarStyles.iconButton} type="button" onClick={() => { setIsDownloadMenuOpen((current) => !current); setIsColumnsMenuOpen(false); }}><Download size={18} /></button>{isDownloadMenuOpen && <div className={toolbarStyles.dropdownMenu}><button type="button" onClick={() => { setIsDownloadMenuOpen(false); toastWarning("Chức năng xuất XLSX chưa được tích hợp."); }}>XLSX</button></div>}</div>
          <button className={toolbarStyles.filterButton} type="button" onClick={() => { setDraftFilters(filters); setIsFilterPanelOpen(true); setIsDownloadMenuOpen(false); setIsColumnsMenuOpen(false); }}><Funnel size={17} /> Filter {activeFilterCount > 0 && <span>{activeFilterCount}</span>}</button>
          <div className={toolbarStyles.menuWrap}><button className={toolbarStyles.columnsButton} type="button" onClick={() => { setIsColumnsMenuOpen((current) => !current); setIsDownloadMenuOpen(false); }}><Columns3 size={17} /> Columns</button>{isColumnsMenuOpen && <div className={`${toolbarStyles.dropdownMenu} ${toolbarStyles.columnsMenu}`}>{([...columns, "actions"] as ColumnKey[]).map((column) => <label key={column}><input checked={visibleColumns[column]} type="checkbox" onChange={() => setVisibleColumns((current) => ({ ...current, [column]: !current[column] }))} />{labels[column]}</label>)}</div>}</div>
        </div>
      </section>
      <section className={listStyles.tablePanel}><div className={listStyles.tableScroll}><table className={listStyles.table}><thead><tr>{columns.filter((column) => visibleColumns[column]).map((column) => <th key={column}>{labels[column]}</th>)}{visibleColumns.actions && <th>Action</th>}</tr></thead><tbody>{records.map((record) => <tr key={record.id}>
        {visibleColumns.id && <td><strong>BP-{record.id}</strong></td>}
        {visibleColumns.name && <td>{record.name}</td>}
        {visibleColumns.type && <td>{typeLabels[String(record.type)] ?? String(record.type)}</td>}
        {visibleColumns.installments && <td>{record.numberOfInstallments ?? "-"}</td>}
        {visibleColumns.isDefault && <td>{record.isDefault ? "Có" : "Không"}</td>}
        {visibleColumns.status && <td><span className={`${listStyles.statusBadge} ${record.isActive ? listStyles.active : listStyles.inactive}`}>{record.isActive ? "Hoạt động" : "Ngừng hoạt động"}</span></td>}
        {visibleColumns.actions && <td><div className={listStyles.actions}><Link aria-label="Xem" title="Xem chi tiết" to={`/admin/finance/tuition-policies/${record.id}/view`}><Eye size={16} /></Link><Link aria-label="Sửa" title="Chỉnh sửa" to={`/admin/finance/tuition-policies/${record.id}/edit`}><Edit3 size={16} /></Link><button aria-label="Xóa" title="Xóa" className={listStyles.deleteAction} type="button" onClick={() => setDeletingRecord(record)}><Trash2 size={16} /></button></div></td>}
      </tr>)}</tbody></table>{records.length === 0 && <div className={listStyles.emptyState}>Không có chính sách học phí phù hợp.</div>}</div><Pagination pageNumber={pageNumber} pageSize={pageSize} totalItems={totalItems} onPageChange={setPageNumber} onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }} /></section>
    </div>
    <SidePanel description="Lọc danh sách chính sách học phí theo loại và trạng thái." footer={<div className={toolbarStyles.panelActions}><button type="button" onClick={() => { setDraftFilters(emptyFilters); setFilters(emptyFilters); }}>Xóa bộ lọc</button><button type="button" onClick={() => { setFilters(draftFilters); setPageNumber(1); setIsFilterPanelOpen(false); }}>Áp dụng</button></div>} isOpen={isFilterPanelOpen} title="Bộ lọc" onClose={() => setIsFilterPanelOpen(false)}><div className={toolbarStyles.panelForm}>
      <label><span>Loại chính sách</span><select value={draftFilters.type} onChange={(event) => setDraftFilters((current) => ({ ...current, type: event.target.value as Filters["type"] }))}><option value="all">Tất cả</option>{typeOptions.map((option) => <option key={option.value} value={option.value}>{typeLabels[option.value] ?? option.label}</option>)}</select></label>
      <label><span>Trạng thái</span><select value={draftFilters.status} onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value as Filters["status"] }))}><option value="all">Tất cả</option><option value="active">Hoạt động</option><option value="inactive">Ngừng hoạt động</option></select></label>
    </div></SidePanel>
    <ConfirmModal confirmText={isDeleting ? "Đang xóa..." : "Xóa"} description={deletingRecord ? `Bạn có chắc muốn xóa chính sách ${deletingRecord.name}?` : ""} isConfirmDisabled={isDeleting} isOpen={Boolean(deletingRecord)} title="Xác nhận xóa chính sách" tone="danger" onCancel={() => setDeletingRecord(null)} onConfirm={handleDelete} />
  </>;
}
