'use strict';

export function quit() {
  window.gameState.enPause = true;
  const body = document.querySelector('body');
  const bodyContainer = document.createElement('section');
  bodyContainer.className = 'body_container';

  let div = document.createElement('div');
  div.className = 'quit_container';

  const high = document.createElement('div');
  high.className = 'high';

  const iconQuit = document.createElement('div');
  iconQuit.textContent = '😔';
  iconQuit.className = 'iconQuit';
  high.appendChild(iconQuit);

  const toQuit = document.createElement('h1');
  toQuit.textContent = 'Voulez-vous vraiment nous quitter ?';
  toQuit.className = 'toQuit';
  high.appendChild(toQuit);

  const down = document.createElement('div');
  down.className = 'down';

  const buttonYes = document.createElement('button');
  buttonYes.textContent = 'Oui';
  buttonYes.className = 'button';
  buttonYes.style.cursor = 'pointer';
  buttonYes.addEventListener('click', () => {
    window.location.href = '../html/welcome.html';
    if (bodyContainer) bodyContainer.remove();
  });
  down.appendChild(buttonYes);

  const buttonNo = document.createElement('button');
  buttonNo.textContent = 'Non';
  buttonNo.className = 'button';
  buttonNo.style.cursor = 'pointer';
  buttonNo.addEventListener('click', () => {
    window.gameState.enPause = false;
    if (bodyContainer) bodyContainer.remove();
  });
  down.appendChild(buttonNo);

  div.appendChild(high);
  div.appendChild(down);
  bodyContainer.appendChild(div);
  body.appendChild(bodyContainer);
}
