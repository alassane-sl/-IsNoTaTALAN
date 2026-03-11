import { pause } from '../functions/modal/pause.js';
import { tutorial } from '../functions/modal/tutorial.js';
import { rules } from '../functions/modal/rules.js';
import { quit } from '../functions/modal/quit.js';
import { win } from '../functions/modal/win.js';
import { lose } from '../functions/modal/lose.js';
import { finalWin } from '../functions/modal/finalWin.js';
import { redirectionWin } from '../functions/modal/redirectionWin.js';
import { initGameUI } from './composants/gameUi.js';
import {
  getSelectedMode,
  getSelectedCharacterSrc,
} from './composants/storage.js';
import { getModeConfig } from './composants/gameMode.js';
import { createMazeState, stepMaze, drawCell } from './composants/maze.js';
import {
  setSpriteScreenPos,
  setSpriteScreenPosPx,
} from './composants/spritePosition.js';
import {
  initEnemies,
  respawnEnemies,
  updateEnemies,
  hideEnemies,
} from './composants/enemyManager.js';

import {
  createMovementState,
  movePlayer,
} from './composants/playerMovement.js';
import {
  createKeysState,
  setupInputListeners,
  getPressedDirection,
} from './composants/inputManager.js';
import {
  createObjectsState,
  createCollisionCallbacks,
  setObjectPosition,
  addCollisionCallback,
  afficherPopUp,
  checkKeyPickup,
  checkDoorReach,
  checkChestPickup,
  checkBonusChestPickup,
  checkMalusChestPickup,
} from './composants/collisionManager.js';
import { checkHalfTimeMove, resetHalfTime } from './composants/moveKeyDoor.js';

const canvas = document.getElementById('maze');
const ctx = canvas.getContext('2d');
const gameAreaEl = document.getElementById('game-area');

const playerSprite = document.getElementById('player-sprite');
const doorSprite = document.getElementById('door-sprite');
const keySprite = document.getElementById('key-sprite');
const enemyTemplate = document.getElementById('enemy-sprite');
const chestSprite = document.getElementById('chest-sprite');
const bonusChestSprite = document.getElementById('bonus-sprite');
const malusChestSprite = document.getElementById('malus-sprite');

const movementState = createMovementState(150); // 150ms de délai entre mouvements (0 pour hardcore)
const keysState = createKeysState();
const objectsState = createObjectsState();
const collisionCallbacks = createCollisionCallbacks();

// Mode
const mode = getSelectedMode();
const modeConfig = getModeConfig(mode);
const isHardcoreMode = modeConfig.id === 'hardcore';

const gameUI = initGameUI({
  baseTime: modeConfig.baseTime,
  levelTimeIncrement: modeConfig.levelTimeIncrement,
  onPause: pause,
  onQuit: quit,
  onTutorial: () => {
    let skipIntroOnce = false;
    try {
      skipIntroOnce = localStorage.getItem('skipIntroOnce') === '1';
      if (skipIntroOnce) localStorage.removeItem('skipIntroOnce');
    } catch (_) {}

    if (skipIntroOnce) {
      setTimeout(() => {
        startModeMusic();
        window.gameState.enPause = false;
      }, 0);
      return;
    }

    window.gameState.enPause = true;
    rules({
      onClose: () => {
        tutorial({
          onClose: () => {
            startModeMusic();
            window.gameState.enPause = false;
          },
        });
      },
    });
  },
  onLose: lose,
  audioId: 'musique',
  soundButtonId: 'sound-button',
  pauseButtonId: 'break-button',
  quitButtonId: 'power-button',
  chronoId: 'chronometer',
  togglePause: true,
});

// Canvas
const initialCols = modeConfig.cols;
const initialRows = modeConfig.rows;
const initialEnemyCount = modeConfig.enemyCount;
const initialEnemySpeed = modeConfig.enemySpeed;
let cols = initialCols;
let rows = initialRows;
const cellSize = modeConfig.cellSize;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let currentLevel = 1;
const gameMode = localStorage.getItem('selectedMode');
if (!isHardcoreMode) {
  chestSprite.style.display = 'none';
  bonusChestSprite.style.display = 'none';
  malusChestSprite.style.display = 'none';
}

