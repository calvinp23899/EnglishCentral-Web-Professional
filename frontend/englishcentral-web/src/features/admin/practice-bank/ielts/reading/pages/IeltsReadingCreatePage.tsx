import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  ListChecks,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { RichTextEditor, toastDanger, toastInfo, toastSuccess, toastWarning } from "@/components/ui";
import {
  adminMetadataApi,
  type MetadataOption,
} from "@/features/admin/shared/api/admin-metadata-api";
import { getAuthErrorMessage } from "@/features/public/auth/api/auth-api";

import { adminIeltsReadingApi, type ExamTemplate, type ExamVersion } from "../api/admin-ielts-reading-api";
import styles from "./IeltsReadingCreatePage.module.scss";

const steps = [
  { id: 1, label: "Setup", icon: Settings },
  { id: 2, label: "Passages", icon: FileText },
  { id: 3, label: "Questions", icon: ListChecks },
];

type TestSetup = {
  description: string;
  durationMinutes: number;
  level: string;
  note: string;
  numberPassages: number;
  sourceLabel: string;
  status: "draft" | "published";
  subDescriptions: string[];
  testCode: string;
  title: string;
};

type PassageParagraph = {
  content: string;
  id: string;
  isHiddenLabel: boolean;
  label: string;
};

type QuestionOption = {
  content?: string;
  explanation: string;
  id: string;
  isCorrectAnswer: boolean;
  option: string;
};

type GroupSharedOption = {
  content: string;
  id: string;
  label: string;
};

type QuestionItem = {
  answerSlots?: number[];
  blankLabel?: string;
  caseSensitive: boolean;
  choiceLimit?: number;
  correctAnswer: string;
  evidence?: string;
  explanation: string;
  id: string;
  number: number;
  numberLabel?: string;
  paragraphLabel?: string;
  passageRef: string;
  questionOptions: QuestionOption[];
  sectionTitle?: string;
  text: string;
  wordLimit?: number;
};

type QuestionGroup = {
  answerLimit?: string;
  choiceLimit?: number;
  displayType: string;
  groupLabel: string;
  heading?: string;
  id: string;
  instruction: string;
  interaction: "select" | "drag_drop" | "text_input" | "checkbox";
  optionsReusable?: boolean;
  questions: QuestionItem[];
  scoreMode?: "all_or_nothing" | "partial";
  sharedOptions: GroupSharedOption[];
  summaryTemplate?: string;
  title: string;
  type: string;
};

type ReadingPassage = {
  id: string;
  instruction: string;
  isDragHeadingOnParagraph: boolean;
  paragraphs: PassageParagraph[];
  part: number;
  questionGroups: QuestionGroup[];
  title: string;
};

const fallbackQuestionTypeOptions: MetadataOption[] = [
  { label: "MultipleChoiceSingle", value: "MultipleChoiceSingle", code: 1 },
  { label: "MultipleChoiceMultiple", value: "MultipleChoiceMultiple", code: 2 },
  { label: "TrueFalseNotGiven", value: "TrueFalseNotGiven", code: 3 },
  { label: "YesNoNotGiven", value: "YesNoNotGiven", code: 4 },
  { label: "Matching", value: "Matching", code: 5 },
  { label: "GapFill", value: "GapFill", code: 6 },
  { label: "ShortAnswer", value: "ShortAnswer", code: 7 },
];

type ReadingQuestionSubtype = {
  answerLimit?: string;
  description: string;
  displayType: string;
  interaction: "select" | "drag_drop" | "text_input" | "checkbox";
  label: string;
  optionsReusable?: boolean;
  questionType: string;
};

const readingQuestionSubtypes: ReadingQuestionSubtype[] = [
  {
    label: "Multiple Choice - One Answer",
    questionType: "MultipleChoiceSingle",
    displayType: "multiple_choice_single",
    interaction: "select",
    description: "Chọn một đáp án đúng cho mỗi câu hỏi.",
  },
  {
    label: "Multiple Choice - Multiple Answers",
    questionType: "MultipleChoiceMultiple",
    displayType: "multiple_choice_multiple",
    interaction: "checkbox",
    description: "Tạo 1 question cho mỗi cặp số, ví dụ 23-24. User chọn nhiều đáp án đúng bằng checkbox.",
  },
  {
    label: "Matching Information Table Select Grid",
    questionType: "MatchingInformationTableSelectGrid",
    displayType: "matching_information_table_select_grid",
    interaction: "select",
    optionsReusable: true,
    description: "Chọn đáp án trong bảng matching information. Có thể bật reuse để dùng lại option nhiều lần.",
  },
  {
    label: "Summary Completion With Options",
    questionType: "SummaryCompletionWithOptions",
    displayType: "summary_completion_with_options",
    interaction: "drag_drop",
    optionsReusable: false,
    description: "Hoàn thành summary bằng cách chọn/kéo phrase A-J vào từng blank. Mỗi blank là một question.",
  },
  {
    label: "Matching Headings",
    questionType: "MatchingHeadingDragDrop",
    displayType: "matching_headings",
    interaction: "drag_drop",
    optionsReusable: false,
    description: "Tạo danh sách headings dùng chung và chọn heading đúng cho từng đoạn/câu.",
  },
  {
    label: "Matching Information",
    questionType: "Matching",
    displayType: "matching_information",
    interaction: "drag_drop",
    optionsReusable: true,
    description: "Matching thông tin; một lựa chọn có thể dùng lại nhiều lần.",
  },
  {
    label: "Matching Features",
    questionType: "Matching",
    displayType: "matching_features",
    interaction: "drag_drop",
    optionsReusable: true,
    description: "Matching features/names/statements trong passage.",
  },
  {
    label: "Matching Sentence Endings",
    questionType: "Matching",
    displayType: "matching_sentence_endings",
    interaction: "drag_drop",
    optionsReusable: false,
    description: "Ghép nửa câu với ending phù hợp.",
  },
  {
    label: "True / False / Not Given",
    questionType: "TrueFalseNotGiven",
    displayType: "true_false_not_given",
    interaction: "select",
    description: "FE tự tạo 3 lựa chọn True, False, Not Given.",
  },
  {
    label: "Yes / No / Not Given",
    questionType: "YesNoNotGiven",
    displayType: "yes_no_not_given",
    interaction: "select",
    description: "FE tự tạo 3 lựa chọn Yes, No, Not Given.",
  },
  {
    label: "Short Answer",
    questionType: "ShortAnswer",
    displayType: "short_answer",
    interaction: "text_input",
    answerLimit: "NO_MORE_THAN_THREE_WORDS",
    description: "Nhập đáp án ngắn. Có thể nhập nhiều đáp án đúng cách nhau bằng dấu |.",
  },
  {
    label: "Sentence / Summary / Table Completion",
    questionType: "GapFill",
    displayType: "gap_fill",
    interaction: "text_input",
    answerLimit: "ONE_WORD_ONLY",
    description: "Nhập đáp án text. Có thể nhập nhiều đáp án đúng cách nhau bằng dấu |.",
  },
];

const fallbackReadingQuestionSubtype = readingQuestionSubtypes[0];
const maxReadingQuestions = 40;
const passageCountOptions = [1, 2, 3];
const gapFillAnswerLimitOptions = [
  { label: "ONE WORD ONLY", value: "ONE_WORD_ONLY" },
  { label: "NO MORE THAN TWO WORDS", value: "NO_MORE_THAN_TWO_WORDS" },
  { label: "NO MORE THAN THREE WORDS", value: "NO_MORE_THAN_THREE_WORDS" },
  { label: "ONE WORD AND/OR A NUMBER", value: "ONE_WORD_AND_OR_A_NUMBER" },
];

const normalizeQuestionType = (type: string | number | null | undefined) =>
  String(type ?? "").replace(/[^a-z0-9]/gi, "").toLowerCase();

const isMultipleChoiceType = (type: string | number) =>
  normalizeQuestionType(type).startsWith("multiplechoice");

const isMultipleChoiceMultipleType = (type: string | number) =>
  normalizeQuestionType(type) === "multiplechoicemultiple";

const isSingleChoiceType = (type: string | number) =>
  normalizeQuestionType(type) === "multiplechoicesingle" ||
  normalizeQuestionType(type) === "multiplechoice";

const isTrueFalseType = (type: string | number) =>
  normalizeQuestionType(type) === "truefalsenotgiven";

const isYesNoType = (type: string | number) =>
  normalizeQuestionType(type) === "yesnonotgiven";

const isDraftStatus = (status: string | number | null | undefined) => {
  const normalizedStatus = normalizeQuestionType(status);
  return normalizedStatus === "draft" || normalizedStatus === "1";
};

const isChoiceType = (type: string | number) =>
  isMultipleChoiceType(type) || isTrueFalseType(type) || isYesNoType(type);

const canAddOptionsForType = (type: string | number) => isMultipleChoiceType(type);

const isMatchingInformationTableSelectGrid = (type: string | number) => {
  const normalizedType = normalizeQuestionType(type);
  return (
    normalizedType.includes("matchinginformationtable") ||
    normalizedType.includes("matchinginformationselectgrid") ||
    normalizedType.includes("matchinginformationtableselectgrid")
  );
};

const isMatchingHeadingDragDropType = (type: string | number) =>
  normalizeQuestionType(type) === "matchingheadingdragdrop";

const isMatchingHeadingGroup = (group: Pick<QuestionGroup, "displayType" | "type">) =>
  isMatchingHeadingDragDropType(group.type) || group.displayType === "matching_headings";

const isSummaryCompletionWithOptionsGroup = (group: Pick<QuestionGroup, "displayType" | "type">) =>
  normalizeQuestionType(group.type) === "summarycompletionwithoptions" ||
  group.displayType === "summary_completion_with_options";

const isMatchingType = (type: string | number) =>
  normalizeQuestionType(type) === "matching" ||
  normalizeQuestionType(type).startsWith("matching") ||
  normalizeQuestionType(type) === "summarycompletionwithoptions";

const isTextInputType = (type: string | number) =>
  !isMatchingType(type) &&
  (
    normalizeQuestionType(type) === "gapfill" ||
    normalizeQuestionType(type) === "shortanswer" ||
    normalizeQuestionType(type).includes("completion") ||
    normalizeQuestionType(type).includes("summary") ||
    normalizeQuestionType(type).includes("table")
  );

const getDefaultDisplayTypeForQuestionType = (type: string | number | null | undefined) => {
  const normalizedType = normalizeQuestionType(type);

  if (normalizedType.includes("multiplechoice") && normalizedType.includes("multiple")) {
    return "multiple_choice_multiple";
  }
  if (
    normalizedType === "summarycompletionwithoptions" ||
    normalizedType.includes("summarycompletionwithoptions")
  ) {
    return "summary_completion_with_options";
  }
  if (normalizedType.includes("multiplechoice")) return "multiple_choice_single";
  if (normalizedType.includes("truefalsenotgiven")) return "true_false_not_given";
  if (normalizedType.includes("yesnonotgiven")) return "yes_no_not_given";
  if (
    normalizedType.includes("matchinginformationtable") ||
    normalizedType.includes("matchinginformationselectgrid") ||
    normalizedType.includes("matchinginformationtableselectgrid")
  ) {
    return "matching_information_table_select_grid";
  }
  if (normalizedType.includes("matchingheading")) return "matching_headings";
  if (normalizedType.includes("matchinginformation")) return "matching_information";
  if (normalizedType.includes("matchingfeature")) return "matching_features";
  if (normalizedType.includes("matchingsentence")) return "matching_sentence_endings";
  if (normalizedType.includes("matching")) return "matching_headings";
  if (normalizedType.includes("shortanswer")) return "short_answer";
  if (
    normalizedType.includes("gapfill") ||
    normalizedType.includes("completion") ||
    normalizedType.includes("summary") ||
    normalizedType.includes("table")
  ) {
    return "gap_fill";
  }

  return null;
};

