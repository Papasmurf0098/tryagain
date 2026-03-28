export class Input {
  constructor(target = window) {
    this.held = new Set();
    this.pressed = new Set();
    this.target = target;
    this.blocked = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'enter']);

    target.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (!this.held.has(key)) this.pressed.add(key);
      this.held.add(key);
      if (this.blocked.has(key)) event.preventDefault();
    });

    target.addEventListener('keyup', (event) => {
      this.held.delete(event.key.toLowerCase());
    });

    window.addEventListener('blur', () => {
      this.held.clear();
      this.pressed.clear();
    });
  }

  isHeld(...keys) {
    return keys.some((key) => this.held.has(key));
  }

  wasPressed(...keys) {
    return keys.some((key) => this.pressed.has(key));
  }

  endFrame() {
    this.pressed.clear();
  }
}
