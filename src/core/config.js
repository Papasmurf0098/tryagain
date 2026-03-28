export const TILE = 48;
export const VIRTUAL_WIDTH = 960;
export const VIRTUAL_HEIGHT = 576;

export const TILE_COLORS = {
  '.': '#86c06c',
  '#': '#2f4858',
  '~': '#2a7faa',
  'g': '#5a9c3f',
  's': '#d8c27b',
  't': '#2f6b2d',
  'w': '#9e6cff',
};

export const TILE_LABELS = {
  '.': 'field',
  '#': 'wall',
  '~': 'water',
  'g': 'grass',
  's': 'marker',
  't': 'tree',
  'w': 'warp',
};

export const ACTIONS = [
  { label: '1. Strike', moveSlot: 0 },
  { label: '2. Power Move', moveSlot: 1 },
  { label: '3. Tonic', action: 'heal' },
  { label: '4. Run', action: 'run' },
];
