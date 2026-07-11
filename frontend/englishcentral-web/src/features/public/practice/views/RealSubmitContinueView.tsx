import { getPassageQuestions } from "../components/QuestionBlock";
import styles from "../pages/PracticeDetailPage.module.scss";
import type { AnswerMap, IELTSMockTest } from "../types/practice-test.type";

type RealSubmitContinueViewProps = {
  activePartIndex: number;
  answers: AnswerMap;
  onBackToPart: (partIndex: number) => void;
  onNext: () => void;
  test: IELTSMockTest;
};

export function RealSubmitContinueView({
  activePartIndex,
  answers,
  onBackToPart,
  onNext,
  test,
}: RealSubmitContinueViewProps) {
  const goToPart = (partIndex: number) => {
    const boundedIndex = Math.min(Math.max(partIndex, 0), test.passages.length - 1);
    onBackToPart(boundedIndex);
  };

  return (
    <div className={styles.submitContinuePage}>
      <div className={styles.submitTopBar}>
        <p>Click next to continue</p>

        <button onClick={onNext}>
          <span>→</span>
          Next
        </button>
      </div>

      <div className={styles.submitBlankArea}>
        <div className={styles.floatingArrows}>
          <button
            disabled={activePartIndex === 0}
            onClick={() => goToPart(activePartIndex - 1)}
          >
            ←
          </button>
          <button
            disabled={activePartIndex === test.passages.length - 1}
            onClick={() => goToPart(activePartIndex + 1)}
          >
            →
          </button>
        </div>
      </div>

      <footer className={styles.realFooter}>
        {test.passages.map((passage, index) => {
          const passageQuestions = getPassageQuestions(passage);
          const answeredCount = passageQuestions.filter((question) =>
            Boolean(answers[question.id])
          ).length;

          return (
            <button
              key={passage.id}
              className={`${styles.realSubmitPartButton} ${
                activePartIndex === index ? styles.activeSubmitPartButton : ""
              }`}
              onClick={() => goToPart(index)}
            >
              <strong>Part {passage.part}</strong>
              <span>{answeredCount} of {passageQuestions.length}</span>
            </button>
          );
        })}

        <button className={styles.checkButton} onClick={onNext}>
          ✓
        </button>
      </footer>
    </div>
  );
}
