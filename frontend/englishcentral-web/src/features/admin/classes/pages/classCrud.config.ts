import type { CrudColumn, CrudRecord } from "@/features/admin/shared/components/AdminCrud/AdminCrudListPage";
import type { CrudField } from "@/features/admin/shared/components/AdminCrud/AdminCrudFormPage";

export const classRecords: CrudRecord[] = [
  { id: "1", code: "CLS-001", name: "IELTS FDN A1", course: "IELTS Foundation", teacher: "Ms. Linh", startDate: "2026-05-18", schedule: "T2/T4 08:00", status: "active", note: "Phòng A204" },
  { id: "2", code: "CLS-002", name: "TOEIC INT B2", course: "TOEIC Intensive", teacher: "Mr. David", startDate: "2026-05-20", schedule: "T3/T5 10:00", status: "active", note: "Phòng B102" },
  { id: "3", code: "CLS-003", name: "Speaking Clinic", course: "English Communication", teacher: "Ms. An", startDate: "2026-04-28", schedule: "T4 14:00", status: "pending", note: "Online" },
  { id: "4", code: "CLS-004", name: "Kids Weekend", course: "Kids Starters", teacher: "Ms. Mai", startDate: "2026-04-12", schedule: "T7 09:00", status: "inactive", note: "Phòng A101" },
];

export const classColumns: CrudColumn[] = [
  { key: "code", label: "Mã lớp", sortable: true },
  { key: "name", label: "Tên lớp", sortable: true },
  { key: "course", label: "Khóa học", sortable: true },
  { key: "teacher", label: "Giáo viên", sortable: true },
  { key: "schedule", label: "Lịch học", sortable: true },
  { key: "startDate", label: "Ngày bắt đầu", sortable: true },
  { key: "status", label: "Trạng thái", sortable: true, render: (record) => statusLabel[String(record.status)] },
];

export const classFields: CrudField[] = [
  { key: "code", label: "Mã lớp", type: "text" },
  { key: "name", label: "Tên lớp", type: "text" },
  { key: "course", label: "Khóa học", type: "text" },
  { key: "teacher", label: "Giáo viên", type: "text" },
  { key: "schedule", label: "Lịch học", type: "text" },
  { key: "startDate", label: "Ngày bắt đầu", type: "date" },
  {
    key: "status",
    label: "Trạng thái",
    type: "select",
    options: [
      { label: "Đang học", value: "active" },
      { label: "Chờ mở", value: "pending" },
      { label: "Tạm dừng", value: "inactive" },
    ],
  },
  { key: "note", label: "Ghi chú", type: "textarea" },
];

export const classDefaultValue: CrudRecord = {
  code: "",
  course: "",
  id: "new",
  name: "",
  note: "",
  schedule: "",
  startDate: "2026-05-23",
  status: "active",
  teacher: "",
};

export const classStatusOptions = [
  { label: "Đang học", value: "active" },
  { label: "Chờ mở", value: "pending" },
  { label: "Tạm dừng", value: "inactive" },
];

const statusLabel: Record<string, string> = {
  active: "Đang học",
  inactive: "Tạm dừng",
  pending: "Chờ mở",
};
