let randomSource = Math.random;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function setRandomSource(source) {
  randomSource = typeof source === 'function' ? source : Math.random;
}

export function resetRandomSource() {
  randomSource = Math.random;
}

export function random() {
  const value = Number(randomSource());
  if (!Number.isFinite(value)) return 0.5;
  return clamp(value, 0, 0.999999999999);
}

export function createSeededRandom(seedInput) {
  let seed = normalizeSeed(seedInput);
  return () => {
    seed += 0x6d2b79f5;
    let result = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngInt(min, maxExclusive) {
  return Math.floor(random() * (maxExclusive - min)) + min;
}

export function choose(list) {
  return list[rngInt(0, list.length)];
}

export function weightedChoice(list, getWeight = (entry) => entry?.weight ?? 1) {
  if (!Array.isArray(list) || list.length === 0) return null;

  const weightedEntries = list
    .map((entry) => ({ entry, weight: Math.max(0, Number(getWeight(entry)) || 0) }))
    .filter((item) => item.weight > 0);

  if (weightedEntries.length === 0) return list[0] || null;

  const totalWeight = weightedEntries.reduce((sum, item) => sum + item.weight, 0);
  let remaining = random() * totalWeight;

  for (const item of weightedEntries) {
    remaining -= item.weight;
    if (remaining <= 0) return item.entry;
  }

  return weightedEntries[weightedEntries.length - 1].entry;
}

export function chance(probability) {
  return random() < probability;
}

export function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function wrapLine(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return [text];
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) current = test;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function oscillate(time, speed, amplitude) {
  return Math.sin(time * speed) * amplitude;
}

function normalizeSeed(seedInput) {
  if (typeof seedInput === 'number' && Number.isFinite(seedInput)) return seedInput >>> 0;
  if (typeof seedInput === 'string' && seedInput.trim().length > 0) {
    let hash = 2166136261;
    for (let index = 0; index < seedInput.length; index += 1) {
      hash ^= seedInput.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
  return 0x12345678;
}
