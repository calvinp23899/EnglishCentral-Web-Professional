import { useEffect, useState } from "react";
import { Edit3, Eye, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, toastDanger, toastSuccess } from "@/components/ui";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import {
  adminExamTypesApi,
  type AdminExamType,
} from "../api/admin-exam-types-api";
import styles from "@/features/admin/students/pages/StudentListPage.module.scss";

const statusClassName = (isActive: boolean) =>
  `${styles.statusBadge} ${isActive ? styles.active : styles.inactive}`;

const activeFilterOptions = [
  { label: "Tất cả", value: "" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export function ExamTypeListPage() {
  const [records, setRecords] = useState<AdminExamType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [deletingRecord, setDeletingRecord] = useState<AdminExamType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await adminExamTypesApi.getList({
          page: pageNumber,
          pageSize,
          keyword: searchTerm.trim() || undefined,
          isActive: activeFilter === "" ? undefined : activeFilter === "true",
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
  }, [activeFilter, pageNumber, pageSize, refreshVersion, searchTerm]);

  const handleDelete = async () => {
    if (!deletingRecord || isDeleting) return;

    setIsDeleting(true);
    try {
      await adminExamTypesApi.delete(deletingRecord.id);
      toastSuccess("Xóa dạng bài kiểm tra thành công.");
      setDeletingRecord(null);
      setRefreshVersion((current) => current + 1);
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
            <h1>Dạng Bài Kiểm Tra</h1>
            <p>Quản lý Exam Types dùng để phân loại IELTS, TOEIC và các dạng bài kiểm tra trong hệ thống.</p>
          </div>
          <Link className={styles.createButton} to="/admin/exam-types/create">
            <Plus aria-hidden="true" size={18} />
            Tạo mới
          </Link>
        </section>

        <section className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search aria-hidden="true" size={18} />
            <input
              placeholder="Tìm theo code, name hoặc family"
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
              value={activeFilter}
              onChange={(event) => {
                setActiveFilter(event.target.value);
                setPageNumber(1);
              }}
            >
              {activeFilterOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className={styles.tablePanel}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Family</th>
                  <th>Trạng thái</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td><strong>{record.code}</strong></td>
                    <td>{record.name}</td>
                    <td>{String(record.family)}</td>
                    <td>
                      <span className={statusClassName(record.isActive)}>
                        {record.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          aria-label="Xem chi tiết"
                          title="Xem chi tiết"
                          to={`/admin/exam-types/${record.id}/view`}
                        >
                          <Eye aria-hidden="true" size={16} />
                        </Link>
                        <Link
                          aria-label="Chỉnh sửa"
                          title="Chỉnh sửa"
                          to={`/admin/exam-types/${record.id}/edit`}
                        >
                          <Edit3 aria-hidden="true" size={16} />
                        </Link>
                        <button
                          aria-label="Xóa"
                          className={styles.deleteAction}
                          title="Xóa"
                          type="button"
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
            {records.length === 0 && (
              <div className={styles.emptyState}>Không có dạng bài kiểm tra phù hợp.</div>
            )}
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
        confirmText={isDeleting ? "Đang xóa..." : "Xóa"}
        description={
          deletingRecord
            ? `Bạn có chắc muốn xóa dạng bài kiểm tra ${deletingRecord.code}?`
            : ""
        }
        isConfirmDisabled={isDeleting}
        isOpen={Boolean(deletingRecord)}
        title="Xác nhận xóa dạng bài kiểm tra"
        tone="danger"
        onCancel={() => setDeletingRecord(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
