import { PARTY_LIMIT } from './config.js';
import { clamp } from './utils.js';

export function createInitialState() {
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
      starterKey: null,
      party: [],
      storage: [],
      money: 120,
      inventory: { tonic: 3, snareOrb: 5 },
    },
    codex: {
      seen: {},
      caught: {},
    },
    quests: {},
    battle: null,
    flags: {
      starterChosen: false,
      rivalStarterKey: null,
      shrineVisited: false,
      talaBriefed: false,
      harborShopVisited: false,
      badges: {},
      fieldAbilities: {},
      defeatedTrainers: {},
      clearedFieldGates: {},
      collectedInteractions: {},
    },
  };
}

export function hydrateState(baseState, rawState) {
  if (!isObject(rawState)) return cloneState(baseState);

  const player = isObject(rawState.player) ? rawState.player : {};
  const flags = isObject(rawState.flags) ? rawState.flags : {};
  const normalizedPartySource = normalizeCreatureCollection(player.party, baseState.player.party);
  const normalizedParty = normalizedPartySource.slice(0, PARTY_LIMIT);
  const normalizedStorage = [
    ...normalizeCreatureCollection(player.storage, baseState.player.storage),
    ...normalizedPartySource.slice(PARTY_LIMIT),
  ];
  const starterKey = normalizeString(player.starterKey, normalizedParty[0]?.key || baseState.player.starterKey);
  const codex = normalizeCodex(rawState.codex, [...normalizedParty, ...normalizedStorage]);

  return {
    ...cloneState(baseState),
    currentMapKey: typeof rawState.currentMapKey === 'string' ? rawState.currentMapKey : baseState.currentMapKey,
    encounterCooldown: normalizeNumber(rawState.encounterCooldown, baseState.encounterCooldown, 0),
    clock: normalizeNumber(rawState.clock, baseState.clock, 0),
    player: {
      ...clonePlayer(baseState.player),
      name: typeof player.name === 'string' && player.name.trim().length > 0 ? player.name : baseState.player.name,
      x: normalizeInteger(player.x, baseState.player.x),
      y: normalizeInteger(player.y, baseState.player.y),
      facing: normalizeFacing(player.facing, baseState.player.facing),
      steps: normalizeInteger(player.steps, baseState.player.steps, 0),
      starterKey,
      party: normalizedParty,
      storage: normalizedStorage,
      money: normalizeInteger(player.money, baseState.player.money, 0),
      inventory: normalizeInventory(player.inventory, baseState.player.inventory),
    },
    codex,
    quests: normalizeQuestStates(rawState.quests),
    battle: null,
    flags: {
      ...baseState.flags,
      starterChosen: Boolean(flags.starterChosen) || Boolean(starterKey) || normalizedParty.length > 0,
      rivalStarterKey: normalizeString(flags.rivalStarterKey, baseState.flags.rivalStarterKey),
      shrineVisited: Boolean(flags.shrineVisited),
      talaBriefed: Boolean(flags.talaBriefed),
      harborShopVisited: Boolean(flags.harborShopVisited),
      badges: normalizeBadgeRecord(flags.badges),
      fieldAbilities: normalizeBooleanRecord(flags.fieldAbilities),
      defeatedTrainers: normalizeBooleanRecord(flags.defeatedTrainers),
      clearedFieldGates: normalizeBooleanRecord(flags.clearedFieldGates),
      collectedInteractions: normalizeBooleanRecord(flags.collectedInteractions),
    },
  };
}

