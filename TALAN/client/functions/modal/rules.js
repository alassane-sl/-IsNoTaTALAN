'use strict';

export function rules({ onClose } = {}) {
  const body = document.querySelector('body');

  const bodyContainer = document.createElement('section');
  bodyContainer.className = 'body_container';

  const div = document.createElement('div');
  div.className = 'rules_container';

  const header = document.createElement('h1');
  header.textContent = 'RÈGLES DU JEU :';
  header.className = 'information';
  div.appendChild(header);

  const rulesList = document.createElement('div');
  rulesList.className = 'rules_list';

  const normalRules = [
    '- Récupère la clé en passant dessus.',
    '- Atteins la porte avec la clé.',
    '- Fini le niveau dans le temps imparti.',
    '- Le temps augmente à chaque niveau.',
    '- Chaque niveau est plus difficile.',
    '- Termine les 5 niveaux pour gagner.',
  ];

  const infiniteRules = [
    '- Récupère la clé en passant dessus.',
    '- Atteins la porte avec la clé.',
    '- Fini le niveau dans le temps imparti.',
    '- Le temps augmente à chaque niveau.',
    '- Chaque niveau est plus difficile.',
    "- Les niveaux montes à l'infini .",
  ];

  const hardcoreRules = [
    '- Récupère la clé qui est caché dans un coffre.',
    '- Atteins la porte avec la clé.',
    "- Fais attention à l'environnement.",
    '- Fini le niveau dans le temps imparti.',
    '- Le temps augmente à chaque niveau.',
    '- Chaque niveau est beaucoup plus difficile.',
    '- Termine les 5 niveaux pour gagner .',
  ];

  const gameMode = localStorage.getItem('selectedMode');
  if (gameMode === 'normal') {
    normalRules.forEach((rule) => {
      const h2 = document.createElement('h2');
      h2.textContent = rule;
      rulesList.appendChild(h2);
    });
  } else if (gameMode === 'infinity') {
    infiniteRules.forEach((rule) => {
      const h2 = document.createElement('h2');
      h2.textContent = rule;
      rulesList.appendChild(h2);
    });
  } else if (gameMode === 'hardcore') {
    hardcoreRules.forEach((rule) => {
      const h2 = document.createElement('h2');
      h2.textContent = rule;
      rulesList.appendChild(h2);
    });
  }
  div.appendChild(rulesList);

  div.addEventListener('click', () => {
    bodyContainer.remove();
    if (onClose) onClose();
  });

  bodyContainer.appendChild(div);
  body.appendChild(bodyContainer);
}
