import { useEffect, useMemo, useState } from "react";
import { Columns3, CopyPlus, Edit3, Eye, Funnel, Headphones, Plus, RefreshCw, Search, Sparkles } from "lucide-react";
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

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getCreatedBy = (record: ExamVersion) =>
  record.createdByName || record.createdByUserName || record.createdBy || "-";

const getUpdatedBy = (record: ExamVersion) =>
  record.updatedByName || record.updatedByUserName || record.updatedBy || "-";

type ColumnKey =
  | "name"
  | "versionNumber"
  | "status"
  | "createdAt"
  | "createdBy"
  | "updatedAt"
  | "updatedBy"
  | "actions";

const columns: ColumnKey[] = [
  "name",
  "versionNumber",
  "status",
  "createdAt",
  "createdBy",
  "updatedAt",
  "updatedBy",
  "actions",
];

const toggleableColumns: ColumnKey[] = columns.filter((column) => column !== "actions");

const columnLabels: Record<ColumnKey, string> = {
  name: "Name",
  versionNumber: "Version number",
  status: "Status",
  createdAt: "Created date",
  createdBy: "Created by",
  updatedAt: "Updated date",
  updatedBy: "Updated by",
  actions: "Action",
};

const initialVisibleColumns: Record<ColumnKey, boolean> = {
  name: true,
  versionNumber: true,
  status: true,
  createdAt: false,
  createdBy: false,
  updatedAt: false,
  updatedBy: false,
  actions: true,
};

type IeltsSkillList = "reading" | "listening";

const skillListConfig: Record<
  IeltsSkillList,
  {
    title: string;
    description: string;
    loadingText: string;
    emptyText: string;
    createLabel?: string;
    createPath?: string;
    audioListLabel?: string;
    audioListPath?: string;
    actionBasePath: string;
    examTemplateId: number;
  }
> = {
  reading: {
    title: "IELTS Reading - Danh sách đề",
    description:
      "Quản lý các version IELTS Reading. Draft được sửa trực tiếp, Published/Archived chỉ xem hoặc clone sang draft mới.",
    loadingText: "Đang tải danh sách IELTS Reading...",
    emptyText: "Không có đề IELTS Reading phù hợp.",
    createLabel: "Tạo đề Reading",
    createPath: "/admin/practice-bank/ielts/reading/create",
    actionBasePath: "/admin/practice-bank/ielts/reading",
    examTemplateId: 1,
  },
  listening: {
    title: "IELTS Listening - Danh sách đề",
    description: "Quản lý các version IELTS Listening thuộc template Listening.",
    loadingText: "Đang tải danh sách IELTS Listening...",
    emptyText: "Không có đề IELTS Listening phù hợp.",
    createLabel: "Tạo đề Listening",
    createPath: "/admin/practice-bank/ielts/listening/create",
    audioListLabel: "Danh Sách Audio",
    audioListPath: "/admin/practice-bank/ielts/listening/audio",
    actionBasePath: "/admin/practice-bank/ielts/listening",
    examTemplateId: 2,
  },
};

type IeltsReadingListPageProps = {
  skill?: IeltsSkillList;
};

