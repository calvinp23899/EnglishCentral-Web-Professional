import { Container } from "@/components/ui";
import styles from "./PracticeHistoryPage.module.scss";

const historyRows = [
  ["IELTS Reading Full Mock Test 1", "Practice", "32/40", "7.0"],
  ["IELTS Listening Full Mock Test 1", "Real exam", "28/40", "6.5"],
  ["IELTS Writing Task 1", "Practice", "Đã nộp", "Đang chấm"],
];

const progressStats = [
  { label: "Bài đã làm", value: "18" },
  { label: "Bài làm hôm nay", value: "3" },
];

export function PracticeHistoryPage() {
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
            <table>
              <thead>
                <tr>
                  <th>Bài làm</th>
                  <th>Chế độ</th>
                  <th>Kết quả</th>
                  <th>Band</th>
                </tr>
              </thead>
              <tbody>
                {historyRows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell) => (
                      <td key={cell}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </Container>
    </section>
  );
}
