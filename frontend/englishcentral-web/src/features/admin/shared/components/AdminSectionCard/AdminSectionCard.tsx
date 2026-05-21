import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./AdminSectionCard.module.scss";

type Props = {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
};

export function AdminSectionCard({ children, icon: Icon, title }: Props) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <span>
          <Icon aria-hidden="true" size={20} strokeWidth={2.2} />
        </span>
        <h2>{title}</h2>
      </div>

      {children}
    </section>
  );
}
