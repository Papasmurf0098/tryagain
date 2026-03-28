function drawImageCover(ctx, image, width, height) {
  const sourceRatio = image.width / image.height;
  const targetRatio = width / height;

  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
    sourceX = (image.width - sourceWidth) * 0.5;
  } else {
    sourceHeight = image.width / targetRatio;
    sourceY = (image.height - sourceHeight) * 0.5;
  }

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
}

export function renderBattleBackdrop(ctx, backdrop, assets, width, height, clock) {
  const image = backdrop?.imageKey ? assets.getImage(backdrop.imageKey) : null;
  const hasCustomBackdrop = image
    && Math.max(image.naturalWidth || image.width || 0, image.naturalHeight || image.height || 0) > 1;

  if (hasCustomBackdrop) {
    drawImageCover(ctx, image, width, height);
    ctx.save();
    const overlay = ctx.createLinearGradient(0, 0, 0, height);
    overlay.addColorStop(0, 'rgba(255,255,255,0.08)');
    overlay.addColorStop(1, 'rgba(14,22,28,0.12)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, backdrop.skyTop);
  gradient.addColorStop(1, backdrop.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  drawCloudBands(ctx, width, height, clock);

  if (backdrop.scene === 'coast') drawCoastScene(ctx, backdrop, width, height, clock);
  else if (backdrop.scene === 'grove') drawGroveScene(ctx, backdrop, width, height, clock);
  else drawMeadowScene(ctx, backdrop, width, height, clock);
}

function drawCloudBands(ctx, width, height, clock) {
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#ffffff';
  for (let index = 0; index < 4; index += 1) {
    const x = 120 + index * 220 + Math.sin(clock * 0.4 + index) * 18;
    const y = 74 + index * 18;
    ctx.beginPath();
    ctx.ellipse(x, y, 84, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawMeadowScene(ctx, backdrop, width, height, clock) {
  ctx.save();
  ctx.fillStyle = backdrop.horizonColor;
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.57, width * 0.62, 120, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = backdrop.farColor;
  for (let index = 0; index < 5; index += 1) {
    const x = 80 + index * 170;
    const sway = Math.sin(clock * 0.35 + index) * 6;
    ctx.beginPath();
    ctx.moveTo(x, 246);
    ctx.lineTo(x + 24, 188 + sway);
    ctx.lineTo(x + 44, 246);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = backdrop.midColor;
  ctx.beginPath();
  ctx.ellipse(width * 0.23, height * 0.76, 220, 72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(width * 0.78, height * 0.4, 170, 58, 0, 0, Math.PI * 2);
  ctx.fill();

  drawMeadowStage(ctx, backdrop, width, height);
  ctx.restore();
}

function drawCoastScene(ctx, backdrop, width, height, clock) {
  ctx.save();
  const sea = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.68);
  sea.addColorStop(0, '#74d6ff');
  sea.addColorStop(1, backdrop.horizonColor);
  ctx.fillStyle = sea;
  ctx.fillRect(0, height * 0.32, width, height * 0.28);

  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (let index = 0; index < 4; index += 1) {
    const y = height * 0.38 + index * 18;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let step = 0; step <= 10; step += 1) {
      const x = (width / 10) * step;
      const waveY = y + Math.sin(clock * 1.2 + step * 0.8 + index) * 5;
      ctx.lineTo(x, waveY);
    }
    ctx.stroke();
  }

  ctx.fillStyle = backdrop.farColor;
  ctx.beginPath();
  ctx.moveTo(0, 260);
  ctx.lineTo(150, 170);
  ctx.lineTo(290, 235);
  ctx.lineTo(440, 182);
  ctx.lineTo(620, 244);
  ctx.lineTo(width, 206);
  ctx.lineTo(width, 360);
  ctx.lineTo(0, 360);
  ctx.closePath();
  ctx.fill();

  drawPalm(ctx, 170, 250, 1);
  drawPalm(ctx, 760, 226, -1);
  drawCoastStage(ctx, backdrop, width, height);
  ctx.restore();
}

function drawGroveScene(ctx, backdrop, width, height, clock) {
  ctx.save();
  ctx.fillStyle = backdrop.farColor;
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.28, width * 0.72, 110, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,220,0.14)';
  for (let beam = 0; beam < 5; beam += 1) {
    const x = 120 + beam * 180 + Math.sin(clock * 0.35 + beam) * 16;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 46, height * 0.62);
    ctx.lineTo(x + 112, height * 0.62);
    ctx.lineTo(x + 26, 0);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = backdrop.midColor;
  for (let cluster = 0; cluster < 7; cluster += 1) {
    const x = 90 + cluster * 125;
    const sway = Math.sin(clock * 0.55 + cluster) * 7;
    ctx.beginPath();
    ctx.ellipse(x, 180 + sway, 68, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 8, 176, 16, 72);
  }

  ctx.fillStyle = backdrop.accentColor;
  for (let spore = 0; spore < 20; spore += 1) {
    ctx.globalAlpha = 0.18 + (spore % 3) * 0.03;
    ctx.beginPath();
    ctx.arc(
      40 + (spore * 47) % width,
      40 + ((spore * 31) % 150) + Math.sin(clock * 0.8 + spore) * 6,
      2 + (spore % 3),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawGroveStage(ctx, backdrop, width, height);
  ctx.restore();
}

function drawMeadowStage(ctx, backdrop, width, height) {
  ctx.fillStyle = backdrop.groundColor;
  ctx.beginPath();
  ctx.ellipse(width * 0.22, height * 0.72, 210, 64, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(width * 0.76, height * 0.42, 160, 52, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCoastStage(ctx, backdrop, width, height) {
  ctx.fillStyle = '#e9f6b0';
  ctx.beginPath();
  ctx.ellipse(width * 0.22, height * 0.72, 214, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(width * 0.76, height * 0.42, 164, 52, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.61, height * 0.51);
  ctx.lineTo(width * 0.89, height * 0.51);
  ctx.stroke();
}

function drawGroveStage(ctx, backdrop, width, height) {
  ctx.fillStyle = '#d9ef9f';
  ctx.beginPath();
  ctx.ellipse(width * 0.22, height * 0.72, 216, 66, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(width * 0.76, height * 0.42, 166, 54, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f5d68f';
  ctx.beginPath();
  ctx.ellipse(width * 0.74, height * 0.37, 36, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8d4d27';
  ctx.fillRect(width * 0.72, height * 0.37, 10, 36);
}

function drawPalm(ctx, x, y, direction) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(direction * 0.12);
  ctx.fillStyle = '#6f4627';
  ctx.fillRect(-4, 0, 8, 64);
  ctx.strokeStyle = '#3f7e45';
  ctx.lineWidth = 4;
  for (let frond = -2; frond <= 2; frond += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(frond * 14, -22, frond * 28, -10);
    ctx.stroke();
  }
  ctx.restore();
}
