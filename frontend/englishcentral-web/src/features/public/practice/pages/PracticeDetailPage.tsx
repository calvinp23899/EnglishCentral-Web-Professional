import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { mockPracticeTests } from "../data/mockPracticeTests";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import { SubmitResultModal } from "../components/SubmitResultModal/SubmitResultModal";
import styles from "./PracticeDetailPage.module.scss";

type AnswerMap = Record<number, string>;

export function PracticeDetailPage() {
    const { category, slug } = useParams();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode") ?? "practice";
    const [realSubmitStep, setRealSubmitStep] = useState<
        "exam" | "continue" | "loading" | "result"
    >("exam");
    const test = useMemo(
        () =>
            mockPracticeTests.find(
                (item) => item.category === category && item.slug === slug
            ),
        [category, slug]
    );

    const [answers, setAnswers] = useState<AnswerMap>({});
    const navigate = useNavigate();
    const [openResultModal, setOpenResultModal] = useState(false);
    const handleSubmitTest = () => {
        setOpenResultModal(true);
    };

    const handleBackToPractice = () => {
        navigate("/practice");
    };
    const getExamResult = () => {
  const totalQuestions = test.questions.length;

  const correctQuestions = test.questions.filter(
    (question) => answers[question.id] === question.correctAnswer
  ).length;

  const answeredQuestions = Object.keys(answers).length;
  const wrongQuestions = answeredQuestions - correctQuestions;
  const skippedQuestions = totalQuestions - answeredQuestions;

  const bandScore =
    correctQuestions === 0
      ? 0
      : Math.min(9, Math.round((correctQuestions / totalQuestions) * 9 * 2) / 2);

  return {
    totalQuestions,
    answeredQuestions,
    correctQuestions,
    wrongQuestions,
    skippedQuestions,
    bandScore,
  };
};
    const questionRefs = useRef<Record<number, HTMLElement | null>>({});
    const scrollToQuestion = (questionId: number) => {
        questionRefs.current[questionId]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    };
    if (!test) {
        return (
            <div className={styles.notFound}>
                <h1>Không tìm thấy bài luyện tập</h1>
                <Link to="/practice">Quay lại trang luyện tập</Link>
            </div>
        );
    }

    const handleAnswer = (questionId: number, value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    if (mode === "real") {
        if (realSubmitStep === "continue") {
            return (
                <RealSubmitContinueView
                    onNext={() => {
                        setRealSubmitStep("loading");

                        window.setTimeout(() => {
                            setRealSubmitStep("result");
                        }, 1500);
                    }}
                />
            );
        }

        if (realSubmitStep === "loading") {
            return <RealSubmitLoadingView />;
        }

        if (realSubmitStep === "result") {
            return (
                <RealExamResultView
                    {...getExamResult()}
                    time="00:00:27"
                />
            );
        }
        return (
            <>
                <RealTestReadingView
                    test={test}
                    answers={answers}
                    questionRefs={questionRefs}
                    onAnswer={handleAnswer}
                    onScrollToQuestion={scrollToQuestion}
                    onSubmit={() => setRealSubmitStep("continue")}
                />
            </>
        );
    }

    return (
        <>
            <PracticeReadingView
                test={test}
                answers={answers}
                questionRefs={questionRefs}
                onAnswer={handleAnswer}
                onScrollToQuestion={scrollToQuestion}
                onSubmit={handleSubmitTest}

            />
            {openResultModal && (
                <SubmitResultModal
                    totalQuestions={test.questions.length}
                    answeredQuestions={Object.keys(answers).length}
                    onClose={() => setOpenResultModal(false)}
                    onBackToPractice={handleBackToPractice}
                />
            )}
        </>
    );

}

type ReadingViewProps = {
    test: (typeof mockPracticeTests)[number];
    answers: AnswerMap;
    questionRefs: React.MutableRefObject<Record<number, HTMLElement | null>>;
    onAnswer: (questionId: number, value: string) => void;
    onScrollToQuestion: (questionId: number) => void;
    onSubmit: () => void;

};

function RealTestReadingView({
    test,
    answers,
    questionRefs,
    onAnswer,
    onScrollToQuestion,
    onSubmit,

}: ReadingViewProps) {
    const { formattedTime } = useCountdownTimer({
        minutes: test.durationMinutes,
        onTimeUp: () => {
            alert("Hết giờ làm bài. Bài làm sẽ được nộp tự động.");
        },
    });
    return (
        <div className={styles.realPage}>
            <header className={styles.realHeader}>
                <div>
                    <h1>{test.title}</h1>
                    <p>{formattedTime} remaining</p>
                </div>

                <div className={styles.realIcons}>
                    <span>⌕</span>
                    <span>🔔</span>
                    <span>☰</span>
                </div>
            </header>

            <section className={styles.realInstruction}>
                <strong>{test.partTitle}</strong>
                <span>{test.instruction}</span>
            </section>

            <main className={styles.realBody}>
                <section className={styles.realPassage}>
                    <h2>{test.passageTitle}</h2>

                    <div className={styles.passageText}>
                        <p>{test.passageTitle}</p>
                        {test.passage.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </section>

                <div className={styles.divider}>
                    <button>↔</button>
                </div>

                <section className={styles.realQuestions}>
                    <h3>Questions 1-6</h3>

                    <p className={styles.questionIntro}>
                        Do the following statements agree with the information given in
                        Reading Passage 1?
                        <br />
                        In boxes 1-6 on your answer sheet, write
                        <br />
                        <strong>TRUE</strong> if the statement agrees with the information
                        <br />
                        <strong>FALSE</strong> if the statement contradicts the information
                        <br />
                        <strong>NOT GIVEN</strong> if there is no information on this
                    </p>

                    {test.questions.map((question) => (
                        <QuestionBlock
                            key={question.id}
                            question={question}
                            value={answers[question.id]}
                            onAnswer={onAnswer}
                            realMode
                            questionRef={(element) => {
                                questionRefs.current[question.id] = element;
                            }}
                        />
                    ))}

                    <div className={styles.floatingArrows}>
                        <button>←</button>
                        <button>→</button>
                    </div>
                </section>
            </main>

            <footer className={styles.realFooter}>
                <div>
                    <strong>Part 1</strong>
                    {Array.from({ length: 13 }).map((_, index) => {
                        const questionNumber = index + 1;
                        const isAnswered = Boolean(answers[questionNumber]);

                        return (
                            <button
                                key={questionNumber}
                                className={isAnswered ? styles.answeredQuestion : ""}
                                onClick={() => onScrollToQuestion(questionNumber)}
                            >
                                {questionNumber}
                            </button>
                        );
                    })}
                </div>

                <div>
                    <strong>Part 2</strong>
                    <span>0 of 13</span>
                </div>

                <div>
                    <strong>Part 3</strong>
                    <span>0 of 14</span>
                </div>

                <button className={styles.checkButton} onClick={onSubmit}>
                    ✓
                </button>
            </footer>
        </div>
    );
}

function PracticeReadingView({
    test,
    answers,
    questionRefs,
    onAnswer,
    onScrollToQuestion,
    onSubmit,

}: ReadingViewProps) {
    const { formattedTime } = useCountdownTimer({
        minutes: test.durationMinutes,
    });
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
                <section className={styles.practicePassage}>
                    <div className={styles.panelTitle}>Passage</div>
                    <h2>{test.passageTitle}</h2>

                    <div className={styles.passageText}>
                        <p>{test.passageTitle}</p>
                        {test.passage.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </section>

                <div className={styles.practiceDivider}>
                    <button>↔</button>
                </div>

                <section className={styles.practiceQuestions}>
                    <div className={styles.tabs}>
                        <button className={styles.activeTab}>Câu hỏi</button>
                        <button>Đáp án</button>
                    </div>

                    {test.questions.map((question) => (
                        <QuestionBlock
                            key={question.id}
                            question={question}
                            value={answers[question.id]}
                            onAnswer={onAnswer}
                            questionRef={(element) => {
                                questionRefs.current[question.id] = element;
                            }}
                        />
                    ))}
                </section>
            </main>

            <footer className={styles.practiceFooter}>
                <button>Câu trước</button>

                <div>
                    {test.questions.map((question) => {
                        const isAnswered = Boolean(answers[question.id]);

                        return (
                            <button
                                key={question.id}
                                className={isAnswered ? styles.answeredQuestion : ""}
                                onClick={() => onScrollToQuestion(question.id)}
                            >
                                {question.id}
                            </button>
                        );
                    })}
                </div>

                <button>Câu tiếp theo →</button>
            </footer>
        </div>
    );
}

type Question = (typeof mockPracticeTests)[number]["questions"][number];

type QuestionBlockProps = {
    question: Question;
    value?: string;
    onAnswer: (questionId: number, value: string) => void;
    realMode?: boolean;
    questionRef?: (element: HTMLElement | null) => void;
};

function QuestionBlock({
    question,
    value,
    onAnswer,
    realMode,
    questionRef,
}: QuestionBlockProps) {
    const options = ["TRUE", "FALSE", "NOT GIVEN"];

    return (
        <article
            ref={questionRef}
            className={realMode ? styles.realQuestionItem : styles.practiceQuestionItem}
        >
            <div className={styles.questionTitle}>
                <span>{question.id}</span>
                <p>{question.text}</p>
                <button>♡</button>
            </div>

            <div className={styles.optionList}>
                {options.map((option) => (
                    <label key={option}>
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={value === option}
                            onChange={() => onAnswer(question.id, option)}
                        />
                        <span>{option}</span>
                    </label>
                ))}
            </div>
        </article>
    );
}


function RealSubmitContinueView({ onNext }: { onNext: () => void }) {
  return (
    <div className={styles.submitContinuePage}>
      <div className={styles.submitTopBar}>
        <p>Click next to continue</p>

        <button onClick={onNext}>
          <span>➤</span>
          Next
        </button>
      </div>

      <div className={styles.submitBlankArea}>
        <div className={styles.floatingArrows}>
          <button>←</button>
          <button>→</button>
        </div>
      </div>

      <footer className={styles.realFooter}>
        <div>
          <strong>Part 1</strong>
          <span>0 of 13</span>
        </div>

        <div>
          <strong>Part 2</strong>
          <span>0 of 13</span>
        </div>

        <div>
          <strong>Part 3</strong>
          <span>0 of 14</span>
        </div>

        <button className={styles.checkButton}>✓</button>
      </footer>
    </div>
  );
}

function RealSubmitLoadingView() {
  return (
    <div className={styles.submitLoadingPage}>
      <div className={styles.loadingCard}>
        <div className={styles.spinner} />
        <h2>Đang nộp bài...</h2>
        <p>Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
}

type RealExamResultViewProps = {
  totalQuestions: number;
  answeredQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  skippedQuestions: number;
  bandScore: number;
  time: string;
};

function RealExamResultView({
  totalQuestions,
  correctQuestions,
  wrongQuestions,
skippedQuestions,
  bandScore,
  time,
}: RealExamResultViewProps) {

  const rows = [
  {
    type: "True - False - Not Given",
    total: totalQuestions,
    correct: correctQuestions,
    wrong: wrongQuestions,
    skipped: skippedQuestions,
  },
];

  return (
    <div className={styles.resultPage}>
      <section className={styles.resultTopGrid}>
        <div className={styles.motivationCard}>
          <div className={styles.mascot}>💪</div>
          <p>
            Đề IELTS hơi khó bạn nhỉ, mình cố tiếp cùng nhau nha, từ từ sẽ giỏi
            thôi!
          </p>
        </div>

        <div className={styles.resultSummaryCard}>
          <div>
            <h2>Kết quả làm bài</h2>
          </div>

          <div className={styles.timeBox}>
            <span>Thời gian làm bài</span>
            <strong>{time}</strong>
          </div>

          <div className={styles.resultCircle}>
            <strong>
              {correctQuestions}/{totalQuestions}
            </strong>
            <span>câu đúng</span>
          </div>

          <div className={styles.resultLegend}>
            <p>
              <i className={styles.correctDot} /> Đúng: <strong>{correctQuestions} câu</strong>
            </p>
            <p>
              <i className={styles.wrongDot} /> Sai: <strong>{wrongQuestions} câu</strong>
            </p>
            <p>
              <i className={styles.skipDot} /> Bỏ qua: <strong>{skippedQuestions} câu</strong>
            </p>
          </div>

          <button>Xem giải thích chi tiết</button>
        </div>

        <div className={styles.bandScoreCard}>
          <span>Band Score:</span>
          <strong>{bandScore.toFixed(1)}</strong>
        </div>
      </section>

      <section className={styles.resultTableCard}>
        <h3>Bảng dữ liệu chi tiết</h3>

        <table>
          <thead>
            <tr>
              <th>Loại câu hỏi</th>
              <th>Số câu hỏi</th>
              <th>Đúng</th>
              <th>Sai</th>
              <th>Bỏ qua</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.type}>
                <td>{row.type}</td>
                <td>{row.total}</td>
                <td>
                  <span className={styles.correctBadge}>{row.correct}</span>
                </td>
                <td>
                  <span className={styles.wrongBadge}>{row.wrong}</span>
                </td>
                <td>
                  <span className={styles.skipBadge}>{row.skipped}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}