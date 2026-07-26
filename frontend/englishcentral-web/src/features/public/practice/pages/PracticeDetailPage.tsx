import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
import type { PublicLayoutOutletContext } from "@/app/layouts/public-layout/PublicLayout";
import { toastDanger } from "@/components/ui";
import {
  getAuthErrorMessage,
  getStoredAuthSession,
  getStudentIdWithRefresh,
} from "@/features/public/auth/api/auth-api";
import { SubmitResultModal } from "../components/SubmitResultModal/SubmitResultModal";
import { getAllQuestions } from "../components/QuestionBlock";
import { mockPracticeTests } from "../data/mockPracticeTests";
import { PracticeReadingView } from "../views/PracticeReadingView";
import { PracticeListeningView } from "../views/PracticeListeningView";
import { PracticeWritingView } from "../views/PracticeWritingView";
import { RealExamResultView } from "../views/RealExamResultView";
import { RealExamReviewView } from "../views/RealExamReviewView";
import { RealSubmitContinueView } from "../views/RealSubmitContinueView";
import { RealSubmitLoadingView } from "../views/RealSubmitLoadingView";
import { RealTestListeningView } from "../views/RealTestListeningView";
import { RealTestReadingView } from "../views/RealTestReadingView";
import { mapExamVersionToPracticeTest } from "../api/exam-version-to-practice-test";
import { publicPracticeApi } from "../api/public-practice-api";
import type {
  AnswerMap,
  ExamResult,
  IELTSMockTest,
  IELTSReadingQuestion,
} from "../types/practice-test.type";
import styles from "./PracticeDetailPage.module.scss";

type RealSubmitStep = "exam" | "continue" | "loading" | "result" | "review";
type PracticeSubmitStep = "exam" | "result" | "review";

const getNumericQuestionId = (question: IELTSReadingQuestion) => {
  const fallbackId = Number(question.id);
  return question.backendQuestionId ?? (Number.isFinite(fallbackId) ? fallbackId : null);
};

const splitAnswerValue = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const buildAttemptAnswers = (test: IELTSMockTest, answers: AnswerMap) =>
  getAllQuestions(test)
    .map((question) => {
      const questionId = getNumericQuestionId(question);
      const rawAnswer = answers[question.id]?.trim();

      if (!questionId || !rawAnswer) {
        return null;
      }

      const selectedValues = splitAnswerValue(rawAnswer);
      const optionIds = selectedValues
        .map((value) => question.optionBackendIds?.[value])
        .filter((value): value is number => typeof value === "number");

      if (optionIds.length === 1 && selectedValues.length === 1) {
        return {
          answerJson: null,
          answerOptionId: optionIds[0],
          answerText: null,
          questionId,
        };
      }

      if (optionIds.length > 1) {
        return {
          answerJson: JSON.stringify({
            answerOptionIds: optionIds,
            answers: selectedValues,
          }),
          answerOptionId: null,
          answerText: null,
          questionId,
        };
      }

      return {
        answerJson: null,
        answerOptionId: null,
        answerText: rawAnswer,
        questionId,
      };
    })
    .filter((answer): answer is NonNullable<typeof answer> => Boolean(answer));

const readNumber = (
  source: Record<string, unknown>,
  keys: string[],
  fallback: number,
) => {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return fallback;
};

const normalizeSubmitResult = (
  response: unknown,
  fallback: ExamResult,
): ExamResult => {
  const source =
    response && typeof response === "object"
      ? ((response as Record<string, unknown>).result as Record<string, unknown>) ??
        ((response as Record<string, unknown>).Result as Record<string, unknown>) ??
        (response as Record<string, unknown>)
      : {};
  const totalQuestions = readNumber(
    source,
    ["totalQuestions", "TotalQuestions", "total", "Total"],
    fallback.totalQuestions,
  );
  const correctQuestions = readNumber(
    source,
    ["correctQuestions", "CorrectQuestions", "correctCount", "CorrectCount", "score", "Score"],
    fallback.correctQuestions,
  );
  const answeredQuestions = readNumber(
    source,
    ["answeredQuestions", "AnsweredQuestions"],
    fallback.answeredQuestions,
  );
  const skippedQuestions = readNumber(
    source,
    ["skippedQuestions", "SkippedQuestions"],
    Math.max(totalQuestions - answeredQuestions, 0),
  );
  const wrongQuestions = readNumber(
    source,
    ["wrongQuestions", "WrongQuestions"],
    Math.max(answeredQuestions - correctQuestions, 0),
  );
  const bandScore = readNumber(
    source,
    ["bandScore", "BandScore", "ieltsBandScore", "IeltsBandScore"],
    fallback.bandScore,
  );

  return {
    answeredQuestions,
    bandScore,
    correctQuestions,
    skippedQuestions,
    totalQuestions,
    wrongQuestions,
  };
};

