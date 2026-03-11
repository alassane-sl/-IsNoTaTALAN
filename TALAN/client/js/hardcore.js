import { pause } from '../functions/modal/pause.js';
import { tutorial } from '../functions/modal/tutorial.js';
import { quit } from '../functions/modal/quit.js';
import { win } from '../functions/modal/win.js';
import { lose } from '../functions/modal/lose.js';
import { finalWin } from '../functions/modal/finalWin.js';
import { redirectionWin } from '../functions/modal/redirectionWin.js';
import { initGameUI } from './composants/gameUi.js';
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
  checkKeyPickup as checkKey,
  checkDoorReach,
  checkChestPickup,
  checkMalusChestPickup,
  checkBonusChestPickup,
} from './composants/collisionManager.js';

// Image perso choisi (depuis welcome)
function applySelectedCharacterImage() {
  try {
    const chosenSrc = localStorage.getItem('selectedCharacterSrc');
    if (chosenSrc) {
      const imgEl = document.querySelector('#player-sprite img');
      if (imgEl) imgEl.src = chosenSrc;
    }
  } catch (_) {}
}
applySelectedCharacterImage();

const spriteConfig = {
  1: {
    walk: '../public/images/cyborgRun.png',
    idle: '../public/images/cyberStop.png',
  },
  2: {
    walk: '../public/images/Stranger.gif',
    idle: '../public/images/StrangerStop.png',
  },
};

const selectedCharacter = parseInt(
  localStorage.getItem('selectedCharacter'),
  10,
);
const currentSpriteConfig =
  Number.isInteger(selectedCharacter) && spriteConfig[selectedCharacter]
    ? spriteConfig[selectedCharacter]
    : spriteConfig[1];
let isMoving = false;

const hardcoreUI = initGameUI({
  baseTime: 30,
  levelTimeIncrement: 15,
  onPause: pause,
  onQuit: quit,
  onTutorial: () => {
    let skipIntroOnce = false;
    try {
      skipIntroOnce = localStorage.getItem('skipIntroOnce') === '1';
      if (skipIntroOnce) localStorage.removeItem('skipIntroOnce');
    } catch (_) {}

    if (skipIntroOnce) {
      window.gameState.enPause = false;
      return;
    }

    tutorial({
      onClose: () => {
        window.gameState.enPause = false;
      },
    });
  },
  onLose: lose,
});

// Canvas & elements
const canvas = document.getElementById('maze');
const ctx = canvas.getContext('2d');
const gameAreaEl = document.getElementById('game-area');

const playerSprite = document.getElementById('player-sprite');
const doorSprite = document.getElementById('door-sprite');
const keySprite = document.getElementById('key-sprite');
const enemySprite = document.getElementById('enemy-sprite');
const chestSprite = document.getElementById('chest-sprite');
const bonusChestSprite = document.getElementById('bonus-sprite');
const malusChestSprite = document.getElementById('malus-sprite');

// Configuration & state
let cols = 15;
let rows = 15;
const cellSize = 20;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let currentLevel = 1;

const player = {
  x: Math.floor(Math.random() * cols),
  y: Math.floor(Math.random() * rows),
  direction: 1,
};
let hasKey = false;
let door;
let keyPos;

// États pour les composants
const movementState = createMovementState(0); // pas de délai en hardcore
const keysState = createKeysState();
const objectsState = createObjectsState();
const collisionCallbacks = createCollisionCallbacks();

const speed_ghost = 20; // px/s
const attrape = Math.min(cellSize * 0.5, 12);
const enemies = [{ xPx: 0, yPx: 0 }];
const enemySprites = [enemySprite];
let enemyActive = false; // bouge enemi lors 1er deplacement joueur
let playerHasMovedOnce = false;
let hasRelocatedMidTime = false;

function ensureEnemyCount(targetCount) {
  const desired = Math.max(1, targetCount);
  while (enemies.length < desired) {
    enemies.push({ xPx: 0, yPx: 0 });
    if (enemySprite?.parentElement) {
      const clone = enemySprite.cloneNode(true);
      clone.removeAttribute('id');
      clone.classList.add('enemy-clone');
      enemySprite.parentElement.appendChild(clone);
      enemySprites.push(clone);
    }
  }

  while (enemies.length > desired) {
    enemies.pop();
    const sprite = enemySprites.pop();
    if (sprite && sprite !== enemySprite) sprite.remove();
  }
}