export function createSaveStateSnapshot(state) {
  const normalizedPartySource = normalizeCreatureCollection(state.player?.party, []);
  const normalizedParty = normalizedPartySource.slice(0, PARTY_LIMIT);
  const normalizedStorage = [
    ...normalizeCreatureCollection(state.player?.storage, []),
    ...normalizedPartySource.slice(PARTY_LIMIT),
  ];

  return {
    currentMapKey: typeof state.currentMapKey === 'string' ? state.currentMapKey : 'island-start',
    encounterCooldown: normalizeNumber(state.encounterCooldown, 0, 0),
    clock: normalizeNumber(state.clock, 0, 0),
    player: {
      name: typeof state.player?.name === 'string' && state.player.name.trim().length > 0 ? state.player.name : 'Joey',
      x: normalizeInteger(state.player?.x, 4),
      y: normalizeInteger(state.player?.y, 9),
      facing: normalizeFacing(state.player?.facing, 'down'),
      steps: normalizeInteger(state.player?.steps, 0, 0),
      starterKey: normalizeString(state.player?.starterKey, normalizedParty[0]?.key || null),
      party: normalizedParty,
      storage: normalizedStorage,
      money: normalizeInteger(state.player?.money, 0, 0),
      inventory: normalizeInventory(state.player?.inventory, { tonic: 0, snareOrb: 0 }),
    },
    codex: normalizeCodex(state.codex, [...normalizedParty, ...normalizedStorage]),
    quests: normalizeQuestStates(state.quests),
    flags: {
      starterChosen: Boolean(state.flags?.starterChosen) || normalizedParty.length > 0,
      rivalStarterKey: normalizeString(state.flags?.rivalStarterKey, null),
      shrineVisited: Boolean(state.flags?.shrineVisited),
      talaBriefed: Boolean(state.flags?.talaBriefed),
      harborShopVisited: Boolean(state.flags?.harborShopVisited),
      badges: normalizeBadgeRecord(state.flags?.badges),
      fieldAbilities: normalizeBooleanRecord(state.flags?.fieldAbilities),
      defeatedTrainers: normalizeBooleanRecord(state.flags?.defeatedTrainers),
      clearedFieldGates: normalizeBooleanRecord(state.flags?.clearedFieldGates),
      collectedInteractions: normalizeBooleanRecord(state.flags?.collectedInteractions),
    },
  };
}

function normalizeCreatureCollection(rawCollection, fallbackCollection = []) {
  const source = Array.isArray(rawCollection) ? rawCollection : fallbackCollection;
  const fallback = Array.isArray(fallbackCollection) ? fallbackCollection : [];
  const normalized = source
    .map((creature, index) => normalizeCreatureInstance(creature, fallback[index]))
    .filter(Boolean);

  return normalized.length > 0
    ? normalized
    : fallback.map((creature) => normalizeCreatureInstance(creature)).filter(Boolean);
}

function normalizeCreatureInstance(rawCreature, fallbackCreature = null) {
  if (!isObject(rawCreature) && !fallbackCreature) return null;

  const source = isObject(rawCreature) ? rawCreature : {};
  const fallback = fallbackCreature || {};
  const level = normalizeInteger(source.level, fallback.level ?? 1, 1);
  const maxHp = normalizeInteger(source.maxHp, fallback.maxHp ?? 1, 1);

  return {
    key: normalizeString(source.key, fallback.key ?? 'Unknown'),
    name: normalizeString(source.name, fallback.name ?? 'Unknown'),
    type: normalizeString(source.type, fallback.type ?? 'Normal'),
    color: normalizeString(source.color, fallback.color ?? '#ffffff'),
    level,
    maxHp,
    hp: clamp(normalizeInteger(source.hp, fallback.hp ?? maxHp, 0), 0, maxHp),
    attack: normalizeInteger(source.attack, fallback.attack ?? 1, 1),
    defense: normalizeInteger(source.defense, fallback.defense ?? 1, 1),
    speed: normalizeInteger(source.speed, fallback.speed ?? 1, 1),
    moves: normalizeMoveList(source.moves, fallback.moves ?? []),
    experience: normalizeInteger(source.experience, fallback.experience ?? 0, 0),
  };
}

function normalizeMoveList(moves, fallbackMoves) {
  const source = Array.isArray(moves) ? moves : fallbackMoves;
  const normalized = source.filter((move) => typeof move === 'string' && move.trim().length > 0);
  return normalized.length > 0 ? [...normalized] : [...fallbackMoves];
}

