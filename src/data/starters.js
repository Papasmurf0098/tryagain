export const STARTER_TRIO = [
  {
    key: 'Flameling',
    title: 'Flameling',
    role: 'Fast ember striker',
    summary: 'A bold spark-cub that wins early fights with speed, pressure, and fearless momentum.',
  },
  {
    key: 'Brookit',
    title: 'Brookit',
    role: 'Balanced tide tactician',
    summary: 'A playful river scout that balances control, durability, and steady ranged pressure.',
  },
  {
    key: 'Mosslet',
    title: 'Mosslet',
    role: 'Patient moss guardian',
    summary: 'A careful root-tailed hatchling that rewards defensive play and route endurance.',
  },
];

export function isStarterKey(key) {
  return STARTER_TRIO.some((starter) => starter.key === key);
}

export function getStarterDefinition(key) {
  return STARTER_TRIO.find((starter) => starter.key === key) || null;
}
