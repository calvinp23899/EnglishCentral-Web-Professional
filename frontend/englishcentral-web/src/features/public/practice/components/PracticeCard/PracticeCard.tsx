import { useState } from "react";
import { Button } from "@/components/ui";

import styles from "./PracticeCard.module.scss";
import type { PublicPractice } from "../../data/mockPractice";
import { PracticeModeModal } from "../PracticeModeModal/PracticeModeModal";

type PracticeCardProps = {
  practice: PublicPractice;
};

export function PracticeCard({ practice }: PracticeCardProps) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <article className={styles.card}>
        <div
          className={`${styles.badge} ${
            practice.status === "completed"
              ? styles.completed
              : styles.inProgress
          }`}
        >
          {practice.status === "completed" ? "Đã hoàn thành" : "Chưa hoàn thành"}
        </div>

        <h3>{practice.title}</h3>
        <p>{practice.description}</p>

        <ul>
          {practice.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className={styles.meta}>
          <span>{practice.duration}</span>
        </div>

        <Button fullWidth onClick={() => setOpenModal(true)}>
          Luyện tập
        </Button>
      </article>

      {openModal && (
        <PracticeModeModal
          practice={practice}
          onClose={() => setOpenModal(false)}
        />
      )}
    </>
  );
}