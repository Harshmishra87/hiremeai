/**
 * Minimal markdown renderer for AI chat responses.
 * Supports: **bold**, bullet lists (-, *), numbered lists, paragraphs, headings (###).
 * Deliberately tiny — avoids pulling in a full markdown library for chat bubbles.
 */

function renderInline(text, keyPrefix) {
  // Split on **bold** segments, keep the rest as plain text.
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={`${keyPrefix}-b-${i}`}
          className="font-semibold text-ink-primary"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-t-${i}`}>{part}</span>;
  });
}

export default function MarkdownLite({ text }) {
  if (!text) return null;

  const lines = text.split("\n");
  const blocks = [];
  let listBuffer = [];
  let listType = null; // 'ul' | 'ol'

  const flushList = (key) => {
    if (!listBuffer.length) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    blocks.push(
      <Tag
        key={`list-${key}`}
        className={`my-1.5 space-y-1 pl-4 ${listType === "ol" ? "list-decimal" : "list-disc"}`}
      >
        {listBuffer.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {renderInline(item, `li-${key}-${i}`)}
          </li>
        ))}
      </Tag>,
    );
    listBuffer = [];
    listType = null;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    const bulletMatch = trimmed.match(/^[-*]\s+(.*)/);
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.*)/);
    const headingMatch = trimmed.match(/^#{1,4}\s+(.*)/);

    if (bulletMatch) {
      if (listType !== "ul") flushList(idx);
      listType = "ul";
      listBuffer.push(bulletMatch[1]);
      return;
    }
    if (numberedMatch) {
      if (listType !== "ol") flushList(idx);
      listType = "ol";
      listBuffer.push(numberedMatch[1]);
      return;
    }

    flushList(idx);

    if (headingMatch) {
      blocks.push(
        <p
          key={`h-${idx}`}
          className="font-semibold text-ink-primary mt-2 mb-0.5 first:mt-0"
        >
          {renderInline(headingMatch[1], `h-${idx}`)}
        </p>,
      );
      return;
    }

    if (trimmed === "") {
      blocks.push(<div key={`sp-${idx}`} className="h-1.5" />);
      return;
    }

    blocks.push(
      <p key={`p-${idx}`} className="leading-relaxed">
        {renderInline(trimmed, `p-${idx}`)}
      </p>,
    );
  });

  flushList("end");

  return <div className="space-y-0.5">{blocks}</div>;
}
