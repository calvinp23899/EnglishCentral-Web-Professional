import { useRef, useState } from "react";
import { Eraser, Highlighter, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import type {
  AnswerMap,
  IELTSReadingPassage,
  IELTSReadingQuestion,
} from "../../types/practice-test.type";
import { shouldShowPassageTitle } from "../../utils/passage-title";
import { RichText } from "../RichText/RichText";
import styles from "../../pages/PracticeDetailPage.module.scss";

type RealExamPassagePanelProps = {
  passage: IELTSReadingPassage;
  answers: AnswerMap;
  onAnswer: (questionId: string, value: string) => void;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  annotations: PassageAnnotation[];
  onAnnotationsChange: React.Dispatch<React.SetStateAction<PassageAnnotation[]>>;
  onActiveNoteIdChange: (noteId: string | null) => void;
};

type HeadingDropTarget = {
  answerId: string;
  displayLabel: string;
  question?: IELTSReadingQuestion;
};

export type PassageAnnotation = {
  id: string;
  passageId: string;
  paragraphId: string;
  start: number;
  end: number;
  type: "highlight" | "note";
  note?: string;
  selectedText: string;
};

type PendingSelection = Pick<
  PassageAnnotation,
  "passageId" | "paragraphId" | "start" | "end"
>;

function getContentElement(node: Node) {
  const element =
    node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;

  return element?.closest<HTMLElement>("[data-passage-content-id]") ?? null;
}

function getTextOffset(container: HTMLElement, node: Node, offset: number) {
  const range = document.createRange();

  range.selectNodeContents(container);
  range.setEnd(node, offset);

  return range.toString().length;
}

function htmlToPlainText(value: string) {
  if (typeof document === "undefined") {
    return value
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\/\s*(p|div|h[1-6]|li|blockquote)\s*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }

  const template = document.createElement("template");
  template.innerHTML = value;
  return template.content.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
}

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
  annotations,
  onAnnotationsChange,
  onActiveNoteIdChange,
}: RealExamPassagePanelProps) {
  const passageTextRef = useRef<HTMLDivElement | null>(null);
  const pendingSelectionRef = useRef<PendingSelection | null>(null);
  const [selectionPopover, setSelectionPopover] = useState<{
    passageId: string;
    top: number;
    left: number;
    canClearHighlight: boolean;
  } | null>(null);
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

  const updateSelectionPopover = () => {
    const selection = window.getSelection();
    const passageElement = passageTextRef.current;

    if (
      !selection ||
      !passageElement ||
      selection.isCollapsed ||
      selection.rangeCount === 0
    ) {
      setSelectionPopover(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const startContentElement = getContentElement(range.startContainer);
    const endContentElement = getContentElement(range.endContainer);

    if (
      !startContentElement ||
      !endContentElement ||
      startContentElement !== endContentElement ||
      !passageElement.contains(startContentElement)
    ) {
      setSelectionPopover(null);
      pendingSelectionRef.current = null;
      return;
    }

    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      setSelectionPopover(null);
      pendingSelectionRef.current = null;
      return;
    }

    const start = getTextOffset(
      startContentElement,
      range.startContainer,
      range.startOffset
    );
    const end = getTextOffset(
      startContentElement,
      range.endContainer,
      range.endOffset
    );

    if (start === end) {
      setSelectionPopover(null);
      pendingSelectionRef.current = null;
      return;
    }

    const nextSelection = {
      passageId: passage.id,
      paragraphId: startContentElement.dataset.passageContentId ?? "",
      start: Math.min(start, end),
      end: Math.max(start, end),
    };
    const canClearHighlight = annotations.some(
      (annotation) =>
        annotation.type === "highlight" &&
        annotation.passageId === nextSelection.passageId &&
        annotation.paragraphId === nextSelection.paragraphId &&
        annotation.start < nextSelection.end &&
        annotation.end > nextSelection.start
    );

    setSelectionPopover({
      passageId: passage.id,
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
      canClearHighlight,
    });
    pendingSelectionRef.current = nextSelection;
  };

  const hideSelectionPopover = () => {
    setSelectionPopover(null);
  };

  const applySelectionAnnotation = (
    type: PassageAnnotation["type"],
    note?: string
  ) => {
    const selection = pendingSelectionRef.current;

    if (!selection || !selection.paragraphId || selection.start === selection.end) {
      hideSelectionPopover();
      return;
    }

    const selectedParagraph = passage.paragraphs.find(
      (paragraph) => paragraph.id === selection.paragraphId
    );
    const selectedText =
      selectedParagraph?.content.slice(selection.start, selection.end) ?? "";
    const nextAnnotation: PassageAnnotation = {
      ...selection,
      id: `${selection.passageId}-${selection.paragraphId}-${selection.start}-${selection.end}-${Date.now()}`,
      type,
      note,
      selectedText,
    };

    onAnnotationsChange((prev) => [...prev, nextAnnotation]);

    if (type === "note") {
      onActiveNoteIdChange(nextAnnotation.id);
    }

    window.getSelection()?.removeAllRanges();
    pendingSelectionRef.current = null;
    hideSelectionPopover();
  };

  const handleHighlightSelection = () => {
    applySelectionAnnotation("highlight");
  };

  const handleNoteSelection = () => {
    applySelectionAnnotation("note", "");
  };

  const handleClearSelectionHighlight = () => {
    const selection = pendingSelectionRef.current;

    if (!selection) {
      hideSelectionPopover();
      return;
    }

    onAnnotationsChange((prev) =>
      prev.filter(
        (annotation) =>
          !(
            annotation.type === "highlight" &&
            annotation.passageId === selection.passageId &&
            annotation.paragraphId === selection.paragraphId &&
            annotation.start < selection.end &&
            annotation.end > selection.start
          )
      )
    );

    window.getSelection()?.removeAllRanges();
    pendingSelectionRef.current = null;
    hideSelectionPopover();
  };

  const renderAnnotatedContent = (
    paragraphId: string,
    content: string
  ): ReactNode[] => {
    const paragraphAnnotations = annotations
      .filter(
        (annotation) =>
          annotation.passageId === passage.id &&
          annotation.paragraphId === paragraphId &&
          annotation.start >= 0 &&
          annotation.end <= content.length &&
          annotation.start < annotation.end
      )
      .sort((first, second) => first.start - second.start);

    if (paragraphAnnotations.length === 0) {
      return [content];
    }

    const nodes: ReactNode[] = [];
    let cursor = 0;

    paragraphAnnotations.forEach((annotation) => {
      if (annotation.start < cursor) {
        return;
      }

      if (annotation.start > cursor) {
        nodes.push(content.slice(cursor, annotation.start));
      }

      nodes.push(
        <span
          key={annotation.id}
          className={
            annotation.type === "note"
              ? styles.realPassageNote
              : styles.realPassageHighlight
          }
          role={annotation.type === "note" ? "button" : undefined}
          tabIndex={annotation.type === "note" ? 0 : undefined}
          title={annotation.type === "note" ? "Open note" : undefined}
          onClick={
            annotation.type === "note"
              ? () => onActiveNoteIdChange(annotation.id)
              : undefined
          }
          onKeyDown={
            annotation.type === "note"
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onActiveNoteIdChange(annotation.id);
                  }
                }
              : undefined
          }
        >
          {content.slice(annotation.start, annotation.end)}
        </span>
      );

      cursor = annotation.end;
    });

    if (cursor < content.length) {
      nodes.push(content.slice(cursor));
    }

    return nodes;
  };

  return (
    <>
      {shouldShowPassageTitle(passage) && <h2>{passage.title}</h2>}

      <div
        ref={passageTextRef}
        className={styles.passageText}
        onMouseUp={updateSelectionPopover}
        onKeyUp={updateSelectionPopover}
        onScroll={hideSelectionPopover}
      >
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
                        x
                      </button>
                    </>
                  ) : (
                    <strong>{headingTarget.displayLabel}</strong>
                  )}
                </div>
              )}

              <div data-passage-content-id={paragraph.id}>
                {annotations.some(
                  (annotation) =>
                    annotation.passageId === passage.id &&
                    annotation.paragraphId === paragraph.id
                ) ? (
                  renderAnnotatedContent(paragraph.id, htmlToPlainText(paragraph.content))
                ) : (
                  <RichText className={styles.passageParagraphText} html={paragraph.content} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectionPopover?.passageId === passage.id && (
        <div
          className={styles.realSelectionPopover}
          style={{
            top: selectionPopover.top,
            left: selectionPopover.left,
          }}
          onMouseDown={(event) => event.preventDefault()}
        >
          <span className={styles.realSelectionPopoverArrow} aria-hidden="true" />
          <button type="button" onClick={handleNoteSelection}>
            <MessageSquare aria-hidden="true" />
            <span>Note</span>
          </button>
          <button type="button" onClick={handleHighlightSelection}>
            <Highlighter aria-hidden="true" />
            <span>Highlight</span>
          </button>
          {selectionPopover.canClearHighlight && (
            <button type="button" onClick={handleClearSelectionHighlight}>
              <Eraser aria-hidden="true" />
              <span>Clear highlight</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}
