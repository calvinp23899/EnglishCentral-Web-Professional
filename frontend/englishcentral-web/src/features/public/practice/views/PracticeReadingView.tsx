import { Link } from "react-router-dom";
import { useState } from "react";
import { getPassageQuestions } from "../components/QuestionBlock";
import { PracticeQuestionGroupBlock } from "../components/PracticeQuestionBlock";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import type { AnswerMap, IELTSReadingTest } from "../types/practice-test.type";
import styles from "../pages/PracticeDetailPage.module.scss";

type PracticeReadingViewProps = {
  test: IELTSReadingTest;
  answers: AnswerMap;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onAnswer: (questionId: string, value: string) => void;
  onScrollToQuestion: (questionId: string) => void;
  onSubmit: () => void;
};

export function PracticeReadingView({
  test,
  answers,
  questionRefs,
  onAnswer,
  onScrollToQuestion,
  onSubmit,
}: PracticeReadingViewProps) {
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [passageWidth, setPassageWidth] = useState(50);
  const activePassage = test.passages[activePartIndex] ?? test.passages[0];
  const { formattedTime } = useCountdownTimer({
    minutes: test.durationMinutes,
  });

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    const startX = event.clientX;
    const startWidth = passageWidth;

    event.currentTarget.setPointerCapture(event.pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const viewportWidth = window.innerWidth || 1;
      const deltaPercent = ((moveEvent.clientX - startX) / viewportWidth) * 100;
      const nextWidth = Math.min(68, Math.max(32, startWidth + deltaPercent));

      setPassageWidth(nextWidth);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div className={styles.practicePage}>
      <header className={styles.practiceHeader}>
        <Link to="/practice" className={styles.backButton}>
          ←
        </Link>

        <h1>Luyện tập</h1>

        <div className={styles.practiceActions}>
          <span>⏱ {formattedTime}</span>
          <button onClick={onSubmit}>Kết thúc</button>
        </div>
      </header>

      <main className={styles.practiceBody}>
        <section
          className={styles.practicePassage}
          style={{ flexBasis: `${passageWidth}%` }}
        >
          <div className={styles.panelTitle}>Passage</div>
          <h2>{activePassage.title}</h2>

          <div className={styles.passageText}>
            {activePassage.paragraphs.map((paragraph, index) => (
              <p key={index}>
                {paragraph.label && (
                  <strong className={styles.paragraphLabel}>
                    {paragraph.label}.{" "}
                  </strong>
                )}
                {paragraph.content}
              </p>
            ))}
          </div>
        </section>

        <div
          className={styles.practiceDivider}
          role="separator"
          aria-orientation="vertical"
          onPointerDown={handleResizeStart}
        >
          <button>↔</button>
        </div>

        <section
          className={styles.practiceQuestions}
          style={{ flexBasis: `${100 - passageWidth}%` }}
        >
          <div className={styles.tabs}>
            <button className={styles.activeTab}>Câu hỏi</button>
          </div>

          {activePassage.questionGroups.map((group) => (
            <PracticeQuestionGroupBlock
              key={group.id}
              passage={activePassage}
              group={group}
              answers={answers}
              onAnswer={onAnswer}
              questionRefs={questionRefs}
            />
          ))}
        </section>
      </main>

      <footer className={styles.practiceFooter}>
        <button
          disabled={activePartIndex === 0}
          onClick={() => setActivePartIndex((prev) => Math.max(0, prev - 1))}
        >
          Câu trước
        </button>

        <div>
          {getPassageQuestions(activePassage).map((question) => {
            const isAnswered = Boolean(answers[question.id]);

            return (
              <button
                key={question.id}
                className={isAnswered ? styles.answeredQuestion : ""}
                onClick={() => onScrollToQuestion(question.id)}
              >
                {question.number}
              </button>
            );
          })}
        </div>

        <button
          disabled={activePartIndex === test.passages.length - 1}
          onClick={() =>
            setActivePartIndex((prev) =>
              Math.min(test.passages.length - 1, prev + 1)
            )
          }
        >
          Câu tiếp theo →
        </button>
      </footer>
    </div>
  );
}
