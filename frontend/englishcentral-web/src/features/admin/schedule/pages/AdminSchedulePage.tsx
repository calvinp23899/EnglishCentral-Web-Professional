import { useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
} from "lucide-react";

import { SidePanel } from "@/components/ui";

import styles from "./AdminSchedulePage.module.scss";

type ViewMode = "day" | "week";
type LessonTone = "blue" | "green" | "red" | "yellow" | "orange" | "purple" | "pink";

type Lesson = {
  date: string;
  duration: number;
  room: string;
  start: number;
  teacher: string;
  title: string;
  tone: LessonTone;
};

type RepeatConfig = {
  endDate: string;
  isEnabled: boolean;
  startDate: string;
  weekDays: number[];
};

const hourSlots = Array.from({ length: 16 }, (_, index) => index + 7);
const weekDayLabels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const colorOptions: Array<{ label: string; tone: LessonTone }> = [
  { label: "Xanh dương", tone: "blue" },
  { label: "Xanh lá", tone: "green" },
  { label: "Đỏ", tone: "red" },
  { label: "Vàng", tone: "yellow" },
  { label: "Cam", tone: "orange" },
  { label: "Tím", tone: "purple" },
  { label: "Hồng", tone: "pink" },
];

const initialLessons: Lesson[] = [
  {
    date: "2026-05-18",
    duration: 2,
    room: "A204",
    start: 8,
    teacher: "Ms. Linh",
    title: "IELTS Foundation",
    tone: "blue",
  },
  {
    date: "2026-05-19",
    duration: 1.5,
    room: "B102",
    start: 10,
    teacher: "Mr. David",
    title: "TOEIC Listening",
    tone: "green",
  },
  {
    date: "2026-05-20",
    duration: 2,
    room: "Online",
    start: 14,
    teacher: "Ms. An",
    title: "Speaking Clinic",
    tone: "orange",
  },
  {
    date: "2026-05-22",
    duration: 2,
    room: "C301",
    start: 18,
    teacher: "Mr. Ryan",
    title: "Writing Task 2",
    tone: "purple",
  },
  {
    date: "2026-05-23",
    duration: 2.5,
    room: "A101",
    start: 9,
    teacher: "Ms. Mai",
    title: "Kids Starters",
    tone: "pink",
  },
];

const initialLessonForm: Lesson = {
  date: "2026-05-23",
  duration: 1,
  room: "",
  start: 7,
  teacher: "",
  title: "",
  tone: "blue",
};

