/**
 * Gestion des collisions et des interactions avec les objets
 * Compatible avec l'architecture fonctionnelle existante
 */

/**
 * Créer un état pour les objets du jeu
 */
export function createObjectsState() {
  return {
    key: { pos: null, collected: false },
    door: { pos: null },
    chest: { pos: null, collected: false },
    bonusChest: { pos: null, collected: false },
    malusChest: { pos: null, collected: false },
  };
}

/**
 * Créer les callbacks pour les collisions
 */
export function createCollisionCallbacks() {
  return {
    onKeyPickup: [],
    onDoorReach: [],
    onChestPickup: [],
    onBonusChestPickup: [],
    onMalusChestPickup: [],
  };
}

export function afficherPopUp(message) {
    // 1. Création de l'élément
    const popup = document.createElement('div');
    popup.classList.add("pop-up-chest")
    popup.textContent = message;

    document.body.appendChild(popup);

    // 3. Disparition après 1 seconde
    setTimeout(() => {
        popup.style.opacity = '0'; // Effet de fondu
        setTimeout(() => popup.remove(), 300); // Suppression du DOM
    }, 2000);
}

/**
 * Définir la position d'un objet
 */
export function setObjectPosition(objectsState, objectName, x, y) {
  if (objectsState[objectName]) {
    objectsState[objectName].pos = { x, y };
  }
}

/**
 * Vérifier la collision avec un objet spécifique
 */
export function checkCollision(player, objectsState, objectName) {
  const obj = objectsState[objectName];
  if (!obj || !obj.pos) return false;

  return player.x === obj.pos.x && player.y === obj.pos.y;
}

/**
 * Vérifier la collecte de la clé
 */
export function checkKeyPickup(player, objectsState, callbacks) {
  const key = objectsState.key;
  if (!key.collected && checkCollision(player, objectsState, "key")) {
    key.collected = true;
    if (callbacks && callbacks.onKeyPickup) {
      callbacks.onKeyPickup.forEach((callback) => callback());
    }
    return true;
  }
  return false;
}

/**
 * Vérifier l'interaction avec la porte
 */
export function checkDoorReach(player, objectsState, callbacks, hasKey) {
  if (checkCollision(player, objectsState, "door")) {
    if (callbacks && callbacks.onDoorReach) {
      callbacks.onDoorReach.forEach((callback) => callback(hasKey));
    }
    return true;
  }
  return false;
}

/**
 * Vérifier la collecte d'un coffre
 */
export function checkChestPickup(player, objectsState, callbacks) {
  const chest = objectsState.chest;
  if (!chest.collected && checkCollision(player, objectsState, "chest")) {
    chest.collected = true;
    afficherPopUp("😐 Vous avez été téléport");
    if (callbacks && callbacks.onChestPickup) {
      callbacks.onChestPickup.forEach((callback) => callback());
    }
    return true;
  }
  return false;
}

/**
 * Vérifier la collecte d'un coffre bonus
 */
export function checkBonusChestPickup(player, objectsState, callbacks) {
  const bonusChest = objectsState.bonusChest;
  if (!bonusChest.collected && checkCollision(player, objectsState, "bonusChest")) {
    bonusChest.collected = true;
    afficherPopUp("✅ + 20 secondes !");
    if (callbacks && callbacks.onBonusChestPickup) {
      callbacks.onBonusChestPickup.forEach((callback) => callback());
    }
    return true;
  }
  return false;
}

/**
 * Vérifier la collecte d'un coffre malus
 */
export function checkMalusChestPickup(player, objectsState, callbacks) {
  
  const malusChest = objectsState.malusChest;
  if (!malusChest.collected && checkCollision(player, objectsState, "malusChest")) {
    malusChest.collected = true;
    afficherPopUp("❌ - 20 secondes !");
    if (callbacks && callbacks.onMalusChestPickup) {
      callbacks.onMalusChestPickup.forEach((callback) => callback());
    }
    return true;
  }
  return false;
}

/**
 * Vérifier toutes les collisions
 */
export function checkAllCollisions(player, objectsState, callbacks, hasKey, isHardcoreMode = false) {
  checkKeyPickup(player, objectsState, callbacks);
  
  if (isHardcoreMode) {
    checkChestPickup(player, objectsState, callbacks);
    checkBonusChestPickup(player, objectsState, callbacks);
    checkMalusChestPickup(player, objectsState, callbacks);
  }
  
  checkDoorReach(player, objectsState, callbacks, hasKey);
}

/**
 * Ajouter un callback pour un événement
 */
export function addCollisionCallback(callbacks, event, callback) {
  if (callbacks[event]) {
    callbacks[event].push(callback);
  }
}

/**
 * Retirer un callback
 */
export function removeCollisionCallback(callbacks, event, callback) {
  if (callbacks[event]) {
    const index = callbacks[event].indexOf(callback);
    if (index > -1) {
      callbacks[event].splice(index, 1);
    }
  }
}

/**
 * Réinitialiser l'état de collecte
 */
export function resetCollections(objectsState) {
  Object.keys(objectsState).forEach((key) => {
    if (objectsState[key].collected !== undefined) {
      objectsState[key].collected = false;
    }
  });
}

/**
 * Obtenir l'état d'un objet
 */
export function getObjectState(objectsState, objectName) {
  return objectsState[objectName];
}

/**
 * Définir l'état de collecte d'un objet
 */
export function setCollected(objectsState, objectName, value) {
  if (objectsState[objectName] && objectsState[objectName].collected !== undefined) {
    objectsState[objectName].collected = value;
  }
}
