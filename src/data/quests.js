export const QUESTS = {
  'first-expedition': {
    key: 'first-expedition',
    title: 'First Expedition',
    steps: [
      {
        id: 'meet-tala',
        objective: 'Visit Tala in Primer Cottage for your sendoff and field guide.',
      },
      {
        id: 'defeat-rian',
        objective: 'Cross Primer Paso and defeat Rian on the road.',
        trigger: { type: 'trainer_defeated', trainerId: 'rian' },
      },
      {
        id: 'visit-harbor-shop',
        objective: 'Enter Harbor House in Bahia Brisa and stock up on supplies.',
        trigger: { type: 'shop_visited' },
      },
      {
        id: 'challenge-marza',
        objective: 'Challenge Leader Marza in Harbor House and earn the Coast Badge.',
        trigger: { type: 'trainer_defeated', trainerId: 'marza' },
      },
      {
        id: 'clear-brambles',
        objective: 'Use Shearvine to cut through the thorn wall in Bosque Solseta.',
        trigger: { type: 'field_gate_cleared', gateId: 'sunspore-bramble' },
      },
    ],
    completionText: 'The coast route is open. Bosque Solseta now has a deeper path waiting for you.',
  },
};
