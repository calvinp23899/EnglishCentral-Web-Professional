import type {
  AnswerMap,
  IELTSReadingPassage,
  IELTSReadingQuestion,
  IELTSReadingQuestionGroup,
} from "../../types/practice-test.type";
import {
  getQuestionOptions,
  textAnswerQuestionTypes,
} from "../QuestionBlock/question-block.helpers";
import styles from "../../pages/PracticeDetailPage.module.scss";

type RealExamQuestionGroupBlockProps = {
  passage: IELTSReadingPassage;
  group: IELTSReadingQuestionGroup;
  answers: AnswerMap;
  onAnswer: (questionId: string, value: string) => void;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  realMode?: boolean;
};

export function RealExamQuestionGroupBlock({
  passage,
  group,
  answers,
  onAnswer,
  questionRefs,
  realMode,
}: RealExamQuestionGroupBlockProps) {
  const groupOptions =
    group.options ?? group.questions.find((question) => question.options)?.options;
  const isMatchingHeadingsGroup = group.questions.every(
    (question) => (question.type ?? group.type) === "matching-headings"
  );
  const isMatchingInformationGroup = group.questions.every(
    (question) => (question.type ?? group.type) === "matching-information"
  );
  const isMatchingFeaturesGroup = group.questions.every(
    (question) => (question.type ?? group.type) === "matching-features"
  );
  const isMultipleChoiceGroup = group.questions.every(
    (question) => (question.type ?? group.type) === "multiple-choice"
  );
  const isCompletionGroup = group.questions.every((question) =>
    textAnswerQuestionTypes.has(question.type ?? group.type)
  );
  const shouldShowOptionBank =
    groupOptions?.length &&
    !isMatchingHeadingsGroup &&
    group.questions.some((question) =>
      [
        "matching-headings",
        "matching-features",
        "matching-sentence-ending",
      ].includes(question.type ?? group.type)
    );

  if (isMatchingHeadingsGroup) {
    return (
      <MatchingHeadingsGroup
        passage={passage}
        group={group}
        answers={answers}
        onAnswer={onAnswer}
        questionRefs={questionRefs}
        realMode={realMode}
      />
    );
  }

  if (isMatchingInformationGroup) {
    return (
      <MatchingInformationGroup
        passage={passage}
        group={group}
        answers={answers}
        onAnswer={onAnswer}
        questionRefs={questionRefs}
      />
    );
  }

  if (isMatchingFeaturesGroup) {
    return (
      <MatchingFeaturesGroup
        group={group}
        answers={answers}
        onAnswer={onAnswer}
        questionRefs={questionRefs}
        realMode={realMode}
      />
    );
  }

  if (isMultipleChoiceGroup) {
    return (
      <MultipleChoiceGroup
        group={group}
        answers={answers}
        onAnswer={onAnswer}
        questionRefs={questionRefs}
        realMode={realMode}
      />
    );
  }

  if (isCompletionGroup) {
    return (
      <CompletionQuestionGroup
        passage={passage}
        group={group}
        answers={answers}
        onAnswer={onAnswer}
        questionRefs={questionRefs}
        realMode={realMode}
      />
    );
  }

  return (
    <section className={styles.questionGroup}>
      <h3>{group.title}</h3>
      <p className={styles.questionIntro}>{group.instruction}</p>

      {shouldShowOptionBank && (
        <div className={styles.optionBank}>
          {groupOptions.map((option) => (
            <div key={option.label}>
              <strong>{option.label}</strong>
              <span>{option.content}</span>
            </div>
          ))}
        </div>
      )}

      {group.questions.map((question) => (
        <QuestionBlock
          key={question.number}
          question={question}
          passage={passage}
          group={group}
          value={answers[question.id]}
          onAnswer={onAnswer}
          realMode={realMode}
          questionRef={(element) => {
            questionRefs.current[question.id] = element;
          }}
        />
      ))}
    </section>
  );
}

type MatchingHeadingsGroupProps = {
  passage: IELTSReadingPassage;
  group: IELTSReadingQuestionGroup;
  answers: AnswerMap;
  onAnswer: (questionId: string, value: string) => void;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  realMode?: boolean;
};

