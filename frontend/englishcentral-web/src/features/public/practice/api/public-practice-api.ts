import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

import type { PublicPractice } from "../data/mockPractice";

type ApiResult<T> = {
  data?: T;
  Data?: T;
  error?: string;
  Error?: string;
  isSuccess?: boolean;
  IsSuccess?: boolean;
};
type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
export type PublicPracticePagedResult = PagedResult<PublicPractice>;

type ExamTemplateSummary = {
  code: string;
  description?: string | null;
  durationMinutes?: number | null;
  examType?: {
    code?: string | null;
    family?: string | number | null;
    name?: string | null;
  } | null;
  examTypeCode?: string | null;
  examTypeFamily?: string | number | null;
  examTypeName?: string | null;
  id: number;
  name: string;
  totalScore?: number | null;
};

export type ExamSectionSummary = {
  durationMinutes?: number | null;
  maxScore?: number | null;
  name?: string | null;
  parts?: Array<{
    code: string;
    id?: number;
    instructions?: string | null;
    name: string;
    orderIndex: number;
    publicId?: string;
    questionGroups?: Array<{
      code: string;
      configJson?: string | null;
      id?: number;
      instructions?: string | null;
      publicId?: string;
      questionType: string | number;
      questions?: Array<{
        answerKeys?: Array<{
          correctValue?: string | null;
          examAnswerOptionId?: number | null;
        }>;
        answerOptions?: Array<{
          content: string;
          id?: number;
          label: string;
        }>;
        explanation?: string | null;
        id?: number;
        metadataJson?: string | null;
        orderIndex: number;
        prompt?: string | null;
        publicId?: string;
        title?: string | null;
      }>;
      title?: string | null;
    }>;
    stimuli?: Array<{
      content?: string | null;
      id?: number;
      metadataJson?: string | null;
      publicId?: string;
    }>;
  }>;
  skill?: string | number | null;
};

export type ExamVersionSummary = {
  createdAt?: string | null;
  description?: string | null;
  durationMinutes?: number | null;
  examTemplateId: number;
  id: number;
  name: string;
  publishedAt?: string | null;
  sections?: ExamSectionSummary[];
  slug?: string | null;
  status: string | number;
  totalScore?: number | null;
  versionCode?: string | null;
  versionNumber: number;
};

export type ExamAttemptAnswerPayload = {
  answerJson: string | null;
  answerOptionId: number | null;
  answerText: string | null;
  questionId: number;
};

export type ExamAttemptSubmitPayload = {
  answers: ExamAttemptAnswerPayload[];
  candidateEmail: string | null;
  candidateName: string | null;
  examVersionId: number;
  mode: string;
  startedAt: string;
  studentId: number | null;
};

export type ExamAttemptSubmitResult = {
  answeredQuestions?: number;
  bandScore?: number;
  correctCount?: number;
  correctQuestions?: number;
  score?: number;
  skippedQuestions?: number;
  totalQuestions?: number;
  wrongQuestions?: number;
};

export type ExamAttemptDetailResponse = {
  attemptCode?: string | null;
  bandScore?: number | null;
  candidateEmail?: string | null;
  candidateName?: string | null;
  completedAt?: string | null;
  durationSeconds?: number | null;
  examName?: string | null;
  examVersionId: number;
  id: number;
  mode?: string | number | null;
  rawScore?: number | null;
  resultDetail?: string | null;
  scaledScore?: number | null;
  startedAt?: string | null;
  status?: string | number | null;
  studentId?: number | null;
  submittedAt?: string | null;
  responses?: Array<{
    answerJson?: string | null;
    answerText?: string | null;
    answeredAt?: string | null;
    examAnswerOptionId?: number | null;
    examQuestionId: number;
    feedback?: string | null;
    id: number;
    isCorrect?: boolean | null;
    reviewStatus?: string | number | null;
    score?: number | null;
  }>;
};

export type PracticeHistoryItem = {
  band: string;
  examVersionId: string | null;
  id: string;
  mode: string;
  result: string;
  resultDetail: string;
  status: string;
  submittedAt: string | null;
  title: string;
};

type RawObject = Record<string, unknown>;
type PublicMetadataOption = {
  code?: string | number | null;
  Code?: string | number | null;
  label?: string | number | null;
  Label?: string | number | null;
  value?: string | number | null;
  Value?: string | number | null;
};
type RawPracticeHistoryResponse =
  | PagedResult<RawObject>
  | RawObject[]
  | {
      Items?: RawObject[];
      items?: RawObject[];
      Data?: RawObject[];
      data?: RawObject[];
    };

