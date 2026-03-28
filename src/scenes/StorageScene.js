import { drawCreatureBadge, drawPanel, drawTextBlock } from '../rendering/ui.js';

export class StorageScene {
  constructor(game, data = {}) {
    this.game = game;
    this.label = 'Storage';
    this.returnScene = data.returnScene || 'overworld';
  }

  update() {
    if (this.game.input.wasPressed(' ', 'enter', 'escape', 'backspace')) {
      this.game.changeScene(this.returnScene);
    }
  }

  getDebugState() {
    return {
      scene: 'storage',
      partySize: this.game.state.player.party.length,
      storageSize: this.game.state.player.storage.length,
    };
  }

  render(ctx) {
    this.drawBackground(ctx);
    drawPanel(ctx, 40, 28, 880, 84, 'Harbor Storage Terminal');
    drawTextBlock(
      ctx,
      ['Field party stays capped at six. Extra captured creatures are routed here automatically. Press Enter to return.'],
      60,
      72,
      18,
      840,
    );

    drawPanel(ctx, 40, 136, 406, 392, `Field Party (${this.game.state.player.party.length}/6)`);
    this.drawCreatureColumn(ctx, this.game.state.player.party, 58, 170, false);

    drawPanel(ctx, 514, 136, 406, 392, `Stored Creatures (${this.game.state.player.storage.length})`);
    if (this.game.state.player.storage.length) {
      this.drawCreatureColumn(ctx, this.game.state.player.storage, 532, 170, true);
    } else {
      drawTextBlock(ctx, ['No creatures are in storage yet.'], 536, 178, 20, 340);
    }
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
    gradient.addColorStop(0, '#20354d');
    gradient.addColorStop(1, '#101924');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.game.width, this.game.height);
  }

  drawCreatureColumn(ctx, creatures, x, y, compact) {
    creatures.slice(0, compact ? 5 : 4).forEach((creature, index) => {
      drawCreatureBadge(ctx, creature, x, y + index * (compact ? 72 : 90), compact);
    });

    if (creatures.length > (compact ? 5 : 4)) {
      drawTextBlock(ctx, [`+${creatures.length - (compact ? 5 : 4)} more stored entries`], x, y + (compact ? 370 : 374), 18, 320);
    }
  }
}