function MatchingHeadingsGroup({
  passage,
  group,
  answers,
  onAnswer,
  questionRefs,
  realMode,
}: MatchingHeadingsGroupProps) {
  const headingOptions =
    group.options ?? group.questions.find((question) => question.options)?.options ?? [];

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
    <section className={styles.questionGroup}>
      <h3>{group.title}</h3>
      <p className={styles.questionIntro}>{group.instruction}</p>

      <div
        className={`${styles.matchingHeadingsLayout} ${
          passage.isDragHeadingOnParagraph ? styles.realHeadingOnlyBankLayout : ""
        }`}
      >
        <div className={styles.headingOptionBank}>
          <strong>List of Headings</strong>
          {headingOptions.map((option) => (
            <button
              key={option.label}
              draggable
              onDragStart={(event) => handleDragStart(event, option.label)}
              onClick={() => {
                if (passage.isDragHeadingOnParagraph) {
                  return;
                }

                const firstEmptyQuestion = group.questions.find(
                  (question) => !answers[question.id]
                );

                if (firstEmptyQuestion) {
                  onAnswer(firstEmptyQuestion.id, option.label);
                }
              }}
            >
              <span>{option.label}</span>
              {option.content}
            </button>
          ))}
        </div>

        {!passage.isDragHeadingOnParagraph && (
          <div className={styles.headingDropList}>
          {group.questions.map((question) => {
            const selectedOption = headingOptions.find(
              (option) => option.label === answers[question.id]
            );

            return (
              <article
                key={question.number}
                ref={(element) => {
                  questionRefs.current[question.id] = element;
                }}
                className={realMode ? styles.realQuestionItem : styles.practiceQuestionItem}
              >
                <div className={styles.headingDropRow}>
                  <span>{question.number}</span>
                  <p>{question.text}</p>
                  <div
                    className={`${styles.headingDropZone} ${
                      selectedOption ? styles.headingDropZoneFilled : ""
                    }`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(event, question.id)}
                  >
                    {selectedOption ? (
                      <>
                        <strong>{selectedOption.label}</strong>
                        <span>{selectedOption.content}</span>
                        <button
                          type="button"
                          onClick={() => onAnswer(question.id, "")}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <em>Kéo heading vào đây</em>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        )}
      </div>
    </section>
  );
}

type MatchingInformationGroupProps = {
  passage: IELTSReadingPassage;
  group: IELTSReadingQuestionGroup;
  answers: AnswerMap;
  onAnswer: (questionId: string, value: string) => void;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
};

function MatchingInformationGroup({
  passage,
  group,
  answers,
  onAnswer,
  questionRefs,
}: MatchingInformationGroupProps) {
  const paragraphOptions = getQuestionOptions(group.questions[0], group, passage) ?? [];

  return (
    <section className={styles.questionGroup}>
      <h3>{group.title}</h3>
      <p className={styles.questionIntro}>{group.instruction}</p>

      <div className={styles.matchingInfoTableWrap}>
        <table className={styles.matchingInfoTable}>
          <thead>
            <tr>
              <th />
              <th />
              {paragraphOptions.map((option) => (
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
                <td>{question.number}</td>
                <td>{question.text}</td>
                {paragraphOptions.map((option) => (
                  <td key={option.label}>
                    <label>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={answers[question.id] === option.label}
                        onChange={() => onAnswer(question.id, option.label)}
                      />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type MatchingFeaturesGroupProps = {
  group: IELTSReadingQuestionGroup;
  answers: AnswerMap;
  onAnswer: (questionId: string, value: string) => void;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  realMode?: boolean;
};

function MatchingFeaturesGroup({
  group,
  answers,
  onAnswer,
  questionRefs,
  realMode,
}: MatchingFeaturesGroupProps) {
  const featureOptions = group.options ?? [];

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
    <section className={styles.questionGroup}>
      <h3>{group.title}</h3>
      <p className={styles.questionIntro}>{group.instruction}</p>

      <div className={styles.matchingFeaturesRows}>
        {group.questions.map((question) => {
          const selectedOption = featureOptions.find(
            (option) => option.label === answers[question.id]
          );

          return (
            <article
              key={question.id}
              ref={(element) => {
                questionRefs.current[question.id] = element;
              }}
              className={realMode ? styles.realQuestionItem : styles.practiceQuestionItem}
            >
              <div className={styles.featureDropRow}>
                <div
                  className={`${styles.featureDropZone} ${
                    selectedOption ? styles.featureDropZoneFilled : ""
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

                <p>{question.text}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.featureOptionBank}>
        <strong>List of options</strong>
        <div>
          {featureOptions.map((option) => (
            <button
              key={option.label}
              draggable
              onDragStart={(event) => handleDragStart(event, option.label)}
            >
              {option.content}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

type MultipleChoiceGroupProps = {
  group: IELTSReadingQuestionGroup;
  answers: AnswerMap;
  onAnswer: (questionId: string, value: string) => void;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  realMode?: boolean;
};

function MultipleChoiceGroup({
  group,
  answers,
  onAnswer,
  questionRefs,
  realMode,
}: MultipleChoiceGroupProps) {
  const options = group.options ?? [];

  const toggleAnswer = (questionId: string, optionLabel: string) => {
    const currentAnswers = answers[questionId]?.split(",").filter(Boolean) ?? [];
    const nextAnswers = currentAnswers.includes(optionLabel)
      ? currentAnswers.filter((answer) => answer !== optionLabel)
      : [...currentAnswers, optionLabel];

    onAnswer(questionId, nextAnswers.join(","));
  };

  return (
    <section className={styles.questionGroup}>
      <h3>{group.title}</h3>
      <p className={styles.questionIntro}>{group.instruction}</p>

      {group.questions.map((question) => {
        const selectedAnswers = answers[question.id]?.split(",").filter(Boolean) ?? [];

        return (
          <article
            key={question.id}
            ref={(element) => {
              questionRefs.current[question.id] = element;
            }}
            className={realMode ? styles.realQuestionItem : styles.practiceQuestionItem}
          >
            <div className={styles.questionTitle}>
              <span>{question.number}</span>
              <p>{question.text}</p>
              <button>♡</button>
            </div>

            <div className={styles.checkboxOptionList}>
              {options.map((option) => (
                <label key={option.label}>
                  <input
                    type="checkbox"
                    checked={selectedAnswers.includes(option.label)}
                    onChange={() => toggleAnswer(question.id, option.label)}
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

type CompletionQuestionGroupProps = {
  passage: IELTSReadingPassage;
  group: IELTSReadingQuestionGroup;
  answers: AnswerMap;
  onAnswer: (questionId: string, value: string) => void;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  realMode?: boolean;
};

function CompletionQuestionGroup({
  passage,
  group,
  answers,
  onAnswer,
  questionRefs,
  realMode,
}: CompletionQuestionGroupProps) {
  const isTableLike = group.questions.some((question) =>
    ["table-completion", "notes-completion"].includes(question.type ?? group.type)
  );

  return (
    <section className={styles.questionGroup}>
      <h3>{group.title}</h3>
      <p className={styles.questionIntro}>{group.instruction}</p>

      <div className={isTableLike ? styles.completionPanel : styles.completionList}>
        {isTableLike && <h4>{passage.title}</h4>}

        {group.questions.map((question) => (
          <InlineCompletionQuestion
            key={question.number}
            question={question}
            value={answers[question.id]}
            onAnswer={onAnswer}
            questionRef={(element) => {
              questionRefs.current[question.id] = element;
            }}
            realMode={realMode}
          />
        ))}
      </div>
    </section>
  );
}

type InlineCompletionQuestionProps = {
  question: IELTSReadingQuestion;
  value?: string;
  onAnswer: (questionId: string, value: string) => void;
  questionRef?: (element: HTMLElement | null) => void;
  realMode?: boolean;
};

function InlineCompletionQuestion({
  question,
  value,
  onAnswer,
  questionRef,
  realMode,
}: InlineCompletionQuestionProps) {
  const parts = question.text.split(/_{2,}/);
  const input = (
    <input
      type="text"
      value={value ?? ""}
      onChange={(event) => onAnswer(question.id, event.target.value)}
      aria-label={`Question ${question.number}`}
    />
  );

  return (
    <article
      ref={questionRef}
      className={`${realMode ? styles.realQuestionItem : styles.practiceQuestionItem} ${
        styles.inlineCompletionQuestion
      }`}
    >
      <span className={styles.inlineCompletionText}>
        {parts[0]}
        {parts.length > 1 ? (
          <>
            <label className={styles.inlineBlank}>
              <strong>{question.number}</strong>
              {input}
            </label>
            {parts.slice(1).join("")}
          </>
        ) : (
          <label className={styles.inlineBlank}>
            <strong>{question.number}</strong>
            {input}
          </label>
        )}
      </span>
    </article>
  );
}

type QuestionBlockProps = {
  question: IELTSReadingQuestion;
  passage?: IELTSReadingPassage;
  group?: IELTSReadingQuestionGroup;
  value?: string;
  onAnswer: (questionId: string, value: string) => void;
  realMode?: boolean;
  questionRef?: (element: HTMLElement | null) => void;
};

function QuestionBlock({
  question,
  passage,
  group,
  value,
  onAnswer,
  realMode,
  questionRef,
}: QuestionBlockProps) {
  const options = getQuestionOptions(question, group, passage);
  const questionType = question.type ?? group?.type;

  if (questionType && textAnswerQuestionTypes.has(questionType)) {
    return (
      <InlineCompletionQuestion
        question={question}
        value={value}
        onAnswer={onAnswer}
        questionRef={questionRef}
        realMode={realMode}
      />
    );
  }

  return (
    <article
      ref={questionRef}
      className={realMode ? styles.realQuestionItem : styles.practiceQuestionItem}
    >
      <div className={styles.questionTitle}>
        <span>{question.number}</span>
        <p>{question.text}</p>
        <button>♡</button>
      </div>

      <div className={styles.optionList}>
        {options?.map((option) => (
          <label key={option.label}>
            <input
              type="radio"
              name={`question-${question.number}`}
              checked={value === option.label}
              onChange={() => onAnswer(question.id, option.label)}
            />
            <span>
              <strong>{option.label}</strong>
              {option.content !== option.label && ` ${option.content}`}
            </span>
          </label>
        ))}
      </div>
    </article>
  );
}