const unwrap = <T>(response: ApiResult<T> | T) => {
  if (typeof response !== "object" || response === null) {
    return response as T;
  }

  const source = response as ApiResult<T>;
  const hasResultShape =
    "isSuccess" in source ||
    "IsSuccess" in source ||
    "data" in source ||
    "Data" in source;

  if (!hasResultShape) {
    return response as T;
  }

  const isSuccess = source.isSuccess ?? source.IsSuccess ?? true;
  const data = source.data ?? source.Data;

  if (!isSuccess || data === undefined) {
    throw new Error(
      source.error ?? source.Error ?? "Không thể tải nội dung luyện tập.",
    );
  }

  return data;
};

const isObject = (value: unknown): value is RawObject =>
  typeof value === "object" && value !== null;

const readString = (source: RawObject, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
};

const readNumber = (source: RawObject, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    const numberValue =
      typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;

    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return null;
};

const readBoolean = (source: RawObject, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();

      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
  }

  return null;
};

const readMetadataCandidate = (source: PublicMetadataOption, keys: Array<keyof PublicMetadataOption>) => {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

const resolveAttemptModeValue = (
  options: PublicMetadataOption[],
  desiredMode: "Practice" | "RealTest",
) => {
  const normalizedDesired = desiredMode.toLowerCase();
  const matchedOption = options.find((option) =>
    [
      option.value,
      option.Value,
      option.code,
      option.Code,
      option.label,
      option.Label,
    ].some((value) => String(value ?? "").toLowerCase() === normalizedDesired),
  );

  if (!matchedOption) {
    return desiredMode;
  }

  return (
    readMetadataCandidate(matchedOption, ["value", "Value"]) ||
    readMetadataCandidate(matchedOption, ["code", "Code"]) ||
    readMetadataCandidate(matchedOption, ["label", "Label"]) ||
    desiredMode
  );
};

const unwrapItems = (payload: RawPracticeHistoryResponse) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const source = payload as RawObject;
  const candidates = [source.items, source.Items, source.data, source.Data];
  const collection = candidates.find(Array.isArray);

  return collection?.filter(isObject) ?? [];
};

const normalizePagedResult = <T>(payload: unknown): PagedResult<T> => {
  if (Array.isArray(payload)) {
    return {
      items: payload as T[],
      page: 1,
      pageSize: payload.length,
      totalItems: payload.length,
      totalPages: 1,
    };
  }

  const source = isObject(payload) ? payload : {};
  const rawItems = [source.items, source.Items, source.data, source.Data].find(Array.isArray);
  const items = (rawItems ?? []) as T[];
  const page = readNumber(source, ["page", "Page", "pageNumber", "PageNumber", "currentPage", "CurrentPage"]) ?? 1;
  const pageSize = readNumber(source, ["pageSize", "PageSize", "size", "Size"]) ?? items.length;
  const totalItems =
    readNumber(source, [
      "totalItems",
      "TotalItems",
      "totalCount",
      "TotalCount",
      "totalRecords",
      "TotalRecords",
    ]) ?? items.length;
  const totalPages =
    readNumber(source, ["totalPages", "TotalPages", "pageCount", "PageCount"]) ??
    Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
  };
};

const mapHistoryItem = (item: RawObject, index: number): PracticeHistoryItem => {
  const id =
    readString(item, ["attemptId", "AttemptId", "id", "Id", "publicId", "PublicId"]) ||
    String(index + 1);
  const examVersionId =
    readString(item, [
      "examVersionId",
      "ExamVersionId",
      "versionId",
      "VersionId",
      "testId",
      "TestId",
      "practiceId",
      "PracticeId",
    ]) || null;
  const correct = readNumber(item, ["correctCount", "CorrectCount", "correctQuestions", "CorrectQuestions"]);
  const total = readNumber(item, ["totalQuestions", "TotalQuestions", "questionCount", "QuestionCount"]);
  const score = readNumber(item, ["score", "Score", "totalScore", "TotalScore"]);
  const maxScore = readNumber(item, ["maxScore", "MaxScore"]);
  const result =
    correct !== null && total !== null
      ? `${correct}/${total}`
      : score !== null && maxScore !== null
        ? `${score}/${maxScore}`
        : score !== null
          ? String(score)
          : readString(item, ["result", "Result"]) || "-";
  const submittedAt =
    readString(item, [
      "submittedAt",
      "SubmittedAt",
      "completedAt",
      "CompletedAt",
      "finishedAt",
      "FinishedAt",
      "createdAt",
      "CreatedAt",
      "startedAt",
      "StartedAt",
    ]) || null;

  return {
    band:
      readString(item, ["bandScore", "BandScore", "ieltsBandScore", "IeltsBandScore", "band", "Band"]) ||
      "-",
    examVersionId,
    id,
    mode:
      readString(item, ["mode", "Mode", "attemptMode", "AttemptMode", "practiceMode", "PracticeMode"]) ||
      "Thi thật",
    result,
    resultDetail: readString(item, ["resultDetail", "ResultDetail"]) || result,
    status: readString(item, ["status", "Status", "attemptStatus", "AttemptStatus"]) || "-",
    submittedAt,
    title:
      readString(item, [
        "examName",
        "ExamName",
        "testName",
        "TestName",
        "name",
        "Name",
        "examVersionName",
        "ExamVersionName",
        "templateName",
        "TemplateName",
        "title",
        "Title",
      ]) || `Bài làm #${id}`,
  };
};