const findQuestionSubtype = (
  questionType?: string | number | null,
  displayType?: string | null,
) =>
  readingQuestionSubtypes.find((subtype) => subtype.displayType === displayType) ??
  readingQuestionSubtypes.find(
    (subtype) => normalizeQuestionType(subtype.questionType) === normalizeQuestionType(questionType),
  ) ??
  readingQuestionSubtypes.find(
    (subtype) => subtype.displayType === getDefaultDisplayTypeForQuestionType(questionType),
  ) ??
  fallbackReadingQuestionSubtype;

const getQuestionRange = (group: Pick<QuestionGroup, "questions">) => {
  const numbers = group.questions.flatMap((question) => getQuestionAnswerSlots(question)).filter(Number.isFinite);
  if (!numbers.length) return "";
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return min === max ? `${min}` : `${min}-${max}`;
};

const getQuestionAnswerSlots = (question: Pick<QuestionItem, "answerSlots" | "number">) =>
  question.answerSlots?.length ? question.answerSlots : [question.number];

const formatAnswerSlots = (slots: number[]) => {
  const normalizedSlots = slots.filter(Number.isFinite).sort((first, second) => first - second);
  if (!normalizedSlots.length) return "";
  const isContiguous = normalizedSlots.every((slot, index) => index === 0 || slot === normalizedSlots[index - 1] + 1);
  if (isContiguous && normalizedSlots.length > 1) {
    return `${normalizedSlots[0]}-${normalizedSlots[normalizedSlots.length - 1]}`;
  }
  return normalizedSlots.join(", ");
};

const parseAnswerSlots = (value: string) => {
  const slots = value
    .split(/[^0-9]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);
  return Array.from(new Set(slots)).sort((first, second) => first - second);
};

const createDefaultAnswerSlots = (number: number, choiceLimit = 2) =>
  Array.from({ length: Math.max(1, choiceLimit) }, (_, index) => number + index);

const getQuestionCode = (question: QuestionItem) => {
  const slots = getQuestionAnswerSlots(question);
  return slots.length > 1 ? `Q${slots.join("_")}` : `Q${question.number}`;
};

const getSharedOptionClientKey = (question: QuestionItem, option: GroupSharedOption) =>
  `${getQuestionCode(question)}_${option.label.replace(/[^a-z0-9]/gi, "").toUpperCase()}`;

const romanHeadingLabels = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii"];

const getNextHeadingLabel = (index: number) =>
  romanHeadingLabels[index] ?? String(index + 1);

const getQuestionRangeCountFromText = (value: string) => {
  const matches = value.match(/\d+/g)?.map(Number).filter(Number.isFinite) ?? [];
  if (matches.length >= 2 && matches[1] >= matches[0]) {
    return matches[1] - matches[0] + 1;
  }
  return matches.length === 1 ? 1 : 0;
};

const getMatchingHeadingParagraphLabels = (passage: ReadingPassage, group: QuestionGroup) => {
  const explicitParagraphLabels = passage.paragraphs
    .map((paragraph) => paragraph.label)
    .filter(Boolean);
  const rangeCount = getQuestionRangeCountFromText(group.title || getQuestionRange(group));
  const inferredCount = Math.max(rangeCount, group.questions.length, explicitParagraphLabels.length, 7);

  return Array.from({ length: inferredCount }, (_, index) =>
    explicitParagraphLabels[index] || String.fromCharCode(65 + index),
  );
};

const createSharedOption = (label: string, content = ""): GroupSharedOption => ({
  content,
  id: crypto.randomUUID(),
  label,
});

const createDefaultSharedOptions = (subtype: ReadingQuestionSubtype): GroupSharedOption[] => {
  if (!isMatchingType(subtype.questionType)) return [];

  if (subtype.displayType === "matching_headings") {
    return romanHeadingLabels.slice(0, 4).map((label) => createSharedOption(label));
  }

  if (subtype.displayType === "summary_completion_with_options") {
    return Array.from({ length: 10 }, (_, index) =>
      createSharedOption(String.fromCharCode(65 + index)),
    );
  }

  return ["A", "B", "C", "D"].map((label) => createSharedOption(label));
};

const toQuestionTypeValue = (type: string | number, configJson?: string | null): string => {
  if (configJson) {
    try {
      const parsed = JSON.parse(configJson) as { uiType?: string; questionType?: string };
      if (parsed.questionType) return parsed.questionType;
      if (parsed.uiType) return parsed.uiType;
    } catch {
      // Ignore malformed legacy config.
    }
  }

  const normalizedType = normalizeQuestionType(type);
  if (normalizedType === "1" || normalizedType === "multiplechoice" || normalizedType === "multiplechoicesingle") return "MultipleChoiceSingle";
  if (normalizedType === "2" || normalizedType === "multiplechoicemultiple") return "MultipleChoiceMultiple";
  if (normalizedType === "3" || normalizedType === "truefalsenotgiven") return "TrueFalseNotGiven";
  if (normalizedType === "4" || normalizedType === "yesnonotgiven") return "YesNoNotGiven";
  if (normalizedType === "matchingheadingdragdrop") return "MatchingHeadingDragDrop";
  if (normalizedType === "summarycompletionwithoptions") return "SummaryCompletionWithOptions";
  if (normalizedType === "matchingnamedragdrop") return "MatchingNameDragDrop";
  if (normalizedType === "5" || normalizedType === "matching") return "Matching";
  if (normalizedType === "6" || normalizedType === "gapfill") return "GapFill";
  if (normalizedType === "7" || normalizedType === "shortanswer") return "ShortAnswer";
  return String(type || "MultipleChoiceSingle");
};

const parseJson = <T,>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const defaultSetup: TestSetup = {
  description: "A full IELTS Reading mock test with 3 passages and 40 questions.",
  durationMinutes: 60,
  level: "Academic",
  note: "Original mock dataset for UI development.",
  numberPassages: 3,
  sourceLabel: "IELTS Academic Reading - Original Mock Test",
  status: "draft",
  subDescriptions: ["3 reading passages with academic-style topics."],
  testCode: "IELTS-RD-001",
  title: "IELTS Reading Full Mock Test",
};

const createParagraph = (index: number): PassageParagraph => ({
  content: "",
  id: crypto.randomUUID(),
  isHiddenLabel: false,
  label: String.fromCharCode(65 + index),
});

const createQuestionOption = (option: string): QuestionOption => ({
  content: "",
  explanation: "",
  id: crypto.randomUUID(),
  isCorrectAnswer: false,
  option,
});

const createQuestionOptions = (type: string): QuestionOption[] => {
  if (isTrueFalseType(type)) {
    return ["True", "False", "Not Given"].map(createQuestionOption);
  }

  if (isYesNoType(type)) {
    return ["Yes", "No", "Not Given"].map(createQuestionOption);
  }

  if (isMultipleChoiceType(type)) {
    return ["A", "B", "C", "D"].map(createQuestionOption);
  }

  return [];
};

const getGroupSubtype = (group: QuestionGroup) => findQuestionSubtype(group.type, group.displayType);

const getGroupAnswerLabel = (group: QuestionGroup, question: QuestionItem) => {
  if (isChoiceType(group.type)) return question.correctAnswer || "No answer key";
  if (isMatchingType(group.type)) {
    const option = group.sharedOptions.find(
      (item) =>
        item.id === question.correctAnswer ||
        item.label === question.correctAnswer ||
        item.content === question.correctAnswer,
    );
    return option ? `${option.label}${option.content ? ` - ${option.content}` : ""}` : "No matching key";
  }
  return question.correctAnswer || "No answer key";
};

const renderBlankPreview = (question: QuestionItem) => {
  const blankLabel = question.blankLabel || String(question.number);
  const blankMarkup = `[ ${blankLabel} ]`;
  const prompt = (question.text || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/g, "'")
    .trim();

  if (prompt.includes("{blank}")) {
    return prompt.replaceAll("{blank}", blankMarkup);
  }

  if (prompt.includes("____")) {
    return prompt.replace(/_+/g, blankMarkup);
  }

  return `${prompt} ${blankMarkup}`.trim();
};

const shouldUseQuestionOptions = (type: string) => isChoiceType(type);

const getCorrectAnswerFromOptions = (questionOptions: QuestionOption[]) =>
  questionOptions
    .filter((option) => option.isCorrectAnswer)
    .map((option) => option.option)
    .join(", ");

const createQuestion = (
  number: number,
  type = "MultipleChoiceSingle",
  paragraphLabel?: string,
): QuestionItem => {
  const isMultiAnswer = isMultipleChoiceMultipleType(type);
  const isMatchingHeading = isMatchingHeadingDragDropType(type);
  const isSummaryCompletion = normalizeQuestionType(type) === "summarycompletionwithoptions";
  const answerSlots = isMultiAnswer ? createDefaultAnswerSlots(number, 2) : undefined;

  return {
    answerSlots,
    blankLabel: String(number),
    caseSensitive: false,
    choiceLimit: isMultiAnswer ? 2 : undefined,
    correctAnswer: "",
    explanation: "",
    id: crypto.randomUUID(),
    number,
    numberLabel: answerSlots ? formatAnswerSlots(answerSlots) : undefined,
    paragraphLabel: isMatchingHeading ? paragraphLabel : undefined,
    passageRef: isMatchingHeading ? paragraphLabel ?? "" : "",
    questionOptions: createQuestionOptions(type),
    sectionTitle: "",
    text: isMultiAnswer
      ? `Questions ${formatAnswerSlots(answerSlots ?? [number])}`
      : isMatchingHeading && paragraphLabel
        ? `Paragraph ${paragraphLabel}`
        : isSummaryCompletion
          ? `Blank ${number}`
        : `Question ${number}`,
  };
};

const createQuestionGroup = (order: number, questionNumber: number): QuestionGroup => {
  const subtype = fallbackReadingQuestionSubtype;

  return {
    id: crypto.randomUUID(),
    answerLimit: subtype.answerLimit,
    displayType: subtype.displayType,
    groupLabel: `Group ${order}`,
    instruction: "",
    interaction: subtype.interaction,
    optionsReusable: subtype.optionsReusable,
    questions: [createQuestion(questionNumber, "MultipleChoiceSingle")],
    sharedOptions: createDefaultSharedOptions(subtype),
    title: `Questions ${questionNumber}-${questionNumber}`,
    type: subtype.questionType,
  };
};

const createPassage = (part: number, firstQuestionNumber?: number): ReadingPassage => ({
  id: crypto.randomUUID(),
  instruction: `Read Passage ${part} and answer the questions.`,
  isDragHeadingOnParagraph: false,
  paragraphs: [createParagraph(0)],
  part,
  questionGroups:
    firstQuestionNumber === undefined ? [] : [createQuestionGroup(1, firstQuestionNumber)],
  title: `Reading Passage ${part}`,
});

const getAllQuestionNumbers = (readingPassages: ReadingPassage[]) =>
  readingPassages.flatMap((passage) =>
    passage.questionGroups.flatMap((group) => group.questions.flatMap((question) => getQuestionAnswerSlots(question))),
  );

const getQuestionCount = (readingPassages: ReadingPassage[]) =>
  readingPassages.reduce(
    (total, passage) =>
      total +
      passage.questionGroups.reduce(
        (passageTotal, group) =>
          passageTotal + group.questions.reduce((groupTotal, question) => groupTotal + getQuestionAnswerSlots(question).length, 0),
        0,
      ),
    0,
  );

const getNextQuestionNumber = (readingPassages: ReadingPassage[]) => {
  if (getQuestionCount(readingPassages) >= maxReadingQuestions) {
    return null;
  }

  const usedQuestionNumbers = new Set(getAllQuestionNumbers(readingPassages));

  for (let questionNumber = 1; questionNumber <= maxReadingQuestions; questionNumber += 1) {
    if (!usedQuestionNumbers.has(questionNumber)) {
      return questionNumber;
    }
  }

  return null;
};

