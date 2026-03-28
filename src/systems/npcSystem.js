import { chance, random, rngInt } from '../core/utils.js';
import { easeInOutQuad, lerp } from '../core/physics.js';

const DIRECTION_STEPS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

const DIRECTION_KEYS = Object.keys(DIRECTION_STEPS);

export class NPCSystem {
  constructor() {
    this.runtimeByMap = new Map();
  }

  ensureMap(map) {
    const definitions = map.npcs || [];
    const existing = this.runtimeByMap.get(map.key);
    if (existing && existing.length === definitions.length) return existing;

    const runtime = definitions.map((definition, index) => this.createRuntime(definition, index));
    this.runtimeByMap.set(map.key, runtime);
    return runtime;
  }

  createRuntime(definition, index) {
    return {
      ...definition,
      appearance: { ...(definition.appearance || {}) },
      trainer: definition.trainer ? { ...definition.trainer } : null,
      x: definition.x,
      y: definition.y,
      facing: definition.facing || 'down',
      homeX: definition.x,
      homeY: definition.y,
      routeIndex: 0,
      wait: definition.behavior?.initialDelay ?? (0.18 * index),
      motion: null,
      phase: index * 0.71 + random() * 0.5,
    };
  }

  update(map, deltaSeconds, isBlocked) {
    const runtime = this.ensureMap(map);

    for (const npc of runtime) this.updateMotion(npc, deltaSeconds);
    for (const npc of runtime) this.updateIntent(npc, deltaSeconds, isBlocked);
  }


  updateMotionOnly(map, deltaSeconds) {
    for (const npc of this.ensureMap(map)) this.updateMotion(npc, deltaSeconds);
  }

  updateMotion(npc, deltaSeconds) {
    if (!npc.motion) return;
    npc.motion.elapsed += deltaSeconds;
    if (npc.motion.elapsed < npc.motion.duration) return;

    npc.x = npc.motion.toX;
    npc.y = npc.motion.toY;
    npc.motion = null;
    npc.wait = npc.behavior?.pause ?? 0.42;
  }

  updateIntent(npc, deltaSeconds, isBlocked) {
    if (npc.motion) return;

    npc.wait -= deltaSeconds;
    if (npc.wait > 0) return;

    const behaviorType = npc.behavior?.type || 'stationary';
    if (behaviorType === 'stationary') {
      if (chance(0.4)) npc.facing = DIRECTION_KEYS[rngInt(0, DIRECTION_KEYS.length)];
      npc.wait = 1 + random() * 1.35;
      return;
    }

    const step = behaviorType === 'patrol'
      ? this.getPatrolStep(npc)
      : this.getWanderStep(npc);

    if (!step) {
      npc.wait = 0.35 + random() * 0.5;
      return;
    }

    const nextX = npc.x + step.dx;
    const nextY = npc.y + step.dy;
    npc.facing = step.direction;

    if (isBlocked(nextX, nextY, npc.id) || !this.withinZone(npc, nextX, nextY)) {
      npc.wait = 0.3 + random() * 0.45;
      return;
    }

    this.forceMoveTo(npc, nextX, nextY, npc.behavior?.moveDuration ?? 0.19);
  }

  forceMoveTo(npc, nextX, nextY, duration = 0.18) {
    const dx = Math.sign(nextX - npc.x);
    const dy = Math.sign(nextY - npc.y);
    if (dx > 0) npc.facing = 'right';
    else if (dx < 0) npc.facing = 'left';
    else if (dy > 0) npc.facing = 'down';
    else if (dy < 0) npc.facing = 'up';

    npc.motion = {
      fromX: npc.x,
      fromY: npc.y,
      toX: nextX,
      toY: nextY,
      dx,
      dy,
      elapsed: 0,
      duration,
    };
  }

  getPatrolStep(npc) {
    const route = npc.behavior?.route || [];
    if (!route.length) return null;
    const direction = route[npc.routeIndex % route.length];
    npc.routeIndex = (npc.routeIndex + 1) % route.length;
    return { direction, ...DIRECTION_STEPS[direction] };
  }

  getWanderStep(npc) {
    if (chance(0.28)) {
      npc.facing = DIRECTION_KEYS[rngInt(0, DIRECTION_KEYS.length)];
      return null;
    }

    const candidates = [...DIRECTION_KEYS]
      .sort(() => random() - 0.5)
      .map((direction) => ({ direction, ...DIRECTION_STEPS[direction] }));

    return candidates[0] || null;
  }

  withinZone(npc, nextX, nextY) {
    const zone = npc.behavior?.zone;
    if (!zone) return true;
    return nextX >= zone.minX && nextX <= zone.maxX && nextY >= zone.minY && nextY <= zone.maxY;
  }

  getOccupiedPosition(npc) {
    if (npc.motion) return { x: npc.motion.toX, y: npc.motion.toY };
    return { x: npc.x, y: npc.y };
  }

  isOccupied(map, x, y, ignoreId = null) {
    return this.ensureMap(map).some((npc) => {
      if (npc.id === ignoreId) return false;
      const occupied = this.getOccupiedPosition(npc);
      return occupied.x === x && occupied.y === y;
    });
  }

  getAt(map, x, y) {
    return this.ensureMap(map).find((npc) => {
      const occupied = this.getOccupiedPosition(npc);
      return occupied.x === x && occupied.y === y;
    }) || null;
  }

  getById(map, id) {
    return this.ensureMap(map).find((npc) => npc.id === id) || null;
  }

  getAll(map) {
    return this.ensureMap(map);
  }

  getRenderables(map) {
    return this.ensureMap(map).map((npc) => {
      let renderX = npc.x;
      let renderY = npc.y;
      let moveDx = 0;
      let moveDy = 0;
      let moveProgress = 0;

      if (npc.motion) {
        const progress = easeInOutQuad(Math.min(1, npc.motion.elapsed / npc.motion.duration));
        renderX = lerp(npc.motion.fromX, npc.motion.toX, progress);
        renderY = lerp(npc.motion.fromY, npc.motion.toY, progress);
        moveDx = npc.motion.dx;
        moveDy = npc.motion.dy;
        moveProgress = progress;
      }

      return {
        ...npc,
        renderX,
        renderY,
        animation: { moveDx, moveDy, moveProgress, bumpDx: 0, bumpDy: 0, bumpProgress: 0 },
      };
    });
  }
}
