import { ACTIONS } from '../core/config.js';
import { rngInt } from '../core/utils.js';
import { getBattleBackdropDefinition } from '../data/battleBackdrops.js';
import { renderBattleBackdrop } from '../rendering/battleBackdrop.js';
import { drawBattleCreature } from '../rendering/entities.js';
import { drawCreatureBadge, drawPanel, drawTextBlock } from '../rendering/ui.js';

export class BattleScene {
  constructor(game) {
    this.game = game;
    this.label = 'Battle';
    this.messageTimer = 0;
    this.enemyActionQueued = false;
    this.actionAnimation = null;
    this.selectedItemKey = 'snareOrb';
  }

  update(deltaSeconds) {
    const battle = this.game.state.battle;
    if (!battle) {
      this.game.changeScene('overworld');
      return;
    }

    this.syncSelectedItem(battle);

    this.updateActionAnimation(deltaSeconds);
    this.messageTimer = Math.max(0, this.messageTimer - deltaSeconds);

    if (battle.battleOver) {
      if (this.game.input.wasPressed(' ', 'enter')) {
        this.game.endBattle({
          won: battle.enemyCreature.hp <= 0 && !battle.playerDefeated,
          escaped: false,
          captured: Boolean(battle.captured),
        });
      }
      return;
    }

    if (battle.turn === 'player') {
      this.handleItemCycling(battle);
      this.handlePlayerTurn(battle);
    } else if (battle.turn === 'enemy' && !this.enemyActionQueued && this.messageTimer <= 0) {
      this.enemyActionQueued = true;
      this.resolveEnemyTurn(battle);
    }
  }

  handlePlayerTurn(battle) {
    const input = this.game.input;
    const numericKey = ['1', '2', '3', '4'].find((key) => input.wasPressed(key));
    if (!numericKey || this.messageTimer > 0) return;

    const action = ACTIONS[Number(numericKey) - 1];
    if (!action) return;

    if (action.action === 'run') {
      if (battle.cannotRun) {
        battle.message = `${battle.trainerName || 'This trainer'} blocks your escape route.`;
        this.messageTimer = 0.55;
        return;
      }
      battle.message = 'You escaped safely.';
      this.game.endBattle({ won: false, escaped: true });
      return;
    }

    if (action.action === 'item') {
      this.useSelectedItem(battle);
      return;
    }

    const moveKey = battle.playerCreature.moves[action.moveSlot] || battle.playerCreature.moves[0];
    const result = this.game.battleSystem.performMove(battle.playerCreature, battle.enemyCreature, moveKey);
    battle.message = result.text;
    this.messageTimer = 0.5;
    this.queueActionAnimation({
      kind: 'attack',
      attackerSide: 'player',
      defenderSide: 'enemy',
      damage: result.damage,
    });

    if (battle.enemyCreature.hp <= 0) {
      const rewards = this.game.battleSystem.previewVictoryRewards(battle);
      const moneyText = rewards.moneyGain > 0 ? ` and ${rewards.moneyGain} coral` : '';
      battle.message += ` ${battle.enemyCreature.name} fainted! ${battle.playerCreature.name} will earn ${rewards.xpGain} XP${moneyText}. Press Enter.`;
      battle.battleOver = true;
      return;
    }

    battle.turn = 'enemy';
    this.enemyActionQueued = false;
  }

  resolveEnemyTurn(battle) {
    const enemyMove = battle.enemyCreature.moves[rngInt(0, battle.enemyCreature.moves.length)];
    const result = this.game.battleSystem.performMove(battle.enemyCreature, battle.playerCreature, enemyMove);
    battle.message = result.text;
    this.messageTimer = 0.7;
    this.queueActionAnimation({
      kind: 'attack',
      attackerSide: 'enemy',
      defenderSide: 'player',
      damage: result.damage,
    });

    if (battle.playerCreature.hp <= 0) {
      battle.playerCreature.hp = battle.playerCreature.maxHp;
      battle.message += ` ${battle.playerCreature.name} was rescued and restored. Press Enter.`;
      battle.battleOver = true;
      battle.playerDefeated = true;
      return;
    }

    battle.turn = 'player';
    this.enemyActionQueued = false;
  }