function updateHardcoreEnemySpeed() {
  if (!isHardcoreMode) return;
  const baseSpeed = 10;
  enemySpeed = baseSpeed + (currentLevel - 1) * 2;
}

const modeAudioMap = {
  normal: '../public/audio/normalLevel.mp3',
  infinity: '../public/audio/InfiniteLevel.mp3',
  hardcore: '../public/audio/hardcoreLevel.mp3',
};

const musicEl = document.getElementById('musique');
if (musicEl && modeAudioMap[gameMode]) {
  musicEl.loop = true;
  musicEl.src = modeAudioMap[gameMode];
  musicEl.load();
}

function startModeMusic() {
  if (!musicEl) return;
  musicEl.play().catch(() => {});
  window.gameState.sonActif = true;
  const soundButton = document.getElementById('sound-button');
  if (soundButton) soundButton.textContent = '🔊';
}

function updateLevelDisplay() {
  const levelEl = document.getElementById('level-display');
  if (levelEl) levelEl.textContent = currentLevel;
}

window.incrementLevel = function () {
  if (gameMode === 'infinity') {
    cols += 1;
    rows += 1;
    currentLevel++;
  } else if (gameMode === 'normal') {
    if (currentLevel < 5) {
      cols += 3;
      rows += 3;
      currentLevel++;
    }
  } else if (gameMode === 'hardcore') {
    if (currentLevel <= 4) {
      cols += 3;
      rows += 3;
      currentLevel++;
      enemyCount += 1;
      addEnemy();
      resetHalfTime();
      updateHardcoreEnemySpeed();
    } else if (currentLevel === 5) {
      cols += 15;
      rows += 15;
      updateHardcoreEnemySpeed();
    }
  }
  updateLevelDisplay();
};

// Player / Door / Key
const player = {
  x: Math.floor(Math.random() * cols),
  y: Math.floor(Math.random() * rows),
  direction: 1,
};
let hasKey = false;
let door;
let keyPos;
let chest;
let boschest;
let malchest;
let isMoving = false;
const extraChests = [];

// Sprite configuration
const spriteConfig = {
  1: {
    walk: '../public/images/futureRunner.gif',
    idle: '../public/images/cyberStop.png',
  },
  2: {
    walk: '../public/images/Stranger.gif',
    idle: '../public/images/StrangerStop.png',
  },
};

// Apply selected sprite
const selectedSprite = getSelectedCharacterSrc();
const selectedCharacterId = parseInt(
  localStorage.getItem('selectedCharacter'),
  10,
);
const currentSpriteConfig =
  Number.isInteger(selectedCharacterId) && spriteConfig[selectedCharacterId]
    ? spriteConfig[selectedCharacterId]
    : selectedSprite
      ? { walk: selectedSprite, idle: selectedSprite }
      : spriteConfig[1];

const imgEl = document.querySelector('#player-sprite img');
if (imgEl) imgEl.src = currentSpriteConfig.idle;

// Enemies
let enemyCount = modeConfig.enemyCount;
let enemySpeed = modeConfig.enemySpeed;
const attrape = Math.min(cellSize * 0.5, 12);
let enemyActive = false;
let playerHasMovedOnce = false;
let lastTs = performance.now();

const { enemies, enemySprites } = initEnemies({
  enemyTemplate,
  count: enemyCount,
});

function addEnemy() {
  if (!enemyTemplate || !enemyTemplate.parentElement) return;
  const clone = enemyTemplate.cloneNode(true);
  clone.id = `enemy-sprite-${enemyCount}`;
  clone.style.display = 'block';
  clone.style.position = 'absolute';
  enemyTemplate.parentElement.appendChild(clone);
  enemySprites.push(clone);
  enemies.push({ xPx: 0, yPx: 0 });
}

if (enemyCount === 0 && enemyTemplate) {
  hideEnemies([enemyTemplate]);
}

