import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, FileText, ListChecks } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { toastDanger, toastSuccess } from "@/components/ui";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import { adminIeltsReadingApi, type ExamPart, type ExamQuestion, type ExamQuestionGroup, type ExamTemplate, type ExamVersion } from "../api/admin-ielts-reading-api";
import styles from "./IeltsReadingViewPage.module.scss";

const isHtmlContent = (content: string) => /<\/?[a-z][\s\S]*>/i.test(content);

const renderContent = (content?: string | null) =>
  content && isHtmlContent(content) ? (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  ) : (
    <p>{content || "Chưa có nội dung."}</p>
  );

const getQuestionAnswer = (question: ExamQuestion) =>
  question.answerKeys.map((answer) => answer.correctValue).filter(Boolean).join(", ") || "No answer key";

export function IeltsReadingViewPage() {
  const { recordId } = useParams();
  const [template, setTemplate] = useState<ExamTemplate | null>(null);
  const [version, setVersion] = useState<ExamVersion | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));
  const [isPublishing, setIsPublishing] = useState(false);
  const readingSection = version?.sections.find((item) => String(item.skill).toLowerCase() === "reading" || String(item.skill) === "2") ?? version?.sections[0];
  const passages = readingSection?.parts ?? [];
  const [activePassageId, setActivePassageId] = useState<number | null>(null);
  const activePassage = passages.find((passage) => passage.id === activePassageId) ?? passages[0];
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const activeGroup = activePassage?.questionGroups.find((group) => group.id === activeGroupId) ?? activePassage?.questionGroups[0];
  const [openQuestionIds, setOpenQuestionIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!recordId) return;
    let isMounted = true;
    setIsLoading(true);
    adminIeltsReadingApi.getVersionById(recordId)
      .then(async (nextVersion) => {
        if (!isMounted) return;
        const nextTemplate = await adminIeltsReadingApi.getTemplateById(nextVersion.examTemplateId);
        if (!isMounted) return;
        setTemplate(nextTemplate);
        setVersion(nextVersion);
        const firstPart = nextVersion?.sections[0]?.parts[0];
        setActivePassageId(firstPart?.id ?? null);
        setActiveGroupId(firstPart?.questionGroups[0]?.id ?? null);
      })
      .catch((error) => toastDanger(getAuthErrorMessage(error)))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [recordId]);

  const questionCount = useMemo(
    () => passages.reduce((total, passage) => total + passage.questionGroups.reduce((sum, group) => sum + group.questions.length, 0), 0),
    [passages],
  );

  const publishVersion = async () => {
    if (!version || isPublishing) return;
    setIsPublishing(true);
    try {
      const published = await adminIeltsReadingApi.publishVersion(version.id);
      setVersion(published);
      toastSuccess("Publish đề IELTS Reading thành công.");
    } catch (error) {
      toastDanger(getAuthErrorMessage(error));
    } finally {
      setIsPublishing(false);
    }
  };

  const renderQuestionOptions = (question: ExamQuestion) => {
    if (!question.answerOptions.length) return null;

    return (
      <div className={styles.optionList}>
        <strong>QuestionOptions</strong>
        {question.answerOptions.map((option) => (
          <div className={styles.optionRow} key={`${question.id}-${option.label}`}>
            <span>{option.label}</span>
            <p>{option.content}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderPassageContent = (passage: ExamPart) => {
    const stimulus = passage.stimuli[0];
    const metadata = stimulus?.metadataJson ? JSON.parse(stimulus.metadataJson) as { paragraphs?: Array<{ id: string; label: string; content: string }> } : {};
    const paragraphs = metadata.paragraphs?.length ? metadata.paragraphs : [{ id: "content", label: "A", content: stimulus?.content ?? "" }];

    return paragraphs.map((paragraph) => (
      <article className={styles.paragraphCard} key={paragraph.id}>
        <span>{paragraph.label}</span>
        <div>{renderContent(paragraph.content)}</div>
      </article>
    ));
  };

  if (isLoading) {
    return <div className={styles.page}><div className={styles.instructionBlock}>Đang tải nội dung IELTS Reading...</div></div>;
  }

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <Link to="/admin/practice-bank/ielts/reading">
          <ArrowLeft aria-hidden="true" size={16} />
          Quay lại danh sách
        </Link>
        <div>
          <span>READING VIEW</span>
          <h1>{template?.name ?? "IELTS Reading"}</h1>
          <p>{template?.description ?? version?.description ?? "Preview passage, question groups và answer key."}</p>
        </div>
        {version && (
          <button disabled={isPublishing || String(version.status).toLowerCase() === "published" || String(version.status) === "2"} type="button" onClick={() => void publishVersion()}>
            {isPublishing ? "Đang publish..." : "Publish"}
          </button>
        )}
      </section>

      <section className={styles.metaPanel}>
        <div><span>Mã đề</span><strong>{template?.code ?? "-"}</strong></div>
        <div><span>Version</span><strong>{version ? `v${version.versionNumber}` : "-"}</strong></div>
        <div><span>Passages</span><strong>{passages.length}</strong></div>
        <div><span>Questions</span><strong>{questionCount}</strong></div>
      </section>

      {!version ? (
        <section className={styles.instructionBlock}>Đề này chưa có version nội dung.</section>
      ) : (
        <section className={styles.viewer}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarTitle}><FileText aria-hidden="true" size={17} /><strong>Passages</strong></div>
            <div className={styles.passageTabs}>
              {passages.map((passage) => (
                <button
                  className={passage.id === activePassage?.id ? styles.activeTab : ""}
                  key={passage.id}
                  type="button"
                  onClick={() => {
                    setActivePassageId(passage.id ?? null);
                    setActiveGroupId(passage.questionGroups[0]?.id ?? null);
                    setOpenQuestionIds({});
                  }}
                >
                  Passage {passage.orderIndex}
                </button>
              ))}
            </div>

            <div className={styles.sidebarTitle}><ListChecks aria-hidden="true" size={17} /><strong>Groups</strong></div>
            <div className={styles.groupList}>
              {activePassage?.questionGroups.map((group: ExamQuestionGroup) => (
                <button
                  className={group.id === activeGroup?.id ? styles.activeGroup : ""}
                  key={group.id}
                  type="button"
                  onClick={() => {
                    setActiveGroupId(group.id ?? null);
                    setOpenQuestionIds({});
                  }}
                >
                  <strong>{group.title}</strong>
                  <span>{String(group.questionType)}</span>
                  <small>{group.questions.length} questions</small>
                </button>
              ))}
            </div>
          </aside>

          <div className={styles.content}>
            {activePassage && (
              <section className={styles.section}>
                <div className={styles.sectionHeading}>
                  <div><span>Passage {activePassage.orderIndex}</span><h2>{activePassage.name}</h2></div>
                  <strong>{activePassage.questionGroups.length} groups</strong>
                </div>
                <div className={styles.instructionBlock}><strong>Instruction</strong>{renderContent(activePassage.instructions)}</div>
                <div className={styles.paragraphList}>{renderPassageContent(activePassage)}</div>
              </section>
            )}

            {activeGroup && (
              <section className={styles.section}>
                <div className={styles.sectionHeading}>
                  <div><span>Question Group</span><h2>{activeGroup.title}</h2></div>
                  <strong>{String(activeGroup.questionType)}</strong>
                </div>
                <div className={styles.instructionBlock}><strong>Instruction</strong>{renderContent(activeGroup.instructions)}</div>
                <div className={styles.questionList}>
                  {activeGroup.questions.map((question) => {
                    const isOpen = Boolean(openQuestionIds[String(question.id)]);
                    return (
                      <article className={styles.questionCard} key={question.id}>
                        <button
                          className={styles.questionHeader}
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenQuestionIds((current) => ({ ...current, [String(question.id)]: !isOpen }))}
                        >
                          <ChevronDown aria-hidden="true" size={16} />
                          <span>{question.code}</span>
                          <strong>{getQuestionAnswer(question)}</strong>
                        </button>
                        {isOpen && (
                          <div className={styles.questionBody}>
                            <div><strong>Question text</strong>{renderContent(question.prompt)}</div>
                            {renderQuestionOptions(question)}
                            <div><strong>Correct answer</strong><p>{getQuestionAnswer(question)}</p></div>
                            <div><strong>Explanation</strong>{renderContent(question.explanation)}</div>
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
      )}
    </div>
  );
}
