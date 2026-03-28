import { VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from './config.js';
import { choose, rngInt } from './utils.js';
import { createInitialState } from './state.js';
import { CREATURES } from '../data/creatures.js';
import { MAPS } from '../data/maps.js';
import { BattleSystem } from '../systems/battleSystem.js';
import { DialogueSystem } from '../systems/dialogueSystem.js';
import { SaveSystem } from '../systems/saveSystem.js';
import { AssetSystem } from '../systems/assetSystem.js';

export class Game {
  constructor({ display, sceneIndicator, input }) {
    this.display = display;
    this.ctx = display.ctx;
    this.width = VIRTUAL_WIDTH;
    this.height = VIRTUAL_HEIGHT;
    this.sceneIndicator = sceneIndicator;
    this.input = input;
    this.sceneClasses = new Map();
    this.scene = null;
    this.lastTime = 0;

    this.assets = new AssetSystem({ images: {}, audio: {} });
    this.saveSystem = new SaveSystem();
    this.dialogue = new DialogueSystem();

    this.state = createInitialState(this);
    const savedState = this.saveSystem.load();
    if (savedState && MAPS[savedState.currentMapKey]) {
      this.state = {
        ...this.state,
        ...savedState,
        player: {
          ...this.state.player,
          ...(savedState.player || {}),
          inventory: {
            ...this.state.player.inventory,
            ...(savedState.player?.inventory || {}),
          },
        },
        flags: {
          ...this.state.flags,
          ...(savedState.flags || {}),
          defeatedTrainers: {
            ...this.state.flags.defeatedTrainers,
            ...(savedState.flags?.defeatedTrainers || {}),
          },
        },
      };
    }

    this.battleSystem = new BattleSystem(this);
  }

  async preload() {
    await this.assets.loadAll();
  }

  registerScene(key, SceneClass) {
    this.sceneClasses.set(key, SceneClass);
  }

  start(initialSceneKey) {
    this.changeScene(initialSceneKey);
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  loop(timestamp) {
    const deltaSeconds = Math.min(0.032, (timestamp - this.lastTime) / 1000 || 0.016);
    this.lastTime = timestamp;

    this.state.clock += deltaSeconds;
    if (this.state.encounterCooldown > 0) {
      this.state.encounterCooldown = Math.max(0, this.state.encounterCooldown - deltaSeconds);
    }

    if (this.scene?.update) this.scene.update(deltaSeconds);

    this.display.beginFrame();
    if (this.scene?.render) this.scene.render(this.ctx);

    this.input.endFrame();
    requestAnimationFrame((nextTimestamp) => this.loop(nextTimestamp));
  }

  changeScene(key, data = {}) {
    const SceneClass = this.sceneClasses.get(key);
    if (!SceneClass) throw new Error(`Scene not registered: ${key}`);
    this.scene = new SceneClass(this, data);
    if (this.sceneIndicator) this.sceneIndicator.textContent = this.scene.label || key;
  }

  getCurrentMap() {
    return MAPS[this.state.currentMapKey];
  }

  transitionToWarp(warp) {
    this.state.currentMapKey = warp.toMapKey;
    this.state.player.x = warp.toX;
    this.state.player.y = warp.toY;
    this.state.player.facing = 'down';
    this.save();
  }

  createCreatureInstance(key, level) {
    const base = CREATURES[key];
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

  startBattle(encounterPool) {
    const playerCreature = this.state.player.party[0];
    const enemyTemplate = choose(encounterPool);
    const minLevel = Math.max(2, playerCreature.level - 1);
    const enemyLevel = rngInt(minLevel, playerCreature.level + 2);
    const enemyCreature = this.createCreatureInstance(enemyTemplate.key, enemyLevel);

    this.state.battle = this.battleSystem.createBattle(enemyCreature, { kind: 'wild' });
    this.changeScene('battle');
  }

  startTrainerBattle(trainerNpc) {
    const trainerTeam = trainerNpc.trainer?.team || [];
    const opponent = trainerTeam[0] || { key: 'Pebblit', level: this.state.player.party[0].level };
    const enemyCreature = this.createCreatureInstance(opponent.key, opponent.level);

    this.state.battle = this.battleSystem.createBattle(enemyCreature, {
      kind: 'trainer',
      trainerId: trainerNpc.id,
      trainerName: trainerNpc.name,
      cannotRun: true,
    });
    this.changeScene('battle');
  }

  endBattle({ won, escaped }) {
    const battle = this.state.battle;
    if (battle && won) this.battleSystem.awardVictory(battle);

    if (battle?.kind === 'trainer' && won && battle.trainerId) {
      this.state.flags.defeatedTrainers[battle.trainerId] = true;
    }

    this.state.encounterCooldown = escaped ? 0.65 : 1.2;
    this.state.battle = null;
    this.save();
    this.changeScene('overworld');
  }

  save() {
    this.saveSystem.save(this.state);
  }
}
