export class ScriptSystem {
  constructor(game) {
    this.game = game;
    this.queue = [];
    this.active = false;
    this.wait = null;
    this.context = {};
    this.onComplete = null;
  }

  begin(script = [], context = {}, options = {}) {
    const normalized = normalizeScript(script);
    this.queue = [...normalized];
    this.active = this.queue.length > 0;
    this.wait = null;
    this.context = { ...context };
    this.onComplete = options.onComplete || null;

    if (!this.active) return false;
    this.processUntilBlocked();
    return true;
  }

  update(deltaSeconds) {
    if (!this.active) return;

    if (this.wait?.type === 'dialogue') {
      if (!this.game.dialogue.active) {
        this.wait = null;
        this.processUntilBlocked();
      }
      return;
    }

    if (this.wait?.type === 'battle') {
      if (this.game.state.battle) return;
      const result = this.game.consumeLastBattleResult();
      if (!result) return;
      this.context.lastBattleResult = result;
      this.wait = null;
      this.processUntilBlocked();
      return;
    }

    if (this.wait?.type === 'delay') {
      this.wait.remaining -= deltaSeconds;
      if (this.wait.remaining <= 0) {
        this.wait = null;
        this.processUntilBlocked();
      }
      return;
    }

    this.processUntilBlocked();
  }

  clear() {
    this.queue = [];
    this.active = false;
    this.wait = null;
    this.context = {};
    this.onComplete = null;
  }

  processUntilBlocked() {
    while (this.active && !this.wait) {
      const command = this.queue.shift();
      if (!command) {
        this.finish();
        return;
      }
      this.execute(command);
    }
  }

  execute(command) {
    switch (command.type) {
      case 'say':
        this.game.dialogue.begin([{
          speaker: command.speaker || this.context.npc?.name || 'Guide',
          text: command.text,
        }]);
        this.wait = { type: 'dialogue' };
        return;
      case 'setFlag':
        this.game.setFlag(command.key, command.value ?? true);
        return;
      case 'giveItem':
        this.game.addInventoryItem(command.itemKey, command.amount ?? 1);
        return;
      case 'giveMoney':
        this.game.addMoney(command.amount ?? 0);
        return;
      case 'healParty':
        this.game.restoreFieldParty();
        return;
      case 'beginQuest':
        this.game.questSystem.beginQuest(command.questId);
        return;
      case 'advanceQuest':
        this.game.questSystem.advanceQuest(command.questId, command.stepId || null);
        return;
      case 'completeQuest':
        this.game.questSystem.completeQuest(command.questId);
        return;
      case 'awardBadge':
        this.game.awardBadge(command.badgeKey, command.badgeName);
        return;
      case 'unlockAbility':
        this.game.unlockFieldAbility(command.abilityKey);
        return;
      case 'clearFieldGate':
        this.game.clearFieldGate(command.gateId || this.context.gate?.id);
        return;
      case 'ifFlag':
        this.prepend(commandBranch(this.game.getFlag(command.key), command.then, command.else));
        return;
      case 'branchLastBattle':
        this.prepend(commandBranch(Boolean(this.context.lastBattleResult?.won), command.won, command.lost));
        return;
      case 'delay':
        this.wait = { type: 'delay', remaining: Math.max(0, command.seconds ?? 0) };
        return;
      case 'startTrainerBattle':
        this.game.startTrainerBattle(buildTrainerSource(command, this.context.npc));
        this.wait = { type: 'battle' };
        return;
      default:
        throw new Error(`Unknown script command: ${command.type}`);
    }
  }

  prepend(script) {
    const normalized = normalizeScript(script);
    if (!normalized.length) return;
    this.queue = [...normalized, ...this.queue];
  }

  finish() {
    this.active = false;
    this.wait = null;
    const onComplete = this.onComplete;
    this.onComplete = null;
    this.context = {};
    if (onComplete) onComplete();
    this.game.save();
  }
}

function normalizeScript(script) {
  if (!Array.isArray(script)) return [];
  return script
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      if (typeof entry.type === 'string' && entry.type.trim().length > 0) return entry;
      if (typeof entry.text === 'string' && entry.text.trim().length > 0) {
        return {
          type: 'say',
          speaker: entry.speaker || null,
          text: entry.text,
        };
      }
      return null;
    })
    .filter(Boolean);
}

function commandBranch(condition, truthyScript, falsyScript) {
  return condition ? truthyScript : falsyScript;
}

function buildTrainerSource(command, npc) {
  if (command.trainer) return command.trainer;
  if (npc && npc.trainer) return npc;

  return {
    id: command.trainerId || npc?.id || 'trainer-script',
    name: command.trainerName || npc?.name || 'Trainer',
    trainer: {
      team: command.team || [],
      dynamicTeam: command.dynamicTeam || null,
      level: command.level || null,
      rewardMoney: command.rewardMoney ?? null,
    },
  };
}
