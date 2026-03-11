export function setSpriteScreenPos({
  el,
  canvas,
  gameAreaEl,
  cellSize,
  gridX,
  gridY,
}) {
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

export function setSpriteScreenPosPx({ el, canvas, gameAreaEl, px, py }) {
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