function normalizeInventory(rawInventory, fallbackInventory) {
  const inventory = { ...fallbackInventory };
  if (!isObject(rawInventory)) return inventory;

  for (const [key, value] of Object.entries(rawInventory)) {
    const amount = normalizeInteger(value, inventory[key] ?? 0, 0);
    inventory[key] = amount;
  }

  return inventory;
}

function normalizeCodex(rawCodex, ownedCreatures = []) {
  const codex = isObject(rawCodex) ? rawCodex : {};
  const seen = normalizeBooleanRecord(codex.seen);
  const caught = normalizeBooleanRecord(codex.caught);

  for (const key of Object.keys(caught)) seen[key] = true;
  for (const creature of ownedCreatures) {
    if (!creature?.key) continue;
    seen[creature.key] = true;
    caught[creature.key] = true;
  }

  return { seen, caught };
}

function normalizeBooleanRecord(rawRecord) {
  if (!isObject(rawRecord)) return {};
  return Object.fromEntries(
    Object.entries(rawRecord)
      .filter(([key]) => typeof key === 'string' && key.trim().length > 0)
      .map(([key, value]) => [key, Boolean(value)]),
  );
}

function normalizeBadgeRecord(rawRecord) {
  if (!isObject(rawRecord)) return {};
  return Object.fromEntries(
    Object.entries(rawRecord)
      .filter(([key]) => typeof key === 'string' && key.trim().length > 0)
      .map(([key, value]) => [key, typeof value === 'string' && value.trim().length > 0 ? value : Boolean(value)]),
  );
}

function normalizeQuestStates(rawQuests) {
  if (!isObject(rawQuests)) return {};
  return Object.fromEntries(
    Object.entries(rawQuests)
      .filter(([key, value]) => typeof key === 'string' && key.trim().length > 0 && isObject(value))
      .map(([key, value]) => [key, {
        status: ['inactive', 'active', 'completed'].includes(value.status) ? value.status : 'inactive',
        stepIndex: normalizeInteger(value.stepIndex, 0, 0),
      }]),
  );
}

function normalizeFacing(value, fallback) {
  return ['up', 'down', 'left', 'right'].includes(value) ? value : fallback;
}

function normalizeNumber(value, fallback, min = Number.NEGATIVE_INFINITY) {
  return Number.isFinite(value) ? Math.max(min, value) : fallback;
}

function normalizeInteger(value, fallback, min = Number.NEGATIVE_INFINITY) {
  return Number.isInteger(value) ? Math.max(min, value) : fallback;
}

function normalizeString(value, fallback) {
  if (fallback == null && (value == null || value === '')) return null;
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function cloneState(state) {
  return {
    ...state,
    player: clonePlayer(state.player),
    codex: {
      seen: { ...(state.codex?.seen || {}) },
      caught: { ...(state.codex?.caught || {}) },
    },
    quests: normalizeQuestStates(state.quests),
    battle: null,
    flags: {
      ...state.flags,
      rivalStarterKey: state.flags?.rivalStarterKey || null,
      talaBriefed: Boolean(state.flags?.talaBriefed),
      harborShopVisited: Boolean(state.flags?.harborShopVisited),
      badges: { ...(state.flags?.badges || {}) },
      fieldAbilities: { ...(state.flags?.fieldAbilities || {}) },
      defeatedTrainers: { ...(state.flags?.defeatedTrainers || {}) },
      clearedFieldGates: { ...(state.flags?.clearedFieldGates || {}) },
      collectedInteractions: { ...(state.flags?.collectedInteractions || {}) },
    },
  };
}

function clonePlayer(player) {
  return {
    ...player,
    starterKey: player.starterKey || null,
    party: Array.isArray(player.party)
      ? player.party.map((creature) => normalizeCreatureInstance(creature)).filter(Boolean)
      : [],
    storage: Array.isArray(player.storage)
      ? player.storage.map((creature) => normalizeCreatureInstance(creature)).filter(Boolean)
      : [],
    money: normalizeInteger(player.money, 0, 0),
    inventory: { ...(player.inventory || {}) },
  };
}

function isObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}
