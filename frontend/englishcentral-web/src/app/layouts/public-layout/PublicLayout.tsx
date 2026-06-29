import { useEffect, useMemo, useState } from "react";
import { ArrowUp, Phone } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

import { PublicFooter } from "@/components/public-common/public-footer/PublicFooter";
import { PublicHeader } from "@/components/public-common/public-header/PublicHeader";

import styles from "./PublicLayout.module.scss";

export type PublicLayoutOutletContext = {
  setPublicChromeVisible: (visible: boolean) => void;
};

export function PublicLayout() {
  const location = useLocation();
  const isPracticeDetailRoute = /^\/practice\/[^/]+\/[^/]+/.test(
    location.pathname
  );
  const shouldStartFullscreen =
    isPracticeDetailRoute &&
    new URLSearchParams(location.search).get("mode") === "real";
  const [isPublicChromeVisible, setPublicChromeVisible] = useState(
    !shouldStartFullscreen
  );
  const [showBackToTop, setShowBackToTop] = useState(false);
  const outletContext = useMemo<PublicLayoutOutletContext>(
    () => ({ setPublicChromeVisible }),
    []
  );

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 420);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldShowPublicFooter =
    isPublicChromeVisible && !isPracticeDetailRoute;
  const shouldShowFloatingContact =
    isPublicChromeVisible && !isPracticeDetailRoute;
  const scrollToTop = () => {
    const startY = window.scrollY;
    const duration = 650;
    const startTime = window.performance.now();

    const easeOutCubic = (progress: number) =>
      1 - Math.pow(1 - progress, 3);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const nextY = startY * (1 - easeOutCubic(progress));

      window.scrollTo(0, nextY);

      if (progress < 1) {
        window.requestAnimationFrame(animate);
      }
    };

    window.requestAnimationFrame(animate);
  };

  return (
    <div
      className={`${styles.layout} ${
        isPracticeDetailRoute ? styles.practiceDetailLayout : ""
      }`}
    >
      {isPublicChromeVisible && <PublicHeader />}

      <main className={styles.main}>
        <Outlet context={outletContext} />
      </main>

      {shouldShowPublicFooter && <PublicFooter />}

      {shouldShowFloatingContact && (
        <div className={styles.floatingContact} aria-label="Kênh liên hệ nhanh">
          <a
            className={styles.zaloButton}
            href="https://zalo.me/099999999"
            rel="noreferrer"
            target="_blank"
            aria-label="Liên hệ qua Zalo"
          >
            <span>Zalo</span>
          </a>

          <a
            className={styles.phoneButton}
            href="tel:099999999"
            aria-label="Gọi hotline 099999999"
          >
            <span className={styles.phoneIcon}>
              <Phone aria-hidden="true" />
            </span>
            <strong>099999999</strong>
          </a>
        </div>
      )}

      {isPublicChromeVisible && showBackToTop && (
        <button
          className={styles.backToTop}
          type="button"
          aria-label="Quay lại đầu trang"
          onClick={scrollToTop}
        >
          <ArrowUp aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
