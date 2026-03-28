import { TILE, TILE_COLORS } from '../core/config.js';
import { oscillate } from '../core/utils.js';

const OUTDOOR_FINE_LINE_TILES = new Set(['.', 'g', 'v', 't', '#', 's', '~', 'w']);

export function drawTile(ctx, tile, screenX, screenY, clock) {
  const baseColor = TILE_COLORS[tile] || '#555';
  ctx.save();

  const gradient = createTileGradient(ctx, tile, screenX, screenY, baseColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(screenX, screenY, TILE, TILE);

  if (OUTDOOR_FINE_LINE_TILES.has(tile)) drawFineLines(ctx, screenX, screenY);

  if (tile === '.') drawField(ctx, screenX, screenY, clock);
  if (tile === 'g') drawGrass(ctx, screenX, screenY, clock);
  if (tile === 'v') drawBrambleWall(ctx, screenX, screenY, clock);
  if (tile === 't') drawTree(ctx, screenX, screenY, clock);
  if (tile === '#') drawWall(ctx, screenX, screenY);
  if (tile === 's') drawShrine(ctx, screenX, screenY);
  if (tile === '~') drawWater(ctx, screenX, screenY, clock);
  if (tile === 'w') drawWarp(ctx, screenX, screenY, clock);
  if (tile === 'r') drawRoof(ctx, screenX, screenY);
  if (tile === 'b') drawBuildingWall(ctx, screenX, screenY);
  if (tile === 'd') drawDoor(ctx, screenX, screenY);
  if (tile === 'f') drawFloor(ctx, screenX, screenY);
  if (tile === 'u') drawRug(ctx, screenX, screenY);
  if (tile === 'c') drawCounter(ctx, screenX, screenY);
  if (tile === 'k') drawShelf(ctx, screenX, screenY);
  if (tile === 'p') drawPlant(ctx, screenX, screenY, clock);
  if (tile === 'i') drawInteriorWall(ctx, screenX, screenY);

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.strokeRect(screenX + 0.5, screenY + 0.5, TILE - 1, TILE - 1);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(screenX + 1, screenY + 1, TILE - 2, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.09)';
  ctx.fillRect(screenX + 1, screenY + TILE - 4, TILE - 2, 3);

  ctx.restore();
}

function createTileGradient(ctx, tile, x, y, baseColor) {
  if (tile === 'f' || tile === 'u' || tile === 'c' || tile === 'k' || tile === 'i') {
    const gradient = ctx.createLinearGradient(x, y, x + TILE, y + TILE);
    gradient.addColorStop(0, lighten(baseColor, 0.12));
    gradient.addColorStop(1, darken(baseColor, 0.12));
    return gradient;
  }

  const gradient = ctx.createLinearGradient(x, y, x, y + TILE);
  gradient.addColorStop(0, lighten(baseColor, 0.14));
  gradient.addColorStop(1, darken(baseColor, 0.16));
  return gradient;
}

function drawFineLines(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let offset = 6; offset < TILE; offset += 12) {
    ctx.moveTo(x + 1, y + offset);
    ctx.lineTo(x + TILE - 1, y + offset);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.beginPath();
  for (let offset = 8; offset < TILE; offset += 16) {
    ctx.moveTo(x + offset, y + 1);
    ctx.lineTo(x + offset, y + TILE - 1);
  }
  ctx.stroke();
  ctx.restore();
}

function drawField(ctx, x, y, clock) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(x + 4, y + 5, TILE - 8, 5);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(x + 6, y + 24, TILE - 12, 4);

  for (let ridge = 0; ridge < 3; ridge += 1) {
    const sway = oscillate(clock + ridge * 0.27 + x * 0.03, 2.2, 1.4);
    ctx.strokeStyle = `rgba(89, 128, 70, ${0.11 + ridge * 0.03})`;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 15 + ridge * 10);
    ctx.quadraticCurveTo(x + 20, y + 11 + ridge * 9 + sway, x + TILE - 6, y + 15 + ridge * 10);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  dot(ctx, x + 11, y + 17, 1.6);
  dot(ctx, x + 30, y + 30, 1.4);
  ctx.fillStyle = 'rgba(60,90,43,0.20)';
  dot(ctx, x + 18, y + 26, 1.5);
  dot(ctx, x + 35, y + 14, 1.2);
  ctx.restore();
}

