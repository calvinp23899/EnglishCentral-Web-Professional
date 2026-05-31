import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Edit3, Eye, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, toastDanger, toastSuccess } from "@/components/ui";
import {
  adminMetadataApi,
  type MetadataOption,
} from "@/features/admin/shared/api/admin-metadata-api";
import {
  adminTeachersApi,
  type AdminTeacher,
} from "@/features/admin/teachers/api/admin-teachers-api";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import styles from "@/features/admin/students/pages/StudentListPage.module.scss";

type SortKey = "teacherCode" | "fullName" | "email" | "phoneNumber" | "specialization" | "hireDate" | "status";
type SortDirection = "asc" | "desc";

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(value))
    : "Chưa cập nhật";

const getStatusLabel = (status: AdminTeacher["status"], options: MetadataOption[]) =>
  options.find((option) => option.code === Number(status) || option.value === String(status))
    ?.label ?? String(status);

const getStatusTone = (status: AdminTeacher["status"]) => {
  if (Number(status) === 1 || status === "Active") {
    return "active";
  }

  if (Number(status) === 2 || status === "Inactive") {
    return "inactive";
  }

  return "pending";
};

export function TeacherListPage() {
  const [records, setRecords] = useState<AdminTeacher[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hireDate, setHireDate] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("hireDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusOptions, setStatusOptions] = useState<MetadataOption[]>([]);
  const [deletingTeacher, setDeletingTeacher] = useState<AdminTeacher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    adminMetadataApi
      .getTeacherStatusOptions()
      .then(setStatusOptions)
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await adminTeachersApi.getList({
          page: pageNumber,
          pageSize,
          keyword: searchTerm.trim(),
          sortBy: sortKey,
          isDescending: sortDirection === "desc",
          status: statusFilter === "all" ? undefined : statusFilter,
          hireDate: hireDate || undefined,
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
  }, [hireDate, pageNumber, pageSize, refreshVersion, searchTerm, sortDirection, sortKey, statusFilter]);

  const handleSort = (nextSortKey: SortKey) => {
    setPageNumber(1);
    setSortKey(nextSortKey);
    setSortDirection((current) =>
      sortKey === nextSortKey && current === "asc" ? "desc" : "asc",
    );
  };

  const renderSortIcon = (key: SortKey) =>
    sortKey === key
      ? sortDirection === "asc"
        ? <ArrowUp aria-hidden="true" size={14} />
        : <ArrowDown aria-hidden="true" size={14} />
      : null;

  const handleConfirmDelete = async () => {
    if (!deletingTeacher || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await adminTeachersApi.delete(deletingTeacher.id);
      toastSuccess("Xóa giáo viên thành công.");
      setDeletingTeacher(null);
      setRefreshVersion((current) => current + 1);
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Array<{ key: SortKey; label: string }> = [
    { key: "teacherCode", label: "Mã giáo viên" },
    { key: "fullName", label: "Họ tên" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "SĐT" },
    { key: "specialization", label: "Chuyên môn" },
    { key: "hireDate", label: "Ngày vào" },
    { key: "status", label: "Trạng thái" },
  ];

  return (
    <>
      <div className={styles.page}>
        <section className={styles.header}>
          <div>
            <h1>Danh sách giáo viên</h1>
            <p>Quản lý hồ sơ giáo viên, chuyên môn, liên hệ và trạng thái giảng dạy.</p>
          </div>
          <Link className={styles.createButton} to="/admin/teachers/create">
            <Plus aria-hidden="true" size={18} />
            Tạo mới
          </Link>
        </section>

        <section className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search aria-hidden="true" size={18} />
            <input
              placeholder="Tìm theo mã, họ tên, email, SĐT, chuyên môn"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPageNumber(1);
              }}
            />
          </label>
          <label className={styles.filterControl}>
            <span>Trạng thái</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Tất cả</option>
              {statusOptions.map((option) => (
                <option key={option.code} value={option.code}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className={styles.filterControl}>
            <span>Ngày vào</span>
            <input type="date" value={hireDate} onChange={(event) => setHireDate(event.target.value)} />
          </label>
        </section>

        <section className={styles.tablePanel}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key}>
                      <button type="button" onClick={() => handleSort(column.key)}>
                        {column.label} {renderSortIcon(column.key)}
                      </button>
                    </th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((teacher) => (
                  <tr key={teacher.id}>
                    <td><strong>{teacher.teacherCode}</strong></td>
                    <td>{teacher.fullName}</td>
                    <td>{teacher.email ?? "Chưa cập nhật"}</td>
                    <td>{teacher.phoneNumber ?? "Chưa cập nhật"}</td>
                    <td>{teacher.specialization ?? "Chưa cập nhật"}</td>
                    <td>{formatDate(teacher.hireDate)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[getStatusTone(teacher.status)]}`}>
                        {getStatusLabel(teacher.status, statusOptions)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link to={`/admin/teachers/${teacher.id}/view`} aria-label="Xem"><Eye size={16} /></Link>
                        <Link to={`/admin/teachers/${teacher.id}/edit`} aria-label="Sửa"><Edit3 size={16} /></Link>
                        <button className={styles.deleteAction} type="button" aria-label="Xóa" onClick={() => setDeletingTeacher(teacher)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 && <div className={styles.emptyState}>Không có dữ liệu phù hợp.</div>}
          </div>
          <Pagination
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPageNumber}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPageNumber(1);
            }}
          />
        </section>
      </div>

      <ConfirmModal
        cancelText="Hủy"
        confirmText={isDeleting ? "Đang xóa..." : "Xóa"}
        description="Bạn có chắc muốn xóa giáo viên này? Hành động này không thể hoàn tác."
        isConfirmDisabled={isDeleting}
        isOpen={Boolean(deletingTeacher)}
        title="Xác nhận xóa giáo viên"
        tone="danger"
        onCancel={() => setDeletingTeacher(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
