'use strict';
import { retry } from './retry.js';

export function lose() {
  const body = document.querySelector('body');

  const bodyContainer = document.createElement('section');
  bodyContainer.className = 'body_container';

  const div = document.createElement('div');
  div.className = 'lose_container';

  const iconLose = document.createElement('div');
  iconLose.textContent = '🤪';
  iconLose.className = 'iconLose';
  div.appendChild(iconLose);

  const returnToPlay = document.createElement('h1');
  returnToPlay.innerHTML = 'Perdu ‼️ <br> Une prochaine fois peut-être !';
  returnToPlay.className = 'returnToPlay';
  div.appendChild(returnToPlay);

  div.addEventListener('click', () => {
    bodyContainer.remove();
    retry();
  });

  bodyContainer.appendChild(div);
  body.appendChild(bodyContainer);
}
