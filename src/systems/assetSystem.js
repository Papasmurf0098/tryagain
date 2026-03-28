export class AssetSystem {
  constructor(manifest = { images: {}, audio: {} }) {
    this.manifest = manifest;
    this.images = new Map();
    this.audio = new Map();
    this.status = 'idle';
  }

  async loadAll() {
    this.status = 'loading';
    const imageEntries = Object.entries(this.manifest.images || {});
    const audioEntries = Object.entries(this.manifest.audio || {});

    await Promise.all([
      ...imageEntries.map(([key, src]) => this.loadImage(key, src)),
      ...audioEntries.map(([key, src]) => this.loadAudio(key, src)),
    ]);

    this.status = 'ready';
  }

  loadImage(key, src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        this.images.set(key, image);
        resolve(image);
      };
      image.onerror = reject;
      image.src = src;
    });
  }

  loadAudio(key, src) {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = src;
      audio.addEventListener('canplaythrough', () => {
        this.audio.set(key, audio);
        resolve(audio);
      }, { once: true });
      audio.addEventListener('error', () => resolve(null), { once: true });
    });
  }

  getImage(key) {
    return this.images.get(key) || null;
  }

  getAudio(key) {
    return this.audio.get(key) || null;
  }
}
