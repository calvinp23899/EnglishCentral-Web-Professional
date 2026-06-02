import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Columns3, Edit3, Eye, Funnel, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, SidePanel, toastDanger, toastSuccess } from "@/components/ui";
import {
  adminCourseCategoriesApi,
  type AdminCourseCategory,
} from "@/features/admin/course-categories/api/admin-course-categories-api";
import { adminCoursesApi, type AdminCourse } from "@/features/admin/courses/api/admin-courses-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import toolbarStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type SortKey = "code" | "name" | "tuitionFee" | "displayOrder";
type ColumnKey = "code" | "name" | "category" | "level" | "tuitionFee" | "status" | "actions";
type Filters = { categoryId: string; status: "all" | "active" | "inactive" };

const emptyFilters: Filters = { categoryId: "all", status: "all" };
const columns: ColumnKey[] = ["code", "name", "category", "level", "tuitionFee", "status"];
const labels: Record<ColumnKey, string> = {
  code: "Mã khóa học",
  name: "Tên khóa học",
  category: "Danh mục",
  level: "Cấp độ",
  tuitionFee: "Học phí",
  status: "Trạng thái",
  actions: "Action",
};
const initialVisibleColumns = Object.fromEntries(
  [...columns, "actions"].map((column) => [column, true]),
) as Record<ColumnKey, boolean>;
const sortableColumns: Partial<Record<ColumnKey, SortKey>> = {
  code: "code",
  name: "name",
  tuitionFee: "tuitionFee",
};
const formatMoney = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

