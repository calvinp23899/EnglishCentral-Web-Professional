import styles from "./Card.module.scss";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: Props) {
  return (
    <div className={`${styles.card} ${className || ""}`.trim()}>
      {children}
    </div>
  );
}