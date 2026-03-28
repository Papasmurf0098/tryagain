export const TILE = 48;
export const VIRTUAL_WIDTH = 960;
export const VIRTUAL_HEIGHT = 576;
export const PARTY_LIMIT = 6;

export const TILE_COLORS = {
  '.': '#86c06c',
  '#': '#2f4858',
  '~': '#2a7faa',
  'g': '#5a9c3f',
  'v': '#4d7f31',
  's': '#d8c27b',
  't': '#2f6b2d',
  'w': '#9e6cff',
  'r': '#a65d44',
  'b': '#c7b28a',
  'd': '#7a4a2a',
  'f': '#b89363',
  'u': '#ab5b4b',
  'c': '#6b4a36',
  'k': '#8a643c',
  'p': '#527349',
  'i': '#8b7b63',
};

export const TILE_LABELS = {
  '.': 'field',
  '#': 'wall',
  '~': 'water',
  'g': 'grass',
  'v': 'bramble wall',
  's': 'marker',
  't': 'tree',
  'w': 'warp',
  'r': 'roof',
  'b': 'building wall',
  'd': 'door',
  'f': 'floor',
  'u': 'rug',
  'c': 'counter',
  'k': 'shelf',
  'p': 'decor',
  'i': 'interior wall',
};

export const ACTIONS = [
  { label: '1. Strike', moveSlot: 0 },
  { label: '2. Power Move', moveSlot: 1 },
  { label: '3. Item', action: 'item' },
  { label: '4. Run', action: 'run' },
];
