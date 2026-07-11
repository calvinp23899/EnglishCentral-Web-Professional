import { useEffect, useMemo, useState } from "react";

import { Container } from "@/components/ui";
import { getStoredStudentIdFromAccessToken } from "@/features/public/auth/api/auth-api";
import {
  publicPracticeApi,
  type PracticeHistoryItem,
} from "@/features/public/practice/api/public-practice-api";

import styles from "./PracticeHistoryPage.module.scss";

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

export function PracticeHistoryPage() {
  const [historyRows, setHistoryRows] = useState<PracticeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const studentId = getStoredStudentIdFromAccessToken();
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

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td className={styles.statusMessage} colSpan={6}>
            Đang tải lịch sử bài làm...
          </td>
        </tr>
      );
    }

    if (errorMessage) {
      return (
        <tr>
          <td className={styles.errorMessage} colSpan={6}>
            {errorMessage}
          </td>
        </tr>
      );
    }

    if (!historyRows.length) {
      return (
        <tr>
          <td className={styles.statusMessage} colSpan={6}>
            Chưa có lịch sử bài làm.
          </td>
        </tr>
      );
    }

    return historyRows.map((row) => (
      <tr key={row.id}>
        <td>{row.title}</td>
        <td>{row.mode}</td>
        <td>{row.resultDetail || row.result}</td>
        <td>{row.band}</td>
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
                    <th>Trạng thái</th>
                    <th>Ngày làm</th>
                  </tr>
                </thead>
                <tbody>{renderTableBody()}</tbody>
              </table>
            </div>
          </section>
        </div>
      </Container>
    </section>
  );
}
