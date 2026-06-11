import { useEffect, useMemo, useState } from "react";
import { Columns3, CopyPlus, Edit3, Eye, Funnel, Plus, Search, Send, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Pagination, toastDanger, toastSuccess } from "@/components/ui";
import crudStyles from "@/features/admin/shared/components/AdminCrud/AdminCrudPage.module.scss";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import teacherStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import {
  adminIeltsReadingApi,
  type ExamTemplate,
  type ExamVersion,
} from "../api/admin-ielts-reading-api";

const normalizeStatus = (status: string | number | null | undefined) =>
  String(status ?? "").replace(/[^a-z0-9]/gi, "").toLowerCase();

const isDraft = (status: string | number) => {
  const normalized = normalizeStatus(status);
  return normalized === "draft" || normalized === "1";
};

const isPublished = (status: string | number) => {
  const normalized = normalizeStatus(status);
  return normalized === "published" || normalized === "2";
};

const isArchived = (status: string | number) => {
  const normalized = normalizeStatus(status);
  return normalized === "archived" || normalized === "3";
};

const getStatusClassName = (status: string | number) => {
  if (isPublished(status)) {
    return `${crudStyles.statusBadge} ${crudStyles.statusBadgePublished}`;
  }
  if (isDraft(status)) {
    return `${crudStyles.statusBadge} ${crudStyles.statusBadgeDraft}`;
  }
  if (isArchived(status)) {
    return `${crudStyles.statusBadge} ${listStyles.inactive}`;
  }

  return crudStyles.statusBadge;
};

