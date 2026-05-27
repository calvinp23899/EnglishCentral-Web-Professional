import type { CrudColumn, CrudRecord } from "@/features/admin/shared/components/AdminCrud/AdminCrudListPage";
import type { CrudField } from "@/features/admin/shared/components/AdminCrud/AdminCrudFormPage";

export const courseRecords: CrudRecord[] = [
  { id: "1", code: "CRS-001", name: "IELTS Foundation", level: "Beginner", tuition: "4,500,000", createdAt: "2026-05-12", status: "active", description: "Khóa nền tảng IELTS." },
  { id: "2", code: "CRS-002", name: "TOEIC Intensive", level: "Intermediate", tuition: "3,800,000", createdAt: "2026-05-08", status: "active", description: "Luyện TOEIC cấp tốc." },
  { id: "3", code: "CRS-003", name: "English Communication", level: "All levels", tuition: "2,900,000", createdAt: "2026-04-22", status: "draft", description: "Giao tiếp thực tế." },
  { id: "4", code: "CRS-004", name: "Kids Starters", level: "Kids", tuition: "3,200,000", createdAt: "2026-04-10", status: "inactive", description: "Tiếng Anh thiếu nhi." },
];

export const courseColumns: CrudColumn[] = [
  { key: "code", label: "Mã khóa học", sortable: true },
  { key: "name", label: "Tên khóa học", sortable: true },
  { key: "level", label: "Cấp độ", sortable: true },
  { key: "tuition", label: "Học phí", sortable: true },
  { key: "createdAt", label: "Ngày tạo", sortable: true },
  { key: "status", label: "Trạng thái", sortable: true, render: (record) => statusLabel[String(record.status)] },
];

export const courseFields: CrudField[] = [
  { key: "code", label: "Mã khóa học", type: "text" },
  { key: "name", label: "Tên khóa học", type: "text" },
  { key: "level", label: "Cấp độ", type: "text" },
  { key: "tuition", label: "Học phí", type: "text" },
  { key: "createdAt", label: "Ngày tạo", type: "date" },
  {
    key: "status",
    label: "Trạng thái",
    type: "select",
    options: [
      { label: "Đang mở", value: "active" },
      { label: "Nháp", value: "draft" },
      { label: "Tạm dừng", value: "inactive" },
    ],
  },
  { key: "description", label: "Mô tả", type: "textarea" },
];

export const courseDefaultValue: CrudRecord = {
  code: "",
  createdAt: "2026-05-23",
  description: "",
  id: "new",
  level: "",
  name: "",
  status: "active",
  tuition: "",
};

export const courseStatusOptions = [
  { label: "Đang mở", value: "active" },
  { label: "Nháp", value: "draft" },
  { label: "Tạm dừng", value: "inactive" },
];

const statusLabel: Record<string, string> = {
  active: "Đang mở",
  draft: "Nháp",
  inactive: "Tạm dừng",
};
