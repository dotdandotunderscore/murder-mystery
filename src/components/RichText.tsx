import React from "react";

interface FormattedSegment {
  text: string;
  bold: boolean;
  italic: boolean;
}

// First pass: extract bold/italic formatting from the full text before any splitting
function parseFormatting(text: string): FormattedSegment[] {
  const pattern = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g;
  const segments: FormattedSegment[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ text: text.slice(last, match.index), bold: false, italic: false });
    }
    if (match[2] != null) {
      segments.push({ text: match[2], bold: true, italic: true });
    } else if (match[3] != null) {
      segments.push({ text: match[3], bold: true, italic: false });
    } else if (match[4] != null) {
      segments.push({ text: match[4], bold: false, italic: true });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    segments.push({ text: text.slice(last), bold: false, italic: false });
  }
  return segments;
}

function withLineBreaks(text: string, key: string): React.ReactNode[] {
  const parts = text.split("\n");
  if (parts.length === 1) return [text];
  const nodes: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    if (i > 0) nodes.push(<br key={`${key}-br${i}`} />);
    if (part) nodes.push(part);
  });
  return nodes;
}

function renderWithHighlights(text: string, highlights: string[], key: string): React.ReactNode[] {
  if (!highlights.length) return withLineBreaks(text, key);

  const escaped = highlights.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);

  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    if (highlights.some((t) => t.toLowerCase() === part.toLowerCase())) {
      nodes.push(<span key={`${key}-h${i}`} className="text-gold font-semibold">{part}</span>);
    } else {
      nodes.push(...withLineBreaks(part, `${key}-${i}`));
    }
  }
  return nodes;
}

// Second pass: within each formatted segment, split on [[...]] links and apply highlights
function renderSegment(
  seg: FormattedSegment,
  highlights: string[],
  onCode: ((phrase: string) => void) | undefined,
  segKey: string
): React.ReactNode {
  const linkPattern = /\[\[([^\]]+)\]\]/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(seg.text)) !== null) {
    const before = seg.text.slice(last, match.index);
    if (before) nodes.push(...renderWithHighlights(before, highlights, `${segKey}-${last}`));

    const phrase = (match[1] ?? "").trim();
    nodes.push(
      <button
        key={`${segKey}-link${match.index}`}
        onClick={() => onCode?.(phrase.toLowerCase())}
        disabled={!onCode}
        className="underline decoration-dotted underline-offset-2 text-gold hover:text-gold-light transition-colors disabled:cursor-default"
      >
        {phrase}
      </button>
    );
    last = match.index + match[0].length;
  }

  const remaining = seg.text.slice(last);
  if (remaining) nodes.push(...renderWithHighlights(remaining, highlights, `${segKey}-${last}`));

  if (seg.italic && seg.bold) {
    return <strong key={segKey}><em>{nodes}</em></strong>;
  } else if (seg.bold) {
    return <strong key={segKey}>{nodes}</strong>;
  } else if (seg.italic) {
    return <em key={segKey}>{nodes}</em>;
  }
  return <React.Fragment key={segKey}>{nodes}</React.Fragment>;
}

interface Props {
  text: string;
  highlights?: string[];
  onCode?: (phrase: string) => void;
}

export default function RichText({ text, highlights = [], onCode }: Props) {
  if (!text) return null;

  const segments = parseFormatting(text);
  return (
    <>
      {segments.map((seg, i) => renderSegment(seg, highlights, onCode, `s${i}`))}
    </>
  );
}