const getPassageContent = (passage: ReadingPassage) =>
  passage.paragraphs.map((paragraph) => paragraph.content).filter(Boolean).join("\n\n");

const toVersionPassages = (version: ExamVersion): ReadingPassage[] => {
  const section = version.sections.find((item) => String(item.skill).toLowerCase() === "reading" || String(item.skill) === "2") ?? version.sections[0];

  return (section?.parts ?? []).map((part, partIndex) => {
    const stimulus = part.stimuli[0];
    const metadata = parseJson<{ paragraphs?: PassageParagraph[] }>(stimulus?.metadataJson, {});
    const paragraphs = metadata.paragraphs?.length
      ? metadata.paragraphs
      : [{
        id: stimulus?.publicId ?? crypto.randomUUID(),
        label: "A",
        content: stimulus?.content ?? "",
        isHiddenLabel: false,
      }];

    return {
      id: part.publicId ?? crypto.randomUUID(),
      instruction: part.instructions ?? "",
      isDragHeadingOnParagraph: false,
      paragraphs,
      part: part.orderIndex || partIndex + 1,
      title: stimulus?.title ?? part.name,
      questionGroups: part.questionGroups.map((group, groupIndex) => {
        const questionType = toQuestionTypeValue(group.questionType, group.configJson);
        const groupConfig = parseJson<{
          answerLimit?: string;
          choiceLimit?: number;
          displayType?: string;
          heading?: string;
          interaction?: "select" | "drag_drop" | "text_input" | "checkbox";
          optionsReusable?: boolean;
          paragraphs?: string[];
          scoreMode?: "all_or_nothing" | "partial";
          sharedOptions?: Array<{ content?: string; label?: string }>;
          summaryTemplate?: string;
        }>(group.configJson, {});
        const subtype = findQuestionSubtype(questionType, groupConfig.displayType);
        const sharedOptions = groupConfig.sharedOptions?.length
          ? groupConfig.sharedOptions.map((option) =>
              createSharedOption(option.label ?? "", option.content ?? ""),
            )
          : (isMatchingHeadingDragDropType(questionType) || isSummaryCompletionWithOptionsGroup({ type: questionType, displayType: groupConfig.displayType ?? "" })) &&
              group.questions[0]?.answerOptions.length
            ? group.questions[0].answerOptions.map((option) =>
                createSharedOption(option.label, option.content),
              )
          : createDefaultSharedOptions(subtype);
        return {
          id: group.publicId ?? crypto.randomUUID(),
          answerLimit: groupConfig.answerLimit ?? subtype.answerLimit,
          choiceLimit: groupConfig.choiceLimit,
          displayType: groupConfig.displayType ?? subtype.displayType,
          groupLabel: group.code || `Group ${groupIndex + 1}`,
          heading: groupConfig.heading ?? "",
          instruction: group.instructions ?? "",
          interaction: groupConfig.interaction ?? subtype.interaction,
          optionsReusable: groupConfig.optionsReusable ?? subtype.optionsReusable,
          scoreMode: groupConfig.scoreMode,
          questions: group.questions.map((question) => {
            const questionMetadata = parseJson<{
              answerSlots?: number[];
              blankLabel?: string;
              caseSensitive?: boolean;
              choiceLimit?: number;
              evidence?: string;
              numberLabel?: string;
              paragraph?: string;
              passageRef?: string;
              promptTemplate?: string;
              sectionTitle?: string;
              statementLabel?: string;
              wordLimit?: number | null;
            }>(question.metadataJson, {});
            const answerSlots = questionMetadata.answerSlots?.length
              ? questionMetadata.answerSlots
              : [Number(question.code.replace(/\D/g, "")) || question.orderIndex];
            const correctOptionLabels = question.answerOptions
              .filter((option) =>
                question.answerKeys.some((answer) =>
                  answer.correctValue === option.label ||
                  answer.correctValue === option.content ||
                  answer.examAnswerOptionId === option.id,
                ),
              )
              .map((option) => option.label);
            const correctAnswer = correctOptionLabels.length
              ? correctOptionLabels.join(", ")
              : question.answerKeys.map((answer) => answer.correctValue).filter(Boolean).join(" | ");

            return {
              id: question.publicId ?? crypto.randomUUID(),
              answerSlots: isMultipleChoiceMultipleType(questionType) ? answerSlots : undefined,
              blankLabel: questionMetadata.blankLabel ?? String(Number(question.code.replace(/\D/g, "")) || question.orderIndex),
              caseSensitive: questionMetadata.caseSensitive ?? question.answerKeys.some((answer) => answer.caseSensitive),
              choiceLimit: questionMetadata.choiceLimit ?? groupConfig.choiceLimit,
              evidence: questionMetadata.evidence ?? "",
              number: Number(question.code.replace(/\D/g, "")) || question.orderIndex,
              numberLabel: questionMetadata.numberLabel ?? formatAnswerSlots(answerSlots),
              paragraphLabel: questionMetadata.paragraph ?? "",
              text: questionMetadata.promptTemplate ?? question.prompt ?? "",
              correctAnswer,
              explanation: question.explanation ?? "",
              passageRef: questionMetadata.passageRef ?? "",
              questionOptions: question.answerOptions.map((option) => ({
                id: option.publicId ?? crypto.randomUUID(),
                content: option.content ?? "",
                option: option.label,
                explanation: option.metadataJson ? parseJson<{ explanation?: string }>(option.metadataJson, {}).explanation ?? "" : "",
                isCorrectAnswer: question.answerKeys.some((answer) =>
                  answer.correctValue === option.label ||
                  answer.correctValue === option.content ||
                  answer.examAnswerOptionId === option.id,
                ),
              })),
              sectionTitle: questionMetadata.sectionTitle ?? "",
              wordLimit: questionMetadata.wordLimit ?? undefined,
            };
          }),
          sharedOptions,
          summaryTemplate: groupConfig.summaryTemplate ?? "",
          title: group.title ?? `Questions ${groupIndex + 1}`,
          type: questionType,
        };
      }),
    };
  });
};

