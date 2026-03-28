const FACINGS = new Set(['up', 'down', 'left', 'right']);

function readBooleanParam(params, key) {
  const value = params.get(key);
  return value === '1' || value === 'true' || value === 'yes';
}

function readIntegerParam(params, key) {
  const raw = params.get(key);
  if (raw == null || raw === '') return null;

  const value = Number.parseInt(raw, 10);
  return Number.isInteger(value) ? value : null;
}

function sanitizeFacing(value) {
  return FACINGS.has(value) ? value : null;
}

export function getDebugBootstrap(location = globalThis.location) {
  const params = new URLSearchParams(location?.search || '');

  return {
    deterministic: readBooleanParam(params, 'deterministic') || params.get('mode') === 'manual',
    disableSave: readBooleanParam(params, 'nosave'),
    skipLoad: readBooleanParam(params, 'skipLoad'),
    clearSave: readBooleanParam(params, 'clearSave'),
    seed: params.get('seed') || 'boricua-engine',
    startScene: params.get('scene') || 'overworld',
    mapKey: params.get('map') || null,
    playerX: readIntegerParam(params, 'x'),
    playerY: readIntegerParam(params, 'y'),
    facing: sanitizeFacing(params.get('facing')),
    starterKey: params.get('starter') || null,
  };
}
