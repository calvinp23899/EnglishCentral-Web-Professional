import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Headphones,
  ListChecks,
  LoaderCircle,
  Send,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { toastDanger, toastSuccess } from "@/components/ui";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import {
  adminIeltsReadingApi,
  type ExamPart,
  type ExamQuestion,
  type ExamQuestionGroup,
  type ExamTemplate,
  type ExamVersion,
} from "../api/admin-ielts-reading-api";
import styles from "./IeltsReadingViewPage.module.scss";

const isHtmlContent = (content: string) => /<\/?[a-z][\s\S]*>/i.test(content);

const renderContent = (content?: string | null) =>
  content && isHtmlContent(content) ? (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  ) : (
    <p>{content || "Chưa có nội dung."}</p>
  );

const safeParseJson = <T,>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getOptionClientKey = (questionCode: string, optionLabel: string) =>
  `${questionCode}_${optionLabel.replace(/[^a-z0-9]/gi, "").toUpperCase()}`;

const formatAnswerOption = (option?: { label?: string | null; content?: string | null }) => {
  if (!option) return "";

  const label = String(option.label ?? "").trim();
  const content = String(option.content ?? "").trim();

  if (!content || content === label) return label;
  return label ? `${label} - ${content}` : content;
};

const getQuestionAnswer = (question: ExamQuestion) => {
  const optionById = new Map(
    question.answerOptions
      .filter((option) => option.id !== undefined)
      .map((option) => [option.id, option]),
  );
  const optionByClientKey = new Map(
    question.answerOptions.flatMap((option) => {
      const keys = [
        option.publicId,
        getOptionClientKey(question.code, option.label),
      ].filter(Boolean) as string[];

      return keys.map((key) => [key, option] as const);
    }),
  );

  const answers = question.answerKeys
    .map((answer) => {
      if (answer.correctValue) return answer.correctValue;

      const optionByAnswerId = answer.examAnswerOptionId
        ? optionById.get(answer.examAnswerOptionId)
        : undefined;
      const optionByAnswerKey = answer.answerOptionClientKey
        ? optionByClientKey.get(answer.answerOptionClientKey)
        : undefined;

      return formatAnswerOption(optionByAnswerId ?? optionByAnswerKey);
    })
    .filter(Boolean);

  return answers.join(", ") || "No answer key";
};

const getListeningSection = (version: ExamVersion | null) =>
  version?.sections.find((item) => {
    const skill = String(item.skill).toLowerCase();
    const name = String(item.name ?? "").toLowerCase();

    return skill === "listening" || skill === "1" || name.includes("listening");
  }) ?? version?.sections[0];

