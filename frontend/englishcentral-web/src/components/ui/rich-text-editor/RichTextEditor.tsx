import { type ReactNode, useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import styles from "./RichTextEditor.module.scss";

type QuillFontFormat = {
  whitelist: string[];
};

const fontOptions = ["arial", "times-new-roman", "inter", "georgia", "courier-new"];
const Font = ReactQuill.Quill.import("formats/font") as QuillFontFormat;

Font.whitelist = fontOptions;
ReactQuill.Quill.register("formats/font", Font, true);

const toolbarOptions = [
  [{ font: fontOptions }],
  [{ header: [2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote"],
  ["clean"],
];

const formats = [
  "font",
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "blockquote",
];

export type RichTextEditorProps = {
  label?: ReactNode;
  minHeight?: number;
  onChange: (value: string) => void;
  value: string;
};

export function RichTextEditor({
  label,
  minHeight = 180,
  onChange,
  value,
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: toolbarOptions,
    }),
    [],
  );

  return (
    <div className={styles.field}>
      {label && <span>{label}</span>}
      <ReactQuill
        className={styles.editor}
        formats={formats}
        modules={modules}
        style={{ minHeight }}
        theme="snow"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
