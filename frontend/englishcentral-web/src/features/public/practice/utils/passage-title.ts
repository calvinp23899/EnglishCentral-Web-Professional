import type { IELTSReadingPassage } from "../types/practice-test.type";

const normalizeText = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const shouldShowPassageTitle = (passage: IELTSReadingPassage) => {
  const title = normalizeText(passage.title);
  const firstContent = normalizeText(passage.paragraphs[0]?.content ?? "");

  return Boolean(title) && !firstContent.startsWith(title);
};
