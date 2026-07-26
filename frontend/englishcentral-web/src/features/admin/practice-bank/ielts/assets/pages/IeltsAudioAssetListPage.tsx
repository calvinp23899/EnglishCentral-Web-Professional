import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { Columns3, Edit3, Eye, Funnel, Loader2, Plus, Save, Search, Trash2, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";

import { ConfirmModal, Pagination, SidePanel, toastDanger, toastSuccess } from "@/components/ui";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";
import crudStyles from "@/features/admin/shared/components/AdminCrud/AdminCrudPage.module.scss";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import teacherStyles from "@/features/admin/teachers/pages/TeacherListPage.module.scss";
import compactStyles from "@/features/admin/practice-bank/ielts/reading/pages/IeltsReadingListPage.module.scss";

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

const assetTypeMatchesValue = (
  value: string | number | null | undefined,
  target: "Audio" | "Image",
  options: MetadataOption[],
) => {
  if (value === undefined || value === null || value === "") return false;

  const stringValue = String(value);

  if (stringValue.toLowerCase() === target.toLowerCase()) return true;

  return options.some(
    (option) => getOptionValue(option) === stringValue && optionMatches(option, target),
  );
};

const ensureAssetTypeOption = (options: MetadataOption[], target: "Audio" | "Image") =>
  options.find((option) => optionMatches(option, target)) ?? { label: target, value: target };

const getUploadAssetTypeOptions = (options: MetadataOption[]) => {
  const uploadOptions = [
    ensureAssetTypeOption(options, "Audio"),
    ensureAssetTypeOption(options, "Image"),
  ];
  const seenValues = new Set<string>();

  return uploadOptions.filter((option) => {
    const optionValue = getOptionValue(option);
    if (!optionValue || seenValues.has(optionValue)) return false;
    seenValues.add(optionValue);
    return true;
  });
};

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

const getAssetUrl = (asset: ExamAsset) => asset.publicUrl ?? asset.url ?? asset.assetUrl ?? asset.fileUrl ?? "";

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
type ColumnKey = "name" | "assetType" | "provider" | "status" | "duration" | "size" | "createdAt";

type UploadFormState = {
  assetType: string;
  durationSeconds: string;
};

type StopPointFormState = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
};

type UploadMetadataFormState = {
  speaker: string;
  totalSection: string;
  typeExam: "IELTS";
  stopPoints: StopPointFormState[];
};

type EditFormState = {
  assetType: string;
  provider: string;
  status: string;
  durationSeconds: string;
  metadataJson: string;
  speaker: string;
  totalSection: string;
  typeExam: string;
  stopPoints: StopPointFormState[];
};

const columns: ColumnKey[] = ["name", "assetType", "provider", "status", "duration", "size", "createdAt"];

const columnLabels: Record<ColumnKey, string> = {
  name: "Tên audio",
  assetType: "Asset type",
  provider: "Provider",
  status: "Trạng thái",
  duration: "Duration",
  size: "Size",
  createdAt: "Ngày tạo",
};

const initialVisibleColumns: Record<ColumnKey, boolean> = {
  name: true,
  assetType: true,
  provider: true,
  status: true,
  duration: false,
  size: false,
  createdAt: true,
};

type AssetFilters = {
  provider: string;
  status: string;
};

const emptyFilters: AssetFilters = {
  provider: "",
  status: "",
};

const createStopPoint = (): StopPointFormState => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  title: "",
  startTime: "",
  endTime: "",
});

const createUploadMetadataForm = (): UploadMetadataFormState => ({
  speaker: "",
  totalSection: "1",
  typeExam: "IELTS",
  stopPoints: [],
});

const emptyEditForm = (): EditFormState => ({
  assetType: "",
  provider: "",
  status: "",
  durationSeconds: "",
  metadataJson: "",
  speaker: "",
  totalSection: "1",
  typeExam: "IELTS",
  stopPoints: [],
});

const stringifyMetadataJson = (metadataJson: ExamAsset["metadataJson"]) => {
  if (metadataJson === undefined || metadataJson === null || metadataJson === "") return "";
  if (typeof metadataJson === "string") return metadataJson;

  return JSON.stringify(metadataJson, null, 2);
};

