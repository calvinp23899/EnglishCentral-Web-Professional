import { useState } from "react";
import { Bell, Eye, Menu, Wifi, X } from "lucide-react";
import { getPassageQuestions } from "../components/QuestionBlock";
import { RealExamPassagePanel } from "../components/RealExamPassagePanel";
import type { PassageAnnotation } from "../components/RealExamPassagePanel";
import { RealExamQuestionGroupBlock } from "../components/RealExamQuestionBlock";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import type { AnswerMap, IELTSMockTest } from "../types/practice-test.type";
import styles from "../pages/PracticeDetailPage.module.scss";

type RealTestReadingViewProps = {
  test: IELTSMockTest;
  answers: AnswerMap;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onAnswer: (questionId: string, value: string) => void;
  onScrollToQuestion: (questionId: string) => void;
  onSubmit: () => void;
};

export function RealTestReadingView({
  test,
  answers,
  questionRefs,
  onAnswer,
  onScrollToQuestion,
  onSubmit,
}: RealTestReadingViewProps) {
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [passageWidth, setPassageWidth] = useState(50);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [passageAnnotations, setPassageAnnotations] = useState<
    PassageAnnotation[]
  >([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [markedQuestionIds, setMarkedQuestionIds] = useState<Record<string, boolean>>(
    {}
  );
  const activePassage = test.passages[activePartIndex] ?? test.passages[0];
  const noteAnnotations = passageAnnotations.filter(
    (annotation) => annotation.type === "note"
  );
  const isNotePanelOpen = Boolean(activeNoteId) && noteAnnotations.length > 0;
  const { formattedTime } = useCountdownTimer({
    minutes: test.durationMinutes,
    onTimeUp: () => {
      alert("Hết giờ làm bài. Bài làm sẽ được nộp tự động.");
    },
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

  const handleToggleMark = (questionId: string) => {
    setMarkedQuestionIds((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleUpdateNote = (noteId: string, note: string) => {
    setPassageAnnotations((prev) =>
      prev.map((annotation) =>
        annotation.id === noteId ? { ...annotation, note } : annotation
      )
    );
  };

  const handleDeleteNote = (noteId: string) => {
    setPassageAnnotations((prev) =>
      prev.filter((annotation) => annotation.id !== noteId)
    );

    if (activeNoteId === noteId) {
      const nextNote = noteAnnotations.find((annotation) => annotation.id !== noteId);

      setActiveNoteId(nextNote?.id ?? null);
    }
  };

  return (
    <div className={styles.realPage}>
      <header className={styles.realHeader}>
        <div>
          <h1>{test.title}</h1>
          <p>{formattedTime} remaining</p>
        </div>

        <div className={styles.realIcons}>
          <Wifi aria-hidden="true" />
          <Bell aria-hidden="true" />
          <Menu aria-hidden="true" />
        </div>
      </header>

      <section className={styles.realInstruction}>
        <strong>Part {activePassage.part}</strong>
        <span>{activePassage.instruction}</span>
      </section>

      <main className={styles.realBody}>
        <section
          className={styles.realPassage}
          style={{ flexBasis: `${passageWidth}%` }}
        >
          <RealExamPassagePanel
            passage={activePassage}
            answers={answers}
            onAnswer={onAnswer}
            questionRefs={questionRefs}
            annotations={passageAnnotations}
            onAnnotationsChange={setPassageAnnotations}
            onActiveNoteIdChange={setActiveNoteId}
          />
        </section>

        <div
          className={styles.divider}
          onPointerDown={handleResizeStart}
          role="separator"
          aria-orientation="vertical"
        >
          <button>↔</button>
        </div>

        <section
          className={styles.realQuestions}
          style={{ flexBasis: `${100 - passageWidth}%` }}
        >
          {activePassage.questionGroups.map((group) => (
            <RealExamQuestionGroupBlock
              key={group.id}
              passage={activePassage}
              group={group}
              answers={answers}
              onAnswer={onAnswer}
              questionRefs={questionRefs}
              markedQuestionIds={markedQuestionIds}
              onToggleMark={handleToggleMark}
              realMode
            />
          ))}

          <div className={styles.floatingArrows}>
            <button
              disabled={activePartIndex === 0}
              onClick={() => setActivePartIndex((prev) => Math.max(0, prev - 1))}
            >
              ←
            </button>
            <button
              disabled={activePartIndex === test.passages.length - 1}
              onClick={() =>
                setActivePartIndex((prev) =>
                  Math.min(test.passages.length - 1, prev + 1)
                )
              }
            >
              →
            </button>
          </div>
        </section>

        {isNotePanelOpen && (
          <aside className={styles.realNotePanel} aria-label="Note panel">
            <div className={styles.realNotePanelHeader}>
              <span>Note</span>
              <div>
                <button type="button" aria-label="Preview note">
                  <Eye aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Close note"
                  onClick={() => setActiveNoteId(null)}
                >
                  <X aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className={styles.realNotePanelBody}>
              {noteAnnotations.map((noteAnnotation) => {
                const notePassage = test.passages.find(
                  (passage) => passage.id === noteAnnotation.passageId
                );
                const isActiveNote = noteAnnotation.id === activeNoteId;

                return (
                  <div
                    key={noteAnnotation.id}
                    className={`${styles.realNoteCard} ${
                      isActiveNote ? styles.realNoteCardActive : ""
                    }`}
                    onClick={() => setActiveNoteId(noteAnnotation.id)}
                  >
                    <p>
                      <strong>
                        Part {notePassage?.part ?? activePassage.part}
                      </strong>{" "}
                      {noteAnnotation.selectedText}
                    </p>
                    <textarea
                      value={noteAnnotation.note ?? ""}
                      aria-label="Note content"
                      autoFocus={isActiveNote}
                      onFocus={() => setActiveNoteId(noteAnnotation.id)}
                      onChange={(event) =>
                        handleUpdateNote(noteAnnotation.id, event.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteNote(noteAnnotation.id);
                      }}
                    >
                      DELETE
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </main>

      <footer className={styles.realFooter}>
        {test.passages.map((passage, index) => {
          const passageQuestions = getPassageQuestions(passage);
          const answeredCount = passageQuestions.filter((question) =>
            Boolean(answers[question.id])
          ).length;

          return (
            <div
              key={passage.part}
              className={styles.realPartGroup}
              role="button"
              tabIndex={0}
              onClick={() => setActivePartIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActivePartIndex(index);
                }
              }}
            >
              <button
                className={activePartIndex === index ? styles.activePartButton : ""}
                onClick={() => setActivePartIndex(index)}
              >
                <strong>Part {passage.part}</strong>
              </button>

              {activePartIndex === index ? (
                passageQuestions.map((question) => {
                  const isAnswered = Boolean(answers[question.id]);
                  const isMarked = Boolean(markedQuestionIds[question.id]);

                  return (
                    <button
                      key={question.id}
                      className={`${styles.realQuestionNavButton} ${
                        isAnswered ? styles.answeredQuestion : ""
                      } ${
                        isMarked ? styles.markedQuestion : ""
                      } ${
                        activeQuestionId === question.id ? styles.activeQuestion : ""
                      }`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveQuestionId(question.id);
                        onScrollToQuestion(question.id);
                      }}
                    >
                      {question.number}
                    </button>
                  );
                })
              ) : (
                <span>
                  {answeredCount} of {passageQuestions.length}
                </span>
              )}
            </div>
          );
        })}

        <button className={styles.checkButton} onClick={onSubmit}>
          ✓
        </button>
      </footer>
    </div>
  );
}
