import { useEffect, useState } from "react";
import { Columns3, Download, Edit3, Eye, Funnel, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, SidePanel, toastDanger, toastSuccess, toastWarning } from "@/components/ui";
import { adminDiscountsApi, type AdminDiscount, type DiscountType } from "@/features/admin/discounts/api/admin-discounts-api";
import { adminMetadataApi, type MetadataOption } from "@/features/admin/shared/api/admin-metadata-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import toolbarStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type ColumnKey = "code" | "type" | "value" | "validity" | "usage" | "status" | "actions";
type Filters = { type: "all" | DiscountType; status: "all" | "active" | "inactive" };

const columns: ColumnKey[] = ["code", "type", "value", "validity", "usage", "status"];
const emptyFilters: Filters = { type: "all", status: "all" };
const labels: Record<ColumnKey, string> = {
  code: "Mã giảm giá",
  type: "Loại",
  value: "Giá trị",
  validity: "Hiệu lực",
  usage: "Đã dùng",
  status: "Trạng thái",
  actions: "Action",
};
const initialVisibleColumns = Object.fromEntries([...columns, "actions"].map((column) => [column, true])) as Record<ColumnKey, boolean>;
const typeLabels: Record<string, string> = {
  "1": "Số tiền",
  "2": "Phần trăm",
  Percentage: "Phần trăm",
  Percent: "Phần trăm",
  FixedAmount: "Số tiền",
  Amount: "Số tiền",
};
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "-";
const formatMoney = (value: number) => new Intl.NumberFormat("en-US").format(value);
const formatValue = (record: AdminDiscount) => {
  const type = String(record.type).toLowerCase();
  return type.includes("percent") || type === "2" ? `${formatMoney(record.value)}%` : `${formatMoney(record.value)} đ`;
};
const formatUsage = (record: AdminDiscount) => `${formatMoney(record.usedCount ?? 0)} / ${record.maxUsageCount === null || record.maxUsageCount === undefined ? "Không giới hạn" : formatMoney(record.maxUsageCount)}`;

