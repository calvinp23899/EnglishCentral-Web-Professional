import styles from "../pages/PracticeDetailPage.module.scss";

export function RealSubmitContinueView({ onNext }: { onNext: () => void }) {
  return (
    <div className={styles.submitContinuePage}>
      <div className={styles.submitTopBar}>
        <p>Click next to continue</p>

        <button onClick={onNext}>
          <span>➤</span>
          Next
        </button>
      </div>

      <div className={styles.submitBlankArea}>
        <div className={styles.floatingArrows}>
          <button>←</button>
          <button>→</button>
        </div>
      </div>

      <footer className={styles.realFooter}>
        <div>
          <strong>Part 1</strong>
          <span>0 of 13</span>
        </div>

        <div>
          <strong>Part 2</strong>
          <span>0 of 13</span>
        </div>

        <div>
          <strong>Part 3</strong>
          <span>0 of 14</span>
        </div>

        <button className={styles.checkButton}>✓</button>
      </footer>
    </div>
  );
}
