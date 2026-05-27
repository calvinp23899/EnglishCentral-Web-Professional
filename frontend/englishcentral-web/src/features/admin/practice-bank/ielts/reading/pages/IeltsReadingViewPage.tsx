import { useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, FileText, ListChecks } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { mockPracticeTests } from "@/features/public/practice/data/mockPracticeTests";
import type {
  IELTSMockTest,
  IELTSReadingQuestion,
  IELTSReadingQuestionGroup,
} from "@/features/public/practice/types/practice-test.type";

import { readingRecords } from "./readingCrud.config";
import styles from "./IeltsReadingViewPage.module.scss";

const isHtmlContent = (content: string) => /<\/?[a-z][\s\S]*>/i.test(content);

const renderContent = (content: string) =>
  isHtmlContent(content) ? (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  ) : (
    <p>{content || "Chưa có nội dung."}</p>
  );

const getQuestionCount = (group?: IELTSReadingQuestionGroup) =>
  group?.questions.length ?? 0;

export function IeltsReadingViewPage() {
  const { recordId } = useParams();
  const record = readingRecords.find((item) => item.id === recordId);

  const test = useMemo<IELTSMockTest>(() => {
    const baseTest = mockPracticeTests[0];

    return {
      ...baseTest,
      id: record?.id ? `admin-reading-${record.id}` : baseTest.id,
      title: record?.title ? String(record.title) : baseTest.title,
      level: record?.level ? String(record.level) : baseTest.level,
      sourceLabel: record?.code ? String(record.code) : baseTest.sourceLabel,
    };
  }, [record]);

  const [activePassageId, setActivePassageId] = useState(() => test.passages[0]?.id ?? "");
  const activePassage =
    test.passages.find((passage) => passage.id === activePassageId) ?? test.passages[0];
  const [activeGroupId, setActiveGroupId] = useState(
    () => activePassage?.questionGroups[0]?.id ?? "",
  );
  const activeGroup =
    activePassage?.questionGroups.find((group) => group.id === activeGroupId) ??
    activePassage?.questionGroups[0];
  const [openQuestionIds, setOpenQuestionIds] = useState<Record<string, boolean>>({});

  const selectPassage = (passageId: string) => {
    const nextPassage = test.passages.find((passage) => passage.id === passageId);

    setActivePassageId(passageId);
    setActiveGroupId(nextPassage?.questionGroups[0]?.id ?? "");
    setOpenQuestionIds({});
  };

  const renderQuestionOptions = (question: IELTSReadingQuestion) => {
    if (!question.options?.length) {
      return null;
    }

    return (
      <div className={styles.optionList}>
        <strong>QuestionOptions</strong>
        {question.options.map((option) => (
          <div className={styles.optionRow} key={`${question.id}-${option.label}`}>
            <span>{option.label}</span>
            <p>{option.content}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <Link to="/admin/practice-bank/ielts/reading">
          <ArrowLeft aria-hidden="true" size={16} />
          Quay lại danh sách
        </Link>
        <div>
          <span>READING VIEW</span>
          <h1>{test.title}</h1>
          <p>{test.description}</p>
        </div>
      </section>

      <section className={styles.metaPanel}>
        <div>
          <span>Mã đề</span>
          <strong>{record?.code ?? test.sourceLabel}</strong>
        </div>
        <div>
          <span>Level</span>
          <strong>{test.level}</strong>
        </div>
        <div>
          <span>Passages</span>
          <strong>{test.passages.length}</strong>
        </div>
        <div>
          <span>Questions</span>
          <strong>
            {test.passages.reduce(
              (total, passage) =>
                total +
                passage.questionGroups.reduce(
                  (passageTotal, group) => passageTotal + group.questions.length,
                  0,
                ),
              0,
            )}
          </strong>
        </div>
      </section>

      <section className={styles.viewer}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>
            <FileText aria-hidden="true" size={17} />
            <strong>Passages</strong>
          </div>
          <div className={styles.passageTabs}>
            {test.passages.map((passage) => (
              <button
                className={passage.id === activePassage?.id ? styles.activeTab : ""}
                key={passage.id}
                type="button"
                onClick={() => selectPassage(passage.id)}
              >
                Passage {passage.part}
              </button>
            ))}
          </div>

          <div className={styles.sidebarTitle}>
            <ListChecks aria-hidden="true" size={17} />
            <strong>Groups</strong>
          </div>
          <div className={styles.groupList}>
            {activePassage?.questionGroups.map((group) => (
              <button
                className={group.id === activeGroup?.id ? styles.activeGroup : ""}
                key={group.id}
                type="button"
                onClick={() => {
                  setActiveGroupId(group.id);
                  setOpenQuestionIds({});
                }}
              >
                <strong>{group.title}</strong>
                <span>{group.type}</span>
                <small>{getQuestionCount(group)} questions</small>
              </button>
            ))}
          </div>
        </aside>

        <div className={styles.content}>
          {activePassage && (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>Passage {activePassage.part}</span>
                  <h2>{activePassage.title}</h2>
                </div>
                <strong>{activePassage.questionGroups.length} groups</strong>
              </div>

              <div className={styles.instructionBlock}>
                <strong>Instruction</strong>
                {renderContent(activePassage.instruction)}
              </div>

              <div className={styles.paragraphList}>
                {activePassage.paragraphs.map((paragraph) => (
                  <article className={styles.paragraphCard} key={paragraph.id}>
                    <span>{paragraph.label}</span>
                    <div>{renderContent(paragraph.content)}</div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeGroup && (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>Question Group</span>
                  <h2>{activeGroup.title}</h2>
                </div>
                <strong>{activeGroup.type}</strong>
              </div>

              <div className={styles.instructionBlock}>
                <strong>Instruction</strong>
                {renderContent(activeGroup.instruction)}
              </div>

              {activeGroup.options?.length ? (
                <div className={styles.optionList}>
                  <strong>Group Options</strong>
                  {activeGroup.options.map((option) => (
                    <div className={styles.optionRow} key={`${activeGroup.id}-${option.label}`}>
                      <span>{option.label}</span>
                      <p>{option.content}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className={styles.questionList}>
                {activeGroup.questions.map((question) => {
                  const isOpen = Boolean(openQuestionIds[question.id]);

                  return (
                    <article className={styles.questionCard} key={question.id}>
                      <button
                        className={styles.questionHeader}
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() =>
                          setOpenQuestionIds((currentOpenIds) => ({
                            ...currentOpenIds,
                            [question.id]: !isOpen,
                          }))
                        }
                      >
                        <ChevronDown aria-hidden="true" size={16} />
                        <span>Question {question.number}</span>
                        <strong>{question.correctAnswer || "No answer key"}</strong>
                      </button>

                      {isOpen && (
                        <div className={styles.questionBody}>
                          <div>
                            <strong>Question text</strong>
                            {renderContent(question.text)}
                          </div>
                          {renderQuestionOptions(question)}
                          <div>
                            <strong>Correct answer</strong>
                            <p>{question.correctAnswer || "Chưa có đáp án."}</p>
                          </div>
                          <div>
                            <strong>Explanation</strong>
                            {renderContent(question.explanation ?? "")}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
