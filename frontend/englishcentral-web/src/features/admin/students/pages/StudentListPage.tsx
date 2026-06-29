import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, toastDanger, toastSuccess } from "@/components/ui";
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

type SortKey = keyof Pick<
  AdminStudent,
  "studentCode" | "fullName" | "email" | "phoneNumber" | "registeredAt" | "status"
>;

type SortDirection = "asc" | "desc";

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

export function StudentListPage() {
  const [studentRecords, setStudentRecords] = useState<AdminStudent[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">("all");
  const [registeredFrom, setRegisteredFrom] = useState("");
  const [registeredTo, setRegisteredTo] = useState("");
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
    return studentRecords
      .filter((student) => {
        const matchesFrom =
          registeredFrom.length === 0 ||
          student.registeredAt >= registeredFrom;
        const matchesTo =
          registeredTo.length === 0 || student.registeredAt <= registeredTo;

        return matchesFrom && matchesTo;
      })
  }, [registeredFrom, registeredTo, studentRecords]);

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
          status: statusFilter === "all" ? undefined : statusFilter,
          enrollmentDate:
            registeredFrom && registeredFrom === registeredTo
              ? registeredFrom
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
    pageNumber,
    pageSize,
    registeredFrom,
    registeredTo,
    refreshVersion,
    searchTerm,
    sortDirection,
    sortKey,
    statusFilter,
  ]);

  const handleSort = (nextSortKey: SortKey) => {
    setPageNumber(1);
    setSortKey(nextSortKey);
    setSortDirection((currentDirection) =>
      sortKey === nextSortKey && currentDirection === "asc" ? "desc" : "asc",
    );
  };

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

  const handleConfirmDelete = async () => {
    if (!deletingStudent) {
      return;
    }

    if (isDeleting) {
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

      <section className={styles.toolbar} aria-label="Bộ lọc học viên">
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

        <label className={styles.filterControl}>
          <span>Trạng thái</span>
          <select
            value={statusFilter}
            disabled={isLoadingStatuses}
            onChange={(event) => {
              const value = event.target.value;

              setStatusFilter(value === "all" ? "all" : (value as StudentStatus));
              setPageNumber(1);
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

        <label className={styles.filterControl}>
          <span>Từ ngày</span>
          <input
            type="date"
            value={registeredFrom}
            onChange={(event) => {
              setRegisteredFrom(event.target.value);
              setPageNumber(1);
            }}
          />
        </label>

        <label className={styles.filterControl}>
          <span>Đến ngày</span>
          <input
            type="date"
            value={registeredTo}
            onChange={(event) => {
              setRegisteredTo(event.target.value);
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
                <th>
                  <button type="button" onClick={() => handleSort("studentCode")}>
                    Mã học sinh {renderSortIcon("studentCode")}
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => handleSort("fullName")}>
                    Họ tên {renderSortIcon("fullName")}
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => handleSort("email")}>
                    Email {renderSortIcon("email")}
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => handleSort("phoneNumber")}>
                    SĐT {renderSortIcon("phoneNumber")}
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => handleSort("registeredAt")}>
                    Ngày đăng ký {renderSortIcon("registeredAt")}
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => handleSort("status")}>
                    Trạng thái {renderSortIcon("status")}
                  </button>
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shouldShowTableSkeleton &&
                Array.from({ length: pageSize }).map((_, index) => (
                  <tr key={`student-skeleton-${index}`}>
                    <td>
                      <Skeleton height={18} width={96} />
                    </td>
                    <td>
                      <Skeleton height={18} width={150} />
                    </td>
                    <td>
                      <Skeleton height={18} width={210} />
                    </td>
                    <td>
                      <Skeleton height={18} width={120} />
                    </td>
                    <td>
                      <Skeleton height={18} width={96} />
                    </td>
                    <td>
                      <Skeleton borderRadius={999} height={28} width={92} />
                    </td>
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
                  <td>
                    <strong>{student.studentCode}</strong>
                  </td>
                  <td>{student.fullName}</td>
                  <td>{student.email ?? "Chưa cập nhật"}</td>
                  <td>{student.phoneNumber ?? "Chưa cập nhật"}</td>
                  <td>{student.registeredAt ? formatDate(student.registeredAt) : "Chưa cập nhật"}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[statusToneByValue[student.status] ?? "pending"]
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link
                        to={`/admin/students/${student.id}/view`}
                        aria-label={`Xem ${student.fullName}`}
                        title="Xem chi tiết"
                      >
                        <Eye aria-hidden="true" size={16} />
                      </Link>
                      <Link
                        to={`/admin/students/${student.id}/edit`}
                        aria-label={`Sửa ${student.fullName}`}
                        title="Chỉnh sửa"
                      >
                        <Edit3 aria-hidden="true" size={16} />
                      </Link>
                      <button
                        className={styles.deleteAction}
                        type="button"
                        aria-label={`Xóa ${student.fullName}`}
                        title="Xóa"
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
        title="Xác nhận xóa record"
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
