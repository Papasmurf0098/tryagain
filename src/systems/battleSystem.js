import { getMoveDefinition } from '../data/registry.js';
import { getTypeModifier } from '../data/types.js';
import { clamp, random, rngInt } from '../core/utils.js';

export class BattleSystem {
  constructor(game) {
    this.game = game;
  }

  createBattle(enemyCreature, options = {}) {
    const playerCreature = this.game.state.player.party[0];
    const kind = options.kind || 'wild';
    const introMessage = kind === 'trainer'
      ? `${options.trainerName} challenged you and sent out ${enemyCreature.name}!`
      : `A wild ${enemyCreature.name} appeared!`;

    return {
      playerCreature,
      enemyCreature,
      message: introMessage,
      turn: playerCreature.speed >= enemyCreature.speed ? 'player' : 'enemy',
      battleOver: false,
      captured: false,
      rewardGiven: false,
      kind,
      trainerId: options.trainerId || null,
      trainerName: options.trainerName || null,
      cannotRun: Boolean(options.cannotRun),
      backgroundKey: options.backgroundKey || 'island-meadow',
      areaName: options.areaName || null,
      mapKey: options.mapKey || null,
      rewardMoney: Number.isInteger(options.rewardMoney) ? options.rewardMoney : (kind === 'trainer' ? enemyCreature.level * 12 : 0),
    };
  }

  getMove(key) {
    return getMoveDefinition(key);
  }

  performMove(attacker, defender, moveKey) {
    const move = this.getMove(moveKey);
    if (!move) {
      return { damage: 0, modifier: 1, text: `${attacker.name} hesitated.` };
    }

    const hitRoll = random();
    if (hitRoll > move.accuracy) {
      return { damage: 0, modifier: 1, text: `${attacker.name} used ${move.name}, but it missed!` };
    }

    const typeModifier = getTypeModifier(move.type, defender.type);
    const variance = rngInt(-2, 3);
    const critical = random() < 0.1 ? 1.5 : 1;
    const baseDamage = move.power + attacker.attack - Math.floor(defender.defense / 2) + variance;
    const total = clamp(Math.round(Math.max(1, baseDamage) * typeModifier * critical), 1, 999);
    defender.hp = clamp(defender.hp - total, 0, defender.maxHp);

    let effectiveness = '';
    if (typeModifier > 1.15) effectiveness = ' It was super effective!';
    else if (typeModifier < 0.95) effectiveness = ' It was not very effective.';

    const critText = critical > 1 ? ' Critical hit!' : '';
    return {
      damage: total,
      modifier: typeModifier,
      text: `${attacker.name} used ${move.name}! ${defender.name} took ${total} damage.${effectiveness}${critText}`,
    };
  }

  useTonic(creature) {
    const previous = creature.hp;
    creature.hp = Math.min(creature.maxHp, creature.hp + 18);
    return creature.hp - previous;
  }

  attemptCapture(creature, options = {}) {
    const missingHpRatio = 1 - (creature.hp / creature.maxHp);
    const levelModifier = clamp(0.16 - creature.level * 0.015, -0.08, 0.14);
    const statusBonus = Number.isFinite(options.statusBonus) ? options.statusBonus : 0;
    const deviceBonus = Number.isFinite(options.deviceBonus) ? options.deviceBonus : 0;
    const chance = clamp(0.18 + missingHpRatio * 0.54 + levelModifier + statusBonus + deviceBonus, 0.08, 0.92);
    const roll = random();

    return {
      success: roll <= chance,
      chance,
      roll,
    };
  }

  awardVictory(battle) {
    if (battle.rewardGiven) return { xpGain: 0, moneyGain: 0 };
    const xpGain = battle.enemyCreature.level * 5;
    const moneyGain = battle.kind === 'trainer' ? Math.max(0, battle.rewardMoney || 0) : 0;
    battle.playerCreature.experience += xpGain;
    if (moneyGain > 0) this.game.addMoney(moneyGain);
    battle.rewardGiven = true;
    this.game.processLevelUp(battle.playerCreature);
    return { xpGain, moneyGain };
  }

  previewVictoryRewards(battle) {
    return {
      xpGain: battle.enemyCreature.level * 5,
      moneyGain: battle.kind === 'trainer' ? Math.max(0, battle.rewardMoney || 0) : 0,
    };
  }
}
