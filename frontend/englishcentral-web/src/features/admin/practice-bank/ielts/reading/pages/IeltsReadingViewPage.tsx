import { useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { RealTestReadingView } from "@/features/public/practice/views/RealTestReadingView";
import { mockPracticeTests } from "@/features/public/practice/data/mockPracticeTests";
import type { AnswerMap } from "@/features/public/practice/types/practice-test.type";

import { readingRecords } from "./readingCrud.config";
import styles from "./IeltsReadingViewPage.module.scss";

export function IeltsReadingViewPage() {
  const { recordId } = useParams();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const questionRefs = useRef<Record<string, HTMLElement | null>>({});
  const record = readingRecords.find((item) => item.id === recordId);

  const test = useMemo(() => {
    const baseTest = mockPracticeTests[0];

    return {
      ...baseTest,
      id: record?.id ? `admin-reading-${record.id}` : baseTest.id,
      title: record?.title ? String(record.title) : baseTest.title,
      level: record?.level ? String(record.level) : baseTest.level,
      sourceLabel: record?.code ? String(record.code) : baseTest.sourceLabel,
    };
  }, [record]);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((currentAnswers) => {
      const nextAnswers = { ...currentAnswers };

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

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Link to="/admin/practice-bank/ielts/reading">
          <ArrowLeft aria-hidden="true" size={16} />
          Quay lại danh sách
        </Link>
        <strong>Real exam preview</strong>
      </div>

      <div className={styles.previewShell}>
        <RealTestReadingView
          test={test}
          answers={answers}
          questionRefs={questionRefs}
          onAnswer={handleAnswer}
          onScrollToQuestion={scrollToQuestion}
          onSubmit={() => undefined}
        />
      </div>
    </div>
  );
}