const parseMetadataJson = (metadataJson: ExamAsset["metadataJson"]) => {
  const metadataText = stringifyMetadataJson(metadataJson);

  if (!metadataText) return null;

  try {
    const parsed = JSON.parse(metadataText);

    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

const getMetadataString = (metadata: Record<string, unknown>, keys: string[], fallback = "") => {
  const key = keys.find((candidate) => metadata[candidate] !== undefined && metadata[candidate] !== null);
  const value = key ? metadata[key] : undefined;

  return value === undefined || value === null ? fallback : String(value);
};

const createStopPointsFromMetadata = (value: unknown): StopPointFormState[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((point) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: getMetadataString(point, ["title", "Title"]),
      startTime: getMetadataString(point, ["StartTime", "startTime"]),
      endTime: getMetadataString(point, ["EndTime", "endTime"]),
    }));
};

const buildEditForm = (asset: ExamAsset): EditFormState => {
  const metadata = parseMetadataJson(asset.metadataJson);

  return {
    ...emptyEditForm(),
    ...(metadata
      ? {
          speaker: getMetadataString(metadata, ["Speaker", "speaker"]),
          totalSection: getMetadataString(metadata, ["TotalSection", "totalSection"], "1"),
          typeExam: getMetadataString(metadata, ["TypeExam", "typeExam"], "IELTS"),
          stopPoints: createStopPointsFromMetadata(metadata.StopPoint ?? metadata.stopPoint ?? metadata.stopPoints),
        }
      : {}),
    assetType: asset.assetType === undefined || asset.assetType === null ? "" : String(asset.assetType),
    provider: asset.provider === undefined || asset.provider === null ? "" : String(asset.provider),
    status: asset.status === undefined || asset.status === null ? "" : String(asset.status),
    durationSeconds:
      asset.durationSeconds === undefined || asset.durationSeconds === null ? "" : String(asset.durationSeconds),
    metadataJson: stringifyMetadataJson(asset.metadataJson),
  };
};

const buildUploadMetadataJson = (metadata: UploadMetadataFormState, onlyTypeExam = false) =>
  JSON.stringify(
    onlyTypeExam
      ? { TypeExam: metadata.typeExam }
      : {
          TypeExam: metadata.typeExam,
          Speaker: metadata.speaker.trim(),
          TotalSection: Math.max(1, Number(metadata.totalSection) || 1),
          StopPoint: metadata.stopPoints
            .filter((point) => point.title.trim() || point.startTime.trim() || point.endTime.trim())
            .map((point) => ({
              title: point.title.trim(),
              StartTime: point.startTime.trim(),
              EndTime: point.endTime.trim(),
            })),
        },
  );

const buildEditMetadataJson = (metadata: EditFormState, onlyTypeExam = false) =>
  buildUploadMetadataJson(
    {
      speaker: metadata.speaker,
      totalSection: metadata.totalSection,
      typeExam: "IELTS",
      stopPoints: metadata.stopPoints,
    },
    onlyTypeExam,
  );

const getMetadataValue = (asset: ExamAsset, keys: string[], fallback = "-") => {
  const metadata = parseMetadataJson(asset.metadataJson);

  return metadata ? getMetadataString(metadata, keys, fallback) || fallback : fallback;
};

const getMetadataStopPoints = (asset: ExamAsset) => {
  const metadata = parseMetadataJson(asset.metadataJson);
  const stopPoints = metadata?.StopPoint ?? metadata?.stopPoint ?? metadata?.stopPoints;

  if (!Array.isArray(stopPoints)) return [];

  return stopPoints
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((point) => ({
      title: getMetadataString(point, ["title", "Title"], "-"),
      startTime: getMetadataString(point, ["StartTime", "startTime"], "-"),
      endTime: getMetadataString(point, ["EndTime", "endTime"], "-"),
    }));
};

