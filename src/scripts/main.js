// ==========================================================================
// MAIN ENTRY POINT
// ==========================================================================
import { 
  initConsoleControls,
  initCartridgeDock,
  initCartridgeCards
} from './hardware.js';
import { initEventStream } from './sandbox.js';

document.addEventListener('DOMContentLoaded', () => {
  initConsoleControls();
  initCartridgeDock();
  initCartridgeCards();
  initEventStream();

  console.log("⚡ Industrial Hardware Blueprint & Synthesizer Deck Initialized");
});