export function IeltsReadingListPage({ skill = "reading" }: IeltsReadingListPageProps) {
  const navigate = useNavigate();
  const config = skillListConfig[skill];
  const [template, setTemplate] = useState<ExamTemplate | null>({ id: config.examTemplateId } as ExamTemplate);
  const [records, setRecords] = useState<ExamVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [cloningId, setCloningId] = useState<number | null>(null);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);

  const visibleColumnCount = Math.max(1, columns.filter((column) => visibleColumns[column]).length);

  const emptyMessage = useMemo(() => {
    if (isLoading) return config.loadingText;
    return config.emptyText;
  }, [config.emptyText, config.loadingText, isLoading]);

  const loadRecords = async (nextTemplate = template) => {
    setIsLoading(true);
    try {
      const resolvedTemplate =
        nextTemplate ??
        (await adminIeltsReadingApi
          .getTemplateById(config.examTemplateId)
          .catch(() => ({ id: config.examTemplateId } as ExamTemplate)));
      setTemplate(resolvedTemplate);

      const result = await adminIeltsReadingApi.getVersions({
        page: pageNumber,
        pageSize,
        keyword: searchTerm.trim() || undefined,
        examTemplateId: config.examTemplateId,
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

  const updateVersionStatus = async (record: ExamVersion) => {
    if (publishingId || (!isDraft(record.status) && !isPublished(record.status))) return;
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
      navigate(`${config.actionBasePath}/${draftVersion.id}/edit`);
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setCloningId(null);
    }
  };

  const getStatusActionLabel = (record: ExamVersion) =>
    isPublished(record.status) ? "Draft" : "Published";

  return (
    <div className={listStyles.page}>
      <section className={listStyles.header}>
        <div>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>

        {(config.audioListPath || config.createPath) && (
          <div className={teacherStyles.toolbarActions}>
            {config.audioListPath && config.audioListLabel && (
              <Link className={teacherStyles.columnsButton} to={config.audioListPath}>
                <Headphones aria-hidden="true" size={18} />
                {config.audioListLabel}
              </Link>
            )}
            {config.createPath && config.createLabel && (
              <Link className={listStyles.createButton} to={config.createPath}>
                <Plus aria-hidden="true" size={18} />
                {config.createLabel}
              </Link>
            )}
          </div>
        )}
      </section>

      <section className={`${listStyles.toolbar} ${teacherStyles.toolbar}`}>
        <label className={listStyles.searchBox}>
          <Search aria-hidden="true" size={18} />
          <input
            placeholder="Tìm theo version number hoặc tên đề"
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
          <div className={teacherStyles.menuWrap}>
            <button
              aria-expanded={isColumnsMenuOpen}
              className={teacherStyles.columnsButton}
              type="button"
              onClick={() => setIsColumnsMenuOpen((current) => !current)}
            >
              <Columns3 aria-hidden="true" size={18} />
              Columns
            </button>
            {isColumnsMenuOpen && (
              <div className={`${teacherStyles.dropdownMenu} ${teacherStyles.columnsMenu}`}>
                {toggleableColumns.map((column) => (
                  <label key={column}>
                    <input
                      checked={visibleColumns[column]}
                      type="checkbox"
                      onChange={() => setVisibleColumns((current) => ({ ...current, [column]: !current[column] }))}
                    />
                    {columnLabels[column]}
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
                  <th key={column}>{columnLabels[column]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  {visibleColumns.name && <td>
                    <strong>{record.name || "-"}</strong>
                  </td>}
                  {visibleColumns.versionNumber && <td>
                    <strong>{record.versionNumber ? `v${record.versionNumber}` : "-"}</strong>
                  </td>}
                  {visibleColumns.status && <td>
                    <span className={getStatusClassName(record.status)}>
                      {String(record.status)}
                    </span>
                  </td>}
                  {visibleColumns.createdAt && <td>{formatDateTime(record.createdAt)}</td>}
                  {visibleColumns.createdBy && <td>{getCreatedBy(record)}</td>}
                  {visibleColumns.updatedAt && <td>{formatDateTime(record.updatedAt)}</td>}
                  {visibleColumns.updatedBy && <td>{getUpdatedBy(record)}</td>}
                  {visibleColumns.actions && <td>
                    <div className={listStyles.actions}>
                      {isDraft(record.status) ? (
                        <>
                          <Link
                            aria-label="Chỉnh sửa draft"
                            title="Chỉnh sửa draft"
                            to={`${config.actionBasePath}/${record.id}/edit`}
                          >
                            <Edit3 aria-hidden="true" size={16} />
                          </Link>
                          <button
                            aria-label={getStatusActionLabel(record)}
                            disabled={publishingId === record.id}
                            title={getStatusActionLabel(record)}
                            type="button"
                            onClick={() => void updateVersionStatus(record)}
                          >
                            <RefreshCw aria-hidden="true" size={16} />
                          </button>
                          <Link
                            aria-label="Preview"
                            title="Preview"
                            to={`${config.actionBasePath}/${record.id}/view`}
                          >
                            <Sparkles aria-hidden="true" size={16} />
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            aria-label="Xem chi tiết"
                            title="Xem chi tiết"
                            to={`${config.actionBasePath}/${record.id}/view`}
                          >
                            <Eye aria-hidden="true" size={16} />
                          </Link>
                          {!isArchived(record.status) && (
                            <>
                              <button
                                aria-label={getStatusActionLabel(record)}
                                disabled={publishingId === record.id}
                                title={getStatusActionLabel(record)}
                                type="button"
                                onClick={() => void updateVersionStatus(record)}
                              >
                                <RefreshCw aria-hidden="true" size={16} />
                              </button>
                              <Link
                                aria-label="Preview"
                                title="Preview"
                                  to={`${config.actionBasePath}/${record.id}/view`}
                              >
                                <Sparkles aria-hidden="true" size={16} />
                              </Link>
                            </>
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
                  </td>}
                </tr>
              ))}

              {(isLoading || records.length === 0) && (
                <tr>
                  <td colSpan={visibleColumnCount}>
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
