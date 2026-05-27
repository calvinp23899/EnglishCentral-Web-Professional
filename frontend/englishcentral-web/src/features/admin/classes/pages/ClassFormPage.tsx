import { AdminCrudFormPage } from "@/features/admin/shared/components/AdminCrud/AdminCrudFormPage";

import { classDefaultValue, classFields, classRecords } from "./classCrud.config";

type Props = {
  mode: "create" | "edit";
};

export function ClassFormPage({ mode }: Props) {
  return (
    <AdminCrudFormPage
      defaultValue={classDefaultValue}
      fields={classFields}
      listPath="/admin/classes"
      mode={mode}
      records={classRecords}
      title={mode === "create" ? "Tạo lớp học" : "Chỉnh sửa lớp học"}
    />
  );
}
