// ── Types ──────────────────────────────────────────────────────────────────────

export interface Player {
  id: number;
  name: string;
  role: string | null;
  team: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  sort_order: number;
}

export interface Page {
  id: number;
  code_phrase: string;
  title: string;
  content: string;
  page_type: string;
  visible_to_roles: string[] | null;
  required_flags: string[] | null;
  required_flags_hints: string[] | null;
  excluded_by_flags: string[] | null;
  grants_flags: string[] | null;
  grants_words: string[] | null;
  removes_flags: string[] | null;
  removes_words: string[] | null;
  grants_soul: boolean;
  game_config: Record<string, unknown> | null;
  scan_code: string | null;
  sort_order: number;
  folder_id: number | null;
}

export interface Prompt {
  id: number;
  page_id: number;
  question: string;
  template: string;
  answer: string[];
  grants_flags: string[] | null;
  grants_words: string[] | null;
  removes_flags: string[] | null;
  removes_words: string[] | null;
  success_text: string | null;
  wrong_answer_hints: Record<string, string> | null;
  generic_wrong_text: string | null;
  allow_any_order: boolean;
  sort_order: number;
}

export interface Progress {
  player: Player;
  flags: string[];
  words: string[];
}

export type Suggestions = {
  flags: string[];
  words: string[];
  roles: string[];
  players: { id: number; name: string }[];
};

export const emptySuggestions: Suggestions = { flags: [], words: [], roles: [], players: [] };
