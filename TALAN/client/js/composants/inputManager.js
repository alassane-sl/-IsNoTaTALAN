/**
 * Gestion des entrées clavier
 * Compatible avec l'architecture fonctionnelle existante
 */

/**
 * Créer un état pour les touches pressées
 */
export function createKeysState() {
  return {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  };
}

/**
 * Créer les callbacks pour les événements
 */
export function createInputCallbacks() {
  return {
    onKeyDown: [],
    onKeyUp: [],
  };
}

/**
 * Configurer les écouteurs d'événements
 */
export function setupInputListeners(keysState, callbacks = null) {
  const handleKeyDown = (e) => {
    if (e.key in keysState) {
      keysState[e.key] = true;
      e.preventDefault();
      
      if (callbacks && callbacks.onKeyDown) {
        callbacks.onKeyDown.forEach((callback) => callback(e.key, e));
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.key in keysState) {
      keysState[e.key] = false;
      e.preventDefault();
      
      if (callbacks && callbacks.onKeyUp) {
        callbacks.onKeyUp.forEach((callback) => callback(e.key, e));
      }
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // Retourner une fonction pour nettoyer les listeners
  return () => {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);
  };
}

/**
 * Obtenir la direction pressée
 */
export function getPressedDirection(keysState) {
  if (keysState.ArrowUp) return "up";
  if (keysState.ArrowDown) return "down";
  if (keysState.ArrowLeft) return "left";
  if (keysState.ArrowRight) return "right";
  return null;
}

/**
 * Vérifier si une touche spécifique est pressée
 */
export function isKeyPressed(keysState, key) {
  return keysState[key] || false;
}

/**
 * Vérifier si une direction est pressée
 */
export function isDirectionPressed(keysState) {
  return (
    keysState.ArrowUp ||
    keysState.ArrowDown ||
    keysState.ArrowLeft ||
    keysState.ArrowRight
  );
}

/**
 * Ajouter un callback pour les événements
 */
export function addInputCallback(callbacks, event, callback) {
  if (callbacks[event]) {
    callbacks[event].push(callback);
  }
}

/**
 * Retirer un callback
 */
export function removeInputCallback(callbacks, event, callback) {
  if (callbacks[event]) {
    const index = callbacks[event].indexOf(callback);
    if (index > -1) {
      callbacks[event].splice(index, 1);
    }
  }
}

/**
 * Réinitialiser toutes les touches
 */
export function resetKeys(keysState) {
  Object.keys(keysState).forEach((key) => {
    keysState[key] = false;
  });
}

/**
 * Obtenir toutes les touches pressées
 */
export function getAllPressedKeys(keysState) {
  return Object.keys(keysState).filter((key) => keysState[key]);
}
