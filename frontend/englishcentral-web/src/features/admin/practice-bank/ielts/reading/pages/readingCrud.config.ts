import type { CrudColumn, CrudRecord } from "@/features/admin/shared/components/AdminCrud/AdminCrudListPage";

export const readingRecords: CrudRecord[] = [
  { id: "1", code: "RD-001", title: "Urban Farming", level: "Band 5.5-6.0", passages: 3, questions: 40, createdAt: "2026-05-18", status: "draft" },
  { id: "2", code: "RD-002", title: "The History of Glass", level: "Band 6.0-6.5", passages: 3, questions: 40, createdAt: "2026-05-12", status: "published" },
  { id: "3", code: "RD-003", title: "Ocean Navigation", level: "Band 6.5-7.0", passages: 3, questions: 40, createdAt: "2026-04-28", status: "draft" },
  { id: "4", code: "RD-004", title: "Artificial Intelligence", level: "Band 7.0+", passages: 3, questions: 40, createdAt: "2026-04-20", status: "published" },
];

export const readingColumns: CrudColumn[] = [
  { key: "code", label: "Mã đề", sortable: true },
  { key: "title", label: "Tên đề", sortable: true },
  { key: "level", label: "Level", sortable: true },
  { key: "passages", label: "Passages", sortable: true },
  { key: "questions", label: "Questions", sortable: true },
  { key: "createdAt", label: "Ngày tạo", sortable: true },
  { key: "status", label: "Trạng thái", sortable: true, render: (record) => statusLabel[String(record.status)] },
];

export const readingStatusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

const statusLabel: Record<string, string> = {
  draft: "Draft",
  published: "Published",
};
