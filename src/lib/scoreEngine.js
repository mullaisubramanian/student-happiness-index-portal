// ====================================================================
// RAW SCORE ENGINE (SUPABASE STORAGE MAPPER)
// Right Swipe = Positive = score 1
// Left Swipe = Negative = score 0
// ====================================================================

export function getScoreForResponse(response) {
  return response === 'positive' ? 1 : 0;
}
