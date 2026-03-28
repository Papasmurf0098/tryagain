import { CREATURES } from './creatures.js';
import { ITEMS } from './items.js';
import { MAPS } from './maps.js';
import { MOVES } from './moves.js';
import { QUESTS } from './quests.js';
import { TYPE_CHART } from './types.js';

function fail(message) {
  throw new Error(`[DataRegistry] ${message}`);
}

function expect(condition, message) {
  if (!condition) fail(message);
}

function isObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function isDirection(value) {
  return ['up', 'down', 'left', 'right'].includes(value);
}

function validateScripts(script, label) {
  expect(Array.isArray(script), `${label} must be an array.`);
  for (const [index, block] of script.entries()) {
    validateScriptBlock(block, `${label}[${index}]`);
  }
}

function validateScriptBlock(block, label) {
  expect(isObject(block), `${label} must be an object.`);

  if (typeof block.type !== 'string') {
    expect(typeof block.text === 'string' && block.text.trim().length > 0, `${label} needs text.`);
    if (block.speaker != null) expect(typeof block.speaker === 'string', `${label}.speaker must be a string.`);
    return;
  }

  expect(block.type.trim().length > 0, `${label}.type must be a non-empty string.`);
  if (block.type === 'say') {
    expect(typeof block.text === 'string' && block.text.trim().length > 0, `${label}.text is required for say commands.`);
    if (block.speaker != null) expect(typeof block.speaker === 'string', `${label}.speaker must be a string.`);
  }

  if (block.type === 'ifFlag') {
    expect(typeof block.key === 'string' && block.key.trim().length > 0, `${label}.key is required for ifFlag.`);
    if (block.then != null) validateScripts(block.then, `${label}.then`);
    if (block.else != null) validateScripts(block.else, `${label}.else`);
  }

  if (block.type === 'branchLastBattle') {
    if (block.won != null) validateScripts(block.won, `${label}.won`);
    if (block.lost != null) validateScripts(block.lost, `${label}.lost`);
  }
}

function validateTypeChart() {
  const validTypes = new Set(Object.keys(TYPE_CHART));
  expect(validTypes.size > 0, 'TYPE_CHART must define at least one type.');

  for (const [attackType, matchup] of Object.entries(TYPE_CHART)) {
    expect(isObject(matchup), `TYPE_CHART.${attackType} must be an object.`);
    for (const [defenseType, modifier] of Object.entries(matchup)) {
      expect(validTypes.has(defenseType), `TYPE_CHART.${attackType}.${defenseType} references an unknown defense type.`);
      expect(Number.isFinite(modifier), `TYPE_CHART.${attackType}.${defenseType} must be numeric.`);
    }
  }

  return validTypes;
}

function validateMoves(validTypes) {
  const moveKeys = new Set(Object.keys(MOVES));
  expect(moveKeys.size > 0, 'MOVES must define at least one move.');

  for (const [key, move] of Object.entries(MOVES)) {
    expect(isObject(move), `MOVES.${key} must be an object.`);
    expect(move.key === key, `MOVES.${key}.key must match its registry key.`);
    expect(typeof move.name === 'string' && move.name.trim().length > 0, `MOVES.${key}.name is required.`);
    expect(validTypes.has(move.type), `MOVES.${key}.type references an unknown type.`);
    expect(Number.isFinite(move.power), `MOVES.${key}.power must be numeric.`);
    expect(Number.isFinite(move.accuracy) && move.accuracy >= 0 && move.accuracy <= 1, `MOVES.${key}.accuracy must be between 0 and 1.`);
  }

  return moveKeys;
}

function validateItems() {
  const itemKeys = new Set(Object.keys(ITEMS));
  expect(itemKeys.size > 0, 'ITEMS must define at least one item.');

  for (const [key, item] of Object.entries(ITEMS)) {
    expect(isObject(item), `ITEMS.${key} must be an object.`);
    expect(item.key === key, `ITEMS.${key}.key must match its registry key.`);
    expect(typeof item.name === 'string' && item.name.trim().length > 0, `ITEMS.${key}.name is required.`);
    expect(typeof item.kind === 'string' && item.kind.trim().length > 0, `ITEMS.${key}.kind is required.`);
    if (item.price != null) expect(Number.isInteger(item.price) && item.price >= 0, `ITEMS.${key}.price must be >= 0.`);
  }

  return itemKeys;
}

