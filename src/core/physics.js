export const WALKABLE_TILES = new Set(['.', 'g', 's', 'w', 'd', 'f', 'u']);

export function isTileWalkable(tile) {
  return WALKABLE_TILES.has(tile);
}

export function lerp(start, end, alpha) {
  return start + (end - start) * alpha;
}

export function easeInOutQuad(timeFraction) {
  if (timeFraction < 0.5) return 2 * timeFraction * timeFraction;
  return 1 - ((-2 * timeFraction + 2) ** 2) / 2;
}
