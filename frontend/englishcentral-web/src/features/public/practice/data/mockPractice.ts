export type PracticeCategory =
  | "ielts"
  | "toeic"
  | "pte"
  | "vstep"
  | "ket"
  | "pet"
  | "starter"
  | "mover"
  | "mock-ielts"
  | "mock-toeic";

export type PracticeSkill =
  | "reading"
  | "listening"
  | "writing"
  | "cambridge"
  | "ets"
  | "general";
  

export type PublicPractice = {
  id: number;
  slug: string;
  category: PracticeCategory;
  skill: PracticeSkill;
  title: string;
  level: string;
  duration: string;
  description: string;
  highlights: string[];
  status: "completed" | "inprogress";
};

export const practiceMenus = [
  {
    label: "IELTS",
    value: "ielts",
    children: [
      { label: "Reading", value: "reading" },
      { label: "Listening", value: "listening" },
      { label: "Writing", value: "writing" },
      { label: "Cambridge", value: "cambridge" },
    ],
  },
  {
    label: "TOEIC",
    value: "toeic",
    children: [
      { label: "Reading", value: "reading" },
      { label: "Listening", value: "listening" },
      { label: "Writing", value: "writing" },
      { label: "ETS", value: "ets" },
    ],
  },
  { label: "PTE", value: "pte" },
  { label: "V-STEP", value: "vstep" },
  { label: "KET", value: "ket" },
  { label: "PET", value: "pet" },
  { label: "STARTER", value: "starter" },
  { label: "MOVER", value: "mover" },
  { label: "MOCK IELTS TEST", value: "mock-ielts" },
  { label: "MOCK TOEIC TEST", value: "mock-toeic" },
] as const;

export const mockPractices: PublicPractice[] = [
  {
    id: 1,
    slug: "ielts-reading-cambridge-18-test-1",
    category: "ielts",
    skill: "reading",
    title: "IELTS Reading - Cambridge 18 Test 1",
    level: "Intermediate",
    duration: "60 phút",
    description: "Luyện Reading theo format IELTS Academic trên máy tính.",
    highlights: ["Passage 1-3", "Question navigation", "Answer review"],
    status: "inprogress"
  },
  {
    id: 2,
    slug: "ielts-listening-cambridge-17-test-2",
    category: "ielts",
    skill: "listening",
    title: "IELTS Listening - Cambridge 17 Test 2",
    level: "Intermediate",
    duration: "40 phút",
    description: "Luyện Listening với audio player, timer và answer sheet.",
    highlights: ["Audio test", "4 sections", "Computer-based style"],
    status: "inprogress"
  },
  {
    id: 3,
    slug: "ielts-writing-task-2-opinion",
    category: "ielts",
    skill: "writing",
    title: "IELTS Writing Task 2 - Opinion Essay",
    level: "Upper-Intermediate",
    duration: "40 phút",
    description: "Luyện viết essay có word count và gợi ý band descriptor.",
    highlights: ["Word count", "Task response", "Coherence checklist"],
    status: "completed"
  },
  {
    id: 4,
    slug: "ielts-cambridge-19-full-test",
    category: "ielts",
    skill: "cambridge",
    title: "Cambridge IELTS 19 - Full Practice",
    level: "Advanced",
    duration: "2 giờ 45 phút",
    description: "Bộ luyện đề IELTS Cambridge theo từng kỹ năng.",
    highlights: ["Cambridge format", "Full test", "Review đáp án"],
    status: "completed"
  },
  {
    id: 5,
    slug: "toeic-reading-part-5",
    category: "toeic",
    skill: "reading",
    title: "TOEIC Reading - Part 5 Grammar",
    level: "Foundation",
    duration: "25 phút",
    description: "Luyện ngữ pháp TOEIC Part 5 với giải thích chi tiết.",
    highlights: ["Part 5", "Grammar focus", "Instant feedback"],
    status: "inprogress"
  },
  {
    id: 6,
    slug: "toeic-listening-part-3",
    category: "toeic",
    skill: "listening",
    title: "TOEIC Listening - Part 3 Conversations",
    level: "Intermediate",
    duration: "30 phút",
    description: "Luyện nghe hội thoại TOEIC theo format đề thật.",
    highlights: ["Part 3", "Audio player", "Transcript review"],
    status: "inprogress"
  },
  {
    id: 7,
    slug: "toeic-ets-2024-test-1",
    category: "toeic",
    skill: "ets",
    title: "ETS TOEIC 2024 - Test 1",
    level: "Advanced",
    duration: "120 phút",
    description: "Luyện đề TOEIC ETS full test trên giao diện mô phỏng máy tính.",
    highlights: ["ETS style", "Full test", "Score estimate"],
    status: "completed"
  },
  {
    id: 8,
    slug: "pte-speaking-read-aloud",
    category: "pte",
    skill: "general",
    title: "PTE Speaking - Read Aloud",
    level: "Intermediate",
    duration: "20 phút",
    description: "Luyện nói PTE với bài đọc ngắn và ghi âm phản hồi.",
    highlights: ["Speaking", "Recording", "Pronunciation"],
    status: "inprogress"
  },
  {
    id: 9,
    slug: "mock-ielts-test-01",
    category: "mock-ielts",
    skill: "general",
    title: "Mock IELTS Test 01",
    level: "All levels",
    duration: "2 giờ 45 phút",
    description: "Thi thử IELTS full test mô phỏng computer-based test.",
    highlights: ["Full test", "Timer", "Result analysis"],
    status: "completed"
  },
  {
    id: 10,
    slug: "mock-toeic-test-01",
    category: "mock-toeic",
    skill: "general",
    title: "Mock TOEIC Test 01",
    level: "All levels",
    duration: "120 phút",
    description: "Thi thử TOEIC full test với Listening và Reading.",
    highlights: ["Listening", "Reading", "Score estimate"],
    status: "inprogress"
  },
];