import { useEffect, useState } from "react";
import { Columns3, Eye, Funnel, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { Pagination, SidePanel, toastDanger } from "@/components/ui";
import { adminCrmApi, type AdminLeadConversion, type AdminLeadSource } from "@/features/admin/crm/api/admin-crm-api";
import { formatDateTime, formatMoney } from "@/features/admin/crm/pages/crm-page-utils";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import toolbarStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type ColumnKey = "student" | "leadId" | "source" | "course" | "revenue" | "convertedBy" | "convertedAt";
type Filters = { leadSourceId: string; convertedByUserId: string; convertedFrom: string; convertedTo: string };

const columns: ColumnKey[] = ["student", "leadId", "source", "course", "revenue", "convertedBy", "convertedAt"];
const labels: Record<ColumnKey, string> = {
  student: "Học viên",
  leadId: "Lead ID",
  source: "Nguồn",
  course: "Khóa học",
  revenue: "Doanh thu",
  convertedBy: "Người chuyển đổi",
  convertedAt: "Ngày chuyển đổi",
};
const initialVisibleColumns = Object.fromEntries(columns.map((column) => [column, true])) as Record<ColumnKey, boolean>;
const emptyFilters: Filters = { leadSourceId: "all", convertedByUserId: "", convertedFrom: "", convertedTo: "" };

export function LeadConversionListPage() {
  const [records, setRecords] = useState<AdminLeadConversion[]>([]);
  const [leadSources, setLeadSources] = useState<AdminLeadSource[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    adminCrmApi.leadSources.getList({ page: 1, pageSize: 100 }).then((result) => setLeadSources(result.items)).catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await adminCrmApi.leadConversions.getList({
          page: pageNumber,
          pageSize,
          leadSourceId: filters.leadSourceId === "all" ? undefined : Number(filters.leadSourceId),
          convertedByUserId: filters.convertedByUserId ? Number(filters.convertedByUserId) : undefined,
          convertedFrom: filters.convertedFrom,
          convertedTo: filters.convertedTo,
          isDescending: true,
        });
        const keyword = searchTerm.trim().toLowerCase();
        setRecords(keyword ? result.items.filter((item) => [item.studentName, item.studentCode, item.sourceNameSnapshot, item.courseNameSnapshot].some((value) => value?.toLowerCase().includes(keyword))) : result.items);
        setTotalItems(result.totalItems);
      } catch (error) {
        toastDanger(getAuthErrorMessage(error));
        setRecords([]);
        setTotalItems(0);
      }
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [filters, pageNumber, pageSize, searchTerm]);

  const activeFilterCount = Object.values(filters).filter((value) => value && value !== "all").length;

  return (
    <>
      <div className={listStyles.page}>
        <section className={listStyles.header}><div><h1>Danh sách chuyển đổi lead</h1><p>Theo dõi lead đã chuyển đổi sang học viên, enrollment và doanh thu snapshot.</p></div></section>
        <section className={`${listStyles.toolbar} ${toolbarStyles.toolbar}`}>
          <label className={listStyles.searchBox}><Search size={18} /><input placeholder="Tìm theo học viên, nguồn hoặc khóa học" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPageNumber(1); }} /></label>
          <div className={toolbarStyles.toolbarActions}>
            <button className={toolbarStyles.filterButton} type="button" onClick={() => { setDraftFilters(filters); setIsFilterPanelOpen(true); setIsColumnsMenuOpen(false); }}><Funnel size={17} /> Filter {activeFilterCount > 0 && <span>{activeFilterCount}</span>}</button>
            <div className={toolbarStyles.menuWrap}><button className={toolbarStyles.columnsButton} type="button" onClick={() => setIsColumnsMenuOpen((current) => !current)}><Columns3 size={17} /> Columns</button>{isColumnsMenuOpen && <div className={`${toolbarStyles.dropdownMenu} ${toolbarStyles.columnsMenu}`}>{columns.map((column) => <label key={column}><input checked={visibleColumns[column]} type="checkbox" onChange={() => setVisibleColumns((current) => ({ ...current, [column]: !current[column] }))} />{labels[column]}</label>)}</div>}</div>
          </div>
        </section>
        <section className={listStyles.tablePanel}><div className={listStyles.tableScroll}><table className={listStyles.table}><thead><tr>{columns.filter((column) => visibleColumns[column]).map((column) => <th key={column}>{labels[column]}</th>)}<th>Action</th></tr></thead><tbody>{records.map((record) => <tr key={record.id}>{visibleColumns.student && <td><strong>{record.studentName || record.studentCode || `#${record.studentId}`}</strong></td>}{visibleColumns.leadId && <td>#{record.leadId}</td>}{visibleColumns.source && <td>{record.sourceNameSnapshot || "Chưa cập nhật"}</td>}{visibleColumns.course && <td>{record.courseNameSnapshot || "Chưa cập nhật"}</td>}{visibleColumns.revenue && <td>{formatMoney(record.revenueSnapshot)}</td>}{visibleColumns.convertedBy && <td>{record.convertedByUserName || `#${record.convertedByUserId}`}</td>}{visibleColumns.convertedAt && <td>{formatDateTime(record.convertedAt)}</td>}<td><div className={listStyles.actions}><Link to={`/admin/crm-sales/lead-conversions/${record.id}/view`} title="Xem chi tiết"><Eye size={16} /></Link></div></td></tr>)}</tbody></table>{records.length === 0 && <div className={listStyles.emptyState}>Không có chuyển đổi lead phù hợp.</div>}</div><Pagination pageNumber={pageNumber} pageSize={pageSize} totalItems={totalItems} onPageChange={setPageNumber} onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }} /></section>
      </div>
      <SidePanel description="Lọc chuyển đổi lead theo nguồn, người chuyển đổi và thời gian." footer={<div className={toolbarStyles.panelActions}><button type="button" onClick={() => { setDraftFilters(emptyFilters); setFilters(emptyFilters); setPageNumber(1); }}>Xóa bộ lọc</button><button type="button" onClick={() => { setFilters(draftFilters); setPageNumber(1); setIsFilterPanelOpen(false); }}>Áp dụng</button></div>} isOpen={isFilterPanelOpen} title="Bộ lọc" onClose={() => setIsFilterPanelOpen(false)}>
        <div className={toolbarStyles.panelForm}><label><span>Nguồn lead</span><select value={draftFilters.leadSourceId} onChange={(event) => setDraftFilters((current) => ({ ...current, leadSourceId: event.target.value }))}><option value="all">Tất cả</option>{leadSources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</select></label><label><span>Người chuyển đổi ID</span><input type="number" value={draftFilters.convertedByUserId} onChange={(event) => setDraftFilters((current) => ({ ...current, convertedByUserId: event.target.value }))} /></label><fieldset><legend>Ngày chuyển đổi</legend><label><span>Từ ngày</span><input type="date" value={draftFilters.convertedFrom} onChange={(event) => setDraftFilters((current) => ({ ...current, convertedFrom: event.target.value }))} /></label><label><span>Đến ngày</span><input type="date" value={draftFilters.convertedTo} onChange={(event) => setDraftFilters((current) => ({ ...current, convertedTo: event.target.value }))} /></label></fieldset></div>
      </SidePanel>
    </>
  );
}
