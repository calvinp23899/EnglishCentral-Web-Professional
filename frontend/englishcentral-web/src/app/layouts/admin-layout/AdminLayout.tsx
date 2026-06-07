import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MessageSquareText,
  PanelLeft,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  SquareStack,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import styles from "./AdminLayout.module.scss";

type NavigationItem = {
  children?: NavigationChild[];
  icon: LucideIcon;
  label: string;
  path: string;
};

type NavigationChild =
  | {
      label: string;
      path: string;
      type?: "item";
    }
  | {
      label: string;
      type: "section";
    };

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  {
    label: "Quản Lý Đào Tạo",
    path: "/admin/training",
    icon: GraduationCap,
    children: [
      { label: "Học viên", path: "/admin/students" },
      { label: "Nhân Viên", path: "/admin/teachers" },
      { label: "Phòng Học", path: "/admin/rooms" },
      { label: "Danh Mục Khóa Học", path: "/admin/course-categories" },
      { label: "Khóa học", path: "/admin/courses" },
      { label: "Lớp học", path: "/admin/classes" },
    ],
  },
  {
    label: "Lớp của tôi",
    path: "/admin/my-classes",
    icon: CalendarDays,
    children: [
      { label: "Danh Sách Lớp", path: "/admin/my-classes" },
      { label: "Lịch Học", path: "/admin/my-classes/schedule" },
    ],
  },
  {
    label: "LMS",
    path: "/admin/lms",
    icon: SquareStack,
    children: [
      { label: "Chương trình học", path: "/admin/lms/programs" },
      { label: "Module học", path: "/admin/lms/modules" },
      { label: "Bài học", path: "/admin/lms/lessons" },
      { label: "Video", path: "/admin/lms/videos" },
      { label: "Tài liệu", path: "/admin/lms/documents" },
      { label: "Bài tập", path: "/admin/lms/exercises" },
      { label: "Quiz", path: "/admin/lms/quizzes" },
      { label: "Tiến độ học tập", path: "/admin/lms/progress" },
    ],
  },
  {
    label: "Ngân hàng bài tập",
    path: "/admin/practice-bank",
    icon: BookOpen,
    children: [
      { label: "Mẫu Đề Kiểm Tra", path: "/admin/exams" },
      { label: "IELTS", path: "/admin/practice-bank/ielts" },
      { label: "TOEIC", path: "/admin/practice-bank/toeic" },
    ],
  },
  {
    label: "Nội Dung Quản Lý",
    path: "/admin/content",
    icon: ScrollText,
    children: [
      { label: "Components", type: "section" },
      { label: "Footer", path: "/admin/content/components/footer" },
      { label: "Slider", path: "/admin/content/components/slider" },
      { label: "Navbar", path: "/admin/content/components/navbar" },
      { label: "Dropdown", path: "/admin/content/components/dropdown" },
    ],
  },
  {
    label: "Quản Lý Tài Chính",
    path: "/admin/finance",
    icon: WalletCards,
    children: [
      { label: "Tổng quan", path: "/admin/finance/overview" },
      { label: "Chính sách học phí", path: "/admin/finance/tuition-policies" },
      { label: "Kế hoạch thanh toán", path: "/admin/finance/payment-plans" },
      { label: "Hóa đơn", path: "/admin/finance/invoices" },
      { label: "Thanh toán", path: "/admin/finance/payments" },
      { label: "Biên lai", path: "/admin/finance/receipts" },
      { label: "Giảm giá", path: "/admin/finance/discounts" },
      { label: "Hoàn tiền", path: "/admin/finance/refunds" },
      { label: "Phiếu ghi có", path: "/admin/finance/credit-notes" },
      { label: "Sổ cái", path: "/admin/finance/ledger" },
      { label: "Tác vụ nền", path: "/admin/finance/background-jobs" },
    ],
  },
  {
    label: "CRM / Sales",
    path: "/admin/crm-sales",
    icon: UsersRound,
    children: [
      { label: "Lead", path: "/admin/crm-sales/leads" },
      { label: "LeadSource", path: "/admin/crm-sales/lead-sources" },
      { label: "LeadActivity", path: "/admin/crm-sales/lead-activities" },
      { label: "LeadConversion", path: "/admin/crm-sales/lead-conversions" },
    ],
  },
  {
    label: "Cost / Expense",
    path: "/admin/cost-expense",
    icon: ReceiptText,
    children: [
      { label: "TeacherSessionPayroll", path: "/admin/cost-expense/teacher-session-payrolls" },
      { label: "ClassExpense", path: "/admin/cost-expense/class-expenses" },
      { label: "MarketingCampaign", path: "/admin/cost-expense/marketing-campaigns" },
      { label: "MarketingCost", path: "/admin/cost-expense/marketing-costs" },
    ],
  },
  {
    label: "HRM",
    path: "/admin/hrm",
    icon: UserRound,
    children: [
      { label: "Chấm Công", path: "/admin/hrm/attendance" },
      { label: "Nghỉ Phép", path: "/admin/hrm/leave-requests" },
    ],
  },
  { label: "Báo cáo", path: "/admin/reports", icon: BarChart3 },
  { label: "Tin nhắn", path: "/admin/messages", icon: MessageSquareText },
];

