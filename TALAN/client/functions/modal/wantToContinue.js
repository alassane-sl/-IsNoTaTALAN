'use strict';
export function wantToContinue() {
  window.gameState.enPause = true;
  const body = document.querySelector('body');

  const bodyContainer = document.createElement('section');
  bodyContainer.className = 'body_container';

  const div = document.createElement('div');
  div.className = 'continue_container';

  const high = document.createElement('div');
  high.className = 'high';

  const iconContinue = document.createElement('div');
  iconContinue.textContent = '⁉️';
  iconContinue.className = 'iconContinue';
  high.appendChild(iconContinue);

  const toContinue = document.createElement('h1');
  toContinue.textContent = 'Voulez-vous continuer ?';
  toContinue.className = 'toContinue';
  high.appendChild(toContinue);

  const down = document.createElement('div');
  down.className = 'down';

  const buttonYes = document.createElement('button');
  buttonYes.textContent = 'Oui';
  buttonYes.className = 'button';
  buttonYes.style.cursor = 'pointer';
  down.appendChild(buttonYes);

  const buttonNo = document.createElement('button');
  buttonNo.textContent = 'Non';
  buttonNo.className = 'button';
  buttonNo.style.cursor = 'pointer';
  down.appendChild(buttonNo);

  buttonNo.addEventListener('click', () => {
    if (bodyContainer) bodyContainer.remove();
    window.location.href = '../html/welcome.html';
  });

  buttonYes.addEventListener('click', () => {
    window.gameState.enPause = false;
    if (bodyContainer) bodyContainer.remove();
    if (window.resetGame) {
      window.resetGame();
    }
  });

  div.appendChild(high);
  div.appendChild(down);
  bodyContainer.appendChild(div);
  body.appendChild(bodyContainer);
}
