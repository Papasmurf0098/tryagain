import { TILE } from '../core/config.js';
import { oscillate } from '../core/utils.js';

const PLAYER_APPEARANCE = {
  skin: '#f2c7a1',
  hair: '#4a281d',
  shirt: '#f3c24f',
  jacket: '#d9982e',
  pants: '#2b394d',
  shoes: '#16191f',
  accent: '#fbf2cb',
  hairStyle: 'crest',
  accessory: 'scarf',
};

export function drawPlayer(ctx, player, camera, clock, animation = null) {
  drawHumanoid(ctx, {
    ...player,
    appearance: PLAYER_APPEARANCE,
    renderX: player.x,
    renderY: player.y,
    animation,
    phase: 0.2,
    role: 'player',
  }, camera, clock);
}

export function drawNpc(ctx, npc, camera, clock, animation = null) {
  drawHumanoid(ctx, { ...npc, animation }, camera, clock);
}

function drawHumanoid(ctx, actor, camera, clock) {
  const animation = actor.animation || { moveDx: 0, moveDy: 0, moveProgress: 0, bumpDx: 0, bumpDy: 0, bumpProgress: 0 };
  const appearance = actor.appearance || PLAYER_APPEARANCE;
  const screenX = Math.round((actor.renderX - camera.x) * TILE);
  const screenY = Math.round((actor.renderY - camera.y) * TILE);
  const stride = Math.sin((animation.moveProgress || 0) * Math.PI) * 2.4;
  const lean = ((animation.moveDx || 0) * 1.4) + ((animation.bumpDx || 0) * (1 - (animation.bumpProgress || 0)) * 1.2);
  const verticalBob = oscillate(clock + (actor.phase || 0), 6.4, animation.moveProgress ? 0.15 : 0.45);
  const shadowWidth = actor.role === 'player' ? 12.8 : 12;

  ctx.save();
  ctx.translate(screenX, screenY + verticalBob);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(24, 42, shadowWidth, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.ellipse(24, 40, shadowWidth * 0.72, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(lean, 0);
  if (animation.moveDx) ctx.rotate(animation.moveDx * 0.025 * animation.moveProgress);

  drawLeg(ctx, 18 - stride * 0.5, 29, appearance.pants, appearance.shoes, stride);
  drawLeg(ctx, 26 + stride * 0.5, 29, appearance.pants, appearance.shoes, -stride);
  drawArm(ctx, 12, 18, appearance.skin, appearance.jacket, -stride * 0.6);
  drawArm(ctx, 31, 18, appearance.skin, appearance.jacket, stride * 0.6);
  drawTorso(ctx, appearance, actor.role === 'player');
  drawHead(ctx, appearance, actor.facing || 'down');
  drawAccessory(ctx, appearance);

  ctx.restore();
}

function drawTorso(ctx, appearance, isPlayer) {
  ctx.fillStyle = appearance.jacket;
  ctx.beginPath();
  ctx.moveTo(14, 17);
  ctx.lineTo(34, 17);
  ctx.lineTo(31, 31);
  ctx.lineTo(17, 31);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  ctx.fillStyle = appearance.shirt;
  ctx.fillRect(18, 18, 12, 12);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.strokeRect(18, 18, 12, 12);
  ctx.fillStyle = appearance.accent || '#ffffff';
  ctx.fillRect(22, 18, 4, 10);

  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillRect(15, 18, 3, 10);
  ctx.fillStyle = shadeColor(appearance.jacket, -0.18);
  ctx.fillRect(17, 28, 14, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(17, 19, 12, 1);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(19, 19);
  ctx.lineTo(22, 23);
  ctx.moveTo(29, 19);
  ctx.lineTo(26, 23);
  ctx.stroke();
  if (isPlayer) {
    ctx.fillStyle = '#d14d4d';
    ctx.beginPath();
    ctx.moveTo(24, 18);
    ctx.lineTo(20, 11);
    ctx.lineTo(28, 11);
    ctx.closePath();
    ctx.fill();
  }
}

function drawHead(ctx, appearance, facing) {
  ctx.fillStyle = appearance.skin;
  ctx.beginPath();
  ctx.arc(24, 10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.16)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = shadeColor(appearance.skin, -0.04);
  ctx.beginPath();
  ctx.arc(16.8, 10.3, 1.5, 0, Math.PI * 2);
  ctx.arc(31.2, 10.3, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = shadeColor(appearance.skin, -0.12);
  ctx.fillRect(21, 16, 6, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(21, 16, 2, 2);

  ctx.fillStyle = appearance.hair;
  drawHair(ctx, appearance.hairStyle, facing);
  ctx.fillStyle = shadeColor(appearance.hair, 0.2);
  ctx.fillRect(19, 5, 8, 2);

  ctx.fillStyle = '#1c1e24';
  if (facing === 'left') {
    ctx.fillRect(18, 9, 2, 2);
    ctx.fillRect(18, 7, 2, 1);
  } else if (facing === 'right') {
    ctx.fillRect(28, 9, 2, 2);
    ctx.fillRect(28, 7, 2, 1);
  } else {
    ctx.fillRect(20, 9, 2, 2);
    ctx.fillRect(26, 9, 2, 2);
    ctx.fillRect(20, 7, 2, 1);
    ctx.fillRect(26, 7, 2, 1);
  }

  ctx.fillStyle = 'rgba(150,72,56,0.45)';
  ctx.fillRect(22, 13, 4, 1);
  ctx.fillRect(23, 12, 2, 1);
}

function drawHair(ctx, style = 'short', facing = 'down') {
  switch (style) {
    case 'ponytail':
      ctx.beginPath();
      ctx.arc(24, 8, 8, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(29, 10, 3, 8);
      break;
    case 'bun':
      ctx.beginPath();
      ctx.arc(24, 8, 8, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(24, 1, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'long':
      ctx.beginPath();
      ctx.arc(24, 8, 8, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(17, 8, 4, 10);
      ctx.fillRect(27, 8, 4, 10);
      break;
    case 'cap':
      ctx.fillRect(16, 4, 16, 6);
      ctx.fillRect(30, 8, 5, 2);
      break;
    case 'beanie':
      ctx.fillRect(17, 3, 14, 7);
      ctx.beginPath();
      ctx.arc(24, 2, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'crest':
      ctx.beginPath();
      ctx.arc(24, 8, 8, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(24, -1);
      ctx.lineTo(28, 4);
      ctx.lineTo(24, 4);
      ctx.closePath();
      ctx.fill();
      break;
    default:
      ctx.beginPath();
      ctx.arc(24, 8, 8, Math.PI, Math.PI * 2);
      ctx.fill();
  }

  if (facing === 'up') {
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(17, 14, 14, 2);
  }
}

function drawArm(ctx, x, y, skin, sleeve, swing) {
  const handY = y + 9 + swing * 0.16;
  ctx.fillStyle = skin;
  ctx.fillRect(x, y + 3 + swing * 0.16, 4, 9);
  ctx.fillRect(x, handY, 4, 3);
  ctx.strokeStyle = 'rgba(0,0,0,0.16)';
  ctx.strokeRect(x, y + 3 + swing * 0.16, 4, 9);
  ctx.fillStyle = sleeve;
  ctx.fillRect(x - 1, y, 6, 7);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(x, y + 1, 3, 1);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.strokeRect(x - 1, y, 6, 7);
}

function drawLeg(ctx, x, y, pants, shoes, swing) {
  const legY = y + Math.max(0, swing * 0.18);
  ctx.fillStyle = pants;
  ctx.fillRect(x, legY, 5, 10);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(x + 1, legY + 1, 2, 8);
  ctx.strokeStyle = 'rgba(0,0,0,0.16)';
  ctx.strokeRect(x, legY, 5, 10);
  ctx.fillStyle = shoes;
  ctx.fillRect(x - 1, y + 10 + Math.max(0, swing * 0.18), 7, 3);
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.strokeRect(x - 1, y + 10 + Math.max(0, swing * 0.18), 7, 3);
}

function drawAccessory(ctx, appearance) {
  switch (appearance.accessory) {
    case 'satchel':
      ctx.fillStyle = '#5e3b22';
      ctx.fillRect(30, 22, 5, 7);
      ctx.strokeStyle = '#d6bc8b';
      ctx.beginPath();
      ctx.moveTo(20, 18);
      ctx.lineTo(33, 25);
      ctx.stroke();
      break;
    case 'cane':
      ctx.fillStyle = '#7c572d';
      ctx.fillRect(10, 20, 2, 16);
      ctx.fillRect(9, 19, 4, 2);
      break;
    case 'badge':
      ctx.fillStyle = '#f5d27b';
      ctx.beginPath();
      ctx.arc(31, 21, 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'scarf':
      ctx.fillStyle = '#efe6bf';
      ctx.fillRect(19, 18, 10, 3);
      ctx.fillRect(18, 20, 3, 8);
      break;
    default:
      break;
  }
}

export function drawBattleCreature(ctx, creature, x, y, isPlayerSide, clock) {
  const bob = oscillate(clock + x * 0.002, 5, 4);
  ctx.save();
  ctx.translate(x, y + bob);
  if (isPlayerSide) ctx.scale(-1, 1);

  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.beginPath();
  ctx.ellipse(0, 54, 68, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  const body = ctx.createRadialGradient(-18, -20, 5, 0, 0, 62);
  body.addColorStop(0, '#ffffff');
  body.addColorStop(0.1, creature.color);
  body.addColorStop(1, shadeCreature(creature.color, -0.18));
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, 56, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.arc(-14, -10, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#20242a';
  ctx.beginPath();
  ctx.arc(-18, -4, 4, 0, Math.PI * 2);
  ctx.arc(6, -4, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(-17, -5, 1.1, 0, Math.PI * 2);
  ctx.arc(7, -5, 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.ellipse(-4, 12, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = shadeCreature(creature.color, -0.28);
  ctx.fillRect(-28, 26, 12, 9);
  ctx.fillRect(12, 26, 12, 9);
  ctx.fillStyle = '#1d2026';
  ctx.fillRect(-31, 34, 16, 4);
  ctx.fillRect(12, 34, 16, 4);

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(38, -2);
  ctx.lineTo(74, -14);
  ctx.lineTo(52, 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.stroke();

  ctx.fillStyle = shadeCreature(creature.color, -0.16);
  ctx.beginPath();
  ctx.moveTo(-42, 8);
  ctx.lineTo(-60, 2);
  ctx.lineTo(-44, -6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(32,36,42,0.2)';
  ctx.beginPath();
  ctx.moveTo(-10, -26);
  ctx.lineTo(2, -34);
  ctx.lineTo(12, -22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(-10, 18, 20, 4);
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.beginPath();
  ctx.moveTo(-8, 20);
  ctx.lineTo(8, 20);
  ctx.moveTo(-18, 8);
  ctx.lineTo(-6, 4);
  ctx.moveTo(8, 8);
  ctx.lineTo(20, 4);
  ctx.stroke();

  ctx.restore();
}

function shadeCreature(hex, amount) {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((start) => parseInt(value.slice(start, start + 2), 16));
  return `#${channels
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel + amount * 255))))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

function shadeColor(hex, amount) {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((start) => parseInt(value.slice(start, start + 2), 16));
  return `#${channels
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel + amount * 255))))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}
