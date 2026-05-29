import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  Laptop,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  adminStudentsApi,
  type AdminStudent,
  type StudentStatus,
} from "@/features/admin/students/api/admin-students-api";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import styles from "./StudentViewPage.module.scss";

type TabKey = "info" | "account" | "classes" | "webPractice";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "info", label: "Thông tin" },
  { key: "account", label: "Tài Khoản" },
  { key: "classes", label: "Lớp học" },
  { key: "webPractice", label: "Làm bài web" },
];

const statusToneByValue: Record<StudentStatus, "active" | "inactive"> = {
  Active: "active",
  Inactive: "inactive",
};

const formatDate = (value?: string) => {
  if (!value) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const displayValue = (value?: string | number | null) =>
  value === undefined || value === null || value === "" ? "Chưa cập nhật" : value;

export function StudentViewPage() {
  const { studentId } = useParams();
  const [student, setStudent] = useState<AdminStudent | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadStudent = async () => {
      if (!studentId) {
        setErrorMessage("Không tìm thấy mã học viên.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await adminStudentsApi.getById(studentId);

        if (isMounted) {
          setStudent(result);
        }
      } catch (error) {
        if (isMounted) {
          setStudent(null);
          setErrorMessage(getAuthErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStudent();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const accountStatus = useMemo(() => {
    if (!student?.account) {
      return "Chưa liên kết";
    }

    return student.account.isDelete ? "Đã khóa" : "Đang hoạt động";
  }, [student]);

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to="/admin/students">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>{student?.fullName ?? "Chi tiết học viên"}</h1>
          <p>
            {student
              ? `${student.studentCode} · ${student.status}`
              : "Thông tin hồ sơ và hoạt động học viên"}
          </p>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.tabs} role="tablist" aria-label="Student detail tabs">
          {tabs.map((tab) => (
            <button
              className={activeTab === tab.key ? styles.activeTab : ""}
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && <div className={styles.stateBlock}>Đang tải thông tin học viên...</div>}

        {!isLoading && errorMessage && (
          <div className={styles.stateBlock}>{errorMessage}</div>
        )}

        {!isLoading && !errorMessage && student && activeTab === "info" && (
          <div className={styles.infoGrid}>
            <article className={styles.profileCard}>
              <UserRound aria-hidden="true" size={24} />
              <div>
                <span>Học viên</span>
                <strong>{student.fullName}</strong>
                <p>{displayValue(student.notes)}</p>
              </div>
            </article>
            <article>
              <ShieldCheck aria-hidden="true" size={20} />
              <span>Trạng thái</span>
              <strong className={`${styles.statusBadge} ${styles[statusToneByValue[student.status]]}`}>
                {student.status}
              </strong>
            </article>
            <article>
              <Mail aria-hidden="true" size={20} />
              <span>Email</span>
              <strong>{displayValue(student.email)}</strong>
            </article>
            <article>
              <Phone aria-hidden="true" size={20} />
              <span>SĐT</span>
              <strong>{displayValue(student.phoneNumber)}</strong>
            </article>
            <article>
              <ClipboardCheck aria-hidden="true" size={20} />
              <span>Ngày đăng ký</span>
              <strong>{formatDate(student.registeredAt)}</strong>
            </article>
            <article>
              <UsersRound aria-hidden="true" size={20} />
              <span>Phụ huynh</span>
              <strong>{displayValue(student.parentName)}</strong>
            </article>
          </div>
        )}

        {!isLoading && !errorMessage && student && activeTab === "account" && (
          <div className={styles.infoGrid}>
            <article className={styles.profileCard}>
              <ShieldCheck aria-hidden="true" size={24} />
              <div>
                <span>Tài khoản</span>
                <strong>{accountStatus}</strong>
                <p>{displayValue(student.account?.accountEmail ?? student.email)}</p>
              </div>
            </article>
            <article>
              <UserRound aria-hidden="true" size={20} />
              <span>Account ID</span>
              <strong>{displayValue(student.account?.accountId)}</strong>
            </article>
            <article>
              <Mail aria-hidden="true" size={20} />
              <span>Email đăng nhập</span>
              <strong>{displayValue(student.account?.accountEmail)}</strong>
            </article>
            <article>
              <ShieldCheck aria-hidden="true" size={20} />
              <span>Trạng thái tài khoản</span>
              <strong>{accountStatus}</strong>
            </article>
          </div>
        )}

        {!isLoading && !errorMessage && student && activeTab === "classes" && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Lớp học</th>
                  <th>Khóa học</th>
                  <th>Giáo viên</th>
                  <th>Lịch học</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Chưa có dữ liệu lớp</strong>
                  </td>
                  <td colSpan={4}>API lớp học theo học viên chưa được tích hợp ở màn hình này.</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !errorMessage && student && activeTab === "webPractice" && (
          <div className={styles.practiceGrid}>
            <article>
              <Laptop aria-hidden="true" size={22} />
              <span>Bài đã làm</span>
              <strong>0</strong>
            </article>
            <article>
              <BookOpen aria-hidden="true" size={22} />
              <span>Bài đang giao</span>
              <strong>0</strong>
            </article>
            <article>
              <ClipboardCheck aria-hidden="true" size={22} />
              <span>Điểm gần nhất</span>
              <strong>Chưa có</strong>
            </article>
          </div>
        )}
      </section>
    </div>
  );
}