// Maze
let mazeState = createMazeState(cols, rows);

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  mazeState.grid.forEach((cell) => drawCell(ctx, cell, cellSize));
  updateSprites();
}

function step() {
  const stepsPerFrame = modeConfig.mazeGenerationStepsPerFrame || 1;
  let hasNext = true;
  for (let i = 0; i < stepsPerFrame && hasNext; i++) {
    hasNext = stepMaze(mazeState, cols, rows);
  }
  drawMaze();
  if (hasNext) requestAnimationFrame(step);
  else updateSprites();
}

function updateSprites() {
  setSpriteScreenPos({
    el: playerSprite,
    canvas,
    gameAreaEl,
    cellSize,
    gridX: player.x,
    gridY: player.y,
  });
  setSpriteScreenPos({
    el: doorSprite,
    canvas,
    gameAreaEl,
    cellSize,
    gridX: door.x,
    gridY: door.y,
  });
  if (keySprite.style.display !== 'none') {
    setSpriteScreenPos({
      el: keySprite,
      canvas,
      gameAreaEl,
      cellSize,
      gridX: keyPos.x,
      gridY: keyPos.y,
    });
  }

  enemySprites.forEach((el, i) => {
    const enemy = enemies[i];
    if (!enemy) return;
    setSpriteScreenPosPx({
      el,
      canvas,
      gameAreaEl,
      px: enemy.xPx,
      py: enemy.yPx,
    });
  });

  if (chestSprite && chest) {
    setSpriteScreenPos({
      el: chestSprite,
      canvas,
      gameAreaEl,
      cellSize,
      gridX: chest.x,
      gridY: chest.y,
    });
  }
  if (bonusChestSprite && boschest) {
    setSpriteScreenPos({
      el: bonusChestSprite,
      canvas,
      gameAreaEl,
      cellSize,
      gridX: boschest.x,
      gridY: boschest.y,
    });
  }
  if (malusChestSprite && malchest) {
    setSpriteScreenPos({
      el: malusChestSprite,
      canvas,
      gameAreaEl,
      cellSize,
      gridX: malchest.x,
      gridY: malchest.y,
    });
  }

  extraChests.forEach((extra) => {
    if (!extra || extra.collected) return;
    setSpriteScreenPos({
      el: extra.el,
      canvas,
      gameAreaEl,
      cellSize,
      gridX: extra.pos.x,
      gridY: extra.pos.y,
    });
  });
}

function applyPlayerDirection(direction) {
  if (playerSprite) {
    const img = playerSprite.querySelector('img');
    if (img) {
      img.style.transform = `scaleX(${direction})`;
    }
  }
}

function setPlayerMoving(moving) {
  // Only update if state changed to avoid unnecessary DOM updates
  if (isMoving === moving && moving !== undefined) return;

  const img = playerSprite ? playerSprite.querySelector('img') : null;
  if (!img) return;

  isMoving = moving;
  if (moving) {
    img.src = currentSpriteConfig.walk;
  } else {
    img.src = currentSpriteConfig.idle;
  }
}

function getRandomDoorPosition() {
  let x, y;
  do {
    x = Math.floor(Math.random() * cols);
    y = Math.floor(Math.random() * rows);
  } while (x === player.x && y === player.y);
  return { x, y };
}

function getRandomKeyPosition() {
  let x, y;
  do {
    x = Math.floor(Math.random() * cols);
    y = Math.floor(Math.random() * rows);
  } while (
    (x === player.x && y === player.y) ||
    (x === door.x && y === door.y)
  );
  return { x, y };
}

function showMidTimePopup() {
  const popup = document.createElement('div');
  popup.classList.add('pop-up-chest');
  popup.textContent =
    'Oupsi ! Tu croyais que ça serait simple de sortir rapidement ?';
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.style.opacity = '0';
    setTimeout(() => popup.remove(), 300);
  }, 5 * 1000);
}

function getRandomMalusChestPosition() {
  let x, y;
  do {
    x = Math.floor(Math.random() * cols);
    y = Math.floor(Math.random() * rows);
  } while (
    (x === player.x && y === player.y) ||
    (x === door.x && y === door.y) ||
    (x === keyPos.x && y === keyPos.y)
  );
  return { x, y };
}

