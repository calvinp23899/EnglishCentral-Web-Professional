import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Edit3, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination } from "@/components/ui";

import styles from "./AdminCrudPage.module.scss";

export type CrudRecord = Record<string, string | number>;

export type CrudColumn = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (record: CrudRecord) => string;
};

type StatusOption = {
  label: string;
  value: string;
};

type Props = {
  columns: CrudColumn[];
  createPath: string;
  dateKey: string;
  description: string;
  editPath: (record: CrudRecord) => string;
  initialRecords: CrudRecord[];
  searchKeys: string[];
  statusOptions: StatusOption[];
  title: string;
};

type SortDirection = "asc" | "desc";

const formatDate = (value: string | number) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(String(value)));

export function AdminCrudListPage({
  columns,
  createPath,
  dateKey,
  description,
  editPath,
  initialRecords,
  searchKeys,
  statusOptions,
  title,
}: Props) {
  const firstSortableColumn = columns.find((column) => column.sortable);
  const [records, setRecords] = useState(initialRecords);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState(firstSortableColumn?.key ?? columns[0].key);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingRecord, setDeletingRecord] = useState<CrudRecord | null>(null);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return records
      .filter((record) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          searchKeys
            .map((key) => String(record[key] ?? ""))
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);
        const matchesStatus =
          statusFilter === "all" || String(record.status) === statusFilter;
        const recordDate = String(record[dateKey] ?? "");
        const matchesFrom = dateFrom.length === 0 || recordDate >= dateFrom;
        const matchesTo = dateTo.length === 0 || recordDate <= dateTo;

        return matchesSearch && matchesStatus && matchesFrom && matchesTo;
      })
      .sort((firstRecord, secondRecord) => {
        const result = String(firstRecord[sortKey] ?? "").localeCompare(
          String(secondRecord[sortKey] ?? ""),
          "vi",
          { numeric: true },
        );

        return sortDirection === "asc" ? result : -result;
      });
  }, [dateFrom, dateKey, dateTo, records, searchKeys, searchTerm, sortDirection, sortKey, statusFilter]);

  const pagedRecords = filteredRecords.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize,
  );

  const handleSort = (nextSortKey: string) => {
    setPageNumber(1);
    setSortKey(nextSortKey);
    setSortDirection((currentDirection) =>
      sortKey === nextSortKey && currentDirection === "asc" ? "desc" : "asc",
    );
  };

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) {
      return null;
    }

    return sortDirection === "asc" ? (
      <ArrowUp aria-hidden="true" size={14} />
    ) : (
      <ArrowDown aria-hidden="true" size={14} />
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingRecord) {
      return;
    }

    setRecords((currentRecords) =>
      currentRecords.filter((record) => record.id !== deletingRecord.id),
    );
    setDeletingRecord(null);
  };

  return (
    <>
      <div className={styles.page}>
        <section className={styles.header}>
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          <Link className={styles.createButton} to={createPath}>
            <Plus aria-hidden="true" size={18} />
            Tạo mới
          </Link>
        </section>

        <section className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search aria-hidden="true" size={18} />
            <input
              placeholder="Tìm kiếm"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPageNumber(1);
              }}
            />
          </label>

          <label className={styles.filterControl}>
            <span>Trạng thái</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPageNumber(1);
              }}
            >
              <option value="all">Tất cả</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterControl}>
            <span>Từ ngày</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPageNumber(1);
              }}
            />
          </label>

          <label className={styles.filterControl}>
            <span>Đến ngày</span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPageNumber(1);
              }}
            />
          </label>
        </section>

        <section className={styles.tablePanel}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key}>
                      {column.sortable ? (
                        <button type="button" onClick={() => handleSort(column.key)}>
                          {column.label} {renderSortIcon(column.key)}
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pagedRecords.map((record) => (
                  <tr key={record.id}>
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.key === "status" ? (
                          <span className={styles.statusBadge}>
                            {column.render?.(record) ?? record[column.key]}
                          </span>
                        ) : column.key === dateKey ? (
                          formatDate(record[column.key])
                        ) : column.key === columns[0].key ? (
                          <strong>{column.render?.(record) ?? record[column.key]}</strong>
                        ) : (
                          column.render?.(record) ?? record[column.key]
                        )}
                      </td>
                    ))}
                    <td>
                      <div className={styles.actions}>
                        <Link to={editPath(record)} aria-label="Sửa">
                          <Edit3 aria-hidden="true" size={16} />
                        </Link>
                        <button
                          className={styles.deleteAction}
                          type="button"
                          aria-label="Xóa"
                          onClick={() => setDeletingRecord(record)}
                        >
                          <Trash2 aria-hidden="true" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagedRecords.length === 0 && (
              <div className={styles.emptyState}>Không có dữ liệu phù hợp.</div>
            )}
          </div>

          <Pagination
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalItems={filteredRecords.length}
            onPageChange={setPageNumber}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPageNumber(1);
            }}
          />
        </section>
      </div>

      <ConfirmModal
        cancelText="Hủy"
        confirmText="Xóa"
        description="Bạn có chắc muốn xóa record này? Hành động này không thể hoàn tác."
        isOpen={Boolean(deletingRecord)}
        title="Xác nhận xóa record"
        tone="danger"
        onCancel={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
