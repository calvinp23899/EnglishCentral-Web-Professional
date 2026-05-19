import { useMemo, useState } from "react";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import type { IELTSMockTest } from "../types/practice-test.type";
import styles from "../pages/PracticeDetailPage.module.scss";

type PracticeWritingViewProps = {
  test: IELTSMockTest;
  onSubmit: () => void;
};

type WritingSection = "introduction" | "overview" | "body1" | "body2";

const writingSections: Array<{ id: WritingSection; label: string }> = [
  { id: "introduction", label: "Introduction" },
  { id: "overview", label: "Overview" },
  { id: "body1", label: "Body 1" },
  { id: "body2", label: "Body 2" },
];

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function PracticeWritingView({ test, onSubmit }: PracticeWritingViewProps) {
  const [promptWidth, setPromptWidth] = useState(50);
  const [answers, setAnswers] = useState<Record<WritingSection, string>>({
    introduction: "",
    overview: "",
    body1: "",
    body2: "",
  });
  const { formattedTime } = useCountdownTimer({
    minutes: test.durationMinutes,
  });
  const wordCount = useMemo(
    () =>
      Object.values(answers).reduce(
        (total, sectionText) => total + countWords(sectionText),
        0
      ),
    [answers]
  );
  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    const startX = event.clientX;
    const startWidth = promptWidth;

    event.currentTarget.setPointerCapture(event.pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const viewportWidth = window.innerWidth || 1;
      const deltaPercent = ((moveEvent.clientX - startX) / viewportWidth) * 100;
      const nextWidth = Math.min(62, Math.max(38, startWidth + deltaPercent));

      setPromptWidth(nextWidth);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      className={styles.writingPracticePage}
      style={{
        gridTemplateColumns: `minmax(360px, ${promptWidth}%) 18px minmax(360px, ${
          100 - promptWidth
        }%)`,
      }}
    >
      <section className={styles.writingPromptPane}>
        <div className={styles.writingPromptBox}>
          <p>
            The line graph shows the number of enquiries received by the Tourist
            Information Office in one city over a six-month period in 2011.
            Summarize the information by selecting and reporting the main
            features and make comparisons where relevant.
          </p>
        </div>

        <div className={styles.writingChartCard}>
          <svg viewBox="0 0 820 460" role="img" aria-label="Line chart of enquiries from January to June">
            {[0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000].map(
              (value, index) => {
                const y = 390 - index * 34;

                return (
                  <g key={value}>
                    <text x="18" y={y + 5}>
                      {value}
                    </text>
                    <line x1="72" x2="800" y1={y} y2={y} />
                  </g>
                );
              }
            )}

            <polyline
              className={styles.chartInPerson}
              points="132,313 252,288 372,254 492,169 612,126 732,66"
            />
            <polyline
              className={styles.chartLetter}
              points="132,263 252,271 372,271 492,313 612,356 732,356"
            />
            <polyline
              className={styles.chartTelephone}
              points="132,220 252,237 372,203 492,203 612,135 732,101"
            />

            {[
              ["chartInPersonMarker", 132, 313],
              ["chartInPersonMarker", 252, 288],
              ["chartInPersonMarker", 372, 254],
              ["chartInPersonMarker", 492, 169],
              ["chartInPersonMarker", 612, 126],
              ["chartInPersonMarker", 732, 66],
            ].map(([className, x, y]) => (
              <rect
                key={`${className}-${x}`}
                className={styles[className as keyof typeof styles]}
                x={Number(x) - 6}
                y={Number(y) - 6}
                width="12"
                height="12"
              />
            ))}

            {[
              ["chartLetterMarker", 132, 263],
              ["chartLetterMarker", 252, 271],
              ["chartLetterMarker", 372, 271],
              ["chartLetterMarker", 492, 313],
              ["chartLetterMarker", 612, 356],
              ["chartLetterMarker", 732, 356],
            ].map(([className, x, y]) => (
              <circle
                key={`${className}-${x}`}
                className={styles[className as keyof typeof styles]}
                cx={Number(x)}
                cy={Number(y)}
                r="6"
              />
            ))}

            {[
              ["chartTelephoneMarker", 132, 220],
              ["chartTelephoneMarker", 252, 237],
              ["chartTelephoneMarker", 372, 203],
              ["chartTelephoneMarker", 492, 203],
              ["chartTelephoneMarker", 612, 135],
              ["chartTelephoneMarker", 732, 101],
            ].map(([className, x, y]) => (
              <rect
                key={`${className}-${x}`}
                className={styles[className as keyof typeof styles]}
                x={Number(x) - 5}
                y={Number(y) - 5}
                width="10"
                height="10"
                transform={`rotate(45 ${x} ${y})`}
              />
            ))}

            {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, index) => (
              <text key={month} className={styles.chartMonth} x={132 + index * 120} y="418">
                {month}
              </text>
            ))}

            <g className={styles.chartLegend}>
              <line className={styles.chartInPerson} x1="205" x2="242" y1="444" y2="444" />
              <rect className={styles.chartInPersonMarker} x="220" y="438" width="12" height="12" />
              <text x="246" y="449">in person</text>
              <line className={styles.chartLetter} x1="330" x2="367" y1="444" y2="444" />
              <circle className={styles.chartLetterMarker} cx="348" cy="444" r="6" />
              <text x="372" y="449">by letter/email</text>
              <line className={styles.chartTelephone} x1="500" x2="537" y1="444" y2="444" />
              <rect className={styles.chartTelephoneMarker} x="514" y="439" width="10" height="10" transform="rotate(45 519 444)" />
              <text x="542" y="449">by telephone</text>
            </g>
          </svg>
        </div>
      </section>

      <div
        className={styles.writingDivider}
        role="separator"
        aria-orientation="vertical"
        onPointerDown={handleResizeStart}
      >
        <span />
      </div>

      <section className={styles.writingAnswerPane}>
        <header className={styles.writingAnswerHeader}>
          <strong>Word count: {wordCount}</strong>
        </header>

        <div className={styles.writingAnswerBody}>
          {writingSections.map((section) => (
            <label key={section.id} className={styles.writingSection}>
              <span>{section.label}</span>
              <textarea
                value={answers[section.id]}
                onChange={(event) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [section.id]: event.target.value,
                  }))
                }
                placeholder="Nhập phần viết của bạn ở đây"
              />
            </label>
          ))}
        </div>

        <footer className={styles.writingAnswerFooter}>
          <div>
            <span>Thời gian:</span>
            <strong>{formattedTime}</strong>
          </div>
          <button onClick={onSubmit}>Nộp bài</button>
        </footer>
      </section>
    </div>
  );
}