export function IeltsListeningViewPage() {
  const { recordId } = useParams();
  const [template, setTemplate] = useState<ExamTemplate | null>(null);
  const [version, setVersion] = useState<ExamVersion | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));
  const [isPublishing, setIsPublishing] = useState(false);
  const listeningSection = getListeningSection(version);
  const parts = listeningSection?.parts ?? [];
  const [activePartId, setActivePartId] = useState<number | null>(null);
  const activePart = parts.find((part) => part.id === activePartId) ?? parts[0];
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const activeGroup =
    activePart?.questionGroups.find((group) => group.id === activeGroupId) ??
    activePart?.questionGroups[0];
  const [openQuestionIds, setOpenQuestionIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!recordId) return;
    let isMounted = true;
    setIsLoading(true);

    adminIeltsReadingApi
      .getVersionById(recordId)
      .then(async (nextVersion) => {
        if (!isMounted) return;

        const nextTemplate = await adminIeltsReadingApi.getTemplateById(
          nextVersion.examTemplateId,
        );

        if (!isMounted) return;

        const firstPart = getListeningSection(nextVersion)?.parts[0];
        setTemplate(nextTemplate);
        setVersion(nextVersion);
        setActivePartId(firstPart?.id ?? null);
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
    () =>
      parts.reduce(
        (total, part) =>
          total +
          part.questionGroups.reduce((sum, group) => sum + group.questions.length, 0),
        0,
      ),
    [parts],
  );
  const isPublishedVersion = version
    ? String(version.status).toLowerCase() === "published" || String(version.status) === "2"
    : false;

  const publishVersion = async () => {
    if (!version || isPublishing) return;
    setIsPublishing(true);

    try {
      const published = await adminIeltsReadingApi.publishVersion(version.id);
      setVersion(published);
      toastSuccess("Publish đề IELTS Listening thành công.");
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
        {question.answerOptions.map((option, index) => {
          const normalizedLabel = String(option.label ?? "").trim();
          const normalizedContent = String(option.content ?? "").trim();
          const labelLooksLikeOptionCode = /^[A-Z]$|^[ivxlcdm]+$/i.test(normalizedLabel);
          const displayLabel = labelLooksLikeOptionCode
            ? normalizedLabel
            : String.fromCharCode(65 + index);
          const displayContent = normalizedContent || normalizedLabel;

          return (
            <div className={styles.optionRow} key={`${question.id}-${option.id ?? index}`}>
              <span>{displayLabel}</span>
              <p>{displayContent}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPartContent = (part: ExamPart) => {
    const audioStimulus =
      part.stimuli.find((stimulus) => String(stimulus.type).toLowerCase().includes("audio")) ??
      part.stimuli[0];
    const metadata = safeParseJson<{ audioName?: string | null }>(
      audioStimulus?.metadataJson,
      {},
    );
    const transcript = audioStimulus?.transcript?.trim() || audioStimulus?.content;

    return (
      <>
        <article className={styles.paragraphCard}>
          <div className={styles.paragraphContent}>
            <strong>Audio</strong>
            {audioStimulus?.assetUrl ? (
              <>
                {metadata.audioName && <p>{metadata.audioName}</p>}
                <audio controls src={audioStimulus.assetUrl} style={{ width: "100%" }}>
                  Trình duyệt của bạn không hỗ trợ audio.
                </audio>
              </>
            ) : (
              <p>Chưa có audio.</p>
            )}
          </div>
        </article>

        <article className={styles.paragraphCard}>
          <div className={styles.paragraphContent}>
            <strong>Transcript</strong>
            {renderContent(transcript)}
          </div>
        </article>
      </>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.instructionBlock}>Đang tải nội dung IELTS Listening...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <Link to="/admin/practice-bank/ielts/listening">
          <ArrowLeft aria-hidden="true" size={16} />
          Quay lại danh sách
        </Link>
        <div className={styles.headerMain}>
          <div>
            <span className={styles.eyebrow}>LISTENING VIEW</span>
            <h1>{template?.name ?? "IELTS Listening"}</h1>
            <p>
              {template?.description ??
                version?.description ??
                "Preview part, transcript, audio, question groups và answer key."}
            </p>
          </div>
          {version && (
            <div className={styles.headerActions}>
              <span className={isPublishedVersion ? styles.statusPublished : styles.statusDraft}>
                {isPublishedVersion ? "Published" : "Draft"}
              </span>
              {!isPublishedVersion && (
                <button
                  className={styles.publishButton}
                  disabled={isPublishing}
                  type="button"
                  onClick={() => void publishVersion()}
                >
                  {isPublishing ? (
                    <LoaderCircle aria-hidden="true" size={18} />
                  ) : (
                    <Send aria-hidden="true" size={18} />
                  )}
                  {isPublishing ? "Đang publish..." : "Publish"}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className={styles.metaPanel}>
        <div>
          <span>Mã đề</span>
          <strong>{template?.code ?? "-"}</strong>
        </div>
        <div>
          <span>Version</span>
          <strong>{version ? `v${version.versionNumber}` : "-"}</strong>
        </div>
        <div>
          <span>Parts</span>
          <strong>{parts.length}</strong>
        </div>
        <div>
          <span>Questions</span>
          <strong>{questionCount}</strong>
        </div>
      </section>

      {!version ? (
        <section className={styles.instructionBlock}>
          Đề này chưa có version nội dung.
        </section>
      ) : (
        <section className={styles.viewer}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarTitle}>
              <Headphones aria-hidden="true" size={17} />
              <strong>Parts</strong>
            </div>
            <div className={styles.passageTabs}>
              {parts.map((part) => (
                <button
                  className={part.id === activePart?.id ? styles.activeTab : ""}
                  key={part.id}
                  type="button"
                  onClick={() => {
                    setActivePartId(part.id ?? null);
                    setActiveGroupId(part.questionGroups[0]?.id ?? null);
                    setOpenQuestionIds({});
                  }}
                >
                  Part {part.orderIndex}
                </button>
              ))}
            </div>

            <div className={styles.sidebarTitle}>
              <ListChecks aria-hidden="true" size={17} />
              <strong>Groups</strong>
            </div>
            <div className={styles.groupList}>
              {activePart?.questionGroups.map((group: ExamQuestionGroup) => (
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
            {activePart && (
              <section className={styles.section}>
                <div className={styles.sectionHeading}>
                  <div>
                    <span>Part {activePart.orderIndex}</span>
                    <h2>{activePart.name}</h2>
                  </div>
                  <strong>{activePart.questionGroups.length} groups</strong>
                </div>
                <div className={styles.instructionBlock}>
                  <strong>Instruction</strong>
                  {renderContent(activePart.instructions)}
                </div>
                <div className={styles.paragraphList}>{renderPartContent(activePart)}</div>
              </section>
            )}

            {activeGroup && (
              <section className={styles.section}>
                <div className={styles.sectionHeading}>
                  <div>
                    <span>Question Group</span>
                    <h2>{activeGroup.title}</h2>
                  </div>
                  <strong>{String(activeGroup.questionType)}</strong>
                </div>
                <div className={styles.instructionBlock}>
                  <strong>Instruction</strong>
                  {renderContent(activeGroup.instructions)}
                </div>
                <div className={styles.questionList}>
                  {activeGroup.questions.map((question) => {
                    const isOpen = Boolean(openQuestionIds[String(question.id)]);

                    return (
                      <article className={styles.questionCard} key={question.id}>
                        <button
                          className={styles.questionHeader}
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() =>
                            setOpenQuestionIds((current) => ({
                              ...current,
                              [String(question.id)]: !isOpen,
                            }))
                          }
                        >
                          <ChevronDown aria-hidden="true" size={16} />
                          <span>{question.code}</span>
                          <strong>{getQuestionAnswer(question)}</strong>
                        </button>
                        {isOpen && (
                          <div className={styles.questionBody}>
                            <div>
                              <strong>Question text</strong>
                              {renderContent(question.prompt)}
                            </div>
                            {renderQuestionOptions(question)}
                            <div>
                              <strong>Correct answer</strong>
                              <p>{getQuestionAnswer(question)}</p>
                            </div>
                            <div>
                              <strong>Explanation</strong>
                              {renderContent(question.explanation)}
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
      )}
    </div>
  );
}