  updateActionAnimation(deltaSeconds) {
    if (!this.actionAnimation) return;
    this.actionAnimation.elapsed += deltaSeconds;
    if (this.actionAnimation.elapsed >= this.actionAnimation.duration) this.actionAnimation = null;
  }

  queueActionAnimation(config) {
    this.actionAnimation = {
      elapsed: 0,
      duration: config.kind === 'heal' ? 0.6 : 0.5,
      ...config,
    };
  }

  getDebugState() {
    const battle = this.game.state.battle;
    if (!battle) {
      return {
        scene: 'battle',
        active: false,
      };
    }

    return {
      scene: 'battle',
      active: true,
      messageTimer: Math.round(this.messageTimer * 1000) / 1000,
      enemyActionQueued: this.enemyActionQueued,
      turn: battle.turn,
      battleOver: battle.battleOver,
      playerDefeated: Boolean(battle.playerDefeated),
      selectedItemKey: this.selectedItemKey,
      backgroundKey: battle.backgroundKey || null,
      areaName: battle.areaName || null,
      message: battle.message,
      actionAnimation: this.actionAnimation
        ? {
            kind: this.actionAnimation.kind,
            attackerSide: this.actionAnimation.attackerSide || null,
            defenderSide: this.actionAnimation.defenderSide || null,
            targetSide: this.actionAnimation.targetSide || null,
            progress: Math.round(this.getActionProgress() * 1000) / 1000,
          }
        : null,
      availableActions: ACTIONS.map((action, index) => {
        if (action.moveSlot !== undefined) {
          const moveKey = battle.playerCreature.moves[action.moveSlot] || battle.playerCreature.moves[0];
          const move = this.game.battleSystem.getMove(moveKey);
          return `${index + 1}:${move?.name || 'Unknown'}`;
        }

        if (action.action === 'item') {
          const item = this.getSelectedItemDefinition();
          const amount = item ? this.getInventoryAmount(item.key) : 0;
          return `${index + 1}:${item?.name || 'Item'} x${amount}`;
        }

        return `${index + 1}:${action.action || action.label}`;
      }),
    };
  }

  render(ctx) {
    const battle = this.game.state.battle;
    if (!battle) return;

    this.drawBackground(ctx, battle);
    this.drawCreatures(ctx, battle);
    this.drawUi(ctx, battle);
    this.drawImpactEffects(ctx);
  }

