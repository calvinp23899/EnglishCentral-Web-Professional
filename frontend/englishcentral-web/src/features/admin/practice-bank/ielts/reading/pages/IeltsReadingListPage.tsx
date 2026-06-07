import { useEffect, useState } from "react";
import { Edit3, Eye, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, toastDanger, toastSuccess } from "@/components/ui";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import { adminIeltsReadingApi, type ExamTemplate } from "../api/admin-ielts-reading-api";
import styles from "@/features/admin/shared/components/AdminCrud/AdminCrudPage.module.scss";

const statusOptions = [
  { label: "Draft", value: "Draft" },
  { label: "Published", value: "Published" },
  { label: "Archived", value: "Archived" },
];

const getStatusClassName = (status: string | number) => {
  const normalizedStatus = String(status).toLowerCase();
  const tone =
    normalizedStatus === "published" || normalizedStatus === "2"
      ? styles.statusBadgePublished
      : normalizedStatus === "draft" || normalizedStatus === "1"
        ? styles.statusBadgeDraft
        : "";

  return `${styles.statusBadge} ${tone}`.trim();
};

export function IeltsReadingListPage() {
  const [examTypeId, setExamTypeId] = useState<number | null>(null);
  const [records, setRecords] = useState<ExamTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [deletingRecord, setDeletingRecord] = useState<ExamTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadRecords = async (nextExamTypeId = examTypeId) => {
    setIsLoading(true);
    try {
      const resolvedExamTypeId = nextExamTypeId ?? (await adminIeltsReadingApi.getReadingExamType())?.id ?? null;
      setExamTypeId(resolvedExamTypeId);
      if (!resolvedExamTypeId) {
        setRecords([]);
        setTotalItems(0);
        return;
      }

      const result = await adminIeltsReadingApi.getTemplates({
        page: pageNumber,
        pageSize,
        keyword: searchTerm.trim() || undefined,
        examTypeId: resolvedExamTypeId,
        status: statusFilter || undefined,
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
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRecords();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [pageNumber, pageSize, searchTerm, statusFilter]);

  const deleteRecord = async () => {
    if (!deletingRecord || isDeleting) return;
    setIsDeleting(true);
    try {
      await adminIeltsReadingApi.deleteTemplate(deletingRecord.id);
      toastSuccess("Đã xóa đề IELTS Reading.");
      setDeletingRecord(null);
      await loadRecords();
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
            <h1>IELTS Reading</h1>
            <p>Quản lý đề IELTS Reading, passages, question groups, answer key và trạng thái publish.</p>
          </div>

          <Link className={styles.createButton} to="/admin/practice-bank/ielts/reading/create">
            <Plus aria-hidden="true" size={18} />
            Tạo mới
          </Link>
        </section>

        <section className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search aria-hidden="true" size={18} />
            <input
              placeholder="Tìm theo mã đề hoặc tên đề"
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
              <option value="">Tất cả</option>
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </section>

        <section className={styles.tablePanel}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã đề</th>
                  <th>Tên đề</th>
                  <th>Thời lượng</th>
                  <th>Tổng điểm</th>
                  <th>Trạng thái</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td><strong>{record.code}</strong></td>
                    <td>{record.name}</td>
                    <td>{record.durationMinutes ?? 60} phút</td>
                    <td>{record.totalScore ?? 40}</td>
                    <td><span className={getStatusClassName(record.status)}>{String(record.status)}</span></td>
                    <td>
                      <div className={styles.actions}>
                        <Link to={`/admin/practice-bank/ielts/reading/${record.id}/view`} aria-label="Xem" title="Xem chi tiết">
                          <Eye aria-hidden="true" size={16} />
                        </Link>
                        <Link to={`/admin/practice-bank/ielts/reading/${record.id}/edit`} aria-label="Sửa" title="Chỉnh sửa">
                          <Edit3 aria-hidden="true" size={16} />
                        </Link>
                        <button className={styles.deleteAction} type="button" aria-label="Xóa" title="Xóa" onClick={() => setDeletingRecord(record)}>
                          <Trash2 aria-hidden="true" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoading && records.length === 0 && <div className={styles.emptyState}>Không có đề IELTS Reading phù hợp.</div>}
            {isLoading && <div className={styles.emptyState}>Đang tải danh sách IELTS Reading...</div>}
          </div>

          <Pagination
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalItems={totalItems}
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
        confirmText={isDeleting ? "Đang xóa..." : "Xóa"}
        description="Bạn có chắc muốn xóa đề IELTS Reading này? Template sẽ được BE chuyển sang trạng thái archived nếu đang có liên kết."
        isOpen={Boolean(deletingRecord)}
        title="Xác nhận xóa đề"
        tone="danger"
        onCancel={() => setDeletingRecord(null)}
        onConfirm={() => void deleteRecord()}
      />
    </>
  );
}
