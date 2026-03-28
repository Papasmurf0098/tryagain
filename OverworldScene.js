import { TILE, TILE_LABELS } from '../core/config.js';
import { chance, clamp } from '../core/utils.js';
import { easeInOutQuad, isTileWalkable, lerp } from '../core/physics.js';
import { drawTile } from '../rendering/tiles.js';
import { drawNpc, drawPlayer } from '../rendering/entities.js';
import { drawCreatureBadge, drawPanel, drawTextBlock } from '../rendering/ui.js';
import { NPCSystem } from '../systems/npcSystem.js';

export class OverworldScene {
  constructor(game) {
    this.game = game;
    this.label = 'Overworld';
    this.camera = { x: 0, y: 0 };
    this.cameraTarget = { x: 0, y: 0 };
    this.motion = null;
    this.bump = null;
    this.pendingWarp = null;
    this.fade = { alpha: 0, direction: 0, outDuration: 0.18, inDuration: 0.24 };
    this.npcs = new NPCSystem();
    this.trainerEncounter = null;
    this.snapCameraToPlayer();
  }

  get world() {
    return this.game.getCurrentMap();
  }

  update(deltaSeconds) {
    this.updateMotion(deltaSeconds);
    this.updateBump(deltaSeconds);
    if (this.trainerEncounter) this.npcs.updateMotionOnly(this.world, deltaSeconds);
    this.updateWarpFade(deltaSeconds);
    this.updateTrainerEncounter(deltaSeconds);

    if (this.game.dialogue.active) {
      if (!this.motion && !this.isTransitionLocked() && this.game.input.wasPressed(' ', 'enter')) this.game.dialogue.advance();
      this.updateCamera(deltaSeconds);
      return;
    }

    if (!this.trainerEncounter && !this.isTransitionLocked()) {
      this.npcs.update(this.world, deltaSeconds, (x, y, npcId) => this.isBlockedForNpc(x, y, npcId));
    }

    if (!this.motion && !this.isControlLocked()) {
      this.checkTrainerSight();
      if (!this.trainerEncounter) {
        this.handleMovement();
        this.handleInteraction();
      }
    }

    this.updateCamera(deltaSeconds);
  }

  updateMotion(deltaSeconds) {
    if (!this.motion) return;
    this.motion.elapsed += deltaSeconds;
    if (this.motion.elapsed < this.motion.duration) return;

    const player = this.game.state.player;
    player.x = this.motion.toX;
    player.y = this.motion.toY;
    player.steps += 1;

    const landedTile = this.getTile(player.x, player.y);
    this.motion = null;

    this.checkEncounter(landedTile);
    this.checkWarp();
    this.game.save();
  }

  updateBump(deltaSeconds) {
    if (!this.bump) return;
    this.bump.elapsed += deltaSeconds;
    if (this.bump.elapsed >= this.bump.duration) this.bump = null;
  }

  updateWarpFade(deltaSeconds) {
    if (!this.fade.direction) return;

    const duration = this.fade.direction > 0 ? this.fade.outDuration : this.fade.inDuration;
    const amount = deltaSeconds / duration;
    this.fade.alpha = clamp(this.fade.alpha + this.fade.direction * amount, 0, 1);

    if (this.fade.direction > 0 && this.fade.alpha >= 1) {
      if (this.pendingWarp) {
        this.game.transitionToWarp(this.pendingWarp);
        this.pendingWarp = null;
        this.motion = null;
        this.bump = null;
        this.snapCameraToPlayer();
        this.fade.direction = -1;
        return;
      }
      this.fade.direction = -1;
      return;
    }

    if (this.fade.direction < 0 && this.fade.alpha <= 0) {
      this.fade.alpha = 0;
      this.fade.direction = 0;
    }
  }

