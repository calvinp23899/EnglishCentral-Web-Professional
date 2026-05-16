import { Outlet } from "react-router-dom";

import { PublicFooter } from "@/components/public-common/public-footer/PublicFooter";
import { PublicHeader } from "@/components/public-common/public-header/PublicHeader";

import styles from "./PublicLayout.module.scss";

export function PublicLayout() {
  return (
    <div className={styles.layout}>
      <PublicHeader />

      <main className={styles.main}>
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}