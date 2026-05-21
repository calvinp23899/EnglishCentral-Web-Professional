import { AdminLayout } from "@/app/layouts/admin-layout/AdminLayout";
import { AdminLoginPage } from "@/features/admin/auth/pages/AdminLoginPage/AdminLoginPage";
import { AdminDashboardPage } from "@/features/admin/dashboard/pages/AdminDashboardPage";
import { AdminProfilePage } from "@/features/admin/profile/pages/AdminProfilePage";
import { AdminSettingsPage } from "@/features/admin/settings/pages/AdminSettingsPage";
import { AdminPlaceholderPage } from "@/features/admin/shared/pages/AdminPlaceholderPage";

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
      ...adminModuleRoutes.map((route) => ({
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
