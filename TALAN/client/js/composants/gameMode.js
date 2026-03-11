import { normalizeMode } from './storage.js';

export const GAME_MODES = {
  normal: {
    id: 'normal',
    cols: 10,
    rows: 10,
    cellSize: 20,
    baseTime: 20,
    levelTimeIncrement: 10,
    enemyCount: 0,
    enemySpeed: 0,
    timerEnabled: true,
    mazeGenerationStepsPerFrame: 1,
  },
  infinity: {
    id: 'infinity',
    cols: 10,
    rows: 10,
    cellSize: 20,
    baseTime: 20,
    levelTimeIncrement: 10,
    enemyCount: 0,
    enemySpeed: 0,
    timerEnabled: true,
    mazeGenerationStepsPerFrame: 5,
  },
  hardcore: {
    id: 'hardcore',
    cols: 10,
    rows: 10,
    cellSize: 20,
    baseTime: 30,
    levelTimeIncrement: 15,
    enemyCount: 1,
    enemySpeed: 10,
    timerEnabled: true,
    mazeGenerationStepsPerFrame: 5,
  },
};

export function getModeConfig(mode) {
  const normalized = normalizeMode(mode);
  return GAME_MODES[normalized] || GAME_MODES.normal;
}
