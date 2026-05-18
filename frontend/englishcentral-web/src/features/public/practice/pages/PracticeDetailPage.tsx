import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
import type { PublicLayoutOutletContext } from "@/app/layouts/public-layout/PublicLayout";
import { SubmitResultModal } from "../components/SubmitResultModal/SubmitResultModal";
import { getAllQuestions } from "../components/QuestionBlock";
import { mockPracticeTests } from "../data/mockPracticeTests";
import { PracticeReadingView } from "../views/PracticeReadingView";
import { RealExamResultView } from "../views/RealExamResultView";
import { RealExamReviewView } from "../views/RealExamReviewView";
import { RealSubmitContinueView } from "../views/RealSubmitContinueView";
import { RealSubmitLoadingView } from "../views/RealSubmitLoadingView";
import { RealTestReadingView } from "../views/RealTestReadingView";
import type { AnswerMap, ExamResult } from "../types/practice-test.type";
import styles from "./PracticeDetailPage.module.scss";

type RealSubmitStep = "exam" | "continue" | "loading" | "result" | "review";
type PracticeSubmitStep = "exam" | "result" | "review";

export function PracticeDetailPage() {
  const { category, slug } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") ?? "practice";
  const [realSubmitStep, setRealSubmitStep] = useState<RealSubmitStep>("exam");
  const [practiceSubmitStep, setPracticeSubmitStep] =
    useState<PracticeSubmitStep>("exam");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [openResultModal, setOpenResultModal] = useState(false);
  const navigate = useNavigate();
  const { setPublicChromeVisible } =
    useOutletContext<PublicLayoutOutletContext>();
  const questionRefs = useRef<Record<string, HTMLElement | null>>({});

  const test = useMemo(
    () =>
      mockPracticeTests.find(
        (item) => item.category === category && item.slug === slug
      ) ?? mockPracticeTests.find((item) => item.category === category),
    [category, slug]
  );

  const handleBackToPractice = () => {
    navigate("/practice");
  };

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

  if (!test) {
    return (
      <div className={styles.notFound}>
        <h1>Không tìm thấy bài luyện tập</h1>
        <Link to="/practice">Quay lại trang luyện tập</Link>
      </div>
    );
  }

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
          onReview={() => setRealSubmitStep("review")}
        />
      );
    }

    if (realSubmitStep === "review") {
      return (
        <RealExamReviewView
          test={test}
          answers={answers}
          result={getExamResult()}
          time="00:00:27"
          onBackToResult={() => setRealSubmitStep("result")}
          onBackToPractice={handleBackToPractice}
        />
      );
    }

    return (
      <RealTestReadingView
        test={test}
        answers={answers}
        questionRefs={questionRefs}
        onAnswer={handleAnswer}
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
