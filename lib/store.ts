import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatJournalTitle } from "./date";
import type { Block, BlockType, Page } from "./types";

function newId(): string {
  return crypto.randomUUID();
}

function emptyParagraph(): Block {
  return { id: newId(), type: "paragraph", content: "" };
}

interface WorkspaceState {
  pages: Record<string, Page>;
  blocks: Record<string, Block>;
  rootPageIds: string[];
  hasSeeded: boolean;

  createPage: (parentId: string | null, title?: string) => string;
  renamePage: (pageId: string, title: string) => void;
  deletePage: (pageId: string) => void;
  ensureSeeded: () => string | null;
  getOrCreateJournalPage: (isoDate: string) => string;

  insertBlockAfter: (pageId: string, afterBlockId: string | null, type?: BlockType) => string;
  updateBlockContent: (blockId: string, content: string) => void;
  setBlockType: (blockId: string, type: BlockType) => void;
  setBlockDueDate: (blockId: string, dueDate: string | null) => void;
  toggleTodo: (blockId: string) => void;
  deleteBlock: (pageId: string, blockId: string) => void;
}

export function getChildPages(pages: Record<string, Page>, parentId: string | null): Page[] {
  return Object.values(pages)
    .filter((p) => p.parentId === parentId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getJournalPage(pages: Record<string, Page>, isoDate: string): Page | undefined {
  return Object.values(pages).find((p) => p.journalDate === isoDate);
}

export interface TodoEntry {
  block: Block;
  pageId: string;
  pageTitle: string;
}

export function getAllTodos(pages: Record<string, Page>, blocks: Record<string, Block>): TodoEntry[] {
  const entries: TodoEntry[] = [];
  for (const page of Object.values(pages)) {
    for (const blockId of page.blockIds) {
      const block = blocks[blockId];
      if (block && block.type === "todo") {
        entries.push({ block, pageId: page.id, pageTitle: page.title || "Sans titre" });
      }
    }
  }
  return entries;
}

function collectDescendantPageIds(state: WorkspaceState, pageId: string): string[] {
  const children = Object.values(state.pages).filter((p) => p.parentId === pageId);
  return [pageId, ...children.flatMap((c) => collectDescendantPageIds(state, c.id))];
}

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      pages: {},
      blocks: {},
      rootPageIds: [],
      hasSeeded: false,

      ensureSeeded: () => {
        const state = get();
        if (state.hasSeeded) return null;

        if (Object.keys(state.pages).length > 0) {
          set({ hasSeeded: true });
          return null;
        }

        const pageId = newId();
        const welcomeBlocks: Block[] = [
          {
            id: newId(),
            type: "paragraph",
            content:
              "Bienvenue dans votre espace Notex. Tapez « / » n'importe où pour insérer un titre, une liste, une citation ou une case à cocher.",
          },
          { id: newId(), type: "heading2", content: "Quelques raccourcis" },
          { id: newId(), type: "bulleted", content: "Entrée crée un nouveau bloc" },
          { id: newId(), type: "bulleted", content: "Retour arrière sur un bloc vide le supprime" },
          { id: newId(), type: "bulleted", content: "Tapez / pour changer le type du bloc actuel" },
          { id: newId(), type: "todo", content: "Cochez cette case pour essayer", checked: false },
          { id: newId(), type: "quote", content: "Toute la puissance de Notion, sans son poids." },
        ];
        const page: Page = {
          id: pageId,
          title: "Bienvenue",
          parentId: null,
          blockIds: welcomeBlocks.map((b) => b.id),
          createdAt: Date.now(),
        };

        set((state) => ({
          pages: { ...state.pages, [pageId]: page },
          blocks: { ...state.blocks, ...Object.fromEntries(welcomeBlocks.map((b) => [b.id, b])) },
          rootPageIds: [...state.rootPageIds, pageId],
          hasSeeded: true,
        }));
        return pageId;
      },

      createPage: (parentId, title = "Sans titre") => {
        const id = newId();
        const firstBlock = emptyParagraph();
        const page: Page = {
          id,
          title,
          parentId,
          blockIds: [firstBlock.id],
          createdAt: Date.now(),
        };
        set((state) => ({
          pages: { ...state.pages, [id]: page },
          blocks: { ...state.blocks, [firstBlock.id]: firstBlock },
          rootPageIds: parentId ? state.rootPageIds : [...state.rootPageIds, id],
        }));
        return id;
      },

      renamePage: (pageId, title) => {
        set((state) => ({
          pages: { ...state.pages, [pageId]: { ...state.pages[pageId], title } },
        }));
      },

      deletePage: (pageId) => {
        const state = get();
        const toDelete = new Set(collectDescendantPageIds(state, pageId));
        const remainingPages = Object.fromEntries(
          Object.entries(state.pages).filter(([id]) => !toDelete.has(id)),
        );
        const removedBlockIds = new Set(
          Object.values(state.pages)
            .filter((p) => toDelete.has(p.id))
            .flatMap((p) => p.blockIds),
        );
        const remainingBlocks = Object.fromEntries(
          Object.entries(state.blocks).filter(([id]) => !removedBlockIds.has(id)),
        );
        set({
          pages: remainingPages,
          blocks: remainingBlocks,
          rootPageIds: state.rootPageIds.filter((id) => !toDelete.has(id)),
        });
      },

      getOrCreateJournalPage: (isoDate) => {
        const existing = getJournalPage(get().pages, isoDate);
        if (existing) return existing.id;

        const id = newId();
        const firstBlock = emptyParagraph();
        const page: Page = {
          id,
          title: formatJournalTitle(isoDate),
          parentId: null,
          blockIds: [firstBlock.id],
          createdAt: Date.now(),
          journalDate: isoDate,
        };
        set((state) => ({
          pages: { ...state.pages, [id]: page },
          blocks: { ...state.blocks, [firstBlock.id]: firstBlock },
          rootPageIds: [...state.rootPageIds, id],
        }));
        return id;
      },

      insertBlockAfter: (pageId, afterBlockId, type = "paragraph") => {
        const block: Block = { id: newId(), type, content: "", checked: type === "todo" ? false : undefined };
        set((state) => {
          const page = state.pages[pageId];
          const idx = afterBlockId ? page.blockIds.indexOf(afterBlockId) : page.blockIds.length - 1;
          const blockIds = [...page.blockIds];
          blockIds.splice(idx + 1, 0, block.id);
          return {
            blocks: { ...state.blocks, [block.id]: block },
            pages: { ...state.pages, [pageId]: { ...page, blockIds } },
          };
        });
        return block.id;
      },

      updateBlockContent: (blockId, content) => {
        set((state) => ({
          blocks: { ...state.blocks, [blockId]: { ...state.blocks[blockId], content } },
        }));
      },

      setBlockType: (blockId, type) => {
        set((state) => ({
          blocks: {
            ...state.blocks,
            [blockId]: {
              ...state.blocks[blockId],
              type,
              checked: type === "todo" ? false : undefined,
            },
          },
        }));
      },

      setBlockDueDate: (blockId, dueDate) => {
        set((state) => ({
          blocks: {
            ...state.blocks,
            [blockId]: { ...state.blocks[blockId], dueDate: dueDate ?? undefined },
          },
        }));
      },

      toggleTodo: (blockId) => {
        set((state) => ({
          blocks: {
            ...state.blocks,
            [blockId]: { ...state.blocks[blockId], checked: !state.blocks[blockId].checked },
          },
        }));
      },

      deleteBlock: (pageId, blockId) => {
        set((state) => {
          const page = state.pages[pageId];
          if (page.blockIds.length <= 1) return state;
          const restBlocks = { ...state.blocks };
          delete restBlocks[blockId];
          return {
            blocks: restBlocks,
            pages: {
              ...state.pages,
              [pageId]: { ...page, blockIds: page.blockIds.filter((id) => id !== blockId) },
            },
          };
        });
      },
    }),
    { name: "notex-workspace" },
  ),
);

export function useHasHydrated() {
  return useSyncExternalStore(
    (callback) => useWorkspace.persist.onFinishHydration(callback),
    () => useWorkspace.persist.hasHydrated(),
    () => false,
  );
}
