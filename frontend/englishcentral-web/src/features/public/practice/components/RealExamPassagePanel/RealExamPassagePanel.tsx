import type {
  AnswerMap,
  IELTSReadingPassage,
  IELTSReadingQuestion,
} from "../../types/practice-test.type";
import styles from "../../pages/PracticeDetailPage.module.scss";

type RealExamPassagePanelProps = {
  passage: IELTSReadingPassage;
  answers: AnswerMap;
  onAnswer: (questionId: string, value: string) => void;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
};

type HeadingDropTarget = {
  answerId: string;
  displayLabel: string;
  question?: IELTSReadingQuestion;
};

function buildHeadingTargetMap(passage: IELTSReadingPassage) {
  if (!passage.isDragHeadingOnParagraph) {
    return new Map<string, HeadingDropTarget>();
  }

  const headingGroup = passage.questionGroups.find(
    (group) => group.type === "matching-headings"
  );

  if (!headingGroup) {
    return new Map<string, HeadingDropTarget>();
  }

  const visibleParagraphs = passage.paragraphs.filter(
    (paragraph) => !paragraph.isHiddenLabel
  );
  const targetMap = new Map<string, HeadingDropTarget>();

  visibleParagraphs.forEach((paragraph, paragraphIndex) => {
    const question = headingGroup.questions[paragraphIndex];

    targetMap.set(paragraph.id, {
      answerId: question?.id ?? `${passage.id}-${paragraph.id}-heading`,
      displayLabel: question ? String(question.number) : paragraph.label,
      question,
    });
  });

  return targetMap;
}

export function RealExamPassagePanel({
  passage,
  answers,
  onAnswer,
  questionRefs,
}: RealExamPassagePanelProps) {
  const headingGroup = passage.isDragHeadingOnParagraph
    ? passage.questionGroups.find((group) => group.type === "matching-headings")
    : undefined;
  const headingOptions = headingGroup?.options ?? [];
  const headingTargetMap = buildHeadingTargetMap(passage);

  const handleHeadingDrop = (
    event: React.DragEvent<HTMLDivElement>,
    questionId: string
  ) => {
    event.preventDefault();

    const optionLabel = event.dataTransfer.getData("text/plain");

    if (optionLabel) {
      onAnswer(questionId, optionLabel);
    }
  };

  return (
    <>
      <h2>{passage.title}</h2>

      <div className={styles.passageText}>
        {passage.paragraphs.map((paragraph) => {
          const headingTarget = headingTargetMap.get(paragraph.id);
          const selectedHeading = headingOptions.find(
            (option) =>
              headingTarget && option.label === answers[headingTarget.answerId]
          );

          return (
            <div key={paragraph.id} className={styles.realPassageParagraph}>
              {headingTarget && (
                <div
                  ref={(element) => {
                    questionRefs.current[headingTarget.answerId] = element;
                  }}
                  className={`${styles.realParagraphHeadingDrop} ${
                    selectedHeading ? styles.realParagraphHeadingDropFilled : ""
                  }`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleHeadingDrop(event, headingTarget.answerId)}
                >
                  {selectedHeading ? (
                    <>
                      <strong>{headingTarget.displayLabel}</strong>
                      <span>
                        {selectedHeading.label}. {selectedHeading.content}
                      </span>
                      <button
                        type="button"
                        onClick={() => onAnswer(headingTarget.answerId, "")}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <strong>{headingTarget.displayLabel}</strong>
                  )}
                </div>
              )}

              <p>
                {paragraph.label && (
                  <strong className={styles.paragraphLabel}>
                    {paragraph.label}.{" "}
                  </strong>
                )}
                {paragraph.content}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
