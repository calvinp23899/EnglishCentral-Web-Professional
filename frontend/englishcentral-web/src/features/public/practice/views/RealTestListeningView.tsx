import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bookmark,
  Eraser,
  Highlighter,
  Menu,
  MessageSquare,
  Play,
  Volume2,
  Wifi,
} from "lucide-react";
import { getPassageQuestions } from "../components/QuestionBlock";
import { RichText } from "../components/RichText/RichText";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import type {
  AnswerMap,
  IELTSMockTest,
  IELTSReadingQuestion,
  IELTSReadingQuestionGroup,
  IELTSReadingOption,
} from "../types/practice-test.type";
import styles from "../pages/PracticeDetailPage.module.scss";

type RealTestListeningViewProps = {
  activePartIndex: number;
  test: IELTSMockTest;
  answers: AnswerMap;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onAnswer: (questionId: string, value: string) => void;
  onActivePartIndexChange: (partIndex: number) => void;
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

const getQuestionLabel = (question: IELTSReadingQuestion) =>
  question.numberLabel || String(question.number);

function ListeningHtml({ className, html }: { className?: string; html?: string }) {
  if (!html) return null;

  return <RichText className={className} html={html} />;
}

const shouldShowListeningSectionTitle = (value?: string) =>
  Boolean(value && !/^<p>\s*part\s+\d+\s*<\/p>$/i.test(value.trim()) && !/^part\s+\d+$/i.test(value.trim()));

const normalizeListeningInlineHtml = (value: string) =>
  value.replace(/(Activities)\s*•\s*/gi, "$1<br />• ");

const stripDangerousInlineHtml = (value: string) =>
  normalizeListeningInlineHtml(value)
    .replace(/<\s*ul[^>]*>\s*<\s*li[^>]*>/gi, "• ")
    .replace(/<\s*ol[^>]*>\s*<\s*li[^>]*>/gi, "• ")
    .replace(/<\s*\/\s*li\s*>\s*<\s*li[^>]*>/gi, "<br />• ")
    .replace(/<\s*\/\s*li\s*>\s*<\s*\/\s*(ul|ol)\s*>/gi, "")
    .replace(/<\s*\/?\s*(ul|ol|li)[^>]*>/gi, "")
    .replace(/<\s*\/?\s*p[^>]*>/gi, "")
    .replace(/<\s*\/?\s*div[^>]*>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\s(href|src)=["']javascript:[^"']*["']/gi, "");

const trimInlineHtmlBeforeBlank = (value: string) =>
  stripDangerousInlineHtml(value)
    .replace(/(?:<br\s*\/?>|\r?\n|\s)+$/gi, " ")
    .replace(/(?:&nbsp;)+$/gi, " ");

const trimInlineHtmlAfterBlank = (value: string) =>
  stripDangerousInlineHtml(value)
    .replace(/^(?:<br\s*\/?>|\r?\n|\s)+/gi, " ")
    .replace(/^(?:&nbsp;)+/gi, " ");

const normalizeBlankPromptHtml = (value: string) =>
  value
    .replace(
      /<\s*p[^>]*>\s*(Activities:?)\s*<\s*\/\s*p\s*>\s*<\s*ul[^>]*>\s*<\s*li[^>]*>/gi,
      "$1<br />• ",
    )
    .replace(
      /<\s*p[^>]*>\s*(Activities:?)\s*<\s*\/\s*p\s*>/gi,
      "$1<br />",
    )
    .replace(/<\s*\/\s*p\s*>\s*<\s*p[^>]*>/gi, "<br />")
    .replace(/<\s*p[^>]*>/gi, "")
    .replace(/<\s*\/\s*p\s*>/gi, "");

function ListeningInlineHtml({ html }: { html: string }) {
  if (!html) return null;

  return (
    <span
      className={styles.listeningInlineHtml}
      dangerouslySetInnerHTML={{ __html: stripDangerousInlineHtml(html) }}
    />
  );
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
  activePartIndex,
  test,
  answers,
  questionRefs,
  onAnswer,
  onActivePartIndexChange,
  onScrollToQuestion,
  onSubmit,
}: RealTestListeningViewProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [activeAudioPartIndex, setActiveAudioPartIndex] = useState(0);
  const [markedQuestionIds, setMarkedQuestionIds] = useState<Record<string, boolean>>({});
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [notes, setNotes] = useState<ListeningNote[]>([]);
  const [selectionPopover, setSelectionPopover] = useState<SelectionPopover | null>(
    null
  );
  const contentRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activePart = test.passages[activePartIndex] ?? test.passages[0];
  const activeAudioPart = test.passages[activeAudioPartIndex] ?? test.passages[0];
  const { formattedTime } = useCountdownTimer({
    enabled: hasStarted,
    minutes: test.durationMinutes,
    onTimeUp: onSubmit,
  });

  useEffect(() => {
    const audio = audioRef.current;

    if (!hasStarted || !audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.load();
    void audio.play().catch(() => undefined);
  }, [activeAudioPart?.audioUrl, activeAudioPartIndex, hasStarted]);

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

  const goToPart = (partIndex: number) => {
    const nextPartIndex = Math.min(Math.max(partIndex, 0), test.passages.length - 1);

    onActivePartIndexChange(nextPartIndex);
    setActiveQuestionId(null);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartListening = () => {
    const audio = audioRef.current;

    setHasStarted(true);

    if (!audio) return;

    audio.currentTime = 0;
    audio.load();
    void audio.play().catch(() => undefined);
  };

  const handleAudioEnded = () => {
    if (activeAudioPartIndex < test.passages.length - 1) {
      const nextPartIndex = activeAudioPartIndex + 1;

      setActiveAudioPartIndex(nextPartIndex);
      goToPart(nextPartIndex);
    }
  };

  return (
    <div className={`${styles.realPage} ${styles.listeningRealPage}`}>
      <audio
        ref={audioRef}
        src={activeAudioPart?.audioUrl}
        preload="auto"
        onEnded={handleAudioEnded}
      />

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
        <span>
          {activePart.instruction ||
            `Read the text and answer questions ${
              getPassageQuestions(activePart)[0]?.number ?? ""
            }-${getPassageQuestions(activePart).at(-1)?.number ?? ""}`}
        </span>
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
              group={group}
              answers={answers}
              markedQuestionIds={markedQuestionIds}
              questionRefs={questionRefs}
              onAnswer={onAnswer}
              onToggleMark={toggleMark}
            />
          ))}

          <div className={styles.listeningFloatingArrows}>
            <button
              type="button"
              disabled={activePartIndex === 0}
              onClick={() => goToPart(activePartIndex - 1)}
              aria-label="Previous part"
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={activePartIndex === test.passages.length - 1}
              onClick={() => goToPart(activePartIndex + 1)}
              aria-label="Next part"
            >
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
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
              onClick={() => goToPart(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  goToPart(index);
                }
              }}
            >
              <button
                className={activePartIndex === index ? styles.activePartButton : ""}
                onClick={() => goToPart(index)}
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
                    {getQuestionLabel(question)}
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

      {!hasStarted && (
        <div className={styles.listeningStartOverlay} role="dialog" aria-modal="true">
          <div className={styles.listeningStartCard}>
            <Volume2 aria-hidden="true" />
            <p>
              You will be listening to an audio clip during this test. You will not
              be permitted to pause or rewind the audio while answering the questions.
            </p>
            <span>To continue, click Play</span>
            <button type="button" onClick={handleStartListening}>
              <Play aria-hidden="true" />
              Play
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ListeningQuestionGroup({
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
  const isDragDropMatchingGroup =
    group.type === "matching-features" ||
    group.type === "matching-headings" ||
    group.type === "matching-information" ||
    group.type === "matching-sentence-ending";

  if (group.imageUrl) {
    return (
      <ListeningImageGridGroup
        group={group}
        answers={answers}
        markedQuestionIds={markedQuestionIds}
        questionRefs={questionRefs}
        onAnswer={onAnswer}
        onToggleMark={onToggleMark}
      />
    );
  }

  if (isDragDropMatchingGroup) {
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
      <ListeningHtml className={styles.listeningGroupInstruction} html={group.instruction} />
      <ListeningHtml className={styles.listeningGroupHeading} html={group.heading} />

      <div className={styles.listeningNotesPanel}>
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

function ListeningImageGridGroup({
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
  const options =
    group.options?.length
      ? group.options
      : Array.from({ length: 10 }, (_, index) => {
          const label = String.fromCharCode(65 + index);

          return { content: label, label };
        });

  return (
    <section className={styles.listeningQuestionGroup}>
      <h3>{group.title}</h3>
      <ListeningHtml className={styles.listeningGroupInstruction} html={group.instruction} />

      <div className={styles.listeningImageGridLayout}>
        <div className={styles.listeningMapImageWrap}>
          <img src={group.imageUrl} alt={group.title} />
        </div>

        <div className={styles.listeningGridTableWrap}>
          <table className={styles.listeningGridTable}>
            <thead>
              <tr>
                <th aria-label="Question" />
                {options.map((option) => (
                  <th key={option.label}>{option.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.questions.map((question) => (
                <tr
                  key={question.id}
                  ref={(element) => {
                    questionRefs.current[question.id] = element;
                  }}
                >
                  <td>
                    <strong>{getQuestionLabel(question)}</strong>
                    <span>{question.text}</span>
                    <MarkButton
                      questionId={question.id}
                      marked={Boolean(markedQuestionIds[question.id])}
                      onToggle={onToggleMark}
                    />
                  </td>
                  {options.map((option) => (
                    <td key={option.label}>
                      <input
                        type="radio"
                        name={`listening-grid-question-${question.id}`}
                        checked={answers[question.id] === option.label}
                        onChange={() => onAnswer(question.id, option.label)}
                        aria-label={`Question ${getQuestionLabel(question)} option ${option.label}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  const blankPattern = /(?:_{2,}|\{blank\}|\{q?\d+\})/i;
  const promptHtml = normalizeBlankPromptHtml(question.text);
  const parts = promptHtml.split(blankPattern);
  const input = (
    <label className={styles.listeningBlank}>
      <strong>{question.number}</strong>
      <input
        value={value ?? ""}
        onChange={(event) => onAnswer(question.id, event.target.value)}
        aria-label={`Question ${question.number}`}
      />
    </label>
  );

  return (
    <div
      ref={(element) => {
        questionRefs.current[question.id] = element;
      }}
      className={styles.listeningBlankRow}
    >
      <div>
        {shouldShowListeningSectionTitle(question.sectionTitle) && (
          <ListeningHtml
            className={styles.listeningSectionTitle}
            html={question.sectionTitle}
          />
        )}
        {parts.length > 1 ? (
          <span className={styles.listeningInlinePrompt}>
            <ListeningInlineHtml html={trimInlineHtmlBeforeBlank(parts[0])} />
            {input}
            <ListeningInlineHtml html={trimInlineHtmlAfterBlank(parts.slice(1).join(""))} />
          </span>
        ) : (
          <span className={styles.listeningInlinePrompt}>
            <ListeningInlineHtml html={question.text} />
            {input}
          </span>
        )}
      </div>
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
  const isMultiAnswerQuestion = (question: IELTSReadingQuestion) =>
    getQuestionLabel(question).includes("-") ||
    question.correctAnswer.split(",").filter(Boolean).length > 1 ||
    group.instruction.toLowerCase().includes("two");

  const toggleMultiAnswer = (question: IELTSReadingQuestion, optionLabel: string) => {
    const maxAnswers =
      question.correctAnswer.split(",").filter(Boolean).length ||
      Math.max(getQuestionLabel(question).split("-").length, 2);
    const currentAnswers = answers[question.id]?.split(",").filter(Boolean) ?? [];
    const nextAnswers = currentAnswers.includes(optionLabel)
      ? currentAnswers.filter((answer) => answer !== optionLabel)
      : [...currentAnswers, optionLabel].slice(-maxAnswers);

    onAnswer(question.id, nextAnswers.join(","));
  };

  return (
    <section className={styles.listeningQuestionGroup}>
      <h3>{group.title}</h3>
      <ListeningHtml className={styles.listeningGroupInstruction} html={group.instruction} />

      {group.questions.map((question) => {
        const options = getOptions(question, group);
        const selectedAnswers = answers[question.id]?.split(",").filter(Boolean) ?? [];
        const isMultiQuestion = isMultiAnswerQuestion(question);

        return (
          <article
            key={question.id}
            ref={(element) => {
              questionRefs.current[question.id] = element;
            }}
            className={styles.listeningChoiceItem}
          >
            <div className={styles.listeningQuestionTitle}>
              <strong>{getQuestionLabel(question)}</strong>
              <ListeningHtml html={question.text} />
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
                    type={isMultiQuestion ? "checkbox" : "radio"}
                    name={`listening-question-${question.id}`}
                    checked={
                      isMultiQuestion
                        ? selectedAnswers.includes(option.label)
                        : answers[question.id] === option.label
                    }
                    onChange={() =>
                      isMultiQuestion
                        ? toggleMultiAnswer(question, option.label)
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
  const usedOptionLabels = new Set(
    group.questions
      .map((question) => answers[question.id])
      .filter((value): value is string => Boolean(value)),
  );
  const availableOptions = options.filter(
    (option) => !usedOptionLabels.has(option.label),
  );

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
      <ListeningHtml className={styles.listeningGroupInstruction} html={group.instruction} />

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
          {availableOptions.map((option: IELTSReadingOption) => (
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
          {!availableOptions.length && (
            <span className={styles.listeningOptionBankEmpty}>
              All options have been used.
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
