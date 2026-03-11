'use strict';

export function tutorial({ onClose } = {}) {
  const body = document.querySelector('body');

  const createEl = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  };

  const bodyContainer = createEl('section', 'body_container');
  const div = createEl('div', 'tutorial_container');
  const header = createEl('h1', 'information', 'POUR SE DÉPLACER :');
  const arrow = createEl('div', 'arrow_container');

  div.appendChild(header);

  ['⬆️', '⬅️', '⬇️', '➡️'].forEach((symbol, index) => {
    const el = createEl('div', 'arrow', symbol);
    if (index === 0) {
      div.appendChild(el);
    } else {
      arrow.appendChild(el);
    }
  });
  div.appendChild(arrow);

  const footer = createEl('h1', 'information', 'UTILISER LES FLÈCHES !');
  div.appendChild(footer);

  div.addEventListener('click', () => {
    bodyContainer.remove();
    if (onClose) onClose();
  });

  bodyContainer.appendChild(div);
  body.appendChild(bodyContainer);
}
