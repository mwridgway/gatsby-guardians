import Phaser from 'phaser';
import { BASE_WIDTH, BASE_HEIGHT, GRAVITY } from './constants';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { GamePlayScene } from '../scenes/GamePlayScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  parent: 'game-container',
  width: BASE_WIDTH,
  height: BASE_HEIGHT,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  backgroundColor: '#000000',
  input: {
    keyboard: true,
    mouse: true,
    touch: true,
    gamepad: false,
  },
  scale: {
    mode: Phaser.Scale.NONE, // Manual scaling for integer scaling
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GRAVITY, x: 0 },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, MainMenuScene, GamePlayScene],
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  render: {
    pixelArt: true,
    antialias: false,
    antialiasGL: false,
    roundPixels: true,
  },
};
