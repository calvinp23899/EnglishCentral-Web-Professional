import { AdminCrudFormPage } from "@/features/admin/shared/components/AdminCrud/AdminCrudFormPage";

import { courseDefaultValue, courseFields, courseRecords } from "./courseCrud.config";

type Props = {
  mode: "create" | "edit";
};

export function CourseFormPage({ mode }: Props) {
  return (
    <AdminCrudFormPage
      defaultValue={courseDefaultValue}
      fields={courseFields}
      listPath="/admin/courses"
      mode={mode}
      records={courseRecords}
      title={mode === "create" ? "Tạo khóa học" : "Chỉnh sửa khóa học"}
    />
  );
}