const grid = [];
let current;
const stack = [];

// Niveau
function updateLevelDisplay() {
  const el = document.getElementById('level-display');
  if (el) el.textContent = currentLevel;
}
window.incrementLevel = function () {
  cols += 2;
  rows += 2;
  currentLevel++;
  updateLevelDisplay();
  ensureEnemyCount(currentLevel);
  hasRelocatedMidTime = false;
};

// Maze
function createCell(x, y) {
  return {
    x,
    y,
    walls: { top: true, right: true, bottom: true, left: true },
    visited: false,
  };
}
function getIndex(x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
  return x + y * cols;
}
function removeWalls(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  if (dx === 1) {
    a.walls.left = false;
    b.walls.right = false;
  } else if (dx === -1) {
    a.walls.right = false;
    b.walls.left = false;
  }
  if (dy === 1) {
    a.walls.top = false;
    b.walls.bottom = false;
  } else if (dy === -1) {
    a.walls.bottom = false;
    b.walls.top = false;
  }
}
function draw(cell) {
  const x = cell.x * cellSize;
  const y = cell.y * cellSize;
  ctx.strokeStyle = 'lime';
  ctx.lineWidth = 1;
  if (cell.walls.top) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + cellSize, y);
    ctx.stroke();
  }
  if (cell.walls.right) {
    ctx.beginPath();
    ctx.moveTo(x + cellSize, y);
    ctx.lineTo(x + cellSize, y + cellSize);
    ctx.stroke();
  }
  if (cell.walls.bottom) {
    ctx.beginPath();
    ctx.moveTo(x + cellSize, y + cellSize);
    ctx.lineTo(x, y + cellSize);
    ctx.stroke();
  }
  if (cell.walls.left) {
    ctx.beginPath();
    ctx.moveTo(x, y + cellSize);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}
function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  grid.forEach((c) => draw(c));
  updateSprites();
}
function step() {
  const stepsPerFrame = 5; // Accélération pour le mode hardcore
  for (let s = 0; s < stepsPerFrame; s++) {
    current.visited = true;
    const n = [];
    const top = grid[getIndex(current.x, current.y - 1)];
    const right = grid[getIndex(current.x + 1, current.y)];
    const bottom = grid[getIndex(current.x, current.y + 1)];
    const left = grid[getIndex(current.x - 1, current.y)];
    [top, right, bottom, left].forEach((v) => {
      if (v && !v.visited) n.push(v);
    });

    if (n.length > 0) {
      const next = n[Math.floor(Math.random() * n.length)];
      stack.push(current);
      removeWalls(current, next);
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop();
    }

    if (!(stack.length > 0 || n.length > 0)) break;
  }
  drawMaze();
  if (stack.length > 0) requestAnimationFrame(step);
  else updateSprites();
}

