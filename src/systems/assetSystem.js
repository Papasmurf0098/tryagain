export class AssetSystem {
  constructor(manifest = { images: {}, optionalImages: {}, audio: {} }) {
    this.manifest = manifest;
    this.images = new Map();
    this.audio = new Map();
    this.status = 'idle';
  }

  async loadAll() {
    this.status = 'loading';
    const imageEntries = Object.entries(this.manifest.images || {});
    const optionalImageEntries = Object.entries(this.manifest.optionalImages || {});
    const audioEntries = Object.entries(this.manifest.audio || {});

    await Promise.all([
      ...imageEntries.map(([key, src]) => this.loadImage(key, src)),
      ...optionalImageEntries.map(([key, src]) => this.loadOptionalImage(key, src)),
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

  hasImage(key) {
    return this.images.has(key);
  }

  getAudio(key) {
    return this.audio.get(key) || null;
  }

  loadOptionalImage(key, src) {
    return fetch(src)
      .then((response) => {
        if (!response.ok) return null;
        return response.blob();
      })
      .then((blob) => {
        if (!blob) return null;
        return new Promise((resolve, reject) => {
          const image = new Image();
          const objectUrl = URL.createObjectURL(blob);
          image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            this.images.set(key, image);
            resolve(image);
          };
          image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error(`Failed to decode optional image: ${src}`));
          };
          image.src = objectUrl;
        }).catch(() => null);
      })
      .catch(() => null);
  }
}