const normalizeAttemptDetail = (payload: unknown): ExamAttemptDetailResponse => {
  const source = isObject(payload) ? payload : {};
  const responsesCandidate = source.responses ?? source.Responses;
  const responses = Array.isArray(responsesCandidate)
    ? responsesCandidate.filter(isObject).map((response) => ({
        answerJson: readString(response, ["answerJson", "AnswerJson"]) || null,
        answerText: readString(response, ["answerText", "AnswerText"]) || null,
        answeredAt: readString(response, ["answeredAt", "AnsweredAt"]) || null,
        examAnswerOptionId: readNumber(response, ["examAnswerOptionId", "ExamAnswerOptionId"]),
        examQuestionId:
          readNumber(response, ["examQuestionId", "ExamQuestionId", "questionId", "QuestionId"]) ?? 0,
        feedback: readString(response, ["feedback", "Feedback"]) || null,
        id: readNumber(response, ["id", "Id"]) ?? 0,
        isCorrect: readBoolean(response, ["isCorrect", "IsCorrect"]),
        reviewStatus: readString(response, ["reviewStatus", "ReviewStatus"]) || null,
        score: readNumber(response, ["score", "Score"]),
      }))
    : [];

  return {
    attemptCode: readString(source, ["attemptCode", "AttemptCode"]) || null,
    bandScore: readNumber(source, ["bandScore", "BandScore"]),
    candidateEmail: readString(source, ["candidateEmail", "CandidateEmail"]) || null,
    candidateName: readString(source, ["candidateName", "CandidateName"]) || null,
    completedAt: readString(source, ["completedAt", "CompletedAt"]) || null,
    durationSeconds: readNumber(source, ["durationSeconds", "DurationSeconds"]),
    examName: readString(source, ["examName", "ExamName"]) || null,
    examVersionId: readNumber(source, ["examVersionId", "ExamVersionId"]) ?? 0,
    id: readNumber(source, ["id", "Id"]) ?? 0,
    mode: readString(source, ["mode", "Mode"]) || null,
    rawScore: readNumber(source, ["rawScore", "RawScore"]),
    resultDetail: readString(source, ["resultDetail", "ResultDetail"]) || null,
    responses,
    scaledScore: readNumber(source, ["scaledScore", "ScaledScore"]),
    startedAt: readString(source, ["startedAt", "StartedAt"]) || null,
    status: readString(source, ["status", "Status"]) || null,
    studentId: readNumber(source, ["studentId", "StudentId"]),
    submittedAt: readString(source, ["submittedAt", "SubmittedAt"]) || null,
  };
};

const isPublished = (status: string | number) => {
  const normalized = String(status).toLowerCase();
  return normalized === "published" || normalized === "2";
};

