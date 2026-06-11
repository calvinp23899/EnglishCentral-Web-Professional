import { Navigate } from "react-router-dom";

import { AdminLayout } from "@/app/layouts/admin-layout/AdminLayout";
import { AdminLoginPage } from "@/features/admin/auth/pages/AdminLoginPage/AdminLoginPage";
import { BillingPolicyFormPage } from "@/features/admin/billing-policies/pages/BillingPolicyFormPage";
import { BillingPolicyListPage } from "@/features/admin/billing-policies/pages/BillingPolicyListPage";
import { BillingPolicyViewPage } from "@/features/admin/billing-policies/pages/BillingPolicyViewPage";
import { ClassFormPage } from "@/features/admin/classes/pages/ClassFormPage";
import { ClassListPage } from "@/features/admin/classes/pages/ClassListPage";
import { ClassViewPage } from "@/features/admin/classes/pages/ClassViewPage";
import { CourseCategoryFormPage } from "@/features/admin/course-categories/pages/CourseCategoryFormPage";
import { CourseCategoryListPage } from "@/features/admin/course-categories/pages/CourseCategoryListPage";
import { CourseCategoryViewPage } from "@/features/admin/course-categories/pages/CourseCategoryViewPage";
import { CourseFormPage } from "@/features/admin/courses/pages/CourseFormPage";
import { CourseListPage } from "@/features/admin/courses/pages/CourseListPage";
import { CourseViewPage } from "@/features/admin/courses/pages/CourseViewPage";
import { AdminDashboardPage } from "@/features/admin/dashboard/pages/AdminDashboardPage";
import { DiscountFormPage } from "@/features/admin/discounts/pages/DiscountFormPage";
import { DiscountListPage } from "@/features/admin/discounts/pages/DiscountListPage";
import { DiscountViewPage } from "@/features/admin/discounts/pages/DiscountViewPage";
import { EnrollmentDetailPage } from "@/features/admin/enrollments/pages/EnrollmentDetailPage";
import { ExamTypeFormPage } from "@/features/admin/exam-types/pages/ExamTypeFormPage";
import { ExamTypeListPage } from "@/features/admin/exam-types/pages/ExamTypeListPage";
import { ExamTypeViewPage } from "@/features/admin/exam-types/pages/ExamTypeViewPage";
import { ExamTemplateFormPage } from "@/features/admin/exam-templates/pages/ExamTemplateFormPage";
import { ExamTemplateListPage } from "@/features/admin/exam-templates/pages/ExamTemplateListPage";
import { PaymentCreatePage } from "@/features/admin/enrollments/pages/PaymentCreatePage";
import { MyClassListPage } from "@/features/admin/my-classes/pages/MyClassListPage";
import { MyClassViewPage } from "@/features/admin/my-classes/pages/MyClassViewPage";
import { AdminChangePasswordPage } from "@/features/admin/profile/pages/AdminChangePasswordPage";
import { AdminProfilePage } from "@/features/admin/profile/pages/AdminProfilePage";
import { IeltsHubPage } from "@/features/admin/practice-bank/ielts/pages/IeltsHubPage";
import { IeltsReadingCreatePage } from "@/features/admin/practice-bank/ielts/reading/pages/IeltsReadingCreatePage";
import { IeltsReadingListPage } from "@/features/admin/practice-bank/ielts/reading/pages/IeltsReadingListPage";
import { IeltsReadingViewPage } from "@/features/admin/practice-bank/ielts/reading/pages/IeltsReadingViewPage";
import { PaymentPlanFormPage } from "@/features/admin/payment-plans/pages/PaymentPlanFormPage";
import { PaymentPlanListPage } from "@/features/admin/payment-plans/pages/PaymentPlanListPage";
import { PaymentPlanViewPage } from "@/features/admin/payment-plans/pages/PaymentPlanViewPage";
import { RoomFormPage } from "@/features/admin/rooms/pages/RoomFormPage";
import { RoomListPage } from "@/features/admin/rooms/pages/RoomListPage";
import { RoomViewPage } from "@/features/admin/rooms/pages/RoomViewPage";
import { AdminSchedulePage } from "@/features/admin/schedule/pages/AdminSchedulePage";
import { AdminSettingsPage } from "@/features/admin/settings/pages/AdminSettingsPage";
import { AdminPlaceholderPage } from "@/features/admin/shared/pages/AdminPlaceholderPage";
import { StudentCreatePage } from "@/features/admin/students/pages/StudentCreatePage";
import { StudentEditPage } from "@/features/admin/students/pages/StudentEditPage";
import { StudentListPage } from "@/features/admin/students/pages/StudentListPage";
import { StudentViewPage } from "@/features/admin/students/pages/StudentViewPage";
import { TeacherFormPage } from "@/features/admin/teachers/pages/TeacherFormPage";
import { TeacherListPage } from "@/features/admin/teachers/pages/TeacherListPage";
import { TeacherViewPage } from "@/features/admin/teachers/pages/TeacherViewPage";
import { AdminProtectedRoute } from "./protected-route";

