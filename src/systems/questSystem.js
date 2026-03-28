import { QUESTS } from '../data/quests.js';

const QUEST_STATUS = {
  inactive: 'inactive',
  active: 'active',
  completed: 'completed',
};

export class QuestSystem {
  constructor(game) {
    this.game = game;
  }

  ensureState() {
    if (!this.game.state.quests) this.game.state.quests = {};
  }

  getQuestDefinition(questId) {
    return QUESTS[questId] || null;
  }

  getQuestState(questId) {
    this.ensureState();
    const existing = this.game.state.quests[questId];
    if (existing) return existing;
    return null;
  }

  ensureQuestState(questId) {
    this.ensureState();
    if (!this.game.state.quests[questId]) {
      this.game.state.quests[questId] = {
        status: QUEST_STATUS.inactive,
        stepIndex: 0,
      };
    }
    return this.game.state.quests[questId];
  }

  beginQuest(questId) {
    const quest = this.getQuestDefinition(questId);
    if (!quest) return false;

    const state = this.ensureQuestState(questId);
    if (state.status === QUEST_STATUS.completed) return false;
    state.status = QUEST_STATUS.active;
    state.stepIndex = clampStepIndex(0, quest.steps.length);
    return true;
  }

  advanceQuest(questId, stepId = null) {
    const quest = this.getQuestDefinition(questId);
    if (!quest) return false;

    const state = this.ensureQuestState(questId);
    if (state.status === QUEST_STATUS.completed) return false;
    if (state.status !== QUEST_STATUS.active) state.status = QUEST_STATUS.active;

    if (stepId) {
      const targetIndex = quest.steps.findIndex((step) => step.id === stepId);
      if (targetIndex === -1) return false;
      state.stepIndex = clampStepIndex(targetIndex, quest.steps.length);
      return true;
    }

    const nextIndex = state.stepIndex + 1;
    if (nextIndex >= quest.steps.length) {
      state.stepIndex = quest.steps.length - 1;
      state.status = QUEST_STATUS.completed;
      return true;
    }

    state.stepIndex = nextIndex;
    return true;
  }

  completeQuest(questId) {
    const quest = this.getQuestDefinition(questId);
    if (!quest) return false;

    const state = this.ensureQuestState(questId);
    state.status = QUEST_STATUS.completed;
    state.stepIndex = Math.max(0, quest.steps.length - 1);
    return true;
  }

  getCurrentStep(questId) {
    const quest = this.getQuestDefinition(questId);
    const state = this.getQuestState(questId);
    if (!quest || !state || state.status !== QUEST_STATUS.active) return null;
    return quest.steps[clampStepIndex(state.stepIndex, quest.steps.length)];
  }

  getActiveQuest() {
    for (const questId of Object.keys(QUESTS)) {
      const quest = this.getQuestDefinition(questId);
      const state = this.getQuestState(questId);
      if (!quest || !state || state.status !== QUEST_STATUS.active) continue;
      return {
        quest,
        state,
        step: this.getCurrentStep(questId),
      };
    }
    return null;
  }

  getObjectiveText() {
    return this.getActiveQuest()?.step?.objective || null;
  }

  getQuestSnapshot() {
    return Object.keys(QUESTS).map((questId) => {
      const quest = QUESTS[questId];
      const state = this.getQuestState(questId) || { status: QUEST_STATUS.inactive, stepIndex: 0 };
      return {
        key: quest.key,
        title: quest.title,
        status: state.status,
        stepIndex: state.stepIndex,
        currentObjective: state.status === QUEST_STATUS.active
          ? quest.steps[clampStepIndex(state.stepIndex, quest.steps.length)]?.objective || null
          : null,
      };
    });
  }

  applyTrigger(trigger) {
    let changed = false;

    for (const questId of Object.keys(QUESTS)) {
      const state = this.getQuestState(questId);
      if (!state || state.status !== QUEST_STATUS.active) continue;

      const step = this.getCurrentStep(questId);
      if (!step?.trigger) continue;

      if (matchesTrigger(step.trigger, trigger)) {
        changed = this.advanceQuest(questId) || changed;
      }
    }

    return changed;
  }

  syncCampaignState() {
    if (!this.game.state.flags?.starterChosen) return;

    this.beginQuest('first-expedition');

    if (this.game.state.flags?.talaBriefed) this.advanceQuest('first-expedition', 'defeat-rian');
    if (this.game.state.flags?.defeatedTrainers?.rian) this.advanceQuest('first-expedition', 'visit-harbor-shop');
    if (this.game.state.flags?.harborShopVisited) this.advanceQuest('first-expedition', 'challenge-marza');
    if (this.game.state.flags?.defeatedTrainers?.marza || this.game.state.flags?.badges?.coast) {
      this.advanceQuest('first-expedition', 'clear-brambles');
    }
    if (this.game.state.flags?.clearedFieldGates?.['sunspore-bramble']) {
      this.completeQuest('first-expedition');
    }
  }
}

function matchesTrigger(expected, actual) {
  if (!expected || !actual || expected.type !== actual.type) return false;
  if (expected.type === 'trainer_defeated') return expected.trainerId === actual.trainerId;
  if (expected.type === 'field_gate_cleared') return expected.gateId === actual.gateId;
  return true;
}

function clampStepIndex(stepIndex, stepCount) {
  if (!Number.isInteger(stepIndex)) return 0;
  return Math.max(0, Math.min(stepCount - 1, stepIndex));
}