function drawGrass(ctx, x, y, clock) {
  ctx.save();
  ctx.fillStyle = 'rgba(36, 84, 27, 0.16)';
  ctx.fillRect(x + 4, y + 24, TILE - 8, 12);

  for (let blade = 0; blade < 7; blade += 1) {
    const offset = oscillate(clock + blade * 0.17 + x * 0.01, 4, 1.8);
    const bx = x + 5 + blade * 6;
    const height = 11 + (blade % 3) * 4;
    ctx.fillStyle = blade % 2 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(17,54,15,0.18)';
    ctx.beginPath();
    ctx.moveTo(bx, y + 38);
    ctx.quadraticCurveTo(bx + offset * 0.6, y + 33 - height * 0.45, bx + offset, y + 38 - height);
    ctx.quadraticCurveTo(bx + 2 + offset * 0.3, y + 36 - height * 0.25, bx + 3, y + 38);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(247, 244, 187, 0.7)';
  dot(ctx, x + 12, y + 19, 1.2);
  dot(ctx, x + 33, y + 13, 1.2);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillRect(x + 5, y + 9, TILE - 10, 2);
  ctx.restore();
}

function drawBrambleWall(ctx, x, y, clock) {
  ctx.save();
  ctx.fillStyle = 'rgba(29, 61, 19, 0.22)';
  ctx.fillRect(x + 3, y + 22, TILE - 6, 16);

  for (let vine = 0; vine < 5; vine += 1) {
    const bend = oscillate(clock + vine * 0.31 + x * 0.02, 3, 1.6);
    const startX = x + 6 + vine * 8;
    ctx.strokeStyle = vine % 2 === 0 ? 'rgba(214, 245, 167, 0.18)' : 'rgba(37, 82, 26, 0.34)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, y + TILE - 6);
    ctx.quadraticCurveTo(startX + bend, y + 28, startX - bend * 0.4, y + 7);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(70, 112, 44, 0.46)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + 5, y + 18);
  ctx.lineTo(x + TILE - 5, y + 14);
  ctx.moveTo(x + 7, y + 29);
  ctx.lineTo(x + TILE - 8, y + 25);
  ctx.stroke();

  ctx.fillStyle = 'rgba(245, 235, 182, 0.65)';
  dot(ctx, x + 13, y + 13, 1.2);
  dot(ctx, x + 31, y + 18, 1.2);
  dot(ctx, x + 21, y + 28, 1.1);
  ctx.restore();
}

function drawTree(ctx, x, y, clock) {
  ctx.save();
  const sway = oscillate(clock + x * 0.01, 2.2, 1.5);
  ctx.fillStyle = '#4d2f17';
  ctx.fillRect(x + 19, y + 22, 10, 21);
  ctx.fillStyle = '#7d5730';
  ctx.fillRect(x + 22, y + 22, 3, 20);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(x + 18, y + 39, 12, 3);

  const canopy = ctx.createRadialGradient(x + 24 + sway, y + 15, 4, x + 24 + sway, y + 18, 18);
  canopy.addColorStop(0, '#71ca62');
  canopy.addColorStop(0.5, '#3e8a3a');
  canopy.addColorStop(1, '#234c23');
  ctx.fillStyle = canopy;
  ctx.beginPath();
  ctx.arc(x + 24 + sway, y + 18, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  dot(ctx, x + 18 + sway * 0.2, y + 12, 2.2);
  dot(ctx, x + 29 + sway * 0.1, y + 17, 1.8);
  ctx.strokeStyle = 'rgba(28, 63, 25, 0.28)';
  ctx.beginPath();
  ctx.moveTo(x + 24, y + 18);
  ctx.lineTo(x + 17 + sway * 0.2, y + 10);
  ctx.moveTo(x + 24, y + 18);
  ctx.lineTo(x + 30 + sway * 0.2, y + 11);
  ctx.stroke();
  ctx.restore();
}

function drawWall(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(x, y, TILE, 8);
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.fillRect(x, y + TILE - 6, TILE, 6);
  ctx.strokeStyle = 'rgba(255,255,255,0.11)';
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 13);
  ctx.lineTo(x + TILE - 6, y + 13);
  ctx.moveTo(x + 6, y + 23);
  ctx.lineTo(x + TILE - 6, y + 23);
  ctx.moveTo(x + 6, y + 33);
  ctx.lineTo(x + TILE - 10, y + 33);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.moveTo(x + 13, y + 9);
  ctx.lineTo(x + 11, y + 18);
  ctx.lineTo(x + 15, y + 24);
  ctx.moveTo(x + 29, y + 20);
  ctx.lineTo(x + 25, y + 27);
  ctx.lineTo(x + 31, y + 35);
  ctx.stroke();
  ctx.restore();
}

function drawShrine(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = '#6f4c15';
  ctx.fillRect(x + 18, y + 10, 12, 26);
  ctx.fillStyle = '#4a2f0f';
  ctx.fillRect(x + 19, y + 10, 2, 26);
  const sign = ctx.createLinearGradient(x + 12, y + 12, x + 36, y + 18);
  sign.addColorStop(0, '#f1e3ac');
  sign.addColorStop(1, '#d8be72');
  ctx.fillStyle = sign;
  ctx.fillRect(x + 10, y + 11, 28, 10);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x + 12, y + 13, 24, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x + 13, y + 17, 22, 1);
  ctx.fillRect(x + 15, y + 20, 18, 1);
  ctx.restore();
}

