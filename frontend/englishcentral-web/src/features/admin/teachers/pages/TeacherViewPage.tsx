import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  UserRoundCheck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { toastDanger } from "@/components/ui";
import {
  adminTeachersApi,
  type AdminTeacher,
} from "@/features/admin/teachers/api/admin-teachers-api";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import styles from "./TeacherViewPage.module.scss";

type TabKey = "info" | "schedule" | "performance";
type ViewMode = "day" | "week";

type TeacherLesson = {
  className: string;
  date: string;
  duration: number;
  room: string;
  start: number;
  tone: "blue" | "green" | "orange" | "purple";
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "info", label: "Thông Tin" },
  { key: "schedule", label: "Lịch Học" },
  { key: "performance", label: "Hiệu Suất" },
];

const hourSlots = Array.from({ length: 16 }, (_, index) => index + 7);
const weekDayLabels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const lessonRecords: Record<string, TeacherLesson[]> = {
  "1": [
    { className: "IELTS Foundation", date: "2026-05-18", duration: 2, room: "A204", start: 8, tone: "blue" },
    { className: "IELTS Writing Task 2", date: "2026-05-20", duration: 1.5, room: "B102", start: 14, tone: "purple" },
    { className: "Speaking Clinic", date: "2026-05-23", duration: 2, room: "Online", start: 9, tone: "orange" },
  ],
  "2": [
    { className: "TOEIC Listening", date: "2026-05-19", duration: 1.5, room: "B102", start: 10, tone: "green" },
    { className: "TOEIC Intensive", date: "2026-05-21", duration: 2, room: "C301", start: 18, tone: "blue" },
  ],
  "3": [
    { className: "English Communication", date: "2026-05-20", duration: 2, room: "Online", start: 14, tone: "orange" },
  ],
  "4": [
    { className: "Writing Review", date: "2026-05-22", duration: 2, room: "C301", start: 18, tone: "purple" },
  ],
};

const statusLabel: Record<string, string> = {
  "1": "Đang dạy",
  "2": "Tạm dừng",
  "3": "Tạm khóa",
  "4": "Đã nghỉ",
  Active: "Đang dạy",
  Inactive: "Tạm dừng",
  Suspended: "Tạm khóa",
  Resigned: "Đã nghỉ",
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
};

const getWeekStart = (date: Date) => {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  return addDays(date, mondayOffset);
};

const formatShortDate = (date: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);

