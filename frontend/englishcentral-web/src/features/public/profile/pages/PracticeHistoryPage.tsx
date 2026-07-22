import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

import { Container, Pagination } from "@/components/ui";
import { getStudentIdWithRefresh } from "@/features/public/auth/api/auth-api";
import {
  publicPracticeApi,
  type PracticeHistoryItem,
} from "@/features/public/practice/api/public-practice-api";

import styles from "./PracticeHistoryPage.module.scss";

const DEFAULT_PAGE_SIZE = 10;

const formatDate = (value: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const isToday = (value: string | null) => {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const getWeekStart = (date: Date) => {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(date);

  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(date.getDate() + mondayOffset);

  return weekStart;
};

const isSameDate = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function PracticeHistoryPage() {
  const [historyRows, setHistoryRows] = useState<PracticeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const studentId = await getStudentIdWithRefresh();
        const history = await publicPracticeApi.getPracticeHistory(studentId);

        if (isMounted) {
          setHistoryRows(history);
        }
      } catch (error) {
        if (isMounted) {
          setHistoryRows([]);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Không thể tải lịch sử bài làm.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const progressStats = useMemo(
    () => [
      { label: "Bài đã làm", value: String(historyRows.length) },
      {
        label: "Bài làm hôm nay",
        value: String(historyRows.filter((item) => isToday(item.submittedAt)).length),
      },
    ],
    [historyRows],
  );

  const weeklyChartData = useMemo(() => {
    const weekStart = getWeekStart(new Date());

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      const value = historyRows.filter((row) => {
        if (!row.submittedAt) return false;

        const submittedDate = new Date(row.submittedAt);

        return !Number.isNaN(submittedDate.getTime()) && isSameDate(submittedDate, date);
      }).length;

      return {
        label: new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date),
        value,
      };
    });
  }, [historyRows]);

  const maxWeeklyValue = Math.max(1, ...weeklyChartData.map((item) => item.value));

  const practiceStreakDays = useMemo(() => {
    const submittedDateKeys = new Set(
      historyRows
        .map((row) => {
          if (!row.submittedAt) return null;

          const submittedDate = new Date(row.submittedAt);

          return Number.isNaN(submittedDate.getTime()) ? null : toDateKey(submittedDate);
        })
        .filter((value): value is string => Boolean(value)),
    );

    let streakDays = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    while (submittedDateKeys.has(toDateKey(cursor))) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streakDays;
  }, [historyRows]);

  const streakMessage =
    practiceStreakDays >= 7
      ? "Kiên trì đang dần trở thành thói quen, tiếp tục nhé"
      : practiceStreakDays >= 3
        ? "3 ngày liên tiếp, giữ vững phong độ nhé!"
        : "";

  const totalItems = historyRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePageNumber = Math.min(pageNumber, totalPages);

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [pageNumber, totalPages]);

  const pagedHistoryRows = useMemo(() => {
    const startIndex = (safePageNumber - 1) * pageSize;

    return historyRows.slice(startIndex, startIndex + pageSize);
  }, [historyRows, pageSize, safePageNumber]);

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPageNumber(1);
  };

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td className={styles.statusMessage} colSpan={7}>
            Đang tải lịch sử bài làm...
          </td>
        </tr>
      );
    }

    if (errorMessage) {
      return (
        <tr>
          <td className={styles.errorMessage} colSpan={7}>
            {errorMessage}
          </td>
        </tr>
      );
    }

    if (!historyRows.length) {
      return (
        <tr>
          <td className={styles.statusMessage} colSpan={7}>
            Chưa có lịch sử bài làm.
          </td>
        </tr>
      );
    }

    return pagedHistoryRows.map((row) => (
      <tr key={row.id}>
        <td>{row.title}</td>
        <td>{row.mode}</td>
        <td>{row.resultDetail || row.result}</td>
        <td>{row.band}</td>
        <td className={styles.actionCell}>
          <Link
            aria-label={`Xem bài làm ${row.title}`}
            className={styles.actionButton}
            title="Xem bài làm"
            to={`/practice-history/${row.id}`}
          >
            <Eye size={16} />
          </Link>
        </td>
        <td>{row.status}</td>
        <td>{formatDate(row.submittedAt)}</td>
      </tr>
    ));
  };

  return (
    <section className={styles.page}>
      <Container>
        <div className={styles.header}>
          <span>Lịch sử bài làm</span>
          <h1>Theo dõi các bài luyện tập gần đây</h1>
        </div>

        <div className={styles.historyLayout}>
          <section className={styles.progressCard}>
            <h2>Tiến độ luyện tập</h2>
            <div className={styles.stats}>
              {progressStats.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className={styles.weeklyChart}>
              <div className={styles.weeklyChartHeader}>
                <h3>Tuần hiện tại</h3>
                <span>Số bài đã làm theo ngày</span>
              </div>
              <div className={styles.chartBars}>
                {weeklyChartData.map((item) => (
                  <div className={styles.chartItem} key={item.label}>
                    <div className={styles.chartValue}>{item.value}</div>
                    <div className={styles.chartBarTrack}>
                      <div
                        className={styles.chartBarFill}
                        style={{ height: item.value > 0 ? `${Math.max(8, (item.value / maxWeeklyValue) * 100)}%` : 0 }}
                      />
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              {streakMessage ? <p className={styles.streakMessage}>{streakMessage}</p> : null}
            </div>
          </section>

          <section className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2>Bài làm gần đây</h2>
              <span>{historyRows.length} bài làm</span>
            </div>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Bài làm</th>
                    <th>Chế độ</th>
                    <th>Kết quả</th>
                    <th>Band</th>
                    <th>Action</th>
                    <th>Trạng thái</th>
                    <th>Ngày làm</th>
                  </tr>
                </thead>
                <tbody>{renderTableBody()}</tbody>
              </table>
            </div>
            {historyRows.length > 0 ? (
              <div className={styles.paginationWrap}>
                <Pagination
                  pageNumber={safePageNumber}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={setPageNumber}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            ) : null}
          </section>
        </div>
      </Container>
    </section>
  );
}
