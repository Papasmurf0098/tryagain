export class DialogueSystem {
  constructor() {
    this.queue = [];
    this.active = false;
  }

  begin(script = []) {
    this.queue = [...script];
    this.active = this.queue.length > 0;
  }

  current() {
    return this.queue[0] || null;
  }

  advance() {
    if (!this.active) return null;
    this.queue.shift();
    if (this.queue.length === 0) {
      this.active = false;
      return null;
    }
    return this.current();
  }

  clear() {
    this.queue = [];
    this.active = false;
  }
}
