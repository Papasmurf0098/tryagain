import { roundRect, wrapLine } from '../core/utils.js';

export function drawPanel(ctx, x, y, width, height, title) {
  ctx.save();
  roundRect(ctx, x, y, width, height, 14);
  const gradient = ctx.createLinearGradient(x, y, x, y + height);
  gradient.addColorStop(0, 'rgba(16, 24, 32, 0.90)');
  gradient.addColorStop(1, 'rgba(10, 16, 22, 0.82)');
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.stroke();
  if (title) {
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillText(title, x + 14, y + 24);
  }
  ctx.restore();
}

export function drawTextBlock(ctx, lines, x, y, lineHeight = 22, maxWidth = 9999) {
  ctx.save();
  ctx.font = '16px Inter, sans-serif';
  ctx.fillStyle = '#dce5ef';
  let cursorY = y;
  for (const line of lines) {
    const wrapped = wrapLine(ctx, String(line), maxWidth);
    for (const segment of wrapped) {
      ctx.fillText(segment, x, cursorY);
      cursorY += lineHeight;
    }
  }
  ctx.restore();
}

export function drawHpBar(ctx, x, y, width, hp, maxHp) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(x, y, width, 10);
  const ratio = Math.max(0, Math.min(1, hp / maxHp));
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  if (ratio > 0.5) {
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(1, '#86efac');
  } else if (ratio > 0.2) {
    gradient.addColorStop(0, '#f59e0b');
    gradient.addColorStop(1, '#fde047');
  } else {
    gradient.addColorStop(0, '#ef4444');
    gradient.addColorStop(1, '#fca5a5');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width * ratio, 10);
  ctx.restore();
}

export function drawCreatureBadge(ctx, creature, x, y, compact = true) {
  ctx.save();
  const orbRadius = compact ? 10 : 16;
  const orbGradient = ctx.createRadialGradient(x + 10, y + 6, 3, x + 16, y + 12, orbRadius + 6);
  orbGradient.addColorStop(0, '#ffffff');
  orbGradient.addColorStop(0.2, creature.color);
  orbGradient.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = orbGradient;
  ctx.beginPath();
  ctx.arc(x + 16, y + 12, orbRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = compact ? '700 16px Inter, sans-serif' : '700 18px Inter, sans-serif';
  ctx.fillText(`${creature.name} Lv.${creature.level}`, x + 36, y + 8);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText(`${creature.type} • HP ${creature.hp}/${creature.maxHp}`, x + 36, y + 28);
  drawHpBar(ctx, x + 36, y + 38, compact ? 140 : 180, creature.hp, creature.maxHp);
  if (!compact) {
    ctx.fillText(`ATK ${creature.attack} • DEF ${creature.defense} • SPD ${creature.speed}`, x + 36, y + 62);
  }
  ctx.restore();
}
