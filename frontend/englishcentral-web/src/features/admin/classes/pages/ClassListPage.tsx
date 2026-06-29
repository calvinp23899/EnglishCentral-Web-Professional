import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Columns3, Edit3, Eye, Funnel, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, SidePanel, toastDanger, toastSuccess } from "@/components/ui";
import { adminClassesApi, type AdminClass, type ClassStatus } from "@/features/admin/classes/api/admin-classes-api";
import { adminCoursesApi, type AdminCourse } from "@/features/admin/courses/api/admin-courses-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import { adminTeachersApi, type AdminTeacher } from "@/features/admin/teachers/api/admin-teachers-api";
import toolbarStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type ColumnKey = "code" | "name" | "course" | "teacher" | "startDate" | "status" | "actions";
type SortKey = "code" | "name" | "startDate" | "status";
type Filters = { courseId: string; teacherId: string; status: "all" | ClassStatus };
const emptyFilters: Filters = { courseId: "all", teacherId: "all", status: "all" };
const columns: ColumnKey[] = ["code", "name", "course", "teacher", "startDate", "status"];
const labels: Record<ColumnKey, string> = { code: "Mã lớp", name: "Tên lớp", course: "Khóa học", teacher: "Nhân viên", startDate: "Ngày bắt đầu", status: "Trạng thái", actions: "Action" };
const initialVisibleColumns = Object.fromEntries([...columns, "actions"].map((column) => [column, true])) as Record<ColumnKey, boolean>;
const sortable: Partial<Record<ColumnKey, SortKey>> = { code: "code", name: "name", startDate: "startDate", status: "status" };
const statusLabels: Record<string, string> = { "1": "Nháp", "2": "Mở đăng ký", "3": "Đang học", "4": "Hoàn thành", "5": "Đã hủy", Draft: "Nháp", Open: "Mở đăng ký", Ongoing: "Đang học", Completed: "Hoàn thành", Cancelled: "Đã hủy" };
const statusTone = (status: AdminClass["status"]) => status === 5 || status === "Cancelled" ? "inactive" : status === 1 || status === "Draft" ? "pending" : "active";
const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN").format(new Date(value));

