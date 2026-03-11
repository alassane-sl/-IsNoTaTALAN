'use strict';

export function redirectionWin({ seconds = 3 } = {}) {
  window.gameState.enPause = true;
  const body = document.querySelector('body');

  const bodyContainer = document.createElement('section');
  bodyContainer.className = 'body_container';

  const div = document.createElement('div');
  div.className = 'redirectionWin_container';

  const iconGoBack = document.createElement('div');
  iconGoBack.textContent = '😔';
  iconGoBack.className = 'iconGoback';
  div.appendChild(iconGoBack);

  const message = document.createElement('h1');
  message.className = 'toQuit';
  div.appendChild(message);

  const countdown = document.createElement('div');
  countdown.className = 'countdown';
  div.appendChild(countdown);

  let remaining = seconds;
  const updateText = () => {
    message.textContent = "Vous allez être redirigé vers l'accueil.";
    countdown.textContent = `Redirection dans ${remaining}…`;
  };

  updateText();

  const interval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(interval);
      window.location.href = '../html/welcome.html';
      return;
    }
    updateText();
  }, 1000);

  bodyContainer.appendChild(div);
  body.appendChild(bodyContainer);
}
