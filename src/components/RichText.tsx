import React from "react";

// Converts newlines in a plain string to <br/> elements.
function applyLineBreaks(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split("\n");
  if (parts.length === 1) return [text];
  const nodes: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    if (i > 0) nodes.push(<br key={`${keyPrefix}-br${i}`} />);
    if (part) nodes.push(part);
  });
  return nodes;
}

// Applies **bold** and *italic* formatting to a plain string, returning ReactNodes.
// Also handles \n → <br/> within plain text segments.
function applyFormatting(text: string, keyPrefix: string): React.ReactNode[] {
  // Match **bold** first, then *italic* — bold must come first so ** isn't consumed as two *
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(...applyLineBreaks(text.slice(last, match.index), `${keyPrefix}-${last}`));
    if (match[2] != null) {
      nodes.push(<strong key={`${keyPrefix}-b${match.index}`}>{match[2]}</strong>);
    } else if (match[3] != null) {
      nodes.push(<em key={`${keyPrefix}-i${match.index}`}>{match[3]}</em>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(...applyLineBreaks(text.slice(last), `${keyPrefix}-${last}`));
  return nodes;
}

// Splits text on highlighted terms, returning spans with gold styling for matches,
// then applies bold/italic formatting to each segment.
function applyHighlights(text: string, terms: string[]): React.ReactNode {
  if (!terms.length) return applyFormatting(text, "f");
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    terms.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
      <span key={i} className="text-gold font-semibold">{part}</span>
    ) : (
      <React.Fragment key={i}>{applyFormatting(part, `f${i}`)}</React.Fragment>
    )
  );
}

interface Props {
  text: string;
  /** Words/flags to highlight in gold (existing highlightText behaviour). */
  highlights?: string[];
  /** Called when the player clicks a [[code-phrase]] link. */
  onCode?: (phrase: string) => void;
}

/**
 * Renders text with two special behaviours:
 *   - [[code-phrase]] → a clickable inline link that calls onCode(phrase)
 *   - highlight terms → wrapped in gold <span>s
 *
 * Usage:  <RichText text={content} highlights={grantedWords} onCode={handleCode} />
 */
export default function RichText({ text, highlights = [], onCode }: Props) {
  if (!text) return null;

  // Split on [[...]] tokens
  const pattern = /\[\[([^\]]+)\]\]/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before) nodes.push(applyHighlights(before, highlights));

    const phrase = (match[1] ?? "").trim();
    nodes.push(
      <button
        key={match.index}
        onClick={() => onCode?.(phrase)}
        disabled={!onCode}
        className="underline decoration-dotted underline-offset-2 text-gold hover:text-gold-light transition-colors disabled:cursor-default"
      >
        {phrase}
      </button>
    );
    lastIndex = match.index + match[0].length;
  }

  const remaining = text.slice(lastIndex);
  if (remaining) nodes.push(applyHighlights(remaining, highlights));

  return (
    <>
      {nodes.map((node, i) => (
        <React.Fragment key={i}>{node}</React.Fragment>
      ))}
    </>
  );
}
