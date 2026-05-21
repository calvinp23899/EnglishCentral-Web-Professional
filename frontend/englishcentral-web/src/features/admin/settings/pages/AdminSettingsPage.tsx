import { Bell, Globe2, LockKeyhole } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader/AdminPageHeader";
import { AdminSectionCard } from "@/features/admin/shared/components/AdminSectionCard/AdminSectionCard";

import styles from "./AdminSettingsPage.module.scss";

const notificationSettings = [
  {
    title: "Thông báo qua email",
    description: "Nhận cập nhật về tài khoản, lớp học và học viên qua email",
    enabled: true,
  },
  {
    title: "Thông báo đẩy",
    description: "Nhận thông báo nhanh trên thiết bị của bạn",
    enabled: true,
  },
  {
    title: "Thông báo SMS",
    description: "Nhận cảnh báo quan trọng qua tin nhắn",
    enabled: false,
  },
];

export function AdminSettingsPage() {
  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Cài đặt"
        description="Quản lý tùy chọn tài khoản và cấu hình hệ thống quản trị."
      />

      <AdminSectionCard icon={Bell} title="Thông báo">
        <div className={styles.settingList}>
          {notificationSettings.map((setting) => (
            <div className={styles.settingRow} key={setting.title}>
              <div>
                <strong>{setting.title}</strong>
                <p>{setting.description}</p>
              </div>
              <button
                className={`${styles.switch} ${
                  setting.enabled ? styles.switchOn : ""
                }`}
                type="button"
                aria-label={setting.title}
                aria-pressed={setting.enabled}
              >
                <span />
              </button>
            </div>
          ))}
        </div>
      </AdminSectionCard>

      <AdminSectionCard icon={LockKeyhole} title="Quyền riêng tư & bảo mật">
        <div className={styles.settingList}>
          <div className={styles.settingRow}>
            <div>
              <strong>Xác thực hai lớp</strong>
              <p>Tăng cường bảo mật cho tài khoản quản trị</p>
            </div>
            <button className={styles.outlineButton} type="button">
              Bật
            </button>
          </div>

          <div className={styles.settingRow}>
            <div>
              <strong>Lịch sử đăng nhập</strong>
              <p>Xem hoạt động đăng nhập gần đây của tài khoản</p>
            </div>
            <button className={styles.outlineButton} type="button">
              Xem
            </button>
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard icon={Globe2} title="Ngôn ngữ & khu vực">
        <div className={styles.formGrid}>
          <label>
            <span>Ngôn ngữ</span>
            <select defaultValue="vi-VN">
              <option value="vi-VN">Tiếng Việt</option>
              <option value="en-US">English (US)</option>
            </select>
          </label>

          <label>
            <span>Múi giờ</span>
            <select defaultValue="asia-ho-chi-minh">
              <option value="asia-ho-chi-minh">Giờ Việt Nam (GMT+7)</option>
              <option value="asia-bangkok">Giờ Bangkok (GMT+7)</option>
            </select>
          </label>
        </div>
      </AdminSectionCard>
    </div>
  );
}