function drawWarp(ctx, x, y, clock) {
  ctx.save();
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
  ctx.strokeStyle = `rgba(255,255,255,${0.18 + pulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(x + 24, y + 24, 6 + pulse * 1.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  dot(ctx, x + 18 + pulse * 4, y + 14, 1.4);
  dot(ctx, x + 31 - pulse * 3, y + 18, 1.2);
  dot(ctx, x + 21, y + 31 - pulse * 2, 1.2);
  ctx.restore();
}

function drawWater(ctx, x, y, clock) {
  ctx.save();
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
  ctx.strokeStyle = `rgba(213, 244, 255, ${0.18 + shimmer * 0.1})`;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 8);
  ctx.lineTo(x + TILE - 6, y + 8);
  ctx.moveTo(x + 9, y + 16);
  ctx.lineTo(x + TILE - 10, y + 16);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(x + 6, y + 27, TILE - 12, 3);
  ctx.restore();
}

function drawRoof(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(58, 26, 20, 0.18)';
  ctx.fillRect(x + 3, y + 30, TILE - 6, 10);
  for (let row = 0; row < 4; row += 1) {
    const rowY = y + 8 + row * 8;
    ctx.fillStyle = row % 2 === 0 ? '#b96e4f' : '#9d593e';
    for (let shingle = 0; shingle < 4; shingle += 1) {
      const offset = row % 2 === 0 ? 2 : 7;
      roundTileRect(ctx, x + offset + shingle * 10, rowY, 12, 8, 4);
      ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(x + 7, y + 8, TILE - 14, 2);
  ctx.strokeStyle = 'rgba(76, 32, 24, 0.32)';
  ctx.strokeRect(x + 5.5, y + 7.5, TILE - 11, TILE - 15);
  ctx.restore();
}

function drawBuildingWall(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x + 4, y + 7, TILE - 8, 5);
  ctx.fillStyle = '#7d5233';
  ctx.fillRect(x + 3, y + 13, TILE - 6, 4);
  ctx.fillStyle = '#f0e4c8';
  ctx.fillRect(x + 5, y + 18, TILE - 10, 20);

  ctx.fillStyle = '#7aa0b4';
  ctx.fillRect(x + 8, y + 21, 10, 9);
  ctx.fillRect(x + 30, y + 21, 10, 9);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(x + 9, y + 22, 8, 2);
  ctx.fillRect(x + 31, y + 22, 8, 2);
  ctx.fillStyle = '#8c6848';
  ctx.fillRect(x + 22, y + 18, 4, 20);
  ctx.fillRect(x + 5, y + 36, TILE - 10, 3);
  ctx.restore();
}

function drawDoor(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = '#6d4a2d';
  ctx.fillRect(x + 12, y + 10, 24, 30);
  ctx.fillStyle = '#3a2516';
  ctx.fillRect(x + 16, y + 14, 16, 26);
  ctx.fillStyle = '#c7b28a';
  ctx.fillRect(x + 10, y + 8, 28, 3);
  ctx.fillStyle = '#d9c7a0';
  ctx.fillRect(x + 8, y + 39, 32, 4);
  ctx.fillStyle = '#e7d478';
  dot(ctx, x + 28, y + 27, 1.8);
  ctx.restore();
}

function drawFloor(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = 'rgba(89, 56, 30, 0.26)';
  ctx.lineWidth = 1;
  for (let offset = 7; offset < TILE; offset += 10) {
    ctx.beginPath();
    ctx.moveTo(x + offset, y + 4);
    ctx.lineTo(x + offset, y + TILE - 4);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.moveTo(x + 5, y + 16);
  ctx.lineTo(x + TILE - 5, y + 16);
  ctx.moveTo(x + 5, y + 32);
  ctx.lineTo(x + TILE - 5, y + 32);
  ctx.stroke();
  ctx.fillStyle = 'rgba(87, 53, 29, 0.20)';
  dot(ctx, x + 15, y + 22, 1.8);
  dot(ctx, x + 31, y + 30, 1.6);
  ctx.restore();
}

function drawRug(ctx, x, y) {
  ctx.save();
  drawFloor(ctx, x, y);
  const rug = ctx.createLinearGradient(x + 10, y + 8, x + TILE - 10, y + TILE - 8);
  rug.addColorStop(0, '#cc7a62');
  rug.addColorStop(1, '#8c3f36');
  ctx.fillStyle = rug;
  roundTileRect(ctx, x + 8, y + 8, TILE - 16, TILE - 16, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(249, 225, 174, 0.65)';
  ctx.strokeRect(x + 11.5, y + 11.5, TILE - 23, TILE - 23);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.moveTo(x + 15, y + 15);
  ctx.lineTo(x + TILE - 15, y + TILE - 15);
  ctx.moveTo(x + TILE - 15, y + 15);
  ctx.lineTo(x + 15, y + TILE - 15);
  ctx.stroke();
  ctx.fillStyle = 'rgba(241, 225, 186, 0.85)';
  for (let fringe = 0; fringe < 4; fringe += 1) {
    ctx.fillRect(x + 14 + fringe * 6, y + 6, 2, 3);
    ctx.fillRect(x + 14 + fringe * 6, y + TILE - 9, 2, 3);
  }
  ctx.restore();
}

function drawCounter(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = '#6b4933';
  ctx.fillRect(x + 5, y + 10, TILE - 10, 9);
  ctx.fillStyle = '#8f674b';
  ctx.fillRect(x + 7, y + 18, TILE - 14, 18);
  ctx.fillStyle = '#d7c39d';
  ctx.fillRect(x + 5, y + 8, TILE - 10, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillRect(x + 8, y + 11, TILE - 16, 2);
  ctx.fillStyle = '#ba9b54';
  dot(ctx, x + 15, y + 27, 1.6);
  dot(ctx, x + 33, y + 27, 1.6);
  ctx.restore();
}

function drawShelf(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = '#715132';
  ctx.fillRect(x + 7, y + 8, TILE - 14, 30);
  ctx.fillStyle = '#5a3f28';
  ctx.fillRect(x + 10, y + 11, TILE - 20, 4);
  ctx.fillRect(x + 10, y + 22, TILE - 20, 4);
  ctx.fillRect(x + 10, y + 33, TILE - 20, 4);
  const colors = ['#d36a5a', '#e2ba58', '#6fb2c8', '#9b82d9', '#7ab365'];
  for (let slot = 0; slot < 5; slot += 1) {
    ctx.fillStyle = colors[slot % colors.length];
    ctx.fillRect(x + 12 + slot * 5, y + 15, 4, 6);
    ctx.fillRect(x + 12 + ((slot + 1) % 5) * 5, y + 26, 4, 6);
  }
  ctx.fillStyle = '#d1bc8b';
  ctx.fillRect(x + 28, y + 27, 8, 5);
  ctx.restore();
}

function drawPlant(ctx, x, y, clock) {
  ctx.save();
  const sway = oscillate(clock + x * 0.03, 1.8, 1.2);
  ctx.fillStyle = '#8b5a37';
  roundTileRect(ctx, x + 16, y + 28, 16, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#527349';
  ctx.beginPath();
  ctx.moveTo(x + 24, y + 29);
  ctx.quadraticCurveTo(x + 14 + sway, y + 20, x + 15, y + 10);
  ctx.quadraticCurveTo(x + 20, y + 13, x + 23, y + 22);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 24, y + 29);
  ctx.quadraticCurveTo(x + 34 - sway, y + 19, x + 34, y + 11);
  ctx.quadraticCurveTo(x + 29, y + 13, x + 25, y + 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  dot(ctx, x + 17, y + 13, 1.4);
  dot(ctx, x + 31, y + 14, 1.4);
  ctx.restore();
}

function drawInteriorWall(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(x + 4, y + 6, TILE - 8, 4);
  ctx.fillStyle = '#6d5f4e';
  ctx.fillRect(x + 5, y + 34, TILE - 10, 8);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  for (let offset = 10; offset < TILE - 4; offset += 12) {
    ctx.beginPath();
    ctx.moveTo(x + offset, y + 12);
    ctx.lineTo(x + offset, y + 34);
    ctx.stroke();
  }
  ctx.restore();
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

function dot(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function roundTileRect(ctx, x, y, width, height, radius) {
  const clampedRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + clampedRadius, y);
  ctx.lineTo(x + width - clampedRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
  ctx.lineTo(x + width, y + height - clampedRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - clampedRadius, y + height);
  ctx.lineTo(x + clampedRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
  ctx.lineTo(x, y + clampedRadius);
  ctx.quadraticCurveTo(x, y, x + clampedRadius, y);
  ctx.closePath();
}