function getRandomBonusChestPosition(currentMalus) {
  let x, y;
  do {
    x = Math.floor(Math.random() * cols);
    y = Math.floor(Math.random() * rows);
  } while (
    (x === player.x && y === player.y) ||
    (x === door.x && y === door.y) ||
    (x === keyPos.x && y === keyPos.y) ||
    (currentMalus && x === currentMalus.x && y === currentMalus.y)
  );
  return { x, y };
}

function getRandomChestPosition(currentMalus, currentBonus) {
  let x, y;
  do {
    x = Math.floor(Math.random() * cols);
    y = Math.floor(Math.random() * rows);
  } while (
    (x === player.x && y === player.y) ||
    (x === door.x && y === door.y) ||
    (x === keyPos.x && y === keyPos.y) ||
    (currentMalus && x === currentMalus.x && y === currentMalus.y) ||
    (currentBonus && x === currentBonus.x && y === currentBonus.y)
  );
  return { x, y };
}

function getRandomExtraChestPosition(forbidden) {
  let x, y;
  do {
    x = Math.floor(Math.random() * cols);
    y = Math.floor(Math.random() * rows);
  } while (forbidden.some((p) => p && p.x === x && p.y === y));
  return { x, y };
}

function clearExtraChests() {
  extraChests.forEach((extra) => {
    if (extra?.el) extra.el.remove();
  });
  extraChests.length = 0;
}

function spawnExtraChestsForLevel() {
  clearExtraChests();
  if (!isHardcoreMode) return;

  const extraCount = Math.max(0, currentLevel - 1);
  const forbiddenBase = [player, door, keyPos, chest, boschest, malchest];

  for (let i = 0; i < extraCount; i += 1) {
    const type = Math.random() < 0.5 ? 'bonus' : 'malus';
    const template = chestSprite;
    if (!template || !template.parentElement) continue;

    const forbidden = [...forbiddenBase, ...extraChests.map((e) => e.pos)];
    const pos = getRandomExtraChestPosition(forbidden);

    const el = template.cloneNode(true);
    el.removeAttribute('id');
    el.style.display = 'block';
    el.classList.add('extra-chest');
    template.parentElement.appendChild(el);

    extraChests.push({ type, pos, el, collected: false });
  }
}

function checkExtraChestsCollision() {
  if (!extraChests.length) return;

  extraChests.forEach((extra) => {
    if (!extra || extra.collected) return;
    if (player.x !== extra.pos.x || player.y !== extra.pos.y) return;

    extra.collected = true;
    if (extra.el) extra.el.style.display = 'none';

    if (extra.type === 'bonus') {
      const updated = gameUI.getTimeRemaining() + 20;
      gameUI.setTimeRemaining(updated);
      gameUI.updateChronoDisplay();
      afficherPopUp('✅ + 20 secondes !');
    } else {
      const updated = Math.max(0, gameUI.getTimeRemaining() - 20);
      gameUI.setTimeRemaining(updated);
      gameUI.updateChronoDisplay();
      afficherPopUp('❌ - 20 secondes !');
    }
  });
}

addCollisionCallback(collisionCallbacks, 'onKeyPickup', () => {
  hasKey = true;
  keySprite.style.display = 'none';
  if (navigator.vibrate) navigator.vibrate(50);
});

addCollisionCallback(collisionCallbacks, 'onChestPickup', () => {
  if (!isHardcoreMode) return;
  chestSprite.style.display = 'none';
  if (navigator.vibrate) navigator.vibrate(50);
  player.x = Math.floor(Math.random() * cols);
  player.y = Math.floor(Math.random() * rows);
});

addCollisionCallback(collisionCallbacks, 'onBonusChestPickup', () => {
  if (!isHardcoreMode) return;
  bonusChestSprite.style.display = 'none';
  if (navigator.vibrate) navigator.vibrate(50);
  const updated = gameUI.getTimeRemaining() + 20;
  gameUI.setTimeRemaining(updated);
  gameUI.updateChronoDisplay();
});

