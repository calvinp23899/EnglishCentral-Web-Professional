import { CalendarDays, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader/AdminPageHeader";
import { AdminSectionCard } from "@/features/admin/shared/components/AdminSectionCard/AdminSectionCard";

import styles from "./AdminProfilePage.module.scss";

const profileFields = [
  { label: "CCCD", value: "2026******" },
  { label: "Giới tính", value: "Nam / Nữ" },
  { label: "Ngày sinh", value: "**/**/****" },
  { label: "Địa chỉ", value: "Đà Nẵng" },
];

const permissionItems = [
  "Quản lý học viên",
  "Quản lý khóa học",
  "Quản lý lớp học",
  "Xem báo cáo học tập",
  "Cấu hình hệ thống",
];

export function AdminProfilePage() {
  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Hồ sơ quản trị"
        description="Quản lý thông tin cá nhân, vai trò và quyền truy cập của tài khoản quản trị."
      />

      <section className={styles.profileHero}>
        <div className={styles.avatar}>AD</div>
        <div>
          <span>Quản trị viên</span>
          <h2>Admin English Central</h2>
          <p>Academic Operations · English Central Management</p>
        </div>
        <button type="button">Chỉnh sửa hồ sơ</button>
      </section>

      <div className={styles.grid}>
        <AdminSectionCard icon={UserRound} title="Thông tin cá nhân">
          <div className={styles.fieldGrid}>
            {profileFields.map((field) => (
              <div className={styles.fieldItem} key={field.label}>
                <span>{field.label}</span>
                <strong>{field.value}</strong>
              </div>
            ))}
          </div>
        </AdminSectionCard>

        <AdminSectionCard icon={ShieldCheck} title="Vai trò & quyền truy cập">
          <div className={styles.roleCard}>
            <span>Vai trò hiện tại</span>
            <strong>Super Admin</strong>
            <p>Toàn quyền quản lý hệ thống LMS và dữ liệu vận hành.</p>
          </div>

          <div className={styles.permissionList}>
            {permissionItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </AdminSectionCard>

        <AdminSectionCard icon={Mail} title="Liên hệ">
          <div className={styles.contactList}>
            <div>
              <Mail aria-hidden="true" size={16} />
              <span>admin@englishcentral.vn</span>
            </div>
            <div>
              <Phone aria-hidden="true" size={16} />
              <span>0909 123 456</span>
            </div>
          </div>
        </AdminSectionCard>

        <AdminSectionCard icon={CalendarDays} title="Hoạt động gần đây">
          <div className={styles.activityList}>
            <div>
              <strong>Đăng nhập gần nhất</strong>
              <span>Hôm nay, 08:30</span>
            </div>
            <div>
              <strong>Cập nhật cài đặt thông báo</strong>
              <span>Hôm qua, 16:12</span>
            </div>
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}
