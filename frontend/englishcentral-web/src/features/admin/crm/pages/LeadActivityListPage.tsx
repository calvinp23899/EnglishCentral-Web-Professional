import { useEffect, useMemo, useState } from "react";
import { Columns3, Eye, Funnel, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { Pagination, SidePanel, toastDanger } from "@/components/ui";
import {
  adminCrmApi,
  getLeadActivityTypeLabel,
  getLeadActivityTypeValue,
  leadActivityTypeOptions,
  type AdminLead,
  type AdminLeadActivity,
} from "@/features/admin/crm/api/admin-crm-api";
import { formatDateTime } from "@/features/admin/crm/pages/crm-page-utils";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import toolbarStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type ActivityRow = AdminLeadActivity & { leadCode: string; leadName: string };
type ColumnKey = "lead" | "activityType" | "note" | "outcome" | "nextFollowUpAt" | "createdBy" | "createdAt";
type Filters = { activityType: string };

const columns: ColumnKey[] = ["lead", "activityType", "note", "outcome", "nextFollowUpAt", "createdBy", "createdAt"];
const labels: Record<ColumnKey, string> = {
  lead: "Lead",
  activityType: "Loại hoạt động",
  note: "Ghi chú",
  outcome: "Kết quả",
  nextFollowUpAt: "Follow-up",
  createdBy: "Người tạo",
  createdAt: "Ngày tạo",
};
const initialVisibleColumns = Object.fromEntries(columns.map((column) => [column, true])) as Record<ColumnKey, boolean>;
const emptyFilters: Filters = { activityType: "all" };

const flattenActivities = (leads: AdminLead[]): ActivityRow[] =>
  leads.flatMap((lead) =>
    lead.activities.map((activity) => ({
      ...activity,
      leadCode: lead.leadCode,
      leadName: lead.fullName,
    })),
  );

export function LeadActivityListPage() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    adminCrmApi.leads.getList({ page: 1, pageSize: 100, isDescending: true })
      .then((result) => setLeads(result.items))
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return flattenActivities(leads).filter((row) => {
      const matchesType = filters.activityType === "all" || getLeadActivityTypeValue(row.activityType) === filters.activityType;
      const matchesKeyword = !keyword || [row.leadCode, row.leadName, row.note, row.outcome, row.createdByUserName].some((value) => value?.toLowerCase().includes(keyword));
      return matchesType && matchesKeyword;
    });
  }, [filters.activityType, leads, searchTerm]);
  const pageRows = filteredRows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  const activeFilterCount = Object.values(filters).filter((value) => value !== "all").length;

  return (
    <>
      <div className={listStyles.page}>
        <section className={listStyles.header}><div><h1>Danh sách hoạt động lead</h1><p>Tổng hợp các hoạt động chăm sóc lead từ dữ liệu chi tiết lead.</p></div></section>
        <section className={`${listStyles.toolbar} ${toolbarStyles.toolbar}`}>
          <label className={listStyles.searchBox}><Search size={18} /><input placeholder="Tìm theo lead, ghi chú, kết quả hoặc người tạo" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPageNumber(1); }} /></label>
          <div className={toolbarStyles.toolbarActions}><button className={toolbarStyles.filterButton} type="button" onClick={() => { setDraftFilters(filters); setIsFilterPanelOpen(true); setIsColumnsMenuOpen(false); }}><Funnel size={17} /> Filter {activeFilterCount > 0 && <span>{activeFilterCount}</span>}</button><div className={toolbarStyles.menuWrap}><button className={toolbarStyles.columnsButton} type="button" onClick={() => setIsColumnsMenuOpen((current) => !current)}><Columns3 size={17} /> Columns</button>{isColumnsMenuOpen && <div className={`${toolbarStyles.dropdownMenu} ${toolbarStyles.columnsMenu}`}>{columns.map((column) => <label key={column}><input checked={visibleColumns[column]} type="checkbox" onChange={() => setVisibleColumns((current) => ({ ...current, [column]: !current[column] }))} />{labels[column]}</label>)}</div>}</div></div>
        </section>
        <section className={listStyles.tablePanel}><div className={listStyles.tableScroll}><table className={listStyles.table}><thead><tr>{columns.filter((column) => visibleColumns[column]).map((column) => <th key={column}>{labels[column]}</th>)}<th>Action</th></tr></thead><tbody>{pageRows.map((row) => <tr key={row.id}>{visibleColumns.lead && <td><strong>{row.leadName}</strong><br /><small>{row.leadCode}</small></td>}{visibleColumns.activityType && <td>{getLeadActivityTypeLabel(row.activityType)}</td>}{visibleColumns.note && <td>{row.note || "-"}</td>}{visibleColumns.outcome && <td>{row.outcome || "-"}</td>}{visibleColumns.nextFollowUpAt && <td>{formatDateTime(row.nextFollowUpAt)}</td>}{visibleColumns.createdBy && <td>{row.createdByUserName || `#${row.createdByUserId}`}</td>}{visibleColumns.createdAt && <td>{formatDateTime(row.createdAt)}</td>}<td><div className={listStyles.actions}><Link to={`/admin/crm-sales/leads/${row.leadId}/view`} title="Xem lead"><Eye size={16} /></Link></div></td></tr>)}</tbody></table>{pageRows.length === 0 && <div className={listStyles.emptyState}>Không có hoạt động lead phù hợp.</div>}</div><Pagination pageNumber={pageNumber} pageSize={pageSize} totalItems={filteredRows.length} onPageChange={setPageNumber} onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }} /></section>
      </div>
      <SidePanel description="Lọc hoạt động lead theo loại hoạt động." footer={<div className={toolbarStyles.panelActions}><button type="button" onClick={() => { setDraftFilters(emptyFilters); setFilters(emptyFilters); setPageNumber(1); }}>Xóa bộ lọc</button><button type="button" onClick={() => { setFilters(draftFilters); setPageNumber(1); setIsFilterPanelOpen(false); }}>Áp dụng</button></div>} isOpen={isFilterPanelOpen} title="Bộ lọc" onClose={() => setIsFilterPanelOpen(false)}>
        <div className={toolbarStyles.panelForm}><label><span>Loại hoạt động</span><select value={draftFilters.activityType} onChange={(event) => setDraftFilters((current) => ({ ...current, activityType: event.target.value }))}><option value="all">Tất cả</option>{leadActivityTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div>
      </SidePanel>
    </>
  );
}