const adminModuleRoutes = [
  {
    path: "students",
    title: "Student Management",
    description:
      "Manage learner profiles, placement levels, progress signals, and advisor follow-up workflows.",
  },
  {
    path: "courses",
    title: "Course Management",
    description:
      "Build IELTS, TOEIC, communication, and kids programs with lessons, outcomes, and enrollment rules.",
  },
  {
    path: "classes",
    title: "Class Scheduling",
    description:
      "Coordinate rooms, online sessions, attendance, teacher capacity, and weekly academic operations.",
  },
  {
    path: "teachers",
    title: "Teacher Management",
    description:
      "Track teaching assignments, availability, class load, and coaching quality across programs.",
  },
  {
    path: "reports",
    title: "Reports & Analytics",
    description:
      "Monitor enrollment trends, learning outcomes, skill growth, revenue signals, and operational KPIs.",
  },
  {
    path: "messages",
    title: "Messages",
    description:
      "Handle student communication, consultation requests, class reminders, and support follow-ups.",
  },
];

const financeRoutes = [
  {
    path: "finance/overview",
    title: "Tổng quan tài chính",
    description:
      "Theo dõi doanh thu, công nợ, dòng tiền, hóa đơn đến hạn và các chỉ số tài chính chính của trung tâm.",
  },
  {
    path: "finance/tuition-policies",
    title: "Chính sách học phí",
    description:
      "Quản lý bảng học phí, quy tắc áp dụng theo khóa học, lớp học, kỳ học và nhóm học viên.",
  },
  {
    path: "finance/payment-plans",
    title: "Kế hoạch thanh toán",
    description:
      "Thiết lập lịch thanh toán, kỳ hạn, nhắc hạn và trạng thái thu tiền theo từng học viên hoặc đăng ký học.",
  },
  {
    path: "finance/invoices",
    title: "Hóa đơn",
    description:
      "Tạo, phát hành, theo dõi và đối soát hóa đơn học phí, dịch vụ và các khoản thu liên quan.",
  },
  {
    path: "finance/payments",
    title: "Thanh toán",
    description:
      "Ghi nhận giao dịch thanh toán, phương thức thu tiền, trạng thái xử lý và kết quả đối soát.",
  },
  {
    path: "finance/receipts",
    title: "Biên lai",
    description:
      "Quản lý biên lai thu tiền, lịch sử phát hành, thông tin người nộp và chứng từ liên quan.",
  },
  {
    path: "finance/discounts",
    title: "Giảm giá",
    description:
      "Cấu hình mã giảm giá, ưu đãi học phí, điều kiện áp dụng và hiệu lực theo chương trình.",
  },
  {
    path: "finance/refunds",
    title: "Hoàn tiền",
    description:
      "Theo dõi yêu cầu hoàn tiền, khoản hoàn, lý do xử lý và trạng thái phê duyệt.",
  },
  {
    path: "finance/credit-notes",
    title: "Phiếu ghi có",
    description:
      "Quản lý phiếu ghi có, điều chỉnh công nợ, khoản bù trừ và liên kết với hóa đơn gốc.",
  },
  {
    path: "finance/ledger",
    title: "Sổ cái",
    description:
      "Xem các bút toán, tài khoản, phát sinh nợ có và dữ liệu kế toán tổng hợp.",
  },
  {
    path: "finance/background-jobs",
    title: "Tác vụ nền",
    description:
      "Theo dõi tác vụ tự động như nhắc thanh toán, đồng bộ giao dịch, phát hành hóa đơn và đối soát định kỳ.",
  },
];

