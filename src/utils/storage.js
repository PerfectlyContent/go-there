const STORAGE_KEY = 'go-there-app';

const defaultState = {
  seen: {},
  completed: {},
  savedQuestions: [],
  streak: 0,
  lastActiveDate: null,
  questionsViewedToday: 0,
  unlockedBadges: [],
  firstUse: true,
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return { ...defaultState };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable
  }
}

export function markQuestionSeen(state, relationship, vibe, questionIndex) {
  const newState = { ...state };
  if (!newState.seen[relationship]) newState.seen[relationship] = {};
  if (!newState.seen[relationship][vibe]) newState.seen[relationship][vibe] = [];

  if (!newState.seen[relationship][vibe].includes(questionIndex)) {
    newState.seen[relationship][vibe] = [...newState.seen[relationship][vibe], questionIndex];
  }

  // Check if combo is completed (all 20 seen)
  if (newState.seen[relationship][vibe].length >= 20) {
    if (!newState.completed[relationship]) newState.completed[relationship] = {};
    newState.completed[relationship][vibe] = true;
  }

  // Update streak
  const today = new Date().toDateString();
  if (newState.lastActiveDate !== today) {
    newState.questionsViewedToday = 0;
  }
  newState.questionsViewedToday += 1;
  newState.lastActiveDate = today;

  saveState(newState);
  return newState;
}

export function updateStreak(state) {
  const newState = { ...state };
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (newState.lastActiveDate === today) {
    // Already active today, no change
    return newState;
  }

  if (newState.lastActiveDate === yesterday) {
    // Consecutive day - only count if they viewed 3+ questions yesterday
    if (newState.questionsViewedToday >= 3 || newState.streak === 0) {
      // streak continues
    }
  } else if (newState.lastActiveDate && newState.lastActiveDate !== today) {
    // Streak broken
    newState.streak = 0;
  }

  return newState;
}

export function checkAndUpdateStreak(state) {
  const newState = { ...state };
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (!newState.lastActiveDate) {
    // First time
    return newState;
  }

  if (newState.lastActiveDate === today) {
    return newState;
  }

  if (newState.lastActiveDate === yesterday) {
    // Check if they qualified yesterday (3+ questions)
    // Streak continues
  } else {
    // More than a day gap
    newState.streak = 0;
  }

  return newState;
}

export function incrementStreakIfQualified(state) {
  const newState = { ...state };
  const today = new Date().toDateString();

  if (newState.questionsViewedToday >= 3 && newState.lastActiveDate === today) {
    // Check if we already incremented today
    if (!newState._streakIncrementedToday || newState._streakIncrementedToday !== today) {
      newState.streak += 1;
      newState._streakIncrementedToday = today;
    }
  }

  return newState;
}

export function saveQuestion(state, question, relationship, vibe) {
  const newState = { ...state };
  const exists = newState.savedQuestions.some(
    (sq) => sq.question === question && sq.relationship === relationship && sq.vibe === vibe
  );
  if (!exists) {
    newState.savedQuestions = [
      ...newState.savedQuestions,
      { question, relationship, vibe, savedAt: Date.now() },
    ];
  }
  saveState(newState);
  return newState;
}

export function unsaveQuestion(state, question, relationship, vibe) {
  const newState = { ...state };
  newState.savedQuestions = newState.savedQuestions.filter(
    (sq) => !(sq.question === question && sq.relationship === relationship && sq.vibe === vibe)
  );
  saveState(newState);
  return newState;
}

export function isQuestionSaved(state, question, relationship, vibe) {
  return state.savedQuestions.some(
    (sq) => sq.question === question && sq.relationship === relationship && sq.vibe === vibe
  );
}

export function getSeenCount(state, relationship, vibe) {
  return state.seen[relationship]?.[vibe]?.length || 0;
}

export function getTotalQuestionsViewed(state) {
  let total = 0;
  for (const rel of Object.values(state.seen)) {
    for (const vibeArr of Object.values(rel)) {
      total += vibeArr.length;
    }
  }
  return total;
}

export function getNextUnseenIndex(state, relationship, vibe, totalQuestions = 20) {
  const seen = state.seen[relationship]?.[vibe] || [];
  for (let i = 0; i < totalQuestions; i++) {
    if (!seen.includes(i)) return i;
  }
  return 0; // All seen, wrap around
}

export function unlockBadge(state, badgeId) {
  const newState = { ...state };
  if (!newState.unlockedBadges.includes(badgeId)) {
    newState.unlockedBadges = [...newState.unlockedBadges, badgeId];
  }
  saveState(newState);
  return newState;
}

export function dismissFirstUse(state) {
  const newState = { ...state, firstUse: false };
  saveState(newState);
  return newState;
}

// Relationship/vibe config
export const relationships = [
  { id: 'partner', label: 'Partner', emoji: '\ud83d\udc95' },
  { id: 'friend', label: 'Friend', emoji: '\ud83d\udc6f' },
  { id: 'group', label: 'Group', emoji: '\ud83e\udea9' },
  { id: 'parent', label: 'Parent', emoji: '\ud83c\udf33' },
  { id: 'sibling', label: 'Sibling', emoji: '\ud83d\udc4a' },
  { id: 'kid', label: 'Kid', emoji: '\ud83e\uddd2' },
  { id: 'date', label: 'Date', emoji: '\u2728' },
];

export const vibes = [
  { id: 'deep', label: 'Deep', emoji: '\ud83c\udf0a', color: '#6366F1' },
  { id: 'funny', label: 'Funny', emoji: '\ud83d\ude02', color: '#F59E0B' },
  { id: 'nostalgic', label: 'Nostalgic', emoji: '\ud83d\udcfc', color: '#D97706' },
  { id: 'daring', label: 'Daring', emoji: '\ud83d\udd25', color: '#EF4444' },
  { id: 'flirty', label: 'Flirty', emoji: '\ud83d\udc8b', color: '#EC4899' },
  { id: 'real', label: 'Real', emoji: '\ud83d\udcac', color: '#10B981' },
];

export const vibeAvailability = {
  partner: ['deep', 'funny', 'nostalgic', 'daring', 'flirty', 'real'],
  friend: ['deep', 'funny', 'nostalgic', 'daring', 'real'],
  group: ['deep', 'funny', 'nostalgic', 'daring'],
  parent: ['deep', 'funny', 'nostalgic', 'daring', 'real'],
  sibling: ['deep', 'funny', 'nostalgic', 'daring', 'real'],
  kid: ['deep', 'funny', 'nostalgic', 'real'],
  date: ['deep', 'funny', 'daring', 'flirty', 'real'],
};

export const vibeColors = {
  deep: { bg: 'from-indigo-900/20 to-purple-900/20', card: '#6366F1', text: '#6366F1' },
  funny: { bg: 'from-amber-100/40 to-orange-100/40', card: '#F59E0B', text: '#F59E0B' },
  nostalgic: { bg: 'from-amber-200/30 to-orange-200/30', card: '#D97706', text: '#D97706' },
  daring: { bg: 'from-red-100/30 to-coral-100/30', card: '#EF4444', text: '#EF4444' },
  flirty: { bg: 'from-pink-100/30 to-rose-100/30', card: '#EC4899', text: '#EC4899' },
  real: { bg: 'from-emerald-100/30 to-teal-100/30', card: '#10B981', text: '#10B981' },
};
