import { create } from "zustand";
import { persist } from "zustand/middleware";
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

  createPage: (parentId: string | null, title?: string) => string;
  renamePage: (pageId: string, title: string) => void;
  deletePage: (pageId: string) => void;

  insertBlockAfter: (pageId: string, afterBlockId: string | null, type?: BlockType) => string;
  updateBlockContent: (blockId: string, content: string) => void;
  setBlockType: (blockId: string, type: BlockType) => void;
  toggleTodo: (blockId: string) => void;
  deleteBlock: (pageId: string, blockId: string) => void;
}

export function getChildPages(pages: Record<string, Page>, parentId: string | null): Page[] {
  return Object.values(pages)
    .filter((p) => p.parentId === parentId)
    .sort((a, b) => a.createdAt - b.createdAt);
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
