import { drawPanel, drawTextBlock } from '../rendering/ui.js';

const PAGE_SIZE = 8;

export class CodexScene {
  constructor(game, data = {}) {
    this.game = game;
    this.label = 'Codex';
    this.returnScene = data.returnScene || 'overworld';
    this.pageIndex = 0;
  }

  update() {
    const entries = this.game.getCodexEntries();
    const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));

    if (this.game.input.wasPressed('arrowleft', 'a', 'q')) this.pageIndex = (this.pageIndex - 1 + pageCount) % pageCount;
    if (this.game.input.wasPressed('arrowright', 'd', 'e')) this.pageIndex = (this.pageIndex + 1) % pageCount;
    if (this.game.input.wasPressed(' ', 'enter', 'escape', 'backspace')) this.game.changeScene(this.returnScene);
  }

  getDebugState() {
    return {
      scene: 'codex',
      pageIndex: this.pageIndex,
      entryCount: this.game.getCodexEntries().length,
    };
  }

  render(ctx) {
    const entries = this.game.getCodexEntries();
    const counts = this.game.getCodexCounts();
    const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
    const visibleEntries = entries.slice(this.pageIndex * PAGE_SIZE, (this.pageIndex + 1) * PAGE_SIZE);

    this.drawBackground(ctx);
    drawPanel(ctx, 42, 28, 876, 88, 'Regional Codex Kiosk');
    drawTextBlock(
      ctx,
      [`Seen ${counts.seen} • Caught ${counts.caught} • Page ${this.pageIndex + 1}/${pageCount}`, 'Use Left / Right to turn pages. Press Enter to return.'],
      62,
      72,
      18,
      830,
    );

    drawPanel(ctx, 42, 136, 876, 392, 'Known Species');
    if (!visibleEntries.length) {
      drawTextBlock(ctx, ['No creatures have been recorded yet.'], 64, 180, 20, 320);
      return;
    }

    visibleEntries.forEach((entry, index) => {
      const x = index < 4 ? 64 : 494;
      const y = 172 + (index % 4) * 84;
      const status = entry.caught ? 'Caught' : 'Seen';
      const habitatText = entry.habitats.length ? entry.habitats.join(', ') : 'Unknown habitat';

      ctx.save();
      ctx.fillStyle = entry.color;
      ctx.beginPath();
      ctx.arc(x + 16, y + 14, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      drawTextBlock(
        ctx,
        [
          `${entry.name} • ${entry.type} • ${status}`,
          `${entry.category}`,
          habitatText,
        ],
        x + 34,
        y + 8,
        18,
        330,
      );
    });
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
    gradient.addColorStop(0, '#17293d');
    gradient.addColorStop(1, '#0f1824');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.game.width, this.game.height);
  }
}