const isIeltsTemplate = (template: ExamTemplateSummary) => {
  const haystack = [
    template.code,
    template.name,
    template.examType?.code,
    template.examType?.name,
    template.examType?.family,
    template.examTypeCode,
    template.examTypeName,
    template.examTypeFamily,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes("ielts");
};

const normalizeSkill = (
  version: ExamVersionSummary,
  template?: ExamTemplateSummary,
): PublicPractice["skill"] => {
  const skill = [
    version.sections?.[0]?.skill,
    version.sections?.[0]?.name,
    version.versionCode,
    version.name,
    template?.code,
    template?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (skill.includes("listening") || skill === "1") return "listening";
  if (skill.includes("writing") || skill === "3") return "writing";
  if (skill.includes("reading") || skill === "2") return "reading";

  return "general";
};

const createSlug = (version: ExamVersionSummary) =>
  `exam-version-${version.id}`;

const mapVersionToPractice = (
  version: ExamVersionSummary,
  template?: ExamTemplateSummary,
): PublicPractice => {
  const duration = version.durationMinutes ?? template?.durationMinutes ?? version.sections?.[0]?.durationMinutes;
  const score = version.totalScore ?? template?.totalScore ?? version.sections?.[0]?.maxScore;
  const versionIdentity =
    version.versionCode?.trim() ||
    version.slug?.trim() ||
    `exam-version-${version.id}`;

  return {
    category: "ielts",
    description:
      version.description ||
      template?.description ||
      "Bài luyện tập IELTS đã được xuất bản từ ngân hàng bài tập.",
    duration: duration ? `${duration} phút` : "Không giới hạn",
    highlights: [
      `Version ${version.versionNumber}`,
      score ? `Total score ${score}` : "Published test",
      template?.name || versionIdentity,
    ],
    id: version.id,
    level: "IELTS",
    skill: normalizeSkill(version, template),
    slug: createSlug(version),
    status: "inprogress",
    title: version.name || template?.name || versionIdentity,
  };
};

export const publicPracticeApi = {
  async getExamAttemptModeValue(mode: "practice" | "real") {
    const desiredMode = mode === "real" ? "RealTest" : "Practice";

    try {
      const response = await api.get<ApiResult<PublicMetadataOption[]>>(
        ENDPOINTS.PUBLIC_METADATA.EXAM_ATTEMPT_MODE,
        { skipAuthRedirect: true },
      );
      const options = unwrap(response.data);

      return resolveAttemptModeValue(Array.isArray(options) ? options : [], desiredMode);
    } catch {
      return desiredMode;
    }
  },

  async getPublishedIeltsPractices(params?: {
    keyword?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PublicPracticePagedResult> {
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = Math.max(1, params?.pageSize ?? 20);
    const keyword = params?.keyword?.trim();
    const [templatesResult, versionsResult] = await Promise.all([
      api.get<ApiResult<PagedResult<ExamTemplateSummary>>>(ENDPOINTS.EXAM_PRACTICES.TEMPLATE_GET_LIST, {
        skipAuthRedirect: true,
        params: {
          IsActive: true,
          Keyword: "IELTS",
          Page: 1,
          PageSize: 100,
        },
      }),
      api.get<ApiResult<PagedResult<ExamVersionSummary>>>(ENDPOINTS.EXAM_PRACTICES.TEST_GET_LIST, {
        skipAuthRedirect: true,
        params: {
          ExamFamily: "IELTS",
          ...(keyword ? { Keyword: keyword } : {}),
          Page: page,
          PageSize: pageSize,
          Status: "Published",
        },
      }),
    ]);

    const templates = unwrap(templatesResult.data).items.filter(isIeltsTemplate);
    const templateById = new Map(templates.map((template) => [template.id, template]));
    const ieltsTemplateIds = new Set(templates.map((template) => template.id));
    const versionsPage = normalizePagedResult<ExamVersionSummary>(unwrap(versionsResult.data));

    const items = versionsPage.items
      .filter((version) => isPublished(version.status))
      .filter((version) => !ieltsTemplateIds.size || ieltsTemplateIds.has(version.examTemplateId))
      .map((version) => mapVersionToPractice(version, templateById.get(version.examTemplateId)));

    return {
      items,
      page: versionsPage.page,
      pageSize: versionsPage.pageSize,
      totalItems: versionsPage.totalItems,
      totalPages: versionsPage.totalPages,
    };
  },

  async getVersionById(id: string | number) {
    const response = await api.get<ApiResult<ExamVersionSummary>>(
      ENDPOINTS.EXAM_PRACTICES.TEST_GET_BY_ID(id),
      { skipAuthRedirect: true },
    );
    return unwrap(response.data);
  },

  async getPracticeHistory(studentId: number | null) {
    const response = await api.get<ApiResult<RawPracticeHistoryResponse>>(
      ENDPOINTS.EXAM_PRACTICES.HISTORY,
      {
        params: {
          StudentId: studentId ?? "",
        },
      },
    );
    const data = unwrap(response.data);

    return unwrapItems(data).map(mapHistoryItem);
  },

  async getPracticeAttemptDetail(id: string | number) {
    const response = await api.get<ApiResult<ExamAttemptDetailResponse>>(
      ENDPOINTS.EXAM_PRACTICES.DETAIL_EXAM(id),
    );

    return normalizeAttemptDetail(unwrap(response.data));
  },

  async submitAttemptWithAnswers(payload: ExamAttemptSubmitPayload) {
    const response = await api.post<ApiResult<ExamAttemptSubmitResult>>(
      ENDPOINTS.EXAM_ATTEMPTS.SUBMIT_WITH_ANSWERS,
      payload,
    );

    return unwrap(response.data);
  },
};
