'use strict';

export function pause() {
  const body = document.querySelector('body');
  let div = document.querySelector('.pause_container');

  if (div) return;
  const bodyContainer = document.createElement('section');
  bodyContainer.className = 'body_container';

  div = document.createElement('div');
  div.className = 'pause_container';

  const iconPause = document.createElement('div');
  iconPause.textContent = '▶️';
  iconPause.className = 'iconPause';
  iconPause.style.cursor = 'default';
  div.appendChild(iconPause);

  const returnToPlay = document.createElement('h1');
  returnToPlay.textContent = 'RETOUR AU JEU';
  returnToPlay.className = 'returnToPlay';
  returnToPlay.style.cursor = 'pointer';
  div.appendChild(returnToPlay);

  returnToPlay.addEventListener('click', () => {
    if (bodyContainer) bodyContainer.remove();
    window.gameState.enPause = false;
    boutonPause.textContent = '⏸';
  });

  bodyContainer.appendChild(div);
  body.appendChild(bodyContainer);
}