function validateCreatures(validTypes, moveKeys) {
  const creatureKeys = new Set(Object.keys(CREATURES));
  expect(creatureKeys.size > 0, 'CREATURES must define at least one creature.');

  for (const [key, creature] of Object.entries(CREATURES)) {
    expect(isObject(creature), `CREATURES.${key} must be an object.`);
    expect(typeof creature.name === 'string' && creature.name.trim().length > 0, `CREATURES.${key}.name is required.`);
    expect(validTypes.has(creature.type), `CREATURES.${key}.type references an unknown type.`);
    expect(typeof creature.color === 'string' && creature.color.startsWith('#'), `CREATURES.${key}.color must be a hex string.`);
    if (creature.category != null) expect(typeof creature.category === 'string' && creature.category.trim().length > 0, `CREATURES.${key}.category must be a non-empty string.`);
    if (creature.habitats != null) {
      expect(Array.isArray(creature.habitats) && creature.habitats.length > 0, `CREATURES.${key}.habitats must be a non-empty array when provided.`);
      for (const [index, habitat] of creature.habitats.entries()) {
        expect(typeof habitat === 'string' && habitat.trim().length > 0, `CREATURES.${key}.habitats[${index}] must be a string.`);
      }
    }
    expect(Number.isFinite(creature.baseHp) && creature.baseHp > 0, `CREATURES.${key}.baseHp must be > 0.`);
    expect(Number.isFinite(creature.baseAttack) && creature.baseAttack > 0, `CREATURES.${key}.baseAttack must be > 0.`);
    expect(Number.isFinite(creature.baseDefense) && creature.baseDefense > 0, `CREATURES.${key}.baseDefense must be > 0.`);
    expect(Number.isFinite(creature.baseSpeed) && creature.baseSpeed > 0, `CREATURES.${key}.baseSpeed must be > 0.`);
    expect(Array.isArray(creature.moves) && creature.moves.length > 0, `CREATURES.${key}.moves must include at least one move.`);
    for (const moveKey of creature.moves) {
      expect(moveKeys.has(moveKey), `CREATURES.${key} references unknown move ${moveKey}.`);
    }
  }

  return creatureKeys;
}

function validateNpc(npc, mapKey, creatureKeys, mapKeys) {
  expect(isObject(npc), `MAPS.${mapKey}.npcs entries must be objects.`);
  expect(typeof npc.id === 'string' && npc.id.trim().length > 0, `MAPS.${mapKey} NPCs need an id.`);
  expect(typeof npc.name === 'string' && npc.name.trim().length > 0, `MAPS.${mapKey}.${npc.id}.name is required.`);
  expect(Number.isInteger(npc.x) && Number.isInteger(npc.y), `MAPS.${mapKey}.${npc.id} requires integer coordinates.`);

  if (npc.script) validateScripts(npc.script, `MAPS.${mapKey}.${npc.id}.script`);

  if (!npc.trainer) return;

  expect(Number.isInteger(npc.trainer.sightRange) && npc.trainer.sightRange > 0, `MAPS.${mapKey}.${npc.id}.trainer.sightRange must be > 0.`);
  const hasStaticTeam = Array.isArray(npc.trainer.team) && npc.trainer.team.length > 0;
  const hasDynamicTeam = typeof npc.trainer.dynamicTeam === 'string' && npc.trainer.dynamicTeam.trim().length > 0;
  expect(hasStaticTeam || hasDynamicTeam, `MAPS.${mapKey}.${npc.id}.trainer needs a team or dynamicTeam.`);
  if (npc.trainer.introScript) validateScripts(npc.trainer.introScript, `MAPS.${mapKey}.${npc.id}.trainer.introScript`);
  if (npc.trainer.defeatedScript) validateScripts(npc.trainer.defeatedScript, `MAPS.${mapKey}.${npc.id}.trainer.defeatedScript`);

  for (const [index, member] of (npc.trainer.team || []).entries()) {
    expect(isObject(member), `MAPS.${mapKey}.${npc.id}.trainer.team[${index}] must be an object.`);
    expect(creatureKeys.has(member.key), `MAPS.${mapKey}.${npc.id}.trainer.team[${index}] references unknown creature ${member.key}.`);
    expect(Number.isInteger(member.level) && member.level > 0, `MAPS.${mapKey}.${npc.id}.trainer.team[${index}].level must be > 0.`);
  }

  for (const warp of npc.trainer.requiredMapKeys || []) {
    expect(mapKeys.has(warp), `MAPS.${mapKey}.${npc.id}.trainer.requiredMapKeys references unknown map ${warp}.`);
  }
}

