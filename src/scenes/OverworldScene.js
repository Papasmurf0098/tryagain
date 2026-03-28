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
    this.pendingTransition = null;
    this.fade = { alpha: 0, direction: 0, outDuration: 0.18, inDuration: 0.24, kind: null };
    this.arrivalBanner = null;
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
    this.updateArrivalBanner(deltaSeconds);
    this.updateTrainerEncounter(deltaSeconds);

    if (this.game.dialogue.active) {
      if (!this.motion && !this.isTransitionLocked() && this.game.input.wasPressed(' ', 'enter')) this.game.dialogue.advance();
      this.updateCamera(deltaSeconds);
      return;
    }

    if (this.game.scriptSystem.active) {
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
      if (this.pendingTransition) {
        const transitionResult = this.game.transitionToLocation(this.pendingTransition);
        this.pendingTransition = null;
        this.motion = null;
        this.bump = null;
        this.snapCameraToPlayer();
        this.showArrivalBanner(transitionResult);
        this.fade.direction = -1;
        return;
      }
      this.fade.direction = -1;
      return;
    }

    if (this.fade.direction < 0 && this.fade.alpha <= 0) {
      this.fade.alpha = 0;
      this.fade.direction = 0;
      this.fade.kind = null;
    }
  }

  updateArrivalBanner(deltaSeconds) {
    if (!this.arrivalBanner) return;
    this.arrivalBanner.timer -= deltaSeconds;
    if (this.arrivalBanner.timer <= 0) this.arrivalBanner = null;
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
      const connection = this.getConnectionForStep(player.x, player.y, dx, dy);
      if (connection) {
        this.startTransition(connection);
        return;
      }
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

      let script;
      if (npc.id === 'tala') {
        script = this.game.getTalaScript();
      } else {
        script = npc.trainer && this.isTrainerDefeated(npc.id)
          ? (npc.trainer.defeatedScript || npc.script)
          : npc.script;
      }
      if (script?.length) this.game.runScript(script, { sceneKey: 'overworld', npc });
      return;
    }

    const fieldGate = this.getFieldGateInFront();
    if (fieldGate) {
      const canClear = this.game.hasFieldAbility(fieldGate.abilityKey);
      const script = canClear
        ? [
            { type: 'clearFieldGate', gateId: fieldGate.id },
            ...(fieldGate.clearedScript || defaultClearedGateScript(fieldGate)),
          ]
        : (fieldGate.blockedScript || defaultBlockedGateScript(fieldGate));
      this.game.runScript(script, { sceneKey: 'overworld', gate: fieldGate });
      return;
    }

    const interaction = this.getInteractionInFront() || this.getPickupUnderfoot();
    if (!interaction) return;

    if (interaction.type === 'sign') {
      this.game.runScript(interaction.script, { sceneKey: 'overworld', interaction });
      if (interaction.x === 5 && interaction.y === 9) this.game.state.flags.shrineVisited = true;
      return;
    }

    if (interaction.type === 'healer') {
      this.game.runScript([
        { type: 'healParty' },
        ...(interaction.script || [{ speaker: 'Attendant', text: 'Your field party is back to full strength.' }]),
      ], { sceneKey: 'overworld', interaction });
      return;
    }

    if (interaction.type === 'storage-terminal') {
      this.game.changeScene('storage', { returnScene: 'overworld' });
      return;
    }

    if (interaction.type === 'codex-kiosk') {
      this.game.changeScene('codex', { returnScene: 'overworld' });
      return;
    }

    if (interaction.type === 'shop-counter') {
      this.game.visitHarborShop();
      this.game.changeScene('shop', { returnScene: 'overworld' });
      return;
    }

    if (interaction.type === 'pickup') {
      const rewards = [];
      const rewardCommands = [{ type: 'setFlag', key: `collectedInteractions.${interaction.id}`, value: true }];
      if (interaction.itemKey && interaction.amount) {
        rewardCommands.push({ type: 'giveItem', itemKey: interaction.itemKey, amount: interaction.amount });
        rewards.push(`${interaction.amount} ${this.game.getItem(interaction.itemKey)?.name || interaction.itemKey}`);
      }
      if (interaction.money) {
        rewardCommands.push({ type: 'giveMoney', amount: interaction.money });
        rewards.push(`${interaction.money} coral`);
      }
      const label = interaction.label || 'Field Cache';
      const rewardLine = rewards.length > 0
        ? `Received ${joinRewardLabels(rewards)}.`
        : 'The cache was empty.';
      this.game.runScript([
        ...rewardCommands,
        { speaker: label, text: interaction.foundText || 'You uncovered a small route cache.' },
        { speaker: label, text: rewardLine },
      ], { sceneKey: 'overworld', interaction });
    }
  }

  checkEncounter(tile) {
    if (tile !== 'g') return;
    if (this.game.state.encounterCooldown > 0) return;
    const encounterRate = this.world.encounterRate ?? 0.16;
    if (chance(encounterRate)) {
      this.game.startBattle({
        mapKey: this.world.key,
        areaName: this.world.name,
        backgroundKey: this.world.battleBackdropKey,
        encounters: this.world.encounters,
      });
    }
  }

  checkWarp() {
    if (this.pendingTransition || this.fade.direction > 0) return;
    const player = this.game.state.player;
    const warp = this.world.warps.find((entry) => entry.x === player.x && entry.y === player.y);
    if (!warp) return;
    this.startTransition({
      kind: warp.kind || 'door',
      outDuration: warp.kind === 'door' ? 0.12 : 0.18,
      inDuration: warp.kind === 'door' ? 0.16 : 0.24,
      ...warp,
    });
  }

  startTransition(transition) {
    this.pendingTransition = transition;
    this.fade.direction = 1;
    this.fade.kind = transition.kind || 'route';
    this.fade.outDuration = transition.outDuration || (transition.kind === 'door' ? 0.12 : 0.18);
    this.fade.inDuration = transition.inDuration || (transition.kind === 'door' ? 0.16 : 0.24);
  }

  getConnectionForStep(playerX, playerY, dx, dy) {
    const edge = getEdgeForStep(this.world, playerX, playerY, dx, dy);
    if (!edge) return null;

    const axisValue = dx !== 0 ? playerY : playerX;
    return (this.world.connections || []).find((connection) => (
      connection.edge === edge
      && axisValue >= connection.start
      && axisValue <= connection.end
    )) || null;
  }

  showArrivalBanner(transitionResult) {
    const destinationMap = this.game.getCurrentMap();
    const title = destinationMap?.name || transitionResult?.toMapName || 'New Area';
    const subtitle = transitionResult?.arrivalText
      || (transitionResult?.kind === 'door' ? 'Interior' : 'Connected route');

    this.arrivalBanner = {
      title,
      subtitle,
      timer: transitionResult?.kind === 'door' ? 1.25 : 1.8,
      duration: transitionResult?.kind === 'door' ? 1.25 : 1.8,
    };
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

    if (this.pendingTransition && this.fade.direction > 0) {
      const drift = easeInOutQuad(Math.min(1, this.fade.alpha)) * (this.pendingTransition.kind === 'door' ? 0.12 : 0.28);
      const step = directionStep(this.pendingTransition.facing || this.game.state.player.facing);
      renderX += step.dx * drift;
      renderY += step.dy * drift;
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
    return Boolean(this.pendingTransition || this.fade.direction !== 0 || this.fade.alpha > 0.001);
  }

  isControlLocked() {
    return this.isTransitionLocked() || Boolean(this.trainerEncounter);
  }

  isTrainerDefeated(trainerId) {
    return Boolean(this.game.state.flags.defeatedTrainers?.[trainerId]);
  }

  getTile(x, y) {
    if (y < 0 || y >= this.world.height || x < 0 || x >= this.world.width) return '#';
    const gate = this.getFieldGateAt(x, y);
    if (gate) return this.game.isFieldGateCleared(gate.id) ? (gate.clearedTile || '.') : (gate.tile || 'v');
    return this.world.tiles[y][x];
  }

  getInteractionAt(x, y) {
    const interaction = this.world.interactions.find((entry) => entry.x === x && entry.y === y) || null;
    if (interaction?.type === 'pickup' && this.game.isInteractionCollected(interaction.id)) return null;
    return interaction;
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

  getFieldGateAt(x, y) {
    return (this.world.fieldGates || []).find((entry) => entry.x === x && entry.y === y && !this.game.isFieldGateCleared(entry.id)) || null;
  }

  getFieldGateInFront() {
    const player = this.game.state.player;
    const [dx, dy] = this.getFacingOffset();
    return this.getFieldGateAt(player.x + dx, player.y + dy);
  }

  getPickupUnderfoot() {
    const player = this.game.state.player;
    const interaction = this.getInteractionAt(player.x, player.y);
    return interaction?.type === 'pickup' ? interaction : null;
  }

  getFacingTowardPlayer(npc) {
    const player = this.game.state.player;
    if (Math.abs(player.x - npc.x) > Math.abs(player.y - npc.y)) return player.x < npc.x ? 'left' : 'right';
    return player.y < npc.y ? 'up' : 'down';
  }

  getDebugState() {
    const player = this.game.state.player;
    const npcAhead = this.getNpcInFront();
    const interactionAhead = this.getInteractionInFront();
    const pickupUnderfoot = this.getPickupUnderfoot();
    const fieldGateAhead = this.getFieldGateInFront();

    return {
      scene: 'overworld',
      objective: this.game.getCurrentObjectiveText(),
      world: {
        key: this.world.key,
        name: this.world.name,
        width: this.world.width,
        height: this.world.height,
        battleBackdropKey: this.world.battleBackdropKey || null,
        encounterRate: this.world.encounterRate ?? 0.16,
      },
      playerTile: {
        x: player.x,
        y: player.y,
        facing: player.facing,
        tile: this.getTile(player.x, player.y),
      },
      motion: this.motion ? {
        fromX: this.motion.fromX,
        fromY: this.motion.fromY,
        toX: this.motion.toX,
        toY: this.motion.toY,
        progress: Math.round((this.motion.elapsed / this.motion.duration) * 1000) / 1000,
      } : null,
      bump: this.bump ? {
        dx: this.bump.dx,
        dy: this.bump.dy,
        progress: Math.round((this.bump.elapsed / this.bump.duration) * 1000) / 1000,
      } : null,
      pendingTransition: this.pendingTransition ? {
        kind: this.pendingTransition.kind || 'route',
        toMapKey: this.pendingTransition.toMapKey,
        toX: this.pendingTransition.toX,
        toY: this.pendingTransition.toY,
      } : null,
      trainerEncounter: this.trainerEncounter ? {
        npcId: this.trainerEncounter.npcId,
        phase: this.trainerEncounter.phase,
        timer: Math.round((this.trainerEncounter.timer || 0) * 1000) / 1000,
        chaseStepsRemaining: this.trainerEncounter.chaseSteps?.length || 0,
      } : null,
      npcAhead: npcAhead ? summarizeNpc(npcAhead, this.isTrainerDefeated(npcAhead.id)) : null,
      interactionAhead: interactionAhead ? summarizeInteraction(interactionAhead) : null,
      pickupUnderfoot: pickupUnderfoot ? summarizeInteraction(pickupUnderfoot) : null,
      fieldGateAhead: fieldGateAhead ? summarizeFieldGate(fieldGateAhead, this.game.hasFieldAbility(fieldGateAhead.abilityKey)) : null,
      npcs: this.npcs.getAll(this.world).map((npc) => summarizeNpc(npc, this.isTrainerDefeated(npc.id))),
    };
  }

  render(ctx) {
    const playerRenderState = this.getPlayerRenderState();
    this.drawBackground(ctx);
    this.drawMap(ctx);
    this.drawInteractionMarkers(ctx);
    this.drawTrainerSight(ctx);
    this.drawActors(ctx, playerRenderState);
    this.drawArrivalBanner(ctx);
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

  drawArrivalBanner(ctx) {
    if (!this.arrivalBanner) return;

    const life = this.arrivalBanner.timer / this.arrivalBanner.duration;
    const alpha = Math.min(1, Math.max(0, Math.sin(life * Math.PI)));
    const width = 340;
    const height = 74;
    const x = Math.round((this.game.width - width) / 2);
    const y = 20;

    ctx.save();
    ctx.globalAlpha = alpha;
    drawPanel(ctx, x, y, width, height, '');
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.arrivalBanner.title, x + width / 2, y + 30);
    ctx.fillStyle = '#c7d4e3';
    ctx.font = '15px Inter, sans-serif';
    ctx.fillText(this.arrivalBanner.subtitle, x + width / 2, y + 53);
    ctx.restore();
  }

  drawHud(ctx) {
    const player = this.game.state.player;
    const starter = player.party[0];
    const codexCounts = this.game.getCodexCounts();
    const tileHere = this.getTile(player.x, player.y);
    const npcAhead = this.getNpcInFront();
    const interactionAhead = this.getInteractionInFront();
    const pickupUnderfoot = this.getPickupUnderfoot();
    const fieldGateAhead = this.getFieldGateInFront();
    const focusInteraction = interactionAhead || pickupUnderfoot;
    const hint = this.trainerEncounter
      ? 'A trainer has locked onto you.'
      : npcAhead?.trainer && !this.isTrainerDefeated(npcAhead.id)
        ? `Press Space to challenge ${npcAhead.name}.`
        : npcAhead
          ? `Press Space to talk to ${npcAhead.name}.`
          : fieldGateAhead
            ? describeFieldGatePrompt(fieldGateAhead, this.game.hasFieldAbility(fieldGateAhead.abilityKey))
          : focusInteraction
            ? describeInteractionPrompt(focusInteraction)
            : 'Trainer sight cones are live. Red tiles show where undefeated trainers can spot you.';

    drawPanel(ctx, 16, 16, 436, 158, 'Explorer Status');
    drawTextBlock(
      ctx,
      [
        `${player.name} • ${this.world.name}`,
        `Steps: ${player.steps} • Tile: ${TILE_LABELS[tileHere] || tileHere}`,
        `Facing: ${player.facing} • Money: ${this.game.getMoney()} coral • Tonics: ${player.inventory.tonic ?? 0} • Orbs: ${player.inventory.snareOrb ?? 0}`,
        `Codex: ${codexCounts.seen} seen • ${codexCounts.caught} caught`,
        `Goal: ${this.game.getCurrentObjectiveText()}`,
        hint,
      ],
      28,
      58,
      18,
      392,
    );

    drawPanel(ctx, 16, this.game.height - 144, 364, 128, 'Lead Creature');
    if (starter) drawCreatureBadge(ctx, starter, 28, this.game.height - 92, false);
    else drawTextBlock(ctx, ['No starter selected yet.'], 28, this.game.height - 76, 20, 300);
  }

  drawDialogue(ctx) {
    const block = this.game.dialogue.current();
    if (!block) return;
    drawPanel(ctx, 150, this.game.height - 170, 660, 126, block.speaker || 'Dialogue');
    drawTextBlock(ctx, [block.text, 'Press Space / Enter'], 176, this.game.height - 130, 22, 600);
  }

  drawInteractionMarkers(ctx) {
    const visiblePickups = (this.world.interactions || []).filter((interaction) => (
      interaction.type === 'pickup'
      && !this.game.isInteractionCollected(interaction.id)
    ));

    for (const interaction of visiblePickups) {
      const screenX = Math.round((interaction.x - this.camera.x) * TILE);
      const screenY = Math.round((interaction.y - this.camera.y) * TILE);
      if (screenX < -TILE || screenX > this.game.width || screenY < -TILE || screenY > this.game.height) continue;

      const pulse = (Math.sin(this.game.state.clock * 5 + interaction.x * 0.5 + interaction.y * 0.3) + 1) * 0.5;
      const size = 4 + pulse * 2;

      ctx.save();
      ctx.translate(screenX + TILE / 2, screenY + 14 + pulse * 2);
      ctx.fillStyle = `rgba(255, 245, 186, ${0.78 + pulse * 0.16})`;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${0.34 + pulse * 0.18})`;
      ctx.fillRect(-1, -size - 3, 2, 2);
      ctx.fillRect(size + 2, -1, 2, 2);
      ctx.restore();
    }
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
    if (this.fade.kind === 'door') {
      gradient.addColorStop(0, '#19110b');
      gradient.addColorStop(1, '#312014');
    } else {
      gradient.addColorStop(0, '#060a12');
      gradient.addColorStop(1, '#111a2a');
    }
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

function getEdgeForStep(world, x, y, dx, dy) {
  if (dx < 0 && x === 1) return 'left';
  if (dx > 0 && x === world.width - 2) return 'right';
  if (dy < 0 && y === 1) return 'up';
  if (dy > 0 && y === world.height - 2) return 'down';
  return null;
}

function summarizeNpc(npc, defeated) {
  return {
    id: npc.id,
    name: npc.name,
    x: npc.x,
    y: npc.y,
    facing: npc.facing,
    trainer: Boolean(npc.trainer),
    defeated,
  };
}

function summarizeInteraction(interaction) {
  return {
    x: interaction.x,
    y: interaction.y,
    type: interaction.type,
    preview: interaction.foundText || interaction.script?.[0]?.text || interaction.label || null,
  };
}

function summarizeFieldGate(gate, hasAbility) {
  return {
    id: gate.id,
    x: gate.x,
    y: gate.y,
    abilityKey: gate.abilityKey,
    abilityLabel: gate.abilityLabel || gate.abilityKey,
    canClear: hasAbility,
  };
}

function describeInteractionPrompt(interaction) {
  if (!interaction) return 'Press Space to interact.';
  if (interaction.type === 'healer') return 'Press Space to rest your field party.';
  if (interaction.type === 'pickup') return 'Press Space to inspect the nearby route cache.';
  if (interaction.type === 'shop-counter') return 'Press Space to browse the harbor provisions counter.';
  if (interaction.type === 'storage-terminal') return 'Press Space to access creature storage.';
  if (interaction.type === 'codex-kiosk') return 'Press Space to review your codex.';
  return 'Press Space to read the nearby marker.';
}

function describeFieldGatePrompt(gate, hasAbility) {
  if (hasAbility) return `Press Space to use ${gate.abilityLabel || gate.abilityKey}.`;
  return `${gate.label || 'Thorn wall'} blocks the trail.`;
}

function defaultBlockedGateScript(gate) {
  return [
    {
      type: 'say',
      speaker: gate.label || 'Bramble Wall',
      text: gate.blockedText || `Dense growth seals the trail. You need ${gate.abilityLabel || gate.abilityKey} to cut through it.`,
    },
  ];
}

function defaultClearedGateScript(gate) {
  return [
    {
      type: 'say',
      speaker: gate.label || 'Bramble Wall',
      text: gate.clearedText || `${gate.abilityLabel || gate.abilityKey} cuts the thorn wall open, revealing a new path.`,
    },
  ];
}

function joinRewardLabels(rewards) {
  if (rewards.length <= 1) return rewards[0] || '';
  if (rewards.length === 2) return `${rewards[0]} and ${rewards[1]}`;
  return `${rewards.slice(0, -1).join(', ')}, and ${rewards[rewards.length - 1]}`;
}