export function DiscountListPage() {
  const [records, setRecords] = useState<AdminDiscount[]>([]);
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
  const [deletingRecord, setDeletingRecord] = useState<AdminDiscount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    adminMetadataApi.getDiscountTypeOptions().then(setTypeOptions).catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await adminDiscountsApi.getList({
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
      await adminDiscountsApi.delete(deletingRecord.id);
      toastSuccess("Xóa giảm giá thành công.");
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
      <section className={listStyles.header}><div><h1>Giảm giá</h1><p>Quản lý voucher, ưu đãi học phí, thời gian hiệu lực và trạng thái áp dụng.</p></div><Link className={listStyles.createButton} to="/admin/finance/discounts/create"><Plus size={18} /> Tạo mới</Link></section>
      <section className={`${listStyles.toolbar} ${toolbarStyles.toolbar}`}>
        <label className={listStyles.searchBox}><Search size={18} /><input placeholder="Tìm theo mã giảm giá" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPageNumber(1); }} /></label>
        <div className={toolbarStyles.toolbarActions}>
          <div className={toolbarStyles.menuWrap}><button aria-label="Download" className={toolbarStyles.iconButton} type="button" onClick={() => { setIsDownloadMenuOpen((current) => !current); setIsColumnsMenuOpen(false); }}><Download size={18} /></button>{isDownloadMenuOpen && <div className={toolbarStyles.dropdownMenu}><button type="button" onClick={() => { setIsDownloadMenuOpen(false); toastWarning("Chức năng xuất XLSX chưa được tích hợp."); }}>XLSX</button></div>}</div>
          <button className={toolbarStyles.filterButton} type="button" onClick={() => { setDraftFilters(filters); setIsFilterPanelOpen(true); setIsDownloadMenuOpen(false); setIsColumnsMenuOpen(false); }}><Funnel size={17} /> Filter {activeFilterCount > 0 && <span>{activeFilterCount}</span>}</button>
          <div className={toolbarStyles.menuWrap}><button className={toolbarStyles.columnsButton} type="button" onClick={() => { setIsColumnsMenuOpen((current) => !current); setIsDownloadMenuOpen(false); }}><Columns3 size={17} /> Columns</button>{isColumnsMenuOpen && <div className={`${toolbarStyles.dropdownMenu} ${toolbarStyles.columnsMenu}`}>{([...columns, "actions"] as ColumnKey[]).map((column) => <label key={column}><input checked={visibleColumns[column]} type="checkbox" onChange={() => setVisibleColumns((current) => ({ ...current, [column]: !current[column] }))} />{labels[column]}</label>)}</div>}</div>
        </div>
      </section>
      <section className={listStyles.tablePanel}><div className={listStyles.tableScroll}><table className={listStyles.table}><thead><tr>{columns.filter((column) => visibleColumns[column]).map((column) => <th key={column}>{labels[column]}</th>)}{visibleColumns.actions && <th>Action</th>}</tr></thead><tbody>{records.map((record) => <tr key={record.id}>
        {visibleColumns.code && <td><strong>{record.code}</strong></td>}
        {visibleColumns.type && <td>{typeLabels[String(record.type)] ?? String(record.type)}</td>}
        {visibleColumns.value && <td>{formatValue(record)}</td>}
        {visibleColumns.validity && <td>{formatDate(record.validFrom)} - {formatDate(record.validTo)}</td>}
        {visibleColumns.usage && <td>{formatUsage(record)}</td>}
        {visibleColumns.status && <td><span className={`${listStyles.statusBadge} ${record.isActive ? listStyles.active : listStyles.inactive}`}>{record.isActive ? "Hoạt động" : "Ngừng hoạt động"}</span></td>}
        {visibleColumns.actions && <td><div className={listStyles.actions}><Link aria-label="Xem" title="Xem chi tiết" to={`/admin/finance/discounts/${record.id}/view`}><Eye size={16} /></Link><Link aria-label="Sửa" title="Chỉnh sửa" to={`/admin/finance/discounts/${record.id}/edit`}><Edit3 size={16} /></Link><button aria-label="Xóa" title="Xóa" className={listStyles.deleteAction} type="button" onClick={() => setDeletingRecord(record)}><Trash2 size={16} /></button></div></td>}
      </tr>)}</tbody></table>{records.length === 0 && <div className={listStyles.emptyState}>Không có giảm giá phù hợp.</div>}</div><Pagination pageNumber={pageNumber} pageSize={pageSize} totalItems={totalItems} onPageChange={setPageNumber} onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }} /></section>
    </div>
    <SidePanel description="Lọc danh sách giảm giá theo loại và trạng thái." footer={<div className={toolbarStyles.panelActions}><button type="button" onClick={() => { setDraftFilters(emptyFilters); setFilters(emptyFilters); }}>Xóa bộ lọc</button><button type="button" onClick={() => { setFilters(draftFilters); setPageNumber(1); setIsFilterPanelOpen(false); }}>Áp dụng</button></div>} isOpen={isFilterPanelOpen} title="Bộ lọc" onClose={() => setIsFilterPanelOpen(false)}><div className={toolbarStyles.panelForm}>
      <label><span>Loại giảm giá</span><select value={draftFilters.type} onChange={(event) => setDraftFilters((current) => ({ ...current, type: event.target.value as Filters["type"] }))}><option value="all">Tất cả</option>{typeOptions.map((option) => <option key={option.value} value={option.value}>{option.value}</option>)}</select></label>
      <label><span>Trạng thái</span><select value={draftFilters.status} onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value as Filters["status"] }))}><option value="all">Tất cả</option><option value="active">Hoạt động</option><option value="inactive">Ngừng hoạt động</option></select></label>
    </div></SidePanel>
    <ConfirmModal confirmText={isDeleting ? "Đang xóa..." : "Xóa"} description={deletingRecord ? `Bạn có chắc muốn xóa giảm giá ${deletingRecord.code}?` : ""} isConfirmDisabled={isDeleting} isOpen={Boolean(deletingRecord)} title="Xác nhận xóa giảm giá" tone="danger" onCancel={() => setDeletingRecord(null)} onConfirm={handleDelete} />
  </>;
}
