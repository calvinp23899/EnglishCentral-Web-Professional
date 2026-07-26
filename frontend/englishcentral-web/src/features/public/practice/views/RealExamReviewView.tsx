import { Fragment, type MouseEvent as ReactMouseEvent, useRef, useState } from "react";
import { ArrowLeft, GripVertical, MessageSquare } from "lucide-react";
import {
  getAllQuestions,
  getPassageQuestions,
  getPassageRefIndex,
  getQuestionOptions,
} from "../components/QuestionBlock";
import { RichText } from "../components/RichText/RichText";
import { shouldShowPassageTitle } from "../utils/passage-title";
import type {
  AnswerMap,
  ExamResult,
  IELTSMockTest,
  IELTSReadingQuestion,
  IELTSReadingQuestionGroup,
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

type ExplanationTooltip = {
  question: IELTSReadingQuestion;
  left: number;
  top: number;
  placement: "top" | "bottom";
};

const truthChoiceTypes = new Set([
  "true-false-not-given",
  "yes-no-not-given",
]);

const gridChoiceTypes = new Set(["matching-information"]);
const summaryOptionTypes = new Set(["summary-completion-options"]);
const singleChoiceTypes = new Set(["single-choice"]);
const matchingOptionReviewTypes = new Set([
  "matching-headings",
  "matching-features",
  "matching-sentence-ending",
]);

const splitAnswer = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const formatAnswer = (value?: string) => {
  const parts = splitAnswer(value);

  return parts.length ? parts.join(" / ") : "Skipped";
};

const normalizeAnswer = (value?: string) =>
  splitAnswer(value)
    .map((item) => item.toLowerCase())
    .sort()
    .join("|");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const matchesOptionAnswer = (
  values: string[],
  option: { label: string; content: string }
) => {
  const optionLabel = option.label.trim().toLowerCase();
  const optionContent = option.content.trim().toLowerCase();

  return values.some((value) => {
    const normalizedValue = value.trim().toLowerCase();

    return (
      normalizedValue === optionLabel ||
      normalizedValue === optionContent ||
      normalizedValue === `${optionLabel} - ${optionContent}` ||
      normalizedValue === `${optionLabel}. ${optionContent}`
    );
  });
};

const formatQuestionLabel = (question: IELTSReadingQuestion) => {
  const rawLabel = question.numberLabel || String(question.number);
  const cleaned = rawLabel
    .replace(/^Q/i, "")
    .replace(/_/g, "-")
    .replace(/\s*-\s*/g, " - ");

  return cleaned;
};

const getOptionDisplay = (
  value: string | undefined,
  options?: { label: string; content: string }[]
) => {
  if (!value) {
    return "";
  }

  const values = splitAnswer(value);

  return values
    .map((item) => {
      const option = options?.find((candidate) =>
        matchesOptionAnswer([item], candidate)
      );

      return option?.content || item;
    })
    .join(" / ");
};

const getReviewOptionLabel = (
  option: { label: string; content: string },
  index: number
) => {
  const label = option.label?.trim();

  if (label && /^[A-Z]$|^[ivxlcdm]+$/i.test(label) && label.length <= 5) {
    return label;
  }

  return String.fromCharCode(65 + index);
};

const getReviewOptionContent = (option: { label: string; content: string }) => {
  const content = option.content?.trim();

  return content || option.label || "";
};

const getQuestionType = (
  question?: IELTSReadingQuestion,
  group?: IELTSReadingQuestionGroup
) => question?.type ?? group?.type;

export function RealExamReviewView({
  test,
  answers,
  result,
  time,
  onBackToResult,
}: RealExamReviewViewProps) {
  const allQuestions = getAllQuestions(test);
  const passagesWithQuestions = test.passages.filter(
    (passage) => getPassageQuestions(passage).length > 0
  );
  const [activeQuestionId, setActiveQuestionId] = useState(allQuestions[0]?.id ?? "");
  const [explanationTooltip, setExplanationTooltip] =
    useState<ExplanationTooltip | null>(null);
  const [passageWidth, setPassageWidth] = useState(48);
  const [activeReviewPassageId, setActiveReviewPassageId] = useState(
    passagesWithQuestions[0]?.id ?? test.passages[0]?.id ?? ""
  );
  const passageRefs = useRef<Record<number, HTMLParagraphElement | null>>({});
  const activeQuestion =
    allQuestions.find((question) => question.id === activeQuestionId) ??
    allQuestions[0];
  const activeQuestionPassage =
    test.passages.find((passage) =>
      passage.questionGroups.some((group) =>
        group.questions.some((question) => question.id === activeQuestion?.id)
      )
    ) ?? test.passages[0];
  const activePassage =
    test.skill === "listening"
      ? test.passages.find((passage) => passage.id === activeReviewPassageId) ??
        activeQuestionPassage
      : activeQuestionPassage;
  const activePassageRefIndex = activeQuestion
    ? getPassageRefIndex(activeQuestion)
    : undefined;
  const isListeningReview = test.skill === "listening";

  const getQuestionStatus = (question: IELTSReadingQuestion) => {
    const userAnswer = answers[question.id];

    if (!userAnswer) {
      return "skipped";
    }

    return normalizeAnswer(userAnswer) === normalizeAnswer(question.correctAnswer)
      ? "correct"
      : "wrong";
  };

  const openExplanationTooltip = (
    question: IELTSReadingQuestion,
    event: ReactMouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setActiveQuestionId(question.id);

    const rect = event.currentTarget.getBoundingClientRect();
    const margin = 12;
    const tooltipWidth = Math.min(380, window.innerWidth - margin * 2);
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - tooltipWidth / 2, margin),
      window.innerWidth - tooltipWidth - margin
    );
    const placement =
      rect.bottom + 220 > window.innerHeight ? "top" : "bottom";
    const top = placement === "top" ? rect.top - 10 : rect.bottom + 10;

    setExplanationTooltip({
      question,
      left,
      top,
      placement,
    });
  };

  const getQuestionGroup = (
    question: IELTSReadingQuestion,
    passage = activePassage
  ) =>
    passage.questionGroups.find((group) =>
      group.questions.some((item) => item.id === question.id)
    ) ?? passage.questionGroups[0];

  const getQuestionDisplayAnswer = (
    question: IELTSReadingQuestion,
    value?: string
  ) => {
    const passage =
      test.passages.find((candidate) =>
        candidate.questionGroups.some((group) =>
          group.questions.some((item) => item.id === question.id)
        )
      ) ?? activePassage;
    const questionGroup = getQuestionGroup(question, passage);
    const options = getQuestionOptions(question, questionGroup, passage);

    return getOptionDisplay(value, options) || formatAnswer(value);
  };

  const renderExplanationButton = (question: IELTSReadingQuestion) => (
    <button
      type="button"
      className={styles.explanationIconButton}
      onClick={(event) => openExplanationTooltip(question, event)}
      title="Show explanation"
      aria-label={`Show explanation for question ${formatQuestionLabel(question)}`}
    >
      <MessageSquare size={14} />
    </button>
  );

  const renderAnswerInputHtml = (question: IELTSReadingQuestion) => {
    const status = getQuestionStatus(question);
    const userAnswer = answers[question.id];
    const statusClass = styles[`${status}InlineInput`] ?? "";

    return `<span class="${styles.reviewInlineInput} ${statusClass}"><span>${question.number}</span><strong>${escapeHtml(
      userAnswer || "x"
    )}</strong></span>`;
  };

  const renderInputQuestion = (question: IELTSReadingQuestion) => {
    const hasBlank = /\{blank\}|_{3,}/i.test(question.text);
    const answerInputHtml = renderAnswerInputHtml(question);
    const promptHtml = hasBlank
      ? question.text.replace(/\{blank\}|_{3,}/gi, answerInputHtml)
      : `${question.text} ${answerInputHtml}`;

    return (
      <>
        {question.sectionTitle && (
          <h4 className={styles.reviewQuestionSectionTitle}>
            {question.sectionTitle}
          </h4>
        )}

        <RichText className={styles.reviewInputPrompt} html={promptHtml} />

        <div className={styles.reviewCorrectAnswerLine}>
          <span>Correct answer</span>
          <div className={styles.reviewCorrectAnswerValue}>
            {renderExplanationButton(question)}
            <strong>{formatAnswer(question.correctAnswer)}</strong>
          </div>
        </div>
      </>
    );
  };

  const renderTruthChoiceQuestion = (
    question: IELTSReadingQuestion,
    options: NonNullable<ReturnType<typeof getQuestionOptions>>
  ) => {
    const status = getQuestionStatus(question);
    const userValues = splitAnswer(answers[question.id]);
    const correctValues = splitAnswer(question.correctAnswer);

    return (
      <>
        <div className={styles.reviewChoicePrompt}>
          <span className={`${styles.reviewQuestionNumber} ${styles[status]}`}>
            {formatQuestionLabel(question)}
          </span>
          <RichText html={question.text} />
        </div>

        <div className={styles.reviewTruthChoiceList}>
          {options.map((option) => {
            const isCorrect = matchesOptionAnswer(correctValues, option);
            const isUserWrong =
              status === "wrong" &&
              matchesOptionAnswer(userValues, option) &&
              !isCorrect;
            const isUserCorrect = matchesOptionAnswer(userValues, option) && isCorrect;

            return (
              <div
                key={`${question.id}-${option.label}`}
                className={`${styles.reviewTruthChoiceItem} ${
                  isCorrect ? styles.reviewTruthChoiceCorrect : ""
                } ${isUserWrong ? styles.reviewTruthChoiceWrong : ""}`}
              >
                <span className={styles.reviewRadio} />
                <span className={styles.reviewOptionText}>{option.content}</span>
                {isUserCorrect && <em>Your answer</em>}
                {isUserWrong && <em>Your answer</em>}
              </div>
            );
          })}
        </div>

        <div className={styles.reviewCorrectAnswerLine}>
          <span>Correct answer</span>
          <div className={styles.reviewCorrectAnswerValue}>
            {renderExplanationButton(question)}
            <strong>{getOptionDisplay(question.correctAnswer, options)}</strong>
          </div>
        </div>
      </>
    );
  };

  const renderChoiceQuestion = (
    question: IELTSReadingQuestion,
    options: NonNullable<ReturnType<typeof getQuestionOptions>>
  ) => {
    const status = getQuestionStatus(question);
    const userValues = splitAnswer(answers[question.id]);
    const correctValues = splitAnswer(question.correctAnswer);
    const type = getQuestionType(question);
    const isSingleChoice = singleChoiceTypes.has(type ?? "");

    if (truthChoiceTypes.has(type ?? "")) {
      return renderTruthChoiceQuestion(question, options);
    }

    return (
      <>
        <div className={styles.reviewChoicePrompt}>
          <span className={`${styles.reviewQuestionNumber} ${styles[status]}`}>
            {formatQuestionLabel(question)}
          </span>
          <RichText html={question.text} />
        </div>

        <div className={styles.reviewChoiceList}>
          {options.map((option, index) => {
            const optionLabel = getReviewOptionLabel(option, index);
            const optionContent = getReviewOptionContent(option);
            const isCorrect = matchesOptionAnswer(correctValues, option);
            const isUserWrong =
              status === "wrong" &&
              matchesOptionAnswer(userValues, option) &&
              !isCorrect;
            const checked = matchesOptionAnswer(userValues, option) || isCorrect;

            return (
              <div
                key={`${question.id}-${option.label}`}
                className={`${styles.reviewChoiceLine} ${
                  isCorrect ? styles.reviewChoiceCorrectText : ""
                } ${isUserWrong ? styles.reviewChoiceWrongText : ""}`}
                title={optionContent}
              >
                <span className={styles.reviewOptionLabel}>{optionLabel}</span>
                <span
                  className={
                    isSingleChoice
                      ? styles.reviewCircleControl
                      : styles.reviewSquareControl
                  }
                >
                  {checked ? " " : ""}
                </span>
                <span className={styles.reviewOptionText}>{optionContent}</span>
                {isCorrect && renderExplanationButton(question)}
              </div>
            );
          })}
        </div>

        {status === "wrong" && (
          <div className={styles.reviewUserAnswerLine}>
            <span>Your answer</span>
            <strong>{getOptionDisplay(answers[question.id], options)}</strong>
          </div>
        )}

        <div className={styles.reviewCorrectAnswerLine}>
          <span>Correct answer</span>
          <strong>{getOptionDisplay(question.correctAnswer, options)}</strong>
        </div>
      </>
    );
  };

  const renderQuestionReview = (
    question: IELTSReadingQuestion,
    passage = activePassage
  ) => {
    const questionGroup = getQuestionGroup(question, passage);
    const rowOptions = getQuestionOptions(question, questionGroup, passage);

    return (
      <article
        key={question.id}
        className={`${styles.reviewPlainQuestion} ${
          activeQuestionId === question.id ? styles.activeReviewQuestionCard : ""
        }`}
      >
        {rowOptions?.length
          ? renderChoiceQuestion(question, rowOptions)
          : renderInputQuestion(question)}
      </article>
    );
  };

  const renderGridGroup = (
    passage: IELTSMockTest["passages"][number],
    questionGroup: IELTSReadingQuestionGroup
  ) => {
    const options = getQuestionOptions(
      questionGroup.questions[0],
      questionGroup,
      passage
    ) ?? [];

    const gridTable = (
      <div className={styles.reviewGridWrap}>
        <table
          className={
            questionGroup.imageUrl
              ? styles.listeningGridTable
              : styles.reviewGridTable
          }
        >
          <thead>
            <tr>
              {questionGroup.imageUrl ? <th aria-label="Question" /> : <><th /><th /></>}
              {options.map((option) => (
                <th key={option.label}>{option.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questionGroup.questions.map((question) => {
              const correctValues = splitAnswer(question.correctAnswer);
              const userValues = splitAnswer(answers[question.id]);

              return (
                <tr key={question.id}>
                  <td>
                    {questionGroup.imageUrl ? (
                      <>
                        <strong>{formatQuestionLabel(question)}</strong>
                        <span>{question.text}</span>
                        {renderExplanationButton(question)}
                      </>
                    ) : (
                      formatQuestionLabel(question)
                    )}
                  </td>
                  {!questionGroup.imageUrl && (
                    <td>
                      <RichText html={question.text} />
                      {renderExplanationButton(question)}
                    </td>
                  )}
                  {options.map((option) => {
                    const isCorrect = matchesOptionAnswer(correctValues, option);
                    const isWrong =
                      matchesOptionAnswer(userValues, option) && !isCorrect;

                    return (
                      <td
                        key={`${question.id}-${option.label}`}
                        className={`${isCorrect ? styles.correctAnswerCell : ""} ${
                          isWrong ? styles.wrongAnswerCell : ""
                        }`}
                      >
                        <span
                          className={`${styles.reviewRadio} ${
                            isCorrect ? styles.correctRadio : ""
                          } ${isWrong ? styles.wrongRadio : ""}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

    if (!questionGroup.imageUrl) {
      return gridTable;
    }

    return (
      <div className={styles.listeningImageGridLayout}>
        <div className={styles.listeningMapImageWrap}>
          <img src={questionGroup.imageUrl} alt={questionGroup.title} />
        </div>

        <div className={styles.listeningGridTableWrap}>{gridTable}</div>
      </div>
    );
  };

  const renderSummaryCompletionGroup = (
    questionGroup: IELTSReadingQuestionGroup
  ) => {
    const options = getQuestionOptions(questionGroup.questions[0], questionGroup) ?? [];
    const firstQuestionText = questionGroup.questions[0]?.text ?? "";
    const hasTemplate =
      firstQuestionText &&
      questionGroup.questions.some((question) =>
        firstQuestionText.includes(`{Q${question.number}}`)
      );
    const promptTemplate = hasTemplate
      ? firstQuestionText
      : questionGroup.questions
          .map((question) => question.text || `{Q${question.number}}`)
          .join(" ");
    const templateParts = promptTemplate.split(/(\{q?\d+\}|\{blank\})/i);
    const questionByNumber = new Map(
      questionGroup.questions.map((question) => [question.number, question])
    );
    const explicitQuestionNumbers = new Set(
      templateParts
        .map((part) => part.match(/\{q?(\d+)\}/i)?.[1])
        .filter(Boolean)
        .map(Number)
    );
    const sequentialBlankQuestions = questionGroup.questions.filter(
      (question) => !explicitQuestionNumbers.has(question.number)
    );
    let blankIndex = 0;

    const renderSummaryPart = (part: string, index: number) => {
      const match = part.match(/\{q?(\d+)\}/i);
      const isSequentialBlank = /\{blank\}/i.test(part);

      if (!match && !isSequentialBlank) {
        return <Fragment key={`${questionGroup.id}-text-${index}`}>{part}</Fragment>;
      }

      const question = match
        ? questionByNumber.get(Number(match[1]))
        : sequentialBlankQuestions[blankIndex++];

      if (!question) {
        return <Fragment key={`${questionGroup.id}-missing-${index}`}>{part}</Fragment>;
      }

      const status = getQuestionStatus(question);
      const userAnswer = answers[question.id];
      const displayAnswer = getOptionDisplay(userAnswer, options) || "x";

      return (
        <span
          key={question.id}
          className={`${styles.reviewSummaryBlank} ${styles[`${status}SummaryBlank`]}`}
          onClick={() => setActiveQuestionId(question.id)}
        >
          <strong>{question.number}</strong>
          <span>{displayAnswer}</span>
        </span>
      );
    };

    return (
      <div className={styles.reviewSummaryBlock}>
        {questionGroup.heading && (
          <h3 className={styles.reviewSummaryHeading}>{questionGroup.heading}</h3>
        )}

        <div className={styles.reviewSummaryText}>
          {templateParts.map(renderSummaryPart)}
        </div>

        <div className={styles.reviewSummaryOptions}>
          <strong>List of options</strong>
          <div>
            {options.map((option) => (
              <span key={option.label}>{option.content}</span>
            ))}
          </div>
        </div>

        <div className={styles.reviewSummaryAnswers}>
          {questionGroup.questions.map((question) => (
            <div key={`${question.id}-answer`}>
              <span className={`${styles.reviewQuestionNumber} ${styles.correct}`}>
                {formatQuestionLabel(question)}
              </span>
              <strong>
                Dap an: {getOptionDisplay(question.correctAnswer, options)}
              </strong>
              {renderExplanationButton(question)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMatchingOptionGroup = (
    passage: IELTSMockTest["passages"][number],
    questionGroup: IELTSReadingQuestionGroup
  ) => {
    const options = getQuestionOptions(
      questionGroup.questions[0],
      questionGroup,
      passage
    );

    return (
      <div className={styles.reviewMatchingOptionList}>
        {questionGroup.questions.map((question) => {
          const status = getQuestionStatus(question);
          const userAnswer = answers[question.id];
          const userDisplay = getOptionDisplay(userAnswer, options) || userAnswer || "";
          const correctDisplay =
            getOptionDisplay(question.correctAnswer, options) ||
            formatAnswer(question.correctAnswer);

          return (
            <article
              key={`${question.id}-matching-option-review`}
              className={styles.reviewMatchingOptionRow}
            >
              <div className={styles.reviewMatchingOptionPrompt}>
                <RichText html={question.text} />
                {status !== "correct" && (
                  <p>
                    Đáp án: <strong>{correctDisplay}</strong>
                    {renderExplanationButton(question)}
                  </p>
                )}
              </div>

              <div className={styles.reviewMatchingOptionAnswer}>
                <span className={`${styles.reviewQuestionNumber} ${styles[status]}`}>
                  {formatQuestionLabel(question)}
                </span>
                <div
                  className={`${styles.reviewMatchingOptionValue} ${
                    status === "correct"
                      ? styles.correctMatchingOptionValue
                      : status === "wrong"
                        ? styles.wrongMatchingOptionValue
                        : styles.skippedMatchingOptionValue
                  }`}
                >
                  {userDisplay ? <span>{userDisplay}</span> : <em />}
                  {status !== "correct" && <strong>×</strong>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  const renderReviewGroup = (
    passage: IELTSMockTest["passages"][number],
    questionGroup: IELTSMockTest["passages"][number]["questionGroups"][number]
  ) => {
    const questions = questionGroup.questions;

    if (!questions.length) {
      return null;
    }

    const firstQuestion = questions[0];
    const type = getQuestionType(firstQuestion, questionGroup);
    const instruction =
      questionGroup.instruction ?? firstQuestion?.instruction ?? passage.instruction;

    return (
      <section
        key={`${passage.id}-${questionGroup.id}`}
        className={styles.reviewGroupBlock}
      >
        <div className={styles.reviewMatrixHeader}>
          <div>
            <span>{firstQuestion?.type}</span>
            <h2>{questionGroup.title}</h2>
            <RichText className={styles.reviewInstructionText} html={instruction} />
          </div>

        </div>

        {gridChoiceTypes.has(type ?? "") || Boolean(questionGroup.imageUrl) ? (
          renderGridGroup(passage, questionGroup)
        ) : summaryOptionTypes.has(type ?? "") ? (
          renderSummaryCompletionGroup(questionGroup)
        ) : matchingOptionReviewTypes.has(type ?? "") ? (
          renderMatchingOptionGroup(passage, questionGroup)
        ) : (
          <div className={styles.reviewQuestionList}>
            {questions.map((question) => renderQuestionReview(question, passage))}
          </div>
        )}
      </section>
    );
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

  const switchReviewPassage = (
    passage: IELTSMockTest["passages"][number]
  ) => {
    setActiveReviewPassageId(passage.id);
    const firstQuestion = getPassageQuestions(passage)[0];

    if (firstQuestion) {
      setActiveQuestionId(firstQuestion.id);
    }
  };

  if (isListeningReview) {
    return (
      <div className={`${styles.reviewPage} ${styles.listeningReviewPage}`}>
        <header className={styles.reviewHeader}>
          <div>
            <button onClick={onBackToResult} aria-label="Back to result">
              <ArrowLeft size={22} />
            </button>
            <div>
              <span>Review answers</span>
              <h1>{test.title}</h1>
            </div>
          </div>

          <div className={styles.reviewHeaderMeta}>
            <div className={styles.reviewHeaderLegend}>
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
          </div>
        </header>

        <main className={styles.listeningReviewBody}>
          <section
            className={styles.listeningTranscriptPane}
            style={{ flexBasis: `${passageWidth}%` }}
          >
            <div className={styles.reviewSectionTitle}>
              <span>Part {activePassage.part}</span>
              <h2>Transcript</h2>
            </div>

            <div className={styles.listeningTranscriptText}>
              {activePassage.paragraphs.length ? (
                activePassage.paragraphs.map((paragraph, index) => (
                  <div key={`${activePassage.id}-transcript-${paragraph.id || index}`}>
                    <RichText html={paragraph.content} />
                  </div>
                ))
              ) : (
                <p>Chưa có transcript cho part này.</p>
              )}
            </div>

            <div className={styles.listeningReviewAudio}>
              <strong>Audio Part {activePassage.part}</strong>
              {activePassage.audioUrl ? (
                <audio controls src={activePassage.audioUrl}>
                  Trình duyệt của bạn không hỗ trợ audio.
                </audio>
              ) : (
                <p>Chưa có audio cho part này.</p>
              )}
            </div>
          </section>

          <div
            className={styles.reviewResizeHandle}
            onMouseDown={handleResizeStart}
            role="separator"
            aria-orientation="vertical"
          >
            <span>
              <GripVertical size={14} />
            </span>
          </div>

          <section
            className={styles.listeningReviewQuestionsPane}
            style={{ flexBasis: `${100 - passageWidth}%` }}
          >
            <div className={styles.reviewAllParts}>
              <section key={activePassage.id} className={styles.reviewPartBlock}>
                <div className={styles.reviewPartHeader}>
                  <span>Part {activePassage.part}</span>
                  <strong>
                    {activePassage.instruction || activePassage.title || "Questions"}
                  </strong>
                </div>

                {activePassage.questionGroups.map((questionGroup) =>
                  renderReviewGroup(activePassage, questionGroup)
                )}
              </section>
            </div>
          </section>
        </main>

        {explanationTooltip && (
          <div
            className={styles.reviewExplanationOverlay}
            onClick={() => setExplanationTooltip(null)}
          >
            <article
              className={`${styles.reviewExplanationTooltip} ${
                explanationTooltip.placement === "top"
                  ? styles.tooltipTop
                  : styles.tooltipBottom
              }`}
              style={{
                left: explanationTooltip.left,
                top: explanationTooltip.top,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <strong>
                Question {formatQuestionLabel(explanationTooltip.question)}
              </strong>
              <span>
                Your answer:{" "}
                {getQuestionDisplayAnswer(
                  explanationTooltip.question,
                  answers[explanationTooltip.question.id]
                )}{" "}
                | Correct answer:{" "}
                {getQuestionDisplayAnswer(
                  explanationTooltip.question,
                  explanationTooltip.question.correctAnswer
                )}
              </span>
              <p>
                {explanationTooltip.question.explanation?.trim() ||
                  "Chưa có giải thích cho câu hỏi này."}
              </p>
            </article>
          </div>
        )}

        <footer className={styles.reviewFooter}>
          <div className={styles.listeningReviewPartTabs}>
            {passagesWithQuestions.map((passage) => (
              <button
                key={`${passage.id}-listening-review-tab`}
                type="button"
                className={
                  activePassage.id === passage.id
                    ? styles.activeListeningReviewPartTab
                    : ""
                }
                onClick={() => switchReviewPassage(passage)}
              >
                Part {passage.part}
              </button>
            ))}
          </div>

          <div className={styles.listeningReviewQuestionNav}>
            {getPassageQuestions(activePassage).map((question) => {
              const status = getQuestionStatus(question);

              return (
                <button
                  key={`${question.id}-listening-review-nav`}
                  className={`${styles.reviewNavButton} ${styles[status]} ${
                    activeQuestionId === question.id
                      ? styles.activeReviewQuestion
                      : ""
                  }`}
                  onClick={() => setActiveQuestionId(question.id)}
                >
                  {formatQuestionLabel(question)}
                </button>
              );
            })}
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className={styles.reviewPage}>
      <header className={styles.reviewHeader}>
        <div>
          <button onClick={onBackToResult} aria-label="Back to result">
            <ArrowLeft size={22} />
          </button>
          <div>
            <span>Review answers</span>
            <h1>{test.title}</h1>
          </div>
        </div>

        <div className={styles.reviewHeaderMeta}>
          <div className={styles.reviewHeaderLegend}>
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
        </div>
      </header>

      <main className={styles.reviewBody}>
        <section
          className={styles.reviewPassage}
          style={{ flexBasis: `${passageWidth}%` }}
        >
          <div className={styles.reviewSectionTitle}>
            <span>Part {activePassage.part}</span>
            {shouldShowPassageTitle(activePassage) && <h2>{activePassage.title}</h2>}
          </div>

          <div className={styles.passageText}>
            {activePassage.paragraphs.map((paragraph, index) => (
              <div
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
                <RichText className={styles.passageParagraphText} html={paragraph.content} />
              </div>
            ))}
          </div>
        </section>

        <div
          className={styles.reviewResizeHandle}
          onMouseDown={handleResizeStart}
          role="separator"
          aria-orientation="vertical"
        >
          <span>
            <GripVertical size={14} />
          </span>
        </div>

        <section
          className={styles.reviewQuestions}
          style={{ flexBasis: `${100 - passageWidth}%` }}
        >
          <div className={styles.reviewAllParts}>
            <section key={activePassage.id} className={styles.reviewPartBlock}>
              <div className={styles.reviewPartHeader}>
                <span>Part {activePassage.part}</span>
                {shouldShowPassageTitle(activePassage) && (
                  <strong>{activePassage.title}</strong>
                )}
              </div>

              {activePassage.questionGroups.map((questionGroup) =>
                renderReviewGroup(activePassage, questionGroup)
              )}
            </section>
          </div>

        </section>
      </main>

      {explanationTooltip && (
        <div
          className={styles.reviewExplanationOverlay}
          onClick={() => setExplanationTooltip(null)}
        >
          <article
            className={`${styles.reviewExplanationTooltip} ${
              explanationTooltip.placement === "top"
                ? styles.tooltipTop
                : styles.tooltipBottom
            }`}
            style={{
              left: explanationTooltip.left,
              top: explanationTooltip.top,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <strong>
              Question {formatQuestionLabel(explanationTooltip.question)}
            </strong>
            <span>
              Your answer:{" "}
              {getQuestionDisplayAnswer(
                explanationTooltip.question,
                answers[explanationTooltip.question.id]
              )}{" "}
              | Correct answer:{" "}
              {getQuestionDisplayAnswer(
                explanationTooltip.question,
                explanationTooltip.question.correctAnswer
              )}
            </span>
            <p>
              {explanationTooltip.question.explanation?.trim() ||
                "Chưa có giải thích cho câu hỏi này."}
            </p>
          </article>
        </div>
      )}

      <footer className={styles.reviewFooter}>
        <div className={styles.reviewFooterParts}>
          {passagesWithQuestions.map((passage) => (
            <div key={`${passage.id}-footer`} className={styles.reviewFooterPart}>
              <strong>Part {passage.part}</strong>
              <div>
                {getPassageQuestions(passage).map((question) => {
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
                      {formatQuestionLabel(question)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
