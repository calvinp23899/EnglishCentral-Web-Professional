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
import { IeltsAudioAssetListPage } from "@/features/admin/practice-bank/ielts/assets/pages/IeltsAudioAssetListPage";
import { IeltsHubPage } from "@/features/admin/practice-bank/ielts/pages/IeltsHubPage";
import { IeltsListeningCreatePage } from "@/features/admin/practice-bank/ielts/reading/pages/IeltsListeningCreatePage";
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
    title: "Tá»•ng quan tÃ i chÃ­nh",
    description:
      "Theo dÃµi doanh thu, cÃ´ng ná»£, dÃ²ng tiá»n, hÃ³a Ä‘Æ¡n Ä‘áº¿n háº¡n vÃ  cÃ¡c chá»‰ sá»‘ tÃ i chÃ­nh chÃ­nh cá»§a trung tÃ¢m.",
  },
  {
    path: "finance/tuition-policies",
    title: "ChÃ­nh sÃ¡ch há»c phÃ­",
    description:
      "Quáº£n lÃ½ báº£ng há»c phÃ­, quy táº¯c Ã¡p dá»¥ng theo khÃ³a há»c, lá»›p há»c, ká»³ há»c vÃ  nhÃ³m há»c viÃªn.",
  },
  {
    path: "finance/payment-plans",
    title: "Káº¿ hoáº¡ch thanh toÃ¡n",
    description:
      "Thiáº¿t láº­p lá»‹ch thanh toÃ¡n, ká»³ háº¡n, nháº¯c háº¡n vÃ  tráº¡ng thÃ¡i thu tiá»n theo tá»«ng há»c viÃªn hoáº·c Ä‘Äƒng kÃ½ há»c.",
  },
  {
    path: "finance/invoices",
    title: "HÃ³a Ä‘Æ¡n",
    description:
      "Táº¡o, phÃ¡t hÃ nh, theo dÃµi vÃ  Ä‘á»‘i soÃ¡t hÃ³a Ä‘Æ¡n há»c phÃ­, dá»‹ch vá»¥ vÃ  cÃ¡c khoáº£n thu liÃªn quan.",
  },
  {
    path: "finance/payments",
    title: "Thanh toÃ¡n",
    description:
      "Ghi nháº­n giao dá»‹ch thanh toÃ¡n, phÆ°Æ¡ng thá»©c thu tiá»n, tráº¡ng thÃ¡i xá»­ lÃ½ vÃ  káº¿t quáº£ Ä‘á»‘i soÃ¡t.",
  },
  {
    path: "finance/receipts",
    title: "BiÃªn lai",
    description:
      "Quáº£n lÃ½ biÃªn lai thu tiá»n, lá»‹ch sá»­ phÃ¡t hÃ nh, thÃ´ng tin ngÆ°á»i ná»™p vÃ  chá»©ng tá»« liÃªn quan.",
  },
  {
    path: "finance/discounts",
    title: "Giáº£m giÃ¡",
    description:
      "Cáº¥u hÃ¬nh mÃ£ giáº£m giÃ¡, Æ°u Ä‘Ã£i há»c phÃ­, Ä‘iá»u kiá»‡n Ã¡p dá»¥ng vÃ  hiá»‡u lá»±c theo chÆ°Æ¡ng trÃ¬nh.",
  },
  {
    path: "finance/refunds",
    title: "HoÃ n tiá»n",
    description:
      "Theo dÃµi yÃªu cáº§u hoÃ n tiá»n, khoáº£n hoÃ n, lÃ½ do xá»­ lÃ½ vÃ  tráº¡ng thÃ¡i phÃª duyá»‡t.",
  },
  {
    path: "finance/credit-notes",
    title: "Phiáº¿u ghi cÃ³",
    description:
      "Quáº£n lÃ½ phiáº¿u ghi cÃ³, Ä‘iá»u chá»‰nh cÃ´ng ná»£, khoáº£n bÃ¹ trá»« vÃ  liÃªn káº¿t vá»›i hÃ³a Ä‘Æ¡n gá»‘c.",
  },
  {
    path: "finance/ledger",
    title: "Sá»• cÃ¡i",
    description:
      "Xem cÃ¡c bÃºt toÃ¡n, tÃ i khoáº£n, phÃ¡t sinh ná»£ cÃ³ vÃ  dá»¯ liá»‡u káº¿ toÃ¡n tá»•ng há»£p.",
  },
  {
    path: "finance/background-jobs",
    title: "TÃ¡c vá»¥ ná»n",
    description:
      "Theo dÃµi tÃ¡c vá»¥ tá»± Ä‘á»™ng nhÆ° nháº¯c thanh toÃ¡n, Ä‘á»“ng bá»™ giao dá»‹ch, phÃ¡t hÃ nh hÃ³a Ä‘Æ¡n vÃ  Ä‘á»‘i soÃ¡t Ä‘á»‹nh ká»³.",
  },
];

