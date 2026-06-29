import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Columns3, Edit3, Eye, Funnel, Plus, Search, Trash2 } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, SidePanel, toastDanger, toastSuccess } from "@/components/ui";
import {
  adminCourseCategoriesApi,
  type AdminCourseCategory,
} from "@/features/admin/course-categories/api/admin-course-categories-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import toolbarStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import styles from "./CourseCategoryListPage.module.scss";

type SortKey = "code" | "name";
type SortDirection = "asc" | "desc";
type ColumnKey = SortKey | "description" | "status" | "actions";

const columnLabels: Record<ColumnKey, string> = {
  code: "Mã danh mục",
  name: "Tên danh mục",
  description: "Mô tả",
  status: "Trạng thái",
  actions: "Action",
};

const initialVisibleColumns: Record<ColumnKey, boolean> = {
  code: true,
  name: true,
  description: true,
  status: true,
  actions: true,
};

export function CourseCategoryListPage() {
  const [records, setRecords] = useState<AdminCourseCategory[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [draftStatusFilter, setDraftStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [sortKey, setSortKey] = useState<SortKey>("code");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingRecord, setDeletingRecord] = useState<AdminCourseCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const result = await adminCourseCategoriesApi.getList({
          page: pageNumber,
          pageSize,
          keyword: searchTerm.trim(),
          sortBy: sortKey,
          isDescending: sortDirection === "desc",
        });

        setRecords(result.items);
        setTotalItems(result.totalItems);
      } catch (error) {
        toastDanger(getAuthErrorMessage(error));
        setRecords([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [
    pageNumber,
    pageSize,
    refreshVersion,
    searchTerm,
    sortDirection,
    sortKey,
  ]);

  const handleSort = (nextSortKey: SortKey) => {
    setPageNumber(1);
    setSortKey(nextSortKey);
    setSortDirection((currentDirection) =>
      sortKey === nextSortKey && currentDirection === "asc" ? "desc" : "asc",
    );
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return null;
    }

    return sortDirection === "asc" ? (
      <ArrowUp aria-hidden="true" size={14} />
    ) : (
      <ArrowDown aria-hidden="true" size={14} />
    );
  };

  const toggleColumn = (column: ColumnKey) => {
    setVisibleColumns((currentColumns) => ({
      ...currentColumns,
      [column]: !currentColumns[column],
    }));
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await adminCourseCategoriesApi.delete(deletingRecord.id);
      toastSuccess("Xóa danh mục khóa học thành công.");
      setDeletingRecord(null);

      if (records.length === 1 && pageNumber > 1) {
        setPageNumber((currentPage) => currentPage - 1);
      } else {
        setRefreshVersion((currentVersion) => currentVersion + 1);
      }
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
            <h1>Danh mục khóa học</h1>
            <p>Quản lý nhóm danh mục dùng để phân loại các khóa học trong hệ thống.</p>
          </div>

          <Link className={listStyles.createButton} to="/admin/course-categories/create">
            <Plus aria-hidden="true" size={18} />
            Tạo mới
          </Link>
        </section>

        <section
          className={`${listStyles.toolbar} ${toolbarStyles.toolbar}`}
          aria-label="Bộ lọc danh mục khóa học"
        >
          <label className={listStyles.searchBox}>
            <Search aria-hidden="true" size={18} />
            <input
              placeholder="Tìm theo mã hoặc tên danh mục"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPageNumber(1);
              }}
            />
          </label>

          <div className={toolbarStyles.toolbarActions}>
            <button
              className={toolbarStyles.filterButton}
              type="button"
              onClick={() => {
                setIsFilterPanelOpen(true);
                setIsColumnsMenuOpen(false);
              }}
            >
              <Funnel aria-hidden="true" size={17} />
              Filter
            </button>

            <div className={toolbarStyles.menuWrap}>
              <button
                aria-expanded={isColumnsMenuOpen}
                className={toolbarStyles.columnsButton}
                type="button"
                onClick={() => setIsColumnsMenuOpen((current) => !current)}
              >
                <Columns3 aria-hidden="true" size={17} />
                Columns
              </button>
              {isColumnsMenuOpen && (
                <div className={`${toolbarStyles.dropdownMenu} ${toolbarStyles.columnsMenu}`}>
                  {(Object.keys(columnLabels) as ColumnKey[]).map((column) => (
                    <label key={column}>
                      <input
                        checked={visibleColumns[column]}
                        type="checkbox"
                        onChange={() => toggleColumn(column)}
                      />
                      {columnLabels[column]}
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
                  {visibleColumns.code && <th>
                    <button type="button" onClick={() => handleSort("code")}>
                      Mã danh mục {renderSortIcon("code")}
                    </button>
                  </th>}
                  {visibleColumns.name && <th>
                    <button type="button" onClick={() => handleSort("name")}>
                      Tên danh mục {renderSortIcon("name")}
                    </button>
                  </th>}
                  {visibleColumns.description && <th>Mô tả</th>}
                  {visibleColumns.status && <th>Trạng thái</th>}
                  {visibleColumns.actions && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  records.length === 0 &&
                  Array.from({ length: pageSize }).map((_, index) => (
                    <tr key={`course-category-skeleton-${index}`}>
                      {visibleColumns.code && <td><Skeleton height={18} width={110} /></td>}
                      {visibleColumns.name && <td><Skeleton height={18} width={180} /></td>}
                      {visibleColumns.description && <td><Skeleton height={18} width={260} /></td>}
                      {visibleColumns.status && <td><Skeleton borderRadius={999} height={28} width={110} /></td>}
                      {visibleColumns.actions && <td>
                        <div className={listStyles.actions}>
                          <Skeleton borderRadius={8} height={34} width={34} />
                          <Skeleton borderRadius={8} height={34} width={34} />
                          <Skeleton borderRadius={8} height={34} width={34} />
                        </div>
                      </td>}
                    </tr>
                  ))}

                {records.map((record) => (
                  <tr key={record.id}>
                    {visibleColumns.code && <td><strong>{record.code}</strong></td>}
                    {visibleColumns.name && <td>{record.name}</td>}
                    {visibleColumns.description && <td className={styles.description} title={record.description ?? undefined}>
                      {record.description || "Chưa cập nhật"}
                    </td>}
                    {visibleColumns.status && <td>
                      <span
                        className={`${listStyles.statusBadge} ${
                          record.isActive ? listStyles.active : listStyles.inactive
                        }`}
                      >
                        {record.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                      </span>
                    </td>}
                    {visibleColumns.actions && <td>
                      <div className={listStyles.actions}>
                        <Link
                          aria-label={`Xem ${record.name}`}
                          title="Xem chi tiết"
                          to={`/admin/course-categories/${record.id}/view`}
                        >
                          <Eye aria-hidden="true" size={16} />
                        </Link>
                        <Link
                          aria-label={`Sửa ${record.name}`}
                          title="Chỉnh sửa"
                          to={`/admin/course-categories/${record.id}/edit`}
                        >
                          <Edit3 aria-hidden="true" size={16} />
                        </Link>
                        <button
                          className={listStyles.deleteAction}
                          type="button"
                          aria-label={`Xóa ${record.name}`}
                          title="Xóa"
                          onClick={() => setDeletingRecord(record)}
                        >
                          <Trash2 aria-hidden="true" size={16} />
                        </button>
                      </div>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoading && records.length === 0 && (
              <div className={listStyles.emptyState}>
                Không có danh mục khóa học phù hợp với bộ lọc hiện tại.
              </div>
            )}
          </div>

          <Pagination
            pageNumber={pageNumber}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            totalItems={totalItems}
            onPageChange={setPageNumber}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPageNumber(1);
            }}
          />
        </section>
      </div>

      <SidePanel
        description="Chọn điều kiện lọc danh mục khóa học. Bộ lọc hiện chưa áp dụng vào API."
        footer={
          <div className={toolbarStyles.panelActions}>
            <button type="button" onClick={() => setDraftStatusFilter("all")}>
              Xóa bộ lọc
            </button>
            <button type="button" onClick={() => setIsFilterPanelOpen(false)}>
              Áp dụng
            </button>
          </div>
        }
        isOpen={isFilterPanelOpen}
        title="Bộ lọc"
        onClose={() => setIsFilterPanelOpen(false)}
      >
        <div className={toolbarStyles.panelForm}>
          <label>
            <span>Trạng thái</span>
            <select
              value={draftStatusFilter}
              onChange={(event) =>
                setDraftStatusFilter(event.target.value as typeof draftStatusFilter)
              }
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </label>
        </div>
      </SidePanel>

      <ConfirmModal
        cancelText="Hủy"
        confirmText={isDeleting ? "Đang xóa..." : "Xóa"}
        description={
          deletingRecord
            ? `Bạn có chắc muốn xóa danh mục ${deletingRecord.name}? Hành động này không thể hoàn tác.`
            : ""
        }
        isConfirmDisabled={isDeleting}
        isOpen={Boolean(deletingRecord)}
        title="Xác nhận xóa danh mục"
        tone="danger"
        onCancel={() => {
          if (!isDeleting) {
            setDeletingRecord(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
