import { CalendarDays, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { toastDanger } from "@/components/ui";
import {
  adminProfileApi,
  type AdminMeProfile,
} from "@/features/admin/profile/api/admin-profile-api";
import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader/AdminPageHeader";
import { AdminSectionCard } from "@/features/admin/shared/components/AdminSectionCard/AdminSectionCard";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import styles from "./AdminProfilePage.module.scss";

const permissionItems = [
  "Quản lý học viên",
  "Quản lý khóa học",
  "Quản lý lớp học",
  "Xem báo cáo học tập",
  "Cấu hình hệ thống",
];

const getInitials = (name?: string) => {
  if (!name?.trim()) {
    return "AD";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const formatDate = (value?: string) => {
  if (!value) {
    return "Chưa cập nhật";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
};

const formatGender = (value?: string | number) => {
  if (value === undefined || value === null || value === "") {
    return "Chưa cập nhật";
  }

  const normalized = String(value).toLowerCase();

  if (normalized === "0" || normalized === "male" || normalized === "nam") {
    return "Nam";
  }

  if (normalized === "1" || normalized === "female" || normalized === "nữ") {
    return "Nữ";
  }

  return String(value);
};

export function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminMeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const nextProfile = await adminProfileApi.getMeProfile();

        if (isMounted) {
          setProfile(nextProfile);
        }
      } catch (error) {
        toastDanger(getAuthErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const teacher = profile?.teacher;
  const displayName = teacher?.fullName ?? profile?.fullName ?? "Admin";
  const displayEmail = teacher?.email ?? profile?.email ?? "Chưa cập nhật";
  const displayPhone =
    teacher?.phoneNumber ?? profile?.phoneNumber ?? "Chưa cập nhật";
  const roleName = teacher?.specialization ?? teacher?.degree ?? "Quản trị viên";
  const profileFields = useMemo(
    () => [
      { label: "Mã giáo viên", value: teacher?.teacherCode ?? "Chưa cập nhật" },
      { label: "CCCD", value: teacher?.nationalId ?? "Chưa cập nhật" },
      { label: "Giới tính", value: formatGender(teacher?.gender) },
      { label: "Ngày sinh", value: formatDate(teacher?.dateOfBirth) },
      { label: "Địa chỉ", value: teacher?.address ?? "Chưa cập nhật" },
      {
        label: "Ngày vào làm",
        value: formatDate(teacher?.hireDate),
      },
    ],
    [teacher]
  );

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Hồ sơ quản trị"
        description="Quản lý thông tin cá nhân, vai trò và quyền truy cập của tài khoản quản trị."
      />

      <section className={styles.profileHero}>
        <div className={styles.avatar}>{getInitials(displayName)}</div>
        <div>
          <span>{isLoading ? "Đang tải hồ sơ" : roleName}</span>
          <h2>{isLoading ? "Đang tải..." : displayName}</h2>
          <p>{displayEmail} · English Central Management</p>
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
            <strong>{roleName}</strong>
            <p>{teacher?.bio ?? "Tài khoản có quyền truy cập trang quản trị."}</p>
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
              <span>{displayEmail}</span>
            </div>
            <div>
              <Phone aria-hidden="true" size={16} />
              <span>{displayPhone}</span>
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
