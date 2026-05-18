import { useEffect, useMemo, useState } from "react";
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
  const outletContext = useMemo<PublicLayoutOutletContext>(
    () => ({ setPublicChromeVisible }),
    []
  );

  useEffect(() => {
    const isRealExamRoute =
      isPracticeDetailRoute &&
      new URLSearchParams(location.search).get("mode") === "real";

    setPublicChromeVisible(!isRealExamRoute);
  }, [isPracticeDetailRoute, location.search]);

  const shouldShowPublicFooter =
    isPublicChromeVisible && !isPracticeDetailRoute;

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
    </div>
  );
}