  drawBackground(ctx, battle) {
    const backdrop = getBattleBackdropDefinition(battle.backgroundKey);
    renderBattleBackdrop(ctx, backdrop, this.game.assets, this.game.width, this.game.height, this.game.state.clock);

    const impact = this.getImpactState();
    if (!impact) return;

    ctx.save();
    ctx.globalAlpha = 0.08 + impact.alpha * 0.18;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    const direction = impact.attackerSide === 'player' ? 1 : -1;
    for (let index = 0; index < 6; index += 1) {
      const y = 118 + index * 34;
      const startX = direction > 0 ? 110 : this.game.width - 110;
      const endX = startX + direction * (170 + index * 18);
      ctx.beginPath();
      ctx.moveTo(startX - direction * index * 10, y);
      ctx.lineTo(endX, y - 22 + index * 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCreatures(ctx, battle) {
    const enemyPose = this.getCreaturePose('enemy');
    const playerPose = this.getCreaturePose('player');
    drawBattleCreature(ctx, battle.enemyCreature, enemyPose.x, enemyPose.y, false, this.game.state.clock);
    drawBattleCreature(ctx, battle.playerCreature, playerPose.x, playerPose.y, true, this.game.state.clock);
  }

  drawImpactEffects(ctx) {
    if (!this.actionAnimation) return;

    if (this.actionAnimation.kind === 'heal') {
      const pose = this.getCreaturePose(this.actionAnimation.targetSide);
      const alpha = Math.sin(this.getActionProgress() * Math.PI) * 0.45;
      if (alpha <= 0) return;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(pose.x, pose.y - 10, 42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pose.x, pose.y - 10, 58, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#dcfce7';
      ctx.font = '700 22px Inter, sans-serif';
      ctx.fillText(`+${this.actionAnimation.amount}`, pose.x - 16, pose.y - 68);
      ctx.restore();
      return;
    }

    const impact = this.getImpactState();
    if (!impact) return;

    ctx.save();
    ctx.globalAlpha = impact.alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(impact.x, impact.y, 22 + impact.alpha * 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 241, 184, ${0.7 + impact.alpha * 0.2})`;
    ctx.lineWidth = 3;
    for (let index = 0; index < 6; index += 1) {
      const angle = (Math.PI * 2 * index) / 6;
      ctx.beginPath();
      ctx.moveTo(impact.x, impact.y);
      ctx.lineTo(impact.x + Math.cos(angle) * 26, impact.y + Math.sin(angle) * 26);
      ctx.stroke();
    }

    if (impact.damage > 0) {
      ctx.fillStyle = '#fff7d1';
      ctx.font = '700 24px Inter, sans-serif';
      const labelY = impact.defenderSide === 'enemy'
        ? impact.y + 34
        : impact.y - 28;
      ctx.fillText(`-${impact.damage}`, impact.x - 18, labelY);
    }
    ctx.restore();
  }

  drawUi(ctx, battle) {
    drawPanel(ctx, 34, 28, 280, 92, battle.kind === 'trainer' ? 'Trainer Opponent' : 'Wild Opponent');
    drawCreatureBadge(ctx, battle.enemyCreature, 48, 58, true);
    if (battle.areaName) drawTextBlock(ctx, [battle.areaName], 48, 106, 16, 230);

    drawPanel(ctx, 640, 350, 286, 92, 'Your Creature');
    drawCreatureBadge(ctx, battle.playerCreature, 654, 380, true);
    drawTextBlock(ctx, [`Money ${this.game.getMoney()}`], 654, 432, 16, 180);

    drawPanel(ctx, 24, 452, 912, 100, 'Battle Log');
    drawTextBlock(ctx, [battle.message], 40, 488, 20, 840);

    drawPanel(ctx, 640, 28, 286, 176, 'Actions');
    const actionLines = ACTIONS.map((action, index) => {
      if (action.moveSlot !== undefined) {
        const moveKey = battle.playerCreature.moves[action.moveSlot] || battle.playerCreature.moves[0];
        const move = this.game.battleSystem.getMove(moveKey);
        return `${index + 1}. ${move?.name || 'Unknown'} (${move?.type || '—'})`;
      }
      if (action.action === 'item') {
        const item = this.getSelectedItemDefinition();
        const amount = item ? this.getInventoryAmount(item.key) : 0;
        return `${index + 1}. ${item?.name || 'Item'} x${amount}`;
      }
      if (action.action === 'run' && battle.cannotRun) return `${index + 1}. Can't Run`;
      return action.label;
    });
    const footerLines = ['Q / E: Cycle battle item'];
    drawTextBlock(ctx, [...actionLines, ...footerLines], 660, 64, 24);
  }

  syncSelectedItem(battle) {
    const itemKeys = this.getSelectableItemKeys(battle);
    if (!itemKeys.length) {
      this.selectedItemKey = null;
      return;
    }

    if (!itemKeys.includes(this.selectedItemKey)) {
      this.selectedItemKey = battle.kind === 'wild' && itemKeys.includes('snareOrb')
        ? 'snareOrb'
        : itemKeys[0];
    }
  }

  handleItemCycling(battle) {
    if (this.messageTimer > 0) return;
    const itemKeys = this.getSelectableItemKeys(battle);
    if (itemKeys.length < 2) return;

    if (this.game.input.wasPressed('q')) {
      this.selectedItemKey = cycleValue(itemKeys, this.selectedItemKey, -1);
    } else if (this.game.input.wasPressed('e', 'tab')) {
      this.selectedItemKey = cycleValue(itemKeys, this.selectedItemKey, 1);
    }
  }

  getSelectableItemKeys(battle) {
    return battle.kind === 'wild'
      ? ['snareOrb', 'tonic']
      : ['tonic'];
  }

  getSelectedItemDefinition() {
    return this.selectedItemKey ? this.game.getItem(this.selectedItemKey) : null;
  }

  getInventoryAmount(itemKey) {
    return this.game.state.player.inventory[itemKey] ?? 0;
  }

  useSelectedItem(battle) {
    const item = this.getSelectedItemDefinition();
    if (!item) {
      battle.message = 'No item is ready.';
      this.messageTimer = 0.45;
      return;
    }

    if (this.getInventoryAmount(item.key) <= 0) {
      battle.message = `No ${item.name} left.`;
      this.messageTimer = 0.5;
      return;
    }

    if (item.kind === 'capture') {
      this.game.state.player.inventory[item.key] -= 1;
      const result = this.game.battleSystem.attemptCapture(battle.enemyCreature, {
        deviceBonus: item.captureBonus,
      });

      if (result.success) {
        const captureResult = this.game.captureCreature(battle.enemyCreature);
        battle.captured = true;
        battle.battleOver = true;
        battle.message = `${item.name} secured ${battle.enemyCreature.name}! ${captureResult.text} Press Enter.`;
        this.game.save();
        return;
      }

      battle.message = `${battle.enemyCreature.name} burst free of the ${item.name}!`;
      this.messageTimer = 0.65;
      battle.turn = 'enemy';
      this.enemyActionQueued = false;
      this.game.save();
      return;
    }

    this.game.state.player.inventory[item.key] -= 1;
    const restored = this.game.battleSystem.useTonic(battle.playerCreature);
    battle.message = `${battle.playerCreature.name} recovered ${restored} HP.`;
    this.messageTimer = 0.5;
    this.queueActionAnimation({ kind: 'heal', targetSide: 'player', amount: restored });
    battle.turn = 'enemy';
    this.enemyActionQueued = false;
    this.game.save();
  }

  getCreaturePose(side) {
    const base = side === 'player'
      ? { x: 220, y: 340 }
      : { x: 730, y: 170 };

    if (!this.actionAnimation) return base;

    const progress = this.getActionProgress();
    if (this.actionAnimation.kind === 'heal') {
      if (side !== this.actionAnimation.targetSide) return base;
      const lift = Math.sin(progress * Math.PI) * 10;
      return { x: base.x, y: base.y - lift };
    }

    const attackerDirection = this.actionAnimation.attackerSide === 'player' ? 1 : -1;
    const lunge = Math.sin(Math.min(1, progress / 0.55) * Math.PI) * 34;
    const recoilProgress = clamp01((progress - 0.24) / 0.46);
    const recoil = Math.sin(recoilProgress * Math.PI) * 16;

    if (side === this.actionAnimation.attackerSide) {
      return {
        x: base.x + attackerDirection * lunge,
        y: base.y - Math.sin(Math.min(1, progress / 0.55) * Math.PI) * 8,
      };
    }

    if (side === this.actionAnimation.defenderSide) {
      return {
        x: base.x + attackerDirection * recoil,
        y: base.y - recoil * 0.25,
      };
    }

    return base;
  }

  getImpactState() {
    if (!this.actionAnimation || this.actionAnimation.kind !== 'attack') return null;

    const progress = this.getActionProgress();
    const impactProgress = clamp01((progress - 0.24) / 0.42);
    const alpha = Math.sin(impactProgress * Math.PI);
    if (alpha <= 0.001) return null;

    const defenderPose = this.getCreaturePose(this.actionAnimation.defenderSide);
    return {
      alpha,
      x: defenderPose.x + (this.actionAnimation.defenderSide === 'player' ? 42 : -108),
      y: defenderPose.y + (this.actionAnimation.defenderSide === 'player' ? -20 : -8),
      damage: this.actionAnimation.damage || 0,
      attackerSide: this.actionAnimation.attackerSide,
      defenderSide: this.actionAnimation.defenderSide,
    };
  }

  getActionProgress() {
    if (!this.actionAnimation) return 0;
    return Math.min(1, this.actionAnimation.elapsed / this.actionAnimation.duration);
  }
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function cycleValue(list, current, direction) {
  const currentIndex = Math.max(0, list.indexOf(current));
  const nextIndex = (currentIndex + direction + list.length) % list.length;
  return list[nextIndex];
}
