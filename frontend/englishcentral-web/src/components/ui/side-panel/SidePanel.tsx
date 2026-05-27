import type { ReactNode } from "react";
import { X } from "lucide-react";

import styles from "./SidePanel.module.scss";

type Props = {
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  isOpen: boolean;
  title: string;
  width?: "md" | "lg";
  onClose: () => void;
};

export function SidePanel({
  children,
  description,
  footer,
  isOpen,
  title,
  width = "md",
  onClose,
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="presentation">
      <aside
        aria-label={title}
        className={`${styles.panel} ${styles[width]}`}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.header}>
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </aside>
    </div>
  );
}
