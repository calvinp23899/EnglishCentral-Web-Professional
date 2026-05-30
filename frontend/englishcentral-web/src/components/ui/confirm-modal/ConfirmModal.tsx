import { AlertTriangle, X } from "lucide-react";

import styles from "./ConfirmModal.module.scss";

type Props = {
  cancelText?: string;
  confirmText?: string;
  description: string;
  isConfirmDisabled?: boolean;
  isOpen: boolean;
  title: string;
  tone?: "danger" | "primary";
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  cancelText = "Hủy",
  confirmText = "Xác nhận",
  description,
  isConfirmDisabled = false,
  isOpen,
  title,
  tone = "danger",
  onCancel,
  onConfirm,
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={isConfirmDisabled ? undefined : onCancel}
    >
      <section
        aria-modal="true"
        className={styles.modal}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          type="button"
          aria-label="Đóng"
          disabled={isConfirmDisabled}
          onClick={onCancel}
        >
          <X aria-hidden="true" size={18} />
        </button>

        <div className={`${styles.icon} ${styles[tone]}`}>
          <AlertTriangle aria-hidden="true" size={22} />
        </div>

        <div className={styles.content}>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            type="button"
            disabled={isConfirmDisabled}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`${styles.confirmButton} ${styles[tone]}`}
            type="button"
            disabled={isConfirmDisabled}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}
