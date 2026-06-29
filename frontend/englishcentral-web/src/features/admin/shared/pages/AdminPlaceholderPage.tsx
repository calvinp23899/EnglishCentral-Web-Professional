import { ArrowRight, Construction } from "lucide-react";

import styles from "./AdminPlaceholderPage.module.scss";

type Props = {
  description: string;
  title: string;
};

export function AdminPlaceholderPage({ description, title }: Props) {
  return (
    <section className={styles.page}>
      <div className={styles.icon}>
        <Construction aria-hidden="true" size={24} />
      </div>
      <div>
        <span>Admin module</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <button type="button">
        Plan module
        <ArrowRight aria-hidden="true" size={16} />
      </button>
    </section>
  );
}