const lmsRoutes = [
  { path: "lms/programs", title: "Chương trình học" },
  { path: "lms/modules", title: "Module học" },
  { path: "lms/lessons", title: "Bài học" },
  { path: "lms/videos", title: "Video" },
  { path: "lms/documents", title: "Tài liệu" },
  { path: "lms/exercises", title: "Bài tập" },
  { path: "lms/quizzes", title: "Quiz" },
  { path: "lms/progress", title: "Tiến độ học tập" },
];

const crmSalesRoutes = [
  { path: "crm-sales/leads", title: "Lead" },
  { path: "crm-sales/lead-sources", title: "LeadSource" },
  { path: "crm-sales/lead-activities", title: "LeadActivity" },
  { path: "crm-sales/lead-conversions", title: "LeadConversion" },
];

const costExpenseRoutes = [
  { path: "cost-expense/teacher-session-payrolls", title: "TeacherSessionPayroll" },
  { path: "cost-expense/class-expenses", title: "ClassExpense" },
  { path: "cost-expense/marketing-campaigns", title: "MarketingCampaign" },
  { path: "cost-expense/marketing-costs", title: "MarketingCost" },
];

const hrmRoutes = [
  { path: "hrm/attendance", title: "Chấm Công" },
  { path: "hrm/leave-requests", title: "Nghỉ Phép" },
];

