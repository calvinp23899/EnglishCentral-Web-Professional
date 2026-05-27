import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
  UsersRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { students } from "@/features/admin/students/data/mockStudents";

import { classRecords } from "./classCrud.config";
import styles from "./ClassViewPage.module.scss";

type TabKey = "info" | "sessions" | "students";

type SessionRecord = {
  date: string;
  duration: string;
  lesson: string;
  room: string;
  status: string;
  teacher: string;
  time: string;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "info", label: "Thông tin" },
  { key: "sessions", label: "Buổi Học" },
  { key: "students", label: "Học Viên" },
];

const statusLabel: Record<string, string> = {
  active: "Đang học",
  inactive: "Tạm dừng",
  pending: "Chờ mở",
};

const sessionRecords: Record<string, SessionRecord[]> = {
  "1": [
    { date: "2026-05-18", duration: "120 phút", lesson: "Placement review", room: "A204", status: "Đã học", teacher: "Ms. Linh", time: "08:00" },
    { date: "2026-05-20", duration: "120 phút", lesson: "Reading strategies", room: "A204", status: "Đã học", teacher: "Ms. Linh", time: "08:00" },
    { date: "2026-05-25", duration: "120 phút", lesson: "Listening foundation", room: "A204", status: "Sắp học", teacher: "Ms. Linh", time: "08:00" },
  ],
  "2": [
    { date: "2026-05-20", duration: "120 phút", lesson: "TOEIC Part 1-2", room: "B102", status: "Đã học", teacher: "Mr. David", time: "10:00" },
    { date: "2026-05-22", duration: "120 phút", lesson: "TOEIC Part 3", room: "B102", status: "Sắp học", teacher: "Mr. David", time: "10:00" },
  ],
  "3": [
    { date: "2026-04-28", duration: "90 phút", lesson: "Speaking warm-up", room: "Online", status: "Đã học", teacher: "Ms. An", time: "14:00" },
  ],
  "4": [
    { date: "2026-04-12", duration: "150 phút", lesson: "Kids starters intro", room: "A101", status: "Đã học", teacher: "Ms. Mai", time: "09:00" },
  ],
};

const studentIdsByClassId: Record<string, string[]> = {
  "1": ["1", "3", "5", "9", "11"],
  "2": ["2", "6", "10"],
  "3": ["4", "7"],
  "4": ["8", "12"],
};

const formatDate = (value: string | number) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(String(value)));

export function ClassViewPage() {
  const { recordId } = useParams();
  const classRecord =
    classRecords.find((record) => String(record.id) === recordId) ?? classRecords[0];
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const sessions = sessionRecords[String(classRecord.id)] ?? [];
  const classStudents = (studentIdsByClassId[String(classRecord.id)] ?? [])
    .map((studentId) => students.find((student) => student.id === studentId))
    .filter(Boolean);

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to="/admin/classes">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>{classRecord.name}</h1>
          <p>
            {classRecord.code} · {classRecord.course} · {statusLabel[String(classRecord.status)]}
          </p>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.tabs} role="tablist" aria-label="Class detail tabs">
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

        {activeTab === "info" && (
          <div className={styles.infoGrid}>
            <article className={styles.heroCard}>
              <BookOpen aria-hidden="true" size={24} />
              <div>
                <span>Lớp học</span>
                <strong>{classRecord.name}</strong>
                <p>{classRecord.note}</p>
              </div>
            </article>
            <article>
              <GraduationCap aria-hidden="true" size={20} />
              <span>Giáo viên</span>
              <strong>{classRecord.teacher}</strong>
            </article>
            <article>
              <CalendarDays aria-hidden="true" size={20} />
              <span>Ngày bắt đầu</span>
              <strong>{formatDate(classRecord.startDate)}</strong>
            </article>
            <article>
              <Clock aria-hidden="true" size={20} />
              <span>Lịch học</span>
              <strong>{classRecord.schedule}</strong>
            </article>
            <article>
              <MapPin aria-hidden="true" size={20} />
              <span>Phòng học</span>
              <strong>{classRecord.note}</strong>
            </article>
            <article>
              <UsersRound aria-hidden="true" size={20} />
              <span>Sĩ số</span>
              <strong>{classStudents.length} học viên</strong>
            </article>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Giờ</th>
                  <th>Bài học</th>
                  <th>Giáo viên</th>
                  <th>Phòng</th>
                  <th>Thời lượng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={`${session.date}-${session.lesson}`}>
                    <td>{formatDate(session.date)}</td>
                    <td>{session.time}</td>
                    <td>
                      <strong>{session.lesson}</strong>
                    </td>
                    <td>{session.teacher}</td>
                    <td>{session.room}</td>
                    <td>{session.duration}</td>
                    <td>
                      <span className={styles.statusBadge}>{session.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "students" && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã học viên</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student) => (
                  <tr key={student?.id}>
                    <td>
                      <strong>{student?.studentCode}</strong>
                    </td>
                    <td>{student?.fullName}</td>
                    <td>{student?.email}</td>
                    <td>{student?.phoneNumber}</td>
                    <td>{student ? formatDate(student.registeredAt) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
