import { TILE, TILE_COLORS } from '../core/config.js';
import { oscillate } from '../core/utils.js';

export function drawTile(ctx, tile, screenX, screenY, clock) {
  const baseColor = TILE_COLORS[tile] || '#555';
  ctx.save();

  const gradient = ctx.createLinearGradient(screenX, screenY, screenX, screenY + TILE);
  gradient.addColorStop(0, lighten(baseColor, 0.14));
  gradient.addColorStop(1, darken(baseColor, 0.16));
  ctx.fillStyle = gradient;
  ctx.fillRect(screenX, screenY, TILE, TILE);

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.strokeRect(screenX + 0.5, screenY + 0.5, TILE - 1, TILE - 1);

  if (tile === 'g') drawGrass(ctx, screenX, screenY, clock);
  if (tile === 't') drawTree(ctx, screenX, screenY, clock);
  if (tile === '#') drawWall(ctx, screenX, screenY);
  if (tile === 's') drawShrine(ctx, screenX, screenY);
  if (tile === '~') drawWater(ctx, screenX, screenY, clock);
  if (tile === 'w') drawWarp(ctx, screenX, screenY, clock);

  ctx.restore();
}

function drawGrass(ctx, x, y, clock) {
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  for (let blade = 0; blade < 5; blade += 1) {
    const offset = oscillate(clock + blade * 0.17, 4, 1.4);
    const bx = x + 7 + blade * 8;
    ctx.beginPath();
    ctx.moveTo(bx, y + 35);
    ctx.lineTo(bx + offset, y + 18);
    ctx.lineTo(bx + 3, y + 35);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTree(ctx, x, y, clock) {
  const sway = oscillate(clock + x * 0.01, 2.2, 1.5);
  ctx.fillStyle = '#5d3a1c';
  ctx.fillRect(x + 20, y + 22, 8, 20);

  const canopy = ctx.createRadialGradient(x + 24 + sway, y + 16, 4, x + 24 + sway, y + 18, 18);
  canopy.addColorStop(0, '#53a54b');
  canopy.addColorStop(1, '#234c23');
  ctx.fillStyle = canopy;
  ctx.beginPath();
  ctx.arc(x + 24 + sway, y + 18, 15, 0, Math.PI * 2);
  ctx.fill();
}

function drawWall(ctx, x, y) {
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(x, y, TILE, 8);
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.fillRect(x, y + TILE - 6, TILE, 6);
}

function drawShrine(ctx, x, y) {
  ctx.fillStyle = '#6f4c15';
  ctx.fillRect(x + 18, y + 9, 12, 25);
  const sign = ctx.createLinearGradient(x + 12, y + 12, x + 36, y + 18);
  sign.addColorStop(0, '#f1e3ac');
  sign.addColorStop(1, '#d8be72');
  ctx.fillStyle = sign;
  ctx.fillRect(x + 12, y + 12, 24, 8);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x + 15, y + 14, 18, 1);
}


function drawWarp(ctx, x, y, clock) {
  const pulse = (Math.sin(clock * 5) + 1) * 0.5;
  const ring = ctx.createRadialGradient(x + 24, y + 24, 4, x + 24, y + 24, 18);
  ring.addColorStop(0, 'rgba(255,255,255,0.85)');
  ring.addColorStop(0.45, `rgba(177, 126, 255, ${0.65 + pulse * 0.2})`);
  ring.addColorStop(1, 'rgba(80, 24, 148, 0.12)');
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(x + 24, y + 24, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(x + 24, y + 24, 10 + pulse * 3, 0, Math.PI * 2);
  ctx.stroke();
}

function drawWater(ctx, x, y, clock) {
  const shimmer = oscillate(clock + x * 0.02 + y * 0.02, 3.4, 0.2) + 0.55;
  ctx.fillStyle = `rgba(255,255,255,${shimmer * 0.12})`;
  for (let row = 0; row < 3; row += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 10 + row * 12);
    for (let step = 0; step <= 5; step += 1) {
      const px = x + 4 + step * 8;
      const py = y + 10 + row * 12 + Math.sin(clock * 4 + row + step * 0.7) * 2;
      ctx.lineTo(px, py);
    }
    ctx.strokeStyle = `rgba(255,255,255,${0.12 + row * 0.05})`;
    ctx.stroke();
  }
}

function lighten(hex, amount) {
  return adjustHex(hex, amount);
}

function darken(hex, amount) {
  return adjustHex(hex, -amount);
}

function adjustHex(hex, amount) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const next = [r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel + 255 * amount))))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('');
  return `#${next}`;
}
