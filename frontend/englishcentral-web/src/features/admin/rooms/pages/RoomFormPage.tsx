import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorMessage, toastDanger, toastSuccess } from "@/components/ui";
import { adminRoomsApi, type RoomFormPayload } from "@/features/admin/rooms/api/admin-rooms-api";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

type Props = {
  mode: "create" | "edit";
};

type FormState = {
  name: string;
  capacity: string;
  building: string;
  floor: string;
  isActive: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  name: "",
  capacity: "1",
  building: "",
  floor: "",
  isActive: true,
};

export function RoomFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const isEditMode = mode === "edit";
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode || !recordId) {
      return;
    }

    let isMounted = true;

    adminRoomsApi
      .getById(recordId)
      .then((record) => {
        if (!isMounted) {
          return;
        }

        setForm({
          name: record.name,
          capacity: String(record.capacity),
          building: record.building ?? "",
          floor: record.floor === null || record.floor === undefined ? "" : String(record.floor),
          isActive: record.isActive,
        });
      })
      .catch((error) => {
        if (isMounted) {
          toastDanger(getAuthErrorMessage(error));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isEditMode, recordId]);

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const capacity = Number(form.capacity);
    const floor = form.floor ? Number(form.floor) : null;

    if (!form.name.trim()) {
      nextErrors.name = "Vui lòng nhập tên phòng.";
    } else if (form.name.trim().length > 255) {
      nextErrors.name = "Tên phòng không được vượt quá 255 ký tự.";
    }

    if (!Number.isFinite(capacity) || capacity < 1) {
      nextErrors.capacity = "Sức chứa phải lớn hơn 0.";
    }

    if (floor !== null && (!Number.isFinite(floor) || floor < 0)) {
      nextErrors.floor = "Tầng phải là số không âm.";
    }

    if (form.building.trim().length > 255) {
      nextErrors.building = "Tòa nhà không được vượt quá 255 ký tự.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate() || isSubmitting) {
      return;
    }

    const payload: RoomFormPayload = {
      name: form.name.trim(),
      capacity: Number(form.capacity),
      building: form.building.trim() || null,
      floor: form.floor ? Number(form.floor) : null,
      isActive: form.isActive,
    };

    setIsSubmitting(true);

    try {
      if (isEditMode && recordId) {
        await adminRoomsApi.update(recordId, { ...payload, id: Number(recordId) });
        toastSuccess("Cập nhật phòng học thành công.");
      } else {
        await adminRoomsApi.create(payload);
        toastSuccess("Tạo phòng học thành công.");
      }

      navigate("/admin/rooms");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to="/admin/rooms">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>{isEditMode ? "Chỉnh sửa phòng học" : "Tạo phòng học"}</h1>
        </div>
      </section>

      <form className={styles.panel} onSubmit={handleSubmit}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Thông tin phòng học</h2>
            <p>{isEditMode ? "Cập nhật thông tin phòng học." : "Nhập thông tin phòng học mới để sử dụng khi tạo lớp."}</p>
          </div>
        </div>

        {isLoading ? (
          <p className={styles.accountState}>Đang tải thông tin phòng học...</p>
        ) : (
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Tên phòng <em className={styles.requiredMark}>*</em></span>
              <input aria-describedby="room-name-error" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
              <ErrorMessage id="room-name-error" message={errors.name} />
            </label>

            <label className={styles.field}>
              <span>Sức chứa <em className={styles.requiredMark}>*</em></span>
              <input aria-describedby="room-capacity-error" inputMode="numeric" value={form.capacity} onChange={(event) => updateField("capacity", event.target.value.replace(/[^\d]/g, ""))} />
              <ErrorMessage id="room-capacity-error" message={errors.capacity} />
            </label>

            <label className={styles.field}>
              <span>Tòa nhà</span>
              <input aria-describedby="room-building-error" value={form.building} onChange={(event) => updateField("building", event.target.value)} />
              <ErrorMessage id="room-building-error" message={errors.building} />
            </label>

            <label className={styles.field}>
              <span>Tầng</span>
              <input aria-describedby="room-floor-error" inputMode="numeric" value={form.floor} onChange={(event) => updateField("floor", event.target.value.replace(/[^\d]/g, ""))} />
              <ErrorMessage id="room-floor-error" message={errors.floor} />
            </label>

            <label className={styles.field}>
              <span>Trạng thái <em className={styles.requiredMark}>*</em></span>
              <select value={String(form.isActive)} onChange={(event) => updateField("isActive", event.target.value === "true")}>
                <option value="true">Hoạt động</option>
                <option value="false">Ngừng hoạt động</option>
              </select>
            </label>
          </div>
        )}

        <div className={styles.formActions}>
          <button className={styles.secondaryButton} type="button" onClick={() => navigate("/admin/rooms")}>
            Hủy
          </button>
          <button type="submit" disabled={isLoading || isSubmitting}>
            <Save aria-hidden="true" size={16} />
            {isSubmitting ? "Đang lưu..." : "Lưu phòng học"}
          </button>
        </div>
      </form>
    </div>
  );
}