export function CourseListPage() {
  const [records, setRecords] = useState<AdminCourse[]>([]);
  const [categories, setCategories] = useState<AdminCourseCategory[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [sortKey, setSortKey] = useState<SortKey>("displayOrder");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingRecord, setDeletingRecord] = useState<AdminCourse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    adminCourseCategoriesApi
      .getList({ page: 1, pageSize: 1000, sortBy: "name", isDescending: false })
      .then((result) => setCategories(result.items))
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await adminCoursesApi.getList({
          page: pageNumber,
          pageSize,
          keyword: searchTerm.trim(),
          sortBy: sortKey,
          isDescending: sortDirection === "desc",
          courseCategoryId: filters.categoryId === "all" ? undefined : Number(filters.categoryId),
          isActive: filters.status === "all" ? undefined : filters.status === "active",
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
  }, [filters, pageNumber, pageSize, refreshVersion, searchTerm, sortDirection, sortKey]);

  const categoryName = (id: number) =>
    categories.find((category) => category.id === id)?.name ?? `#${id}`;

  const handleSort = (column: ColumnKey) => {
    const nextSortKey = sortableColumns[column];
    if (!nextSortKey) return;
    setPageNumber(1);
    setSortKey(nextSortKey);
    setSortDirection((current) => sortKey === nextSortKey && current === "asc" ? "desc" : "asc");
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord || isDeleting) return;
    setIsDeleting(true);
    try {
      await adminCoursesApi.delete(deletingRecord.id);
      toastSuccess("Xóa khóa học thành công.");
      setDeletingRecord(null);
      if (records.length === 1 && pageNumber > 1) setPageNumber((current) => current - 1);
      else setRefreshVersion((current) => current + 1);
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const activeFilterCount = Object.values(filters).filter((value) => value !== "all").length;

  return (
    <>
      <div className={listStyles.page}>
        <section className={listStyles.header}>
          <div>
            <h1>Danh sách khóa học</h1>
            <p>Quản lý khóa học, danh mục, cấp độ, học phí và trạng thái mở bán.</p>
          </div>
          <Link className={listStyles.createButton} to="/admin/courses/create">
            <Plus aria-hidden="true" size={18} /> Tạo mới
          </Link>
        </section>

        <section className={`${listStyles.toolbar} ${toolbarStyles.toolbar}`}>
          <label className={listStyles.searchBox}>
            <Search aria-hidden="true" size={18} />
            <input
              placeholder="Tìm theo mã hoặc tên khóa học"
              value={searchTerm}
              onChange={(event) => { setSearchTerm(event.target.value); setPageNumber(1); }}
            />
          </label>
          <div className={toolbarStyles.toolbarActions}>
            <button
              className={toolbarStyles.filterButton}
              type="button"
              onClick={() => { setDraftFilters(filters); setIsFilterPanelOpen(true); setIsColumnsMenuOpen(false); }}
            >
              <Funnel aria-hidden="true" size={17} /> Filter
              {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
            </button>
            <div className={toolbarStyles.menuWrap}>
              <button
                aria-expanded={isColumnsMenuOpen}
                className={toolbarStyles.columnsButton}
                type="button"
                onClick={() => setIsColumnsMenuOpen((current) => !current)}
              >
                <Columns3 aria-hidden="true" size={17} /> Columns
              </button>
              {isColumnsMenuOpen && (
                <div className={`${toolbarStyles.dropdownMenu} ${toolbarStyles.columnsMenu}`}>
                  {([...columns, "actions"] as ColumnKey[]).map((column) => (
                    <label key={column}>
                      <input
                        checked={visibleColumns[column]}
                        type="checkbox"
                        onChange={() => setVisibleColumns((current) => ({ ...current, [column]: !current[column] }))}
                      />
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
              <thead><tr>
                {columns.filter((column) => visibleColumns[column]).map((column) => (
                  <th key={column}>
                    {sortableColumns[column] ? (
                      <button type="button" onClick={() => handleSort(column)}>
                        {labels[column]} {sortKey === sortableColumns[column] && (sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </button>
                    ) : labels[column]}
                  </th>
                ))}
                {visibleColumns.actions && <th>Action</th>}
              </tr></thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    {visibleColumns.code && <td><strong>{record.code}</strong></td>}
                    {visibleColumns.name && <td>{record.name}</td>}
                    {visibleColumns.category && <td>{categoryName(record.courseCategoryId)}</td>}
                    {visibleColumns.level && <td>{record.level || "Chưa cập nhật"}</td>}
                    {visibleColumns.tuitionFee && <td>{formatMoney(record.tuitionFee)} đ</td>}
                    {visibleColumns.status && <td><span className={`${listStyles.statusBadge} ${record.isActive ? listStyles.active : listStyles.inactive}`}>{record.isActive ? "Hoạt động" : "Ngừng hoạt động"}</span></td>}
                    {visibleColumns.actions && <td><div className={listStyles.actions}>
                      <Link aria-label="Xem" title="Xem chi tiết" to={`/admin/courses/${record.id}/view`}><Eye size={16} /></Link>
                      <Link aria-label="Sửa" title="Chỉnh sửa" to={`/admin/courses/${record.id}/edit`}><Edit3 size={16} /></Link>
                      <button aria-label="Xóa" title="Xóa" className={listStyles.deleteAction} type="button" onClick={() => setDeletingRecord(record)}><Trash2 size={16} /></button>
                    </div></td>}
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 && <div className={listStyles.emptyState}>Không có khóa học phù hợp.</div>}
          </div>
          <Pagination pageNumber={pageNumber} pageSize={pageSize} totalItems={totalItems} onPageChange={setPageNumber} onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }} />
        </section>
      </div>

      <SidePanel
        description="Lọc danh sách khóa học theo danh mục và trạng thái."
        footer={<div className={toolbarStyles.panelActions}>
          <button type="button" onClick={() => { setDraftFilters(emptyFilters); setFilters(emptyFilters); setPageNumber(1); }}>Xóa bộ lọc</button>
          <button type="button" onClick={() => { setFilters(draftFilters); setPageNumber(1); setIsFilterPanelOpen(false); }}>Áp dụng</button>
        </div>}
        isOpen={isFilterPanelOpen}
        title="Bộ lọc"
        onClose={() => setIsFilterPanelOpen(false)}
      >
        <div className={toolbarStyles.panelForm}>
          <label><span>Danh mục</span><select value={draftFilters.categoryId} onChange={(event) => setDraftFilters((current) => ({ ...current, categoryId: event.target.value }))}>
            <option value="all">Tất cả</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select></label>
          <label><span>Trạng thái</span><select value={draftFilters.status} onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value as Filters["status"] }))}>
            <option value="all">Tất cả</option><option value="active">Hoạt động</option><option value="inactive">Ngừng hoạt động</option>
          </select></label>
        </div>
      </SidePanel>

      <ConfirmModal
        confirmText={isDeleting ? "Đang xóa..." : "Xóa"}
        description={deletingRecord ? `Bạn có chắc muốn xóa khóa học ${deletingRecord.name}?` : ""}
        isConfirmDisabled={isDeleting}
        isOpen={Boolean(deletingRecord)}
        title="Xác nhận xóa khóa học"
        onCancel={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
