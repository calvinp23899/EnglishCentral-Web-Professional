import { AdminCrudFormPage } from "@/features/admin/shared/components/AdminCrud/AdminCrudFormPage";

import { teacherDefaultValue, teacherFields, teacherRecords } from "./teacherCrud.config";

type Props = {
  mode: "create" | "edit";
};

export function TeacherFormPage({ mode }: Props) {
  return (
    <AdminCrudFormPage
      defaultValue={teacherDefaultValue}
      fields={teacherFields}
      listPath="/admin/teachers"
      mode={mode}
      records={teacherRecords}
      title={mode === "create" ? "Tạo giáo viên" : "Chỉnh sửa giáo viên"}
    />
  );
}