const formatLongDate = (date: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

export function TeacherViewPage() {
  const { recordId } = useParams();
  const [teacher, setTeacher] = useState<AdminTeacher | null>(null);
  const teacherLessons = lessonRecords[String(teacher?.id ?? "")] ?? [];
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [activeDate, setActiveDate] = useState(() => new Date(2026, 4, 23));
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!recordId) {
      return;
    }

    adminTeachersApi
      .getById(recordId)
      .then(setTeacher)
      .catch((error) => toastDanger(getAuthErrorMessage(error)));
  }, [recordId]);

  const weekDays = useMemo(() => {
    const startDate = getWeekStart(activeDate);

    return weekDayLabels.map((label, index) => {
      const date = addDays(startDate, index);

      return {
        date,
        dateKey: toDateKey(date),
        label,
        shortDate: formatShortDate(date),
      };
    });
  }, [activeDate]);

  const activeDateKey = toDateKey(activeDate);
  const activeLabel =
    viewMode === "week"
      ? `${formatShortDate(weekDays[0].date)} - ${formatShortDate(weekDays[6].date)}`
      : formatLongDate(activeDate);

  const totalHours = teacherLessons.reduce((total, lesson) => total + lesson.duration, 0);

  if (!teacher) {
    return <div className={styles.page}>Đang tải thông tin giáo viên...</div>;
  }

  const handleNavigate = (direction: -1 | 1) => {
    setActiveDate((currentDate) =>
      viewMode === "week"
        ? addDays(currentDate, direction * 7)
        : addDays(currentDate, direction),
    );
  };

  const renderLessonCard = (lesson: TeacherLesson) => (
    <article
      className={`${styles.lessonCard} ${styles[lesson.tone]}`}
      key={`${lesson.className}-${lesson.date}-${lesson.start}`}
      style={{
        height: `${lesson.duration * 64 - 8}px`,
        top: `${(lesson.start - 7) * 64 + 4}px`,
      }}
    >
      <strong>{lesson.className}</strong>
      <span>{`${lesson.start.toString().padStart(2, "0")}:00`}</span>
      <p>{lesson.room}</p>
    </article>
  );

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to="/admin/teachers">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>{teacher.fullName}</h1>
          <p>{teacher.teacherCode} · {teacher.specialization} · {statusLabel[String(teacher.status)]}</p>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.tabs} role="tablist" aria-label="Teacher detail tabs">
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
            <article className={styles.profileCard}>
              <UserRoundCheck aria-hidden="true" size={24} />
              <div>
                <span>Giáo viên</span>
                <strong>{teacher.fullName}</strong>
                <p>{teacher.bio}</p>
              </div>
            </article>
            <article>
              <Mail aria-hidden="true" size={20} />
              <span>Email</span>
              <strong>{teacher.email}</strong>
            </article>
            <article>
              <Phone aria-hidden="true" size={20} />
              <span>Số điện thoại</span>
              <strong>{teacher.phoneNumber}</strong>
            </article>
            <article>
              <CalendarDays aria-hidden="true" size={20} />
              <span>Ngày vào</span>
              <strong>{teacher.hireDate ? formatLongDate(parseDateKey(teacher.hireDate)) : "Chưa cập nhật"}</strong>
            </article>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className={styles.scheduleTab}>
            <div className={styles.scheduleToolbar}>
              <div className={styles.viewSwitch} aria-label="Chế độ xem lịch">
                <button
                  className={viewMode === "day" ? styles.activeView : ""}
                  type="button"
                  onClick={() => setViewMode("day")}
                >
                  Ngày
                </button>
                <button
                  className={viewMode === "week" ? styles.activeView : ""}
                  type="button"
                  onClick={() => setViewMode("week")}
                >
                  Tuần
                </button>
              </div>

              <div className={styles.weekControl}>
                <button type="button" aria-label="Trước" onClick={() => handleNavigate(-1)}>
                  <ChevronLeft aria-hidden="true" size={17} />
                </button>
                {viewMode === "day" ? (
                  <button
                    className={styles.datePickerButton}
                    type="button"
                    onClick={() => {
                      dateInputRef.current?.showPicker?.();
                      dateInputRef.current?.focus();
                    }}
                  >
                    {activeLabel}
                    <input
                      ref={dateInputRef}
                      aria-label="Chọn ngày"
                      type="date"
                      value={activeDateKey}
                      onChange={(event) => setActiveDate(parseDateKey(event.target.value))}
                    />
                  </button>
                ) : (
                  <strong>{activeLabel}</strong>
                )}
                <button type="button" aria-label="Sau" onClick={() => handleNavigate(1)}>
                  <ChevronRight aria-hidden="true" size={17} />
                </button>
              </div>
            </div>

            {viewMode === "day" ? (
              <div className={styles.dayPanel}>
                <div className={styles.dayTimeline}>
                  <div className={styles.dayTitle}>
                    <strong>{formatLongDate(activeDate)}</strong>
                    <span>07:00 - 22:00</span>
                  </div>
                  {hourSlots.map((hour, hourIndex) => (
                    <div className={styles.dayTimeCell} key={hour} style={{ gridRow: hourIndex + 2 }}>
                      {`${hour.toString().padStart(2, "0")}:00`}
                    </div>
                  ))}
                  <div className={styles.singleDayColumn}>
                    {hourSlots.map((hour) => (
                      <div className={styles.hourLine} key={`${activeDateKey}-${hour}`} />
                    ))}
                    {teacherLessons
                      .filter((lesson) => lesson.date === activeDateKey)
                      .map((lesson) => renderLessonCard(lesson))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.calendarPanel}>
                <div className={styles.calendarGrid}>
                  <div className={styles.cornerCell} />
                  {weekDays.map((day) => (
                    <div className={styles.dayHeader} key={day.dateKey}>
                      <strong>{day.label}</strong>
                      <span>{day.shortDate}</span>
                    </div>
                  ))}
                  {hourSlots.map((hour, hourIndex) => (
                    <div className={styles.timeCell} key={hour} style={{ gridRow: hourIndex + 2 }}>
                      {`${hour.toString().padStart(2, "0")}:00`}
                    </div>
                  ))}
                  {weekDays.map((day, dayIndex) => (
                    <div className={styles.dayColumn} key={day.dateKey} style={{ gridColumn: dayIndex + 2 }}>
                      {hourSlots.map((hour) => (
                        <div className={styles.hourLine} key={`${day.dateKey}-${hour}`} />
                      ))}
                      {teacherLessons
                        .filter((lesson) => lesson.date === day.dateKey)
                        .map((lesson) => renderLessonCard(lesson))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "performance" && (
          <div className={styles.performanceGrid}>
            <article>
              <BarChart3 aria-hidden="true" size={21} />
              <span>Tổng lớp phụ trách</span>
              <strong>{teacherLessons.length}</strong>
            </article>
            <article>
              <Clock aria-hidden="true" size={21} />
              <span>Tổng giờ dạy</span>
              <strong>{totalHours}h</strong>
            </article>
            <article>
              <UserRoundCheck aria-hidden="true" size={21} />
              <span>Đánh giá trung bình</span>
              <strong>4.8/5</strong>
            </article>
          </div>
        )}
      </section>
    </div>
  );
}
