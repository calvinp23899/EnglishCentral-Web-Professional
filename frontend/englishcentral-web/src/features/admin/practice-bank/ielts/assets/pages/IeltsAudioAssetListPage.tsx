import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { Edit3, Eye, Save, Search, Trash2, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";

import { Pagination, toastDanger, toastSuccess } from "@/components/ui";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import teacherStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";

import {
  adminExamAssetsApi,
  type ExamAsset,
  type ExamAssetUpdatePayload,
  type MetadataOption,
} from "../api/admin-exam-assets-api";
import styles from "./IeltsAudioAssetListPage.module.scss";

const DEFAULT_PAGE_SIZE = 10;

const getOptionValue = (option: MetadataOption) =>
  String(option.value ?? option.code ?? option.label ?? option.name ?? "");

const getOptionLabel = (option: MetadataOption) =>
  String(option.label ?? option.name ?? option.value ?? option.code ?? "");

const optionMatches = (option: MetadataOption, target: string) =>
  [option.value, option.code, option.label, option.name].some(
    (value) => String(value ?? "").toLowerCase() === target.toLowerCase(),
  );

const findOptionLabel = (options: MetadataOption[], value?: string | number | null) => {
  if (value === undefined || value === null || value === "") return "-";

  const stringValue = String(value);
  const option = options.find((item) =>
    [item.value, item.code, item.label, item.name].some((candidate) => String(candidate ?? "") === stringValue),
  );

  return option ? getOptionLabel(option) : stringValue;
};

const getAssetName = (asset: ExamAsset) =>
  asset.displayName ?? asset.name ?? asset.originalFileName ?? asset.fileName ?? `Audio #${asset.id}`;

const getAssetUrl = (asset: ExamAsset) => asset.url ?? asset.assetUrl ?? asset.fileUrl ?? "";

const formatDuration = (seconds?: number | null) => {
  if (!seconds || seconds < 0) return "-";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return "-";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
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

type PanelMode = "upload" | "view" | "edit";

type UploadFormState = {
  assetType: string;
  durationSeconds: string;
  metadataJson: string;
};

type EditFormState = {
  assetType: string;
  provider: string;
  status: string;
  durationSeconds: string;
  metadataJson: string;
};

const buildEditForm = (asset: ExamAsset): EditFormState => ({
  assetType: asset.assetType === undefined || asset.assetType === null ? "" : String(asset.assetType),
  provider: asset.provider === undefined || asset.provider === null ? "" : String(asset.provider),
  status: asset.status === undefined || asset.status === null ? "" : String(asset.status),
  durationSeconds:
    asset.durationSeconds === undefined || asset.durationSeconds === null ? "" : String(asset.durationSeconds),
  metadataJson: asset.metadataJson ?? "",
});

export const IeltsAudioAssetListPage = () => {
  const [assets, setAssets] = useState<ExamAsset[]>([]);
  const [assetTypes, setAssetTypes] = useState<MetadataOption[]>([]);
  const [providers, setProviders] = useState<MetadataOption[]>([]);
  const [statuses, setStatuses] = useState<MetadataOption[]>([]);
  const [audioAssetType, setAudioAssetType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<ExamAsset | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState<UploadFormState>({
    assetType: "",
    durationSeconds: "",
    metadataJson: "",
  });
  const [editForm, setEditForm] = useState<EditFormState>({
    assetType: "",
    provider: "",
    status: "",
    durationSeconds: "",
    metadataJson: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const audioLabel = useMemo(
    () => findOptionLabel(assetTypes, audioAssetType) || "Audio",
    [assetTypes, audioAssetType],
  );

  const loadAssets = async () => {
    if (!audioAssetType) return;

    setIsLoading(true);

    try {
      const result = await adminExamAssetsApi.getAssets({
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        keyword: searchTerm.trim() || undefined,
        assetType: audioAssetType,
        provider: providerFilter || undefined,
        status: statusFilter || undefined,
      });

      setAssets(result.items);
      setTotalItems(result.totalItems);
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadMetadata = async () => {
      try {
        const [typeOptions, providerOptions, statusOptions] = await Promise.all([
          adminExamAssetsApi.getAssetTypes(),
          adminExamAssetsApi.getAssetProviders(),
          adminExamAssetsApi.getAssetStatuses(),
        ]);

        if (!isMounted) return;

        setAssetTypes(typeOptions);
        setProviders(providerOptions);
        setStatuses(statusOptions);

        const audioOption = typeOptions.find((option) => optionMatches(option, "Audio"));
        const audioValue = audioOption ? getOptionValue(audioOption) : "";

        if (!audioValue) {
          toastDanger("Metadata chưa có loại asset Audio.");
        }

        setAudioAssetType(audioValue);
        setUploadForm((current) => ({ ...current, assetType: audioValue }));
      } catch (error) {
        toastDanger(getAuthErrorMessage(error));
      }
    };

    void loadMetadata();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    void loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioAssetType, page, providerFilter, statusFilter]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    void loadAssets();
  };

  const closePanel = () => {
    setPanelMode(null);
    setSelectedAsset(null);
    setUploadFile(null);
    setUploadForm({
      assetType: audioAssetType,
      durationSeconds: "",
      metadataJson: "",
    });
    setEditForm({
      assetType: "",
      provider: "",
      status: "",
      durationSeconds: "",
      metadataJson: "",
    });
  };

  const openUploadPanel = () => {
    setUploadForm({
      assetType: audioAssetType,
      durationSeconds: "",
      metadataJson: "",
    });
    setPanelMode("upload");
  };

  const openViewPanel = async (asset: ExamAsset) => {
    setPanelMode("view");
    setSelectedAsset(asset);

    try {
      const detail = await adminExamAssetsApi.getAssetById(asset.id);
      setSelectedAsset(detail);
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    }
  };

  const openEditPanel = async (asset: ExamAsset) => {
    setPanelMode("edit");
    setSelectedAsset(asset);
    setEditForm(buildEditForm(asset));

    try {
      const detail = await adminExamAssetsApi.getAssetById(asset.id);
      setSelectedAsset(detail);
      setEditForm(buildEditForm(detail));
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    }
  };

  const handleUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uploadFile) {
      toastDanger("Vui lòng chọn file audio.");
      return;
    }

    if (!uploadForm.assetType) {
      toastDanger("Không tìm thấy metadata asset type Audio.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("assetType", uploadForm.assetType);

      if (uploadForm.durationSeconds.trim()) {
        formData.append("durationSeconds", uploadForm.durationSeconds.trim());
      }

      if (uploadForm.metadataJson.trim()) {
        formData.append("metadataJson", uploadForm.metadataJson.trim());
      }

      await adminExamAssetsApi.uploadAsset(formData);
      toastSuccess("Upload audio thành công.");
      closePanel();
      setPage(1);
      await loadAssets();
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedAsset) return;

    setIsSubmitting(true);

    try {
      const payload: ExamAssetUpdatePayload = {
        assetType: editForm.assetType || audioAssetType,
        provider: editForm.provider || null,
        status: editForm.status || null,
        durationSeconds: editForm.durationSeconds.trim() ? Number(editForm.durationSeconds) : null,
        metadataJson: editForm.metadataJson.trim() || null,
      };

      await adminExamAssetsApi.updateAsset(selectedAsset.id, payload);
      toastSuccess("Cập nhật audio thành công.");
      closePanel();
      await loadAssets();
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (asset: ExamAsset) => {
    const isConfirmed = window.confirm(`Xóa audio "${getAssetName(asset)}"?`);

    if (!isConfirmed) return;

    try {
      await adminExamAssetsApi.deleteAsset(asset.id);
      toastSuccess("Xóa audio thành công.");
      await loadAssets();
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadFile(event.target.files?.[0] ?? null);
  };

  const renderPanel = () => {
    if (!panelMode) return null;

    const title =
      panelMode === "upload" ? "Upload audio" : panelMode === "edit" ? "Cập nhật audio" : "Chi tiết audio";
    const description =
      panelMode === "upload"
        ? "Chọn file audio và metadata tương ứng từ BE."
        : panelMode === "edit"
          ? "Cập nhật metadata của audio."
          : "Xem thông tin file audio đã upload.";

    return (
      <div className={styles.modalOverlay} role="presentation">
        <aside aria-label={title} className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
            <button className={teacherStyles.iconButton} onClick={closePanel} title="Đóng" type="button">
              <X aria-hidden="true" size={20} />
            </button>
          </header>

          {panelMode === "upload" && (
            <form className={styles.panelBody} onSubmit={handleUploadSubmit}>
              <div className={styles.formGrid}>
                <label className={`${styles.formField} ${styles.fullSpan}`}>
                  File audio *
                  <input
                    accept="audio/*"
                    className={styles.fileControl}
                    onChange={handleFileChange}
                    type="file"
                  />
                </label>
                <label className={styles.formField}>
                  Asset type
                  <select className={styles.selectControl} disabled value={uploadForm.assetType}>
                    <option value={uploadForm.assetType}>{audioLabel}</option>
                  </select>
                </label>
                <label className={styles.formField}>
                  Duration seconds
                  <input
                    className={styles.inputControl}
                    min={0}
                    onChange={(event) =>
                      setUploadForm((current) => ({ ...current, durationSeconds: event.target.value }))
                    }
                    placeholder="Optional"
                    type="number"
                    value={uploadForm.durationSeconds}
                  />
                </label>
                <label className={`${styles.formField} ${styles.fullSpan}`}>
                  Metadata JSON
                  <textarea
                    className={styles.textareaControl}
                    onChange={(event) =>
                      setUploadForm((current) => ({ ...current, metadataJson: event.target.value }))
                    }
                    placeholder='Ví dụ: {"section":"1","speaker":"native"}'
                    value={uploadForm.metadataJson}
                  />
                </label>
              </div>
              <footer className={styles.panelFooter}>
                <button className={teacherStyles.columnsButton} onClick={closePanel} type="button">
                  Hủy
                </button>
                <button className={listStyles.createButton} disabled={isSubmitting} type="submit">
                  <Upload aria-hidden="true" size={18} />
                  Upload audio
                </button>
              </footer>
            </form>
          )}

          {panelMode === "view" && selectedAsset && (
            <div className={styles.panelBody}>
              {getAssetUrl(selectedAsset) ? (
                <audio className={styles.audioPlayer} controls src={getAssetUrl(selectedAsset)}>
                  <track kind="captions" />
                </audio>
              ) : (
                <p className={styles.emptyHint}>Audio này chưa có URL để preview.</p>
              )}
              <div className={styles.infoBox}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Tên file</span>
                  <span className={styles.infoValue}>{getAssetName(selectedAsset)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Asset type</span>
                  <span className={styles.infoValue}>{findOptionLabel(assetTypes, selectedAsset.assetType)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Provider</span>
                  <span className={styles.infoValue}>{findOptionLabel(providers, selectedAsset.provider)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Trạng thái</span>
                  <span className={styles.infoValue}>{findOptionLabel(statuses, selectedAsset.status)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Duration</span>
                  <span className={styles.infoValue}>{formatDuration(selectedAsset.durationSeconds)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Size</span>
                  <span className={styles.infoValue}>{formatBytes(selectedAsset.fileSize)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>URL</span>
                  <span className={styles.infoValue}>{getAssetUrl(selectedAsset) || "-"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Metadata</span>
                  <span className={styles.infoValue}>{selectedAsset.metadataJson || "-"}</span>
                </div>
              </div>
              <footer className={styles.panelFooter}>
                <button className={teacherStyles.columnsButton} onClick={closePanel} type="button">
                  Đóng
                </button>
              </footer>
            </div>
          )}

          {panelMode === "edit" && selectedAsset && (
            <form className={styles.panelBody} onSubmit={handleUpdateSubmit}>
              <div className={styles.formGrid}>
                <label className={styles.formField}>
                  Asset type
                  <select
                    className={styles.selectControl}
                    onChange={(event) => setEditForm((current) => ({ ...current, assetType: event.target.value }))}
                    value={editForm.assetType}
                  >
                    {assetTypes.map((option) => (
                      <option key={getOptionValue(option)} value={getOptionValue(option)}>
                        {getOptionLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.formField}>
                  Provider
                  <select
                    className={styles.selectControl}
                    onChange={(event) => setEditForm((current) => ({ ...current, provider: event.target.value }))}
                    value={editForm.provider}
                  >
                    <option value="">Không chọn</option>
                    {providers.map((option) => (
                      <option key={getOptionValue(option)} value={getOptionValue(option)}>
                        {getOptionLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.formField}>
                  Trạng thái
                  <select
                    className={styles.selectControl}
                    onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value }))}
                    value={editForm.status}
                  >
                    <option value="">Không chọn</option>
                    {statuses.map((option) => (
                      <option key={getOptionValue(option)} value={getOptionValue(option)}>
                        {getOptionLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.formField}>
                  Duration seconds
                  <input
                    className={styles.inputControl}
                    min={0}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, durationSeconds: event.target.value }))
                    }
                    type="number"
                    value={editForm.durationSeconds}
                  />
                </label>
                <label className={`${styles.formField} ${styles.fullSpan}`}>
                  Metadata JSON
                  <textarea
                    className={styles.textareaControl}
                    onChange={(event) => setEditForm((current) => ({ ...current, metadataJson: event.target.value }))}
                    value={editForm.metadataJson}
                  />
                </label>
              </div>
              <footer className={styles.panelFooter}>
                <button className={teacherStyles.columnsButton} onClick={closePanel} type="button">
                  Hủy
                </button>
                <button className={listStyles.createButton} disabled={isSubmitting} type="submit">
                  <Save aria-hidden="true" size={18} />
                  Lưu thay đổi
                </button>
              </footer>
            </form>
          )}
        </aside>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <section className={styles.pageHero}>
        <div>
          <Link className={styles.backLink} to="/admin/practice-bank/ielts/listening">
            ← Quay lại danh sách Listening
          </Link>
          <h1>Danh Sách Audio</h1>
          <p>Quản lý audio assets dùng cho IELTS Listening. File upload sử dụng asset type từ metadata BE.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.createButton} disabled={!audioAssetType} onClick={openUploadPanel} type="button">
            <Upload aria-hidden="true" size={18} />
            Upload file audio
          </button>
        </div>
      </section>

      <section className={styles.toolbarCard}>
        <form className={styles.filters} onSubmit={handleSearchSubmit}>
          <label className={styles.searchBox}>
            <Search aria-hidden="true" size={22} />
            <input
              aria-label="Tìm audio"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo tên file, URL hoặc metadata"
              type="search"
              value={searchTerm}
            />
          </label>
          <select
            className={styles.selectControl}
            onChange={(event) => {
              setProviderFilter(event.target.value);
              setPage(1);
            }}
            value={providerFilter}
          >
            <option value="">Provider: Tất cả</option>
            {providers.map((option) => (
              <option key={getOptionValue(option)} value={getOptionValue(option)}>
                {getOptionLabel(option)}
              </option>
            ))}
          </select>
          <select
            className={styles.selectControl}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            value={statusFilter}
          >
            <option value="">Trạng thái: Tất cả</option>
            {statuses.map((option) => (
              <option key={getOptionValue(option)} value={getOptionValue(option)}>
                {getOptionLabel(option)}
              </option>
            ))}
          </select>
        </form>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableScroller}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Tên audio</th>
                <th>Asset type</th>
                <th>Provider</th>
                <th>Trạng thái</th>
                <th>Duration</th>
                <th>Size</th>
                <th>Ngày tạo</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8}>
                    <div className={styles.emptyState}>Đang tải danh sách audio...</div>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className={styles.emptyState}>Không có audio phù hợp.</div>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <div className={styles.assetName} title={getAssetName(asset)}>
                        <strong>{getAssetName(asset)}</strong>
                        <span className={styles.assetMeta}>{asset.contentType ?? getAssetUrl(asset) ?? "-"}</span>
                      </div>
                    </td>
                    <td>{findOptionLabel(assetTypes, asset.assetType)}</td>
                    <td>{findOptionLabel(providers, asset.provider)}</td>
                    <td>
                      <span className={styles.badge}>{findOptionLabel(statuses, asset.status)}</span>
                    </td>
                    <td>{formatDuration(asset.durationSeconds)}</td>
                    <td>{formatBytes(asset.fileSize)}</td>
                    <td>{formatDateTime(asset.createdAt)}</td>
                    <td>
                      <div className={teacherStyles.actions}>
                        <button
                          className={teacherStyles.iconButton}
                          onClick={() => void openViewPanel(asset)}
                          title="Xem chi tiết"
                          type="button"
                        >
                          <Eye aria-hidden="true" size={16} />
                        </button>
                        <button
                          className={teacherStyles.iconButton}
                          onClick={() => void openEditPanel(asset)}
                          title="Chỉnh sửa"
                          type="button"
                        >
                          <Edit3 aria-hidden="true" size={16} />
                        </button>
                        <button
                          className={`${teacherStyles.iconButton} ${teacherStyles.deleteButton}`}
                          onClick={() => void handleDelete(asset)}
                          title="Xóa audio"
                          type="button"
                        >
                          <Trash2 aria-hidden="true" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          pageNumber={page}
          pageSize={DEFAULT_PAGE_SIZE}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={() => undefined}
        />
      </section>

      {renderPanel()}
    </div>
  );
};
