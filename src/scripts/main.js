// ==========================================================================
// MAIN ENTRY POINT
// ==========================================================================
import { 
  initHeroVideos,
  initConsoleControls,
  initCartridgeDock,
  initCartridgeCards
} from './hardware.js';
import { initEventStream } from './sandbox.js';

document.addEventListener('DOMContentLoaded', () => {
  initHeroVideos();
  initConsoleControls();
  initCartridgeDock();
  initCartridgeCards();
  initEventStream();

  console.log("⚡ Industrial Hardware Blueprint & Dual 1080p Videos Initialized");
});
