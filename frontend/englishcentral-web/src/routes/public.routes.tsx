import { PublicLayout } from "@/app/layouts/public-layout/PublicLayout";
import { HomePage } from "@/features/public/home/pages/HomePage";
import { CoursesPage } from "@/features/public/courses/pages/CoursesPage";
import { CourseDetailPage } from "@/features/public/courses/pages/CourseDetailPage";
import { ContactPage } from "@/features/public/contact/pages/ContactPage";
import { NewsPage } from "@/features/public/news/pages/NewsPage";
import { NewsDetailPage } from "@/features/public/news/pages/NewsDetailPage";
import { LoginPage } from "@/features/public/auth/pages/LoginPage";
import { RegisterPage } from "@/features/public/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "@/features/public/auth/pages/ForgotPasswordPage";
import { PracticePage } from "@/features/public/practice/pages/PracticePage";
import { PracticeDetailPage } from "@/features/public/practice/pages/PracticeDetailPage";
import { UserProfilePage } from "@/features/public/profile/pages/UserProfilePage";
import { PracticeHistoryPage } from "@/features/public/profile/pages/PracticeHistoryPage";

import { NotFoundPage } from "@/pages/not-found/NotFoundPage";

export const publicRoutes = {
  path: "/",
  element: <PublicLayout />,
  children: [
    {
      index: true,
      element: <HomePage />,
    },
    {
      path: "/courses",
      element: <CoursesPage />,
    },
    {
      path: "/courses/:category/:slug",
      element: <CourseDetailPage />,
    },
    {
      path: "/practice",
      element: <PracticePage />,
    },
    {
      path: "/profile",
      element: <UserProfilePage />,
    },
    {
      path: "/practice-history",
      element: <PracticeHistoryPage />,
    },
    {
      path: "/contact",
      element: <ContactPage />,
    },
    {
      path: "news",
      element: <NewsPage />,
    },
    {
      path: "news/:slug",
      element: <NewsDetailPage />,
    },
    {
      path: "login",
      element: <LoginPage />,
    },
    {
      path: "register",
      element: <RegisterPage />,
    },
    {
      path: "forgot-password",
      element: <ForgotPasswordPage />,
    },
    {
      path: "/practice/:category/:slug",
      element: <PracticeDetailPage />,
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ],
};
