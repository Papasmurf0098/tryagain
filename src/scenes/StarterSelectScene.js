import { STARTER_TRIO } from '../data/starters.js';
import { drawBattleCreature } from '../rendering/entities.js';
import { drawPanel, drawTextBlock } from '../rendering/ui.js';

export class StarterSelectScene {
  constructor(game) {
    this.game = game;
    this.label = 'Starter Select';
    this.selectedIndex = 0;
    this.previewTeam = STARTER_TRIO.map((starter) => game.createCreatureInstance(starter.key, 5));
  }

  update() {
    const input = this.game.input;
    if (input.wasPressed('arrowleft', 'a')) this.selectedIndex = wrapIndex(this.selectedIndex - 1, STARTER_TRIO.length);
    if (input.wasPressed('arrowright', 'd')) this.selectedIndex = wrapIndex(this.selectedIndex + 1, STARTER_TRIO.length);

    const directPick = ['1', '2', '3'].find((key) => input.wasPressed(key));
    if (directPick) this.selectedIndex = Number(directPick) - 1;

    if (input.wasPressed(' ', 'enter')) {
      const starter = STARTER_TRIO[this.selectedIndex];
      if (starter) this.game.chooseStarter(starter.key);
    }
  }

  getDebugState() {
    return {
      scene: 'starter-select',
      selectedIndex: this.selectedIndex,
      selectedKey: STARTER_TRIO[this.selectedIndex]?.key || null,
      options: STARTER_TRIO.map((starter) => starter.key),
    };
  }

  render(ctx) {
    this.drawBackground(ctx);
    this.drawHeader(ctx);
    this.drawChoices(ctx);
    this.drawSelectionCard(ctx);
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
    gradient.addColorStop(0, '#8ec5ff');
    gradient.addColorStop(0.45, '#d9f2ff');
    gradient.addColorStop(1, '#eef8d7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    for (let index = 0; index < 5; index += 1) {
      ctx.beginPath();
      ctx.ellipse(120 + index * 180, 90 + index * 16, 96, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawHeader(ctx) {
    drawPanel(ctx, 86, 30, 788, 110, 'Choose Your First Partner');
    drawTextBlock(
      ctx,
      [
        'Every journey in Tidelight begins with one trusted companion.',
        'Pick the partner whose style you want to grow with first. Use Left/Right or 1-3, then press Enter.',
      ],
      110,
      72,
      20,
      736,
    );
  }

  drawChoices(ctx) {
    const baseY = 270;
    const positions = [206, 480, 754];

    STARTER_TRIO.forEach((starter, index) => {
      const creature = this.previewTeam[index];
      const isSelected = index === this.selectedIndex;
      const x = positions[index];

      ctx.save();
      ctx.globalAlpha = isSelected ? 1 : 0.72;
      ctx.fillStyle = isSelected ? 'rgba(255, 245, 160, 0.42)' : 'rgba(255,255,255,0.18)';
      ctx.beginPath();
      ctx.ellipse(x, baseY + 102, isSelected ? 124 : 108, isSelected ? 52 : 44, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (isSelected) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 244, 168, 0.9)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, baseY + 28, 84, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      drawBattleCreature(ctx, creature, x, baseY + 18, false, this.game.state.clock);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#102030';
      ctx.font = isSelected ? '700 24px Inter, sans-serif' : '700 21px Inter, sans-serif';
      ctx.fillText(`${index + 1}. ${starter.title}`, x, baseY + 148);
      ctx.fillStyle = '#24384c';
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText(starter.role, x, baseY + 172);
      ctx.restore();
    });
  }

  drawSelectionCard(ctx) {
    const starter = STARTER_TRIO[this.selectedIndex];
    const creature = this.previewTeam[this.selectedIndex];
    drawPanel(ctx, 168, 452, 624, 96, `${starter.title} Preview`);
    drawTextBlock(
      ctx,
      [
        starter.summary,
        `${creature.type} type • HP ${creature.hp} • ATK ${creature.attack} • DEF ${creature.defense} • SPD ${creature.speed}`,
        `Moves: ${creature.moves.join(', ')}`,
      ],
      194,
      486,
      18,
      574,
    );
  }
}

function wrapIndex(value, size) {
  return ((value % size) + size) % size;
}
