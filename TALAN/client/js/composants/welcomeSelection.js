import {
  setSelectedCharacterSrc,
  setSelectedMode,
  getSelectedMode,
} from './storage.js';

function selectItem(list, index) {
  for (let i = 0; i < list.length; i++) {
    if (i === index) {
      list[i].style.outline = '2px solid #00ff78';
      list[i].style.outlineOffset = '4px';
    } else {
      list[i].style.outline = 'none';
    }
  }
}

function restoreSelection(list, index) {
  if (list[index]) selectItem(list, index);
}

export function initWelcomeSelection({
  characters,
  normalButton,
  infinityButton,
  hardcoreButton,
}) {
  const storedMode = getSelectedMode();
  const loadingAudio = document.getElementById('loading-audio');
  let isLoading = false;

  const savedCharacter = parseInt(
    localStorage.getItem('selectedCharacter'),
    10,
  );
  if (!Number.isNaN(savedCharacter)) {
    restoreSelection(characters, savedCharacter);
    const imgAtLoad = characters[savedCharacter]?.querySelector('img');
    if (imgAtLoad) setSelectedCharacterSrc(imgAtLoad.getAttribute('src'));
  }

  characters.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      selectItem(characters, index);
      localStorage.setItem('selectedCharacter', String(index));
      const img = btn.querySelector('img');
      if (img) setSelectedCharacterSrc(img.getAttribute('src'));
    });
  });

  function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';

    const box = document.createElement('div');
    box.className = 'loading-box';

    const title = document.createElement('h2');
    title.className = 'loading-title';
    title.textContent = 'Chargement...';

    const bar = document.createElement('div');
    bar.className = 'loading-bar';

    const fill = document.createElement('div');
    fill.className = 'loading-bar-fill';
    bar.appendChild(fill);

    const percent = document.createElement('div');
    percent.className = 'loading-percent';
    percent.textContent = '0%';

    box.appendChild(title);
    box.appendChild(bar);
    box.appendChild(percent);
    overlay.appendChild(box);

    return { overlay, fill, percent };
  }

  function startLoading(mode) {
    if (isLoading) return;
    isLoading = true;
    setSelectedMode(mode);

    const { overlay, fill, percent } = createLoadingOverlay();
    document.body.appendChild(overlay);

    if (loadingAudio) {
      loadingAudio.currentTime = 0;
      loadingAudio.play().catch(() => {});
    }

    const durationMs = 15 * 1000;
    const start = Date.now();

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / durationMs);
      const value = Math.floor(progress * 100);
      fill.style.width = `${value}%`;
      percent.textContent = `${value}%`;
    }, 100);

    setTimeout(() => {
      clearInterval(intervalId);
      fill.style.width = '100%';
      percent.textContent = '100%';
      if (loadingAudio) {
        loadingAudio.pause();
        loadingAudio.currentTime = 0;
      }
      window.location.href = 'index.html';
    }, durationMs);
  }

  normalButton?.addEventListener('click', () => startLoading('normal'));
  infinityButton?.addEventListener('click', () => startLoading('infinity'));
  hardcoreButton?.addEventListener('click', () => startLoading('hardcore'));

  if (storedMode === 'normal') normalButton?.classList.add('selected');
  if (storedMode === 'infinity') infinityButton?.classList.add('selected');
  if (storedMode === 'hardcore') hardcoreButton?.classList.add('selected');
}
