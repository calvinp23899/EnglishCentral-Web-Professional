import styles from "./Card.module.scss";

type Props = {
  children: React.ReactNode;
};

export function Card({ children }: Props) {
  return (
    <div className={styles.card}>
      {children}
    </div>
  );
}