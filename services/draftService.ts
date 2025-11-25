import { SavedDraft, DraftContent, Platform } from '../types';

const DRAFT_STORAGE_KEY = 'omnipost_drafts';

export const getDrafts = (): SavedDraft[] => {
  const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    // Sort by last modified descending
    return parsed.sort((a: SavedDraft, b: SavedDraft) => b.lastModified - a.lastModified);
  } catch (e) {
    console.error("Failed to parse drafts", e);
    return [];
  }
};

export const saveDraft = (name: string, content: DraftContent, platforms: Platform[]): SavedDraft => {
  const drafts = getDrafts();
  const newDraft: SavedDraft = {
    id: Date.now().toString(),
    name: name || `Draft ${new Date().toLocaleString()}`,
    content,
    platforms,
    lastModified: Date.now()
  };
  
  drafts.unshift(newDraft); // Add to top
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  return newDraft;
};

export const deleteDraft = (id: string): void => {
  const drafts = getDrafts().filter(d => d.id !== id);
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
};
