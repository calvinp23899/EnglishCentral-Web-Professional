import { useRef, useState } from "react";
import {
  getAllQuestions,
  getPassageQuestions,
  getPassageRefIndex,
  getQuestionOptions,
} from "../components/QuestionBlock";
import type {
  AnswerMap,
  ExamResult,
  IELTSMockTest,
  IELTSReadingQuestion,
} from "../types/practice-test.type";
import styles from "../pages/PracticeDetailPage.module.scss";

type RealExamReviewViewProps = {
  test: IELTSMockTest;
  answers: AnswerMap;
  result: ExamResult;
  time: string;
  onBackToResult: () => void;
  onBackToPractice: () => void;
};

export function RealExamReviewView({
  test,
  answers,
  result,
  time,
  onBackToResult,
  onBackToPractice,
}: RealExamReviewViewProps) {
  const allQuestions = getAllQuestions(test);
  const [activeQuestionId, setActiveQuestionId] = useState(allQuestions[0]?.id ?? "");
  const [passageWidth, setPassageWidth] = useState(48);
  const passageRefs = useRef<Record<number, HTMLParagraphElement | null>>({});
  const activeQuestion =
    allQuestions.find((question) => question.id === activeQuestionId) ??
    allQuestions[0];
  const activePassage =
    test.passages.find((passage) =>
      passage.questionGroups.some((group) =>
        group.questions.some((question) => question.id === activeQuestion?.id)
      )
    ) ?? test.passages[0];
  const activeGroup =
    activePassage.questionGroups.find((group) =>
      group.questions.some((question) => question.id === activeQuestion?.id)
    ) ?? activePassage.questionGroups[0];
  const reviewOptions =
    activeQuestion && getQuestionOptions(activeQuestion, activeGroup, activePassage)
      ? getQuestionOptions(activeQuestion, activeGroup, activePassage)!.map(
          (option) => option.label
        )
      : [];
  const groupTitle = activeGroup?.title ?? "Questions";
  const groupInstruction =
    activeQuestion?.instruction ?? activeGroup?.instruction ?? activePassage.instruction;
  const activePassageRefIndex = activeQuestion
    ? getPassageRefIndex(activeQuestion)
    : undefined;

  const getQuestionStatus = (question: IELTSReadingQuestion) => {
    const userAnswer = answers[question.id];

    if (!userAnswer) {
      return "skipped";
    }

    if (userAnswer.includes(",") || question.correctAnswer.includes(",")) {
      const userParts = userAnswer.split(",").map((item) => item.trim()).sort();
      const expectedParts = question.correctAnswer
        .split(",")
        .map((item) => item.trim())
        .sort();

      return userParts.join(",") === expectedParts.join(",") ? "correct" : "wrong";
    }

    return userAnswer === question.correctAnswer ? "correct" : "wrong";
  };

  const getCellClassName = (question: IELTSReadingQuestion, option: string) => {
    const status = getQuestionStatus(question);
    const isCorrectOption = question.correctAnswer === option;
    const isUserOption = answers[question.id] === option;

    if (isCorrectOption) {
      return styles.correctAnswerCell;
    }

    if (status === "wrong" && isUserOption) {
      return styles.wrongAnswerCell;
    }

    return "";
  };

  const handleShowExplanation = (question: IELTSReadingQuestion) => {
    setActiveQuestionId(question.id);

    window.setTimeout(() => {
      const passageRefIndex = getPassageRefIndex(question);

      if (passageRefIndex) {
        passageRefs.current[passageRefIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 0);
  };

  const handleResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
    const startX = event.clientX;
    const startWidth = passageWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const viewportWidth = window.innerWidth || 1;
      const deltaPercent = ((moveEvent.clientX - startX) / viewportWidth) * 100;
      const nextWidth = Math.min(62, Math.max(36, startWidth + deltaPercent));

      setPassageWidth(nextWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className={styles.reviewPage}>
      <header className={styles.reviewHeader}>
        <div>
          <button onClick={onBackToResult}>←</button>
          <div>
            <span>Review answers</span>
            <h1>{test.title}</h1>
          </div>
        </div>

        <div className={styles.reviewStats}>
          <div>
            <span>Score</span>
            <strong>{result.bandScore.toFixed(1)}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>{time}</strong>
          </div>
          <div>
            <span>Correct</span>
            <strong>
              {result.correctQuestions}/{result.totalQuestions}
            </strong>
          </div>
        </div>
      </header>

      <main className={styles.reviewBody}>
        <section
          className={styles.reviewPassage}
          style={{ flexBasis: `${passageWidth}%` }}
        >
          <div className={styles.reviewSectionTitle}>
            <span>Part {activePassage.part}</span>
            <h2>{activePassage.title}</h2>
          </div>

          <div className={styles.passageText}>
            {activePassage.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                ref={(element) => {
                  passageRefs.current[index + 1] = element;
                }}
                className={
                  activePassageRefIndex === index + 1
                    ? styles.highlightParagraph
                    : ""
                }
              >
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
          className={styles.reviewResizeHandle}
          onMouseDown={handleResizeStart}
          role="separator"
          aria-orientation="vertical"
        >
          <span>⋮</span>
        </div>

        <section
          className={styles.reviewQuestions}
          style={{ flexBasis: `${100 - passageWidth}%` }}
        >
          <div className={styles.reviewMatrixHeader}>
            <div>
              <span>{activeQuestion?.type}</span>
              <h2>{groupTitle}</h2>
              <p>{groupInstruction}</p>
            </div>

            <div className={styles.reviewLegend}>
              <span>
                <i className={styles.correctDot} /> Correct
              </span>
              <span>
                <i className={styles.wrongDot} /> Wrong
              </span>
              <span>
                <i className={styles.skipDot} /> Skipped
              </span>
            </div>
          </div>

          <div className={styles.reviewAnswerTableWrap}>
            <table className={styles.reviewAnswerTable}>
              <thead>
                <tr>
                  <th />
                  <th />
                  <th />
                  {reviewOptions.length > 0 ? (
                    reviewOptions.map((option) => <th key={option}>{option}</th>)
                  ) : (
                    <th>Answer</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {getPassageQuestions(activePassage).map((question) => {
                  const status = getQuestionStatus(question);
                  const isActive = activeQuestionId === question.id;
                  const rowOptions = getQuestionOptions(
                    question,
                    activeGroup,
                    activePassage
                  );

                  return (
                    <tr
                      key={question.id}
                      className={isActive ? styles.activeReviewRow : ""}
                    >
                      <td>
                        <button
                          className={`${styles.reviewQuestionPill} ${styles[status]}`}
                          onClick={() => setActiveQuestionId(question.id)}
                        >
                          {question.number}
                        </button>
                      </td>
                      <td>{question.text}</td>
                      <td>
                        <button
                          className={styles.explanationIconButton}
                          onClick={() => handleShowExplanation(question)}
                          title="Xem giải thích trong bài đọc"
                        >
                          💬
                        </button>
                      </td>
                      {rowOptions?.length ? (
                        rowOptions.map((option) => {
                          const userAnswer = answers[question.id];
                          const isSelected = userAnswer === option.label;
                          const isCorrectOption = question.correctAnswer === option.label;

                          return (
                            <td
                              key={option.label}
                              className={getCellClassName(question, option.label)}
                            >
                              <span
                                className={`${styles.reviewRadio} ${
                                  isCorrectOption ? styles.correctRadio : ""
                                } ${
                                  isSelected && !isCorrectOption
                                    ? styles.wrongRadio
                                    : ""
                                }`}
                              />
                            </td>
                          );
                        })
                      ) : (
                        <td colSpan={Math.max(reviewOptions.length, 1)}>
                          <strong>{answers[question.id] || "Skipped"}</strong>
                          <span> / {question.correctAnswer}</span>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {activeQuestion && (
            <article className={styles.inlineExplanation}>
              <strong>Question {activeQuestion.number}</strong>
              <span>
                Your answer: {answers[activeQuestion.id] || "Skipped"} · Correct
                answer: {activeQuestion.correctAnswer}
              </span>
              <p>{activeQuestion.explanation}</p>
            </article>
          )}
        </section>
      </main>

      <footer className={styles.reviewFooter}>
        <div>
          {getPassageQuestions(activePassage).map((question) => {
            const status = getQuestionStatus(question);

            return (
              <button
                key={question.id}
                className={`${styles.reviewNavButton} ${styles[status]} ${
                  activeQuestionId === question.id
                    ? styles.activeReviewQuestion
                    : ""
                }`}
                onClick={() => setActiveQuestionId(question.id)}
              >
                {question.number}
              </button>
            );
          })}
        </div>

        <button>Xem lịch sử làm bài</button>
        <button onClick={onBackToPractice}>Làm bài khác</button>
      </footer>
    </div>
  );
}
