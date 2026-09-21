// shared/src/auction/draft-limit.ts
export const MAX_UNPUBLISHED_DRAFTS = 5;

export function hasReachedDraftLimit(currentDraftCount: number): boolean {
  return currentDraftCount >= MAX_UNPUBLISHED_DRAFTS;
}