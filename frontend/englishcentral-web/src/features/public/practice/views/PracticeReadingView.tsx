import { useMemo, useState } from "react";
import { getPassageQuestions } from "../components/QuestionBlock";
import { PracticeQuestionGroupBlock } from "../components/PracticeQuestionBlock";
import { RichText } from "../components/RichText/RichText";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import type {
  AnswerMap,
  IELTSMockTest,
  IELTSReadingPassage,
  IELTSReadingQuestion,
} from "../types/practice-test.type";
import { shouldShowPassageTitle } from "../utils/passage-title";
import styles from "../pages/PracticeDetailPage.module.scss";

type PracticeReadingViewProps = {
  test: IELTSMockTest;
  answers: AnswerMap;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onAnswer: (questionId: string, value: string) => void;
  onScrollToQuestion: (questionId: string) => void;
  onSubmit: () => void;
};

const getQuestionLabel = (question: IELTSReadingQuestion) =>
  question.numberLabel || String(question.number);

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
  const readingParts = useMemo(() => {
    if (test.category === "ielts" && test.skill === "reading" && test.passages.length === 3) {
      return test.passages;
    }

    const firstPassage = test.passages[0];

    if (!firstPassage) {
      return [];
    }

    return [
      {
        ...firstPassage,
        part: 1,
        questionGroups: test.passages.flatMap(
          (passage) => passage.questionGroups
        ),
      } satisfies IELTSReadingPassage,
    ];
  }, [test.category, test.passages, test.skill]);
  const activePassage = readingParts[activePartIndex] ?? readingParts[0];
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

        <h1>Luyện tập</h1>

        <div className={styles.practiceActions}>
          <span>{formattedTime}</span>
          <button onClick={onSubmit}>Kết thúc</button>
        </div>
      </header>

      {activePassage && (
        <main className={styles.practiceBody}>
          <section
            className={styles.practicePassage}
            style={{ flexBasis: `${passageWidth}%` }}
          >
            {shouldShowPassageTitle(activePassage) && <h2>{activePassage.title}</h2>}

            <div className={styles.passageText}>
              {activePassage.paragraphs.map((paragraph) => (
                <RichText
                  key={paragraph.id}
                  className={styles.passageParagraphText}
                  html={paragraph.content}
                />
              ))}
            </div>
          </section>

          <div
            className={styles.practiceDivider}
            role="separator"
            aria-orientation="vertical"
            onPointerDown={handleResizeStart}
          >
            <button>{"<>"}</button>
          </div>

          <section
            className={styles.practiceQuestions}
            style={{ flexBasis: `${100 - passageWidth}%` }}
          >
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
      )}

      <footer className={styles.practiceFooter}>
        <div>
          {readingParts.map((part, partIndex) => (
            <span
              key={part.id}
              className={`${styles.practiceFooterPart} ${
                activePartIndex === partIndex ? styles.activePracticeFooterPart : ""
              }`}
            >
              {getPassageQuestions(part).map((question) => {
                const isAnswered = Boolean(answers[question.id]);

                return (
                  <button
                    key={question.id}
                    className={isAnswered ? styles.answeredQuestion : ""}
                    onClick={() => {
                      setActivePartIndex(partIndex);
                      window.setTimeout(() => onScrollToQuestion(question.id), 0);
                    }}
                  >
                    {getQuestionLabel(question)}
                  </button>
                );
              })}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
