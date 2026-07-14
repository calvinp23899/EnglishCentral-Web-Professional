import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  publicPracticeApi,
  type ExamAttemptDetailResponse,
  type ExamVersionSummary,
} from "@/features/public/practice/api/public-practice-api";
import { mapExamVersionToPracticeTest } from "@/features/public/practice/api/exam-version-to-practice-test";
import { getAllQuestions } from "@/features/public/practice/components/QuestionBlock";
import { RealExamReviewView } from "@/features/public/practice/views/RealExamReviewView";
import type {
  AnswerMap,
  ExamResult,
  IELTSMockTest,
} from "@/features/public/practice/types/practice-test.type";

import styles from "./PracticeHistoryDetailPage.module.scss";

const parseJson = (value?: string | null): Record<string, unknown> => {
  if (!value) return {};

  try {
    const parsed: unknown = JSON.parse(value);

    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
};

const formatDuration = (seconds?: number | null) => {
  if (!seconds || seconds <= 0) return "00:00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((item) => String(item).padStart(2, "0"))
    .join(":");
};

const readNumber = (source: unknown) => {
  if (typeof source === "number" && Number.isFinite(source)) return source;
  if (typeof source === "string" && Number.isFinite(Number(source))) return Number(source);

  return null;
};

const findQuestionOptionLabel = (
  test: IELTSMockTest,
  questionId: number,
  optionId: number,
) => {
  const question = getAllQuestions(test).find(
    (item) => item.backendQuestionId === questionId || Number(item.id) === questionId,
  );

  if (!question?.optionBackendIds) return "";

  const matchedEntry = Object.entries(question.optionBackendIds).find(
    ([, backendId]) => backendId === optionId,
  );

  return matchedEntry?.[0] ?? "";
};

const getAnswerFromJson = (
  test: IELTSMockTest,
  questionId: number,
  answerJson?: string | null,
) => {
  const parsed = parseJson(answerJson);
  const optionIds = parsed.answerOptionIds;

  if (Array.isArray(optionIds)) {
    const labels = optionIds
      .map(readNumber)
      .filter((value): value is number => value !== null)
      .map((optionId) => findQuestionOptionLabel(test, questionId, optionId))
      .filter(Boolean);

    if (labels.length) return labels.join(", ");
  }

  const answerValues = parsed.answers;

  if (Array.isArray(answerValues)) {
    return answerValues.map((item) => String(item ?? "").trim()).filter(Boolean).join(", ");
  }

  return Object.values(parsed)
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .join(", ");
};

const buildAnswerMap = (
  attempt: ExamAttemptDetailResponse,
  test: IELTSMockTest,
): AnswerMap => {
  const answerMap: AnswerMap = {};
  const questionByBackendId = new Map(
    getAllQuestions(test).map((question) => [
      question.backendQuestionId ?? Number(question.id),
      question,
    ]),
  );

  for (const response of attempt.responses ?? []) {
    const question = questionByBackendId.get(response.examQuestionId);

    if (!question) continue;

    const optionAnswer = response.examAnswerOptionId
      ? findQuestionOptionLabel(test, response.examQuestionId, response.examAnswerOptionId)
      : "";
    const jsonAnswer = getAnswerFromJson(test, response.examQuestionId, response.answerJson);
    const textAnswer = response.answerText?.trim() ?? "";
    const answer = optionAnswer || jsonAnswer || textAnswer;

    if (answer) {
      answerMap[question.id] = answer;
    }
  }

  return answerMap;
};

const buildResult = (
  attempt: ExamAttemptDetailResponse,
  test: IELTSMockTest,
  answers: AnswerMap,
): ExamResult => {
  const questions = getAllQuestions(test);
  const totalQuestions = questions.length;
  const responseByQuestionId = new Map(
    (attempt.responses ?? []).map((response) => [response.examQuestionId, response]),
  );
  const correctQuestions = questions.filter((question) => {
    const backendQuestionId = question.backendQuestionId ?? Number(question.id);
    const response = responseByQuestionId.get(backendQuestionId);

    if (typeof response?.isCorrect === "boolean") return response.isCorrect;

    const userAnswer = answers[question.id];

    if (!userAnswer) return false;

    const userParts = userAnswer.split(",").map((item) => item.trim()).sort();
    const expectedParts = question.correctAnswer.split(",").map((item) => item.trim()).sort();

    return userParts.join(",") === expectedParts.join(",");
  }).length;
  const answeredQuestions = Object.keys(answers).length;
  const wrongQuestions = Math.max(answeredQuestions - correctQuestions, 0);
  const skippedQuestions = Math.max(totalQuestions - answeredQuestions, 0);

  return {
    answeredQuestions,
    bandScore: Number(attempt.bandScore ?? attempt.scaledScore ?? 0),
    correctQuestions,
    skippedQuestions,
    totalQuestions,
    wrongQuestions,
  };
};

export function PracticeHistoryDetailPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<ExamAttemptDetailResponse | null>(null);
  const [version, setVersion] = useState<ExamVersionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDetail = async () => {
      if (!attemptId) {
        setErrorMessage("Không tìm thấy mã bài làm.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const attemptDetail = await publicPracticeApi.getPracticeAttemptDetail(attemptId);
        const versionDetail = await publicPracticeApi.getVersionById(attemptDetail.examVersionId);

        if (isMounted) {
          setAttempt(attemptDetail);
          setVersion(versionDetail);
        }
      } catch (error) {
        if (isMounted) {
          setAttempt(null);
          setVersion(null);
          setErrorMessage(
            error instanceof Error ? error.message : "Không thể tải chi tiết bài làm.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      isMounted = false;
    };
  }, [attemptId]);

  const test = useMemo(
    () => version ? mapExamVersionToPracticeTest(version) : null,
    [version],
  );
  const answers = useMemo(
    () => attempt && test ? buildAnswerMap(attempt, test) : {},
    [attempt, test],
  );
  const result = useMemo(
    () => attempt && test
      ? buildResult(attempt, test, answers)
      : {
          answeredQuestions: 0,
          bandScore: 0,
          correctQuestions: 0,
          skippedQuestions: 0,
          totalQuestions: 0,
          wrongQuestions: 0,
        },
    [answers, attempt, test],
  );

  if (isLoading) {
    return (
      <section className={styles.statePage}>
        <div className={styles.stateCard}>Đang tải giải thích chi tiết...</div>
      </section>
    );
  }

  if (errorMessage || !attempt || !test) {
    return (
      <section className={styles.statePage}>
        <div className={styles.stateCard}>
          <h1>Không thể tải giải thích chi tiết</h1>
          <p>{errorMessage || "Không có dữ liệu bài làm."}</p>
          <Link to="/practice-history">Quay lại lịch sử bài làm</Link>
        </div>
      </section>
    );
  }

  return (
    <RealExamReviewView
      answers={answers}
      result={result}
      test={test}
      time={formatDuration(attempt.durationSeconds)}
      onBackToPractice={() => navigate("/practice")}
      onBackToResult={() => navigate("/practice-history")}
    />
  );
}
