import { VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from '../core/config.js';

export class CanvasDisplay {
  constructor(canvas, { virtualWidth = VIRTUAL_WIDTH, virtualHeight = VIRTUAL_HEIGHT } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.virtualWidth = virtualWidth;
    this.virtualHeight = virtualHeight;
    this.pixelRatio = 1;
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.floor(rect.width || this.virtualWidth));
    const cssHeight = Math.max(1, Math.floor((cssWidth * this.virtualHeight) / this.virtualWidth));
    this.pixelRatio = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

    this.canvas.width = Math.round(cssWidth * this.pixelRatio);
    this.canvas.height = Math.round(cssHeight * this.pixelRatio);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  beginFrame() {
    const scaleX = this.canvas.width / this.virtualWidth;
    const scaleY = this.canvas.height / this.virtualHeight;
    this.ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    this.ctx.clearRect(0, 0, this.virtualWidth, this.virtualHeight);
  }
}