const lmsRoutes = [
  { path: "lms/programs", title: "ChÆ°Æ¡ng trÃ¬nh há»c" },
  { path: "lms/modules", title: "Module há»c" },
  { path: "lms/lessons", title: "BÃ i há»c" },
  { path: "lms/videos", title: "Video" },
  { path: "lms/documents", title: "TÃ i liá»‡u" },
  { path: "lms/exercises", title: "BÃ i táº­p" },
  { path: "lms/quizzes", title: "Quiz" },
  { path: "lms/progress", title: "Tiáº¿n Ä‘á»™ há»c táº­p" },
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
  { path: "hrm/attendance", title: "Cháº¥m CÃ´ng" },
  { path: "hrm/leave-requests", title: "Nghá»‰ PhÃ©p" },
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
            description="Quáº£n lÃ½ Ä‘á» IELTS Writing theo Task 1, Task 2, rubric vÃ  sample answers."
          />
        ),
      },
      {
        path: "practice-bank/ielts/listening",
        element: <IeltsReadingListPage skill="listening" />,
      },
      {
        path: "practice-bank/ielts/listening/create",
        element: <IeltsListeningCreatePage />,
      },
      {
        path: "practice-bank/ielts/listening/audio",
        element: <IeltsAudioAssetListPage />,
      },
      {
        path: "practice-bank/ielts/listening/:recordId/view",
        element: (
          <AdminPlaceholderPage
            title="Chi tiáº¿t Ä‘á» IELTS Listening"
            description="MÃ n hÃ¬nh chi tiáº¿t IELTS Listening sáº½ Ä‘Æ°á»£c triá»ƒn khai sau."
          />
        ),
      },
      {
        path: "practice-bank/ielts/listening/:recordId/edit",
        element: <IeltsListeningCreatePage />,
      },
      {
        path: "practice-bank/ielts/speaking",
        element: (
          <AdminPlaceholderPage
            title="IELTS Speaking"
            description="Quáº£n lÃ½ Ä‘á» IELTS Speaking theo part, cue card, rubric vÃ  sample answers."
          />
        ),
      },
      {
        path: "practice-bank/toeic",
        element: (
          <AdminPlaceholderPage
            title="TOEIC Practice Bank"
            description="Quáº£n lÃ½ ngÃ¢n hÃ ng bÃ i táº­p TOEIC theo part, bá»™ Ä‘á», cÃ¢u há»i vÃ  Ä‘Ã¡p Ã¡n."
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
            description="Chá»©c nÄƒng CRM / Sales Ä‘ang Ä‘Æ°á»£c xÃ¢y dá»±ng."
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
            description="Chá»©c nÄƒng Cost / Expense Ä‘ang Ä‘Æ°á»£c xÃ¢y dá»±ng."
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
            description="Chá»©c nÄƒng HRM Ä‘ang Ä‘Æ°á»£c xÃ¢y dá»±ng."
          />
        ),
      })),
      ...lmsRoutes.map((route) => ({
        path: route.path,
        element: (
          <AdminPlaceholderPage
            title={route.title}
            description="Chá»©c nÄƒng LMS Ä‘ang Ä‘Æ°á»£c xÃ¢y dá»±ng."
          />
        ),
      })),
      {
        path: "content/components/footer",
        element: (
          <AdminPlaceholderPage
            title="Footer"
            description="Quáº£n lÃ½ ná»™i dung footer, liÃªn káº¿t nhanh, thÃ´ng tin liÃªn há»‡ vÃ  cÃ¡c khá»‘i hiá»ƒn thá»‹ cuá»‘i trang."
          />
        ),
      },
      {
        path: "content/components/slider",
        element: (
          <AdminPlaceholderPage
            title="Slider"
            description="Quáº£n lÃ½ slider, banner, hÃ¬nh áº£nh, CTA vÃ  thá»© tá»± hiá»ƒn thá»‹ trÃªn cÃ¡c trang public."
          />
        ),
      },
      {
        path: "content/components/navbar",
        element: (
          <AdminPlaceholderPage
            title="Navbar"
            description="Quáº£n lÃ½ navbar, menu Ä‘iá»u hÆ°á»›ng, liÃªn káº¿t chÃ­nh vÃ  tráº¡ng thÃ¡i hiá»ƒn thá»‹."
          />
        ),
      },
      {
        path: "content/components/dropdown",
        element: (
          <AdminPlaceholderPage
            title="Dropdown"
            description="Quáº£n lÃ½ dropdown, nhÃ³m liÃªn káº¿t con vÃ  ná»™i dung menu má»Ÿ rá»™ng trÃªn website."
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
            title="Cáº¥u HÃ¬nh"
            description="Thiáº¿t láº­p cáº¥u hÃ¬nh há»‡ thá»‘ng, quy táº¯c váº­n hÃ nh vÃ  cÃ¡c tham sá»‘ dÃ¹ng chung."
          />
        ),
      },
      {
        path: "settings/permissions",
        element: (
          <AdminPlaceholderPage
            title="PhÃ¢n Quyá»n"
            description="Quáº£n lÃ½ vai trÃ², quyá»n truy cáº­p vÃ  pháº¡m vi thao tÃ¡c trong há»‡ thá»‘ng."
          />
        ),
      },
      {
        path: "settings/logs",
        element: (
          <AdminPlaceholderPage
            title="Nháº­t KÃ½ Há»‡ Thá»‘ng"
            description="Theo dÃµi lá»‹ch sá»­ Ä‘Äƒng nháº­p, thao tÃ¡c quáº£n trá»‹ vÃ  cÃ¡c thay Ä‘á»•i dá»¯ liá»‡u quan trá»ng."
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


