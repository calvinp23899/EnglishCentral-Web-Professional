import { AdminCrudListPage } from "@/features/admin/shared/components/AdminCrud/AdminCrudListPage";

import { teacherColumns, teacherRecords, teacherStatusOptions } from "./teacherCrud.config";

export function TeacherListPage() {
  return (
    <AdminCrudListPage
      columns={teacherColumns}
      createPath="/admin/teachers/create"
      dateKey="joinedAt"
      description="Quản lý hồ sơ giáo viên, chuyên môn, liên hệ và trạng thái giảng dạy."
      editPath={(record) => `/admin/teachers/${record.id}/edit`}
      initialRecords={teacherRecords}
      searchKeys={["code", "fullName", "email", "phone", "specialty"]}
      statusOptions={teacherStatusOptions}
      title="Danh sách giáo viên"
      viewPath={(record) => `/admin/teachers/${record.id}/view`}
    />
  );
}