  updateTrainerEncounter(deltaSeconds) {
    if (!this.trainerEncounter) return;

    const encounter = this.trainerEncounter;
    const npc = this.npcs.getById(this.world, encounter.npcId);
    if (!npc) {
      this.trainerEncounter = null;
      return;
    }

    if (encounter.phase === 'alert') {
      encounter.timer -= deltaSeconds;
      if (encounter.timer <= 0) {
        encounter.phase = encounter.chaseSteps.length ? 'approach' : 'dialogue';
      }
      return;
    }

    if (encounter.phase === 'approach') {
      if (npc.motion) return;
      const nextStep = encounter.chaseSteps.shift();
      if (nextStep) {
        this.npcs.forceMoveTo(npc, nextStep.x, nextStep.y, 0.16);
        return;
      }
      encounter.phase = 'dialogue';
      return;
    }

    if (encounter.phase === 'dialogue') {
      if (!encounter.dialogueStarted) {
        npc.facing = this.getFacingTowardPlayer(npc);
        const introScript = npc.trainer?.introScript || npc.script || [{ speaker: npc.name, text: `${npc.name} challenges you!` }];
        this.game.dialogue.begin(introScript);
        encounter.dialogueStarted = true;
        return;
      }

      if (!this.game.dialogue.active) {
        this.trainerEncounter = null;
        this.game.startTrainerBattle(npc);
      }
    }
  }

  handleMovement() {
    const { input, state } = this.game;
    const player = state.player;
    let dx = 0;
    let dy = 0;

    if (input.isHeld('arrowup', 'w')) {
      dy = -1;
      player.facing = 'up';
    } else if (input.isHeld('arrowdown', 's')) {
      dy = 1;
      player.facing = 'down';
    } else if (input.isHeld('arrowleft', 'a')) {
      dx = -1;
      player.facing = 'left';
    } else if (input.isHeld('arrowright', 'd')) {
      dx = 1;
      player.facing = 'right';
    }

    if (!dx && !dy) return;

    const nextX = player.x + dx;
    const nextY = player.y + dy;
    const nextTile = this.getTile(nextX, nextY);

    if (!isTileWalkable(nextTile) || this.npcs.isOccupied(this.world, nextX, nextY)) {
      if (!this.bump) this.bump = { dx, dy, elapsed: 0, duration: 0.10 };
      return;
    }

    this.motion = {
      fromX: player.x,
      fromY: player.y,
      toX: nextX,
      toY: nextY,
      dx,
      dy,
      elapsed: 0,
      duration: 0.12,
    };
  }

  handleInteraction() {
    if (!this.game.input.wasPressed(' ', 'enter')) return;

    const npc = this.getNpcInFront();
    if (npc) {
      npc.facing = oppositeDirection(this.game.state.player.facing);
      if (npc.trainer && !this.isTrainerDefeated(npc.id)) {
        this.trainerEncounter = {
          npcId: npc.id,
          phase: 'dialogue',
          chaseSteps: [],
          dialogueStarted: false,
          timer: 0,
        };
        return;
      }

      const script = npc.trainer && this.isTrainerDefeated(npc.id)
        ? (npc.trainer.defeatedScript || npc.script)
        : npc.script;
      if (script?.length) this.game.dialogue.begin(script);
      return;
    }

    const interaction = this.getInteractionInFront();
    if (interaction?.type === 'sign') {
      this.game.dialogue.begin(interaction.script);
      if (interaction.x === 5 && interaction.y === 9) this.game.state.flags.shrineVisited = true;
    }
  }

  checkEncounter(tile) {
    if (tile !== 'g') return;
    if (this.game.state.encounterCooldown > 0) return;
    if (chance(0.16)) this.game.startBattle(this.world.encounters);
  }

  checkWarp() {
    if (this.pendingWarp || this.fade.direction > 0) return;
    const player = this.game.state.player;
    const warp = this.world.warps.find((entry) => entry.x === player.x && entry.y === player.y);
    if (!warp) return;
    this.pendingWarp = warp;
    this.fade.direction = 1;
  }

  checkTrainerSight() {
    if (this.trainerEncounter || this.motion || this.game.dialogue.active) return;

    for (const npc of this.npcs.getAll(this.world)) {
      if (!npc.trainer || this.isTrainerDefeated(npc.id)) continue;
      const sightTiles = this.getSightTiles(npc);
      const player = this.game.state.player;
      const playerVisible = sightTiles.find((tile) => tile.x === player.x && tile.y === player.y);
      if (!playerVisible) continue;

      const chaseSteps = this.buildTrainerChaseSteps(npc, playerVisible.distance);
      this.trainerEncounter = {
        npcId: npc.id,
        phase: 'alert',
        timer: 0.42,
        chaseSteps,
        dialogueStarted: false,
      };
      break;
    }
  }

