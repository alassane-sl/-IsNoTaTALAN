export function initGameUI({
  baseTime = 70,
  levelTimeIncrement = 20,
  onPause,
  onQuit,
  onTutorial,
  onLose,
  audioId = 'musique',
  soundButtonId = 'sound-button',
  pauseButtonId = 'break-button',
  quitButtonId = 'power-button',
  chronoId = 'chronometer',
  playerSpriteSelector = '#player-sprite img',
  togglePause = true,
} = {}) {
  // applique image perso choisi
  try {
    const chosenSrc = localStorage.getItem('selectedCharacterSrc');
    if (chosenSrc) {
      const imgEl = document.querySelector(playerSpriteSelector);
      if (imgEl) imgEl.src = chosenSrc;
    }
  } catch (_) {}

  const audio = document.getElementById(audioId);
  const boutonSon = document.getElementById(soundButtonId);
  const boutonPause = document.getElementById(pauseButtonId);
  const boutonQuit = document.getElementById(quitButtonId);

  if (!window.gameState) window.gameState = {};
  if (typeof window.gameState.sonActif !== 'boolean') {
    window.gameState.sonActif = false;
  }
  if (typeof window.gameState.enPause !== 'boolean') {
    window.gameState.enPause = false;
  }
  if (typeof window.gameState.timerStarted !== 'boolean') {
    window.gameState.timerStarted = false;
  }

  let timerInterval = null;
  let timeRemaining = baseTime;

  function formatTime(sec) {
    const mm = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const ss = (sec % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function updateChronoDisplay() {
    const el = document.getElementById(chronoId);
    if (el) {
      el.textContent = formatTime(timeRemaining);
      if (timeRemaining <= 10) {
        el.classList.add('critical');
        el.classList.remove('warning');
      } else if (timeRemaining <= 30) {
        el.classList.add('warning');
        el.classList.remove('critical');
      } else {
        el.classList.remove('critical', 'warning');
      }
    }
  }

  function getTimeForLevel(level) {
    return baseTime + (level - 1) * levelTimeIncrement;
  }

  function startCountdown(seconds) {
    clearInterval(timerInterval);
    timeRemaining = seconds;
    updateChronoDisplay();
    timerInterval = setInterval(() => {
      if (window.gameState.enPause) return;
      timeRemaining--;
      updateChronoDisplay();
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        window.gameState.enPause = true;
        if (onLose) onLose();
      }
    }, 1000);
  }

  function clearTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  function setTimeRemaining(seconds) {
    timeRemaining = seconds;
  }

  function getTimeRemaining() {
    return timeRemaining;
  }

  if (boutonSon && audio) {
    boutonSon.addEventListener('click', () => {
      if (window.gameState.sonActif) {
        audio.pause();
        boutonSon.textContent = '🔇';
      } else {
        audio.play().catch(() => {});
        boutonSon.textContent = '🔊';
      }
      window.gameState.sonActif = !window.gameState.sonActif;
    });
  }

  if (boutonPause) {
    boutonPause.addEventListener('click', () => {
      if (togglePause) {
        window.gameState.enPause = !window.gameState.enPause;
        boutonPause.textContent = window.gameState.enPause ? '▶' : '⏸';
      } else {
        window.gameState.enPause = true;
        boutonPause.textContent = '▶';
      }
      if (onPause) onPause();
    });
  }

  if (boutonQuit) {
    boutonQuit.addEventListener('click', () => {
      if (onQuit) onQuit();
    });
  }

  if (onTutorial) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => onTutorial());
    } else {
      onTutorial();
    }
  }

  return {
    updateChronoDisplay,
    startCountdown,
    getTimeForLevel,
    clearTimer,
    setTimeRemaining,
    getTimeRemaining,
  };
}
