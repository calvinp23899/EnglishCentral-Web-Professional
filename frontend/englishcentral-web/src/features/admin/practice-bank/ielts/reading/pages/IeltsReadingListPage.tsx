import { AdminCrudListPage } from "@/features/admin/shared/components/AdminCrud/AdminCrudListPage";

import { readingColumns, readingRecords, readingStatusOptions } from "./readingCrud.config";

export function IeltsReadingListPage() {
  return (
    <AdminCrudListPage
      columns={readingColumns}
      createPath="/admin/practice-bank/ielts/reading/create"
      dateKey="createdAt"
      description="Quản lý đề IELTS Reading, passages, question groups và trạng thái xuất bản."
      editPath={(record) => `/admin/practice-bank/ielts/reading/${record.id}/edit`}
      initialRecords={readingRecords}
      searchKeys={["code", "title", "level"]}
      statusOptions={readingStatusOptions}
      title="IELTS Reading"
      viewPath={(record) => `/admin/practice-bank/ielts/reading/${record.id}/view`}
    />
  );
}