function validateEncounterEntries(encounters, label, creatureKeys) {
  expect(Array.isArray(encounters), `${label} must be an array.`);

  for (const [index, encounter] of encounters.entries()) {
    expect(isObject(encounter), `${label}[${index}] must be an object.`);
    expect(creatureKeys.has(encounter.key), `${label}[${index}] references unknown creature ${encounter.key}.`);
    if (encounter.weight != null) {
      expect(Number.isFinite(encounter.weight) && encounter.weight > 0, `${label}[${index}].weight must be > 0.`);
    }
    if (encounter.minLevel != null) {
      expect(Number.isInteger(encounter.minLevel) && encounter.minLevel > 0, `${label}[${index}].minLevel must be > 0.`);
    }
    if (encounter.maxLevel != null) {
      expect(Number.isInteger(encounter.maxLevel) && encounter.maxLevel > 0, `${label}[${index}].maxLevel must be > 0.`);
    }
    if (encounter.minLevel != null && encounter.maxLevel != null) {
      expect(encounter.maxLevel >= encounter.minLevel, `${label}[${index}].maxLevel must be >= minLevel.`);
    }
  }
}

function validateMaps(creatureKeys, itemKeys) {
  const mapKeys = new Set(Object.keys(MAPS));
  expect(mapKeys.size > 0, 'MAPS must define at least one map.');

  for (const [mapKey, map] of Object.entries(MAPS)) {
    expect(isObject(map), `MAPS.${mapKey} must be an object.`);
    expect(map.key === mapKey, `MAPS.${mapKey}.key must match its registry key.`);
    expect(Array.isArray(map.tiles) && map.tiles.length === map.height, `MAPS.${mapKey}.tiles must contain map.height rows.`);
    expect(Number.isInteger(map.width) && map.width > 0, `MAPS.${mapKey}.width must be > 0.`);
    expect(Number.isInteger(map.height) && map.height > 0, `MAPS.${mapKey}.height must be > 0.`);
    if (map.battleBackdropKey != null) expect(typeof map.battleBackdropKey === 'string', `MAPS.${mapKey}.battleBackdropKey must be a string.`);
    if (map.encounterRate != null) {
      expect(Number.isFinite(map.encounterRate) && map.encounterRate >= 0 && map.encounterRate <= 1, `MAPS.${mapKey}.encounterRate must be between 0 and 1.`);
    }

    for (const [rowIndex, row] of map.tiles.entries()) {
      expect(Array.isArray(row) && row.length === map.width, `MAPS.${mapKey}.tiles[${rowIndex}] must contain map.width columns.`);
    }

    const encounters = map.encounters || [];
    if ((map.encounterRate ?? 0) > 0 || encounters.length > 0) {
      expect(encounters.length > 0, `MAPS.${mapKey}.encounters must include at least one encounter when encounterRate is active.`);
      validateEncounterEntries(encounters, `MAPS.${mapKey}.encounters`, creatureKeys);
    }

    for (const [index, warp] of (map.warps || []).entries()) {
      expect(isObject(warp), `MAPS.${mapKey}.warps[${index}] must be an object.`);
      expect(mapKeys.has(warp.toMapKey), `MAPS.${mapKey}.warps[${index}] references unknown map ${warp.toMapKey}.`);
      expect(Number.isInteger(warp.x) && Number.isInteger(warp.y), `MAPS.${mapKey}.warps[${index}] requires integer source coordinates.`);
      expect(Number.isInteger(warp.toX) && Number.isInteger(warp.toY), `MAPS.${mapKey}.warps[${index}] requires integer destination coordinates.`);
      if (warp.facing != null) expect(isDirection(warp.facing), `MAPS.${mapKey}.warps[${index}].facing must be a direction.`);
      if (warp.kind != null) expect(typeof warp.kind === 'string' && warp.kind.trim().length > 0, `MAPS.${mapKey}.warps[${index}].kind must be a non-empty string.`);
    }

    for (const [index, connection] of (map.connections || []).entries()) {
      expect(isObject(connection), `MAPS.${mapKey}.connections[${index}] must be an object.`);
      expect(['up', 'down', 'left', 'right'].includes(connection.edge), `MAPS.${mapKey}.connections[${index}].edge must be up/down/left/right.`);
      expect(Number.isInteger(connection.start) && Number.isInteger(connection.end), `MAPS.${mapKey}.connections[${index}] needs integer start/end bounds.`);
      expect(connection.end >= connection.start, `MAPS.${mapKey}.connections[${index}].end must be >= start.`);
      expect(mapKeys.has(connection.toMapKey), `MAPS.${mapKey}.connections[${index}] references unknown map ${connection.toMapKey}.`);
      expect(Number.isInteger(connection.toX) && Number.isInteger(connection.toY), `MAPS.${mapKey}.connections[${index}] requires integer destination coordinates.`);
      if (connection.facing != null) expect(isDirection(connection.facing), `MAPS.${mapKey}.connections[${index}].facing must be a direction.`);
      if (connection.kind != null) expect(typeof connection.kind === 'string' && connection.kind.trim().length > 0, `MAPS.${mapKey}.connections[${index}].kind must be a non-empty string.`);
    }

    for (const [index, interaction] of (map.interactions || []).entries()) {
      expect(isObject(interaction), `MAPS.${mapKey}.interactions[${index}] must be an object.`);
      expect(Number.isInteger(interaction.x) && Number.isInteger(interaction.y), `MAPS.${mapKey}.interactions[${index}] requires integer coordinates.`);
      expect(typeof interaction.type === 'string' && interaction.type.trim().length > 0, `MAPS.${mapKey}.interactions[${index}].type is required.`);
      if (interaction.id != null) expect(typeof interaction.id === 'string' && interaction.id.trim().length > 0, `MAPS.${mapKey}.interactions[${index}].id must be a non-empty string.`);
      if (interaction.script) validateScripts(interaction.script, `MAPS.${mapKey}.interactions[${index}].script`);
      if (interaction.type === 'pickup') {
        expect(typeof interaction.id === 'string' && interaction.id.trim().length > 0, `MAPS.${mapKey}.interactions[${index}] pickup requires an id.`);
        if (interaction.itemKey != null) expect(itemKeys.has(interaction.itemKey), `MAPS.${mapKey}.interactions[${index}] pickup references unknown item ${interaction.itemKey}.`);
        if (interaction.amount != null) expect(Number.isInteger(interaction.amount) && interaction.amount > 0, `MAPS.${mapKey}.interactions[${index}].amount must be > 0.`);
        if (interaction.money != null) expect(Number.isInteger(interaction.money) && interaction.money > 0, `MAPS.${mapKey}.interactions[${index}].money must be > 0.`);
        expect(interaction.itemKey != null || interaction.money != null, `MAPS.${mapKey}.interactions[${index}] pickup needs itemKey or money.`);
      }
    }

    for (const [index, gate] of (map.fieldGates || []).entries()) {
      expect(isObject(gate), `MAPS.${mapKey}.fieldGates[${index}] must be an object.`);
      expect(typeof gate.id === 'string' && gate.id.trim().length > 0, `MAPS.${mapKey}.fieldGates[${index}].id is required.`);
      expect(Number.isInteger(gate.x) && Number.isInteger(gate.y), `MAPS.${mapKey}.fieldGates[${index}] requires integer coordinates.`);
      expect(typeof gate.abilityKey === 'string' && gate.abilityKey.trim().length > 0, `MAPS.${mapKey}.fieldGates[${index}].abilityKey is required.`);
      if (gate.blockedScript) validateScripts(gate.blockedScript, `MAPS.${mapKey}.fieldGates[${index}].blockedScript`);
      if (gate.clearedScript) validateScripts(gate.clearedScript, `MAPS.${mapKey}.fieldGates[${index}].clearedScript`);
    }

    for (const npc of map.npcs || []) validateNpc(npc, mapKey, creatureKeys, mapKeys);
  }

  return mapKeys;
}

