import styles from "./AdminPageHeader.module.scss";

type Props = {
  description?: string;
  eyebrow?: string;
  title: string;
};

export function AdminPageHeader({ description, eyebrow, title }: Props) {
  return (
    <header className={styles.header}>
      {eyebrow && <span>{eyebrow}</span>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}
