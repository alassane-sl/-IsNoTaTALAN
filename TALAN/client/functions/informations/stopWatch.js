'use strict';

import { win } from '../functions/modal/win.js';

export function stopWatch() {
  setInterval(win(), 10000);
  window.gameState.enPause = true;
}
