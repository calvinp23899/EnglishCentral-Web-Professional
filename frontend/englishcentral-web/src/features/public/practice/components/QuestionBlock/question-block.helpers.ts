import type {
  IELTSReadingPassage,
  IELTSReadingQuestion,
  IELTSReadingQuestionGroup,
  IELTSMockTest,
} from "../../types/practice-test.type";

export const textAnswerQuestionTypes = new Set([
  "sentence-completion",
  "notes-completion",
  "table-completion",
  "flowchart-completion",
  "diagram-labelling",
  "short-answer",
]);

const truthOptionMap: Record<string, string[]> = {
  "true-false-not-given": ["TRUE", "FALSE", "NOT GIVEN"],
  "yes-no-not-given": ["YES", "NO", "NOT GIVEN"],
};

export function getAllQuestions(test: IELTSMockTest) {
  return test.passages.flatMap((passage) =>
    passage.questionGroups.flatMap((group) => group.questions)
  );
}

export function getPassageQuestions(passage: IELTSReadingPassage) {
  return passage.questionGroups.flatMap((group) => group.questions);
}

export function getQuestionOptions(
  question: IELTSReadingQuestion,
  group?: IELTSReadingQuestionGroup,
  passage?: IELTSReadingPassage
) {
  const questionType = question.type ?? group?.type;
  const groupOptions =
    group?.options ?? group?.questions.find((item) => item.options)?.options;
  const options = question.options ?? groupOptions;

  if (options?.length) {
    return options;
  }

  if (questionType === "matching-information" && passage) {
    return passage.paragraphs
      .filter((paragraph) => Boolean(paragraph.label) && !paragraph.isHiddenLabel)
      .map((paragraph) => ({
        label: paragraph.label!,
        content: paragraph.label!,
      }));
  }

  return questionType
    ? truthOptionMap[questionType]?.map((value) => ({
    label: value,
    content: value,
      }))
    : undefined;
}

export function getPassageRefIndex(question: IELTSReadingQuestion) {
  const match = question.passageRef?.match(/[A-Z]$/i);

  if (!match) {
    return undefined;
  }

  return match[0].toUpperCase().charCodeAt(0) - 64;
}
