import styles from "../../pages/PracticeDetailPage.module.scss";

type RichTextProps = {
  as?: "div" | "span";
  className?: string;
  html: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const decodeHtmlEntities = (value: string) => {
  if (typeof document === "undefined") {
    return value
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

const hasHtmlTag = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

const textToHtml = (value: string) =>
  escapeHtml(value)
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, "<br />"))
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");

const sanitizeHtml = (value: string) => {
  const decoded = decodeHtmlEntities(value).replace(/\u00a0/g, " ");
  const html = hasHtmlTag(decoded) ? decoded : textToHtml(decoded);

  if (typeof document === "undefined") {
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/\son\w+='[^']*'/gi, "")
      .replace(/\s(href|src)=["']javascript:[^"']*["']/gi, "");
  }

  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll("script, style").forEach((element) => element.remove());
  template.content.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();

      if (name.startsWith("on") || ((name === "href" || name === "src") && value.startsWith("javascript:"))) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return template.innerHTML;
};

export function RichText({ as = "div", className, html }: RichTextProps) {
  const Component = as;

  return (
    <Component
      className={[styles.richText, className].filter(Boolean).join(" ")}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
