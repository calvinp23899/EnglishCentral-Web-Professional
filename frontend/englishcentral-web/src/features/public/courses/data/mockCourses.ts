export type CourseCategory = "ielts" | "toeic" | "communication" | "kids";

export type PublicCourse = {
  id: number;
  slug: string;
  category: CourseCategory;
  title: string;
  level: string;
  duration: string;
  description: string;
  highlights: string[];
};

export const mockCourses: PublicCourse[] = [
  {
    id: 1,
    slug: "ielts-0-3",
    category: "ielts",
    title: "IELTS 0 - 3.0",
    level: "Beginner",
    duration: "12 tuần",
    description: "Xây nền phát âm, từ vựng, ngữ pháp và kỹ năng làm bài IELTS cơ bản.",
    highlights: ["Xây nền tiếng Anh", "Làm quen IELTS", "Sửa lỗi phát âm"],
  },
  {
    id: 2,
    slug: "ielts-3-5",
    category: "ielts",
    title: "IELTS 3.0 - 5.0",
    level: "Pre-Intermediate",
    duration: "14 tuần",
    description: "Phát triển 4 kỹ năng và chiến lược làm bài cho band điểm trung cấp.",
    highlights: ["Luyện 4 kỹ năng", "Tăng vốn từ học thuật", "Feedback bài viết"],
  },
  {
    id: 3,
    slug: "ielts-5-6-5",
    category: "ielts",
    title: "IELTS 5.0 - 6.5+",
    level: "Intermediate",
    duration: "16 tuần",
    description: "Nâng band toàn diện Listening, Reading, Writing và Speaking.",
    highlights: ["Mock test định kỳ", "Chữa Writing chi tiết", "Speaking 1-1"],
  },
  {
    id: 4,
    slug: "ielts-7-5",
    category: "ielts",
    title: "IELTS 7.5+",
    level: "Advanced",
    duration: "12 tuần",
    description: "Tối ưu chiến thuật, cải thiện độ chính xác và tư duy học thuật.",
    highlights: ["Advanced strategy", "Band descriptor", "Mentor cá nhân"],
  },
  {
    id: 5,
    slug: "toeic-450",
    category: "toeic",
    title: "TOEIC 450",
    level: "Foundation",
    duration: "10 tuần",
    description: "Nắm chắc ngữ pháp, từ vựng và kỹ năng nghe đọc TOEIC nền tảng.",
    highlights: ["Ngữ pháp trọng tâm", "Từ vựng TOEIC", "Mini test hằng tuần"],
  },
  {
    id: 6,
    slug: "toeic-900",
    category: "toeic",
    title: "TOEIC 900",
    level: "Advanced",
    duration: "12 tuần",
    description: "Luyện đề chuyên sâu, tối ưu tốc độ và độ chính xác để đạt điểm cao.",
    highlights: ["Full test", "Chiến thuật Part 5-7", "Phân tích lỗi sai"],
  },
];