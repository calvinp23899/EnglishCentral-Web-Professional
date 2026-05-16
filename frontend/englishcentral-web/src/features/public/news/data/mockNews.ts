export type NewsArticle = {
    id: number;
    slug: string;
    category: string;
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
    content: string[];
};

export const mockNews: NewsArticle[] = [
    {
        id: 1,
        slug: "cach-dat-ielts-7-writing",
        category: "IELTS",
        title: "Cách cải thiện Writing để đạt IELTS 7.0+",
        excerpt:
            "Chiến lược nâng cao Task Response, Coherence và Lexical Resource hiệu quả.",
        date: "12/05/2026",
        readTime: "8 phút đọc",
        content: [
            "IELTS Writing không chỉ yêu cầu vốn từ tốt mà còn cần khả năng phát triển ý rõ ràng và logic.",
            "Để đạt band 7.0+, người học cần tập trung vào bốn tiêu chí: Task Response, Coherence and Cohesion, Lexical Resource và Grammar Range.",
            "Một chiến lược hiệu quả là luyện viết theo từng dạng bài, nhận feedback thường xuyên và sửa lỗi có hệ thống."
        ]
    },
    {
        id: 2,
        slug: "toeic-part-7-tips",
        category: "TOEIC",
        title: "Chiến thuật xử lý TOEIC Part 7 nhanh và chính xác",
        excerpt:
            "Tối ưu tốc độ đọc hiểu và xác định keyword quan trọng.",
        date: "10/05/2026",
        readTime: "6 phút đọc",
        content: [
            "TOEIC Part 7 yêu cầu người học phải có kỹ năng đọc hiểu nhanh và chính xác.",
            "Để xử lý hiệu quả, người học cần xác định keyword quan trọng và hiểu cấu trúc câu.",
            "Một chiến lược hiệu quả là luyện tập thường xuyên và phân tích lỗi sai."
        ]
    },
    {
        id: 3,
        slug: "lo-trinh-ielts-0-6-5",
        category: "Lộ trình học",
        title: "Lộ trình học IELTS từ 0 đến 6.5+ cho người mất gốc",
        excerpt:
            "Các giai đoạn học tập cần thiết để xây nền và tăng band bền vững.",
        date: "08/05/2026",
        readTime: "10 phút đọc",
        content: [
            "IELTS 0-6.5 không chỉ yêu cầu vốn từ tốt mà còn cần khả năng phát triển ý rõ ràng và logic.",
            "Để đạt band 7.0+, người học cần tập trung vào bốn tiêu chí: Task Response, Coherence and Cohesion, Lexical Resource và Grammar Range.",
            "Một chiến lược hiệu quả là luyện viết theo từng dạng bài, nhận feedback thường xuyên và sửa lỗi có hệ thống."
        ]
    },
];