const MODE_ALIASES = {
  0: 'normal',
  1: 'infinity',
  2: 'hardcore',
  normal: 'normal',
  infinity: 'infinity',
  hardcore: 'hardcore',
};

export function normalizeMode(mode) {
  if (!mode) return 'normal';
  return MODE_ALIASES[mode] || 'normal';
}

export function getSelectedMode() {
  return normalizeMode(localStorage.getItem('selectedMode'));
}

export function setSelectedMode(mode) {
  localStorage.setItem('selectedMode', normalizeMode(mode));
}

export function getSelectedCharacterSrc() {
  return localStorage.getItem('selectedCharacterSrc');
}

export function setSelectedCharacterSrc(src) {
  if (!src) return;
  localStorage.setItem('selectedCharacterSrc', src);
}
