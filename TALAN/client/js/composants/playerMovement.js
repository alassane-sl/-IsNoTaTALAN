/**
 * Gestion du mouvement du joueur dans le labyrinthe
 * Compatible avec l'architecture fonctionnelle existante
 */

/**
 * Créer un état de mouvement pour le joueur
 */
export function createMovementState(moveDelay = 150) {
  return {
    lastMoveTime: 0,
    moveDelay,
    isMoving: false,
  };
}

/**
 * Obtenir l'index d'une cellule dans la grille
 */
export function getIndex(cols, rows, x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
  return x + y * cols;
}

/**
 * Vérifier si le mouvement est possible dans une direction
 */
export function canMove(player, grid, cols, rows, direction) {
  const currentCell = grid[getIndex(cols, rows, player.x, player.y)];
  if (!currentCell) return false;

  switch (direction) {
    case "up":
      return !currentCell.walls.top;
    case "down":
      return !currentCell.walls.bottom;
    case "left":
      return !currentCell.walls.left;
    case "right":
      return !currentCell.walls.right;
    default:
      return false;
  }
}

/**
 * Déplacer le joueur dans une direction
 * @returns {boolean} true si le mouvement a été effectué
 */
export function movePlayer(player, grid, cols, rows, direction, movementState) {
  const currentTime = Date.now();
  
  if (currentTime - movementState.lastMoveTime < movementState.moveDelay) {
    return false;
  }

  if (!canMove(player, grid, cols, rows, direction)) {
    return false;
  }

  let moved = false;

  switch (direction) {
    case "up":
      player.y--;
      moved = true;
      break;
    case "down":
      player.y++;
      moved = true;
      break;
    case "left":
      player.x--;
      if (player.direction !== undefined) player.direction = -1;
      moved = true;
      break;
    case "right":
      player.x++;
      if (player.direction !== undefined) player.direction = 1;
      moved = true;
      break;
  }

  if (moved) {
    movementState.lastMoveTime = currentTime;
    movementState.isMoving = true;
  }

  return moved;
}

/**
 * Téléporter le joueur à une position aléatoire
 */
export function teleportPlayerRandom(player, cols, rows) {
  player.x = Math.floor(Math.random() * cols);
  player.y = Math.floor(Math.random() * rows);
}

/**
 * Réinitialiser la position du joueur
 */
export function resetPlayerPosition(player, cols, rows, movementState) {
  player.x = Math.floor(Math.random() * cols);
  player.y = Math.floor(Math.random() * rows);
  if (movementState) {
    movementState.isMoving = false;
    movementState.lastMoveTime = 0;
  }
}
