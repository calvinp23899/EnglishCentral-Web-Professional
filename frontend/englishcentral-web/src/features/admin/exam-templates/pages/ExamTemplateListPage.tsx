import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, toastDanger, toastSuccess } from "@/components/ui";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";
import {
  adminExamTemplatesApi,
  type AdminExamTemplate,
  type AdminExamType,
} from "../api/admin-exam-templates-api";
import styles from "@/features/admin/students/pages/StudentListPage.module.scss";

const statusClassName = (isActive: boolean) =>
  `${styles.statusBadge} ${isActive ? styles.active : styles.inactive}`;

export function ExamTemplateListPage() {
  const [records, setRecords] = useState<AdminExamTemplate[]>([]);
  const [examTypes, setExamTypes] = useState<AdminExamType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [deletingRecord, setDeletingRecord] = useState<AdminExamTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const examTypeById = useMemo(
    () => new Map(examTypes.map((type) => [type.id, type])),
    [examTypes],
  );

  useEffect(() => {
    adminExamTemplatesApi
      .getTypes({ pageSize: 100 })
      .then((result) => setExamTypes(result.items))
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await adminExamTemplatesApi.getList({
          page: pageNumber,
          pageSize,
          keyword: searchTerm.trim() || undefined,
          isDescending: true,
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
  }, [pageNumber, pageSize, refreshVersion, searchTerm]);

  const handleDelete = async () => {
    if (!deletingRecord || isDeleting) return;
    setIsDeleting(true);
    try {
      await adminExamTemplatesApi.delete(deletingRecord.id);
      toastSuccess("Xóa mẫu đề kiểm tra thành công.");
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
            <h1>Mẫu Đề Kiểm Tra</h1>
            <p>Quản lý Exam Templates, loại đề, thời lượng, điểm số và version hiện tại.</p>
          </div>
          <Link className={styles.createButton} to="/admin/exams/create">
            <Plus aria-hidden="true" size={18} />
            Tạo mới
          </Link>
        </section>

        <section className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search aria-hidden="true" size={18} />
            <input
              placeholder="Tìm theo code hoặc tên mẫu đề"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
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
                  <th>Code</th>
                  <th>Name</th>
                  <th>Exam Type</th>
                  <th>Status</th>
                  <th>Current Version</th>
                  <th>Active</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const examType = examTypeById.get(record.examTypeId);

                  return (
                    <tr key={record.id}>
                      <td><strong>{record.code}</strong></td>
                      <td>{record.name}</td>
                      <td>{examType?.name ?? examType?.code ?? record.examTypeId}</td>
                      <td>{String(record.status)}</td>
                      <td>{record.currentVersionId ?? "-"}</td>
                      <td>
                        <span className={statusClassName(record.isActive)}>
                          {record.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Link
                            aria-label="Chỉnh sửa"
                            title="Chỉnh sửa"
                            to={`/admin/exams/${record.id}/edit`}
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
                  );
                })}
              </tbody>
            </table>
            {records.length === 0 && <div className={styles.emptyState}>Không có mẫu đề kiểm tra phù hợp.</div>}
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
        description={deletingRecord ? `Bạn có chắc muốn xóa mẫu đề ${deletingRecord.code}?` : ""}
        isConfirmDisabled={isDeleting}
        isOpen={Boolean(deletingRecord)}
        title="Xác nhận xóa mẫu đề"
        tone="danger"
        onCancel={() => setDeletingRecord(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
