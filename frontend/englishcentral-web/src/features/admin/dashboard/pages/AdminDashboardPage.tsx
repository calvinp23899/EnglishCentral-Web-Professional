import {
  Activity,
  ArrowUpRight,
  BookMarked,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Headphones,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import styles from "./AdminDashboardPage.module.scss";

const metricCards = [
  {
    label: "Active Students",
    value: "1,284",
    change: "+12.4%",
    tone: "blue",
    icon: UsersRound,
  },
  {
    label: "Course Enrollments",
    value: "436",
    change: "+8.1%",
    tone: "emerald",
    icon: BookMarked,
  },
  {
    label: "IELTS Avg Band",
    value: "6.2",
    change: "+0.4",
    tone: "amber",
    icon: TrendingUp,
  },
  {
    label: "Practice Minutes",
    value: "42k",
    change: "+18.7%",
    tone: "cyan",
    icon: Headphones,
  },
];

const coursePipelines = [
  { name: "IELTS Foundation", students: 184, progress: 72, status: "Healthy" },
  { name: "TOEIC Intensive", students: 126, progress: 64, status: "Review" },
  { name: "English Communication", students: 98, progress: 81, status: "Healthy" },
  { name: "Kids Starters", students: 72, progress: 58, status: "Needs focus" },
];

const upcomingClasses = [
  { time: "08:30", title: "IELTS Speaking Clinic", teacher: "Ms. Linh", room: "A204" },
  { time: "10:00", title: "TOEIC Listening Lab", teacher: "Mr. David", room: "B102" },
  { time: "14:30", title: "Writing Task 2 Review", teacher: "Ms. An", room: "Online" },
];

const studentSignals = [
  { label: "Students at risk", value: 28, color: "#f59e0b" },
  { label: "Assignments overdue", value: 64, color: "#ef4444" },
  { label: "Placement tests pending", value: 19, color: "#0ea5e9" },
];

export function AdminDashboardPage() {
  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Academic Operations</span>
          <h1>English Central Management</h1>
          <p>
            Monitor learning progress, course health, class activity, and
            student support priorities from one LMS workspace.
          </p>
        </div>

        <div className={styles.termCard}>
          <CalendarClock aria-hidden="true" size={20} />
          <div>
            <strong>Spring Term</strong>
            <span>Week 8 of 12</span>
          </div>
        </div>
      </section>

      <section className={styles.metricsGrid}>
        {metricCards.map((card) => {
          const Icon = card.icon;

          return (
            <article className={`${styles.metricCard} ${styles[card.tone]}`} key={card.label}>
              <div className={styles.metricIcon}>
                <Icon aria-hidden="true" size={20} />
              </div>
              <div>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
              <em>
                {card.change}
                <ArrowUpRight aria-hidden="true" size={14} />
              </em>
            </article>
          );
        })}
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Course Health</h2>
              <p>Enrollment and completion progress by program.</p>
            </div>
            <Activity aria-hidden="true" size={20} />
          </div>

          <div className={styles.courseList}>
            {coursePipelines.map((course) => (
              <article className={styles.courseRow} key={course.name}>
                <div>
                  <strong>{course.name}</strong>
                  <span>{course.students} active learners</span>
                </div>
                <div className={styles.progressTrack}>
                  <span style={{ width: `${course.progress}%` }} />
                </div>
                <span className={styles.status}>{course.status}</span>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Today Classes</h2>
              <p>Live sessions needing operational readiness.</p>
            </div>
            <GraduationCap aria-hidden="true" size={20} />
          </div>

          <div className={styles.classList}>
            {upcomingClasses.map((lesson) => (
              <article className={styles.classRow} key={`${lesson.time}-${lesson.title}`}>
                <time>{lesson.time}</time>
                <div>
                  <strong>{lesson.title}</strong>
                  <span>
                    {lesson.teacher} · {lesson.room}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Student Support</h2>
              <p>Signals that need advisor or academic follow-up.</p>
            </div>
            <CheckCircle2 aria-hidden="true" size={20} />
          </div>

          <div className={styles.signalList}>
            {studentSignals.map((signal) => (
              <article className={styles.signalRow} key={signal.label}>
                <span style={{ background: signal.color }} />
                <strong>{signal.value}</strong>
                <p>{signal.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
