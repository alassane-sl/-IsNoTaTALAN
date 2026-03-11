let halfTimeDone = false;

function getRandomPos(cols, rows, forbidden = []) {
  let x, y;
  let ok = false;
  while (!ok) {
    x = Math.floor(Math.random() * cols);
    y = Math.floor(Math.random() * rows);
    ok = !forbidden.some((p) => p.x === x && p.y === y);
  }
  return { x, y };
}

export function checkHalfTimeMove(
  timeRemaining,
  baseTime,
  cols,
  rows,
  player,
  door,
  keyPos,
  hasKey,
) {
  if (halfTimeDone) return { door, keyPos, moved: false };

  if (timeRemaining <= Math.floor(baseTime / 2)) {
    door = getRandomPos(cols, rows, [player]);
    if (!hasKey) {
      keyPos = getRandomPos(cols, rows, [player, door]);
    }
    halfTimeDone = true;
    return { door, keyPos, moved: true };
  }

  return { door, keyPos, moved: false };
}

export function resetHalfTime() {
  halfTimeDone = false;
}
