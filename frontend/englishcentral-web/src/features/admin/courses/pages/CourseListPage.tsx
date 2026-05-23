import { AdminCrudListPage } from "@/features/admin/shared/components/AdminCrud/AdminCrudListPage";

import { courseColumns, courseRecords, courseStatusOptions } from "./courseCrud.config";

export function CourseListPage() {
  return (
    <AdminCrudListPage
      columns={courseColumns}
      createPath="/admin/courses/create"
      dateKey="createdAt"
      description="Quản lý khóa học, cấp độ, học phí và trạng thái mở bán."
      editPath={(record) => `/admin/courses/${record.id}/edit`}
      initialRecords={courseRecords}
      searchKeys={["code", "name", "level"]}
      statusOptions={courseStatusOptions}
      title="Danh sách khóa học"
    />
  );
}
