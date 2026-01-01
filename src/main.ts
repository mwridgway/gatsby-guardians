import Phaser from 'phaser';
import { gameConfig } from './game/config';
import { ScaleManager } from './utils/ScaleManager';

// Initialize the game
const game = new Phaser.Game(gameConfig);

// Set up integer scaling
const scaleManager = new ScaleManager(game);

// Make game and scaleManager available globally for debugging
(window as any).game = game;
(window as any).scaleManager = scaleManager;

console.log('Gatsby Guardians - Game initialized');
