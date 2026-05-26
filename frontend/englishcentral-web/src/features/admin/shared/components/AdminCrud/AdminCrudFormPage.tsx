import { useMemo, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { toastSuccess } from "@/components/ui";

import type { CrudRecord } from "./AdminCrudListPage";
import styles from "./AdminCrudPage.module.scss";

export type CrudField = {
  key: string;
  label: string;
  options?: Array<{ label: string; value: string }>;
  type: "date" | "select" | "textarea" | "text";
};

type Props = {
  defaultValue: CrudRecord;
  fields: CrudField[];
  listPath: string;
  mode: "create" | "edit";
  records: CrudRecord[];
  title: string;
};

export function AdminCrudFormPage({
  defaultValue,
  fields,
  listPath,
  mode,
  records,
  title,
}: Props) {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const sourceRecord = useMemo(
    () =>
      mode === "edit"
        ? records.find((record) => String(record.id) === recordId) ?? defaultValue
        : defaultValue,
    [defaultValue, mode, recordId, records],
  );
  const [formValue, setFormValue] = useState<CrudRecord>(sourceRecord);

  const updateField = (key: string, value: string) => {
    setFormValue((currentValue) => ({
      ...currentValue,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toastSuccess(mode === "create" ? "Tạo mới thành công." : "Lưu thay đổi thành công.");
    navigate(listPath);
  };

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to={listPath}>
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>{title}</h1>
        </div>
      </section>

      <form className={styles.formPanel} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          {fields.map((field) => (
            <label
              className={`${styles.field} ${
                field.type === "textarea" ? styles.fullField : ""
              }`}
              key={field.key}
            >
              <span>{field.label}</span>
              {field.type === "select" ? (
                <select
                  value={String(formValue[field.key] ?? "")}
                  onChange={(event) => updateField(field.key, event.target.value)}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  rows={5}
                  value={String(formValue[field.key] ?? "")}
                  onChange={(event) => updateField(field.key, event.target.value)}
                />
              ) : (
                <input
                  type={field.type}
                  value={String(formValue[field.key] ?? "")}
                  onChange={(event) => updateField(field.key, event.target.value)}
                />
              )}
            </label>
          ))}
        </div>

        <div className={styles.formActions}>
          <button
            className={styles.cancelButton}
            type="button"
            onClick={() => setFormValue(sourceRecord)}
          >
            Hủy
          </button>
          <button type="submit">
            <Save aria-hidden="true" size={17} />
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
