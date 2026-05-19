import { useMemo, useState } from "react";
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

type PracticeListeningViewProps = {
  test: IELTSMockTest;
  answers: AnswerMap;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onAnswer: (questionId: string, value: string) => void;
  onScrollToQuestion: (questionId: string) => void;
  onSubmit: () => void;
};

const getQuestionOptions = (
  question: IELTSReadingQuestion,
  group: IELTSReadingQuestionGroup
) => question.options ?? group.options ?? [];

const formatQuestionTitle = (title: string) =>
  title.replace(/(\d+)\s*-\s*(\d+)/, "$1 - $2");

export function PracticeListeningView({
  test,
  answers,
  questionRefs,
  onAnswer,
  onScrollToQuestion,
  onSubmit,
}: PracticeListeningViewProps) {
  const [activePartIndex, setActivePartIndex] = useState(0);
  const { formattedTime } = useCountdownTimer({
    minutes: test.durationMinutes,
  });
  const listeningParts = useMemo(() => {
    if (test.passages.length === 4) {
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
        title: "Listening Passage 1",
        instruction: firstPassage.instruction,
        questionGroups: test.passages.flatMap(
          (passage) => passage.questionGroups
        ),
      } satisfies IELTSReadingPassage,
    ];
  }, [test.passages]);
  const activePart = listeningParts[activePartIndex] ?? listeningParts[0];

  return (
    <div className={`${styles.practicePage} ${styles.practiceListeningPage}`}>
      <header
        className={`${styles.practiceHeader} ${styles.practiceListeningHeader}`}
      >
        <h1>Practice test</h1>

        <div className={styles.practiceActions}>
          <span>{formattedTime}</span>
          <button onClick={onSubmit}>Kết thúc</button>
        </div>
      </header>

      <main className={styles.practiceListeningBody}>
        {activePart && (
          <section className={styles.practiceListeningSheet}>
            <h2>{test.title}</h2>
            <h3>Section Listening Passage {activePartIndex + 1}</h3>

            {activePart.questionGroups.map((group) => (
              <ListeningQuestionGroup
                key={group.id}
                group={group}
                answers={answers}
                questionRefs={questionRefs}
                onAnswer={onAnswer}
              />
            ))}
          </section>
        )}
      </main>

      <footer className={styles.practiceListeningFooter}>
        {listeningParts.map((part, partIndex) => (
          <div
            key={part.id}
            className={`${styles.practiceListeningFooterPart} ${
              activePartIndex === partIndex ? styles.activeListeningFooterPart : ""
            }`}
          >
            {getPassageQuestions(part).map((question) => {
              const isAnswered = Boolean(answers[question.id]);

              return (
                <button
                  key={question.id}
                  className={isAnswered ? styles.answeredListeningQuestion : ""}
                  onClick={() => {
                    setActivePartIndex(partIndex);
                    window.setTimeout(() => onScrollToQuestion(question.id), 0);
                  }}
                >
                  {question.number}
                </button>
              );
            })}
          </div>
        ))}
      </footer>
    </div>
  );
}

function ListeningQuestionGroup({
  group,
  answers,
  questionRefs,
  onAnswer,
}: {
  group: IELTSReadingQuestionGroup;
  answers: AnswerMap;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onAnswer: (questionId: string, value: string) => void;
}) {
  return (
    <section className={styles.practiceListeningQuestionGroup}>
      <h4>{formatQuestionTitle(group.title)}:</h4>
      <p>{group.instruction}</p>

      {group.questions.map((question) => (
        <ListeningQuestion
          key={question.id}
          group={group}
          question={question}
          value={answers[question.id]}
          questionRef={(element) => {
            questionRefs.current[question.id] = element;
          }}
          onAnswer={onAnswer}
        />
      ))}
    </section>
  );
}

function ListeningQuestion({
  group,
  question,
  value,
  questionRef,
  onAnswer,
}: {
  group: IELTSReadingQuestionGroup;
  question: IELTSReadingQuestion;
  value?: string;
  questionRef: (element: HTMLElement | null) => void;
  onAnswer: (questionId: string, value: string) => void;
}) {
  const options = getQuestionOptions(question, group);
  const isTextAnswer = question.text.includes("__") || options.length === 0;

  if (isTextAnswer) {
    const parts = question.text.split(/_{2,}/);

    return (
      <article ref={questionRef} className={styles.practiceListeningQuestion}>
        <div className={styles.practiceListeningQuestionLine}>
          <span className={styles.practiceListeningQuestionNumber}>
            {question.number}
          </span>
          <span>
            {parts[0]}
            <input
              value={value ?? ""}
              onChange={(event) => onAnswer(question.id, event.target.value)}
              aria-label={`Question ${question.number}`}
            />
            {parts.slice(1).join("")}
          </span>
        </div>
      </article>
    );
  }

  return (
    <article ref={questionRef} className={styles.practiceListeningQuestion}>
      <div className={styles.practiceListeningQuestionLine}>
        <span className={styles.practiceListeningQuestionNumber}>
          {question.number}
        </span>
        <span>{question.text}</span>
      </div>

      <div className={styles.practiceListeningOptions}>
        {options.map((option: IELTSReadingOption) => (
          <label key={option.label}>
            <span>{option.label}</span>
            <input
              type="radio"
              name={`listening-practice-question-${question.id}`}
              checked={value === option.label}
              onChange={() => onAnswer(question.id, option.label)}
            />
            <em>{option.content}</em>
          </label>
        ))}
      </div>
    </article>
  );
}