const breadcrumbLabels: Record<string, string> = {
  "course-categories": "Danh Mục Khóa Học",
  admin: "Dashboard",
  classes: "Lớp học",
  components: "Components",
  config: "Cấu Hình",
  content: "Nội Dung Quản Lý",
  "cost-expense": "Cost / Expense",
  courses: "Khóa học",
  "change-password": "Đổi mật khẩu",
  dropdown: "Dropdown",
  footer: "Footer",
  finance: "Quản Lý Tài Chính",
  "background-jobs": "Tác vụ nền",
  "credit-notes": "Phiếu ghi có",
  "class-expenses": "ClassExpense",
  "crm-sales": "CRM / Sales",
  discounts: "Giảm giá",
  logs: "Nhật Ký Hệ Thống",
  invoices: "Hóa đơn",
  ledger: "Sổ cái",
  lessons: "Bài học",
  lms: "LMS",
  messages: "Tin nhắn",
  modules: "Module học",
  "my-classes": "Lớp của tôi",
  navbar: "Navbar",
  overview: "Tổng quan",
  payments: "Thanh toán",
  "payment-plans": "Kế hoạch thanh toán",
  ielts: "IELTS",
  "lead-activities": "LeadActivity",
  "lead-conversions": "LeadConversion",
  "lead-sources": "LeadSource",
  leads: "Lead",
  "leave-requests": "Nghỉ Phép",
  permissions: "Phân Quyền",
  "practice-bank": "Ngân hàng bài tập",
  profile: "Hồ sơ",
  programs: "Chương trình học",
  progress: "Tiến độ học tập",
  quizzes: "Quiz",
  receipts: "Biên lai",
  reports: "Báo cáo",
  refunds: "Hoàn tiền",
  rooms: "Phòng Học",
  schedule: "Lịch",
  settings: "Cài đặt",
  slider: "Slider",
  students: "Học viên",
  teachers: "Nhân Viên",
  "teacher-session-payrolls": "TeacherSessionPayroll",
  "marketing-campaigns": "MarketingCampaign",
  "marketing-costs": "MarketingCost",
  hrm: "HRM",
  attendance: "Chấm Công",
  "tuition-policies": "Chính sách học phí",
  toeic: "TOEIC",
  videos: "Video",
  documents: "Tài liệu",
  exams: "Mẫu Đề Kiểm Tra",
  exercises: "Bài tập",
};

const getBreadcrumbItems = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const visibleSegments = segments
    .map((segment, index) => ({ originalIndex: index, segment }))
    .filter((item) => {
      const { originalIndex, segment } = item;
      const previousSegment = segments[originalIndex - 1];
      const nextSegment = segments[originalIndex + 1];
      const isNumericSegment = /^\d+$/.test(segment);

      return !isNumericSegment && !(previousSegment === "students" && nextSegment === "edit");
    });

  return visibleSegments.map(({ originalIndex, segment }) => {
    const href = `/${segments.slice(0, originalIndex + 1).join("/")}`;

    return {
      href,
      label: breadcrumbLabels[segment] ?? segment,
    };
  });
};