export function IeltsReadingListPage() {
  const navigate = useNavigate();
  const [template, setTemplate] = useState<ExamTemplate | null>(null);
  const [records, setRecords] = useState<ExamVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [cloningId, setCloningId] = useState<number | null>(null);

  const emptyMessage = useMemo(() => {
    if (isLoading) return "Đang tải danh sách IELTS Reading...";
    if (!template) {
      return "Chưa có template IELTS Reading để tạo đề. Hãy tạo ExamType IELTS ở Dạng Bài Kiểm Tra, sau đó tạo ExamTemplate IELTS Academic Reading ở Mẫu Đề Kiểm Tra.";
    }
    return "Không có đề IELTS Reading phù hợp.";
  }, [isLoading, template]);

  const loadRecords = async (nextTemplate = template) => {
    setIsLoading(true);
    try {
      const resolvedTemplate = nextTemplate ?? await adminIeltsReadingApi.getReadingTemplate();
      setTemplate(resolvedTemplate);

      if (!resolvedTemplate) {
        setRecords([]);
        setTotalItems(0);
        return;
      }

      const result = await adminIeltsReadingApi.getVersions({
        page: pageNumber,
        pageSize,
        keyword: searchTerm.trim() || undefined,
        examTemplateId: resolvedTemplate.id,
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
  }, [pageNumber, pageSize, searchTerm]);

  const publishVersion = async (record: ExamVersion) => {
    if (publishingId || !isDraft(record.status)) return;
    setPublishingId(record.id);
    try {
      await adminIeltsReadingApi.publishVersion(record.id);
      toastSuccess("Publish đề IELTS Reading thành công.");
      await loadRecords();
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setPublishingId(null);
    }
  };

  const cloneToDraft = async (record: ExamVersion) => {
    if (cloningId || isDraft(record.status)) return;
    setCloningId(record.id);
    try {
      const draftVersion = await adminIeltsReadingApi.cloneDraftVersion(record.id);
      toastSuccess("Đã clone đề sang draft mới.");
      navigate(`/admin/practice-bank/ielts/reading/${draftVersion.id}/edit`);
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setCloningId(null);
    }
  };

  const isCurrentVersion = (record: ExamVersion) => template?.currentVersionId === record.id;

  return (
    <div className={listStyles.page}>
      <section className={listStyles.header}>
        <div>
          <h1>IELTS Reading - Danh sách đề</h1>
          <p>
            Quản lý các version IELTS Reading. Draft được sửa trực tiếp, Published/Archived chỉ xem
            hoặc clone sang draft mới.
          </p>
        </div>

        <Link className={listStyles.createButton} to="/admin/practice-bank/ielts/reading/create">
          <Plus aria-hidden="true" size={18} />
          Tạo đề Reading
        </Link>
      </section>

      <section className={`${listStyles.toolbar} ${teacherStyles.toolbar}`}>
        <label className={listStyles.searchBox}>
          <Search aria-hidden="true" size={18} />
          <input
            placeholder="Tìm theo version code hoặc tên đề"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPageNumber(1);
            }}
          />
        </label>

        <div className={teacherStyles.toolbarActions}>
          <button className={teacherStyles.filterButton} type="button">
            <Funnel aria-hidden="true" size={18} />
            Filter
          </button>
          <button className={teacherStyles.columnsButton} type="button">
            <Columns3 aria-hidden="true" size={18} />
            Columns
          </button>
        </div>
      </section>

      <section className={listStyles.tablePanel}>
        <div className={listStyles.tableScroll}>
          <table className={listStyles.table}>
            <thead>
              <tr>
                <th>VersionCode</th>
                <th>Status</th>
                <th>Current</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.versionCode || "-"}</strong>
                  </td>
                  <td>
                    <span className={getStatusClassName(record.status)}>
                      {String(record.status)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        isCurrentVersion(record)
                          ? `${crudStyles.statusBadge} ${crudStyles.statusBadgePublished}`
                          : crudStyles.statusBadge
                      }
                    >
                      {isCurrentVersion(record) ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <div className={listStyles.actions}>
                      {isDraft(record.status) ? (
                        <>
                          <Link
                            aria-label="Chỉnh sửa draft"
                            title="Chỉnh sửa draft"
                            to={`/admin/practice-bank/ielts/reading/${record.id}/edit`}
                          >
                            <Edit3 aria-hidden="true" size={16} />
                          </Link>
                          <button
                            aria-label="Publish"
                            disabled={publishingId === record.id}
                            title="Publish"
                            type="button"
                            onClick={() => void publishVersion(record)}
                          >
                            <Send aria-hidden="true" size={16} />
                          </button>
                          <Link
                            aria-label="Preview"
                            title="Preview"
                            to={`/admin/practice-bank/ielts/reading/${record.id}/view`}
                          >
                            <Sparkles aria-hidden="true" size={16} />
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            aria-label="Xem chi tiết"
                            title="Xem chi tiết"
                            to={`/admin/practice-bank/ielts/reading/${record.id}/view`}
                          >
                            <Eye aria-hidden="true" size={16} />
                          </Link>
                          {!isArchived(record.status) && (
                            <Link
                              aria-label="Preview"
                              title="Preview"
                              to={`/admin/practice-bank/ielts/reading/${record.id}/view`}
                            >
                              <Sparkles aria-hidden="true" size={16} />
                            </Link>
                          )}
                          <button
                            aria-label="Clone to Draft"
                            disabled={cloningId === record.id}
                            title="Clone to Draft"
                            type="button"
                            onClick={() => void cloneToDraft(record)}
                          >
                            <CopyPlus aria-hidden="true" size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {(isLoading || records.length === 0) && (
                <tr>
                  <td colSpan={4}>
                    <div className={listStyles.emptyState}>
                      <p>{emptyMessage}</p>
                      {!isLoading && !template && (
                        <div className={teacherStyles.toolbarActions}>
                          <Link className={teacherStyles.columnsButton} to="/admin/exam-types/create">
                            Tạo dạng bài kiểm tra
                          </Link>
                          <Link className={teacherStyles.columnsButton} to="/admin/exams/create">
                            Tạo mẫu đề kiểm tra
                          </Link>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
  );
}
