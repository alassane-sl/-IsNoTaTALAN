import { setSpriteScreenPosPx } from './spritePosition.js';

export function initEnemies({ enemyTemplate, count }) {
  if (!enemyTemplate || count <= 0) return { enemies: [], enemySprites: [] };
  const parent = enemyTemplate.parentElement;
  const enemySprites = [];

  for (let i = 0; i < count; i++) {
    const el = i === 0 ? enemyTemplate : enemyTemplate.cloneNode(true);
    el.id = i === 0 ? 'enemy-sprite-1' : `enemy-sprite-${i + 1}`;
    el.style.display = 'block';
    el.style.position = 'absolute';
    if (i > 0) parent.appendChild(el);
    enemySprites.push(el);
  }

  const enemies = new Array(count).fill(0).map(() => ({ xPx: 0, yPx: 0 }));
  return { enemies, enemySprites };
}

export function hideEnemies(enemySprites) {
  enemySprites.forEach((el) => {
    el.style.display = 'none';
  });
}

export function respawnEnemies({ enemies, count, canvas, cellSize, player }) {
  if (!enemies.length) return;
  const corners = [
    { xPx: cellSize * 0.5, yPx: cellSize * 0.5 },
    { xPx: canvas.width - cellSize * 0.5, yPx: cellSize * 0.5 },
    { xPx: cellSize * 0.5, yPx: canvas.height - cellSize * 0.5 },
    { xPx: canvas.width - cellSize * 0.5, yPx: canvas.height - cellSize * 0.5 },
  ];

  if (count === 1) {
    const pPx = player.x * cellSize + cellSize / 2;
    const pPy = player.y * cellSize + cellSize / 2;
    corners.sort(
      (a, b) =>
        Math.hypot(b.xPx - pPx, b.yPx - pPy) -
        Math.hypot(a.xPx - pPx, a.yPx - pPy),
    );
    enemies[0].xPx = corners[0].xPx;
    enemies[0].yPx = corners[0].yPx;
    return;
  }

  for (let i = 0; i < enemies.length; i++) {
    const corner = corners[i % corners.length];
    enemies[i].xPx = corner.xPx;
    enemies[i].yPx = corner.yPx;
  }
}

export function updateEnemies({
  enemies,
  enemySprites,
  player,
  cellSize,
  canvas,
  gameAreaEl,
  enemySpeed,
  attrape,
  dt,
  onCatch,
}) {
  if (!enemies.length) return;
  const targetPx = player.x * cellSize + cellSize / 2;
  const targetPy = player.y * cellSize + cellSize / 2;

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    const dx = targetPx - e.xPx;
    const dy = targetPy - e.yPx;
    const dist = Math.hypot(dx, dy) || 1;
    const vx = (dx / dist) * enemySpeed;
    const vy = (dy / dist) * enemySpeed;
    e.xPx += vx * dt;
    e.yPx += vy * dt;

    if (Math.hypot(targetPx - e.xPx, targetPy - e.yPx) <= attrape) {
      if (onCatch) onCatch();
    }

    const el = enemySprites[i];
    if (el) {
      setSpriteScreenPosPx({ el, canvas, gameAreaEl, px: e.xPx, py: e.yPx });
    }
  }
}
