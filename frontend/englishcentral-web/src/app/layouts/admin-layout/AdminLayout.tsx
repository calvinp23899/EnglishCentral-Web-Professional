import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  LockKeyhole,
  LogOut,
  MessageSquareText,
  PanelLeft,
  Settings,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import styles from "./AdminLayout.module.scss";

const navigationItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Học viên", path: "/admin/students", icon: UsersRound },
  { label: "Khóa học", path: "/admin/courses", icon: LibraryBig },
  { label: "Lớp học", path: "/admin/classes", icon: CalendarDays },
  { label: "Giáo viên", path: "/admin/teachers", icon: GraduationCap },
  { label: "Ngân hàng bài tập", path: "/admin/practice-bank", icon: BookOpen },
  { label: "Báo cáo", path: "/admin/reports", icon: BarChart3 },
  { label: "Tin nhắn", path: "/admin/messages", icon: MessageSquareText },
];

const breadcrumbLabels: Record<string, string> = {
  admin: "Dashboard",
  classes: "Lớp học",
  courses: "Khóa học",
  messages: "Tin nhắn",
  "practice-bank": "Ngân hàng bài tập",
  profile: "Hồ sơ",
  reports: "Báo cáo",
  settings: "Cài đặt",
  students: "Học viên",
  teachers: "Giáo viên",
};

const getBreadcrumbItems = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;

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
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileMenuOpen]);

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

            return (
              <NavLink
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ""}`.trim()
                }
                end={item.path === "/admin"}
                key={item.path}
                to={item.path}
              >
                <Icon aria-hidden="true" size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <nav className={styles.bottomNav} aria-label="Admin settings">
          <NavLink
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`.trim()
            }
            to="/admin/settings"
          >
            <Settings aria-hidden="true" size={18} />
            <span>Cài đặt</span>
          </NavLink>
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
                  <Link role="menuitem" to="/admin/settings">
                    <Settings aria-hidden="true" size={16} />
                    Cài đặt
                  </Link>
                  <button type="button" role="menuitem">
                    <LockKeyhole aria-hidden="true" size={16} />
                    Đổi mật khẩu
                  </button>
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
