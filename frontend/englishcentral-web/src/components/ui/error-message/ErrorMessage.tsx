import styles from "./ErrorMessage.module.scss";

type Props = {
  id?: string;
  message?: string;
};

export function ErrorMessage({ id, message }: Props) {
  if (!message) {
    return null;
  }

  return (
    <p className={styles.message} id={id} role="alert">
      {message}
    </p>
  );
}
