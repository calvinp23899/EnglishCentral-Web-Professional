import { AdminCrudListPage } from "@/features/admin/shared/components/AdminCrud/AdminCrudListPage";

import { classColumns, classRecords, classStatusOptions } from "./classCrud.config";

export function ClassListPage() {
  return (
    <AdminCrudListPage
      columns={classColumns}
      createPath="/admin/classes/create"
      dateKey="startDate"
      description="Quản lý lớp học, giáo viên phụ trách, lịch học và trạng thái vận hành."
      editPath={(record) => `/admin/classes/${record.id}/edit`}
      initialRecords={classRecords}
      searchKeys={["code", "name", "course", "teacher"]}
      statusOptions={classStatusOptions}
      title="Danh sách lớp học"
    />
  );
}
