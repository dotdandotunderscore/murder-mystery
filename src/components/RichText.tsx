import React from "react";

// Splits text on highlighted terms, returning spans with gold styling for matches.
function applyHighlights(text: string, terms: string[]): React.ReactNode {
  if (!terms.length) return text;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    terms.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
      <span key={i} className="text-gold font-semibold">{part}</span>
    ) : (
      part
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

    const phrase = match[1].trim();
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