export function ClassListPage() {
  const [records, setRecords] = useState<AdminClass[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [sortKey, setSortKey] = useState<SortKey>("startDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingRecord, setDeletingRecord] = useState<AdminClass | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    Promise.all([
      adminCoursesApi.getList({ page: 1, pageSize: 1000, sortBy: "name", isDescending: false }),
      adminTeachersApi.getList({ page: 1, pageSize: 1000, sortBy: "fullName", isDescending: false }),
    ]).then(([courseResult, teacherResult]) => { setCourses(courseResult.items); setTeachers(teacherResult.items); })
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await adminClassesApi.getList({ page: pageNumber, pageSize, keyword: searchTerm.trim(), sortBy: sortKey, isDescending: sortDirection === "desc", courseId: filters.courseId === "all" ? undefined : Number(filters.courseId), teacherId: filters.teacherId === "all" ? undefined : Number(filters.teacherId), status: filters.status === "all" ? undefined : filters.status });
        setRecords(result.items); setTotalItems(result.totalItems);
      } catch (error) { toastDanger(getAuthErrorMessage(error)); setRecords([]); setTotalItems(0); }
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [filters, pageNumber, pageSize, refreshVersion, searchTerm, sortDirection, sortKey]);

  const nameById = <T extends { id: number }>(items: T[], id: number, getter: (item: T) => string) => items.find((item) => item.id === id) ? getter(items.find((item) => item.id === id)!) : `#${id}`;
  const handleSort = (column: ColumnKey) => { const next = sortable[column]; if (!next) return; setPageNumber(1); setSortKey(next); setSortDirection((current) => sortKey === next && current === "asc" ? "desc" : "asc"); };
  const handleDelete = async () => { if (!deletingRecord || isDeleting) return; setIsDeleting(true); try { await adminClassesApi.delete(deletingRecord.id); toastSuccess("Xóa lớp học thành công."); setDeletingRecord(null); setRefreshVersion((current) => current + 1); } catch (error) { toastDanger(getAuthErrorMessage(error)); } finally { setIsDeleting(false); } };
  const activeFilterCount = Object.values(filters).filter((value) => value !== "all").length;

  return <><div className={listStyles.page}>
    <section className={listStyles.header}><div><h1>Danh sách lớp học</h1><p>Quản lý lớp học, khóa học, nhân viên phụ trách và trạng thái vận hành.</p></div><Link className={listStyles.createButton} to="/admin/classes/create"><Plus size={18} /> Tạo mới</Link></section>
    <section className={`${listStyles.toolbar} ${toolbarStyles.toolbar}`}><label className={listStyles.searchBox}><Search size={18} /><input placeholder="Tìm theo mã hoặc tên lớp" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPageNumber(1); }} /></label><div className={toolbarStyles.toolbarActions}>
      <button className={toolbarStyles.filterButton} type="button" onClick={() => { setDraftFilters(filters); setIsFilterPanelOpen(true); setIsColumnsMenuOpen(false); }}><Funnel size={17} /> Filter {activeFilterCount > 0 && <span>{activeFilterCount}</span>}</button>
      <div className={toolbarStyles.menuWrap}><button aria-expanded={isColumnsMenuOpen} className={toolbarStyles.columnsButton} type="button" onClick={() => setIsColumnsMenuOpen((current) => !current)}><Columns3 size={17} /> Columns</button>{isColumnsMenuOpen && <div className={`${toolbarStyles.dropdownMenu} ${toolbarStyles.columnsMenu}`}>{([...columns, "actions"] as ColumnKey[]).map((column) => <label key={column}><input checked={visibleColumns[column]} type="checkbox" onChange={() => setVisibleColumns((current) => ({ ...current, [column]: !current[column] }))} />{labels[column]}</label>)}</div>}</div>
    </div></section>
    <section className={listStyles.tablePanel}><div className={listStyles.tableScroll}><table className={listStyles.table}><thead><tr>{columns.filter((column) => visibleColumns[column]).map((column) => <th key={column}>{sortable[column] ? <button type="button" onClick={() => handleSort(column)}>{labels[column]} {sortKey === sortable[column] && (sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</button> : labels[column]}</th>)}{visibleColumns.actions && <th>Action</th>}</tr></thead><tbody>{records.map((record) => <tr key={record.id}>
      {visibleColumns.code && <td><strong>{record.code}</strong></td>}{visibleColumns.name && <td>{record.name}</td>}{visibleColumns.course && <td>{nameById(courses, record.courseId, (item) => item.name)}</td>}{visibleColumns.teacher && <td>{nameById(teachers, record.teacherId, (item) => item.fullName)}</td>}{visibleColumns.startDate && <td>{formatDate(record.startDate)}</td>}{visibleColumns.status && <td><span className={`${listStyles.statusBadge} ${listStyles[statusTone(record.status)]}`}>{statusLabels[String(record.status)] ?? String(record.status)}</span></td>}{visibleColumns.actions && <td><div className={listStyles.actions}><Link aria-label="Xem" title="Xem chi tiết" to={`/admin/classes/${record.id}/view`}><Eye size={16} /></Link><Link aria-label="Sửa" title="Chỉnh sửa" to={`/admin/classes/${record.id}/edit`}><Edit3 size={16} /></Link><button aria-label="Xóa" title="Xóa" className={listStyles.deleteAction} type="button" onClick={() => setDeletingRecord(record)}><Trash2 size={16} /></button></div></td>}
    </tr>)}</tbody></table>{records.length === 0 && <div className={listStyles.emptyState}>Không có lớp học phù hợp.</div>}</div><Pagination pageNumber={pageNumber} pageSize={pageSize} totalItems={totalItems} onPageChange={setPageNumber} onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }} /></section>
  </div>
  <SidePanel description="Lọc danh sách lớp học theo khóa học, nhân viên và trạng thái." footer={<div className={toolbarStyles.panelActions}><button type="button" onClick={() => { setDraftFilters(emptyFilters); setFilters(emptyFilters); }}>Xóa bộ lọc</button><button type="button" onClick={() => { setFilters(draftFilters); setPageNumber(1); setIsFilterPanelOpen(false); }}>Áp dụng</button></div>} isOpen={isFilterPanelOpen} title="Bộ lọc" onClose={() => setIsFilterPanelOpen(false)}><div className={toolbarStyles.panelForm}>
    <label><span>Khóa học</span><select value={draftFilters.courseId} onChange={(event) => setDraftFilters((current) => ({ ...current, courseId: event.target.value }))}><option value="all">Tất cả</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
    <label><span>Nhân viên</span><select value={draftFilters.teacherId} onChange={(event) => setDraftFilters((current) => ({ ...current, teacherId: event.target.value }))}><option value="all">Tất cả</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>)}</select></label>
    <label><span>Trạng thái</span><select value={draftFilters.status} onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value as Filters["status"] }))}><option value="all">Tất cả</option>{(["Draft", "Open", "Ongoing", "Completed", "Cancelled"] as ClassStatus[]).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
  </div></SidePanel>
  <ConfirmModal confirmText={isDeleting ? "Đang xóa..." : "Xóa"} description={deletingRecord ? `Bạn có chắc muốn xóa lớp ${deletingRecord.name}?` : ""} isConfirmDisabled={isDeleting} isOpen={Boolean(deletingRecord)} title="Xác nhận xóa lớp học" onCancel={() => setDeletingRecord(null)} onConfirm={handleDelete} /></>;
}
