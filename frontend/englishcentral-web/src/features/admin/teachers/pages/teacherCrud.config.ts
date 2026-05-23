import type { CrudColumn, CrudRecord } from "@/features/admin/shared/components/AdminCrud/AdminCrudListPage";
import type { CrudField } from "@/features/admin/shared/components/AdminCrud/AdminCrudFormPage";

export const teacherRecords: CrudRecord[] = [
  { id: "1", code: "TCH-001", fullName: "Ms. Linh", email: "linh@ec.vn", phone: "0901111222", specialty: "IELTS", joinedAt: "2026-05-02", status: "active", bio: "IELTS trainer." },
  { id: "2", code: "TCH-002", fullName: "Mr. David", email: "david@ec.vn", phone: "0902222333", specialty: "TOEIC", joinedAt: "2026-04-20", status: "active", bio: "Listening specialist." },
  { id: "3", code: "TCH-003", fullName: "Ms. An", email: "an@ec.vn", phone: "0903333444", specialty: "Speaking", joinedAt: "2026-04-12", status: "pending", bio: "Communication coach." },
  { id: "4", code: "TCH-004", fullName: "Mr. Ryan", email: "ryan@ec.vn", phone: "0904444555", specialty: "Writing", joinedAt: "2026-03-28", status: "inactive", bio: "Writing reviewer." },
];

export const teacherColumns: CrudColumn[] = [
  { key: "code", label: "Mã giáo viên", sortable: true },
  { key: "fullName", label: "Họ tên", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "phone", label: "SĐT", sortable: true },
  { key: "specialty", label: "Chuyên môn", sortable: true },
  { key: "joinedAt", label: "Ngày vào", sortable: true },
  { key: "status", label: "Trạng thái", sortable: true, render: (record) => statusLabel[String(record.status)] },
];

export const teacherFields: CrudField[] = [
  { key: "code", label: "Mã giáo viên", type: "text" },
  { key: "fullName", label: "Họ tên", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "phone", label: "SĐT", type: "text" },
  { key: "specialty", label: "Chuyên môn", type: "text" },
  { key: "joinedAt", label: "Ngày vào", type: "date" },
  {
    key: "status",
    label: "Trạng thái",
    type: "select",
    options: [
      { label: "Đang dạy", value: "active" },
      { label: "Chờ duyệt", value: "pending" },
      { label: "Tạm dừng", value: "inactive" },
    ],
  },
  { key: "bio", label: "Giới thiệu", type: "textarea" },
];

export const teacherDefaultValue: CrudRecord = {
  bio: "",
  code: "",
  email: "",
  fullName: "",
  id: "new",
  joinedAt: "2026-05-23",
  phone: "",
  specialty: "",
  status: "active",
};

export const teacherStatusOptions = [
  { label: "Đang dạy", value: "active" },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Tạm dừng", value: "inactive" },
];

const statusLabel: Record<string, string> = {
  active: "Đang dạy",
  inactive: "Tạm dừng",
  pending: "Chờ duyệt",
};
