import type { IELTSMockTest, IELTSReadingQuestionType } from "../types/practice-test.type";

import type { ExamVersionSummary } from "./public-practice-api";

type ExamVersionQuestion = NonNullable<
  NonNullable<
    NonNullable<NonNullable<ExamVersionSummary["sections"]>[number]["parts"]>[number]["questionGroups"]
  >[number]["questions"]
>[number];

const parseJson = <T,>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const decodeHtmlEntities = (value: string) => {
  if (typeof document !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value;
  }

  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
};

const htmlToReadableText = (value: string | null | undefined) => {
  if (!value) return "";

  const decoded = decodeHtmlEntities(value);
  const withBreaks = decoded
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|h[1-6]|li|blockquote)\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "");

  return decodeHtmlEntities(withBreaks)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const htmlToDisplayContent = (value: string | null | undefined) => {
  if (!value) return "";

  return decodeHtmlEntities(value)
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .trim();
};

const formatAnswerSlots = (slots: number[]) => {
  const normalizedSlots = slots.filter(Number.isFinite);

  if (!normalizedSlots.length) return "";
  if (normalizedSlots.length === 1) return String(normalizedSlots[0]);

  const sortedSlots = [...normalizedSlots].sort((a, b) => a - b);
  const isConsecutive = sortedSlots.every(
    (slot, index) => index === 0 || slot === sortedSlots[index - 1] + 1,
  );

  return isConsecutive
    ? `${sortedSlots[0]}-${sortedSlots[sortedSlots.length - 1]}`
    : sortedSlots.join(", ");
};

const normalizeQuestionNumberLabel = (label: string, answerSlots?: number[]) => {
  const slotLabel = answerSlots?.length ? formatAnswerSlots(answerSlots) : "";

  if (slotLabel) return slotLabel;

  const compactLabel = label.trim();

  if (/^\d{4}$/.test(compactLabel)) {
    const firstNumber = Number(compactLabel.slice(0, 2));
    const secondNumber = Number(compactLabel.slice(2));

    if (secondNumber === firstNumber + 1) {
      return `${firstNumber}-${secondNumber}`;
    }
  }

  return compactLabel;
};

const normalizeType = (value: string | number | null | undefined) =>
  String(value ?? "").replace(/[^a-z0-9]/gi, "").toLowerCase();

const toUiQuestionType = (
  type: string | number,
  configJson?: string | null,
): IELTSReadingQuestionType => {
  const config = parseJson<{ displayType?: string }>(configJson, {});
  const normalizedType = normalizeType(type);
  const displayType = String(config.displayType ?? "").toLowerCase();

  if (normalizedType.includes("matchingheading") || displayType.includes("matching_headings")) {
    return "matching-headings";
  }

  if (
    normalizedType.includes("matchinginformation") ||
    displayType.includes("matching_information")
  ) {
    return "matching-information";
  }

  if (normalizedType.includes("matchingfeature") || displayType.includes("matching_features")) {
    return "matching-features";
  }

  if (normalizedType.includes("matchingsentence") || displayType.includes("sentence_endings")) {
    return "matching-sentence-ending";
  }

  if (
    normalizedType.includes("summarycompletionwithoptions") ||
    displayType.includes("summary_completion_with_options")
  ) {
    return "summary-completion-options";
  }

  if (normalizedType.includes("truefalsenotgiven")) return "true-false-not-given";
  if (normalizedType.includes("yesnonotgiven")) return "yes-no-not-given";
  if (normalizedType.includes("multiplechoice")) return "multiple-choice";
  if (normalizedType.includes("shortanswer")) return "short-answer";
  if (displayType.includes("table")) return "table-completion";
  if (displayType.includes("note")) return "notes-completion";

  return "sentence-completion";
};

const getCorrectAnswer = (question: ExamVersionQuestion) => {
  if (!question.answerKeys?.length) return "";

  const optionById = new Map(question.answerOptions?.map((option) => [option.id, option.label]) ?? []);

  return question.answerKeys
    .map((answer) => answer.correctValue || (answer.examAnswerOptionId ? optionById.get(answer.examAnswerOptionId) : null))
    .filter(Boolean)
    .join(", ");
};

