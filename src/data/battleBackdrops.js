export const BATTLE_BACKDROPS = {
  'island-meadow': {
    key: 'island-meadow',
    imageKey: 'battle-backdrop-island-meadow',
    scene: 'meadow',
    label: 'Isla Primer Paso',
    skyTop: '#74b8e8',
    skyBottom: '#dff3ff',
    horizonColor: '#95c873',
    farColor: '#4f8252',
    midColor: '#2f5b35',
    groundColor: '#d7ef9f',
    accentColor: '#ffe9a8',
  },
  'coast-shore': {
    key: 'coast-shore',
    imageKey: 'battle-backdrop-coast-shore',
    scene: 'coast',
    label: 'Bahia Brisa',
    skyTop: '#6ab6ef',
    skyBottom: '#e7f7ff',
    horizonColor: '#4ca6c7',
    farColor: '#2a799c',
    midColor: '#24596f',
    groundColor: '#d8efb2',
    accentColor: '#fff0bf',
  },
  'grove-canopy': {
    key: 'grove-canopy',
    imageKey: 'battle-backdrop-grove-canopy',
    scene: 'grove',
    label: 'Bosque Solseta',
    skyTop: '#6aa468',
    skyBottom: '#e6f7d1',
    horizonColor: '#76995d',
    farColor: '#406735',
    midColor: '#274826',
    groundColor: '#cce38d',
    accentColor: '#ffe4a8',
  },
};

export function getBattleBackdropDefinition(key) {
  return BATTLE_BACKDROPS[key] || BATTLE_BACKDROPS['island-meadow'];
}
