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

import { adminIeltsReadingApi, type ExamVersion } from "../api/admin-ielts-reading-api";
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
  explanation: string;
  id: string;
  isCorrectAnswer: boolean;
  option: string;
};

type QuestionItem = {
  correctAnswer: string;
  explanation: string;
  id: string;
  number: number;
  passageRef: string;
  questionOptions: QuestionOption[];
  text: string;
  wordLimit?: number;
};

type QuestionGroup = {
  groupLabel: string;
  id: string;
  instruction: string;
  questions: QuestionItem[];
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

const maxReadingQuestions = 40;
const passageCountOptions = [1, 2, 3];

const normalizeQuestionType = (type: string | number | null | undefined) =>
  String(type ?? "").replace(/[^a-z0-9]/gi, "").toLowerCase();

const isMultipleChoiceType = (type: string | number) =>
  normalizeQuestionType(type).startsWith("multiplechoice");

const isSingleChoiceType = (type: string | number) =>
  normalizeQuestionType(type) === "multiplechoicesingle" ||
  normalizeQuestionType(type) === "multiplechoice";

const isTrueFalseType = (type: string | number) =>
  normalizeQuestionType(type) === "truefalsenotgiven";

const isYesNoType = (type: string | number) =>
  normalizeQuestionType(type) === "yesnonotgiven";

const isChoiceType = (type: string | number) =>
  isMultipleChoiceType(type) || isTrueFalseType(type) || isYesNoType(type);

const canAddOptionsForType = (type: string | number) => isMultipleChoiceType(type);

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

const shouldUseQuestionOptions = (type: string) => isChoiceType(type);

const getCorrectAnswerFromOptions = (questionOptions: QuestionOption[]) =>
  questionOptions
    .filter((option) => option.isCorrectAnswer)
    .map((option) => option.option)
    .join(", ");

const createQuestion = (
  number: number,
  type = "MultipleChoiceSingle",
): QuestionItem => ({
  correctAnswer: "",
  explanation: "",
  id: crypto.randomUUID(),
  number,
  passageRef: "",
  questionOptions: createQuestionOptions(type),
  text: `Question ${number}`,
});

const createQuestionGroup = (order: number, questionNumber: number): QuestionGroup => {
  return {
    id: crypto.randomUUID(),
    groupLabel: `Group ${order}`,
    instruction: "",
    questions: [createQuestion(questionNumber, "MultipleChoiceSingle")],
    title: `Questions ${questionNumber}-${questionNumber}`,
    type: "MultipleChoiceSingle",
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
    passage.questionGroups.flatMap((group) => group.questions.map((question) => question.number)),
  );

const getQuestionCount = (readingPassages: ReadingPassage[]) =>
  readingPassages.reduce(
    (total, passage) =>
      total +
      passage.questionGroups.reduce(
        (passageTotal, group) => passageTotal + group.questions.length,
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
        return {
          id: group.publicId ?? crypto.randomUUID(),
          groupLabel: group.code || `Group ${groupIndex + 1}`,
          instruction: group.instructions ?? "",
          questions: group.questions.map((question) => ({
            id: question.publicId ?? crypto.randomUUID(),
            number: Number(question.code.replace(/\D/g, "")) || question.orderIndex,
            text: question.prompt ?? "",
            correctAnswer: question.answerKeys.map((answer) => answer.correctValue).filter(Boolean).join(", "),
            explanation: question.explanation ?? "",
            passageRef: "",
            questionOptions: question.answerOptions.map((option) => ({
              id: option.publicId ?? crypto.randomUUID(),
              option: option.label,
              explanation: option.metadataJson ? parseJson<{ explanation?: string }>(option.metadataJson, {}).explanation ?? "" : "",
              isCorrectAnswer: question.answerKeys.some((answer) => answer.correctValue === option.label),
            })),
          })),
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
  const [examTypeId, setExamTypeId] = useState<number | null>(null);
  const [questionTypeOptions, setQuestionTypeOptions] = useState<MetadataOption[]>(fallbackQuestionTypeOptions);
  const [currentVersionNumber, setCurrentVersionNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));
  const [isSaving, setIsSaving] = useState(false);

  const activePassage = useMemo(
    () => passages.find((passage) => passage.id === activePassageId) ?? passages[0],
    [activePassageId, passages],
  );
  const activeGroup = activePassage?.questionGroups.find((group) => group.id === activeGroupId);
  const availableQuestionTypeOptions = questionTypeOptions;
  const totalQuestions = getQuestionCount(passages);
  const hasReachedQuestionLimit = totalQuestions >= maxReadingQuestions;

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setIsLoading(Boolean(recordId));
      try {
        const [readingType, questionTypes] = await Promise.all([
          adminIeltsReadingApi.getReadingExamType(),
          adminMetadataApi.getExamQuestionTypeOptions().catch(() => fallbackQuestionTypeOptions),
        ]);
        if (!isMounted) return;
        setExamTypeId(readingType?.id ?? null);
        setQuestionTypeOptions(questionTypes.length ? questionTypes : fallbackQuestionTypeOptions);

        if (!recordId) {
          setIsLoading(false);
          return;
        }

        const template = await adminIeltsReadingApi.getTemplateById(recordId);
        if (!isMounted) return;
        setSetup((current) => ({
          ...current,
          description: template.description ?? "",
          durationMinutes: template.durationMinutes ?? 60,
          level: current.level,
          status: String(template.status).toLowerCase() === "published" || String(template.status) === "2" ? "published" : "draft",
          testCode: template.code,
          title: template.name,
        }));

        const versionResult = template.currentVersionId
          ? { items: [await adminIeltsReadingApi.getVersionById(template.currentVersionId)] }
          : await adminIeltsReadingApi.getVersions({ examTemplateId: template.id, pageSize: 1 });
        const version = versionResult.items[0];
        if (version && isMounted) {
          setCurrentVersionNumber(version.versionNumber);
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

  const buildVersionPayload = (templateId: number) => {
    const nextVersionNumber = currentVersionNumber + 1 || 1;
    return {
      examTemplateId: templateId,
      versionCode: `${setup.testCode.trim() || "IELTS-RD"}-V${nextVersionNumber}`,
      versionNumber: nextVersionNumber,
      name: `${setup.title.trim() || "IELTS Reading"} v${nextVersionNumber}`,
      description: setup.description.trim() || null,
      durationMinutes: Number(setup.durationMinutes) || 60,
      totalScore: 40,
      scoringMode: "Auto" as const,
      runtimeConfigJson: JSON.stringify({ level: setup.level, sourceLabel: setup.sourceLabel, note: setup.note }),
      scoringConfigJson: null,
      sections: [{
        code: "READING",
        name: "IELTS Reading",
        skill: "Reading" as const,
        orderIndex: 1,
        durationMinutes: Number(setup.durationMinutes) || 60,
        maxScore: 40,
        instructions: setup.description,
        runtimeConfigJson: null,
        parts: passages.map((passage, passageIndex) => ({
          code: `READING-P${passageIndex + 1}`,
          name: passage.title || `Reading Passage ${passageIndex + 1}`,
          orderIndex: passageIndex + 1,
          instructions: passage.instruction || null,
          layoutConfigJson: JSON.stringify({ part: passage.part }),
          stimuli: [{
            clientKey: passage.id,
            type: "Text" as const,
            title: passage.title,
            content: getPassageContent(passage),
            assetUrl: null,
            transcript: null,
            orderIndex: 1,
            metadataJson: JSON.stringify({ paragraphs: passage.paragraphs }),
          }],
          questionGroups: passage.questionGroups.map((group, groupIndex) => ({
            code: group.groupLabel || `GROUP-${passageIndex + 1}-${groupIndex + 1}`,
            stimulusClientKey: passage.id,
            title: group.title,
            instructions: group.instruction || null,
            questionType: group.type,
            orderIndex: groupIndex + 1,
            configJson: JSON.stringify({ questionType: group.type }),
            questions: group.questions.map((question, questionIndex) => {
              const hasOptions = shouldUseQuestionOptions(group.type);
              return {
                code: `Q${question.number}`,
                prompt: question.text || null,
                questionType: group.type,
                orderIndex: questionIndex + 1,
                points: 1,
                isRequired: true,
                explanation: question.explanation || null,
                metadataJson: JSON.stringify({ number: question.number, passageRef: question.passageRef }),
                answerOptions: hasOptions ? question.questionOptions.map((option, optionIndex) => ({
                  clientKey: option.id,
                  label: option.option,
                  content: option.option,
                  orderIndex: optionIndex + 1,
                  metadataJson: JSON.stringify({ explanation: option.explanation }),
                })) : null,
                answerKeys: hasOptions
                  ? question.questionOptions.filter((option) => option.isCorrectAnswer).map((option, optionIndex) => ({
                    answerOptionClientKey: option.id,
                    correctValue: option.option,
                    matchPattern: null,
                    score: 1,
                    caseSensitive: false,
                    orderIndex: optionIndex + 1,
                  }))
                  : [{
                    answerOptionClientKey: null,
                    correctValue: question.correctAnswer || null,
                    matchPattern: null,
                    score: 1,
                    caseSensitive: false,
                    orderIndex: 1,
                  }],
              };
            }),
          })),
        })),
      }],
      scoringRules: null,
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

  const updateQuestionGroupType = (
    groupId: string,
    type: string,
  ) => {
    setPassages((currentPassages) =>
      currentPassages.map((passage) => ({
        ...passage,
        questionGroups: passage.questionGroups.map((group) => {
          if (group.id !== groupId) {
            return group;
          }

          return {
            ...group,
            type,
            questions: group.questions.map((question) => {
              const questionOptions = shouldUseQuestionOptions(type)
                ? createQuestionOptions(type)
                : [];

              return {
                ...question,
                correctAnswer: "",
                questionOptions,
              };
            }),
          };
        }),
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

    if (!targetGroup) {
      return;
    }

    const nextQuestionNumber = getNextQuestionNumber(passages);

    if (!nextQuestionNumber) {
      toastWarning("Đã đạt giới hạn 40 câu hỏi.");
      return;
    }

    const nextQuestionId = crypto.randomUUID();
    const nextQuestion = {
      ...createQuestion(nextQuestionNumber, targetGroup.type),
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
    value: string | number,
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
      if (!examTypeId) {
        toastDanger("BE chưa có Exam Type IELTS Reading/IELTS đang hoạt động.");
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
        const templatePayload = {
          examTypeId,
          code: setup.testCode.trim(),
          name: setup.title.trim(),
          description: setup.description.trim() || null,
          durationMinutes: Number(setup.durationMinutes) || 60,
          totalScore: 40,
          isActive: true,
        };
        const template = recordId
          ? await adminIeltsReadingApi.updateTemplate(recordId, templatePayload)
          : await adminIeltsReadingApi.createTemplate(templatePayload);
        await adminIeltsReadingApi.createVersion(buildVersionPayload(template.id));
        toastSuccess(recordId ? "Cập nhật đề IELTS Reading thành công." : "Tạo đề IELTS Reading thành công.");
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
                  <span>Test title</span>
                  <input
                    value={setup.title}
                    onChange={(event) => updateSetup("title", event.target.value)}
                  />
                </label>
                <label>
                  <span>Test code / slug</span>
                  <input
                    value={setup.testCode}
                    onChange={(event) => updateSetup("testCode", event.target.value)}
                  />
                </label>
                <label>
                  <span>Source label</span>
                  <input
                    value={setup.sourceLabel}
                    onChange={(event) => updateSetup("sourceLabel", event.target.value)}
                  />
                </label>
                <label>
                  <span>Duration</span>
                  <input
                    min={1}
                    type="number"
                    value={setup.durationMinutes}
                    onChange={(event) =>
                      updateSetup("durationMinutes", Number(event.target.value))
                    }
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
                  <span>Status</span>
                  <select
                    value={setup.status}
                    onChange={(event) =>
                      updateSetup("status", event.target.value as TestSetup["status"])
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
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
                  <span>Description</span>
                  <textarea
                    rows={4}
                    value={setup.description}
                    onChange={(event) => updateSetup("description", event.target.value)}
                  />
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
                  <label>
                    <span>Drag heading mode</span>
                    <select
                      value={activePassage.isDragHeadingOnParagraph ? "yes" : "no"}
                      onChange={(event) =>
                        updatePassage(
                          activePassage.id,
                          "isDragHeadingOnParagraph",
                          event.target.value === "yes",
                        )
                      }
                    >
                      <option value="no">Off</option>
                      <option value="yes">On</option>
                    </select>
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

                {activePassage.isDragHeadingOnParagraph ? (
                  <>
                    <div className={styles.listHeader}>
                      <strong>Paragraphs</strong>
                      <button type="button" onClick={() => addParagraph(activePassage.id)}>
                        <Plus aria-hidden="true" size={15} />
                        Add paragraph
                      </button>
                    </div>

                    <div className={styles.paragraphList}>
                      {activePassage.paragraphs.map((paragraph) => (
                        <article className={styles.paragraphCard} key={paragraph.id}>
                          <div className={styles.paragraphHeader}>
                            <label>
                              <span>Label</span>
                              <input
                                value={paragraph.label}
                                onChange={(event) =>
                                  updateParagraph(
                                    activePassage.id,
                                    paragraph.id,
                                    "label",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <button
                              aria-label="Remove paragraph"
                              title="Remove paragraph"
                              className={styles.iconButton}
                              type="button"
                              onClick={() => removeParagraph(activePassage.id, paragraph.id)}
                            >
                              <Trash2 aria-hidden="true" size={16} />
                            </button>
                          </div>
                          <RichTextEditor
                            label="Content"
                            value={paragraph.content}
                            onChange={(value) =>
                              updateParagraph(
                                activePassage.id,
                                paragraph.id,
                                "content",
                                value,
                              )
                            }
                          />
                        </article>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={styles.singleContentEditor}>
                    <RichTextEditor
                      label="Content"
                      minHeight={260}
                      value={activePassage.paragraphs[0]?.content ?? ""}
                      onChange={(value) => updatePassageContent(activePassage.id, value)}
                    />
                  </div>
                )}
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
                        <small>{group.type}</small>
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
                            <span>Group Question Type</span>
                            <select
                              value={activeGroup.type}
                              onChange={(event) =>
                                updateQuestionGroupType(
                                  activeGroup.id,
                                  event.target.value,
                                )
                              }
                            >
                              {availableQuestionTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.value}
                                </option>
                              ))}
                            </select>
                          </label>
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
                                  <span>{`Question ${question.number}`}</span>
                                </button>
                                <strong>{question.correctAnswer || "No answer key"}</strong>
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
                                  </div>
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
                                  {questionHasOptions ? (
                                    <div className={styles.questionOptions}>
                                      <div className={styles.questionOptionsHeader}>
                                        <strong>QuestionOptions</strong>
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
                                          className={styles.questionOptionCard}
                                          key={questionOption.id}
                                        >
                                          <label>
                                            <span>Option</span>
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
                                            <span>IsCorrectAnswer</span>
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
                                        <span>Correct answer</span>
                                        <input
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
