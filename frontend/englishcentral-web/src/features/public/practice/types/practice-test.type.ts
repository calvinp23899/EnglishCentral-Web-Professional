export type AnswerMap = Record<string, string>;

export type PracticeSkill = "reading" | "listening" | "writing" | "speaking";

export type PracticeCategory = "ielts" | "toeic" | "general";

export type IELTSReadingQuestionType =
  | "true-false-not-given"
  | "yes-no-not-given"
  | "matching-information"
  | "matching-headings"
  | "matching-features"
  | "matching-sentence-ending"
  | "summary-completion-options"
  | "sentence-completion"
  | "notes-completion"
  | "table-completion"
  | "flowchart-completion"
  | "diagram-labelling"
  | "single-choice"
  | "multiple-choice"
  | "short-answer";

export type IELTSReadingOption = {
  label: string;
  content: string;
};

export type IELTSReadingQuestion = {
  id: string;
  backendQuestionId?: number;
  number: number;
  numberLabel?: string;
  type?: IELTSReadingQuestionType;
  text: string;
  sectionTitle?: string;
  instruction?: string;
  options?: IELTSReadingOption[];
  optionBackendIds?: Record<string, number>;
  correctAnswer: string;
  explanation?: string;
  passageRef?: string;
  wordLimit?: number;
};

export type IELTSReadingQuestionGroup = {
  id: string;
  title: string;
  type: IELTSReadingQuestionType;
  heading?: string;
  imageUrl?: string;
  instruction: string;
  options?: IELTSReadingOption[];
  questions: IELTSReadingQuestion[];
};

export type IELTSReadingPassage = {
  id: string;
  part: number;
  title: string;
  instruction: string;
  audioName?: string;
  audioUrl?: string;
  isDragHeadingOnParagraph?: boolean;
  paragraphs: {
    id: string;
    label: string;
    content: string;
    isHiddenLabel?: boolean;
  }[];
  questionGroups: IELTSReadingQuestionGroup[];
};

export type IELTSMockTest = {
  id: string;
  category: PracticeCategory;
  slug: string;
  title: string;
  skill: PracticeSkill;
  durationMinutes: number;
  sourceLabel: string;
  level: string;
  description: string;
  note?: string;
  passages: IELTSReadingPassage[];
};

export type ExamResult = {
  totalQuestions: number;
  answeredQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  skippedQuestions: number;
  bandScore: number;
};
