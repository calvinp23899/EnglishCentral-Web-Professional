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
  const shouldStartFullscreen =
    location.pathname.includes("/practice/") &&
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
      location.pathname.includes("/practice/") &&
      new URLSearchParams(location.search).get("mode") === "real";

    setPublicChromeVisible(!isRealExamRoute);
  }, [location.pathname, location.search]);

  return (
    <div className={styles.layout}>
      {isPublicChromeVisible && <PublicHeader />}

      <main className={styles.main}>
        <Outlet context={outletContext} />
      </main>

      {isPublicChromeVisible && <PublicFooter />}
    </div>
  );
}
