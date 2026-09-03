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
import { initNewspaperPagination } from './newspaper.js';

document.addEventListener('DOMContentLoaded', () => {
  initHeroVideos();
  initConsoleControls();
  initCartridgeDock();
  initCartridgeCards();
  initEventStream();
  initNewspaperPagination();

  console.log("⚡ Industrial Hardware Blueprint & Daily Telemetry Pagination Initialized");
});