addCollisionCallback(collisionCallbacks, 'onMalusChestPickup', () => {
  if (!isHardcoreMode) return;
  malusChestSprite.style.display = 'none';
  if (navigator.vibrate) navigator.vibrate(50);
  const updated = Math.max(0, gameUI.getTimeRemaining() - 20);
  gameUI.setTimeRemaining(updated);
  gameUI.updateChronoDisplay();
});

addCollisionCallback(collisionCallbacks, 'onDoorReach', () => {
  if (hasKey) {
    const isFinalNormal = gameMode === 'normal' && currentLevel === 5;
    const isFinalHardcore = gameMode === 'hardcore' && currentLevel === 5;

    window.gameState.enPause = true;
    gameUI.clearTimer();

    if (isFinalNormal || isFinalHardcore) {
      finalWin({
        onClose: () => {
          redirectionWin({ seconds: 3 });
        },
      });
      return;
    }

    window.incrementLevel();
    win();
  }
});

function gameLoop() {
  if (window.gameState.enPause) {
    requestAnimationFrame(gameLoop);
    return;
  }

  if (isHardcoreMode && window.gameState.timerStarted) {
    const {
      door: nextDoor,
      keyPos: nextKey,
      moved,
    } = checkHalfTimeMove(
      gameUI.getTimeRemaining(),
      gameUI.getTimeForLevel(currentLevel),
      cols,
      rows,
      player,
      door,
      keyPos,
      hasKey,
    );

    if (moved) {
      door = nextDoor;
      keyPos = nextKey;
      setObjectPosition(objectsState, 'door', door.x, door.y);
      if (!hasKey) {
        setObjectPosition(objectsState, 'key', keyPos.x, keyPos.y);
      }
      updateSprites();
      showMidTimePopup();
    }
  }

  const direction = getPressedDirection(keysState);
  if (direction) {
    setPlayerMoving(true);
    const moved = movePlayer(
      player,
      mazeState.grid,
      cols,
      rows,
      direction,
      movementState,
    );
    if (moved) {
      if (!window.gameState.timerStarted && modeConfig.timerEnabled) {
        window.gameState.timerStarted = true;
        gameUI.startCountdown(gameUI.getTimeForLevel(currentLevel));
      }
      if (!playerHasMovedOnce) {
        playerHasMovedOnce = true;
        enemyActive = enemyCount > 0;
      }
      // Apply direction change
      if (direction === 'left') {
        applyPlayerDirection(-1);
      } else if (direction === 'right') {
        applyPlayerDirection(1);
      }
      setPlayerMoving(true);
      checkKeyPickup(player, objectsState, collisionCallbacks);
      if (isHardcoreMode) {
        checkChestPickup(player, objectsState, collisionCallbacks);
        checkBonusChestPickup(player, objectsState, collisionCallbacks);
        checkMalusChestPickup(player, objectsState, collisionCallbacks);
        checkExtraChestsCollision();
      }
      checkDoorReach(player, objectsState, collisionCallbacks, hasKey);
      drawMaze();
    }
  } else {
    setPlayerMoving(false);
  }
  requestAnimationFrame(gameLoop);
}

function animateEnemies(ts) {
  const dt = Math.min(0.05, (ts - lastTs) / 1000);
  lastTs = ts;

  if (!window.gameState.enPause && enemyActive && enemyCount > 0) {
    updateEnemies({
      enemies,
      enemySprites,
      player,
      cellSize,
      canvas,
      gameAreaEl,
      enemySpeed,
      attrape,
      dt,
      onCatch: () => {
        if (!window.gameState.enPause) {
          window.gameState.enPause = true;
          gameUI.clearTimer();
          lose();
        }
      },
    });
  }

  updateSprites();
  requestAnimationFrame(animateEnemies);
}

