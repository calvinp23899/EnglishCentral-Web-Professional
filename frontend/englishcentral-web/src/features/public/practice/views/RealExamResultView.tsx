import type { ExamResult } from "../types/practice-test.type";
import styles from "../pages/PracticeDetailPage.module.scss";

type RealExamResultViewProps = ExamResult & {
  time: string;
  onReview: () => void;
};

export function RealExamResultView({
  totalQuestions,
  correctQuestions,
  wrongQuestions,
  skippedQuestions,
  bandScore,
  time,
  onReview,
}: RealExamResultViewProps) {
  const rows = [
    {
      type: "IELTS Reading",
      total: totalQuestions,
      correct: correctQuestions,
      wrong: wrongQuestions,
      skipped: skippedQuestions,
    },
  ];

  return (
    <div className={styles.resultPage}>
      <section className={styles.resultTopGrid}>
        <div className={styles.motivationCard}>
          <div className={styles.mascot}>💪</div>
          <p>
            Đề IELTS hơi khó bạn nhỉ, mình cố tiếp cùng nhau nha, từ từ sẽ giỏi
            thôi!
          </p>
        </div>

        <div className={styles.resultSummaryCard}>
          <div>
            <h2>Kết quả làm bài</h2>
          </div>

          <div className={styles.timeBox}>
            <span>Thời gian làm bài</span>
            <strong>{time}</strong>
          </div>

          <div className={styles.resultCircle}>
            <strong>
              {correctQuestions}/{totalQuestions}
            </strong>
            <span>câu đúng</span>
          </div>

          <div className={styles.resultLegend}>
            <p>
              <i className={styles.correctDot} /> Đúng:{" "}
              <strong>{correctQuestions} câu</strong>
            </p>
            <p>
              <i className={styles.wrongDot} /> Sai:{" "}
              <strong>{wrongQuestions} câu</strong>
            </p>
            <p>
              <i className={styles.skipDot} /> Bỏ qua:{" "}
              <strong>{skippedQuestions} câu</strong>
            </p>
          </div>

          <button onClick={onReview}>Xem giải thích chi tiết</button>
        </div>

        <div className={styles.bandScoreCard}>
          <span>Band Score:</span>
          <strong>{bandScore.toFixed(1)}</strong>
        </div>
      </section>

      <section className={styles.resultTableCard}>
        <h3>Bảng dữ liệu chi tiết</h3>

        <table>
          <thead>
            <tr>
              <th>Loại câu hỏi</th>
              <th>Số câu hỏi</th>
              <th>Đúng</th>
              <th>Sai</th>
              <th>Bỏ qua</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.type}>
                <td>{row.type}</td>
                <td>{row.total}</td>
                <td>
                  <span className={styles.correctBadge}>{row.correct}</span>
                </td>
                <td>
                  <span className={styles.wrongBadge}>{row.wrong}</span>
                </td>
                <td>
                  <span className={styles.skipBadge}>{row.skipped}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
