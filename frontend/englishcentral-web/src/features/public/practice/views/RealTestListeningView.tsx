import { useRef, useState } from "react";
import { Bell, Bookmark, Eraser, Highlighter, Menu, MessageSquare, Wifi } from "lucide-react";
import { getPassageQuestions } from "../components/QuestionBlock";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import type {
  AnswerMap,
  IELTSMockTest,
  IELTSReadingPassage,
  IELTSReadingQuestion,
  IELTSReadingQuestionGroup,
  IELTSReadingOption,
} from "../types/practice-test.type";
import styles from "../pages/PracticeDetailPage.module.scss";

type RealTestListeningViewProps = {
  test: IELTSMockTest;
  answers: AnswerMap;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onAnswer: (questionId: string, value: string) => void;
  onScrollToQuestion: (questionId: string) => void;
  onSubmit: () => void;
};

type ListeningNote = {
  id: string;
  text: string;
  note: string;
};

type SelectionPopover = {
  left: number;
  top: number;
};

function getOptions(question: IELTSReadingQuestion, group: IELTSReadingQuestionGroup) {
  return question.options ?? group.options ?? [];
}

function MarkButton({
  questionId,
  marked,
  onToggle,
}: {
  questionId: string;
  marked: boolean;
  onToggle: (questionId: string) => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.markQuestionButton} ${
        marked ? styles.markQuestionButtonActive : ""
      }`}
      onClick={() => onToggle(questionId)}
      aria-pressed={marked}
      aria-label="Mark question"
    >
      <Bookmark aria-hidden="true" />
    </button>
  );
}

export function RealTestListeningView({
  test,
  answers,
  questionRefs,
  onAnswer,
  onScrollToQuestion,
  onSubmit,
}: RealTestListeningViewProps) {
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [markedQuestionIds, setMarkedQuestionIds] = useState<Record<string, boolean>>({});
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [notes, setNotes] = useState<ListeningNote[]>([]);
  const [selectionPopover, setSelectionPopover] = useState<SelectionPopover | null>(
    null
  );
  const contentRef = useRef<HTMLDivElement | null>(null);
  const activePart = test.passages[activePartIndex] ?? test.passages[0];
  const { formattedTime } = useCountdownTimer({
    minutes: test.durationMinutes,
    onTimeUp: onSubmit,
  });

  const toggleMark = (questionId: string) => {
    setMarkedQuestionIds((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const updateSelectionPopover = () => {
    const selection = window.getSelection();
    const container = contentRef.current;

    if (!selection || selection.rangeCount === 0 || selection.isCollapsed || !container) {
      setSelectionPopover(null);
      return;
    }

    const range = selection.getRangeAt(0);

    if (!container.contains(range.commonAncestorContainer)) {
      setSelectionPopover(null);
      return;
    }

    const rect = range.getBoundingClientRect();

    if (!rect.width && !rect.height) {
      setSelectionPopover(null);
      return;
    }

    setSelectionPopover({
      left: rect.left + rect.width / 2,
      top: rect.top - 10,
    });
  };

  const surroundSelection = (className: string) => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return "";
    }

    const range = selection.getRangeAt(0);
    const container = contentRef.current;

    if (!container || !container.contains(range.commonAncestorContainer)) {
      return "";
    }

    const selectedText = selection.toString().trim();

    if (!selectedText) {
      return "";
    }

    const marker = document.createElement("mark");

    marker.className = className;

    try {
      range.surroundContents(marker);
      selection.removeAllRanges();
      setSelectionPopover(null);
    } catch {
      return "";
    }

    return selectedText;
  };

  const handleHighlight = () => {
    surroundSelection(styles.listeningHighlight);
  };

  const handleNote = () => {
    const selectedText = surroundSelection(styles.listeningNoteHighlight);

    if (selectedText) {
      setNotes((prev) => [
        ...prev,
        { id: `${Date.now()}`, text: selectedText, note: "" },
      ]);
    }
  };

  const handleClearHighlights = () => {
    const container = contentRef.current;

    if (!container) {
      return;
    }

    container
      .querySelectorAll(`.${styles.listeningHighlight}, .${styles.listeningNoteHighlight}`)
      .forEach((node) => {
        const parent = node.parentNode;

        if (!parent) {
          return;
        }

        while (node.firstChild) {
          parent.insertBefore(node.firstChild, node);
        }

        parent.removeChild(node);
        parent.normalize();
      });
    setNotes([]);
  };

  const handleQuestionNav = (question: IELTSReadingQuestion) => {
    setActiveQuestionId(question.id);
    onScrollToQuestion(question.id);
  };

  return (
    <div className={`${styles.realPage} ${styles.listeningRealPage}`}>
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
        <strong>Part {activePart.part}</strong>
        <span>{activePart.instruction}</span>
      </section>

      <main className={styles.listeningBody}>
        {selectionPopover && (
          <div
            className={styles.realSelectionPopover}
            style={{
              left: selectionPopover.left,
              top: selectionPopover.top,
            }}
          >
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={handleHighlight}>
              <Highlighter aria-hidden="true" />
              Highlight
            </button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={handleNote}>
              <MessageSquare aria-hidden="true" />
              Note
            </button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={handleClearHighlights}>
              <Eraser aria-hidden="true" />
              Clear
            </button>
            <span className={styles.realSelectionPopoverArrow} />
          </div>
        )}

        <section
          ref={contentRef}
          className={styles.listeningPaper}
          onMouseUp={updateSelectionPopover}
          onKeyUp={updateSelectionPopover}
        >
          {activePart.questionGroups.map((group) => (
            <ListeningQuestionGroup
              key={group.id}
              part={activePart}
              group={group}
              answers={answers}
              markedQuestionIds={markedQuestionIds}
              questionRefs={questionRefs}
              onAnswer={onAnswer}
              onToggleMark={toggleMark}
            />
          ))}
        </section>

        {notes.length > 0 && (
          <aside className={styles.listeningNotes}>
            <strong>Notes</strong>
            {notes.map((note) => (
              <article key={note.id}>
                <span>{note.text}</span>
                <textarea
                  value={note.note}
                  onChange={(event) =>
                    setNotes((prev) =>
                      prev.map((item) =>
                        item.id === note.id
                          ? { ...item, note: event.target.value }
                          : item
                      )
                    )
                  }
                  placeholder="Type your note"
                />
              </article>
            ))}
          </aside>
        )}
      </main>

      <footer className={styles.realFooter}>
        {test.passages.map((part, index) => {
          const questions = getPassageQuestions(part);
          const answeredCount = questions.filter((question) =>
            Boolean(answers[question.id])
          ).length;

          return (
            <div
              key={part.id}
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
                <strong>Part {part.part}</strong>
              </button>

              {activePartIndex === index ? (
                questions.map((question) => (
                  <button
                    key={question.id}
                    className={`${styles.realQuestionNavButton} ${
                      answers[question.id] ? styles.answeredQuestion : ""
                    } ${markedQuestionIds[question.id] ? styles.markedQuestion : ""} ${
                      activeQuestionId === question.id ? styles.activeQuestion : ""
                    }`}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleQuestionNav(question);
                    }}
                  >
                    {question.number}
                  </button>
                ))
              ) : (
                <span>
                  {answeredCount} of {questions.length}
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

function ListeningQuestionGroup({
  part,
  group,
  answers,
  markedQuestionIds,
  questionRefs,
  onAnswer,
  onToggleMark,
}: {
  part: IELTSReadingPassage;
  group: IELTSReadingQuestionGroup;
  answers: AnswerMap;
  markedQuestionIds: Record<string, boolean>;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onAnswer: (questionId: string, value: string) => void;
  onToggleMark: (questionId: string) => void;
}) {
  if (group.type === "matching-features") {
    return (
      <ListeningDragGroup
        group={group}
        answers={answers}
        markedQuestionIds={markedQuestionIds}
        questionRefs={questionRefs}
        onAnswer={onAnswer}
        onToggleMark={onToggleMark}
      />
    );
  }

  if (group.type === "multiple-choice") {
    return (
      <ListeningChoiceGroup
        group={group}
        answers={answers}
        markedQuestionIds={markedQuestionIds}
        questionRefs={questionRefs}
        onAnswer={onAnswer}
        onToggleMark={onToggleMark}
      />
    );
  }

  return (
    <section className={styles.listeningQuestionGroup}>
      <h3>{group.title}</h3>
      <p>{group.instruction}</p>

      <div className={styles.listeningNotesPanel}>
        <h4>{part.title}</h4>
        {group.questions.map((question) => (
          <ListeningBlankQuestion
            key={question.id}
            question={question}
            value={answers[question.id]}
            marked={Boolean(markedQuestionIds[question.id])}
            questionRefs={questionRefs}
            onAnswer={onAnswer}
            onToggleMark={onToggleMark}
          />
        ))}
      </div>
    </section>
  );
}

function ListeningBlankQuestion({
  question,
  value,
  marked,
  questionRefs,
  onAnswer,
  onToggleMark,
}: {
  question: IELTSReadingQuestion;
  value?: string;
  marked: boolean;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onAnswer: (questionId: string, value: string) => void;
  onToggleMark: (questionId: string) => void;
}) {
  const parts = question.text.split(/_{2,}/);

  return (
    <div
      ref={(element) => {
        questionRefs.current[question.id] = element;
      }}
      className={styles.listeningBlankRow}
    >
      <span>
        {parts[0]}
        <label className={styles.listeningBlank}>
          <strong>{question.number}</strong>
          <input
            value={value ?? ""}
            onChange={(event) => onAnswer(question.id, event.target.value)}
            aria-label={`Question ${question.number}`}
          />
        </label>
        {parts.slice(1).join("")}
      </span>
      <MarkButton questionId={question.id} marked={marked} onToggle={onToggleMark} />
    </div>
  );
}

function ListeningChoiceGroup({
  group,
  answers,
  markedQuestionIds,
  questionRefs,
  onAnswer,
  onToggleMark,
}: {
  group: IELTSReadingQuestionGroup;
  answers: AnswerMap;
  markedQuestionIds: Record<string, boolean>;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onAnswer: (questionId: string, value: string) => void;
  onToggleMark: (questionId: string) => void;
}) {
  const isMultiQuestionGroup = group.instruction.toLowerCase().includes("two");
  const visibleQuestions = isMultiQuestionGroup ? [group.questions[0]] : group.questions;

  const toggleMultiAnswer = (optionLabel: string) => {
    const primaryQuestion = group.questions[0];
    const currentAnswers = answers[primaryQuestion.id]?.split(",").filter(Boolean) ?? [];
    const nextAnswers = currentAnswers.includes(optionLabel)
      ? currentAnswers.filter((answer) => answer !== optionLabel)
      : [...currentAnswers, optionLabel].slice(-2);
    const value = nextAnswers.join(",");

    group.questions.forEach((question) => onAnswer(question.id, value));
  };

  return (
    <section className={styles.listeningQuestionGroup}>
      <h3>{group.title}</h3>
      <p>{group.instruction}</p>

      {visibleQuestions.map((question) => {
        const options = getOptions(question, group);
        const selectedAnswers = answers[question.id]?.split(",").filter(Boolean) ?? [];

        return (
          <article
            key={question.id}
            ref={(element) => {
              group.questions.forEach((item) => {
                if (isMultiQuestionGroup || item.id === question.id) {
                  questionRefs.current[item.id] = element;
                }
              });
            }}
            className={styles.listeningChoiceItem}
          >
            <div className={styles.listeningQuestionTitle}>
              <strong>
                {isMultiQuestionGroup
                  ? `${group.questions[0].number}-${group.questions[group.questions.length - 1].number}`
                  : question.number}
              </strong>
              <span>{question.text}</span>
              <MarkButton
                questionId={question.id}
                marked={Boolean(markedQuestionIds[question.id])}
                onToggle={onToggleMark}
              />
            </div>

            <div className={styles.listeningChoiceList}>
              {options.map((option) => (
                <label key={option.label}>
                  <input
                    type={isMultiQuestionGroup ? "checkbox" : "radio"}
                    name={`listening-question-${question.id}`}
                    checked={
                      isMultiQuestionGroup
                        ? selectedAnswers.includes(option.label)
                        : answers[question.id] === option.label
                    }
                    onChange={() =>
                      isMultiQuestionGroup
                        ? toggleMultiAnswer(option.label)
                        : onAnswer(question.id, option.label)
                    }
                  />
                  <span>{option.content}</span>
                </label>
              ))}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ListeningDragGroup({
  group,
  answers,
  markedQuestionIds,
  questionRefs,
  onAnswer,
  onToggleMark,
}: {
  group: IELTSReadingQuestionGroup;
  answers: AnswerMap;
  markedQuestionIds: Record<string, boolean>;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onAnswer: (questionId: string, value: string) => void;
  onToggleMark: (questionId: string) => void;
}) {
  const options = group.options ?? [];

  const handleDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    optionLabel: string
  ) => {
    event.dataTransfer.setData("text/plain", optionLabel);
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    questionId: string
  ) => {
    event.preventDefault();
    const optionLabel = event.dataTransfer.getData("text/plain");

    if (optionLabel) {
      onAnswer(questionId, optionLabel);
    }
  };

  return (
    <section className={styles.listeningQuestionGroup}>
      <h3>{group.title}</h3>
      <p>{group.instruction}</p>

      <div className={styles.listeningDragLayout}>
        <div className={styles.listeningDragRows}>
          {group.questions.map((question) => {
            const selectedOption = options.find(
              (option) => option.label === answers[question.id]
            );

            return (
              <div
                key={question.id}
                ref={(element) => {
                  questionRefs.current[question.id] = element;
                }}
                className={styles.listeningDragRow}
              >
                <span>{question.text}</span>
                <div
                  className={`${styles.listeningDropZone} ${
                    selectedOption ? styles.listeningDropZoneFilled : ""
                  }`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, question.id)}
                >
                  {selectedOption ? (
                    <>
                      <span>{selectedOption.content}</span>
                      <button type="button" onClick={() => onAnswer(question.id, "")}>
                        ×
                      </button>
                    </>
                  ) : (
                    <strong>{question.number}</strong>
                  )}
                </div>
                <MarkButton
                  questionId={question.id}
                  marked={Boolean(markedQuestionIds[question.id])}
                  onToggle={onToggleMark}
                />
              </div>
            );
          })}
        </div>

        <div className={styles.listeningOptionBank}>
          <strong>List of options</strong>
          {options.map((option: IELTSReadingOption) => (
            <button
              key={option.label}
              draggable
              onDragStart={(event) => handleDragStart(event, option.label)}
              onClick={() => {
                const firstEmptyQuestion = group.questions.find(
                  (question) => !answers[question.id]
                );

                if (firstEmptyQuestion) {
                  onAnswer(firstEmptyQuestion.id, option.label);
                }
              }}
            >
              {option.content}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