const initialRepeatConfig: RepeatConfig = {
  endDate: "2026-05-23",
  isEnabled: false,
  startDate: "2026-05-23",
  weekDays: [],
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const isDateKey = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const getRepeatedLessons = (lesson: Lesson, repeatConfig: RepeatConfig) => {
  if (
    repeatConfig.weekDays.length === 0 ||
    !isDateKey(repeatConfig.startDate) ||
    !isDateKey(repeatConfig.endDate)
  ) {
    return [lesson];
  }

  const startDate = parseDateKey(repeatConfig.startDate);
  const endDate = parseDateKey(repeatConfig.endDate);
  const repeatedLessons: Lesson[] = [];

  for (
    let currentDate = startDate;
    currentDate <= endDate;
    currentDate = addDays(currentDate, 1)
  ) {
    if (repeatConfig.weekDays.includes(currentDate.getDay())) {
      repeatedLessons.push({
        ...lesson,
        date: toDateKey(currentDate),
      });
    }
  }

  return repeatedLessons.length > 0 ? repeatedLessons : [lesson];
};

export function AdminSchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [activeDate, setActiveDate] = useState(() => new Date(2026, 4, 23));
  const [lessonRecords, setLessonRecords] = useState<Lesson[]>(initialLessons);
  const [isCreatePanelOpen, setCreatePanelOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState<Lesson>(initialLessonForm);
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfig>(initialRepeatConfig);
  const dateInputRef = useRef<HTMLInputElement>(null);

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

  const handleNavigate = (direction: -1 | 1) => {
    setActiveDate((currentDate) =>
      viewMode === "week"
        ? addDays(currentDate, direction * 7)
        : addDays(currentDate, direction),
    );
  };

  const openDatePicker = () => {
    dateInputRef.current?.showPicker?.();
    dateInputRef.current?.focus();
  };

  const handleOpenCreatePanel = () => {
    setLessonForm({
      ...initialLessonForm,
      date: activeDateKey,
    });
    setRepeatConfig({
      ...initialRepeatConfig,
      endDate: activeDateKey,
      startDate: activeDateKey,
    });
    setCreatePanelOpen(true);
  };

  const handleCreateLesson = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isDateKey(lessonForm.date)) {
      return;
    }

    const lessonsToCreate = repeatConfig.isEnabled
      ? getRepeatedLessons(lessonForm, repeatConfig)
      : [lessonForm];

    setLessonRecords((currentLessons) => [...currentLessons, ...lessonsToCreate]);
    setCreatePanelOpen(false);
  };

  const toggleRepeatWeekday = (dayValue: number) => {
    setRepeatConfig((currentConfig) => {
      const isSelected = currentConfig.weekDays.includes(dayValue);

      return {
        ...currentConfig,
        weekDays: isSelected
          ? currentConfig.weekDays.filter((item) => item !== dayValue)
          : [...currentConfig.weekDays, dayValue],
      };
    });
  };

  const renderLessonCard = (lesson: Lesson) => (
    <article
      className={`${styles.lessonCard} ${styles[lesson.tone]}`}
      key={`${lesson.title}-${lesson.date}-${lesson.start}`}
      style={{
        height: `${lesson.duration * 64 - 8}px`,
        top: `${(lesson.start - 7) * 64 + 4}px`,
      }}
    >
      <strong>{lesson.title}</strong>
      <span>{`${lesson.start.toString().padStart(2, "0")}:00`}</span>
      <p>
        {lesson.teacher} · {lesson.room}
      </p>
    </article>
  );

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <h1>Lịch</h1>
          <p>
            {viewMode === "week"
              ? "Lịch theo tuần, từ 07:00 đến 22:00."
              : "Lịch theo ngày, từ 07:00 đến 22:00."}
          </p>
        </div>

        <div className={styles.headerActions}>
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
            <button
              type="button"
              aria-label={viewMode === "week" ? "Tuần trước" : "Ngày trước"}
              onClick={() => handleNavigate(-1)}
            >
              <ChevronLeft aria-hidden="true" size={17} />
            </button>
            {viewMode === "day" ? (
              <button
                className={styles.datePickerButton}
                type="button"
                onClick={openDatePicker}
              >
                {activeLabel}
                <input
                  ref={dateInputRef}
                  aria-label="Chọn ngày"
                  type="date"
                  value={activeDateKey}
                  onChange={(event) => {
                    if (!isDateKey(event.target.value)) {
                      return;
                    }

                    setActiveDate(parseDateKey(event.target.value));
                  }}
                />
              </button>
            ) : (
              <strong>{activeLabel}</strong>
            )}
            <button
              type="button"
              aria-label={viewMode === "week" ? "Tuần sau" : "Ngày sau"}
              onClick={() => handleNavigate(1)}
            >
              <ChevronRight aria-hidden="true" size={17} />
            </button>
          </div>

          <button
            className={styles.createButton}
            type="button"
            onClick={handleOpenCreatePanel}
          >
            <Plus aria-hidden="true" size={18} />
            Tạo lịch
          </button>
        </div>
      </section>

      {viewMode === "day" ? (
        <section className={styles.dayPanel}>
          <div className={styles.dayTimeline}>
            <div className={styles.dayTitle}>
              <strong>{formatLongDate(activeDate)}</strong>
              <span>07:00 - 22:00</span>
            </div>

            {hourSlots.map((hour, hourIndex) => (
              <div
                className={styles.dayTimeCell}
                key={hour}
                style={{ gridRow: hourIndex + 2 }}
              >
                {`${hour.toString().padStart(2, "0")}:00`}
              </div>
            ))}

            <div className={styles.singleDayColumn}>
              {hourSlots.map((hour) => (
                <div className={styles.hourLine} key={`${activeDateKey}-${hour}`} />
              ))}

              {lessonRecords
                .filter((lesson) => lesson.date === activeDateKey)
                .map((lesson) => renderLessonCard(lesson))}
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.calendarPanel}>
          <div className={styles.calendarGrid}>
            <div className={styles.cornerCell} />
            {weekDays.map((day) => (
              <div className={styles.dayHeader} key={day.dateKey}>
                <strong>{day.label}</strong>
                <span>{day.shortDate}</span>
              </div>
            ))}

            {hourSlots.map((hour, hourIndex) => (
              <div
                className={styles.timeCell}
                key={hour}
                style={{ gridRow: hourIndex + 2 }}
              >
                {`${hour.toString().padStart(2, "0")}:00`}
              </div>
            ))}

            {weekDays.map((day, dayIndex) => (
              <div
                className={styles.dayColumn}
                key={day.dateKey}
                style={{ gridColumn: dayIndex + 2 }}
              >
                {hourSlots.map((hour) => (
                  <div className={styles.hourLine} key={`${day.dateKey}-${hour}`} />
                ))}

                {lessonRecords
                  .filter((lesson) => lesson.date === day.dateKey)
                  .map((lesson) => renderLessonCard(lesson))}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.summaryGrid}>
        <article>
          <CalendarDays aria-hidden="true" size={19} />
          <div>
            <span>Tổng buổi</span>
            <strong>{lessonRecords.length}</strong>
          </div>
        </article>
        <article>
          <Clock aria-hidden="true" size={19} />
          <div>
            <span>Giờ hoạt động</span>
            <strong>07:00 - 22:00</strong>
          </div>
        </article>
      </section>

      <SidePanel
        description="Thêm buổi học vào lịch hiện tại."
        footer={
          <div className={styles.panelActions}>
            <button
              className={styles.cancelPanelButton}
              type="button"
              onClick={() => setCreatePanelOpen(false)}
            >
              Hủy
            </button>
            <button type="submit" form="create-schedule-form">
              Tạo lịch
            </button>
          </div>
        }
        isOpen={isCreatePanelOpen}
        title="Tạo lịch"
        onClose={() => setCreatePanelOpen(false)}
      >
            <form
              className={styles.panelForm}
              id="create-schedule-form"
              onSubmit={handleCreateLesson}
            >
              <label className={styles.field}>
                <span>Tên lịch</span>
                <input
                  required
                  value={lessonForm.title}
                  onChange={(event) =>
                    setLessonForm((currentForm) => ({
                      ...currentForm,
                      title: event.target.value,
                    }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Ngày</span>
                <input
                  type="date"
                  value={lessonForm.date}
                  onChange={(event) =>
                    setLessonForm((currentForm) => ({
                      ...currentForm,
                      date: event.target.value,
                    }))
                  }
                />
              </label>

              <section className={styles.repeatBox}>
                <label className={styles.repeatToggle}>
                  <input
                    type="checkbox"
                    checked={repeatConfig.isEnabled}
                    onChange={(event) =>
                      setRepeatConfig((currentConfig) => ({
                        ...currentConfig,
                        isEnabled: event.target.checked,
                      }))
                    }
                  />
                  <span>Lặp lại theo thứ</span>
                </label>

                {repeatConfig.isEnabled && (
                  <div className={styles.repeatContent}>
                    <div className={styles.weekdayPicker}>
                      {weekDayLabels.map((label, index) => {
                        const dayValue = index === 6 ? 0 : index + 1;

                        return (
                          <button
                            className={
                              repeatConfig.weekDays.includes(dayValue)
                                ? styles.selectedWeekday
                                : ""
                            }
                            key={label}
                            type="button"
                            onClick={() => toggleRepeatWeekday(dayValue)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    <div className={styles.formRow}>
                      <label className={styles.field}>
                        <span>Từ ngày</span>
                        <input
                          type="date"
                          value={repeatConfig.startDate}
                          onChange={(event) =>
                            setRepeatConfig((currentConfig) => ({
                              ...currentConfig,
                              startDate: event.target.value,
                            }))
                          }
                        />
                      </label>

                      <label className={styles.field}>
                        <span>Đến ngày</span>
                        <input
                          type="date"
                          value={repeatConfig.endDate}
                          onChange={(event) =>
                            setRepeatConfig((currentConfig) => ({
                              ...currentConfig,
                              endDate: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}
              </section>

              <div className={styles.formRow}>
                <label className={styles.field}>
                  <span>Giờ bắt đầu</span>
                  <select
                    value={lessonForm.start}
                    onChange={(event) =>
                      setLessonForm((currentForm) => ({
                        ...currentForm,
                        start: Number(event.target.value),
                      }))
                    }
                  >
                    {hourSlots.map((hour) => (
                      <option key={hour} value={hour}>
                        {`${hour.toString().padStart(2, "0")}:00`}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Thời lượng</span>
                  <select
                    value={lessonForm.duration}
                    onChange={(event) =>
                      setLessonForm((currentForm) => ({
                        ...currentForm,
                        duration: Number(event.target.value),
                      }))
                    }
                  >
                    <option value={1}>1 giờ</option>
                    <option value={1.5}>1.5 giờ</option>
                    <option value={2}>2 giờ</option>
                    <option value={2.5}>2.5 giờ</option>
                    <option value={3}>3 giờ</option>
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                <span>Giáo viên</span>
                <input
                  value={lessonForm.teacher}
                  onChange={(event) =>
                    setLessonForm((currentForm) => ({
                      ...currentForm,
                      teacher: event.target.value,
                    }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Phòng học</span>
                <input
                  value={lessonForm.room}
                  onChange={(event) =>
                    setLessonForm((currentForm) => ({
                      ...currentForm,
                      room: event.target.value,
                    }))
                  }
                />
              </label>

              <div className={styles.colorField}>
                <span>Màu lịch</span>
                <div className={styles.colorGrid}>
                  {colorOptions.map((option) => (
                    <button
                      className={`${styles.colorSwatch} ${styles[option.tone]} ${
                        lessonForm.tone === option.tone ? styles.selectedColor : ""
                      }`}
                      key={option.tone}
                      type="button"
                      aria-label={option.label}
                      onClick={() =>
                        setLessonForm((currentForm) => ({
                          ...currentForm,
                          tone: option.tone,
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

            </form>
      </SidePanel>
    </div>
  );
}
