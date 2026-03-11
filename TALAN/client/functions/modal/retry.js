'use strict';

export function retry() {
  const body = document.querySelector('body');

  const bodyContainer = document.createElement('section');
  bodyContainer.className = 'body_container';

  const div = document.createElement('div');
  div.className = 'retry_container';

  const high = document.createElement('div');
  high.className = 'high';

  const iconRestart = document.createElement('div');
  iconRestart.textContent = '⁉️';
  iconRestart.className = 'iconRestart';
  high.appendChild(iconRestart);

  const restart = document.createElement('h1');
  restart.textContent = 'Voulez-vous recommencer ?';
  restart.className = 'restart';
  high.appendChild(restart);

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

  buttonYes.addEventListener('click', () => {
    if (bodyContainer) bodyContainer.remove();
    const canRestart =
      typeof window.restartGame === 'function' ||
      typeof window.resetGame === 'function';

    if (canRestart) {
      if (window.gameState) window.gameState.enPause = false;
      if (typeof window.restartGame === 'function') {
        window.restartGame();
      } else if (typeof window.resetGame === 'function') {
        window.resetGame();
      }
      return;
    }

    try {
      localStorage.setItem('skipIntroOnce', '1');
    } catch (_) {}
    window.location.href = '../html/index.html';
  });

  buttonNo.addEventListener('click', () => {
    if (bodyContainer) bodyContainer.remove();
    window.location.href = '../html/welcome.html';
  });

  div.appendChild(high);
  div.appendChild(down);
  bodyContainer.appendChild(div);
  body.appendChild(bodyContainer);
}
