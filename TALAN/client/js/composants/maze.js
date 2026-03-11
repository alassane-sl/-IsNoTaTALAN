export function createCell(x, y) {
  return {
    x,
    y,
    walls: { top: true, right: true, bottom: true, left: true },
    visited: false,
  };
}

export function createGrid(cols, rows) {
  const grid = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid.push(createCell(x, y));
    }
  }
  return grid;
}

export function getIndex(cols, rows, x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
  return x + y * cols;
}

export function removeWalls(a, b) {
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

export function drawCell(ctx, cell, cellSize) {
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

export function stepMaze(state, cols, rows) {
  const { grid } = state;
  state.current.visited = true;
  const n = [];
  const top = grid[getIndex(cols, rows, state.current.x, state.current.y - 1)];
  const right =
    grid[getIndex(cols, rows, state.current.x + 1, state.current.y)];
  const bottom =
    grid[getIndex(cols, rows, state.current.x, state.current.y + 1)];
  const left = grid[getIndex(cols, rows, state.current.x - 1, state.current.y)];
  [top, right, bottom, left].forEach((v) => {
    if (v && !v.visited) n.push(v);
  });

  if (n.length > 0) {
    const next = n[Math.floor(Math.random() * n.length)];
    state.stack.push(state.current);
    removeWalls(state.current, next);
    state.current = next;
  } else if (state.stack.length > 0) {
    state.current = state.stack.pop();
  }

  return n.length > 0 || state.stack.length > 0;
}

export function createMazeState(cols, rows) {
  const grid = createGrid(cols, rows);
  return { grid, current: grid[0], stack: [] };
}