  buildTrainerChaseSteps(npc, distanceToPlayer) {
    const steps = [];
    const moveCount = Math.max(0, distanceToPlayer - 1);
    const step = directionStep(npc.facing);

    for (let index = 1; index <= moveCount; index += 1) {
      steps.push({ x: npc.x + step.dx * index, y: npc.y + step.dy * index });
    }

    return steps;
  }

  getSightTiles(npc) {
    if (!npc.trainer) return [];
    const step = directionStep(npc.facing);
    const tiles = [];

    for (let distance = 1; distance <= npc.trainer.sightRange; distance += 1) {
      const x = npc.x + step.dx * distance;
      const y = npc.y + step.dy * distance;
      const tile = this.getTile(x, y);
      if (!isTileWalkable(tile)) break;
      if (this.npcs.isOccupied(this.world, x, y, npc.id)) break;
      tiles.push({ x, y, distance });
    }

    return tiles;
  }

  updateCamera(deltaSeconds) {
    const renderState = this.getPlayerRenderState();
    const target = this.getCameraTarget(renderState.x, renderState.y);
    this.cameraTarget.x = target.x;
    this.cameraTarget.y = target.y;

    const smoothing = 1 - Math.exp(-deltaSeconds * 9);
    this.camera.x = lerp(this.camera.x, this.cameraTarget.x, smoothing);
    this.camera.y = lerp(this.camera.y, this.cameraTarget.y, smoothing);

    if (Math.abs(this.cameraTarget.x - this.camera.x) < 0.001) this.camera.x = this.cameraTarget.x;
    if (Math.abs(this.cameraTarget.y - this.camera.y) < 0.001) this.camera.y = this.cameraTarget.y;
  }

  snapCameraToPlayer() {
    const player = this.game.state.player;
    const target = this.getCameraTarget(player.x, player.y);
    this.cameraTarget.x = target.x;
    this.cameraTarget.y = target.y;
    this.camera.x = target.x;
    this.camera.y = target.y;
  }

  getCameraTarget(renderX, renderY) {
    const canvasWidthInTiles = this.game.width / TILE;
    const canvasHeightInTiles = this.game.height / TILE;
    const maxX = Math.max(0, this.world.width - canvasWidthInTiles);
    const maxY = Math.max(0, this.world.height - canvasHeightInTiles);

    return {
      x: clamp(renderX - (canvasWidthInTiles / 2) + 0.5, 0, maxX),
      y: clamp(renderY - (canvasHeightInTiles / 2) + 0.5, 0, maxY),
    };
  }

  getPlayerRenderState() {
    const player = this.game.state.player;
    let renderX = player.x;
    let renderY = player.y;
    let moveDx = 0;
    let moveDy = 0;
    let moveProgress = 0;

    if (this.motion) {
      const progress = easeInOutQuad(Math.min(1, this.motion.elapsed / this.motion.duration));
      renderX = lerp(this.motion.fromX, this.motion.toX, progress);
      renderY = lerp(this.motion.fromY, this.motion.toY, progress);
      moveDx = this.motion.dx;
      moveDy = this.motion.dy;
      moveProgress = progress;
    }

    if (this.bump) {
      const bumpProgress = Math.sin(Math.min(1, this.bump.elapsed / this.bump.duration) * Math.PI);
      renderX += this.bump.dx * 0.06 * bumpProgress;
      renderY += this.bump.dy * 0.06 * bumpProgress;
      return {
        x: renderX,
        y: renderY,
        animation: { moveDx, moveDy, moveProgress, bumpDx: this.bump.dx, bumpDy: this.bump.dy, bumpProgress },
      };
    }

    return {
      x: renderX,
      y: renderY,
      animation: { moveDx, moveDy, moveProgress, bumpDx: 0, bumpDy: 0, bumpProgress: 0 },
    };
  }

