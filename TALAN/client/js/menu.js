document.addEventListener('DOMContentLoaded', function () {
  const characterBlocks = document.querySelectorAll('.character-block');
  const playButton = document.getElementById('play-button');
  let selectedCharacter = 1;

  // UI helpers
  function resetHighlight() {
    characterBlocks.forEach((b) => {
      b.style.borderColor = 'transparent';
      b.style.boxShadow = 'none';
    });
  }

  function highlightBlock(block) {
    block.style.borderColor = 'lime';
    block.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3)';
  }

  function getCharacterId(block) {
    return parseInt(block.dataset.character);
  }

  // Events
  characterBlocks.forEach(function (block) {
    block.addEventListener('click', function () {
      resetHighlight();
      highlightBlock(block);
      selectedCharacter = getCharacterId(block);
    });
    block.addEventListener('mouseover', function () {
      if (getCharacterId(block) !== selectedCharacter) {
        block.style.borderColor = 'lime';
      }
    });
    block.addEventListener('mouseout', function () {
      if (getCharacterId(block) !== selectedCharacter) {
        block.style.borderColor = 'transparent';
      }
    });
  });

  playButton.addEventListener('click', function () {
    window.location.href = 'index.html';
  });

  // Init
  if (characterBlocks.length > 0) {
    highlightBlock(characterBlocks[0]);
  }
});
