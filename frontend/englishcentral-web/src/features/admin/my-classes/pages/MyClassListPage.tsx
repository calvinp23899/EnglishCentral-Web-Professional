import { useMemo, useState } from "react";
import { Columns3, Eye, Funnel, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { Pagination, SidePanel } from "@/components/ui";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import toolbarStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";

import { formatDate, myClassRecords } from "./myClassesMock";

type ColumnKey = "code" | "name" | "capacity" | "startDate" | "endDate" | "actions";
type CapacityFilter = "all" | "available" | "full";

const columns: ColumnKey[] = ["code", "name", "capacity", "startDate", "endDate", "actions"];
const labels: Record<ColumnKey, string> = {
  code: "Mã lớp",
  name: "Tên lớp",
  capacity: "Sĩ số",
  startDate: "Ngày bắt đầu",
  endDate: "Ngày kết thúc",
  actions: "Action",
};
const initialVisibleColumns = Object.fromEntries(columns.map((column) => [column, true])) as Record<ColumnKey, boolean>;

export function MyClassListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState<CapacityFilter>("all");
  const [draftCapacityFilter, setDraftCapacityFilter] = useState<CapacityFilter>("all");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const records = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return myClassRecords.filter((record) => {
      const matchesKeyword = !keyword
        || record.code.toLowerCase().includes(keyword)
        || record.name.toLowerCase().includes(keyword)
        || record.courseName.toLowerCase().includes(keyword);
      const matchesCapacity = capacityFilter === "all"
        || (capacityFilter === "available" && record.enrolledCount < record.capacity)
        || (capacityFilter === "full" && record.enrolledCount >= record.capacity);
      return matchesKeyword && matchesCapacity;
    });
  }, [capacityFilter, searchTerm]);

  const pagedRecords = records.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  const activeFilterCount = capacityFilter === "all" ? 0 : 1;

  return (
    <>
      <div className={listStyles.page}>
        <section className={listStyles.header}>
          <div>
            <h1>Danh sách lớp của tôi</h1>
            <p>Xem các lớp đang phụ trách, sĩ số và thời gian vận hành.</p>
          </div>
        </section>

        <section className={`${listStyles.toolbar} ${toolbarStyles.toolbar}`} aria-label="Bộ lọc lớp của tôi">
          <label className={listStyles.searchBox}>
            <Search aria-hidden="true" size={18} />
            <input
              placeholder="Tìm theo mã lớp, tên lớp hoặc khóa học"
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
                setDraftCapacityFilter(capacityFilter);
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
                    <th key={column}>{labels[column]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRecords.map((record) => (
                  <tr key={record.id}>
                    {visibleColumns.code && <td><strong>{record.code}</strong></td>}
                    {visibleColumns.name && <td>{record.name}</td>}
                    {visibleColumns.capacity && <td>{record.enrolledCount}/{record.capacity}</td>}
                    {visibleColumns.startDate && <td>{formatDate(record.startDate)}</td>}
                    {visibleColumns.endDate && <td>{formatDate(record.endDate)}</td>}
                    {visibleColumns.actions && (
                      <td>
                        <div className={listStyles.actions}>
                          <Link aria-label={`Xem ${record.name}`} title="Xem chi tiết" to={`/admin/my-classes/${record.id}/view`}>
                            <Eye aria-hidden="true" size={16} />
                          </Link>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {records.length === 0 && (
              <div className={listStyles.emptyState}>Không có lớp phù hợp với bộ lọc hiện tại.</div>
            )}
          </div>

          <Pagination
            pageNumber={pageNumber}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            totalItems={records.length}
            onPageChange={setPageNumber}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPageNumber(1);
            }}
          />
        </section>
      </div>

      <SidePanel
        description="Lọc danh sách lớp theo tình trạng sĩ số."
        footer={
          <div className={toolbarStyles.panelActions}>
            <button type="button" onClick={() => { setDraftCapacityFilter("all"); setCapacityFilter("all"); setPageNumber(1); }}>
              Xóa bộ lọc
            </button>
            <button type="button" onClick={() => { setCapacityFilter(draftCapacityFilter); setPageNumber(1); setIsFilterPanelOpen(false); }}>
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
            <span>Sĩ số</span>
            <select value={draftCapacityFilter} onChange={(event) => setDraftCapacityFilter(event.target.value as CapacityFilter)}>
              <option value="all">Tất cả</option>
              <option value="available">Còn chỗ</option>
              <option value="full">Đã đủ sĩ số</option>
            </select>
          </label>
        </div>
      </SidePanel>
    </>
  );
}
