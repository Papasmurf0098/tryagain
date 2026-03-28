import { PARTY_LIMIT, VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from './config.js';
import { clamp, createSeededRandom, rngInt, setRandomSource, weightedChoice } from './utils.js';
import { createInitialState, createSaveStateSnapshot, hydrateState } from './state.js';
import { ASSET_MANIFEST } from '../data/assets.js';
import { getCreatureDefinition, getItemDefinition, getMapDefinition, hasMapDefinition } from '../data/registry.js';
import { isStarterKey } from '../data/starters.js';
import { BattleSystem } from '../systems/battleSystem.js';
import { DialogueSystem } from '../systems/dialogueSystem.js';
import { QuestSystem } from '../systems/questSystem.js';
import { SaveSystem } from '../systems/saveSystem.js';
import { ScriptSystem } from '../systems/scriptSystem.js';
import { AssetSystem } from '../systems/assetSystem.js';

export class Game {
  constructor({ display, sceneIndicator, input, debug = {} }) {
    this.display = display;
    this.ctx = display.ctx;
    this.width = VIRTUAL_WIDTH;
    this.height = VIRTUAL_HEIGHT;
    this.sceneIndicator = sceneIndicator;
    this.input = input;
    this.sceneClasses = new Map();
    this.scene = null;
    this.lastTime = 0;
    this.rafHandle = null;
    this.debug = {
      deterministic: false,
      disableSave: false,
      skipLoad: false,
      clearSave: false,
      seed: 'boricua-engine',
      startScene: 'overworld',
      mapKey: null,
      playerX: null,
      playerY: null,
      facing: null,
      starterKey: null,
      ...debug,
    };
    this.randomSeed = this.debug.seed;
    this.useAnimationFrame = !this.debug.deterministic;
    setRandomSource(createSeededRandom(this.randomSeed));

    this.assets = new AssetSystem(ASSET_MANIFEST);
    this.saveSystem = new SaveSystem();
    this.dialogue = new DialogueSystem();
    this.lastBattleResult = null;
    if (this.debug.clearSave) this.saveSystem.clear();
    this.saveSystem.setDisabled(this.debug.disableSave);

    const initialState = createInitialState(this);
    const savedState = this.debug.skipLoad ? null : this.saveSystem.load();
    this.state = hydrateState(initialState, savedState);
    if (!hasMapDefinition(this.state.currentMapKey)) this.state.currentMapKey = initialState.currentMapKey;
    this.applyDebugBootstrap();

    this.questSystem = new QuestSystem(this);
    this.scriptSystem = new ScriptSystem(this);
    this.ensureCampaignState();
    this.battleSystem = new BattleSystem(this);
  }

  async preload() {
    await this.assets.loadAll();
  }

  registerScene(key, SceneClass) {
    this.sceneClasses.set(key, SceneClass);
  }

  start(initialSceneKey) {
    this.changeScene(this.getInitialSceneKey(initialSceneKey));
    this.renderFrame();
    if (this.useAnimationFrame) this.scheduleNextFrame();
  }

  loop(timestamp) {
    if (!this.useAnimationFrame) return;

    const deltaSeconds = Math.min(0.032, (timestamp - this.lastTime) / 1000 || 0.016);
    this.lastTime = timestamp;
    this.step(deltaSeconds);
    this.scheduleNextFrame();
  }

  changeScene(key, data = {}) {
    const SceneClass = this.sceneClasses.get(key);
    if (!SceneClass) throw new Error(`Scene not registered: ${key}`);
    this.scene = new SceneClass(this, data);
    if (this.sceneIndicator) this.sceneIndicator.textContent = this.scene.label || key;
  }

  getCurrentMap() {
    return getMapDefinition(this.state.currentMapKey);
  }

  getInitialSceneKey(requestedSceneKey = 'overworld') {
    if (!this.state.flags.starterChosen && requestedSceneKey === 'overworld') return 'starter-select';
    return requestedSceneKey;
  }

  getLeadCreature() {
    return this.state.player.party[0] || null;
  }

  getCodexCounts() {
    return {
      seen: Object.keys(this.state.codex?.seen || {}).length,
      caught: Object.keys(this.state.codex?.caught || {}).length,
    };
  }

  getCodexEntries() {
    const seenKeys = new Set(Object.keys(this.state.codex?.seen || {}));
    const caughtKeys = new Set(Object.keys(this.state.codex?.caught || {}));
    return [...seenKeys]
      .sort((left, right) => left.localeCompare(right))
      .map((key) => {
        const definition = getCreatureDefinition(key);
        return {
          key,
          name: definition?.name || key,
          type: definition?.type || 'Unknown',
          color: definition?.color || '#ffffff',
          category: definition?.category || 'Unknown',
          habitats: [...(definition?.habitats || [])],
          seen: true,
          caught: caughtKeys.has(key),
        };
      });
  }

  getItem(key) {
    return getItemDefinition(key);
  }

  getMoney() {
    return this.state.player.money ?? 0;
  }

  addMoney(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return this.getMoney();
    this.state.player.money = this.getMoney() + Math.round(amount);
    return this.state.player.money;
  }

  spendMoney(amount) {
    const cost = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
    if (cost > this.getMoney()) return false;
    this.state.player.money = this.getMoney() - cost;
    return true;
  }

  addInventoryItem(itemKey, amount = 1) {
    if (!itemKey || !Number.isFinite(amount) || amount <= 0) return 0;
    const nextAmount = (this.state.player.inventory[itemKey] ?? 0) + Math.round(amount);
    this.state.player.inventory[itemKey] = nextAmount;
    return nextAmount;
  }

  getShopCatalog() {
    return ['tonic', 'snareOrb']
      .map((key) => this.getItem(key))
      .filter((item) => item && Number.isInteger(item.price));
  }

  purchaseItem(itemKey) {
    const item = this.getItem(itemKey);
    if (!item) return { ok: false, message: 'That item is not stocked here.' };
    const price = Math.max(0, item.price ?? 0);
    if (!this.spendMoney(price)) {
      return { ok: false, message: `Not enough money for ${item.name}.` };
    }
    this.addInventoryItem(item.key, 1);
    this.save();
    return {
      ok: true,
      message: `${item.name} purchased for ${price} coral.`,
      money: this.getMoney(),
    };
  }

  isInteractionCollected(interactionId) {
    return Boolean(interactionId && this.state.flags?.collectedInteractions?.[interactionId]);
  }

  markInteractionCollected(interactionId) {
    if (!interactionId) return;
    this.state.flags.collectedInteractions[interactionId] = true;
  }

  collectPickup(interaction) {
    const rewards = [];
    if (interaction.itemKey && interaction.amount) {
      this.addInventoryItem(interaction.itemKey, interaction.amount);
      const item = this.getItem(interaction.itemKey);
      rewards.push(`${interaction.amount} ${item?.name || interaction.itemKey}`);
    }

    if (interaction.money) {
      this.addMoney(interaction.money);
      rewards.push(`${interaction.money} coral`);
    }

    this.markInteractionCollected(interaction.id);
    this.save();
    return rewards;
  }

  visitHarborShop() {
    this.state.flags.harborShopVisited = true;
    this.questSystem.applyTrigger({ type: 'shop_visited' });
    this.save();
  }

  getCurrentObjectiveText() {
    if (!this.state.flags.starterChosen) return 'Choose your first partner.';
    const questObjective = this.questSystem.getObjectiveText();
    if (questObjective) return questObjective;
    return 'Prepare your team and push deeper into Bosque Solseta.';
  }

  getTalaScript() {
    const starterKey = this.state.player.starterKey;
    if (!this.state.flags.talaBriefed) {
      return [
        { type: 'say', speaker: 'Tala', text: 'There you are. A first partner is only the beginning. The real work is learning the region, not hiding from it.' },
        { type: 'say', speaker: 'Tala', text: getStarterAdvice(starterKey) },
        { type: 'giveItem', itemKey: 'snareOrb', amount: 2 },
        { type: 'giveItem', itemKey: 'tonic', amount: 1 },
        { type: 'setFlag', key: 'talaBriefed', value: true },
        { type: 'advanceQuest', questId: 'first-expedition', stepId: 'defeat-rian' },
        { type: 'say', speaker: 'Tala', text: 'I packed two fresh Snare Orbs and a tonic. Reach Bahia Brisa, study the harbor services, challenge Marza when you are ready, and let the codex grow as you travel.' },
      ];
    }

    return [
      { type: 'say', speaker: 'Tala', text: `Keep your route goals close. ${this.getCurrentObjectiveText()}` },
    ];
  }

  getRivalStarterKey() {
    return this.state.flags?.rivalStarterKey || getCounterStarterKey(this.state.player.starterKey || this.getLeadCreature()?.key);
  }

  transitionToLocation(transition) {
    const fromMap = this.getCurrentMap();
    const previousFacing = this.state.player.facing;

    this.state.currentMapKey = transition.toMapKey;
    this.state.player.x = transition.toX;
    this.state.player.y = transition.toY;
    this.state.player.facing = transition.facing || previousFacing;

    const toMap = this.getCurrentMap();
    this.save();
    return {
      kind: transition.kind || 'warp',
      fromMapKey: fromMap?.key || null,
      fromMapName: fromMap?.name || null,
      toMapKey: toMap?.key || transition.toMapKey,
      toMapName: toMap?.name || transition.toMapKey,
      arrivalText: transition.arrivalText || null,
    };
  }

  transitionToWarp(warp) {
    return this.transitionToLocation(warp);
  }

  createCreatureInstance(key, level) {
    const base = getCreatureDefinition(key);
    if (!base) throw new Error(`Creature not found: ${key}`);

    return {
      key,
      name: base.name,
      type: base.type,
      color: base.color,
      level,
      maxHp: base.baseHp + level * 4,
      hp: base.baseHp + level * 4,
      attack: base.baseAttack + level * 2,
      defense: base.baseDefense + level,
      speed: base.baseSpeed + Math.floor(level * 0.8),
      moves: [...base.moves],
      experience: 0,
    };
  }

  getNextLevelXp(level) {
    return 20 + level * 8;
  }

  processLevelUp(creature) {
    let targetXp = this.getNextLevelXp(creature.level);
    while (creature.experience >= targetXp) {
      creature.experience -= targetXp;
      creature.level += 1;
      creature.maxHp += 5;
      creature.attack += 2;
      creature.defense += 1;
      creature.speed += 1;
      creature.hp = creature.maxHp;
      targetXp = this.getNextLevelXp(creature.level);
    }
  }

  startBattle(encounterSource) {
    const encounterContext = this.getEncounterContext(encounterSource);
    const playerCreature = this.getLeadCreature();
    if (!playerCreature) return;
    const enemyTemplate = weightedChoice(encounterContext.encounters);
    if (!enemyTemplate) return;
    const minLevel = enemyTemplate?.minLevel ?? Math.max(2, playerCreature.level - 1);
    const maxLevel = enemyTemplate?.maxLevel ?? Math.max(minLevel + 1, playerCreature.level + 2);
    const enemyLevel = rngInt(minLevel, maxLevel + 1);
    const enemyCreature = this.createCreatureInstance(enemyTemplate.key, enemyLevel);
    this.registerCreatureSeen(enemyCreature.key);

    this.state.battle = this.battleSystem.createBattle(enemyCreature, {
      kind: 'wild',
      backgroundKey: encounterContext.backgroundKey,
      areaName: encounterContext.areaName,
      mapKey: encounterContext.mapKey,
    });
    this.changeScene('battle');
  }

  startTrainerBattle(trainerNpc) {
    const currentMap = this.getCurrentMap();
    const trainerTeam = this.resolveTrainerTeam(trainerNpc);
    const leadCreature = this.getLeadCreature();
    if (!leadCreature) return;
    const opponent = trainerTeam[0] || { key: 'Pebblit', level: leadCreature.level };
    const enemyCreature = this.createCreatureInstance(opponent.key, opponent.level);
    this.registerCreatureSeen(enemyCreature.key);
    const trainerData = trainerNpc?.trainer || trainerNpc || {};

    this.state.battle = this.battleSystem.createBattle(enemyCreature, {
      kind: 'trainer',
      trainerId: trainerNpc?.id || trainerData.id || null,
      trainerName: trainerNpc?.name || trainerData.name || 'Trainer',
      cannotRun: true,
      rewardMoney: Number.isInteger(trainerData.rewardMoney) ? trainerData.rewardMoney : null,
      backgroundKey: currentMap?.battleBackdropKey || 'island-meadow',
      areaName: currentMap?.name || null,
      mapKey: currentMap?.key || this.state.currentMapKey,
    });
    this.changeScene('battle');
  }

  endBattle({ won, escaped, captured = false }) {
    const battle = this.state.battle;
    if (battle && won && !captured) this.battleSystem.awardVictory(battle);

    if (battle?.kind === 'trainer' && won && battle.trainerId) {
      this.state.flags.defeatedTrainers[battle.trainerId] = true;
      this.questSystem.applyTrigger({ type: 'trainer_defeated', trainerId: battle.trainerId });
    }

    this.lastBattleResult = {
      won,
      escaped,
      captured,
      kind: battle?.kind || null,
      trainerId: battle?.trainerId || null,
    };
    this.state.encounterCooldown = escaped ? 0.65 : 1.2;
    this.state.battle = null;
    this.save();
    this.changeScene('overworld');
  }

  chooseStarter(key) {
    if (!isStarterKey(key)) throw new Error(`Invalid starter choice: ${key}`);
    const starter = this.createCreatureInstance(key, 5);
    this.state.player.starterKey = key;
    this.state.player.party = [starter];
    this.state.player.storage = [];
    this.state.flags.starterChosen = true;
    this.state.flags.rivalStarterKey = getCounterStarterKey(key);
    this.state.flags.talaBriefed = false;
    this.questSystem.beginQuest('first-expedition');
    this.registerCreatureCaught(key);
    this.save();
    this.changeScene('overworld');
  }

  registerCreatureSeen(key) {
    if (!key) return;
    if (!this.state.codex) this.state.codex = { seen: {}, caught: {} };
    this.state.codex.seen[key] = true;
  }

  registerCreatureCaught(key) {
    if (!key) return;
    if (!this.state.codex) this.state.codex = { seen: {}, caught: {} };
    this.state.codex.seen[key] = true;
    this.state.codex.caught[key] = true;
  }

  captureCreature(creature) {
    const capturedCreature = cloneCreature(creature);
    this.registerCreatureCaught(capturedCreature.key);

    if (this.state.player.party.length < PARTY_LIMIT) {
      this.state.player.party.push(capturedCreature);
      return {
        location: 'party',
        text: `${capturedCreature.name} joined your field party.`,
      };
    }

    this.state.player.storage.push(capturedCreature);
    return {
      location: 'storage',
      text: `${capturedCreature.name} was sent to storage.`,
    };
  }

  restoreFieldParty() {
    for (const creature of this.state.player.party) {
      creature.hp = creature.maxHp;
    }
  }

  resolveTrainerTeam(trainerNpc) {
    const trainer = trainerNpc?.trainer || trainerNpc || {};
    if (trainer.dynamicTeam === 'rival-starter') {
      const leadCreature = this.getLeadCreature();
      return [{
        key: this.getRivalStarterKey() || 'Brookit',
        level: trainer.level || Math.max(5, leadCreature?.level ?? 5),
      }];
    }

    return trainer.team || [];
  }

  runScript(script, context = {}, options = {}) {
    return this.scriptSystem.begin(script, context, options);
  }

  consumeLastBattleResult() {
    const result = this.lastBattleResult;
    this.lastBattleResult = null;
    return result;
  }

  getFlag(path) {
    if (!path) return undefined;
    return String(path)
      .split('.')
      .reduce((current, key) => (current != null && typeof current === 'object' ? current[key] : undefined), this.state.flags);
  }

  setFlag(path, value = true) {
    if (!path) return value;

    const segments = String(path).split('.');
    let cursor = this.state.flags;
    while (segments.length > 1) {
      const segment = segments.shift();
      if (!cursor[segment] || typeof cursor[segment] !== 'object') cursor[segment] = {};
      cursor = cursor[segment];
    }
    cursor[segments[0]] = value;
    return value;
  }

  awardBadge(badgeKey, badgeName = true) {
    if (!badgeKey) return false;
    this.state.flags.badges[badgeKey] = badgeName;
    return true;
  }

  unlockFieldAbility(abilityKey) {
    if (!abilityKey) return false;
    this.state.flags.fieldAbilities[abilityKey] = true;
    return true;
  }

  hasFieldAbility(abilityKey) {
    return Boolean(abilityKey && this.state.flags.fieldAbilities?.[abilityKey]);
  }

  isFieldGateCleared(gateId) {
    return Boolean(gateId && this.state.flags.clearedFieldGates?.[gateId]);
  }

  clearFieldGate(gateId) {
    if (!gateId || this.isFieldGateCleared(gateId)) return false;
    this.state.flags.clearedFieldGates[gateId] = true;
    this.questSystem.applyTrigger({ type: 'field_gate_cleared', gateId });
    this.save();
    return true;
  }

  save() {
    this.saveSystem.save(createSaveStateSnapshot(this.state));
  }

  scheduleNextFrame() {
    if (!this.useAnimationFrame) return;
    this.rafHandle = requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  step(deltaSeconds, { render = true, endFrame = true } = {}) {
    const safeDelta = Math.min(0.032, Math.max(0.001, deltaSeconds || 0.016));
    this.state.clock += safeDelta;
    if (this.state.encounterCooldown > 0) {
      this.state.encounterCooldown = Math.max(0, this.state.encounterCooldown - safeDelta);
    }

    this.scriptSystem.update(safeDelta);
    if (this.scene?.update) this.scene.update(safeDelta);
    if (render) this.renderFrame();
    if (endFrame) this.input.endFrame();
  }

  renderFrame() {
    this.display.beginFrame();
    if (this.scene?.render) this.scene.render(this.ctx);
  }

  setLoopMode(mode = 'raf') {
    const nextUseAnimationFrame = mode !== 'manual';
    if (nextUseAnimationFrame === this.useAnimationFrame) return;

    this.useAnimationFrame = nextUseAnimationFrame;
    this.lastTime = 0;

    if (!this.useAnimationFrame && this.rafHandle != null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
      return;
    }

    if (this.useAnimationFrame && this.scene) this.scheduleNextFrame();
  }

  advanceTime(milliseconds = 1000 / 60) {
    this.setLoopMode('manual');

    const frameMs = 1000 / 60;
    let remainingMs = Number.isFinite(milliseconds) && milliseconds > 0
      ? milliseconds
      : frameMs;

    while (remainingMs > 0) {
      const deltaMs = Math.min(frameMs, remainingMs);
      this.step(deltaMs / 1000, { render: false });
      remainingMs -= deltaMs;
    }

    this.renderFrame();
    return this.getDebugText();
  }

  installDebugHooks(target = window) {
    target.__BORICUA_GAME__ = this;
    target.__BORICUA_DEBUG__ = {
      ...this.debug,
      seed: String(this.randomSeed),
    };
    target.advanceTime = (milliseconds) => this.advanceTime(milliseconds);
    target.render_game_to_text = () => this.getDebugText();
    target.setGameLoopMode = (mode) => {
      this.setLoopMode(mode);
      this.renderFrame();
      return this.useAnimationFrame ? 'raf' : 'manual';
    };
  }

  getDebugText() {
    return JSON.stringify(this.getDebugSnapshot());
  }

  getDebugSnapshot() {
    const leadCreature = this.state.player.party[0] || null;
    return {
      coordinateSystem: {
        origin: 'top-left tile',
        xAxis: 'increases to the right',
        yAxis: 'increases downward',
      },
      seed: String(this.randomSeed),
      updateMode: this.useAnimationFrame ? 'raf' : 'manual',
      scene: this.scene?.label || null,
      currentMapKey: this.state.currentMapKey,
      clock: roundValue(this.state.clock),
      save: {
        enabled: !this.saveSystem.disabled,
      },
      player: {
        name: this.state.player.name,
        x: this.state.player.x,
        y: this.state.player.y,
        facing: this.state.player.facing,
        steps: this.state.player.steps,
        starterKey: this.state.player.starterKey || null,
        rivalStarterKey: this.state.flags?.rivalStarterKey || null,
        partySize: this.state.player.party.length,
        storageSize: this.state.player.storage.length,
        money: this.getMoney(),
        inventory: { ...this.state.player.inventory },
      },
      objective: this.getCurrentObjectiveText(),
      codex: {
        ...this.getCodexCounts(),
      },
      progress: {
        badges: { ...(this.state.flags.badges || {}) },
        fieldAbilities: { ...(this.state.flags.fieldAbilities || {}) },
        quests: this.questSystem.getQuestSnapshot(),
      },
      leadCreature: leadCreature ? summarizeCreature(leadCreature) : null,
      dialogue: this.dialogue.current(),
      battle: this.state.battle
        ? {
            kind: this.state.battle.kind,
            turn: this.state.battle.turn,
            battleOver: this.state.battle.battleOver,
            cannotRun: this.state.battle.cannotRun,
            backgroundKey: this.state.battle.backgroundKey || null,
            areaName: this.state.battle.areaName || null,
            captured: Boolean(this.state.battle.captured),
            message: this.state.battle.message,
            playerCreature: summarizeCreature(this.state.battle.playerCreature),
            enemyCreature: summarizeCreature(this.state.battle.enemyCreature),
          }
        : null,
      sceneState: this.scene?.getDebugState?.() || null,
    };
  }

  applyDebugBootstrap() {
    if (isStarterKey(this.debug.starterKey)) {
      this.state.player.starterKey = this.debug.starterKey;
      this.state.player.party = [this.createCreatureInstance(this.debug.starterKey, 5)];
      this.state.player.storage = [];
      this.state.flags.starterChosen = true;
      this.state.flags.rivalStarterKey = getCounterStarterKey(this.debug.starterKey);
      this.registerCreatureCaught(this.debug.starterKey);
    }

    const map = this.debug.mapKey && getMapDefinition(this.debug.mapKey)
      ? getMapDefinition(this.debug.mapKey)
      : null;
    if (map) this.state.currentMapKey = map.key;

    const activeMap = this.getCurrentMap();
    if (!activeMap) return;

    if (Number.isInteger(this.debug.playerX)) {
      this.state.player.x = clamp(this.debug.playerX, 0, activeMap.width - 1);
    }

    if (Number.isInteger(this.debug.playerY)) {
      this.state.player.y = clamp(this.debug.playerY, 0, activeMap.height - 1);
    }

    if (this.debug.facing) this.state.player.facing = this.debug.facing;
  }

  getEncounterContext(encounterSource) {
    const currentMap = this.getCurrentMap();
    const fallbackEncounters = currentMap?.encounters || [];

    if (Array.isArray(encounterSource)) {
      return {
        encounters: encounterSource,
        backgroundKey: currentMap?.battleBackdropKey || 'island-meadow',
        areaName: currentMap?.name || null,
        mapKey: currentMap?.key || this.state.currentMapKey,
      };
    }

    if (encounterSource?.encounters) {
      return {
        encounters: encounterSource.encounters,
        backgroundKey: encounterSource.backgroundKey || currentMap?.battleBackdropKey || 'island-meadow',
        areaName: encounterSource.areaName || currentMap?.name || null,
        mapKey: encounterSource.mapKey || currentMap?.key || this.state.currentMapKey,
      };
    }

    return {
      encounters: fallbackEncounters,
      backgroundKey: currentMap?.battleBackdropKey || 'island-meadow',
      areaName: currentMap?.name || null,
      mapKey: currentMap?.key || this.state.currentMapKey,
    };
  }

  ensureCampaignState() {
    if (!this.state.player.starterKey && this.getLeadCreature()) {
      this.state.player.starterKey = this.getLeadCreature().key;
    }

    if (!this.state.flags.rivalStarterKey && this.state.player.starterKey) {
      this.state.flags.rivalStarterKey = getCounterStarterKey(this.state.player.starterKey);
    }

    if (!this.state.flags.badges) this.state.flags.badges = {};
    if (!this.state.flags.fieldAbilities) this.state.flags.fieldAbilities = {};
    if (!this.state.flags.clearedFieldGates) this.state.flags.clearedFieldGates = {};
    if (!this.state.flags.collectedInteractions) this.state.flags.collectedInteractions = {};

    const defeatedTrainerCount = Object.keys(this.state.flags.defeatedTrainers || {}).length;
    const hasLeftOpeningPocket = !['island-start', 'primer-cottage'].includes(this.state.currentMapKey);
    const travelledFar = this.state.player.steps > 18 || hasLeftOpeningPocket || defeatedTrainerCount > 0;
    if (!this.state.flags.talaBriefed && travelledFar) this.state.flags.talaBriefed = true;
    this.questSystem.syncCampaignState();
  }
}

function summarizeCreature(creature) {
  return {
    key: creature.key,
    name: creature.name,
    type: creature.type,
    level: creature.level,
    hp: creature.hp,
    maxHp: creature.maxHp,
    attack: creature.attack,
    defense: creature.defense,
    speed: creature.speed,
    experience: creature.experience,
    moves: [...creature.moves],
  };
}

function roundValue(value) {
  return Math.round(value * 1000) / 1000;
}

function getCounterStarterKey(playerStarterKey) {
  return {
    Flameling: 'Brookit',
    Brookit: 'Mosslet',
    Mosslet: 'Flameling',
  }[playerStarterKey] || null;
}

function getStarterAdvice(starterKey) {
  return {
    Flameling: 'Flameling hits first and hits hard, but do not leave it planted in front of stone-heavy bruisers for free.',
    Brookit: 'Brookit wins by staying composed. Let it smooth out bad turns instead of forcing every fight at full speed.',
    Mosslet: 'Mosslet rewards patience. Take the longer line, soak pressure, and make rivals crack before you do.',
  }[starterKey] || 'Train your partner with intention. A strong team starts with a clear role.';
}

function cloneCreature(creature) {
  return {
    key: creature.key,
    name: creature.name,
    type: creature.type,
    color: creature.color,
    level: creature.level,
    maxHp: creature.maxHp,
    hp: creature.hp,
    attack: creature.attack,
    defense: creature.defense,
    speed: creature.speed,
    moves: [...creature.moves],
    experience: creature.experience,
  };
}
