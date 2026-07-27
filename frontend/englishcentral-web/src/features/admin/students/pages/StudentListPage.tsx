import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Columns3,
  Download,
  Edit3,
  Eye,
  Funnel,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";

import {
  ConfirmModal,
  Pagination,
  SidePanel,
  toastDanger,
  toastSuccess,
  toastWarning,
} from "@/components/ui";
import {
  adminMetadataApi,
  type MetadataOption,
} from "@/features/admin/shared/api/admin-metadata-api";
import {
  adminStudentsApi,
  type AdminStudent,
  type StudentStatus,
} from "@/features/admin/students/api/admin-students-api";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import styles from "./StudentListPage.module.scss";
import teacherStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";

type SortKey = keyof Pick<
  AdminStudent,
  "studentCode" | "fullName" | "email" | "phoneNumber" | "registeredAt" | "status"
>;

type SortDirection = "asc" | "desc";
type ColumnKey = SortKey;
type StudentFilters = {
  status: StudentStatus | "all";
  registeredFrom: string;
  registeredTo: string;
};

const emptyFilters: StudentFilters = {
  status: "all",
  registeredFrom: "",
  registeredTo: "",
};

const columnLabels: Record<ColumnKey, string> = {
  studentCode: "Mã học sinh",
  fullName: "Họ tên",
  email: "Email",
  phoneNumber: "SĐT",
  registeredAt: "Ngày đăng ký",
  status: "Trạng thái",
};

const initialVisibleColumns: Record<ColumnKey, boolean> = {
  studentCode: false,
  fullName: true,
  email: true,
  phoneNumber: true,
  registeredAt: true,
  status: true,
};

