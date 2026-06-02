import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Columns3, Download, Edit3, Eye, Funnel, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, SidePanel, toastDanger, toastSuccess, toastWarning } from "@/components/ui";
import {
  adminMetadataApi,
  type MetadataOption,
  type RoleMetadataOption,
} from "@/features/admin/shared/api/admin-metadata-api";
import {
  adminTeachersApi,
  type AdminTeacher,
} from "@/features/admin/teachers/api/admin-teachers-api";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import styles from "@/features/admin/students/pages/StudentListPage.module.scss";
import teacherStyles from "./TeacherListPage.module.scss";

type SortKey = "teacherCode" | "fullName" | "email" | "phoneNumber" | "specialization" | "hireDate" | "status";
type SortDirection = "asc" | "desc";
type ColumnKey = SortKey | "actions";
type TeacherFilters = {
  status: string;
  role: string;
  hireDateFrom: string;
  hireDateTo: string;
};

const emptyFilters: TeacherFilters = {
  status: "all",
  role: "all",
  hireDateFrom: "",
  hireDateTo: "",
};

const columnLabels: Record<ColumnKey, string> = {
  teacherCode: "Mã giáo viên",
  fullName: "Họ tên",
  email: "Email",
  phoneNumber: "SĐT",
  specialization: "Chuyên môn",
  hireDate: "Ngày vào",
  status: "Trạng thái",
  actions: "Action",
};

const initialVisibleColumns: Record<ColumnKey, boolean> = {
  teacherCode: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  specialization: true,
  hireDate: true,
  status: true,
  actions: true,
};

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(value))
    : "Chưa cập nhật";

const truncateText = (value?: string | null) => {
  const text = value ?? "Chưa cập nhật";
  const characters = Array.from(text);

  return characters.length > 10 ? `${characters.slice(0, 10).join("")}...` : text;
};

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
  const [filters, setFilters] = useState<TeacherFilters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<TeacherFilters>(emptyFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [sortKey, setSortKey] = useState<SortKey>("hireDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusOptions, setStatusOptions] = useState<MetadataOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleMetadataOption[]>([]);
  const [deletingTeacher, setDeletingTeacher] = useState<AdminTeacher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    Promise.all([
      adminMetadataApi.getTeacherStatusOptions(),
      adminMetadataApi.getRoleOptions(),
    ])
      .then(([nextStatusOptions, nextRoleOptions]) => {
        setStatusOptions(nextStatusOptions);
        setRoleOptions(nextRoleOptions);
      })
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
          status: filters.status === "all" ? undefined : filters.status,
          role: filters.role === "all" ? undefined : filters.role,
          hireDateFrom: filters.hireDateFrom || undefined,
          hireDateTo: filters.hireDateTo || undefined,
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
  }, [filters, pageNumber, pageSize, refreshVersion, searchTerm, sortDirection, sortKey]);

  const handleApplyFilters = () => {
    if (
      draftFilters.hireDateFrom
      && draftFilters.hireDateTo
      && draftFilters.hireDateFrom > draftFilters.hireDateTo
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

  const handleSort = (nextSortKey: SortKey) => {
    setPageNumber(1);
    setSortKey(nextSortKey);
    setSortDirection((current) =>
      sortKey === nextSortKey && current === "asc" ? "desc" : "asc",
    );
  };

  const toggleColumn = (column: ColumnKey) => {
    setVisibleColumns((current) => ({ ...current, [column]: !current[column] }));
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

  const columns: SortKey[] = [
    "teacherCode",
    "fullName",
    "email",
    "phoneNumber",
    "specialization",
    "hireDate",
    "status",
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

        <section className={`${styles.toolbar} ${teacherStyles.toolbar}`}>
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
                  {columns.filter((column) => visibleColumns[column]).map((column) => (
                    <th key={column}>
                      <button type="button" onClick={() => handleSort(column)}>
                        {columnLabels[column]} {renderSortIcon(column)}
                      </button>
                    </th>
                  ))}
                  {visibleColumns.actions && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((teacher) => (
                  <tr key={teacher.id}>
                    {visibleColumns.teacherCode && <td><strong className={teacherStyles.ellipsis} title={teacher.teacherCode}>{truncateText(teacher.teacherCode)}</strong></td>}
                    {visibleColumns.fullName && <td><span className={teacherStyles.ellipsis} title={teacher.fullName}>{truncateText(teacher.fullName)}</span></td>}
                    {visibleColumns.email && <td><span className={teacherStyles.ellipsis} title={teacher.email ?? "Chưa cập nhật"}>{truncateText(teacher.email)}</span></td>}
                    {visibleColumns.phoneNumber && <td><span className={teacherStyles.ellipsis} title={teacher.phoneNumber ?? "Chưa cập nhật"}>{truncateText(teacher.phoneNumber)}</span></td>}
                    {visibleColumns.specialization && <td><span className={teacherStyles.ellipsis} title={teacher.specialization ?? "Chưa cập nhật"}>{truncateText(teacher.specialization)}</span></td>}
                    {visibleColumns.hireDate && <td>{formatDate(teacher.hireDate)}</td>}
                    {visibleColumns.status && <td>
                      <span className={`${styles.statusBadge} ${styles[getStatusTone(teacher.status)]}`}>
                        {getStatusLabel(teacher.status, statusOptions)}
                      </span>
                    </td>}
                    {visibleColumns.actions && <td>
                      <div className={styles.actions}>
                        <Link to={`/admin/teachers/${teacher.id}/view`} aria-label="Xem" title="Xem chi tiết"><Eye size={16} /></Link>
                        <Link to={`/admin/teachers/${teacher.id}/edit`} aria-label="Sửa" title="Chỉnh sửa"><Edit3 size={16} /></Link>
                        <button className={styles.deleteAction} type="button" aria-label="Xóa" title="Xóa" onClick={() => setDeletingTeacher(teacher)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>}
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

      <SidePanel
        description="Lọc danh sách nhân viên theo trạng thái, role và thời gian tuyển dụng."
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
              value={draftFilters.status}
              onChange={(event) =>
                setDraftFilters((current) => ({ ...current, status: event.target.value }))
              }
            >
              <option value="all">Tất cả</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Role</span>
            <select
              value={draftFilters.role}
              onChange={(event) =>
                setDraftFilters((current) => ({ ...current, role: event.target.value }))
              }
            >
              <option value="all">Tất cả</option>
              {roleOptions.map((option) => (
                <option key={option.roleId} value={option.roleName}>{option.roleName}</option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend>Khoảng thời gian tuyển</legend>
            <label>
              <span>Từ ngày</span>
              <input
                type="date"
                value={draftFilters.hireDateFrom}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, hireDateFrom: event.target.value }))
                }
              />
            </label>
            <label>
              <span>Đến ngày</span>
              <input
                type="date"
                value={draftFilters.hireDateTo}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, hireDateTo: event.target.value }))
                }
              />
            </label>
          </fieldset>
        </div>
      </SidePanel>

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
