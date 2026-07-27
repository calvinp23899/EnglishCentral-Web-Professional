import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Columns3, Edit3, Eye, Funnel, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, SidePanel, toastDanger, toastSuccess } from "@/components/ui";
import {
  adminCrmApi,
  getLeadSourceChannelLabel,
  getLeadStatusLabel,
  getLeadStatusValue,
  leadStatusOptions,
  type AdminLead,
  type AdminLeadSource,
} from "@/features/admin/crm/api/admin-crm-api";
import { formatDateTime } from "@/features/admin/crm/pages/crm-page-utils";
import crmStyles from "@/features/admin/crm/pages/CrmPages.module.scss";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import toolbarStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type ColumnKey = "leadCode" | "fullName" | "phoneNumber" | "email" | "source" | "assignedTo" | "status" | "nextFollowUpAt" | "createdAt";
type Filters = { status: string; leadSourceId: string; createdFrom: string; createdTo: string };

const columns: ColumnKey[] = ["leadCode", "fullName", "phoneNumber", "email", "source", "assignedTo", "status", "nextFollowUpAt", "createdAt"];
const labels: Record<ColumnKey, string> = {
  leadCode: "Mã lead",
  fullName: "Họ tên",
  phoneNumber: "SĐT",
  email: "Email",
  source: "Nguồn",
  assignedTo: "Phụ trách",
  status: "Trạng thái",
  nextFollowUpAt: "Lịch chăm sóc",
  createdAt: "Ngày tạo",
};
const initialVisibleColumns = Object.fromEntries(columns.map((column) => [column, true])) as Record<ColumnKey, boolean>;
const emptyFilters: Filters = { status: "all", leadSourceId: "all", createdFrom: "", createdTo: "" };

const statusClass = (status: AdminLead["status"]) => {
  const value = getLeadStatusValue(status);
  return value === "Lost" ? crmStyles.statusLost
    : value === "Converted" ? crmStyles.statusConverted
    : value === "New" ? crmStyles.statusNew
    : value === "TrialScheduled" ? crmStyles.statusTrialScheduled
    : value === "Interested" ? crmStyles.statusInterested
    : crmStyles.statusContacted;
};

