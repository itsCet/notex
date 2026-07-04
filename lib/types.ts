export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulleted"
  | "numbered"
  | "todo"
  | "quote"
  | "divider";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  dueDate?: string; // ISO date, e.g. "2026-07-10" — only meaningful for "todo" blocks
}

export interface Page {
  id: string;
  title: string;
  parentId: string | null;
  blockIds: string[];
  createdAt: number;
  journalDate?: string; // ISO date, e.g. "2026-07-10" — set for journal/daily-note pages
}

export interface BlockTypeOption {
  type: BlockType;
  label: string;
  keywords: string[];
}

export const BLOCK_TYPE_OPTIONS: BlockTypeOption[] = [
  { type: "paragraph", label: "Texte", keywords: ["texte", "paragraphe", "text"] },
  { type: "heading1", label: "Titre 1", keywords: ["titre1", "h1"] },
  { type: "heading2", label: "Titre 2", keywords: ["titre2", "h2"] },
  { type: "heading3", label: "Titre 3", keywords: ["titre3", "h3"] },
  { type: "bulleted", label: "Liste à puces", keywords: ["liste", "puce", "bullet"] },
  { type: "numbered", label: "Liste numérotée", keywords: ["liste", "numero", "number"] },
  { type: "todo", label: "Case à cocher", keywords: ["todo", "case", "check"] },
  { type: "quote", label: "Citation", keywords: ["citation", "quote"] },
  { type: "divider", label: "Séparateur", keywords: ["separateur", "divider", "ligne"] },
];