const tableColumns: SortKey[] = [
  "studentCode",
  "fullName",
  "email",
  "phoneNumber",
  "registeredAt",
  "status",
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const statusToneByValue: Record<string, "active" | "pending" | "inactive"> = {
  Active: "active",
  Inactive: "inactive",
};

const sortByApiField: Record<SortKey, string> = {
  email: "email",
  fullName: "fullName",
  phoneNumber: "phoneNumber",
  registeredAt: "enrollmentDate",
  status: "status",
  studentCode: "studentCode",
};

const truncateText = (value?: string | null) => {
  const text = value ?? "Chưa cập nhật";
  const characters = Array.from(text);

  return characters.length > 22 ? `${characters.slice(0, 22).join("")}...` : text;
};

export function StudentListPage() {
  const [studentRecords, setStudentRecords] = useState<AdminStudent[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<StudentFilters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<StudentFilters>(emptyFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [sortKey, setSortKey] = useState<SortKey>("registeredAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingStudent, setDeletingStudent] = useState<AdminStudent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusOptions, setStatusOptions] = useState<MetadataOption[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const shouldShowTableSkeleton = isLoading && studentRecords.length === 0;

  const visibleStudents = useMemo(() => {
    return studentRecords.filter((student) => {
      const matchesFrom =
        filters.registeredFrom.length === 0 ||
        student.registeredAt >= filters.registeredFrom;
      const matchesTo =
        filters.registeredTo.length === 0 ||
        student.registeredAt <= filters.registeredTo;

      return matchesFrom && matchesTo;
    });
  }, [filters.registeredFrom, filters.registeredTo, studentRecords]);

  useEffect(() => {
    let isMounted = true;

    const loadStatusOptions = async () => {
      setIsLoadingStatuses(true);

      try {
        const options = await adminMetadataApi.getStatusOptions();

        if (isMounted) {
          setStatusOptions(options);
        }
      } catch (error) {
        if (isMounted) {
          toastDanger(getAuthErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoadingStatuses(false);
        }
      }
    };

    loadStatusOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const result = await adminStudentsApi.getList({
          page: pageNumber,
          pageSize,
          keyword: searchTerm.trim(),
          sortBy: sortByApiField[sortKey],
          isDescending: sortDirection === "desc",
          status: filters.status === "all" ? undefined : filters.status,
          enrollmentDate:
            filters.registeredFrom && filters.registeredFrom === filters.registeredTo
              ? filters.registeredFrom
              : undefined,
        });

        setStudentRecords(result.items);
        setTotalItems(result.totalItems);
      } catch (error) {
        toastDanger(getAuthErrorMessage(error));
        setStudentRecords([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [
    filters,
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

  const handleApplyFilters = () => {
    if (
      draftFilters.registeredFrom &&
      draftFilters.registeredTo &&
      draftFilters.registeredFrom > draftFilters.registeredTo
    ) {
      toastDanger("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }

    setFilters(draftFilters);
    setPageNumber(1);
    setIsFilterPanelOpen(false);
  };

  const handleClearFilters = () => {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setPageNumber(1);
  };

  const activeFilterCount = Object.values(filters).filter(
    (value) => value && value !== "all",
  ).length;

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPageNumber(1);
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
    setVisibleColumns((current) => ({ ...current, [column]: !current[column] }));
  };

  const handleConfirmDelete = async () => {
    if (!deletingStudent || isDeleting) {
      return;
    }

    if (!deletingStudent.id) {
      toastDanger("Không tìm thấy mã học viên cần xóa.");
      return;
    }

    setIsDeleting(true);

    try {
      await adminStudentsApi.delete(deletingStudent.id);
      toastSuccess("Xóa học viên thành công.");
      setDeletingStudent(null);

      if (visibleStudents.length === 1 && pageNumber > 1) {
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
      <div className={styles.page}>
        <section className={styles.header}>
          <div>
            <h1>Danh sách học viên</h1>
            <p>
              Quản lý thông tin học viên, trạng thái đăng ký và thao tác nhanh cho
              đội ngũ tư vấn.
            </p>
          </div>

          <Link className={styles.createButton} to="/admin/students/create">
            <Plus aria-hidden="true" size={18} />
            Tạo mới
          </Link>
        </section>

        <section className={`${styles.toolbar} ${teacherStyles.toolbar}`} aria-label="Bộ lọc học viên">
          <label className={styles.searchBox}>
            <Search aria-hidden="true" size={18} />
            <input
              placeholder="Tìm theo mã, họ tên, email, SĐT"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPageNumber(1);
              }}
            />
          </label>

          <div className={teacherStyles.toolbarActions}>
            <div className={teacherStyles.menuWrap}>
              <button
                aria-expanded={isDownloadMenuOpen}
                aria-label="Download"
                className={teacherStyles.iconButton}
                type="button"
                onClick={() => {
                  setIsDownloadMenuOpen((current) => !current);
                  setIsColumnsMenuOpen(false);
                }}
              >
                <Download aria-hidden="true" size={18} />
              </button>
              {isDownloadMenuOpen && (
                <div className={teacherStyles.dropdownMenu}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDownloadMenuOpen(false);
                      toastWarning("Chức năng xuất XLSX chưa được tích hợp.");
                    }}
                  >
                    XLSX
                  </button>
                </div>
              )}
            </div>

            <button
              className={teacherStyles.filterButton}
              type="button"
              onClick={() => {
                setDraftFilters(filters);
                setIsFilterPanelOpen(true);
                setIsDownloadMenuOpen(false);
                setIsColumnsMenuOpen(false);
              }}
            >
              <Funnel aria-hidden="true" size={17} />
              Filter
              {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
            </button>

            <div className={teacherStyles.menuWrap}>
              <button
                aria-expanded={isColumnsMenuOpen}
                className={teacherStyles.columnsButton}
                type="button"
                onClick={() => {
                  setIsColumnsMenuOpen((current) => !current);
                  setIsDownloadMenuOpen(false);
                }}
              >
                <Columns3 aria-hidden="true" size={17} />
                Columns
              </button>
              {isColumnsMenuOpen && (
                <div className={`${teacherStyles.dropdownMenu} ${teacherStyles.columnsMenu}`}>
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

        <section className={styles.tablePanel}>
          <div className={styles.tableScroll}>
            <table className={`${styles.table} ${teacherStyles.table}`}>
              <thead>
                <tr>
                  {tableColumns.filter((column) => visibleColumns[column]).map((column) => (
                    <th key={column}>
                      <button type="button" onClick={() => handleSort(column)}>
                        {columnLabels[column]} {renderSortIcon(column)}
                      </button>
                    </th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shouldShowTableSkeleton &&
                  Array.from({ length: pageSize }).map((_, index) => (
                    <tr key={`student-skeleton-${index}`}>
                      {tableColumns.filter((column) => visibleColumns[column]).map((column) => (
                        <td key={column}>
                          <Skeleton
                            borderRadius={column === "status" ? 999 : 4}
                            height={column === "status" ? 28 : 18}
                            width={column === "status" ? 92 : 120}
                          />
                        </td>
                      ))}
                      <td>
                        <div className={styles.actions}>
                          <Skeleton borderRadius={8} height={34} width={34} />
                          <Skeleton borderRadius={8} height={34} width={34} />
                          <Skeleton borderRadius={8} height={34} width={34} />
                        </div>
                      </td>
                    </tr>
                  ))}

                {visibleStudents.map((student) => (
                  <tr key={student.id}>
                    {visibleColumns.studentCode && (
                      <td>
                        <strong className={teacherStyles.ellipsis} title={student.studentCode}>
                          {truncateText(student.studentCode)}
                        </strong>
                      </td>
                    )}
                    {visibleColumns.fullName && (
                      <td>
                        <span className={teacherStyles.ellipsis} title={student.fullName}>
                          {truncateText(student.fullName)}
                        </span>
                      </td>
                    )}
                    {visibleColumns.email && (
                      <td>
                        <span className={teacherStyles.ellipsis} title={student.email ?? "Chưa cập nhật"}>
                          {truncateText(student.email)}
                        </span>
                      </td>
                    )}
                    {visibleColumns.phoneNumber && (
                      <td>
                        <span className={teacherStyles.ellipsis} title={student.phoneNumber ?? "Chưa cập nhật"}>
                          {truncateText(student.phoneNumber)}
                        </span>
                      </td>
                    )}
                    {visibleColumns.registeredAt && (
                      <td>{student.registeredAt ? formatDate(student.registeredAt) : "Chưa cập nhật"}</td>
                    )}
                    {visibleColumns.status && (
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[statusToneByValue[student.status] ?? "pending"]
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                    )}
                    <td>
                      <div className={styles.actions}>
                          <Link
                            aria-label={`Xem ${student.fullName}`}
                            title="Xem chi tiết"
                            to={`/admin/students/${student.id}/view`}
                          >
                            <Eye aria-hidden="true" size={16} />
                          </Link>
                          <Link
                            aria-label={`Sửa ${student.fullName}`}
                            title="Chỉnh sửa"
                            to={`/admin/students/${student.id}/edit`}
                          >
                            <Edit3 aria-hidden="true" size={16} />
                          </Link>
                          <button
                            aria-label={`Xóa ${student.fullName}`}
                            className={styles.deleteAction}
                            title="Xóa"
                            type="button"
                            onClick={() => setDeletingStudent(student)}
                          >
                            <Trash2 aria-hidden="true" size={16} />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoading && visibleStudents.length === 0 && (
              <div className={styles.emptyState}>
                Không có học viên phù hợp với bộ lọc hiện tại.
              </div>
            )}
          </div>

          <Pagination
            pageNumber={pageNumber}
            pageSize={pageSize}
            pageSizeOptions={[10, 20]}
            totalItems={totalItems}
            onPageChange={setPageNumber}
            onPageSizeChange={handlePageSizeChange}
          />
        </section>
      </div>

      <SidePanel
        description="Lọc danh sách học viên theo trạng thái và thời gian đăng ký."
        footer={
          <div className={teacherStyles.panelActions}>
            <button type="button" onClick={handleClearFilters}>
              Xóa bộ lọc
            </button>
            <button type="button" onClick={handleApplyFilters}>
              Áp dụng
            </button>
          </div>
        }
        isOpen={isFilterPanelOpen}
        title="Bộ lọc"
        onClose={() => setIsFilterPanelOpen(false)}
      >
        <div className={teacherStyles.panelForm}>
          <label>
            <span>Trạng thái</span>
            <select
              disabled={isLoadingStatuses}
              value={draftFilters.status}
              onChange={(event) => {
                const value = event.target.value;

                setDraftFilters((current) => ({
                  ...current,
                  status: value === "all" ? "all" : (value as StudentStatus),
                }));
              }}
            >
              <option value="all">Tất cả</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend>Khoảng thời gian đăng ký</legend>
            <label>
              <span>Từ ngày</span>
              <input
                type="date"
                value={draftFilters.registeredFrom}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    registeredFrom: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              <span>Đến ngày</span>
              <input
                type="date"
                value={draftFilters.registeredTo}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    registeredTo: event.target.value,
                  }))
                }
              />
            </label>
          </fieldset>
        </div>
      </SidePanel>

      <ConfirmModal
        cancelText="Hủy"
        confirmText={isDeleting ? "Đang xóa..." : "Xóa"}
        description={
          deletingStudent
            ? `Bạn có chắc muốn xóa học viên ${deletingStudent.fullName}? Hành động này không thể hoàn tác.`
            : ""
        }
        isConfirmDisabled={isDeleting}
        isOpen={Boolean(deletingStudent)}
        title="Xác nhận xóa học viên"
        tone="danger"
        onCancel={() => {
          if (!isDeleting) {
            setDeletingStudent(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