export function PracticeDetailPage() {
  const { category, slug } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") ?? "practice";
  const [realSubmitStep, setRealSubmitStep] = useState<RealSubmitStep>("exam");
  const [practiceSubmitStep, setPracticeSubmitStep] =
    useState<PracticeSubmitStep>("exam");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [apiTest, setApiTest] = useState<ReturnType<typeof mapExamVersionToPracticeTest> | null>(null);
  const [isLoadingApiTest, setIsLoadingApiTest] = useState(false);
  const [apiTestError, setApiTestError] = useState<string | null>(null);
  const [realActivePartIndex, setRealActivePartIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [submitResult, setSubmitResult] = useState<ExamResult | null>(null);
  const [openResultModal, setOpenResultModal] = useState(false);
  const navigate = useNavigate();
  const { setPublicChromeVisible } =
    useOutletContext<PublicLayoutOutletContext>();
  const questionRefs = useRef<Record<string, HTMLElement | null>>({});
  const apiVersionId =
    category === "ielts" ? slug?.match(/^exam-version-(\d+)$/) : null;
  const apiVersionRecordId = apiVersionId?.[1] ?? null;
  const isApiVersionRoute = Boolean(apiVersionRecordId);

  const mockTest = useMemo(
    () => {
      if (isApiVersionRoute) return null;

      return mockPracticeTests.find(
        (item) => item.category === category && item.slug === slug
      ) ?? mockPracticeTests.find((item) => item.category === category);
    },
    [category, slug, isApiVersionRoute]
  );
  const test = apiTest ?? mockTest;
  const isWaitingForApiVersion =
    isApiVersionRoute && !apiTest && !apiTestError;

  useEffect(() => {
    setApiTest(null);
    setApiTestError(null);

    if (!apiVersionRecordId) return;

    let isMounted = true;
    setIsLoadingApiTest(true);
    publicPracticeApi
      .getVersionById(apiVersionRecordId)
      .then((version) => {
        if (isMounted) {
          setApiTest(mapExamVersionToPracticeTest(version));
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setApiTest(null);
          setApiTestError(
            error instanceof Error
              ? error.message
              : "Không thể tải bài thi từ hệ thống.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingApiTest(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiVersionRecordId]);

  const handleBackToPractice = () => {
    navigate("/practice");
  };

  useEffect(() => {
    setStartedAt(new Date().toISOString());
    setSubmitResult(null);
    setRealActivePartIndex(0);
  }, [mode, test?.id]);

  useEffect(() => {
    const shouldUseFullscreen =
      mode === "real" &&
      ["exam", "continue", "loading"].includes(realSubmitStep);

    setPublicChromeVisible(!shouldUseFullscreen);

    return () => setPublicChromeVisible(true);
  }, [mode, realSubmitStep, setPublicChromeVisible]);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => {
      const nextAnswers = { ...prev };

      if (value) {
        nextAnswers[questionId] = value;
      } else {
        delete nextAnswers[questionId];
      }

      return nextAnswers;
    });
  };

  const scrollToQuestion = (questionId: string) => {
    questionRefs.current[questionId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const getExamResult = (): ExamResult => {
    if (!test) {
      return {
        totalQuestions: 0,
        answeredQuestions: 0,
        correctQuestions: 0,
        wrongQuestions: 0,
        skippedQuestions: 0,
        bandScore: 0,
      };
    }

    const questions = getAllQuestions(test);
    const totalQuestions = questions.length;
    const correctQuestions = questions.filter((question) => {
      const userAnswer = answers[question.id];
      const expectedAnswer = question.correctAnswer;

      if (!userAnswer) {
        return false;
      }

      if (userAnswer.includes(",") || expectedAnswer.includes(",")) {
        const userParts = userAnswer.split(",").map((item) => item.trim()).sort();
        const expectedParts = expectedAnswer.split(",").map((item) => item.trim()).sort();

        return userParts.join(",") === expectedParts.join(",");
      }

      return userAnswer === expectedAnswer;
    }).length;
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

  const handleRealExamSubmit = async () => {
    if (!test) return;

    const examVersionId = Number(test.id);

    if (!Number.isFinite(examVersionId)) {
      setSubmitResult(getExamResult());
      setRealSubmitStep("result");
      return;
    }

    setRealSubmitStep("loading");

    try {
      const currentUser = getStoredAuthSession()?.user;
      const attemptMode = await publicPracticeApi.getExamAttemptModeValue(
        mode === "real" ? "real" : "practice",
      );
      const studentId = await getStudentIdWithRefresh();
      const response = await publicPracticeApi.submitAttemptWithAnswers({
        answers: buildAttemptAnswers(test, answers),
        candidateEmail: currentUser?.email?.trim() || null,
        candidateName: currentUser?.name?.trim() || null,
        examVersionId,
        mode: attemptMode,
        startedAt,
        studentId,
      });

      setSubmitResult(normalizeSubmitResult(response, getExamResult()));
      setRealSubmitStep("result");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
      setRealSubmitStep("continue");
    }
  };

  if (isLoadingApiTest || isWaitingForApiVersion) {
    return (
      <div className={styles.notFound}>
        <h1>Đang tải bài thi...</h1>
      </div>
    );
  }

  if (isApiVersionRoute && apiTestError) {
    return (
      <div className={styles.notFound}>
        <h1>Không thể tải bài thi từ BE</h1>
        <p>{apiTestError}</p>
        <Link to="/practice">Quay lại trang luyện tập</Link>
      </div>
    );
  }

  if (!test) {
    return (
      <div className={styles.notFound}>
        <h1>Không tìm thấy bài luyện tập</h1>
        <Link to="/practice">Quay lại trang luyện tập</Link>
      </div>
    );
  }

  const supportsRealExam =
    test.category === "ielts" &&
    (test.skill === "reading" || test.skill === "listening");

  if (mode === "real" && supportsRealExam) {
    if (realSubmitStep === "continue") {
      return (
        <RealSubmitContinueView
          activePartIndex={realActivePartIndex}
          answers={answers}
          test={test}
          onBackToPart={(partIndex) => {
            setRealActivePartIndex(partIndex);
            setRealSubmitStep("exam");
          }}
          onNext={handleRealExamSubmit}
        />
      );
    }

    if (realSubmitStep === "loading") {
      return <RealSubmitLoadingView />;
    }

    if (realSubmitStep === "result") {
      return (
        <RealExamResultView
          {...(submitResult ?? getExamResult())}
          time="00:00:27"
          onReview={() => setRealSubmitStep("review")}
        />
      );
    }

    if (realSubmitStep === "review") {
      return (
        <RealExamReviewView
          test={test}
          answers={answers}
          result={submitResult ?? getExamResult()}
          time="00:00:27"
          onBackToResult={() => setRealSubmitStep("result")}
          onBackToPractice={handleBackToPractice}
        />
      );
    }

    if (test.category === "ielts" && test.skill === "listening") {
      return (
        <RealTestListeningView
          activePartIndex={realActivePartIndex}
          test={test}
          answers={answers}
          questionRefs={questionRefs}
          onAnswer={handleAnswer}
          onActivePartIndexChange={setRealActivePartIndex}
          onScrollToQuestion={scrollToQuestion}
          onSubmit={() => setRealSubmitStep("continue")}
        />
      );
    }

    return (
      <RealTestReadingView
        activePartIndex={realActivePartIndex}
        test={test}
        answers={answers}
        questionRefs={questionRefs}
        onAnswer={handleAnswer}
        onActivePartIndexChange={setRealActivePartIndex}
        onScrollToQuestion={scrollToQuestion}
        onSubmit={() => setRealSubmitStep("continue")}
      />
    );
  }

  if (practiceSubmitStep === "result") {
    return (
      <RealExamResultView
        {...getExamResult()}
        time="00:00:00"
        onReview={() => setPracticeSubmitStep("review")}
      />
    );
  }

  if (practiceSubmitStep === "review") {
    return (
      <RealExamReviewView
        test={test}
        answers={answers}
        result={getExamResult()}
        time="00:00:00"
        onBackToResult={() => setPracticeSubmitStep("result")}
        onBackToPractice={handleBackToPractice}
      />
    );
  }

  if (test.category === "ielts" && test.skill === "listening") {
    return (
      <>
        <PracticeListeningView
          test={test}
          answers={answers}
          questionRefs={questionRefs}
          onAnswer={handleAnswer}
          onScrollToQuestion={scrollToQuestion}
          onSubmit={() => setOpenResultModal(true)}
        />
        {openResultModal && (
          <SubmitResultModal
            onClose={() => setOpenResultModal(false)}
            onComplete={() => {
              setOpenResultModal(false);
              setPracticeSubmitStep("result");
            }}
          />
        )}
      </>
    );
  }

  if (test.category === "ielts" && test.skill === "writing") {
    return (
      <>
        <PracticeWritingView
          test={test}
          onSubmit={() => setOpenResultModal(true)}
        />
        {openResultModal && (
          <SubmitResultModal
            onClose={() => setOpenResultModal(false)}
            onComplete={() => {
              setOpenResultModal(false);
              setPracticeSubmitStep("result");
            }}
          />
        )}
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
        onSubmit={() => setOpenResultModal(true)}
      />
      {openResultModal && (
        <SubmitResultModal
          onClose={() => setOpenResultModal(false)}
          onComplete={() => {
            setOpenResultModal(false);
            setPracticeSubmitStep("result");
          }}
        />
      )}
    </>
  );
}