export function LeadListPage() {
  const [records, setRecords] = useState<AdminLead[]>([]);
  const [leadSources, setLeadSources] = useState<AdminLeadSource[]>([]);
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
  const [deletingRecord, setDeletingRecord] = useState<AdminLead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    adminCrmApi.leadSources.getList({ page: 1, pageSize: 100, isActive: true }).then((result) => setLeadSources(result.items)).catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await adminCrmApi.leads.getList({
          page: pageNumber,
          pageSize,
          keyword: searchTerm.trim(),
          status: filters.status === "all" ? undefined : filters.status,
          leadSourceId: filters.leadSourceId === "all" ? undefined : Number(filters.leadSourceId),
          createdFrom: filters.createdFrom,
          createdTo: filters.createdTo,
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

  const activeFilterCount = Object.values(filters).filter((value) => value && value !== "all").length;
  const renderSortIcon = () => sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;

  const handleConfirmDelete = async () => {
    if (!deletingRecord || isDeleting) return;
    setIsDeleting(true);
    try {
      await adminCrmApi.leads.delete(deletingRecord.id);
      toastSuccess("Xóa lead thành công.");
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
          <div><h1>Danh sách lead</h1><p>Quản lý khách hàng tiềm năng, trạng thái chăm sóc, lịch follow-up và chuyển đổi học viên.</p></div>
          <Link className={listStyles.createButton} to="/admin/crm-sales/leads/create"><Plus size={18} /> Tạo mới</Link>
        </section>
        <section className={`${listStyles.toolbar} ${toolbarStyles.toolbar}`}>
          <label className={listStyles.searchBox}><Search size={18} /><input placeholder="Tìm theo mã, họ tên, email, SĐT" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPageNumber(1); }} /></label>
          <div className={toolbarStyles.toolbarActions}>
            <button className={toolbarStyles.filterButton} type="button" onClick={() => { setDraftFilters(filters); setIsFilterPanelOpen(true); setIsColumnsMenuOpen(false); }}><Funnel size={17} /> Filter {activeFilterCount > 0 && <span>{activeFilterCount}</span>}</button>
            <div className={toolbarStyles.menuWrap}>
              <button className={toolbarStyles.columnsButton} type="button" onClick={() => setIsColumnsMenuOpen((current) => !current)}><Columns3 size={17} /> Columns</button>
              {isColumnsMenuOpen && <div className={`${toolbarStyles.dropdownMenu} ${toolbarStyles.columnsMenu}`}>{columns.map((column) => <label key={column}><input checked={visibleColumns[column]} type="checkbox" onChange={() => setVisibleColumns((current) => ({ ...current, [column]: !current[column] }))} />{labels[column]}</label>)}</div>}
            </div>
          </div>
        </section>
        <section className={listStyles.tablePanel}>
          <div className={listStyles.tableScroll}>
            <table className={listStyles.table}>
              <thead><tr>{columns.filter((column) => visibleColumns[column]).map((column) => <th key={column}>{column === "createdAt" ? <button type="button" onClick={() => setSortDirection((current) => current === "asc" ? "desc" : "asc")}>{labels[column]} {renderSortIcon()}</button> : labels[column]}</th>)}<th>Action</th></tr></thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    {visibleColumns.leadCode && <td><strong>{record.leadCode}</strong></td>}
                    {visibleColumns.fullName && <td>{record.fullName}</td>}
                    {visibleColumns.phoneNumber && <td>{record.phoneNumber}</td>}
                    {visibleColumns.email && <td>{record.email || "Chưa cập nhật"}</td>}
                    {visibleColumns.source && <td>{record.leadSourceName}<br /><small>{getLeadSourceChannelLabel(record.leadSourceChannel)}</small></td>}
                    {visibleColumns.assignedTo && <td>{record.assignedToUserName || "Chưa phân công"}</td>}
                    {visibleColumns.status && <td><span className={`${listStyles.statusBadge} ${statusClass(record.status)}`}>{getLeadStatusLabel(record.status)}</span></td>}
                    {visibleColumns.nextFollowUpAt && <td>{formatDateTime(record.nextFollowUpAt)}</td>}
                    {visibleColumns.createdAt && <td>{formatDateTime(record.createdAt)}</td>}
                    <td><div className={listStyles.actions}><Link to={`/admin/crm-sales/leads/${record.id}/view`} title="Xem chi tiết"><Eye size={16} /></Link><Link to={`/admin/crm-sales/leads/${record.id}/edit`} title="Chỉnh sửa"><Edit3 size={16} /></Link><button className={listStyles.deleteAction} type="button" title="Xóa" onClick={() => setDeletingRecord(record)}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 && <div className={listStyles.emptyState}>Không có lead phù hợp.</div>}
          </div>
          <Pagination pageNumber={pageNumber} pageSize={pageSize} totalItems={totalItems} onPageChange={setPageNumber} onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }} />
        </section>
      </div>
      <SidePanel description="Lọc lead theo trạng thái, nguồn và ngày tạo." footer={<div className={toolbarStyles.panelActions}><button type="button" onClick={() => { setDraftFilters(emptyFilters); setFilters(emptyFilters); setPageNumber(1); }}>Xóa bộ lọc</button><button type="button" onClick={() => { setFilters(draftFilters); setPageNumber(1); setIsFilterPanelOpen(false); }}>Áp dụng</button></div>} isOpen={isFilterPanelOpen} title="Bộ lọc" onClose={() => setIsFilterPanelOpen(false)}>
        <div className={toolbarStyles.panelForm}>
          <label><span>Trạng thái</span><select value={draftFilters.status} onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value }))}><option value="all">Tất cả</option>{leadStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label><span>Nguồn lead</span><select value={draftFilters.leadSourceId} onChange={(event) => setDraftFilters((current) => ({ ...current, leadSourceId: event.target.value }))}><option value="all">Tất cả</option>{leadSources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</select></label>
          <fieldset><legend>Ngày tạo</legend><label><span>Từ ngày</span><input type="date" value={draftFilters.createdFrom} onChange={(event) => setDraftFilters((current) => ({ ...current, createdFrom: event.target.value }))} /></label><label><span>Đến ngày</span><input type="date" value={draftFilters.createdTo} onChange={(event) => setDraftFilters((current) => ({ ...current, createdTo: event.target.value }))} /></label></fieldset>
        </div>
      </SidePanel>
      <ConfirmModal cancelText="Hủy" confirmText={isDeleting ? "Đang xóa..." : "Xóa"} description={deletingRecord ? `Bạn có chắc muốn xóa lead ${deletingRecord.fullName}?` : ""} isConfirmDisabled={isDeleting} isOpen={Boolean(deletingRecord)} title="Xác nhận xóa lead" tone="danger" onCancel={() => !isDeleting && setDeletingRecord(null)} onConfirm={handleConfirmDelete} />
    </>
  );
}
