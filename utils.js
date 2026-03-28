export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function rngInt(min, maxExclusive) {
  return Math.floor(Math.random() * (maxExclusive - min)) + min;
}

export function choose(list) {
  return list[rngInt(0, list.length)];
}

export function chance(probability) {
  return Math.random() < probability;
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