export const adminRoutes = [
  {
    path: "/admin/login",

    element: <AdminLoginPage />,
  },
  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: "students",
        element: <StudentListPage />,
      },
      {
        path: "students/create",
        element: <StudentCreatePage />,
      },
      {
        path: "students/:studentId/edit",
        element: <StudentEditPage />,
      },
      {
        path: "students/:studentId/view",
        element: <StudentViewPage />,
      },
      {
        path: "schedule",
        element: <Navigate to="/admin/my-classes/schedule" replace />,
      },
      {
        path: "my-classes",
        element: <MyClassListPage />,
      },
      {
        path: "my-classes/schedule",
        element: <AdminSchedulePage />,
      },
      {
        path: "my-classes/:classId/view",
        element: <MyClassViewPage />,
      },
      {
        path: "practice-bank",
        element: <Navigate to="/admin/practice-bank/ielts" replace />,
      },
      {
        path: "exam-types",
        element: <ExamTypeListPage />,
      },
      {
        path: "exam-types/create",
        element: <ExamTypeFormPage mode="create" />,
      },
      {
        path: "exam-types/:recordId/view",
        element: <ExamTypeViewPage />,
      },
      {
        path: "exam-types/:recordId/edit",
        element: <ExamTypeFormPage mode="edit" />,
      },
      {
        path: "exams",
        element: <ExamTemplateListPage />,
      },
      {
        path: "exams/create",
        element: <ExamTemplateFormPage mode="create" />,
      },
      {
        path: "exams/:recordId/edit",
        element: <ExamTemplateFormPage mode="edit" />,
      },
      {
        path: "practice-bank/ielts",
        element: <IeltsHubPage />,
      },
      {
        path: "practice-bank/ielts/reading",
        element: <IeltsReadingListPage />,
      },
      {
        path: "practice-bank/ielts/reading/create",
        element: <IeltsReadingCreatePage />,
      },
      {
        path: "practice-bank/ielts/reading/:recordId/view",
        element: <IeltsReadingViewPage />,
      },
      {
        path: "practice-bank/ielts/reading/:recordId/edit",
        element: <IeltsReadingCreatePage />,
      },
      {
        path: "practice-bank/ielts/writing",
        element: (
          <AdminPlaceholderPage
            title="IELTS Writing"
            description="Quản lý đề IELTS Writing theo Task 1, Task 2, rubric và sample answers."
          />
        ),
      },
      {
        path: "practice-bank/ielts/listening",
        element: (
          <AdminPlaceholderPage
            title="IELTS Listening"
            description="Quản lý đề IELTS Listening theo audio sections, transcript, questions và đáp án."
          />
        ),
      },
      {
        path: "practice-bank/ielts/speaking",
        element: (
          <AdminPlaceholderPage
            title="IELTS Speaking"
            description="Quản lý đề IELTS Speaking theo part, cue card, rubric và sample answers."
          />
        ),
      },
      {
        path: "practice-bank/toeic",
        element: (
          <AdminPlaceholderPage
            title="TOEIC Practice Bank"
            description="Quản lý ngân hàng bài tập TOEIC theo part, bộ đề, câu hỏi và đáp án."
          />
        ),
      },
      {
        path: "content",
        element: <Navigate to="/admin/content/components/footer" replace />,
      },
      {
        path: "lms",
        element: <Navigate to="/admin/lms/programs" replace />,
      },
      {
        path: "crm-sales",
        element: <Navigate to="/admin/crm-sales/leads" replace />,
      },
      ...crmSalesRoutes.map((route) => ({
        path: route.path,
        element: (
          <AdminPlaceholderPage
            title={route.title}
            description="Chức năng CRM / Sales đang được xây dựng."
          />
        ),
      })),
      {
        path: "cost-expense",
        element: <Navigate to="/admin/cost-expense/teacher-session-payrolls" replace />,
      },
      ...costExpenseRoutes.map((route) => ({
        path: route.path,
        element: (
          <AdminPlaceholderPage
            title={route.title}
            description="Chức năng Cost / Expense đang được xây dựng."
          />
        ),
      })),
      {
        path: "hrm",
        element: <Navigate to="/admin/hrm/attendance" replace />,
      },
      ...hrmRoutes.map((route) => ({
        path: route.path,
        element: (
          <AdminPlaceholderPage
            title={route.title}
            description="Chức năng HRM đang được xây dựng."
          />
        ),
      })),
      ...lmsRoutes.map((route) => ({
        path: route.path,
        element: (
          <AdminPlaceholderPage
            title={route.title}
            description="Chức năng LMS đang được xây dựng."
          />
        ),
      })),
      {
        path: "content/components/footer",
        element: (
          <AdminPlaceholderPage
            title="Footer"
            description="Quản lý nội dung footer, liên kết nhanh, thông tin liên hệ và các khối hiển thị cuối trang."
          />
        ),
      },
      {
        path: "content/components/slider",
        element: (
          <AdminPlaceholderPage
            title="Slider"
            description="Quản lý slider, banner, hình ảnh, CTA và thứ tự hiển thị trên các trang public."
          />
        ),
      },
      {
        path: "content/components/navbar",
        element: (
          <AdminPlaceholderPage
            title="Navbar"
            description="Quản lý navbar, menu điều hướng, liên kết chính và trạng thái hiển thị."
          />
        ),
      },
      {
        path: "content/components/dropdown",
        element: (
          <AdminPlaceholderPage
            title="Dropdown"
            description="Quản lý dropdown, nhóm liên kết con và nội dung menu mở rộng trên website."
          />
        ),
      },
      {
        path: "finance",
        element: <Navigate to="/admin/finance/overview" replace />,
      },
      {
        path: "finance/tuition-policies",
        element: <BillingPolicyListPage />,
      },
      {
        path: "finance/tuition-policies/create",
        element: <BillingPolicyFormPage mode="create" />,
      },
      {
        path: "finance/tuition-policies/:recordId/view",
        element: <BillingPolicyViewPage />,
      },
      {
        path: "finance/tuition-policies/:recordId/edit",
        element: <BillingPolicyFormPage mode="edit" />,
      },
      {
        path: "finance/payment-plans",
        element: <PaymentPlanListPage />,
      },
      {
        path: "finance/payment-plans/create",
        element: <PaymentPlanFormPage mode="create" />,
      },
      {
        path: "finance/payment-plans/:recordId/view",
        element: <PaymentPlanViewPage />,
      },
      {
        path: "finance/payment-plans/:recordId/edit",
        element: <PaymentPlanFormPage mode="edit" />,
      },
      {
        path: "finance/discounts",
        element: <DiscountListPage />,
      },
      {
        path: "finance/discounts/create",
        element: <DiscountFormPage mode="create" />,
      },
      {
        path: "finance/discounts/:recordId/view",
        element: <DiscountViewPage />,
      },
      {
        path: "finance/discounts/:recordId/edit",
        element: <DiscountFormPage mode="edit" />,
      },
      ...financeRoutes.filter((route) => !["finance/tuition-policies", "finance/payment-plans", "finance/discounts"].includes(route.path)).map((route) => ({
        path: route.path,
        element: (
          <AdminPlaceholderPage
            description={route.description}
            title={route.title}
          />
        ),
      })),
      {
        path: "course-categories",
        element: <CourseCategoryListPage />,
      },
      {
        path: "course-categories/create",
        element: <CourseCategoryFormPage mode="create" />,
      },
      {
        path: "course-categories/:recordId/view",
        element: <CourseCategoryViewPage />,
      },
      {
        path: "course-categories/:recordId/edit",
        element: <CourseCategoryFormPage mode="edit" />,
      },
      {
        path: "courses",
        element: <CourseListPage />,
      },
      {
        path: "courses/create",
        element: <CourseFormPage mode="create" />,
      },
      {
        path: "courses/:recordId/edit",
        element: <CourseFormPage mode="edit" />,
      },
      {
        path: "courses/:recordId/view",
        element: <CourseViewPage />,
      },
      {
        path: "classes",
        element: <ClassListPage />,
      },
      {
        path: "classes/create",
        element: <ClassFormPage mode="create" />,
      },
      {
        path: "classes/:recordId/view",
        element: <ClassViewPage />,
      },
      {
        path: "classes/:recordId/edit",
        element: <ClassFormPage mode="edit" />,
      },
      {
        path: "rooms",
        element: <RoomListPage />,
      },
      {
        path: "rooms/create",
        element: <RoomFormPage mode="create" />,
      },
      {
        path: "rooms/:recordId/view",
        element: <RoomViewPage />,
      },
      {
        path: "rooms/:recordId/edit",
        element: <RoomFormPage mode="edit" />,
      },
      {
        path: "enrollments/:recordId/view",
        element: <EnrollmentDetailPage />,
      },
      {
        path: "enrollments/:recordId/payments/create",
        element: <PaymentCreatePage />,
      },
      {
        path: "teachers",
        element: <TeacherListPage />,
      },
      {
        path: "teachers/create",
        element: <TeacherFormPage mode="create" />,
      },
      {
        path: "teachers/:recordId/view",
        element: <TeacherViewPage />,
      },
      {
        path: "teachers/:recordId/edit",
        element: <TeacherFormPage mode="edit" />,
      },
      ...adminModuleRoutes.filter((route) => !["students", "courses", "classes", "teachers"].includes(route.path)).map((route) => ({
        path: route.path,
        element: (
          <AdminPlaceholderPage
            description={route.description}
            title={route.title}
          />
        ),
      })),
      {
        path: "settings",
        element: <Navigate to="/admin/settings/config" replace />,
      },
      {
        path: "settings/config",
        element: (
          <AdminPlaceholderPage
            title="Cấu Hình"
            description="Thiết lập cấu hình hệ thống, quy tắc vận hành và các tham số dùng chung."
          />
        ),
      },
      {
        path: "settings/permissions",
        element: (
          <AdminPlaceholderPage
            title="Phân Quyền"
            description="Quản lý vai trò, quyền truy cập và phạm vi thao tác trong hệ thống."
          />
        ),
      },
      {
        path: "settings/logs",
        element: (
          <AdminPlaceholderPage
            title="Nhật Ký Hệ Thống"
            description="Theo dõi lịch sử đăng nhập, thao tác quản trị và các thay đổi dữ liệu quan trọng."
          />
        ),
      },
      {
        path: "profile",
        element: <AdminProfilePage />,
      },
      {
        path: "profile/settings",
        element: <AdminSettingsPage />,
      },
      {
        path: "profile/change-password",
        element: <AdminChangePasswordPage />,
      },
    ],
  },
];
