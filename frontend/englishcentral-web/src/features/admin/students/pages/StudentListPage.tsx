import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, toastDanger } from "@/components/ui";
import {
  statusLabels,
  statusToneByValue,
  students,
  type Student,
  type StudentStatus,
} from "@/features/admin/students/data/mockStudents";

import styles from "./StudentListPage.module.scss";

type SortKey = keyof Pick<
  Student,
  "studentCode" | "fullName" | "email" | "phoneNumber" | "registeredAt" | "status"
>;

type SortDirection = "asc" | "desc";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export function StudentListPage() {
  const [studentRecords, setStudentRecords] = useState(students);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">("all");
  const [registeredFrom, setRegisteredFrom] = useState("");
  const [registeredTo, setRegisteredTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("registeredAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return studentRecords
      .filter((student) => {
        const matchesSearch =
          normalizedSearchTerm.length === 0 ||
          [
            student.studentCode,
            student.fullName,
            student.email,
            student.phoneNumber,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearchTerm);
        const matchesStatus =
          statusFilter === "all" || student.status === statusFilter;
        const matchesFrom =
          registeredFrom.length === 0 ||
          student.registeredAt >= registeredFrom;
        const matchesTo =
          registeredTo.length === 0 || student.registeredAt <= registeredTo;

        return matchesSearch && matchesStatus && matchesFrom && matchesTo;
      })
      .sort((firstStudent, secondStudent) => {
        const firstValue =
          sortKey === "status"
            ? statusLabels[firstStudent.status]
            : String(firstStudent[sortKey]);
        const secondValue =
          sortKey === "status"
            ? statusLabels[secondStudent.status]
            : String(secondStudent[sortKey]);
        const result = firstValue.localeCompare(secondValue, "vi");

        return sortDirection === "asc" ? result : -result;
      });
  }, [
    registeredFrom,
    registeredTo,
    searchTerm,
    sortDirection,
    sortKey,
    statusFilter,
    studentRecords,
  ]);

  const pagedStudents = filteredStudents.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize,
  );

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

  const handleConfirmDelete = () => {
    if (!deletingStudent) {
      return;
    }

    setStudentRecords((currentRecords) =>
      currentRecords.filter((student) => student.id !== deletingStudent.id),
    );
    toastDanger(`Đã xóa học viên ${deletingStudent.fullName}.`);
    setDeletingStudent(null);
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
            onChange={(event) => {
              const value = event.target.value;

              setStatusFilter(value === "all" ? "all" : (Number(value) as StudentStatus));
              setPageNumber(1);
            }}
          >
            <option value="all">Tất cả</option>
            <option value={1}>Đang học</option>
            <option value={2}>Chờ tư vấn</option>
            <option value={3}>Tạm dừng</option>
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
              {pagedStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <strong>{student.studentCode}</strong>
                  </td>
                  <td>{student.fullName}</td>
                  <td>{student.email}</td>
                  <td>{student.phoneNumber}</td>
                  <td>{formatDate(student.registeredAt)}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[statusToneByValue[student.status]]
                      }`}
                    >
                      {statusLabels[student.status]}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link to={`/admin/students/${student.id}/edit`} aria-label={`Sửa ${student.fullName}`}>
                        <Edit3 aria-hidden="true" size={16} />
                      </Link>
                      <button
                        className={styles.deleteAction}
                        type="button"
                        aria-label={`Xóa ${student.fullName}`}
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

          {pagedStudents.length === 0 && (
            <div className={styles.emptyState}>
              Không có học viên phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>

        <Pagination
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalItems={filteredStudents.length}
          onPageChange={setPageNumber}
          onPageSizeChange={handlePageSizeChange}
        />
      </section>
      </div>

      <ConfirmModal
        cancelText="Hủy"
        confirmText="Xóa"
        description={
          deletingStudent
            ? `Bạn có chắc muốn xóa học viên ${deletingStudent.fullName}? Hành động này không thể hoàn tác.`
            : ""
        }
        isOpen={Boolean(deletingStudent)}
        title="Xác nhận xóa record"
        tone="danger"
        onCancel={() => setDeletingStudent(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
