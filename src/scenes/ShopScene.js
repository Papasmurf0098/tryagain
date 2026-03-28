import { drawPanel, drawTextBlock } from '../rendering/ui.js';

export class ShopScene {
  constructor(game, data = {}) {
    this.game = game;
    this.label = 'Shop';
    this.returnScene = data.returnScene || 'overworld';
    this.items = this.game.getShopCatalog();
    this.selectedIndex = 0;
    this.notice = 'Buy supplies with Enter. Use Up / Down or 1-2. Press Escape to return.';
  }

  update() {
    if (this.game.input.wasPressed('escape', 'backspace')) {
      this.game.changeScene(this.returnScene);
      return;
    }

    if (this.game.input.wasPressed('arrowup', 'w')) this.selectedIndex = wrapIndex(this.selectedIndex - 1, this.items.length);
    if (this.game.input.wasPressed('arrowdown', 's')) this.selectedIndex = wrapIndex(this.selectedIndex + 1, this.items.length);

    const directPick = ['1', '2', '3', '4'].find((key) => this.game.input.wasPressed(key));
    if (directPick) this.selectedIndex = Math.min(this.items.length - 1, Number(directPick) - 1);

    if (this.game.input.wasPressed(' ', 'enter')) {
      const item = this.items[this.selectedIndex];
      if (!item) return;
      const result = this.game.purchaseItem(item.key);
      this.notice = result.message;
    }
  }

  getDebugState() {
    return {
      scene: 'shop',
      selectedItemKey: this.items[this.selectedIndex]?.key || null,
      money: this.game.getMoney(),
    };
  }

  render(ctx) {
    this.drawBackground(ctx);
    drawPanel(ctx, 56, 36, 848, 92, 'Harbor Provision Counter');
    drawTextBlock(
      ctx,
      [`Money ${this.game.getMoney()} coral`, this.notice],
      76,
      78,
      18,
      790,
    );

    drawPanel(ctx, 56, 152, 848, 362, 'Stock');
    this.items.forEach((item, index) => {
      const y = 190 + index * 88;
      const selected = index === this.selectedIndex;

      ctx.save();
      ctx.fillStyle = selected ? 'rgba(255, 235, 153, 0.18)' : 'rgba(255,255,255,0.04)';
      ctx.fillRect(76, y - 18, 808, 72);
      ctx.restore();

      drawTextBlock(
        ctx,
        [
          `${index + 1}. ${item.name} • ${item.price} coral • Owned ${this.game.state.player.inventory[item.key] ?? 0}`,
          item.description,
        ],
        94,
        y,
        22,
        760,
      );
    });
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
    gradient.addColorStop(0, '#243648');
    gradient.addColorStop(1, '#111b26');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.game.width, this.game.height);
  }
}

function wrapIndex(value, size) {
  if (!size) return 0;
  return ((value % size) + size) % size;
}