export const IeltsAudioAssetListPage = () => {
  const [assets, setAssets] = useState<ExamAsset[]>([]);
  const [assetTypes, setAssetTypes] = useState<MetadataOption[]>([]);
  const [providers, setProviders] = useState<MetadataOption[]>([]);
  const [statuses, setStatuses] = useState<MetadataOption[]>([]);
  const [audioAssetType, setAudioAssetType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<AssetFilters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<AssetFilters>(emptyFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<ExamAsset | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState<UploadFormState>({
    assetType: "",
    durationSeconds: "",
  });
  const [uploadMetadata, setUploadMetadata] = useState<UploadMetadataFormState>(() => createUploadMetadataForm());
  const [editForm, setEditForm] = useState<EditFormState>(() => emptyEditForm());
  const [deletingAsset, setDeletingAsset] = useState<ExamAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadAssetTypeOptions = useMemo(() => getUploadAssetTypeOptions(assetTypes), [assetTypes]);
  const listAssetTypes = useMemo(
    () => uploadAssetTypeOptions.map((option) => getOptionValue(option)).filter(Boolean),
    [uploadAssetTypeOptions],
  );
  const selectedUploadAssetType = uploadAssetTypeOptions.find(
    (option) => getOptionValue(option) === uploadForm.assetType,
  );
  const isUploadImage = selectedUploadAssetType ? optionMatches(selectedUploadAssetType, "Image") : false;
  const uploadFileAccept = selectedUploadAssetType
    ? optionMatches(selectedUploadAssetType, "Image")
      ? "image/*"
      : optionMatches(selectedUploadAssetType, "Audio")
        ? "audio/*"
        : "audio/*,image/*"
    : "audio/*,image/*";

  const loadAssets = async () => {
    if (!audioAssetType) return;

    setIsLoading(true);

    try {
      const result = await adminExamAssetsApi.getAssets({
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        keyword: searchTerm.trim() || undefined,
        assetType: listAssetTypes.length > 0 ? listAssetTypes : audioAssetType,
        provider: filters.provider || undefined,
        status: filters.status || undefined,
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
    const timeoutId = window.setTimeout(() => {
      void loadAssets();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioAssetType, filters, page]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    void loadAssets();
  };

  const handleApplyFilters = () => {
    setFilters(draftFilters);
    setPage(1);
    setIsFilterPanelOpen(false);
  };

  const handleClearFilters = () => {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const visibleColumnCount = Math.max(1, columns.filter((column) => visibleColumns[column]).length) + 1;

  const toggleColumn = (column: ColumnKey) => {
    setVisibleColumns((current) => ({ ...current, [column]: !current[column] }));
  };

  const closePanel = () => {
    setPanelMode(null);
    setSelectedAsset(null);
    setUploadFile(null);
    setUploadForm({
      assetType: audioAssetType,
      durationSeconds: "",
    });
    setUploadMetadata(createUploadMetadataForm());
    setEditForm(emptyEditForm());
  };

  const openUploadPanel = () => {
    setUploadForm({
      assetType: audioAssetType,
      durationSeconds: "",
    });
    setUploadMetadata(createUploadMetadataForm());
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

  const handleUploadTotalSectionChange = (value: string) => {
    setUploadMetadata((current) => {
      const currentValue = Math.max(1, Number(current.totalSection) || 1);
      const nextValue = Math.max(1, Number(value) || 1);

      return {
        ...current,
        totalSection: String(Math.max(currentValue, nextValue)),
      };
    });
  };

  const addStopPoint = () => {
    setUploadMetadata((current) => ({
      ...current,
      stopPoints: [...current.stopPoints, createStopPoint()],
    }));
  };

  const updateStopPoint = (id: string, field: keyof Omit<StopPointFormState, "id">, value: string) => {
    setUploadMetadata((current) => ({
      ...current,
      stopPoints: current.stopPoints.map((point) => (point.id === id ? { ...point, [field]: value } : point)),
    }));
  };

  const removeStopPoint = (id: string) => {
    setUploadMetadata((current) => ({
      ...current,
      stopPoints: current.stopPoints.filter((point) => point.id !== id),
    }));
  };

  const handleEditTotalSectionChange = (value: string) => {
    setEditForm((current) => {
      const currentValue = Math.max(1, Number(current.totalSection) || 1);
      const nextValue = Math.max(1, Number(value) || 1);

      return {
        ...current,
        totalSection: String(Math.max(currentValue, nextValue)),
      };
    });
  };

  const addEditStopPoint = () => {
    setEditForm((current) => ({
      ...current,
      stopPoints: [...current.stopPoints, createStopPoint()],
    }));
  };

  const updateEditStopPoint = (id: string, field: keyof Omit<StopPointFormState, "id">, value: string) => {
    setEditForm((current) => ({
      ...current,
      stopPoints: current.stopPoints.map((point) => (point.id === id ? { ...point, [field]: value } : point)),
    }));
  };

  const removeEditStopPoint = (id: string) => {
    setEditForm((current) => ({
      ...current,
      stopPoints: current.stopPoints.filter((point) => point.id !== id),
    }));
  };

  const handleUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!uploadFile) {
      toastDanger("Vui lòng chọn file.");
      return;
    }

    if (!uploadForm.assetType) {
      toastDanger("Vui lòng chọn asset type.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("assetType", uploadForm.assetType);

      if (!isUploadImage && uploadForm.durationSeconds.trim()) {
        formData.append("durationSeconds", uploadForm.durationSeconds.trim());
      }

      formData.append("metadataJson", buildUploadMetadataJson(uploadMetadata, isUploadImage));

      await adminExamAssetsApi.uploadAsset(formData);
      toastSuccess("Upload file thành công.");
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

    if (isSubmitting) return;

    if (!selectedAsset) return;

    setIsSubmitting(true);

    try {
      const isEditImage = assetTypeMatchesValue(editForm.assetType, "Image", assetTypes);
      const payload: ExamAssetUpdatePayload = {
        assetType: editForm.assetType || audioAssetType,
        provider: editForm.provider || null,
        status: editForm.status || null,
        ...(!isEditImage
          ? { durationSeconds: editForm.durationSeconds.trim() ? Number(editForm.durationSeconds) : null }
          : {}),
        metadataJson: buildEditMetadataJson(editForm, isEditImage),
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

  const handleDelete = (asset: ExamAsset) => {
    setDeletingAsset(asset);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAsset || isDeleting) return;

    setIsDeleting(true);
    try {
      await adminExamAssetsApi.deleteAsset(deletingAsset.id);
      toastSuccess("Xóa audio thành công.");
      setDeletingAsset(null);
      await loadAssets();
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadFile(event.target.files?.[0] ?? null);
  };

  const renderPanel = () => {
    if (!panelMode) return null;

    const selectedAssetIsImage = selectedAsset
      ? assetTypeMatchesValue(selectedAsset.assetType, "Image", assetTypes)
      : false;
    const editAssetIsImage = assetTypeMatchesValue(editForm.assetType, "Image", assetTypes);

    const title =
      panelMode === "upload" ? "Upload File" : panelMode === "edit" ? "Cập nhật audio" : "Chi tiết audio";
    const description =
      panelMode === "upload"
        ? "Chọn file và metadata tương ứng từ BE."
        : panelMode === "edit"
          ? "Cập nhật metadata của audio."
          : "Xem thông tin file audio đã upload.";

    return (
      <div className={styles.modalOverlay} role="presentation">
        <aside aria-label={title} className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <h2>{panelMode === "view" ? "Chi tiết file" : panelMode === "edit" ? "Cập nhật file" : title}</h2>
              <p>
                {panelMode === "view"
                  ? "Xem thông tin file đã upload."
                  : panelMode === "edit"
                    ? "Cập nhật metadata của file."
                    : description}
              </p>
            </div>
            <button className={teacherStyles.iconButton} onClick={closePanel} title="Đóng" type="button">
              <X aria-hidden="true" size={20} />
            </button>
          </header>

          {panelMode === "upload" && (
            <form className={`${styles.panelBody} ${styles.uploadPanelBody}`} onSubmit={handleUploadSubmit}>
              <div className={styles.formGrid}>
                <label className={`${styles.formField} ${styles.fullSpan}`}>
                  <span>
                    File <span className={styles.requiredMark}>*</span>
                  </span>
                  <span className={styles.filePicker}>
                    <Upload aria-hidden="true" size={16} />
                    <span className={styles.filePickerAction}>Chọn file</span>
                    <span className={styles.filePickerName}>
                      {uploadFile ? uploadFile.name : "Chưa chọn file"}
                    </span>
                    <input accept={uploadFileAccept} onChange={handleFileChange} type="file" />
                  </span>
                </label>
                <label className={styles.formField}>
                  <span>
                    Asset type <span className={styles.requiredMark}>*</span>
                  </span>
                  <select
                    className={styles.selectControl}
                    value={uploadForm.assetType}
                    onChange={(event) => {
                      setUploadFile(null);
                      setUploadForm((current) => ({ ...current, assetType: event.target.value }));
                    }}
                  >
                    {uploadAssetTypeOptions.map((option) => (
                      <option key={getOptionValue(option)} value={getOptionValue(option)}>
                        {getOptionLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>
                {!isUploadImage && (
                  <>
                    <label className={styles.formField}>
                      Total Duration Seconds
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
                    <label className={styles.formField}>
                      Speaker
                      <input
                        className={styles.inputControl}
                        onChange={(event) =>
                          setUploadMetadata((current) => ({ ...current, speaker: event.target.value }))
                        }
                        placeholder="Speaker name"
                        type="text"
                        value={uploadMetadata.speaker}
                      />
                    </label>
                    <label className={styles.formField}>
                      TotalSection
                      <input
                        className={styles.inputControl}
                        min={1}
                        onChange={(event) => handleUploadTotalSectionChange(event.target.value)}
                        step={1}
                        type="number"
                        value={uploadMetadata.totalSection}
                      />
                    </label>
                  </>
                )}
                <label className={styles.formField}>
                  TypeExam
                  <input className={styles.inputControl} readOnly type="text" value={uploadMetadata.typeExam} />
                </label>
                {!isUploadImage && (
                  <div className={`${styles.stopPointSection} ${styles.fullSpan}`}>
                  <div className={styles.stopPointHeader}>
                    <div>
                      <h3>StopPoint</h3>
                      <p>Danh sách mốc nghe được lưu vào metadataJson khi upload audio.</p>
                    </div>
                    <button className={styles.addStopPointButton} onClick={addStopPoint} type="button">
                      <Plus aria-hidden="true" size={16} />
                      Thêm mốc
                    </button>
                  </div>
                  {uploadMetadata.stopPoints.length === 0 ? (
                    <p className={styles.stopPointEmpty}>Chưa có stop point.</p>
                  ) : (
                    <div className={styles.stopPointList}>
                      {uploadMetadata.stopPoints.map((point, index) => (
                        <div className={styles.stopPointItem} key={point.id}>
                          <div className={styles.stopPointItemHeader}>
                            <strong>Stop point {index + 1}</strong>
                            <button
                              className={styles.stopPointRemove}
                              onClick={() => removeStopPoint(point.id)}
                              title="Xóa stop point"
                              type="button"
                            >
                              <Trash2 aria-hidden="true" size={15} />
                            </button>
                          </div>
                          <label className={styles.formField}>
                            Title
                            <input
                              className={styles.inputControl}
                              onChange={(event) => updateStopPoint(point.id, "title", event.target.value)}
                              placeholder="Section 1"
                              type="text"
                              value={point.title}
                            />
                          </label>
                          <div className={styles.stopPointTimeGrid}>
                            <label className={styles.formField}>
                              StartTime
                              <input
                                className={styles.inputControl}
                                onChange={(event) => updateStopPoint(point.id, "startTime", event.target.value)}
                                placeholder="00:00"
                                type="text"
                                value={point.startTime}
                              />
                            </label>
                            <label className={styles.formField}>
                              EndTime
                              <input
                                className={styles.inputControl}
                                onChange={(event) => updateStopPoint(point.id, "endTime", event.target.value)}
                                placeholder="05:30"
                                type="text"
                                value={point.endTime}
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                )}
              </div>
              <footer className={styles.panelFooter}>
                <button className={teacherStyles.columnsButton} disabled={isSubmitting} onClick={closePanel} type="button">
                  Hủy
                </button>
                <button className={listStyles.createButton} disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <Loader2 aria-hidden="true" className={styles.loadingIcon} size={18} />
                  ) : (
                    <Upload aria-hidden="true" size={18} />
                  )}
                  {isSubmitting ? "Đang upload..." : "Upload file"}
                </button>
              </footer>
            </form>
          )}

          {panelMode === "view" && selectedAsset && (
            <div className={`${styles.panelBody} ${styles.detailPanelBody}`}>
              {!selectedAssetIsImage && getAssetUrl(selectedAsset) ? (
                <audio className={styles.audioPlayer} controls src={getAssetUrl(selectedAsset)}>
                  <track kind="captions" />
                </audio>
              ) : !selectedAssetIsImage ? (
                <p className={styles.emptyHint}>Audio này chưa có URL để preview.</p>
              ) : null}
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
                {!selectedAssetIsImage && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Duration</span>
                    <span className={styles.infoValue}>{formatDuration(selectedAsset.durationSeconds)}</span>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Size</span>
                  <span className={styles.infoValue}>{formatBytes(selectedAsset.fileSize)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>URL</span>
                  <span className={styles.infoValue}>
                    {getAssetUrl(selectedAsset) ? (
                      <a
                        className={styles.urlLink}
                        href={getAssetUrl(selectedAsset)}
                        rel="noreferrer"
                        target="_blank"
                        title={getAssetUrl(selectedAsset)}
                      >
                        {getAssetUrl(selectedAsset)}
                      </a>
                    ) : "-"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>TypeExam</span>
                  <span className={styles.infoValue}>{getMetadataValue(selectedAsset, ["TypeExam", "typeExam"])}</span>
                </div>
                {!selectedAssetIsImage && (
                  <>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Speaker</span>
                      <span className={styles.infoValue}>{getMetadataValue(selectedAsset, ["Speaker", "speaker"])}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>TotalSection</span>
                      <span className={styles.infoValue}>{getMetadataValue(selectedAsset, ["TotalSection", "totalSection"])}</span>
                    </div>
                  </>
                )}
              </div>
              {!selectedAssetIsImage && (
                <section className={styles.stopPointDetailPanel}>
                <div className={styles.stopPointDetailPanelHeader}>
                  <span>StopPoint</span>
                  <strong>{getMetadataStopPoints(selectedAsset).length}</strong>
                </div>
                {getMetadataStopPoints(selectedAsset).length === 0 ? (
                  <p className={styles.stopPointEmpty}>Chưa có stop point.</p>
                ) : (
                  <div className={styles.stopPointDetailList}>
                    {getMetadataStopPoints(selectedAsset).map((point, index) => (
                      <div className={styles.stopPointDetailItem} key={`${point.title}-${index}`}>
                        <strong>{point.title || `Stop point ${index + 1}`}</strong>
                        <span>{point.startTime} - {point.endTime}</span>
                      </div>
                    ))}
                  </div>
                )}
                </section>
              )}
              <footer className={styles.panelFooter}>
                <button className={teacherStyles.columnsButton} onClick={closePanel} type="button">
                  Đóng
                </button>
              </footer>
            </div>
          )}

          {panelMode === "edit" && selectedAsset && (
            <form className={`${styles.panelBody} ${styles.editPanelBody}`} onSubmit={handleUpdateSubmit}>
              <div className={styles.formGrid}>
                <label className={styles.formField}>
                  Asset type
                  <select
                    className={styles.selectControl}
                    disabled
                    value={editForm.assetType}
                  >
                    <option value={editForm.assetType}>{findOptionLabel(assetTypes, editForm.assetType)}</option>
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
                {!editAssetIsImage && (
                  <>
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
                    <label className={`${styles.formField} ${styles.fullSpan}`}>
                      Speaker
                      <input
                        className={styles.inputControl}
                        onChange={(event) => setEditForm((current) => ({ ...current, speaker: event.target.value }))}
                        placeholder="Speaker name"
                        type="text"
                        value={editForm.speaker}
                      />
                    </label>
                    <label className={styles.formField}>
                      TotalSection
                      <input
                        className={styles.inputControl}
                        min={1}
                        onChange={(event) => handleEditTotalSectionChange(event.target.value)}
                        step={1}
                        type="number"
                        value={editForm.totalSection}
                      />
                    </label>
                  </>
                )}
                <label className={styles.formField}>
                  TypeExam
                  <input className={styles.inputControl} readOnly type="text" value={editForm.typeExam || "IELTS"} />
                </label>
                {!editAssetIsImage && (
                  <div className={`${styles.stopPointSection} ${styles.fullSpan}`}>
                  <div className={styles.stopPointHeader}>
                    <div>
                      <h3>StopPoint</h3>
                      <p>Danh sách mốc nghe được lưu vào metadataJson của audio.</p>
                    </div>
                    <button className={styles.addStopPointButton} onClick={addEditStopPoint} type="button">
                      <Plus aria-hidden="true" size={16} />
                      Thêm mốc
                    </button>
                  </div>
                  {editForm.stopPoints.length === 0 ? (
                    <p className={styles.stopPointEmpty}>Chưa có stop point.</p>
                  ) : (
                    <div className={styles.stopPointList}>
                      {editForm.stopPoints.map((point, index) => (
                        <div className={styles.stopPointItem} key={point.id}>
                          <div className={styles.stopPointItemHeader}>
                            <strong>Stop point {index + 1}</strong>
                            <button
                              className={styles.stopPointRemove}
                              onClick={() => removeEditStopPoint(point.id)}
                              title="Xóa stop point"
                              type="button"
                            >
                              <Trash2 aria-hidden="true" size={15} />
                            </button>
                          </div>
                          <label className={styles.formField}>
                            Title
                            <input
                              className={styles.inputControl}
                              onChange={(event) => updateEditStopPoint(point.id, "title", event.target.value)}
                              placeholder="Section 1"
                              type="text"
                              value={point.title}
                            />
                          </label>
                          <div className={styles.stopPointTimeGrid}>
                            <label className={styles.formField}>
                              StartTime
                              <input
                                className={styles.inputControl}
                                onChange={(event) => updateEditStopPoint(point.id, "startTime", event.target.value)}
                                placeholder="00:00"
                                type="text"
                                value={point.startTime}
                              />
                            </label>
                            <label className={styles.formField}>
                              EndTime
                              <input
                                className={styles.inputControl}
                                onChange={(event) => updateEditStopPoint(point.id, "endTime", event.target.value)}
                                placeholder="05:30"
                                type="text"
                                value={point.endTime}
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                )}
              </div>
              <footer className={styles.panelFooter}>
                <button className={teacherStyles.columnsButton} onClick={closePanel} type="button">
                  Hủy
                </button>
                <button className={listStyles.createButton} disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <Loader2 aria-hidden="true" className={styles.loadingIcon} size={18} />
                  ) : (
                    <Save aria-hidden="true" size={18} />
                  )}
                  {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </footer>
            </form>
          )}
        </aside>
      </div>
    );
  };

  return (
    <>
    <div className={styles.page}>
      <section className={styles.pageHero}>
        <div>
          <Link className={styles.backLink} to="/admin/practice-bank/ielts/listening">
            ← Quay lại danh sách Listening
          </Link>
          <h1>Danh Sách Audio/Image</h1>
          <p>Quản lý audio assets dùng cho IELTS Listening. File upload sử dụng asset type từ metadata BE.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.createButton} disabled={!audioAssetType} onClick={openUploadPanel} type="button">
            <Upload aria-hidden="true" size={18} />
            Upload file
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
              setFilters((current) => ({ ...current, provider: event.target.value }));
              setPage(1);
            }}
            value={filters.provider}
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
              setFilters((current) => ({ ...current, status: event.target.value }));
              setPage(1);
            }}
            value={filters.status}
          >
            <option value="">Trạng thái: Tất cả</option>
            {statuses.map((option) => (
              <option key={getOptionValue(option)} value={getOptionValue(option)}>
                {getOptionLabel(option)}
              </option>
            ))}
          </select>
          <div className={teacherStyles.toolbarActions}>
            <button
              className={teacherStyles.filterButton}
              type="button"
              onClick={() => {
                setDraftFilters(filters);
                setIsFilterPanelOpen(true);
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
                onClick={() => setIsColumnsMenuOpen((current) => !current)}
              >
                <Columns3 aria-hidden="true" size={17} />
                Columns
              </button>
              {isColumnsMenuOpen && (
                <div className={`${teacherStyles.dropdownMenu} ${teacherStyles.columnsMenu}`}>
                  {columns.map((column) => (
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
        </form>
      </section>

      <section className={`${listStyles.tablePanel} ${compactStyles.tablePanelCompact} ${styles.audioTablePanel}`}>
        <div className={listStyles.tableScroll}>
          <table className={`${listStyles.table} ${compactStyles.tableCompact} ${styles.audioTable}`}>
            <thead>
              <tr>
                <th className={!visibleColumns.name ? styles.hiddenColumn : undefined}>Tên audio</th>
                <th className={!visibleColumns.assetType ? styles.hiddenColumn : undefined}>Asset type</th>
                <th className={!visibleColumns.provider ? styles.hiddenColumn : undefined}>Provider</th>
                <th className={!visibleColumns.status ? styles.hiddenColumn : undefined}>Trạng thái</th>
                <th className={!visibleColumns.duration ? styles.hiddenColumn : undefined}>Duration</th>
                <th className={!visibleColumns.size ? styles.hiddenColumn : undefined}>Size</th>
                <th className={!visibleColumns.createdAt ? styles.hiddenColumn : undefined}>Ngày tạo</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={visibleColumnCount}>
                    <div className={styles.emptyState}>Đang tải danh sách audio...</div>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumnCount}>
                    <div className={styles.emptyState}>Không có audio phù hợp.</div>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id}>
                    <td className={!visibleColumns.name ? styles.hiddenColumn : undefined}>
                      <div className={styles.assetName} title={getAssetName(asset)}>
                        <strong>{getAssetName(asset)}</strong>
                        <span className={styles.assetMeta}>{asset.contentType ?? getAssetUrl(asset) ?? "-"}</span>
                      </div>
                    </td>
                    <td className={!visibleColumns.assetType ? styles.hiddenColumn : undefined}>{findOptionLabel(assetTypes, asset.assetType)}</td>
                    <td className={!visibleColumns.provider ? styles.hiddenColumn : undefined}>{findOptionLabel(providers, asset.provider)}</td>
                    <td className={!visibleColumns.status ? styles.hiddenColumn : undefined}>
                      <span className={`${crudStyles.statusBadge} ${crudStyles.statusBadgePublished}`}>
                        {findOptionLabel(statuses, asset.status)}
                      </span>
                    </td>
                    <td className={!visibleColumns.duration ? styles.hiddenColumn : undefined}>{formatDuration(asset.durationSeconds)}</td>
                    <td className={!visibleColumns.size ? styles.hiddenColumn : undefined}>{formatBytes(asset.fileSize)}</td>
                    <td className={!visibleColumns.createdAt ? styles.hiddenColumn : undefined}>{formatDateTime(asset.createdAt)}</td>
                    <td>
                      <div className={listStyles.actions}>
                        <button
                          onClick={() => void openViewPanel(asset)}
                          title="Xem chi tiết"
                          type="button"
                        >
                          <Eye aria-hidden="true" size={16} />
                        </button>
                        <button
                          onClick={() => void openEditPanel(asset)}
                          title="Chỉnh sửa"
                          type="button"
                        >
                          <Edit3 aria-hidden="true" size={16} />
                        </button>
                        <button
                          className={listStyles.deleteAction}
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

    <SidePanel
      description="Lọc danh sách audio theo provider và trạng thái."
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
          <span>Provider</span>
          <select
            value={draftFilters.provider}
            onChange={(event) => setDraftFilters((current) => ({ ...current, provider: event.target.value }))}
          >
            <option value="">Tất cả</option>
            {providers.map((option) => (
              <option key={getOptionValue(option)} value={getOptionValue(option)}>
                {getOptionLabel(option)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Trạng thái</span>
          <select
            value={draftFilters.status}
            onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="">Tất cả</option>
            {statuses.map((option) => (
              <option key={getOptionValue(option)} value={getOptionValue(option)}>
                {getOptionLabel(option)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </SidePanel>

    <ConfirmModal
      cancelText="Hủy"
      confirmText={isDeleting ? "Đang xóa..." : "Xóa"}
      description={deletingAsset ? `Bạn có chắc muốn xóa audio "${getAssetName(deletingAsset)}"?` : ""}
      isConfirmDisabled={isDeleting}
      isOpen={Boolean(deletingAsset)}
      title="Xác nhận xóa audio"
      tone="danger"
      onCancel={() => setDeletingAsset(null)}
      onConfirm={handleConfirmDelete}
    />
    </>
  );
};
