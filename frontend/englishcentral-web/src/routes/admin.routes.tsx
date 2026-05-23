import { AdminLayout } from "@/app/layouts/admin-layout/AdminLayout";
import { AdminLoginPage } from "@/features/admin/auth/pages/AdminLoginPage/AdminLoginPage";
import { ClassFormPage } from "@/features/admin/classes/pages/ClassFormPage";
import { ClassListPage } from "@/features/admin/classes/pages/ClassListPage";
import { CourseFormPage } from "@/features/admin/courses/pages/CourseFormPage";
import { CourseListPage } from "@/features/admin/courses/pages/CourseListPage";
import { AdminDashboardPage } from "@/features/admin/dashboard/pages/AdminDashboardPage";
import { AdminProfilePage } from "@/features/admin/profile/pages/AdminProfilePage";
import { AdminSchedulePage } from "@/features/admin/schedule/pages/AdminSchedulePage";
import { AdminSettingsPage } from "@/features/admin/settings/pages/AdminSettingsPage";
import { AdminPlaceholderPage } from "@/features/admin/shared/pages/AdminPlaceholderPage";
import { StudentCreatePage } from "@/features/admin/students/pages/StudentCreatePage";
import { StudentEditPage } from "@/features/admin/students/pages/StudentEditPage";
import { StudentListPage } from "@/features/admin/students/pages/StudentListPage";
import { TeacherFormPage } from "@/features/admin/teachers/pages/TeacherFormPage";
import { TeacherListPage } from "@/features/admin/teachers/pages/TeacherListPage";

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
    path: "practice-bank",
    title: "Practice Bank",
    description:
      "Organize IELTS, TOEIC, listening, reading, writing, and speaking practice content in one library.",
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
        path: "practice-bank/ielts",
        element: (
          <AdminPlaceholderPage
            title="IELTS Practice Bank"
            description="Quản lý ngân hàng bài tập IELTS theo kỹ năng, bộ đề, câu hỏi và đáp án."
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
        element: <AdminSettingsPage />,
      },
      {
        path: "profile",
        element: <AdminProfilePage />,
      },
    ],
  },
];
