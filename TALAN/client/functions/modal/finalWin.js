'use strict';

export function finalWin({ onClose } = {}) {
  const body = document.querySelector('body');

  const bodyContainer = document.createElement('section');
  bodyContainer.className = 'body_container';

  const div = document.createElement('div');
  div.className = 'finalWin_container';

  const iconWin = document.createElement('div');
  iconWin.textContent = '🏆';
  iconWin.className = 'iconWin';
  div.appendChild(iconWin);

  const returnToPlay = document.createElement('h1');
  window.gameState.enPause = true;
  returnToPlay.textContent = "Bien joué, tu as survécu à l'enfer !";
  returnToPlay.className = 'returnToPlay';
  div.appendChild(returnToPlay);

  div.addEventListener('click', () => {
    bodyContainer.remove();
    if (onClose) onClose();
  });

  bodyContainer.appendChild(div);
  body.appendChild(bodyContainer);
}
