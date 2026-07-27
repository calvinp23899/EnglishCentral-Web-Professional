import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Columns3, Edit3, Eye, Funnel, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, SidePanel, toastDanger, toastSuccess } from "@/components/ui";
import {
  adminCrmApi,
  getLeadSourceChannelLabel,
  leadSourceChannelOptions,
  type AdminLeadSource,
} from "@/features/admin/crm/api/admin-crm-api";
import { formatDate, formatMoney } from "@/features/admin/crm/pages/crm-page-utils";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import toolbarStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type ColumnKey = "code" | "name" | "channel" | "campaignName" | "cost" | "isActive" | "createdAt";
type Filters = { channel: string; isActive: string };

const columns: ColumnKey[] = ["code", "name", "channel", "campaignName", "cost", "isActive", "createdAt"];
const labels: Record<ColumnKey, string> = {
  code: "Mã nguồn",
  name: "Tên nguồn",
  channel: "Kênh",
  campaignName: "Chiến dịch",
  cost: "Chi phí",
  isActive: "Trạng thái",
  createdAt: "Ngày tạo",
};
const initialVisibleColumns = Object.fromEntries(columns.map((column) => [column, true])) as Record<ColumnKey, boolean>;
const emptyFilters: Filters = { channel: "all", isActive: "all" };

export function LeadSourceListPage() {
  const [records, setRecords] = useState<AdminLeadSource[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingRecord, setDeletingRecord] = useState<AdminLeadSource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await adminCrmApi.leadSources.getList({
          page: pageNumber,
          pageSize,
          keyword: searchTerm.trim(),
          channel: filters.channel === "all" ? undefined : filters.channel,
          isActive: filters.isActive === "all" ? undefined : filters.isActive === "true",
          isDescending: sortDirection === "desc",
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
  }, [filters, pageNumber, pageSize, refreshVersion, searchTerm, sortDirection]);

  const activeFilterCount = Object.values(filters).filter((value) => value !== "all").length;
  const renderSortIcon = () => (sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />);

  const handleConfirmDelete = async () => {
    if (!deletingRecord || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await adminCrmApi.leadSources.delete(deletingRecord.id);
      toastSuccess("Xóa nguồn lead thành công.");
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
            <h1>Danh sách nguồn lead</h1>
            <p>Quản lý nguồn khách hàng tiềm năng, kênh marketing, chiến dịch và chi phí.</p>
          </div>
          <Link className={listStyles.createButton} to="/admin/crm-sales/lead-sources/create">
            <Plus size={18} /> Tạo mới
          </Link>
        </section>

        <section className={`${listStyles.toolbar} ${toolbarStyles.toolbar}`}>
          <label className={listStyles.searchBox}>
            <Search size={18} />
            <input placeholder="Tìm theo mã, tên nguồn hoặc chiến dịch" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPageNumber(1); }} />
          </label>
          <div className={toolbarStyles.toolbarActions}>
            <button className={toolbarStyles.filterButton} type="button" onClick={() => { setDraftFilters(filters); setIsFilterPanelOpen(true); setIsColumnsMenuOpen(false); }}>
              <Funnel size={17} /> Filter {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
            </button>
            <div className={toolbarStyles.menuWrap}>
              <button className={toolbarStyles.columnsButton} type="button" onClick={() => setIsColumnsMenuOpen((current) => !current)}>
                <Columns3 size={17} /> Columns
              </button>
              {isColumnsMenuOpen && (
                <div className={`${toolbarStyles.dropdownMenu} ${toolbarStyles.columnsMenu}`}>
                  {columns.map((column) => (
                    <label key={column}>
                      <input checked={visibleColumns[column]} type="checkbox" onChange={() => setVisibleColumns((current) => ({ ...current, [column]: !current[column] }))} />
                      {labels[column]}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={listStyles.tablePanel}>
          <div className={listStyles.tableScroll}>
            <table className={listStyles.table}>
              <thead>
                <tr>
                  {columns.filter((column) => visibleColumns[column]).map((column) => (
                    <th key={column}>{column === "createdAt" ? <button type="button" onClick={() => setSortDirection((current) => current === "asc" ? "desc" : "asc")}>{labels[column]} {renderSortIcon()}</button> : labels[column]}</th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    {visibleColumns.code && <td><strong>{record.code}</strong></td>}
                    {visibleColumns.name && <td>{record.name}</td>}
                    {visibleColumns.channel && <td>{getLeadSourceChannelLabel(record.channel)}</td>}
                    {visibleColumns.campaignName && <td>{record.campaignName || "Chưa cập nhật"}</td>}
                    {visibleColumns.cost && <td>{formatMoney(record.cost)}</td>}
                    {visibleColumns.isActive && <td><span className={`${listStyles.statusBadge} ${record.isActive ? listStyles.active : listStyles.inactive}`}>{record.isActive ? "Hoạt động" : "Ngừng hoạt động"}</span></td>}
                    {visibleColumns.createdAt && <td>{formatDate(record.createdAt)}</td>}
                    <td>
                      <div className={listStyles.actions}>
                        <Link to={`/admin/crm-sales/lead-sources/${record.id}/view`} title="Xem chi tiết"><Eye size={16} /></Link>
                        <Link to={`/admin/crm-sales/lead-sources/${record.id}/edit`} title="Chỉnh sửa"><Edit3 size={16} /></Link>
                        <button className={listStyles.deleteAction} type="button" title="Xóa" onClick={() => setDeletingRecord(record)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 && <div className={listStyles.emptyState}>Không có nguồn lead phù hợp.</div>}
          </div>
          <Pagination pageNumber={pageNumber} pageSize={pageSize} totalItems={totalItems} onPageChange={setPageNumber} onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }} />
        </section>
      </div>

      <SidePanel
        description="Lọc nguồn lead theo kênh và trạng thái."
        footer={<div className={toolbarStyles.panelActions}><button type="button" onClick={() => { setDraftFilters(emptyFilters); setFilters(emptyFilters); setPageNumber(1); }}>Xóa bộ lọc</button><button type="button" onClick={() => { setFilters(draftFilters); setPageNumber(1); setIsFilterPanelOpen(false); }}>Áp dụng</button></div>}
        isOpen={isFilterPanelOpen}
        title="Bộ lọc"
        onClose={() => setIsFilterPanelOpen(false)}
      >
        <div className={toolbarStyles.panelForm}>
          <label><span>Kênh</span><select value={draftFilters.channel} onChange={(event) => setDraftFilters((current) => ({ ...current, channel: event.target.value }))}><option value="all">Tất cả</option>{leadSourceChannelOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label><span>Trạng thái</span><select value={draftFilters.isActive} onChange={(event) => setDraftFilters((current) => ({ ...current, isActive: event.target.value }))}><option value="all">Tất cả</option><option value="true">Hoạt động</option><option value="false">Ngừng hoạt động</option></select></label>
        </div>
      </SidePanel>

      <ConfirmModal cancelText="Hủy" confirmText={isDeleting ? "Đang xóa..." : "Xóa"} description={deletingRecord ? `Bạn có chắc muốn xóa nguồn lead ${deletingRecord.name}?` : ""} isConfirmDisabled={isDeleting} isOpen={Boolean(deletingRecord)} title="Xác nhận xóa nguồn lead" tone="danger" onCancel={() => !isDeleting && setDeletingRecord(null)} onConfirm={handleConfirmDelete} />
    </>
  );
}
