import { ACTIONS } from '../core/config.js';
import { rngInt } from '../core/utils.js';
import { drawBattleCreature } from '../rendering/entities.js';
import { drawCreatureBadge, drawPanel, drawTextBlock } from '../rendering/ui.js';

export class BattleScene {
  constructor(game) {
    this.game = game;
    this.label = 'Battle';
    this.messageTimer = 0;
    this.enemyActionQueued = false;
  }

  update(deltaSeconds) {
    const battle = this.game.state.battle;
    if (!battle) {
      this.game.changeScene('overworld');
      return;
    }

    this.messageTimer = Math.max(0, this.messageTimer - deltaSeconds);

    if (battle.battleOver) {
      if (this.game.input.wasPressed(' ', 'enter')) {
        this.game.endBattle({ won: battle.enemyCreature.hp <= 0 && !battle.playerDefeated, escaped: false });
      }
      return;
    }

    if (battle.turn === 'player') {
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

    if (action.action === 'heal') {
      if (this.game.state.player.inventory.tonic <= 0) {
        battle.message = 'No tonics left.';
        this.messageTimer = 0.5;
        return;
      }

      this.game.state.player.inventory.tonic -= 1;
      const restored = this.game.battleSystem.useTonic(battle.playerCreature);
      battle.message = `${battle.playerCreature.name} recovered ${restored} HP.`;
      this.messageTimer = 0.5;
      battle.turn = 'enemy';
      this.enemyActionQueued = false;
      this.game.save();
      return;
    }

    const moveKey = battle.playerCreature.moves[action.moveSlot] || battle.playerCreature.moves[0];
    const result = this.game.battleSystem.performMove(battle.playerCreature, battle.enemyCreature, moveKey);
    battle.message = result.text;
    this.messageTimer = 0.5;

    if (battle.enemyCreature.hp <= 0) {
      const xpGain = battle.enemyCreature.level * 5;
      battle.message += ` ${battle.enemyCreature.name} fainted! ${battle.playerCreature.name} will earn ${xpGain} XP. Press Enter.`;
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

  render(ctx) {
    const battle = this.game.state.battle;
    if (!battle) return;

    this.drawBackground(ctx);
    this.drawCreatures(ctx, battle);
    this.drawUi(ctx, battle);
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
    gradient.addColorStop(0, '#4e84b8');
    gradient.addColorStop(1, '#d6efff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.ellipse(160, 94, 84, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(820, 76, 92, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#d8f2b8';
    ctx.beginPath();
    ctx.ellipse(210, 366, 180, 64, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(730, 208, 145, 54, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCreatures(ctx, battle) {
    drawBattleCreature(ctx, battle.enemyCreature, 730, 170, false, this.game.state.clock);
    drawBattleCreature(ctx, battle.playerCreature, 220, 340, true, this.game.state.clock);
  }

  drawUi(ctx, battle) {
    drawPanel(ctx, 34, 28, 280, 92, battle.kind === 'trainer' ? 'Trainer Opponent' : 'Wild Opponent');
    drawCreatureBadge(ctx, battle.enemyCreature, 48, 58, true);

    drawPanel(ctx, 640, 350, 286, 92, 'Your Creature');
    drawCreatureBadge(ctx, battle.playerCreature, 654, 380, true);

    drawPanel(ctx, 24, 452, 912, 100, 'Battle Log');
    drawTextBlock(ctx, [battle.message], 40, 488, 20, 840);

    drawPanel(ctx, 640, 28, 286, 176, 'Actions');
    const actionLines = ACTIONS.map((action, index) => {
      if (action.moveSlot !== undefined) {
        const moveKey = battle.playerCreature.moves[action.moveSlot] || battle.playerCreature.moves[0];
        const move = this.game.battleSystem.getMove(moveKey);
        return `${index + 1}. ${move?.name || 'Unknown'} (${move?.type || '—'})`;
      }
      if (action.action === 'run' && battle.cannotRun) return `${index + 1}. Can't Run`;
      return action.label;
    });
    drawTextBlock(ctx, [...actionLines, `Tonics left: ${this.game.state.player.inventory.tonic}`], 660, 64, 26);
  }
}
