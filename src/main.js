import { Game } from './core/game.js';
import { getDebugBootstrap } from './core/debug.js';
import { Input } from './core/input.js';
import { CanvasDisplay } from './rendering/canvasDisplay.js';
import { OverworldScene } from './scenes/OverworldScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { StarterSelectScene } from './scenes/StarterSelectScene.js';
import { StorageScene } from './scenes/StorageScene.js';
import { CodexScene } from './scenes/CodexScene.js';
import { ShopScene } from './scenes/ShopScene.js';

const canvas = document.getElementById('gameCanvas');
const sceneIndicator = document.getElementById('sceneIndicator');
const debug = getDebugBootstrap(window.location);

const display = new CanvasDisplay(canvas);
const input = new Input(window);
const game = new Game({ display, sceneIndicator, input, debug });

game.registerScene('overworld', OverworldScene);
game.registerScene('battle', BattleScene);
game.registerScene('starter-select', StarterSelectScene);
game.registerScene('storage', StorageScene);
game.registerScene('codex', CodexScene);
game.registerScene('shop', ShopScene);
game.installDebugHooks(window);

try {
  sceneIndicator.textContent = 'Loading assets…';
  await game.preload();
  game.start(debug.startScene);
} catch (error) {
  sceneIndicator.textContent = 'Load error';
  console.error(error);
}
