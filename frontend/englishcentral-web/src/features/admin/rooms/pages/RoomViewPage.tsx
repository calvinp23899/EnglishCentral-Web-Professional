import { useEffect, useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { toastDanger } from "@/components/ui";
import { adminRoomsApi, type AdminRoom } from "@/features/admin/rooms/api/admin-rooms-api";
import listStyles from "@/features/admin/students/pages/StudentListPage.module.scss";
import styles from "@/features/admin/students/pages/StudentCreatePage.module.scss";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

export function RoomViewPage() {
  const { recordId } = useParams();
  const [record, setRecord] = useState<AdminRoom | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));

  useEffect(() => {
    if (!recordId) {
      return;
    }

    let isMounted = true;

    adminRoomsApi
      .getById(recordId)
      .then((result) => {
        if (isMounted) {
          setRecord(result);
        }
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
  }, [recordId]);

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to="/admin/rooms">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>Chi tiết phòng học</h1>
        </div>

        {record && (
          <Link className={listStyles.createButton} to={`/admin/rooms/${record.id}/edit`}>
            <Edit3 aria-hidden="true" size={16} />
            Chỉnh sửa
          </Link>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Thông tin phòng học</h2>
            <p>Xem thông tin phòng học đang lưu trong hệ thống.</p>
          </div>
        </div>

        {isLoading ? (
          <p className={styles.accountState}>Đang tải thông tin phòng học...</p>
        ) : record ? (
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Mã phòng</span>
              <input readOnly value={record.code} />
            </label>

            <label className={styles.field}>
              <span>Tên phòng</span>
              <input readOnly value={record.name} />
            </label>

            <label className={styles.field}>
              <span>Sức chứa</span>
              <input readOnly value={record.capacity} />
            </label>

            <label className={styles.field}>
              <span>Tòa nhà</span>
              <input readOnly value={record.building ?? "Chưa cập nhật"} />
            </label>

            <label className={styles.field}>
              <span>Tầng</span>
              <input readOnly value={record.floor ?? "Chưa cập nhật"} />
            </label>

            <label className={styles.field}>
              <span>Trạng thái</span>
              <input readOnly value={record.isActive ? "Hoạt động" : "Ngừng hoạt động"} />
            </label>
          </div>
        ) : (
          <p className={styles.accountState}>Không tìm thấy phòng học.</p>
        )}
      </section>
    </div>
  );
}
