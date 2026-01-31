const badges = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'View your first question',
    icon: '\ud83d\udc63',
    check: (state) => state.totalQuestionsViewed >= 1,
  },
  {
    id: 'deep-diver',
    name: 'Deep Diver',
    description: 'Complete all Deep combos',
    icon: '\ud83c\udf0a',
    check: (state) => {
      const deepCombos = ['partner', 'friend', 'group', 'parent', 'sibling', 'kid', 'date'];
      return deepCombos.every(r => (state.completed[r]?.deep || false));
    },
  },
  {
    id: 'life-of-the-party',
    name: 'Life of the Party',
    description: 'Complete all Group combos',
    icon: '\ud83e\udea9',
    check: (state) => {
      const groupVibes = ['deep', 'funny', 'nostalgic', 'daring'];
      return groupVibes.every(v => (state.completed.group?.[v] || false));
    },
  },
  {
    id: 'heart-to-heart',
    name: 'Heart to Heart',
    description: 'Complete all Partner combos',
    icon: '\ud83d\udc95',
    check: (state) => {
      const partnerVibes = ['deep', 'funny', 'nostalgic', 'daring', 'flirty', 'real'];
      return partnerVibes.every(v => (state.completed.partner?.[v] || false));
    },
  },
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: '3-day streak',
    icon: '\ud83d\udd25',
    check: (state) => state.streak >= 3,
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: '7-day streak',
    icon: '\ud83d\udd25\ud83d\udd25',
    check: (state) => state.streak >= 7,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: '30-day streak',
    icon: '\u26a1',
    check: (state) => state.streak >= 30,
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Save 20 questions',
    icon: '\u2764\ufe0f',
    check: (state) => (state.savedQuestions?.length || 0) >= 20,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Try all 7 relationships',
    icon: '\ud83e\udded',
    check: (state) => {
      const relationships = ['partner', 'friend', 'group', 'parent', 'sibling', 'kid', 'date'];
      return relationships.every(r => {
        const vibes = state.seen[r];
        return vibes && Object.values(vibes).some(arr => arr.length > 0);
      });
    },
  },
  {
    id: 'vibe-check',
    name: 'Vibe Check',
    description: 'Try all 6 vibes',
    icon: '\u2728',
    check: (state) => {
      const vibes = ['deep', 'funny', 'nostalgic', 'daring', 'flirty', 'real'];
      return vibes.every(v => {
        return Object.keys(state.seen).some(r => state.seen[r]?.[v]?.length > 0);
      });
    },
  },
  {
    id: 'went-there',
    name: 'Went There',
    description: 'Complete all 32 combos',
    icon: '\ud83c\udfc6',
    check: (state) => {
      const combos = {
        partner: ['deep', 'funny', 'nostalgic', 'daring', 'flirty', 'real'],
        friend: ['deep', 'funny', 'nostalgic', 'daring', 'real'],
        group: ['deep', 'funny', 'nostalgic', 'daring'],
        parent: ['deep', 'funny', 'nostalgic', 'daring', 'real'],
        sibling: ['deep', 'funny', 'nostalgic', 'daring', 'real'],
        kid: ['deep', 'funny', 'nostalgic', 'real'],
        date: ['deep', 'funny', 'daring', 'flirty'],
      };
      return Object.entries(combos).every(([r, vibes]) =>
        vibes.every(v => state.completed[r]?.[v] || false)
      );
    },
  },
];

export default badges;