function validateQuests() {
  for (const [questId, quest] of Object.entries(QUESTS)) {
    expect(isObject(quest), `QUESTS.${questId} must be an object.`);
    expect(quest.key === questId, `QUESTS.${questId}.key must match its registry key.`);
    expect(typeof quest.title === 'string' && quest.title.trim().length > 0, `QUESTS.${questId}.title is required.`);
    expect(Array.isArray(quest.steps) && quest.steps.length > 0, `QUESTS.${questId}.steps must be a non-empty array.`);
    for (const [index, step] of quest.steps.entries()) {
      expect(isObject(step), `QUESTS.${questId}.steps[${index}] must be an object.`);
      expect(typeof step.id === 'string' && step.id.trim().length > 0, `QUESTS.${questId}.steps[${index}].id is required.`);
      expect(typeof step.objective === 'string' && step.objective.trim().length > 0, `QUESTS.${questId}.steps[${index}].objective is required.`);
    }
  }
}

function validateRegistry() {
  const validTypes = validateTypeChart();
  const moveKeys = validateMoves(validTypes);
  const itemKeys = validateItems();
  const creatureKeys = validateCreatures(validTypes, moveKeys);
  validateMaps(creatureKeys, itemKeys);
  validateQuests();
}

validateRegistry();

export const DATA_REGISTRY = Object.freeze({
  creatures: CREATURES,
  items: ITEMS,
  moves: MOVES,
  maps: MAPS,
  quests: QUESTS,
  types: TYPE_CHART,
});

export function getCreatureDefinition(key) {
  return DATA_REGISTRY.creatures[key] || null;
}

export function getMoveDefinition(key) {
  return DATA_REGISTRY.moves[key] || null;
}

export function getItemDefinition(key) {
  return DATA_REGISTRY.items[key] || null;
}

export function getMapDefinition(key) {
  return DATA_REGISTRY.maps[key] || null;
}

export function getQuestDefinition(key) {
  return DATA_REGISTRY.quests[key] || null;
}

export function hasMapDefinition(key) {
  return Boolean(getMapDefinition(key));
}