export function AdminLayout() {
  const location = useLocation();
  const breadcrumbItems = getBreadcrumbItems(location.pathname);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [openNavGroups, setOpenNavGroups] = useState<Record<string, boolean>>({});
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const isSettingsActive = location.pathname.startsWith("/admin/settings");
  const isSettingsOpen = openNavGroups["/admin/settings"] ?? isSettingsActive;

  useEffect(() => {
    if (!isProfileMenuOpen && !isSettingsOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }

      if (!settingsMenuRef.current?.contains(event.target as Node)) {
        setOpenNavGroups((currentGroups) => ({
          ...currentGroups,
          "/admin/settings": false,
        }));
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setOpenNavGroups((currentGroups) => ({
          ...currentGroups,
          "/admin/settings": false,
        }));
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileMenuOpen, isSettingsOpen]);

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>EC</div>
          <div>
            <strong>English Central</strong>
            <span>Management</span>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Admin navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isGroupActive =
              location.pathname.startsWith(item.path) ||
              item.children?.some(
                (child) => child.type !== "section" && location.pathname.startsWith(child.path),
              ) === true;
            const isGroupOpen = openNavGroups[item.path] ?? isGroupActive;

            return (
              <div className={styles.navGroup} key={item.path}>
                {item.children ? (
                  <button
                    className={`${styles.navItem} ${isGroupActive ? styles.active : ""}`.trim()}
                    type="button"
                    aria-expanded={isGroupOpen}
                    onClick={() =>
                      setOpenNavGroups((currentGroups) => ({
                        ...currentGroups,
                        [item.path]: !isGroupOpen,
                      }))
                    }
                  >
                    <Icon aria-hidden="true" size={18} />
                    <span>{item.label}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={styles.navToggleIcon}
                      size={15}
                    />
                  </button>
                ) : (
                  <NavLink
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.active : ""}`.trim()
                    }
                    end={item.path === "/admin"}
                    to={item.path}
                  >
                    <Icon aria-hidden="true" size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                )}

                {item.children && isGroupOpen && (
                  <div className={styles.subNav}>
                    {item.children.map((child) =>
                      child.type === "section" ? (
                        <span className={styles.subNavSection} key={child.label}>
                          {child.label}
                        </span>
                      ) : (
                        <NavLink
                          className={({ isActive }) =>
                            `${styles.subNavItem} ${isActive ? styles.subActive : ""}`.trim()
                          }
                          key={child.path}
                          to={child.path}
                        >
                          {child.label}
                        </NavLink>
                      ),
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <nav className={styles.bottomNav} aria-label="Admin settings">
          <div className={styles.settingsMenu} ref={settingsMenuRef}>
          <button
            className={`${styles.navItem} ${isSettingsActive ? styles.active : ""}`.trim()}
            type="button"
            aria-expanded={isSettingsOpen}
            onClick={() =>
              setOpenNavGroups((currentGroups) => ({
                ...currentGroups,
                "/admin/settings": !isSettingsOpen,
              }))
            }
          >
            <Settings aria-hidden="true" size={18} />
            <span>Cài đặt</span>
            <ChevronDown
              aria-hidden="true"
              className={styles.navToggleIcon}
              size={15}
            />
          </button>

          {isSettingsOpen && (
            <div className={styles.settingsDropdown} role="menu">
              <NavLink
                className={({ isActive }) =>
                  `${isActive ? styles.dropdownActive : ""}`.trim()
                }
                role="menuitem"
                to="/admin/settings/permissions"
                onClick={() =>
                  setOpenNavGroups((currentGroups) => ({
                    ...currentGroups,
                    "/admin/settings": false,
                  }))
                }
              >
                <ShieldCheck aria-hidden="true" size={16} />
                Phân Quyền
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `${isActive ? styles.dropdownActive : ""}`.trim()
                }
                role="menuitem"
                to="/admin/settings/config"
                onClick={() =>
                  setOpenNavGroups((currentGroups) => ({
                    ...currentGroups,
                    "/admin/settings": false,
                  }))
                }
              >
                <SlidersHorizontal aria-hidden="true" size={16} />
                Cấu Hình
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `${isActive ? styles.dropdownActive : ""}`.trim()
                }
                role="menuitem"
                to="/admin/settings/logs"
                onClick={() =>
                  setOpenNavGroups((currentGroups) => ({
                    ...currentGroups,
                    "/admin/settings": false,
                  }))
                }
              >
                <ScrollText aria-hidden="true" size={16} />
                Nhật Ký Hệ Thống
              </NavLink>
            </div>
          )}
          </div>
        </nav>
      </aside>

      <div className={styles.shell}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} type="button" aria-label="Open menu">
            <PanelLeft aria-hidden="true" size={20} />
          </button>

          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            {breadcrumbItems.map((item, index) => {
              const isCurrent = index === breadcrumbItems.length - 1;

              return (
                <span key={item.href}>
                  {isCurrent ? (
                    <strong>{item.label}</strong>
                  ) : (
                    <Link to={item.href}>{item.label}</Link>
                  )}
                </span>
              );
            })}
          </nav>

          <div className={styles.topbarActions}>
            <button type="button" aria-label="Notifications">
              <Bell aria-hidden="true" size={19} />
            </button>

            <div className={styles.profileMenu} ref={profileMenuRef}>
              <button
                className={styles.profile}
                type="button"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                onClick={() => setProfileMenuOpen((current) => !current)}
              >
                <span>AD</span>
                <div>
                  <strong>Admin</strong>
                </div>
                <ChevronDown aria-hidden="true" size={15} />
              </button>

              {isProfileMenuOpen && (
                <div className={styles.profileDropdown} role="menu">
                  <Link role="menuitem" to="/admin/profile">
                    <UserRound aria-hidden="true" size={16} />
                    Hồ sơ
                  </Link>
                  <Link role="menuitem" to="/admin/profile/settings">
                    <Settings aria-hidden="true" size={16} />
                    Cài đặt
                  </Link>
                  <Link role="menuitem" to="/admin/profile/change-password">
                    <LockKeyhole aria-hidden="true" size={16} />
                    Đổi mật khẩu
                  </Link>
                  <Link
                    className={styles.logoutItem}
                    role="menuitem"
                    to="/admin/login"
                  >
                    <LogOut aria-hidden="true" size={16} />
                    Đăng xuất
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