  getPlayerBlockedTiles() {
    const player = this.game.state.player;
    const tiles = [{ x: player.x, y: player.y }];
    if (this.motion) tiles.push({ x: this.motion.toX, y: this.motion.toY });
    return tiles;
  }

  isBlockedForNpc(x, y, npcId) {
    const tile = this.getTile(x, y);
    if (!isTileWalkable(tile)) return true;
    if (this.getPlayerBlockedTiles().some((entry) => entry.x === x && entry.y === y)) return true;
    return this.npcs.isOccupied(this.world, x, y, npcId);
  }

  isTransitionLocked() {
    return Boolean(this.pendingWarp || this.fade.direction !== 0 || this.fade.alpha > 0.001);
  }

  isControlLocked() {
    return this.isTransitionLocked() || Boolean(this.trainerEncounter);
  }

  isTrainerDefeated(trainerId) {
    return Boolean(this.game.state.flags.defeatedTrainers?.[trainerId]);
  }

  getTile(x, y) {
    if (y < 0 || y >= this.world.height || x < 0 || x >= this.world.width) return '#';
    return this.world.tiles[y][x];
  }

  getInteractionAt(x, y) {
    return this.world.interactions.find((entry) => entry.x === x && entry.y === y) || null;
  }

  getFacingOffset() {
    const offsets = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };
    return offsets[this.game.state.player.facing] || [0, 0];
  }

  getNpcInFront() {
    const player = this.game.state.player;
    const [dx, dy] = this.getFacingOffset();
    return this.npcs.getAt(this.world, player.x + dx, player.y + dy);
  }

  getInteractionInFront() {
    const player = this.game.state.player;
    const [dx, dy] = this.getFacingOffset();
    return this.getInteractionAt(player.x + dx, player.y + dy);
  }

  getFacingTowardPlayer(npc) {
    const player = this.game.state.player;
    if (Math.abs(player.x - npc.x) > Math.abs(player.y - npc.y)) return player.x < npc.x ? 'left' : 'right';
    return player.y < npc.y ? 'up' : 'down';
  }

  render(ctx) {
    const playerRenderState = this.getPlayerRenderState();
    this.drawBackground(ctx);
    this.drawMap(ctx);
    this.drawTrainerSight(ctx);
    this.drawActors(ctx, playerRenderState);
    this.drawHud(ctx);
    this.drawDialogue(ctx);
    this.drawTrainerAlert(ctx);
    this.drawFadeOverlay(ctx);
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
    gradient.addColorStop(0, '#5ca7da');
    gradient.addColorStop(0.35, '#84c4ea');
    gradient.addColorStop(1, '#d9f0ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.game.width, this.game.height);
  }

  drawMap(ctx) {
    const startX = Math.floor(this.camera.x);
    const startY = Math.floor(this.camera.y);
    const endX = Math.ceil(this.camera.x + this.game.width / TILE) + 1;
    const endY = Math.ceil(this.camera.y + this.game.height / TILE) + 1;

    for (let y = startY; y < endY; y += 1) {
      for (let x = startX; x < endX; x += 1) {
        const tile = this.getTile(x, y);
        const screenX = Math.round((x - this.camera.x) * TILE);
        const screenY = Math.round((y - this.camera.y) * TILE);
        drawTile(ctx, tile, screenX, screenY, this.game.state.clock);
      }
    }
  }

  drawTrainerSight(ctx) {
    for (const npc of this.npcs.getAll(this.world)) {
      if (!npc.trainer || this.isTrainerDefeated(npc.id)) continue;
      const tiles = this.getSightTiles(npc);
      for (const tile of tiles) {
        const alpha = 0.11 - tile.distance * 0.012;
        if (alpha <= 0) continue;
        const screenX = Math.round((tile.x - this.camera.x) * TILE);
        const screenY = Math.round((tile.y - this.camera.y) * TILE);
        ctx.save();
        ctx.fillStyle = `rgba(255, 102, 102, ${alpha})`;
        ctx.fillRect(screenX + 4, screenY + 4, TILE - 8, TILE - 8);
        ctx.strokeStyle = `rgba(255, 220, 220, ${alpha + 0.06})`;
        ctx.strokeRect(screenX + 7.5, screenY + 7.5, TILE - 15, TILE - 15);
        ctx.restore();
      }
    }
  }

  drawActors(ctx, playerRenderState) {
    const actors = [
      ...this.npcs.getRenderables(this.world).map((npc) => ({
        kind: 'npc',
        sortY: npc.renderY,
        renderX: npc.renderX,
        renderY: npc.renderY,
        data: npc,
      })),
      {
        kind: 'player',
        sortY: playerRenderState.y,
        renderX: playerRenderState.x,
        renderY: playerRenderState.y,
        data: { ...this.game.state.player, x: playerRenderState.x, y: playerRenderState.y },
        animation: playerRenderState.animation,
      },
    ].sort((left, right) => left.sortY - right.sortY);

    for (const actor of actors) {
      if (actor.kind === 'npc') drawNpc(ctx, { ...actor.data, renderX: actor.renderX, renderY: actor.renderY }, this.camera, this.game.state.clock, actor.data.animation);
      else drawPlayer(ctx, actor.data, this.camera, this.game.state.clock, actor.animation);
    }
  }

  drawHud(ctx) {
    const player = this.game.state.player;
    const starter = player.party[0];
    const tileHere = this.getTile(player.x, player.y);
    const npcAhead = this.getNpcInFront();
    const interactionAhead = this.getInteractionInFront();
    const hint = this.trainerEncounter
      ? 'A trainer has locked onto you.'
      : npcAhead?.trainer && !this.isTrainerDefeated(npcAhead.id)
        ? `Press Space to challenge ${npcAhead.name}.`
        : npcAhead
          ? `Press Space to talk to ${npcAhead.name}.`
          : interactionAhead
            ? 'Press Space to read the nearby marker.'
            : 'Trainer sight cones are live. Red tiles show where undefeated trainers can spot you.';

    drawPanel(ctx, 16, 16, 420, 126, 'Explorer Status');
    drawTextBlock(
      ctx,
      [
        `${player.name} • ${this.world.name}`,
        `Steps: ${player.steps} • Tile: ${TILE_LABELS[tileHere] || tileHere}`,
        `Facing: ${player.facing} • Tonics: ${player.inventory.tonic}`,
        hint,
      ],
      28,
      48,
      18,
      376,
    );

    drawPanel(ctx, 16, this.game.height - 144, 364, 128, 'Lead Creature');
    drawCreatureBadge(ctx, starter, 28, this.game.height - 116, false);
  }

  drawDialogue(ctx) {
    const block = this.game.dialogue.current();
    if (!block) return;
    drawPanel(ctx, 150, this.game.height - 170, 660, 126, block.speaker || 'Dialogue');
    drawTextBlock(ctx, [block.text, 'Press Space / Enter'], 176, this.game.height - 130, 22, 600);
  }

  drawTrainerAlert(ctx) {
    if (!this.trainerEncounter || this.trainerEncounter.phase !== 'alert') return;
    const npc = this.npcs.getById(this.world, this.trainerEncounter.npcId);
    if (!npc) return;

    const screenX = Math.round((npc.x - this.camera.x) * TILE) + 24;
    const screenY = Math.round((npc.y - this.camera.y) * TILE) - 10;
    const pulse = (Math.sin(this.game.state.clock * 10) + 1) * 0.5;

    ctx.save();
    ctx.fillStyle = `rgba(255,255,255,${0.88 - pulse * 0.15})`;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d53131';
    ctx.fillRect(screenX - 2, screenY - 7, 4, 10);
    ctx.fillRect(screenX - 2, screenY + 5, 4, 4);
    ctx.restore();
  }

  drawFadeOverlay(ctx) {
    if (this.fade.alpha <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.fade.alpha);
    const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
    gradient.addColorStop(0, '#060a12');
    gradient.addColorStop(1, '#111a2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.game.width, this.game.height);
    ctx.restore();
  }
}

function oppositeDirection(direction) {
  return {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  }[direction] || 'down';
}

function directionStep(direction) {
  return {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
  }[direction] || { dx: 0, dy: 1 };
}
