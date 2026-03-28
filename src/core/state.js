export function createInitialState(game) {
  return {
    currentMapKey: 'island-start',
    encounterCooldown: 0,
    clock: 0,
    player: {
      name: 'Joey',
      x: 4,
      y: 9,
      facing: 'right',
      steps: 0,
      party: [game.createCreatureInstance('Flameling', 5)],
      inventory: { tonic: 3 },
    },
    battle: null,
    flags: {
      shrineVisited: false,
      defeatedTrainers: {},
    },
  };
}
