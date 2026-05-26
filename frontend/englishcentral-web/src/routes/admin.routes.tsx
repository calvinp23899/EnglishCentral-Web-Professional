import { Navigate } from "react-router-dom";

import { AdminLayout } from "@/app/layouts/admin-layout/AdminLayout";
import { AdminLoginPage } from "@/features/admin/auth/pages/AdminLoginPage/AdminLoginPage";
import { ClassFormPage } from "@/features/admin/classes/pages/ClassFormPage";
import { ClassListPage } from "@/features/admin/classes/pages/ClassListPage";
import { ClassViewPage } from "@/features/admin/classes/pages/ClassViewPage";
import { CourseFormPage } from "@/features/admin/courses/pages/CourseFormPage";
import { CourseListPage } from "@/features/admin/courses/pages/CourseListPage";
import { AdminDashboardPage } from "@/features/admin/dashboard/pages/AdminDashboardPage";
import { AdminProfilePage } from "@/features/admin/profile/pages/AdminProfilePage";
import { IeltsHubPage } from "@/features/admin/practice-bank/ielts/pages/IeltsHubPage";
import { IeltsReadingCreatePage } from "@/features/admin/practice-bank/ielts/reading/pages/IeltsReadingCreatePage";
import { IeltsReadingListPage } from "@/features/admin/practice-bank/ielts/reading/pages/IeltsReadingListPage";
import { IeltsReadingViewPage } from "@/features/admin/practice-bank/ielts/reading/pages/IeltsReadingViewPage";
import { AdminSchedulePage } from "@/features/admin/schedule/pages/AdminSchedulePage";
import { AdminSettingsPage } from "@/features/admin/settings/pages/AdminSettingsPage";
import { AdminPlaceholderPage } from "@/features/admin/shared/pages/AdminPlaceholderPage";
import { StudentCreatePage } from "@/features/admin/students/pages/StudentCreatePage";
import { StudentEditPage } from "@/features/admin/students/pages/StudentEditPage";
import { StudentListPage } from "@/features/admin/students/pages/StudentListPage";
import { TeacherFormPage } from "@/features/admin/teachers/pages/TeacherFormPage";
import { TeacherListPage } from "@/features/admin/teachers/pages/TeacherListPage";
import { TeacherViewPage } from "@/features/admin/teachers/pages/TeacherViewPage";

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

export const adminRoutes = [
  {
    path: "/admin/login",

    element: <AdminLoginPage />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
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
        path: "schedule",
        element: <AdminSchedulePage />,
      },
      {
        path: "practice-bank",
        element: <Navigate to="/admin/practice-bank/ielts" replace />,
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
    ],
  },
];