export const mapExamVersionToPracticeTest = (version: ExamVersionSummary): IELTSMockTest => {
  const readingSection =
    version.sections?.find((section) => {
      const skill = normalizeType(section.skill);
      const name = normalizeType(section.name);

      return skill === "2" || skill.includes("reading") || name.includes("reading");
    }) ?? version.sections?.[0];

  return {
    category: "ielts",
    description: version.description ?? "",
    durationMinutes: version.durationMinutes ?? readingSection?.durationMinutes ?? 60,
    id: String(version.id),
    level: "IELTS",
    note: "",
    passages:
      readingSection?.parts?.map((part, partIndex) => {
        const stimulus = part.stimuli?.[0];
        const metadata = parseJson<{ paragraphs?: Array<{ content: string; id: string; isHiddenLabel?: boolean; label: string }> }>(
          stimulus?.metadataJson,
          {},
        );
        const paragraphs = metadata.paragraphs?.length
          ? metadata.paragraphs.map((paragraph) => ({
              ...paragraph,
              content: htmlToDisplayContent(paragraph.content),
            }))
          : [{
              content: htmlToDisplayContent(stimulus?.content),
              id: `${part.id || partIndex + 1}-content`,
              isHiddenLabel: false,
              label: "",
            }];

        return {
          id: String(part.id ?? part.publicId ?? partIndex + 1),
          instruction: htmlToDisplayContent(part.instructions),
          isDragHeadingOnParagraph: part.questionGroups?.some((group) => toUiQuestionType(group.questionType, group.configJson) === "matching-headings") ?? false,
          paragraphs,
          part: part.orderIndex || partIndex + 1,
          questionGroups:
            part.questionGroups?.map((group, groupIndex) => {
              const type = toUiQuestionType(group.questionType, group.configJson);
              const groupConfig = parseJson<{
                heading?: string | null;
                summaryTemplate?: string | null;
                template?: string | null;
              }>(group.configJson, {});
              const groupOptions = group.questions?.[0]?.answerOptions?.map((option) => ({
                content: htmlToReadableText(option.content),
                label: option.label,
              }));

              return {
                id: String(group.id ?? group.publicId ?? `${partIndex + 1}-${groupIndex + 1}`),
                instruction: htmlToDisplayContent(group.instructions),
                options: groupOptions?.length ? groupOptions : undefined,
                questions:
                  group.questions?.map((question, questionIndex) => {
                    const questionMetadata = parseJson<{
                      answerSlots?: number[];
                      number?: number | string;
                      numberLabel?: string | null;
                      paragraph?: string;
                      passageRef?: string;
                      promptTemplate?: string;
                      sectionTitle?: string | null;
                      statementLabel?: string | null;
                      title?: string | null;
                      wordLimit?: number;
                    }>(
                      question.metadataJson,
                      {},
                    );
                    const metadataNumber = Number(
                      questionMetadata.number ?? questionMetadata.statementLabel,
                    );
                    const numberLabel = htmlToReadableText(
                      questionMetadata.numberLabel ?? questionMetadata.statementLabel,
                    );
                    const displayNumberLabel = normalizeQuestionNumberLabel(
                      numberLabel,
                      questionMetadata.answerSlots,
                    );
                    const sectionTitle = htmlToReadableText(
                      questionMetadata.sectionTitle ?? questionMetadata.title ?? question.title,
                    );

                    return {
                      correctAnswer: getCorrectAnswer(question),
                      explanation: htmlToReadableText(question.explanation),
                      id: String(question.id ?? question.publicId ?? `${groupIndex + 1}-${questionIndex + 1}`),
                      number: Number.isFinite(metadataNumber)
                        ? metadataNumber
                        : question.orderIndex || questionIndex + 1,
                      numberLabel: displayNumberLabel || undefined,
                      options: question.answerOptions?.map((option) => ({
                        content: htmlToReadableText(option.content),
                        label: option.label,
                      })),
                      passageRef: questionMetadata.paragraph ?? questionMetadata.passageRef ?? "",
                      sectionTitle: sectionTitle || undefined,
                      text: htmlToReadableText(
                        questionIndex === 0
                          ? groupConfig.summaryTemplate ??
                            groupConfig.template ??
                            questionMetadata.promptTemplate ??
                            question.prompt
                          : questionMetadata.promptTemplate ?? question.prompt,
                      ),
                      type,
                      wordLimit: questionMetadata.wordLimit,
                    };
                  }) ?? [],
                title: group.title ?? `Questions ${groupIndex + 1}`,
                type,
                heading: htmlToReadableText(groupConfig.heading) || undefined,
              };
            }) ?? [],
          title: part.name,
        };
      }) ?? [],
    skill: "reading",
    slug: version.versionCode.toLowerCase(),
    sourceLabel: version.versionCode,
    title: version.name || version.versionCode,
  };
};
