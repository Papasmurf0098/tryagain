import { Game } from './core/game.js';
import { Input } from './core/input.js';
import { CanvasDisplay } from './rendering/canvasDisplay.js';
import { OverworldScene } from './scenes/OverworldScene.js';
import { BattleScene } from './scenes/BattleScene.js';

const canvas = document.getElementById('gameCanvas');
const sceneIndicator = document.getElementById('sceneIndicator');

const display = new CanvasDisplay(canvas);
const input = new Input(window);
const game = new Game({ display, sceneIndicator, input });

game.registerScene('overworld', OverworldScene);
game.registerScene('battle', BattleScene);

try {
  sceneIndicator.textContent = 'Loading assets…';
  await game.preload();
  game.start('overworld');
} catch (error) {
  sceneIndicator.textContent = 'Load error';
  console.error(error);
}

window.__BORICUA_GAME__ = game;