window.resetGame = function () {
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;

  mazeState = createMazeState(cols, rows);
  player.x = Math.floor(Math.random() * cols);
  player.y = Math.floor(Math.random() * rows);

  hasKey = false;
  door = getRandomDoorPosition();
  keyPos = getRandomKeyPosition();
  if (isHardcoreMode) {
    malchest = getRandomMalusChestPosition();
    boschest = getRandomBonusChestPosition(malchest);
    chest = getRandomChestPosition(malchest, boschest);
    chestSprite.style.display = 'block';
    bonusChestSprite.style.display = 'block';
    malusChestSprite.style.display = 'block';
  }
  keySprite.style.display = 'block';

  setObjectPosition(objectsState, 'door', door.x, door.y);
  setObjectPosition(objectsState, 'key', keyPos.x, keyPos.y);
  if (isHardcoreMode) {
    setObjectPosition(objectsState, 'chest', chest.x, chest.y);
    setObjectPosition(objectsState, 'bonusChest', boschest.x, boschest.y);
    setObjectPosition(objectsState, 'malusChest', malchest.x, malchest.y);
    objectsState.chest.collected = false;
    objectsState.bonusChest.collected = false;
    objectsState.malusChest.collected = false;
    spawnExtraChestsForLevel();
  }
  objectsState.key.collected = false;

  window.gameState.timerStarted = false;
  resetHalfTime();
  if (modeConfig.timerEnabled) {
    gameUI.setTimeRemaining(gameUI.getTimeForLevel(currentLevel));
    gameUI.updateChronoDisplay();
    gameUI.clearTimer();
  } else {
    gameUI.clearTimer();
    gameUI.setTimeRemaining(gameUI.getTimeForLevel(currentLevel));
    gameUI.updateChronoDisplay();
  }

  respawnEnemies({
    enemies,
    count: enemyCount,
    canvas,
    cellSize,
    player,
  });
  enemyActive = false;
  playerHasMovedOnce = false;

  step();
};

window.restartGame = function () {
  currentLevel = 1;
  cols = initialCols;
  rows = initialRows;

  enemyCount = initialEnemyCount;
  enemySpeed = initialEnemySpeed;

  while (enemySprites.length > enemyCount) {
    const sprite = enemySprites.pop();
    enemies.pop();
    if (sprite && sprite.parentElement) sprite.remove();
  }

  if (enemyCount === 0) {
    if (enemyTemplate) hideEnemies([enemyTemplate]);
  } else if (enemyTemplate) {
    enemyTemplate.style.display = 'block';
  }

  updateLevelDisplay();
  updateHardcoreEnemySpeed();

  if (!isHardcoreMode) {
    chestSprite.style.display = 'none';
    bonusChestSprite.style.display = 'none';
    malusChestSprite.style.display = 'none';
  }

  if (window.resetGame) window.resetGame();
};

window.addEventListener('resize', updateSprites);
window.addEventListener('scroll', updateSprites);

// Init
updateLevelDisplay();
updateHardcoreEnemySpeed();
door = getRandomDoorPosition();
keyPos = getRandomKeyPosition();
if (isHardcoreMode) {
  malchest = getRandomMalusChestPosition();
  boschest = getRandomBonusChestPosition(malchest);
  chest = getRandomChestPosition(malchest, boschest);
}

setObjectPosition(objectsState, 'door', door.x, door.y);
setObjectPosition(objectsState, 'key', keyPos.x, keyPos.y);
if (isHardcoreMode) {
  setObjectPosition(objectsState, 'chest', chest.x, chest.y);
  objectsState.chest.collected = false;
  setObjectPosition(objectsState, 'bonusChest', boschest.x, boschest.y);
  setObjectPosition(objectsState, 'malusChest', malchest.x, malchest.y);
  objectsState.bonusChest.collected = false;
  objectsState.malusChest.collected = false;
  spawnExtraChestsForLevel();
}
objectsState.key.collected = false;
setupInputListeners(keysState);
resetHalfTime();

respawnEnemies({
  enemies,
  count: enemyCount,
  canvas,
  cellSize,
  player,
});
step();
requestAnimationFrame((t) => {
  lastTs = t;
  animateEnemies(t);
});
setPlayerMoving(false); // Initialize sprite to idle
gameLoop();
updateSprites();
gameUI.updateChronoDisplay();