// Sprites
function setSpriteScreenPos(el, gridX, gridY) {
  if (!el || !canvas || !gameAreaEl) return;
  const area = gameAreaEl.getBoundingClientRect();
  const crect = canvas.getBoundingClientRect();
  const sx = crect.width / canvas.width;
  const sy = crect.height / canvas.height;
  const px = gridX * cellSize + cellSize / 2;
  const py = gridY * cellSize + cellSize / 2;
  const offX = crect.left - area.left;
  const offY = crect.top - area.top;
  el.style.left = `${offX + px * sx}px`;
  el.style.top = `${offY + py * sy}px`;
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
function setSpriteScreenPosPx(el, px, py) {
  if (!el || !canvas || !gameAreaEl) return;
  const area = gameAreaEl.getBoundingClientRect();
  const crect = canvas.getBoundingClientRect();
  const sx = crect.width / canvas.width;
  const sy = crect.height / canvas.height;
  const offX = crect.left - area.left;
  const offY = crect.top - area.top;
  el.style.left = `${offX + px * sx}px`;
  el.style.top = `${offY + py * sy}px`;
}
function updateSprites() {
  setSpriteScreenPos(playerSprite, player.x, player.y);
  setSpriteScreenPos(doorSprite, door.x, door.y);
  if (keySprite.style.display !== 'none')
    setSpriteScreenPos(keySprite, keyPos.x, keyPos.y);
  enemySprites.forEach((sprite, index) => {
    const enemy = enemies[index];
    if (!sprite || !enemy) return;
    setSpriteScreenPosPx(sprite, enemy.xPx, enemy.yPx);
  });
  if (chestSprite.style.display !== 'none') {
    setSpriteScreenPos(chestSprite, chest.x, chest.y);
  }
  if (bonusChestSprite.style.display !== 'none') {
    setSpriteScreenPos(bonusChestSprite, boschest.x, boschest.y);
  }
  if (malusChestSprite.style.display !== 'none') {
    setSpriteScreenPos(malusChestSprite, malchest.x, malchest.y);
  }
  if (keySprite.style.display !== 'none') {
    setSpriteScreenPos(keySprite, keyPos.x, keyPos.y);
  }
}

// Joueur - Porte - Clé
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

function relocateDoorAndKey() {
  door = getRandomDoorPosition();
  setObjectPosition(objectsState, 'door', door.x, door.y);
  if (!hasKey) {
    keyPos = getRandomKeyPosition();
    setObjectPosition(objectsState, 'key', keyPos.x, keyPos.y);
  }
  updateSprites();
  showMidTimePopup();
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
let malchest = null;

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
let boschest = null;

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
let chest = null;

addCollisionCallback(collisionCallbacks, 'onKeyPickup', () => {
  hasKey = true;
  keySprite.style.display = 'none';
  if (navigator.vibrate) navigator.vibrate(50);
});

addCollisionCallback(collisionCallbacks, 'onChestPickup', () => {
  chestSprite.style.display = 'none';
  if (navigator.vibrate) navigator.vibrate(50);
  player.x = Math.floor(Math.random() * cols);
  player.y = Math.floor(Math.random() * rows);
});

addCollisionCallback(collisionCallbacks, 'onBonusChestPickup', () => {
  bonusChestSprite.style.display = 'none';
  if (navigator.vibrate) navigator.vibrate(50);
  const updated = hardcoreUI.getTimeRemaining() + 20;
  hardcoreUI.setTimeRemaining(updated);
  hardcoreUI.updateChronoDisplay();
});

addCollisionCallback(collisionCallbacks, 'onMalusChestPickup', () => {
  malusChestSprite.style.display = 'none';
  if (navigator.vibrate) navigator.vibrate(50);
  const updated = Math.max(0, hardcoreUI.getTimeRemaining() - 20);
  hardcoreUI.setTimeRemaining(updated);
  hardcoreUI.updateChronoDisplay();
});

addCollisionCallback(collisionCallbacks, 'onDoorReach', () => {
  if (hasKey) {
    const isFinalHardcore = currentLevel === 5;

    window.gameState.enPause = true;
    hardcoreUI.clearTimer();

    if (isFinalHardcore) {
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

  const direction = getPressedDirection(keysState);
  if (direction) {
    setPlayerMoving(true);
    const moved = movePlayer(
      player,
      grid,
      cols,
      rows,
      direction,
      movementState,
    );
    if (moved) {
      if (!window.gameState.timerStarted) {
        window.gameState.timerStarted = true;
        hardcoreUI.startCountdown(hardcoreUI.getTimeForLevel(currentLevel));
      }
      if (
        window.gameState.timerStarted &&
        !hasRelocatedMidTime &&
        hardcoreUI.getTimeRemaining() <=
          hardcoreUI.getTimeForLevel(currentLevel) / 2
      ) {
        hasRelocatedMidTime = true;
        relocateDoorAndKey();
      }
      if (!playerHasMovedOnce) {
        playerHasMovedOnce = true;
        enemyActive = true;
      }
      // Apply direction change
      if (direction === 'left') {
        applyPlayerDirection(-1);
      } else if (direction === 'right') {
        applyPlayerDirection(1);
      }
      setPlayerMoving(true);
      checkKey(player, objectsState, collisionCallbacks);
      checkChestPickup(player, objectsState, collisionCallbacks);
      checkBonusChestPickup(player, objectsState, collisionCallbacks);
      checkMalusChestPickup(player, objectsState, collisionCallbacks);
      checkDoorReach(player, objectsState, collisionCallbacks, hasKey);

      drawMaze();
    }
  } else {
    setPlayerMoving(false);
  }

  requestAnimationFrame(gameLoop);
}

// Ennemi
function respawnEnemyFar() {
  const usedPositions = new Set();
  enemies.forEach((enemy) => {
    let x = 0;
    let y = 0;
    let attempts = 0;
    do {
      x = Math.floor(Math.random() * cols);
      y = Math.floor(Math.random() * rows);
      attempts += 1;
    } while (
      attempts < 50 &&
      ((x === player.x && y === player.y) || usedPositions.has(`${x},${y}`))
    );

    usedPositions.add(`${x},${y}`);
    enemy.xPx = x * cellSize + cellSize / 2;
    enemy.yPx = y * cellSize + cellSize / 2;
  });
}
let lastTs = performance.now();

function animateEnemy(ts) {
  const dt = Math.min(0.05, (ts - lastTs) / 1000);
  lastTs = ts;

  if (!window.gameState.enPause && enemyActive) {
    const targetPx = player.x * cellSize + cellSize / 2;
    const targetPy = player.y * cellSize + cellSize / 2;

    let caught = false;
    enemies.forEach((enemy) => {
      const dx = targetPx - enemy.xPx;
      const dy = targetPy - enemy.yPx;
      const dist = Math.hypot(dx, dy) || 1;

      const vx = (dx / dist) * speed_ghost;
      const vy = (dy / dist) * speed_ghost;

      enemy.xPx += vx * dt;
      enemy.yPx += vy * dt;

      if (Math.hypot(targetPx - enemy.xPx, targetPy - enemy.yPx) <= attrape) {
        caught = true;
      }
    });

    if (caught && !window.gameState.enPause) {
      window.gameState.enPause = true;
      hardcoreUI.clearTimer();
      lose();
    }
  }

  updateSprites();
  requestAnimationFrame(animateEnemy);
}

// Reset niveau
window.resetGame = function () {
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;

  grid.length = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) grid.push(createCell(x, y));
  }
  player.x = Math.floor(Math.random() * cols);
  player.y = Math.floor(Math.random() * rows);

  hasKey = false;
  door = getRandomDoorPosition();
  keyPos = getRandomKeyPosition();
  malchest = getRandomMalusChestPosition();
  boschest = getRandomBonusChestPosition(malchest);
  chest = getRandomChestPosition(malchest, boschest);
  keySprite.style.display = 'block';
  chestSprite.style.display = 'block';
  bonusChestSprite.style.display = 'block';
  malusChestSprite.style.display = 'block';

  setObjectPosition(objectsState, 'door', door.x, door.y);
  setObjectPosition(objectsState, 'key', keyPos.x, keyPos.y);
  setObjectPosition(objectsState, 'chest', chest.x, chest.y);
  setObjectPosition(objectsState, 'bonusChest', boschest.x, boschest.y);
  setObjectPosition(objectsState, 'malusChest', malchest.x, malchest.y);
  objectsState.key.collected = false;
  objectsState.chest.collected = false;
  objectsState.bonusChest.collected = false;
  objectsState.malusChest.collected = false;

  current = grid[0];
  stack.length = 0;

  window.gameState.timerStarted = false;
  hasRelocatedMidTime = false;
  hardcoreUI.setTimeRemaining(hardcoreUI.getTimeForLevel(currentLevel));
  hardcoreUI.updateChronoDisplay();
  hardcoreUI.clearTimer();

  respawnEnemyFar();
  enemyActive = false; // re attend que tu bouge
  playerHasMovedOnce = false;

  step();
};

// Responsive / maj positions
window.addEventListener('resize', updateSprites);
window.addEventListener('scroll', updateSprites);

// Init
ensureEnemyCount(currentLevel);
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    grid.push(createCell(x, y));
  }
}
current = grid[0];
door = getRandomDoorPosition();
keyPos = getRandomKeyPosition();
malchest = getRandomMalusChestPosition();
boschest = getRandomBonusChestPosition(malchest);
chest = getRandomChestPosition(malchest, boschest);
respawnEnemyFar();
setObjectPosition(objectsState, 'door', door.x, door.y);
setObjectPosition(objectsState, 'key', keyPos.x, keyPos.y);
setObjectPosition(objectsState, 'chest', chest.x, chest.y);
setObjectPosition(objectsState, 'bonusChest', boschest.x, boschest.y);
setObjectPosition(objectsState, 'malusChest', malchest.x, malchest.y);
objectsState.key.collected = false;
objectsState.chest.collected = false;
objectsState.bonusChest.collected = false;
objectsState.malusChest.collected = false;
setupInputListeners(keysState);

step();
requestAnimationFrame((t) => {
  lastTs = t;
  animateEnemy(t);
});
setPlayerMoving(false); // Initialize sprite to idle
gameLoop();
updateSprites();
hardcoreUI.updateChronoDisplay();