export function IeltsReadingCreatePage() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [setup, setSetup] = useState<TestSetup>(defaultSetup);
  const [passages, setPassages] = useState<ReadingPassage[]>([
    createPassage(1, 1),
    createPassage(2),
    createPassage(3),
  ]);
  const [activePassageId, setActivePassageId] = useState(() => passages[0].id);
  const [activeGroupId, setActiveGroupId] = useState(() => passages[0].questionGroups[0].id);
  const [isGroupEditorOpen, setGroupEditorOpen] = useState(true);
  const [openQuestionIds, setOpenQuestionIds] = useState<Record<string, boolean>>({});
  const [readingTemplate, setReadingTemplate] = useState<ExamTemplate | null>(null);
  const [questionTypeOptions, setQuestionTypeOptions] = useState<MetadataOption[]>(fallbackQuestionTypeOptions);
  const [currentVersionNumber, setCurrentVersionNumber] = useState(0);
  const [editingVersion, setEditingVersion] = useState<ExamVersion | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));
  const [isSaving, setIsSaving] = useState(false);

  const activePassage = useMemo(
    () => passages.find((passage) => passage.id === activePassageId) ?? passages[0],
    [activePassageId, passages],
  );
  const activeGroup = activePassage?.questionGroups.find((group) => group.id === activeGroupId);
  const activeGroupSubtype = activeGroup ? getGroupSubtype(activeGroup) : fallbackReadingQuestionSubtype;
  const activeGroupIsMatching = activeGroup ? isMatchingType(activeGroup.type) : false;
  const activeGroupIsMatchingHeading = activeGroup ? isMatchingHeadingGroup(activeGroup) : false;
  const activeGroupIsSummaryCompletionWithOptions = activeGroup
    ? isSummaryCompletionWithOptionsGroup(activeGroup)
    : false;
  const activeGroupIsMatchingInformationTable = activeGroup
    ? isMatchingInformationTableSelectGrid(activeGroup.type)
    : false;
  const activeGroupIsMultipleChoiceMultiple = activeGroup
    ? isMultipleChoiceMultipleType(activeGroup.type)
    : false;
  const activeGroupIsTextInput = activeGroup ? isTextInputType(activeGroup.type) : false;
  const activeGroupHasFixedChoices = activeGroup
    ? isTrueFalseType(activeGroup.type) || isYesNoType(activeGroup.type)
    : false;
  const questionTypeSelectOptions = useMemo(() => {
    const options = questionTypeOptions.length ? questionTypeOptions : fallbackQuestionTypeOptions;
    if (!activeGroup?.type) return options;

    const hasActiveType = options.some(
      (option) => normalizeQuestionType(option.value) === normalizeQuestionType(activeGroup.type),
    );
    if (hasActiveType) return options;

    return [
      ...options,
      {
        code: 0,
        label: String(activeGroup.type),
        value: String(activeGroup.type),
      },
    ];
  }, [activeGroup?.type, questionTypeOptions]);
  const totalQuestions = getQuestionCount(passages);
  const hasReachedQuestionLimit = totalQuestions >= maxReadingQuestions;

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setIsLoading(Boolean(recordId));
      try {
        const [readingType, questionTypes] = await Promise.all([
          adminIeltsReadingApi.getReadingTemplate(),
          adminMetadataApi.getExamQuestionTypeOptions().catch(() => fallbackQuestionTypeOptions),
        ]);
        if (!isMounted) return;
        setReadingTemplate(readingType);
        setQuestionTypeOptions(questionTypes.length ? questionTypes : fallbackQuestionTypeOptions);

        if (!recordId) {
          if (readingType) {
            setSetup((current) => ({
              ...current,
              description: readingType.description ?? current.description,
              durationMinutes: readingType.durationMinutes ?? current.durationMinutes,
              testCode: readingType.code || current.testCode,
              title: readingType.name || current.title,
            }));
            const latestVersion = (await adminIeltsReadingApi.getVersions({
              examTemplateId: readingType.id,
              pageSize: 1,
            })).items[0];
            if (isMounted) setCurrentVersionNumber(latestVersion?.versionNumber ?? 0);
          }
          setIsLoading(false);
          return;
        }

        const version = await adminIeltsReadingApi.getVersionById(recordId);
        if (!isMounted) return;

        if (!isDraftStatus(version.status)) {
          const shouldClone = window.confirm(
            "Đề đã published/archived không thể sửa trực tiếp. Bạn có muốn tạo bản draft mới từ đề này không?",
          );

          if (shouldClone) {
            const draftVersion = await adminIeltsReadingApi.cloneDraftVersion(version.id);
            if (isMounted) {
              toastSuccess("Đã tạo bản draft mới từ đề hiện tại.");
              navigate(`/admin/practice-bank/ielts/reading/${draftVersion.id}/edit`, { replace: true });
            }
          } else if (isMounted) {
            navigate(`/admin/practice-bank/ielts/reading/${version.id}/view`, { replace: true });
          }
          return;
        }

        const template = readingType ?? await adminIeltsReadingApi.getTemplateById(version.examTemplateId);
        setReadingTemplate(template);
        setEditingVersion(version);
        setCurrentVersionNumber(version.versionNumber);
        setSetup((current) => ({
          ...current,
          description: version.description ?? template.description ?? "",
          durationMinutes: version.durationMinutes ?? template.durationMinutes ?? 60,
          level: current.level,
          status: String(version.status).toLowerCase() === "published" || String(version.status) === "2" ? "published" : "draft",
          testCode: version.versionCode || template.code,
          title: version.name || template.name,
        }));

        if (version && isMounted) {
          setPassages(toVersionPassages(version));
          const nextPassages = toVersionPassages(version);
          setActivePassageId(nextPassages[0]?.id ?? "");
          setActiveGroupId(nextPassages[0]?.questionGroups[0]?.id ?? "");
        }
      } catch (error) {
        toastDanger(getAuthErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [recordId]);

  const buildVersionPayload = (templateId: number, preserveVersion = false) => {
    const nextVersionNumber = preserveVersion ? currentVersionNumber || 1 : currentVersionNumber + 1 || 1;
    const nextVersionCode = preserveVersion
      ? setup.testCode.trim() || editingVersion?.versionCode || "IELTS-RD-DRAFT"
      : `${setup.testCode.trim() || "IELTS-RD"}-V${nextVersionNumber}`;
    const nextVersionName = preserveVersion
      ? setup.title.trim() || editingVersion?.name || "IELTS Reading Draft"
      : `${setup.title.trim() || "IELTS Reading"} v${nextVersionNumber}`;
    const templateDurationMinutes = readingTemplate?.durationMinutes ?? setup.durationMinutes ?? 60;
    const templateTotalScore = readingTemplate?.totalScore ?? 40;
    const buildAnswerOptions = (group: QuestionGroup, question: QuestionItem) => {
      if (isChoiceType(group.type)) {
        const isMultiAnswer = isMultipleChoiceMultipleType(group.type);
        const questionCode = getQuestionCode(question);
        return question.questionOptions.map((option, optionIndex) => ({
          clientKey: isMultiAnswer ? `${questionCode}_${option.option}` : option.id,
          label: option.option,
          content: option.content || option.option,
          orderIndex: optionIndex + 1,
          metadataJson: JSON.stringify({ explanation: option.explanation }),
        }));
      }

      if (isMatchingType(group.type)) {
        if (isMatchingHeadingGroup(group) || isSummaryCompletionWithOptionsGroup(group)) {
          return group.sharedOptions.map((option, optionIndex) => ({
            clientKey: getSharedOptionClientKey(question, option),
            label: option.label,
            content: option.content || option.label,
            orderIndex: optionIndex + 1,
            metadataJson: null,
          }));
        }

        return group.sharedOptions.map((option, optionIndex) => ({
          clientKey: `${question.id}-${option.id}`,
          label: option.label,
          content: option.content || option.label,
          orderIndex: optionIndex + 1,
          metadataJson: JSON.stringify({ reusable: group.optionsReusable ?? false }),
        }));
      }

      return null;
    };
    const buildAnswerKeys = (group: QuestionGroup, question: QuestionItem) => {
      if (isChoiceType(group.type)) {
        const isMultiAnswer = isMultipleChoiceMultipleType(group.type);
        const questionCode = getQuestionCode(question);
        return question.questionOptions
          .filter((option) => option.isCorrectAnswer)
          .map((option, optionIndex) => ({
            answerOptionClientKey: isMultiAnswer ? `${questionCode}_${option.option}` : option.id,
            correctValue: isMultiAnswer ? null : option.option,
            matchPattern: null,
            score: 1,
            caseSensitive: false,
            orderIndex: optionIndex + 1,
          }));
      }

      if (isMatchingType(group.type)) {
        const matchedOption = group.sharedOptions.find(
          (option) =>
            option.id === question.correctAnswer ||
            option.label === question.correctAnswer ||
            option.content === question.correctAnswer,
        );

        return matchedOption
          ? [{
              answerOptionClientKey: isMatchingHeadingGroup(group) || isSummaryCompletionWithOptionsGroup(group)
                ? getSharedOptionClientKey(question, matchedOption)
                : `${question.id}-${matchedOption.id}`,
              correctValue: isMatchingHeadingGroup(group) || isSummaryCompletionWithOptionsGroup(group)
                ? null
                : matchedOption.label,
              matchPattern: null,
              score: 1,
              caseSensitive: false,
              orderIndex: 1,
            }]
          : [];
      }

      return (question.correctAnswer || "")
        .split("|")
        .map((answer) => answer.trim())
        .filter(Boolean)
        .map((answer, answerIndex) => ({
          answerOptionClientKey: null,
          correctValue: answer,
          matchPattern: null,
          score: answerIndex === 0 ? 1 : 0,
          caseSensitive: question.caseSensitive,
          orderIndex: answerIndex + 1,
        }));
    };

    return {
      examTemplateId: templateId,
      versionCode: nextVersionCode,
      versionNumber: nextVersionNumber,
      name: nextVersionName,
      description: setup.description.trim() || null,
      durationMinutes: templateDurationMinutes,
      totalScore: templateTotalScore,
      scoringMode: "Auto" as const,
      runtimeConfigJson: JSON.stringify({
        exam: "IELTS",
        module: "Reading",
        level: setup.level,
        mode: "CBT",
        note: setup.note,
        numberOfPassages: setup.numberPassages,
        sourceLabel: setup.sourceLabel,
        subDescription: setup.subDescriptions.filter(Boolean).join("\n"),
      }),
      scoringConfigJson: JSON.stringify({ scorePerCorrect: 1 }),
      sections: [{
        code: "READING",
        name: "Reading",
        skill: "Reading" as const,
        orderIndex: 1,
        durationMinutes: templateDurationMinutes,
        maxScore: templateTotalScore,
        instructions: setup.description,
        runtimeConfigJson: JSON.stringify({ expectedQuestionCount: maxReadingQuestions, module: "Reading" }),
        parts: passages.map((passage, passageIndex) => ({
          code: `PASSAGE_${passageIndex + 1}`,
          name: passage.title || `Reading Passage ${passageIndex + 1}`,
          orderIndex: passageIndex + 1,
          instructions: passage.instruction || null,
          layoutConfigJson: JSON.stringify({ layout: "split_reading_question", part: passage.part }),
          stimuli: [{
            clientKey: `passage_${passageIndex + 1}_text`,
            type: "Text" as const,
            title: passage.title,
            content: getPassageContent(passage),
            assetUrl: null,
            transcript: null,
            orderIndex: 1,
            metadataJson: JSON.stringify({ paragraphs: passage.paragraphs }),
          }],
          questionGroups: passage.questionGroups.map((group, groupIndex) => {
            const subtype = getGroupSubtype(group);
            const isMultiAnswerGroup = isMultipleChoiceMultipleType(group.type);
            const isMatchingHeading = isMatchingHeadingGroup(group);
            const isSummaryCompletionWithOptions = isSummaryCompletionWithOptionsGroup(group);
            const groupChoiceLimit = group.choiceLimit ?? 2;

            return {
              code: group.groupLabel || `GROUP-${passageIndex + 1}-${groupIndex + 1}`,
              stimulusClientKey: `passage_${passageIndex + 1}_text`,
              title: group.title,
              instructions: group.instruction || null,
              questionType: isMatchingHeading
                ? "MatchingHeadingDragDrop"
                : isSummaryCompletionWithOptions
                  ? "SummaryCompletionWithOptions"
                  : group.type,
              orderIndex: groupIndex + 1,
              configJson: JSON.stringify({
                answerLimit: isMultiAnswerGroup ? undefined : group.answerLimit || subtype.answerLimit,
                choiceLimit: isMultiAnswerGroup ? groupChoiceLimit : undefined,
                displayType: group.displayType || subtype.displayType,
                heading: isMultiAnswerGroup ? undefined : group.heading || null,
                interaction: isMultiAnswerGroup ? "checkbox" : group.interaction || subtype.interaction,
                optionsReusable: isSummaryCompletionWithOptions ? false : group.optionsReusable ?? subtype.optionsReusable ?? false,
                paragraphs: isMatchingHeading
                  ? group.questions.map((question) => question.paragraphLabel).filter(Boolean)
                  : undefined,
                range: getQuestionRange(group),
                scoreMode: isMultiAnswerGroup ? group.scoreMode ?? "all_or_nothing" : undefined,
                summaryTemplate: isSummaryCompletionWithOptions ? group.summaryTemplate || "" : undefined,
                sharedOptions: isMatchingHeading || isSummaryCompletionWithOptions
                  ? undefined
                  : group.sharedOptions.map((option) =>
                    isMatchingInformationTableSelectGrid(group.type)
                    ? { label: option.label }
                    : {
                        content: option.content || option.label,
                        label: option.label,
                      },
                  ),
              }),
              questions: group.questions.map((question, questionIndex) => {
                const answerSlots = getQuestionAnswerSlots(question);
                const choiceLimit = question.choiceLimit ?? groupChoiceLimit;
                const paragraphLabel = question.paragraphLabel || question.passageRef || "";

                return {
                  code: isMultiAnswerGroup ? getQuestionCode(question) : `Q${question.number}`,
                  prompt: isMatchingHeading
                    ? question.text || (paragraphLabel ? `Paragraph ${paragraphLabel}` : null)
                    : question.text || null,
                  questionType: isMatchingHeading
                    ? "MatchingHeadingDragDrop"
                    : isSummaryCompletionWithOptions
                      ? "SummaryCompletionWithOptions"
                      : group.type,
                  orderIndex: isMultiAnswerGroup || isMatchingHeading || isSummaryCompletionWithOptions
                    ? answerSlots[0] ?? question.number
                    : questionIndex + 1,
                  points: isMultiAnswerGroup ? choiceLimit : 1,
                  isRequired: true,
                  explanation: question.explanation || null,
                  metadataJson: JSON.stringify({
                    answerSlots: isMultiAnswerGroup ? answerSlots : undefined,
                    blankLabel: question.blankLabel || String(question.number),
                    caseSensitive: question.caseSensitive,
                    choiceLimit: isMultiAnswerGroup ? choiceLimit : undefined,
                    displayType: group.displayType || subtype.displayType,
                    evidence: isMatchingHeading ? question.evidence || null : undefined,
                    evidenceText: isSummaryCompletionWithOptions ? question.evidence || null : undefined,
                    number: question.number,
                    numberLabel: isMultiAnswerGroup ? question.numberLabel || formatAnswerSlots(answerSlots) : undefined,
                    paragraph: isMatchingHeading ? paragraphLabel || null : undefined,
                    passageRef: question.passageRef,
                    promptTemplate: question.text,
                    sectionTitle: question.sectionTitle || null,
                    statementLabel: isMatchingHeading ? String(question.number) : undefined,
                    wordLimit: question.wordLimit ?? null,
                  }),
                  answerOptions: buildAnswerOptions(group, question),
                  answerKeys: buildAnswerKeys(group, question),
                };
              }),
            };
          }),
        })),
      }],
      scoringRules: [{
        ruleCode: "IELTS_READING_DEFAULT",
        name: "IELTS Reading objective scoring",
        skill: "Reading",
        questionType: null,
        maxScore: 40,
        configJson: JSON.stringify({ scorePerCorrect: 1 }),
      }],
    };
  };

  const updateSetup = <Key extends keyof TestSetup>(key: Key, value: TestSetup[Key]) => {
    setSetup((currentSetup) => ({
      ...currentSetup,
      [key]: value,
    }));
  };

  const updateSubDescription = (index: number, value: string) => {
    setSetup((currentSetup) => ({
      ...currentSetup,
      subDescriptions: currentSetup.subDescriptions.map((description, descriptionIndex) =>
        descriptionIndex === index ? value : description,
      ),
    }));
  };

  const updateNumberPassages = (value: number) => {
    const nextNumberPassages = Math.min(3, Math.max(1, value));
    const nextPassages = [...passages];

    while (nextPassages.length < nextNumberPassages) {
      nextPassages.push(createPassage(nextPassages.length + 1));
    }

    const visiblePassages = nextPassages.slice(0, nextNumberPassages);
    const nextActivePassage =
      visiblePassages.find((passage) => passage.id === activePassageId) ?? visiblePassages[0];

    setSetup((currentSetup) => ({
      ...currentSetup,
      numberPassages: nextNumberPassages,
    }));
    setPassages(visiblePassages);
    setActivePassageId(nextActivePassage.id);
    setActiveGroupId(nextActivePassage.questionGroups[0]?.id ?? "");
    setGroupEditorOpen(true);
  };

  const updatePassage = <Key extends keyof ReadingPassage>(
    passageId: string,
    key: Key,
    value: ReadingPassage[Key],
  ) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) =>
        passage.id === passageId
          ? {
              ...passage,
              [key]: value,
            }
          : passage,
      ),
    );
  };

  const updateParagraph = (
    passageId: string,
    paragraphId: string,
    key: keyof PassageParagraph,
    value: PassageParagraph[keyof PassageParagraph],
  ) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) =>
        passage.id === passageId
          ? {
              ...passage,
              paragraphs: passage.paragraphs.map((paragraph) =>
                paragraph.id === paragraphId
                  ? {
                      ...paragraph,
                      [key]: value,
                    }
                  : paragraph,
              ),
            }
          : passage,
      ),
    );
  };

  const addParagraph = (passageId: string) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) =>
        passage.id === passageId
          ? {
              ...passage,
              paragraphs: [
                ...passage.paragraphs,
                createParagraph(passage.paragraphs.length),
              ],
            }
          : passage,
        ),
    );
    toastInfo("Đã thêm paragraph.");
  };

  const removeParagraph = (passageId: string, paragraphId: string) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) =>
        passage.id === passageId
          ? {
              ...passage,
              paragraphs: passage.paragraphs.filter((paragraph) => paragraph.id !== paragraphId),
            }
          : passage,
        ),
    );
    toastDanger("Đã xóa paragraph.");
  };

  void updateParagraph;
  void addParagraph;
  void removeParagraph;

  const updatePassageContent = (passageId: string, value: string) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) => {
        if (passage.id !== passageId) {
          return passage;
        }

        const [firstParagraph, ...restParagraphs] = passage.paragraphs;
        const nextFirstParagraph = firstParagraph
          ? {
              ...firstParagraph,
              content: value,
            }
          : createParagraph(0);

        if (!firstParagraph) {
          nextFirstParagraph.content = value;
        }

        return {
          ...passage,
          paragraphs: [nextFirstParagraph, ...restParagraphs],
        };
      }),
    );
  };

  const selectPassage = (passage: ReadingPassage) => {
    setActivePassageId(passage.id);
    setActiveGroupId(passage.questionGroups[0]?.id ?? "");
    setGroupEditorOpen(true);
  };

  const addQuestionGroup = () => {
    if (!activePassage) {
      return;
    }

    const nextQuestionNumber = getNextQuestionNumber(passages);

    if (!nextQuestionNumber) {
      toastWarning("Đã đạt giới hạn số câu hỏi.");
      return;
    }

    const nextGroup = createQuestionGroup(
      activePassage.questionGroups.length + 1,
      nextQuestionNumber,
    );

    setPassages((currentPassages) =>
      currentPassages.map((passage) => {
        if (passage.id !== activePassage.id) {
          return passage;
        }

        return {
          ...passage,
          questionGroups: [...passage.questionGroups, nextGroup],
        };
      }),
    );

    setActiveGroupId(nextGroup.id);
    setGroupEditorOpen(true);
    toastInfo("Đã thêm question group.");
  };

  const updateQuestionGroup = <Key extends keyof QuestionGroup>(
    groupId: string,
    key: Key,
    value: QuestionGroup[Key],
  ) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                [key]: value,
              }
            : group,
        ),
      })),
    );
  };

  const updateMultipleChoiceGroupChoiceLimit = (groupId: string, choiceLimit: number) => {
    const normalizedChoiceLimit = Math.max(1, choiceLimit);

    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                choiceLimit: normalizedChoiceLimit,
                questions: group.questions.map((question) => {
                  const answerSlots = createDefaultAnswerSlots(question.number, normalizedChoiceLimit);
                  return {
                    ...question,
                    answerSlots,
                    choiceLimit: normalizedChoiceLimit,
                    numberLabel: formatAnswerSlots(answerSlots),
                  };
                }),
              }
            : group,
        ),
      })),
    );
  };

  const updateMultipleChoiceQuestionSlots = (
    groupId: string,
    questionId: string,
    slotValue: string,
  ) => {
    const answerSlots = parseAnswerSlots(slotValue);
    const firstSlot = answerSlots[0];

    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                questions: group.questions.map((question) =>
                  question.id === questionId
                    ? {
                        ...question,
                        answerSlots: answerSlots.length ? answerSlots : question.answerSlots,
                        choiceLimit: answerSlots.length ? answerSlots.length : question.choiceLimit,
                        number: firstSlot ?? question.number,
                        numberLabel: slotValue,
                      }
                    : question,
                ),
              }
            : group,
        ),
      })),
    );
  };

  const updateQuestionGroupSubtype = (
    groupId: string,
    questionType: string,
  ) => {
    const subtype = findQuestionSubtype(questionType);
    const isMultiAnswer = isMultipleChoiceMultipleType(questionType);
    const isSummaryCompletion = normalizeQuestionType(questionType) === "summarycompletionwithoptions";

    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) => {
          if (group.id !== groupId) {
            return group;
          }
          const isMatchingHeading = isMatchingHeadingDragDropType(questionType);
          const paragraphLabels = isMatchingHeading
            ? getMatchingHeadingParagraphLabels(passage, group)
            : [];

          return {
            ...group,
            answerLimit: subtype.answerLimit,
            choiceLimit: isMultiAnswer ? group.choiceLimit ?? 2 : undefined,
            displayType: subtype.displayType,
            interaction: isMultiAnswer ? "checkbox" : subtype.interaction,
            optionsReusable: subtype.optionsReusable,
            scoreMode: isMultiAnswer ? group.scoreMode ?? "all_or_nothing" : undefined,
            sharedOptions: createDefaultSharedOptions(subtype),
            summaryTemplate: isSummaryCompletion ? group.summaryTemplate || "" : undefined,
            type: questionType,
            questions: group.questions.map((question, questionIndex) => {
              const questionOptions = shouldUseQuestionOptions(questionType)
                ? createQuestionOptions(questionType)
                : [];
              const answerSlots = isMultiAnswer
                ? createDefaultAnswerSlots(question.number, group.choiceLimit ?? 2)
                : undefined;
              const paragraphLabel = isMatchingHeading
                ? paragraphLabels[questionIndex] ?? String.fromCharCode(65 + questionIndex)
                : undefined;

              return {
                ...question,
                answerSlots,
                choiceLimit: isMultiAnswer ? group.choiceLimit ?? 2 : undefined,
                correctAnswer: "",
                numberLabel: answerSlots ? formatAnswerSlots(answerSlots) : undefined,
                paragraphLabel,
                passageRef: paragraphLabel ?? question.passageRef,
                questionOptions,
                text: isMultiAnswer
                  ? `Questions ${formatAnswerSlots(answerSlots ?? [question.number])}`
                  : paragraphLabel
                    ? `Paragraph ${paragraphLabel}`
                    : isSummaryCompletion
                      ? `Blank ${question.number}`
                    : question.text,
              };
            }),
          };
        }),
      })),
    );
  };

  const addSharedOption = (groupId: string) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) => {
          if (group.id !== groupId) return group;

          const nextLabel = group.displayType === "matching_headings"
            ? getNextHeadingLabel(group.sharedOptions.length)
            : String.fromCharCode(65 + group.sharedOptions.length);

          return {
            ...group,
            sharedOptions: [...group.sharedOptions, createSharedOption(nextLabel)],
          };
        }),
      })),
    );
  };

  const updateSharedOption = (
    groupId: string,
    optionId: string,
    key: keyof GroupSharedOption,
    value: string,
  ) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                sharedOptions: group.sharedOptions.map((option) =>
                  option.id === optionId ? { ...option, [key]: value } : option,
                ),
              }
            : group,
        ),
      })),
    );
  };

  const removeSharedOption = (groupId: string, optionId: string) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                questions: group.questions.map((question) =>
                  question.correctAnswer === optionId
                    ? { ...question, correctAnswer: "" }
                    : question,
                ),
                sharedOptions: group.sharedOptions.filter((option) => option.id !== optionId),
              }
            : group,
        ),
      })),
    );
  };

  const removeQuestionGroup = (groupId: string) => {
    if (!activePassage) {
      return;
    }

    setPassages((currentPassages) =>
      currentPassages.map((passage) => {
        if (passage.id !== activePassage.id) {
          return passage;
        }

        const nextGroups = passage.questionGroups.filter((group) => group.id !== groupId);
        setActiveGroupId(nextGroups[0]?.id ?? "");

        return {
          ...passage,
          questionGroups: nextGroups,
        };
      }),
    );
    toastDanger("Đã xóa question group.");
  };

  const addQuestion = (groupId: string) => {
    const targetGroup = passages
      .flatMap((passage) => passage.questionGroups)
      .find((group) => group.id === groupId);
    const targetPassage = passages.find((passage) =>
      passage.questionGroups.some((group) => group.id === groupId),
    );

    if (!targetGroup || !targetPassage) {
      return;
    }

    const nextQuestionNumber = getNextQuestionNumber(passages);

    if (!nextQuestionNumber) {
      toastWarning("Đã đạt giới hạn 40 câu hỏi.");
      return;
    }

    if (isMultipleChoiceMultipleType(targetGroup.type) && nextQuestionNumber + (targetGroup.choiceLimit ?? 2) - 1 > maxReadingQuestions) {
      toastWarning("Không đủ slot để tạo câu hỏi nhiều đáp án trong giới hạn 40 câu.");
      return;
    }

    const nextQuestionId = crypto.randomUUID();
    const paragraphLabels = isMatchingHeadingGroup(targetGroup)
      ? getMatchingHeadingParagraphLabels(targetPassage, targetGroup)
      : [];
    const nextParagraphLabel = paragraphLabels[targetGroup.questions.length] ?? "";
    const nextQuestion = {
      ...createQuestion(nextQuestionNumber, targetGroup.type, nextParagraphLabel),
      id: nextQuestionId,
    };

    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) => {
          if (group.id !== groupId) {
            return group;
          }

          return {
            ...group,
            questions: [...group.questions, nextQuestion],
          };
        }),
      })),
    );

    setOpenQuestionIds((currentOpenIds) => ({
      ...currentOpenIds,
      [nextQuestionId]: true,
    }));
    toastInfo("Đã thêm question.");
  };

  const updateQuestionItem = (
    groupId: string,
    questionId: string,
    key: keyof QuestionItem,
    value: QuestionItem[keyof QuestionItem],
  ) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                questions: group.questions.map((question) =>
                  question.id === questionId
                    ? {
                        ...question,
                        [key]: value,
                      }
                    : question,
                ),
              }
            : group,
        ),
      })),
    );
  };

  const removeQuestion = (groupId: string, questionId: string) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                questions: group.questions.filter((question) => question.id !== questionId),
              }
            : group,
        ),
      })),
    );
    toastDanger("Đã xóa question.");
  };

  const addQuestionOption = (groupId: string, questionId: string) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                questions: group.questions.map((question) =>
                  question.id === questionId
                    ? {
                        ...question,
                        questionOptions: [
                          ...question.questionOptions,
                          createQuestionOption(
                            String.fromCharCode(65 + question.questionOptions.length),
                          ),
                        ],
                      }
                    : question,
                ),
              }
            : group,
        ),
      })),
    );
    toastInfo("Đã thêm option.");
  };

  const updateQuestionOption = (
    groupId: string,
    questionId: string,
    optionId: string,
    key: keyof QuestionOption,
    value: string | boolean,
  ) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                questions: group.questions.map((question) => {
                  if (question.id !== questionId) {
                    return question;
                  }

                  const questionOptions = question.questionOptions.map((option) => {
                    if (
                      key === "isCorrectAnswer" &&
                      value === true &&
                      isSingleChoiceType(group.type)
                    ) {
                      return {
                        ...option,
                        isCorrectAnswer: option.id === optionId,
                      };
                    }

                    if (
                      key === "isCorrectAnswer" &&
                      value === true &&
                      isMultipleChoiceMultipleType(group.type)
                    ) {
                      const selectedCount = question.questionOptions.filter((item) => item.isCorrectAnswer).length;
                      const choiceLimit = question.choiceLimit ?? group.choiceLimit ?? 2;
                      if (!option.isCorrectAnswer && selectedCount >= choiceLimit) {
                        return option;
                      }
                    }

                    return option.id === optionId
                      ? {
                          ...option,
                          [key]: value,
                        }
                      : option;
                  });

                  return {
                    ...question,
                    correctAnswer: getCorrectAnswerFromOptions(questionOptions),
                    questionOptions,
                  };
                }),
              }
            : group,
        ),
      })),
    );
  };

  const removeQuestionOption = (
    groupId: string,
    questionId: string,
    optionId: string,
  ) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                questions: group.questions.map((question) => {
                  if (question.id !== questionId) {
                    return question;
                  }

                  const questionOptions = question.questionOptions.filter(
                    (option) => option.id !== optionId,
                  );

                  return {
                    ...question,
                    correctAnswer: getCorrectAnswerFromOptions(questionOptions),
                    questionOptions,
                  };
                }),
              }
            : group,
        ),
      })),
    );
    toastDanger("Đã xóa option.");
  };

  const goToStep = (step: number) => {
    if (step === 3) {
      const firstPassage = passages[0];

      setActivePassageId(firstPassage.id);
      setActiveGroupId(firstPassage.questionGroups[0]?.id ?? "");
      setGroupEditorOpen(true);
    }

    setCurrentStep(step);
  };

  const handlePrimaryAction = async () => {
    if (currentStep === 3) {
      if (!readingTemplate) {
        toastDanger("Chưa có ExamTemplate IELTS Reading. Vui lòng tạo Dạng bài kiểm tra và Mẫu đề kiểm tra trước.");
        return;
      }
      if (!setup.testCode.trim() || !setup.title.trim()) {
        toastDanger("Vui lòng nhập mã đề và tên đề.");
        setCurrentStep(1);
        return;
      }
      if (totalQuestions === 0) {
        toastDanger("Vui lòng thêm ít nhất một câu hỏi.");
        return;
      }

      setIsSaving(true);
      try {
        if (recordId) {
          await adminIeltsReadingApi.updateDraftVersion(
            recordId,
            buildVersionPayload(readingTemplate.id, true),
          );
        } else {
          await adminIeltsReadingApi.createVersion(buildVersionPayload(readingTemplate.id));
        }
        toastSuccess(recordId ? "Cập nhật draft IELTS Reading thành công." : "Tạo đề IELTS Reading thành công.");
        navigate("/admin/practice-bank/ielts/reading");
      } catch (error) {
        toastDanger(getAuthErrorMessage(error));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    goToStep(currentStep + 1);
  };

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <Link className={styles.backLink} to="/admin/practice-bank/ielts/reading">
            <ArrowLeft aria-hidden="true" size={16} />
            Quay lại danh sách
          </Link>
          <h1>{recordId ? "Chỉnh sửa đề IELTS Reading" : "Tạo đề IELTS Reading"}</h1>
          <p>Flow tạo đề theo cấu trúc mock: test metadata, passages, paragraphs và question groups.</p>
        </div>
      </section>

      {isLoading ? (
        <section className={styles.contentPanel}>
          <div className={styles.questionState}>
            <FileText aria-hidden="true" size={34} />
            <h2>Đang tải đề IELTS Reading...</h2>
            <p>FE đang lấy template và version hiện tại từ API Exam.</p>
          </div>
        </section>
      ) : !readingTemplate ? (
        <section className={styles.contentPanel}>
          <div className={styles.questionState}>
            <FileText aria-hidden="true" size={34} />
            <h2>Chưa có template IELTS Reading</h2>
            <p>
              Vui lòng tạo ExamType IELTS ở “Dạng Bài Kiểm Tra”, sau đó tạo
              ExamTemplate IELTS Academic Reading ở “Mẫu Đề Kiểm Tra” trước khi tạo đề.
            </p>
            <div className={styles.headerActions}>
              <Link to="/admin/exam-types/create">Tạo dạng bài kiểm tra</Link>
              <Link to="/admin/exams/create">Tạo mẫu đề kiểm tra</Link>
            </div>
          </div>
        </section>
      ) : (
      <section className={styles.builder}>
        <div className={styles.contentPanel}>
          {currentStep === 1 && (
            <div className={styles.panelBody}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>Test setup</span>
                  <h2>Thông tin đề</h2>
                </div>
                <strong
                  className={
                    setup.status === "published"
                      ? styles.publishedStatus
                      : styles.draftStatus
                  }
                >
                  {setup.status === "published" ? "Published" : "Draft"}
                </strong>
              </div>

              <div className={styles.formGrid}>
                <label>
                  <span>Tên Bài Test</span>
                  <input
                    value={setup.title}
                    onChange={(event) => updateSetup("title", event.target.value)}
                  />
                </label>
                <label>
                  <span>Version code / slug</span>
                  <input
                    value={setup.testCode}
                    onChange={(event) => updateSetup("testCode", event.target.value)}
                  />
                </label>
                <label>
                  <span>Duration</span>
                  <input
                    disabled
                    min={1}
                    type="number"
                    value={setup.durationMinutes}
                    readOnly
                  />
                </label>
                <label>
                  <span>Score</span>
                  <input
                    disabled
                    readOnly
                    value={readingTemplate?.totalScore ?? 40}
                  />
                </label>
                <label className={styles.fullField}>
                  <span>Description</span>
                  <textarea
                    rows={4}
                    value={setup.description}
                    onChange={(event) => updateSetup("description", event.target.value)}
                  />
                </label>
                <section className={styles.runtimeSection}>
                  <div className={styles.runtimeSectionTitle}>
                    <h3>Cấu hình thực thi</h3>
                    <p>Các thông tin này được lưu trong runtimeConfigJson của version.</p>
                  </div>
                  <label>
                    <span>Source label</span>
                    <input
                      value={setup.sourceLabel}
                      onChange={(event) => updateSetup("sourceLabel", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Level</span>
                    <select
                      value={setup.level}
                      onChange={(event) => updateSetup("level", event.target.value)}
                    >
                      <option>Academic</option>
                      <option>Band 5.5-6.0</option>
                      <option>Band 6.0-6.5</option>
                      <option>Band 6.5-7.0</option>
                      <option>Band 7.0+</option>
                    </select>
                  </label>
                  <label>
                    <span>NumberPassage</span>
                    <select
                      value={setup.numberPassages}
                      onChange={(event) => updateNumberPassages(Number(event.target.value))}
                    >
                      {passageCountOptions.map((passageCount) => (
                        <option key={passageCount} value={passageCount}>
                          {passageCount}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.fullField}>
                    <span>Sub description</span>
                    <textarea
                      rows={3}
                      value={setup.subDescriptions[0] ?? ""}
                      onChange={(event) => updateSubDescription(0, event.target.value)}
                    />
                  </label>
                  <label className={styles.fullField}>
                    <span>Note</span>
                    <textarea
                      rows={3}
                      value={setup.note}
                      onChange={(event) => updateSetup("note", event.target.value)}
                    />
                  </label>
                </section>
              </div>
            </div>
          )}

          {currentStep === 2 && activePassage && (
            <div className={styles.panelBody}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>Passages</span>
                  <h2>Nội dung bài đọc</h2>
                </div>
                <strong>{passages.length} passages</strong>
              </div>

              <div className={styles.passageTabs}>
                {passages.map((passage) => (
                  <button
                    className={passage.id === activePassage.id ? styles.activeTab : ""}
                    key={passage.id}
                    type="button"
                    onClick={() => selectPassage(passage)}
                  >
                    Passage {passage.part}
                  </button>
                ))}
              </div>

              <div className={styles.passageEditor}>
                <div className={styles.formGrid}>
                  <label>
                    <span>Passage title</span>
                    <input
                      value={activePassage.title}
                      onChange={(event) =>
                        updatePassage(activePassage.id, "title", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.fullField}>
                    <span>Passage instruction</span>
                    <textarea
                      rows={3}
                      value={activePassage.instruction}
                      onChange={(event) =>
                        updatePassage(activePassage.id, "instruction", event.target.value)
                      }
                    />
                  </label>
                </div>

                <div className={styles.singleContentEditor}>
                  <RichTextEditor
                    key={`passage-content-${activePassage.id}`}
                    label="Content"
                    minHeight={260}
                    value={activePassage.paragraphs[0]?.content ?? ""}
                    onChange={(value) => updatePassageContent(activePassage.id, value)}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && activePassage && (
            <div className={styles.panelBody}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>Question groups</span>
                  <h2>Câu hỏi theo passage</h2>
                </div>
                <strong>{totalQuestions} questions</strong>
              </div>

              <div className={styles.questionLayout}>
                <aside className={styles.groupSidebar}>
                  <div className={styles.passageTabs}>
                    {passages.map((passage) => (
                      <button
                        className={passage.id === activePassage.id ? styles.activeTab : ""}
                        key={passage.id}
                        type="button"
                        onClick={() => selectPassage(passage)}
                      >
                        Passage {passage.part}
                      </button>
                    ))}
                  </div>

                  <div className={styles.groupHeader}>
                    <strong>Groups</strong>
                    <button
                      type="button"
                      disabled={hasReachedQuestionLimit}
                      onClick={addQuestionGroup}
                    >
                      <Plus aria-hidden="true" size={15} />
                      Add
                    </button>
                  </div>

                  <div className={styles.groupList}>
                    {activePassage.questionGroups.map((group) => (
                      <button
                        className={group.id === activeGroupId ? styles.activeGroup : ""}
                        key={group.id}
                        type="button"
                        onClick={() => {
                          setActiveGroupId(group.id);
                          setGroupEditorOpen(true);
                        }}
                      >
                        <strong>{group.groupLabel}</strong>
                        <span>{group.title}</span>
                        <small>{getGroupSubtype(group).label}</small>
                      </button>
                    ))}
                  </div>
                </aside>

                <section className={styles.groupEditor}>
                  {!activeGroup ? (
                    <div className={styles.questionState}>
                      <ListChecks aria-hidden="true" size={34} />
                      <h2>Question Groups</h2>
                      <p>Thêm group theo từng passage để dữ liệu giống mockPracticeTests.ts.</p>
                      <button
                        type="button"
                        disabled={hasReachedQuestionLimit}
                        onClick={addQuestionGroup}
                      >
                        Add question group
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={styles.groupEditorHeader}>
                        <div>
                          <h2>{activeGroup.groupLabel}</h2>
                          <p>{activeGroup.questions.length} questions</p>
                        </div>
                        <div className={styles.headerActions}>
                          <button
                            aria-label={isGroupEditorOpen ? "Collapse group" : "Open group"}
                            className={styles.collapseButton}
                            type="button"
                            onClick={() => setGroupEditorOpen((isOpen) => !isOpen)}
                          >
                            <ChevronDown
                              aria-hidden="true"
                              className={isGroupEditorOpen ? styles.openIcon : ""}
                              size={17}
                            />
                          </button>
                          <button
                            aria-label="Remove question group"
                            title="Remove question group"
                            className={styles.iconButton}
                            type="button"
                            onClick={() => removeQuestionGroup(activeGroup.id)}
                          >
                            <Trash2 aria-hidden="true" size={16} />
                          </button>
                        </div>
                      </div>

                      {isGroupEditorOpen && (
                        <div className={styles.groupForm}>
                          <label>
                            <span>Group title</span>
                            <input
                              value={activeGroup.title}
                              onChange={(event) =>
                                updateQuestionGroup(activeGroup.id, "title", event.target.value)
                              }
                            />
                          </label>
                          <label>
                            <span>Question type</span>
                            <select
                              value={activeGroup.type}
                              onChange={(event) =>
                                updateQuestionGroupSubtype(
                                  activeGroup.id,
                                  event.target.value,
                                )
                              }
                            >
                              {questionTypeSelectOptions.map((option) => (
                                <option key={`${option.code}-${option.value}`} value={option.value}>
                                  {option.label || option.value}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div className={styles.subtypeHint}>
                            <div className={styles.badgeRow}>
                              <span>BE type: {activeGroup.type}</span>
                              <span>{activeGroup.interaction}</span>
                              <span>{getQuestionRange(activeGroup) ? `Questions ${getQuestionRange(activeGroup)}` : "No range"}</span>
                            </div>
                            <p>{activeGroupSubtype.description}</p>
                          </div>
                          {activeGroupIsMultipleChoiceMultiple && (
                            <>
                              <label>
                                <span>Choice limit</span>
                                <input
                                  min={1}
                                  type="number"
                                  value={activeGroup.choiceLimit ?? 2}
                                  onChange={(event) =>
                                    updateMultipleChoiceGroupChoiceLimit(
                                      activeGroup.id,
                                      Number(event.target.value),
                                    )
                                  }
                                />
                              </label>
                              <label>
                                <span>Score mode</span>
                                <select
                                  value={activeGroup.scoreMode ?? "all_or_nothing"}
                                  onChange={(event) =>
                                    updateQuestionGroup(
                                      activeGroup.id,
                                      "scoreMode",
                                      event.target.value as QuestionGroup["scoreMode"],
                                    )
                                  }
                                >
                                  <option value="all_or_nothing">all_or_nothing</option>
                                  <option value="partial">partial</option>
                                </select>
                              </label>
                            </>
                          )}
                          {activeGroupIsTextInput && (
                            <>
                              <label>
                                <span>Group heading</span>
                                <input
                                  placeholder="The London underground railway"
                                  value={activeGroup.heading ?? ""}
                                  onChange={(event) =>
                                    updateQuestionGroup(activeGroup.id, "heading", event.target.value)
                                  }
                                />
                              </label>
                              <label>
                                <span>Answer rule</span>
                                <select
                                  value={activeGroup.answerLimit ?? activeGroupSubtype.answerLimit ?? ""}
                                  onChange={(event) =>
                                    updateQuestionGroup(activeGroup.id, "answerLimit", event.target.value)
                                  }
                                >
                                  <option value="">No limit</option>
                                  {gapFillAnswerLimitOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </>
                          )}
                          {activeGroupIsMatchingInformationTable && (
                            <label className={styles.checkboxField}>
                              <input
                                checked={activeGroup.optionsReusable ?? true}
                                type="checkbox"
                                onChange={(event) =>
                                  updateQuestionGroup(
                                    activeGroup.id,
                                    "optionsReusable",
                                    event.target.checked,
                                  )
                                }
                              />
                              <span>Option reuse</span>
                            </label>
                          )}
                          {activeGroupIsSummaryCompletionWithOptions && (
                            <>
                              <label className={styles.fullField}>
                                <span>Summary heading</span>
                                <input
                                  placeholder="The story behind the hunt for Charles II"
                                  value={activeGroup.heading ?? ""}
                                  onChange={(event) =>
                                    updateQuestionGroup(activeGroup.id, "heading", event.target.value)
                                  }
                                />
                              </label>
                              <div className={styles.fullField}>
                                <RichTextEditor
                                  label={
                                    <span className={styles.labelWithInfo}>
                                      Summary template
                                      <span className={styles.infoTooltip}>
                                        <span
                                          aria-label="Hướng dẫn placeholder"
                                          className={styles.infoIcon}
                                          tabIndex={0}
                                        >
                                          i
                                        </span>
                                        <span className={styles.infoTooltipContent}>
                                          Dùng placeholder theo blank, ví dụ {"{Q27}"}, {"{Q28}"}.
                                          Mỗi placeholder tương ứng một question bên dưới.
                                        </span>
                                      </span>
                                    </span>
                                  }
                                  minHeight={180}
                                  value={activeGroup.summaryTemplate ?? ""}
                                  onChange={(value) =>
                                    updateQuestionGroup(activeGroup.id, "summaryTemplate", value)
                                  }
                                />
                              </div>
                            </>
                          )}
                          <div className={styles.fullField}>
                            <RichTextEditor
                              label="Instruction"
                              minHeight={140}
                              value={activeGroup.instruction}
                              onChange={(value) =>
                                updateQuestionGroup(activeGroup.id, "instruction", value)
                              }
                            />
                          </div>
                          {activeGroupIsMatching && (
                            <div className={styles.sharedOptionsPanel}>
                              <div className={styles.questionOptionsHeader}>
                                <div>
                                  <strong>
                                    {activeGroupIsMatchingHeading
                                      ? "Heading options"
                                      : activeGroupIsSummaryCompletionWithOptions
                                        ? "Phrase options"
                                        : "Shared answer options"}
                                  </strong>
                                  <p>
                                    {activeGroupIsMatchingHeading
                                      ? "Label là số La Mã học viên nhìn thấy. Heading text là nội dung đáp án heading sẽ gửi xuống BE."
                                      : activeGroupIsSummaryCompletionWithOptions
                                        ? "Danh sách phrase A-J để học viên kéo/chọn vào các blank trong summary. Mặc định không dùng lại option."
                                      : "Dùng chung cho toàn bộ câu trong group. FE sẽ duplicate options vào từng question khi gửi payload."}
                                  </p>
                                </div>
                                <button type="button" onClick={() => addSharedOption(activeGroup.id)}>
                                  <Plus aria-hidden="true" size={15} />
                                  {activeGroupIsMatchingHeading
                                    ? "Add heading"
                                    : activeGroupIsSummaryCompletionWithOptions
                                      ? "Add phrase"
                                      : "Add option"}
                                </button>
                              </div>
                              {activeGroup.sharedOptions.map((option) => (
                                <div
                                  className={`${styles.sharedOptionCard} ${
                                    activeGroupIsMatchingInformationTable ? styles.labelOnlySharedOption : ""
                                  }`}
                                  key={option.id}
                                >
                                  <label>
                                    <span>Label</span>
                                    <input
                                      value={option.label}
                                      onChange={(event) =>
                                        updateSharedOption(
                                          activeGroup.id,
                                          option.id,
                                          "label",
                                          event.target.value,
                                        )
                                      }
                                    />
                                  </label>
                                  {!activeGroupIsMatchingInformationTable && (
                                    <label>
                                      <span>
                                        {activeGroupIsMatchingHeading
                                          ? "Heading text"
                                          : activeGroupIsSummaryCompletionWithOptions
                                            ? "Phrase text"
                                            : "Content"}
                                      </span>
                                      <input
                                        placeholder={
                                          activeGroupIsMatchingHeading
                                            ? "The early development of the subject"
                                            : activeGroupIsSummaryCompletionWithOptions
                                              ? "strategic alliance"
                                              : "Heading / feature / ending"
                                        }
                                        value={option.content}
                                        onChange={(event) =>
                                          updateSharedOption(
                                            activeGroup.id,
                                            option.id,
                                            "content",
                                            event.target.value,
                                          )
                                        }
                                      />
                                    </label>
                                  )}
                                  <button
                                    aria-label="Remove shared option"
                                    title="Remove shared option"
                                    className={styles.iconButton}
                                    type="button"
                                    onClick={() => removeSharedOption(activeGroup.id, option.id)}
                                  >
                                    <Trash2 aria-hidden="true" size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className={styles.listHeader}>
                        <strong>Questions</strong>
                        <button
                          type="button"
                          disabled={hasReachedQuestionLimit}
                          onClick={() => addQuestion(activeGroup.id)}
                        >
                          <Plus aria-hidden="true" size={15} />
                          Add question
                        </button>
                      </div>

                      <div className={styles.questionList}>
                        {activeGroup.questions.map((question) => {
                          const isQuestionOpen = Boolean(openQuestionIds[question.id]);
                          const questionHasOptions = shouldUseQuestionOptions(activeGroup.type);
                          const fixedChoiceOptions = isTrueFalseType(activeGroup.type)
                            ? ["True", "False", "Not Given"]
                            : isYesNoType(activeGroup.type)
                              ? ["Yes", "No", "Not Given"]
                              : [];

                          return (
                            <article className={styles.questionCard} key={question.id}>
                              <div className={styles.questionCardHeader}>
                                <button
                                  className={styles.questionToggle}
                                  type="button"
                                  onClick={() =>
                                    setOpenQuestionIds((currentOpenIds) => ({
                                      ...currentOpenIds,
                                      [question.id]: !isQuestionOpen,
                                    }))
                                  }
                                >
                                  <ChevronDown
                                    aria-hidden="true"
                                    className={isQuestionOpen ? styles.openIcon : ""}
                                    size={16}
                                  />
                                  <span>
                                    {activeGroupIsMultipleChoiceMultiple
                                      ? `Question ${question.numberLabel || formatAnswerSlots(getQuestionAnswerSlots(question))}`
                                      : `Question ${question.number}`}
                                  </span>
                                </button>
                                <strong>{getGroupAnswerLabel(activeGroup, question)}</strong>
                                <button
                                  aria-label="Remove question"
                                  title="Remove question"
                                  className={styles.iconButton}
                                  type="button"
                                  onClick={() => removeQuestion(activeGroup.id, question.id)}
                                >
                                  <Trash2 aria-hidden="true" size={16} />
                                </button>
                              </div>

                              {isQuestionOpen && (
                                <>
                                  <div className={styles.cardHeader}>
                                    {activeGroupIsMultipleChoiceMultiple ? (
                                      <>
                                        <label>
                                          <span>Answer slots</span>
                                          <input
                                            placeholder="23-24"
                                            value={question.numberLabel || formatAnswerSlots(getQuestionAnswerSlots(question))}
                                            onChange={(event) =>
                                              updateMultipleChoiceQuestionSlots(
                                                activeGroup.id,
                                                question.id,
                                                event.target.value,
                                              )
                                            }
                                          />
                                        </label>
                                        <label>
                                          <span>Choice limit</span>
                                          <input
                                            min={1}
                                            type="number"
                                            value={question.choiceLimit ?? activeGroup.choiceLimit ?? 2}
                                            onChange={(event) =>
                                              updateQuestionItem(
                                                activeGroup.id,
                                                question.id,
                                                "choiceLimit",
                                                Number(event.target.value),
                                              )
                                            }
                                          />
                                        </label>
                                      </>
                                    ) : (
                                      <label>
                                        <span>Number</span>
                                        <input
                                          min={1}
                                          type="number"
                                          value={question.number}
                                          onChange={(event) =>
                                            updateQuestionItem(
                                              activeGroup.id,
                                              question.id,
                                              "number",
                                              Number(event.target.value),
                                            )
                                          }
                                        />
                                      </label>
                                    )}
                                    {activeGroupIsTextInput && (
                                      <>
                                        <label>
                                          <span>Section title</span>
                                          <input
                                            placeholder="The problem"
                                            value={question.sectionTitle ?? ""}
                                            onChange={(event) =>
                                              updateQuestionItem(
                                                activeGroup.id,
                                                question.id,
                                                "sectionTitle",
                                                event.target.value,
                                              )
                                            }
                                          />
                                        </label>
                                        <label>
                                          <span>Blank label</span>
                                          <input
                                            placeholder={String(question.number)}
                                            value={question.blankLabel ?? ""}
                                            onChange={(event) =>
                                              updateQuestionItem(
                                                activeGroup.id,
                                                question.id,
                                                "blankLabel",
                                                event.target.value,
                                              )
                                            }
                                          />
                                        </label>
                                      </>
                                    )}
                                    {activeGroupIsMatchingHeading && (
                                      <label>
                                        <span>Paragraph in passage</span>
                                        <select
                                          value={question.paragraphLabel || question.passageRef || ""}
                                          onChange={(event) => {
                                            const paragraphLabel = event.target.value;
                                            updateQuestionItem(
                                              activeGroup.id,
                                              question.id,
                                              "paragraphLabel",
                                              paragraphLabel,
                                            );
                                            updateQuestionItem(
                                              activeGroup.id,
                                              question.id,
                                              "passageRef",
                                              paragraphLabel,
                                            );
                                            updateQuestionItem(
                                              activeGroup.id,
                                              question.id,
                                              "text",
                                              paragraphLabel ? `Paragraph ${paragraphLabel}` : "",
                                            );
                                          }}
                                        >
                                          <option value="">Select paragraph</option>
                                          {getMatchingHeadingParagraphLabels(activePassage, activeGroup).map((paragraphLabel) => (
                                            <option key={paragraphLabel} value={paragraphLabel}>
                                              Paragraph {paragraphLabel}
                                            </option>
                                          ))}
                                        </select>
                                      </label>
                                    )}
                                  </div>
                                  {activeGroupIsTextInput ? (
                                    <div className={styles.fullField}>
                                      <RichTextEditor
                                        label="Prompt template"
                                        minHeight={120}
                                        value={question.text}
                                        onChange={(value) =>
                                          updateQuestionItem(
                                            activeGroup.id,
                                            question.id,
                                            "text",
                                            value,
                                          )
                                        }
                                      />
                                    </div>
                                  ) : activeGroupIsSummaryCompletionWithOptions ? (
                                    <div className={styles.fullField}>
                                      <RichTextEditor
                                        label="Blank prompt"
                                        minHeight={120}
                                        value={question.text}
                                        onChange={(value) =>
                                          updateQuestionItem(
                                            activeGroup.id,
                                            question.id,
                                            "text",
                                            value,
                                          )
                                        }
                                      />
                                    </div>
                                  ) : activeGroupIsMatchingHeading ? (
                                    <label>
                                      <span>Prompt</span>
                                      <input
                                        placeholder="Paragraph A"
                                        value={question.text}
                                        onChange={(event) =>
                                          updateQuestionItem(
                                            activeGroup.id,
                                            question.id,
                                            "text",
                                            event.target.value,
                                          )
                                        }
                                      />
                                    </label>
                                  ) : (
                                    <label>
                                      <span>Question text</span>
                                      <textarea
                                        rows={3}
                                        value={question.text}
                                        onChange={(event) =>
                                          updateQuestionItem(
                                            activeGroup.id,
                                            question.id,
                                            "text",
                                            event.target.value,
                                          )
                                        }
                                      />
                                    </label>
                                  )}
                                  {activeGroupIsTextInput && (
                                    <div className={styles.helperText}>
                                      Preview: {renderBlankPreview(question)}
                                    </div>
                                  )}
                                  {activeGroupIsMatchingHeading && (
                                    <div className={styles.helperText}>
                                      Paragraph được gợi ý từ range của group, ví dụ Questions 14-20 tương ứng Paragraph A-G.
                                    </div>
                                  )}
                                  {activeGroupIsSummaryCompletionWithOptions && (
                                    <div className={styles.helperText}>
                                      Mỗi blank là một question. Prompt nên là câu ngắn chứa {"{blank}"} để preview và scoring dễ hiểu.
                                    </div>
                                  )}
                                  {activeGroupIsMatching ? (
                                    <>
                                      <label>
                                        <span>
                                          {activeGroupIsMatchingHeading
                                            ? "Correct heading"
                                            : activeGroupIsSummaryCompletionWithOptions
                                              ? "Correct phrase"
                                              : "Correct shared option"}
                                        </span>
                                        <select
                                          className={styles.answerSelect}
                                          value={question.correctAnswer}
                                          onChange={(event) =>
                                            updateQuestionItem(
                                              activeGroup.id,
                                              question.id,
                                              "correctAnswer",
                                              event.target.value,
                                            )
                                          }
                                        >
                                          <option value="">Select answer</option>
                                          {activeGroup.sharedOptions.map((option) => (
                                            <option
                                              key={option.id}
                                              value={
                                                activeGroupIsMatchingHeading || activeGroupIsSummaryCompletionWithOptions
                                                  ? option.label
                                                  : option.id
                                              }
                                            >
                                              {option.label}
                                              {option.content ? ` - ${option.content}` : ""}
                                            </option>
                                          ))}
                                        </select>
                                      </label>
                                      {(activeGroupIsMatchingHeading || activeGroupIsSummaryCompletionWithOptions) && (
                                        <label>
                                          <span>Evidence</span>
                                          <textarea
                                            placeholder="Short evidence from passage"
                                            rows={2}
                                            value={question.evidence ?? ""}
                                            onChange={(event) =>
                                              updateQuestionItem(
                                                activeGroup.id,
                                                question.id,
                                                "evidence",
                                                event.target.value,
                                              )
                                            }
                                          />
                                        </label>
                                      )}
                                      <label>
                                        <span>Explanation</span>
                                        <textarea
                                          rows={2}
                                          value={question.explanation}
                                          onChange={(event) =>
                                            updateQuestionItem(
                                              activeGroup.id,
                                              question.id,
                                              "explanation",
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </label>
                                    </>
                                  ) : activeGroupHasFixedChoices ? (
                                    <>
                                      <label>
                                        <span>Correct answer</span>
                                        <select
                                          className={styles.answerSelect}
                                          value={question.correctAnswer}
                                          onChange={(event) => {
                                            updateQuestionItem(
                                              activeGroup.id,
                                              question.id,
                                              "correctAnswer",
                                              event.target.value,
                                            );
                                            question.questionOptions.forEach((option) =>
                                              updateQuestionOption(
                                                activeGroup.id,
                                                question.id,
                                                option.id,
                                                "isCorrectAnswer",
                                                option.option === event.target.value,
                                              ),
                                            );
                                          }}
                                        >
                                          <option value="">Select answer</option>
                                          {fixedChoiceOptions.map((option) => (
                                            <option key={option} value={option}>
                                              {option}
                                            </option>
                                          ))}
                                        </select>
                                      </label>
                                      <div className={styles.helperText}>
                                        Options are generated automatically for this IELTS subtype.
                                      </div>
                                      <label>
                                        <span>Explanation</span>
                                        <textarea
                                          rows={2}
                                          value={question.explanation}
                                          onChange={(event) =>
                                            updateQuestionItem(
                                              activeGroup.id,
                                              question.id,
                                              "explanation",
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </label>
                                    </>
                                  ) : questionHasOptions ? (
                                    <div className={styles.questionOptions}>
                                      <div className={styles.questionOptionsHeader}>
                                        <strong>Answer options</strong>
                                        {canAddOptionsForType(activeGroup.type) && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              addQuestionOption(activeGroup.id, question.id)
                                            }
                                          >
                                            <Plus aria-hidden="true" size={15} />
                                            Add option
                                          </button>
                                        )}
                                      </div>

                                      {question.questionOptions.map((questionOption) => (
                                        <div
                                          className={`${styles.questionOptionCard} ${
                                            activeGroupIsMultipleChoiceMultiple ? styles.multiAnswerOptionCard : ""
                                          }`}
                                          key={questionOption.id}
                                        >
                                          <label>
                                            <span>{activeGroupIsMultipleChoiceMultiple ? "Label" : "Option"}</span>
                                            <input
                                              value={questionOption.option}
                                              onChange={(event) =>
                                                updateQuestionOption(
                                                  activeGroup.id,
                                                  question.id,
                                                  questionOption.id,
                                                  "option",
                                                  event.target.value,
                                                )
                                              }
                                            />
                                          </label>
                                          {activeGroupIsMultipleChoiceMultiple && (
                                            <label>
                                              <span>Content</span>
                                              <input
                                                placeholder="Answer choice content"
                                                value={questionOption.content ?? ""}
                                                onChange={(event) =>
                                                  updateQuestionOption(
                                                    activeGroup.id,
                                                    question.id,
                                                    questionOption.id,
                                                    "content",
                                                    event.target.value,
                                                  )
                                                }
                                              />
                                            </label>
                                          )}
                                          <label className={styles.checkboxField}>
                                            <input
                                              checked={questionOption.isCorrectAnswer}
                                              type="checkbox"
                                              onChange={(event) =>
                                                updateQuestionOption(
                                                  activeGroup.id,
                                                  question.id,
                                                  questionOption.id,
                                                  "isCorrectAnswer",
                                                  event.target.checked,
                                                )
                                              }
                                            />
                                            <span>Correct answer</span>
                                          </label>
                                          <label>
                                            <span>Explanation</span>
                                            <textarea
                                              rows={2}
                                              value={questionOption.explanation}
                                              onChange={(event) =>
                                                updateQuestionOption(
                                                  activeGroup.id,
                                                  question.id,
                                                  questionOption.id,
                                                  "explanation",
                                                  event.target.value,
                                                )
                                              }
                                            />
                                          </label>
                                          {canAddOptionsForType(activeGroup.type) &&
                                            question.questionOptions.length > 2 && (
                                              <button
                                                aria-label="Remove option"
                                                title="Remove option"
                                                className={styles.iconButton}
                                                type="button"
                                                onClick={() =>
                                                  removeQuestionOption(
                                                    activeGroup.id,
                                                    question.id,
                                                    questionOption.id,
                                                  )
                                                }
                                              >
                                                <Trash2 aria-hidden="true" size={16} />
                                              </button>
                                            )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <>
                                      <label>
                                        <span>{activeGroupIsTextInput ? "Correct answers" : "Correct answer"}</span>
                                        <input
                                          placeholder={
                                            activeGroupIsTextInput
                                              ? "population | inhabitants"
                                              : undefined
                                          }
                                          value={question.correctAnswer}
                                          onChange={(event) =>
                                            updateQuestionItem(
                                              activeGroup.id,
                                              question.id,
                                              "correctAnswer",
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </label>
                                      {activeGroupIsTextInput && (
                                        <label className={styles.checkboxField}>
                                          <input
                                            checked={question.caseSensitive}
                                            type="checkbox"
                                            onChange={(event) =>
                                              updateQuestionItem(
                                                activeGroup.id,
                                                question.id,
                                                "caseSensitive",
                                                event.target.checked,
                                              )
                                            }
                                          />
                                          <span>Case sensitive</span>
                                        </label>
                                      )}
                                      <label>
                                        <span>Explanation</span>
                                        <textarea
                                          rows={2}
                                          value={question.explanation}
                                          onChange={(event) =>
                                            updateQuestionItem(
                                              activeGroup.id,
                                              question.id,
                                              "explanation",
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </label>
                                    </>
                                  )}
                                </>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    </>
                  )}
                </section>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              disabled={currentStep === 1 || isSaving}
              onClick={() => goToStep(Math.max(1, currentStep - 1))}
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handlePrimaryAction}
            >
              {currentStep === 3 ? isSaving ? "Đang lưu..." : "Lưu bản nháp" : "Tiếp tục"}
              <ChevronRight aria-hidden="true" size={16} />
            </button>
          </div>
        </div>

        <aside className={styles.stepper}>
          {steps.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <button
                className={`${isActive ? styles.activeStep : ""} ${
                  isDone ? styles.doneStep : ""
                }`}
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
              >
                <span>{isDone ? <Check size={16} /> : <Icon size={16} />}</span>
                <div>
                  <strong>{step.label}</strong>
                  <small>{isDone ? "Completed" : isActive ? "Editing" : "Pending"}</small>
                </div>
              </button>
            );
          })}
        </aside>
      </section>
      )}
    </div>
  );
}

