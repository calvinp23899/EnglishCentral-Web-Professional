import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Columns3, Edit3, Eye, Funnel, Plus, Search, Trash2 } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, SidePanel, toastDanger, toastSuccess } from "@/components/ui";
import { adminRoomsApi, type AdminRoom } from "@/features/admin/rooms/api/admin-rooms-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import toolbarStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type SortKey = "code" | "name" | "capacity";
type SortDirection = "asc" | "desc";
type ColumnKey = SortKey | "building" | "floor" | "status" | "actions";
type StatusFilter = "all" | "active" | "inactive";

const columns: ColumnKey[] = ["code", "name", "capacity", "building", "floor", "status", "actions"];

const labels: Record<ColumnKey, string> = {
  code: "Mã phòng",
  name: "Tên phòng",
  capacity: "Sức chứa",
  building: "Tòa nhà",
  floor: "Tầng",
  status: "Trạng thái",
  actions: "Action",
};

const sortable: Partial<Record<ColumnKey, SortKey>> = {
  code: "code",
  name: "name",
  capacity: "capacity",
};

const initialVisibleColumns = Object.fromEntries(columns.map((column) => [column, true])) as Record<ColumnKey, boolean>;

export function RoomListPage() {
  const [records, setRecords] = useState<AdminRoom[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [draftStatusFilter, setDraftStatusFilter] = useState<StatusFilter>("all");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [sortKey, setSortKey] = useState<SortKey>("code");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingRecord, setDeletingRecord] = useState<AdminRoom | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const result = await adminRoomsApi.getPagedList({
          page: pageNumber,
          pageSize,
          keyword: searchTerm.trim(),
          sortBy: sortKey,
          isDescending: sortDirection === "desc",
          isActive: statusFilter === "all" ? undefined : statusFilter === "active",
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
  }, [pageNumber, pageSize, refreshVersion, searchTerm, sortDirection, sortKey, statusFilter]);

  const handleSort = (nextSortKey: SortKey) => {
    setPageNumber(1);
    setSortKey(nextSortKey);
    setSortDirection((currentDirection) =>
      sortKey === nextSortKey && currentDirection === "asc" ? "desc" : "asc",
    );
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await adminRoomsApi.delete(deletingRecord.id);
      toastSuccess("Xóa phòng học thành công.");
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

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return null;
    }

    return sortDirection === "asc" ? <ArrowUp aria-hidden="true" size={14} /> : <ArrowDown aria-hidden="true" size={14} />;
  };

  const activeFilterCount = statusFilter === "all" ? 0 : 1;

  return (
    <>
      <div className={listStyles.page}>
        <section className={listStyles.header}>
          <div>
            <h1>Danh sách phòng học</h1>
            <p>Quản lý phòng học, sức chứa và trạng thái sử dụng trong hệ thống.</p>
          </div>

          <Link className={listStyles.createButton} to="/admin/rooms/create">
            <Plus aria-hidden="true" size={18} />
            Tạo mới
          </Link>
        </section>

        <section className={`${listStyles.toolbar} ${toolbarStyles.toolbar}`} aria-label="Bộ lọc phòng học">
          <label className={listStyles.searchBox}>
            <Search aria-hidden="true" size={18} />
            <input
              placeholder="Tìm theo mã, tên phòng hoặc tòa nhà"
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
                setDraftStatusFilter(statusFilter);
                setIsFilterPanelOpen(true);
                setIsColumnsMenuOpen(false);
              }}
            >
              <Funnel aria-hidden="true" size={17} />
              Filter {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
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
                  {columns.map((column) => (
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
              <thead>
                <tr>
                  {columns.filter((column) => visibleColumns[column]).map((column) => (
                    <th key={column}>
                      {sortable[column] ? (
                        <button type="button" onClick={() => handleSort(sortable[column]!)}>
                          {labels[column]} {renderSortIcon(sortable[column]!)}
                        </button>
                      ) : (
                        labels[column]
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading && records.length === 0 && Array.from({ length: pageSize }).map((_, index) => (
                  <tr key={`room-skeleton-${index}`}>
                    {columns.filter((column) => visibleColumns[column]).map((column) => (
                      <td key={column}>
                        {column === "actions" ? (
                          <div className={listStyles.actions}>
                            <Skeleton borderRadius={8} height={34} width={34} />
                            <Skeleton borderRadius={8} height={34} width={34} />
                            <Skeleton borderRadius={8} height={34} width={34} />
                          </div>
                        ) : (
                          <Skeleton height={18} width={column === "status" ? 110 : 140} />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {records.map((record) => (
                  <tr key={record.id}>
                    {visibleColumns.code && <td><strong>{record.code}</strong></td>}
                    {visibleColumns.name && <td>{record.name}</td>}
                    {visibleColumns.capacity && <td>{record.capacity}</td>}
                    {visibleColumns.building && <td>{record.building || "Chưa cập nhật"}</td>}
                    {visibleColumns.floor && <td>{record.floor ?? "Chưa cập nhật"}</td>}
                    {visibleColumns.status && <td><span className={`${listStyles.statusBadge} ${record.isActive ? listStyles.active : listStyles.inactive}`}>{record.isActive ? "Hoạt động" : "Ngừng hoạt động"}</span></td>}
                    {visibleColumns.actions && <td><div className={listStyles.actions}>
                      <Link aria-label={`Xem ${record.name}`} title="Xem chi tiết" to={`/admin/rooms/${record.id}/view`}><Eye aria-hidden="true" size={16} /></Link>
                      <Link aria-label={`Sửa ${record.name}`} title="Chỉnh sửa" to={`/admin/rooms/${record.id}/edit`}><Edit3 aria-hidden="true" size={16} /></Link>
                      <button aria-label={`Xóa ${record.name}`} title="Xóa" className={listStyles.deleteAction} type="button" onClick={() => setDeletingRecord(record)}><Trash2 aria-hidden="true" size={16} /></button>
                    </div></td>}
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoading && records.length === 0 && (
              <div className={listStyles.emptyState}>Không có phòng học phù hợp với bộ lọc hiện tại.</div>
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
        description="Lọc danh sách phòng học theo trạng thái."
        footer={<div className={toolbarStyles.panelActions}><button type="button" onClick={() => { setDraftStatusFilter("all"); setStatusFilter("all"); setPageNumber(1); }}>Xóa bộ lọc</button><button type="button" onClick={() => { setStatusFilter(draftStatusFilter); setPageNumber(1); setIsFilterPanelOpen(false); }}>Áp dụng</button></div>}
        isOpen={isFilterPanelOpen}
        title="Bộ lọc"
        onClose={() => setIsFilterPanelOpen(false)}
      >
        <div className={toolbarStyles.panelForm}>
          <label>
            <span>Trạng thái</span>
            <select value={draftStatusFilter} onChange={(event) => setDraftStatusFilter(event.target.value as StatusFilter)}>
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
        description={deletingRecord ? `Bạn có chắc muốn xóa phòng học ${deletingRecord.name}? Hành động này không thể hoàn tác.` : ""}
        isConfirmDisabled={isDeleting}
        isOpen={Boolean(deletingRecord)}
        title="Xác nhận xóa phòng học"
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
