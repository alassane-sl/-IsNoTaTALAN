import { initWelcomeSelection } from './composants/welcomeSelection.js';

document.addEventListener('DOMContentLoaded', () => {
  const characters = document.querySelectorAll('.character-item');
  const normalButton = document.getElementById('normal-mode');
  const infinityButton = document.getElementById('infinity-mode');
  const hardcoreButton = document.getElementById('hardcore-mode');

  initWelcomeSelection({
    characters,
    normalButton,
    infinityButton,
    hardcoreButton,
  });
});
