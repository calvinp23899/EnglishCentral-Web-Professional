import styles from "../pages/PracticeDetailPage.module.scss";

export function RealSubmitLoadingView() {
  return (
    <div className={styles.submitLoadingPage}>
      <div className={styles.loadingCard}>
        <div className={styles.spinner} />
        <h2>Đang nộp bài...</h2>
        <p>Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
}
