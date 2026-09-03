// ==========================================================================
// MAIN ENTRY POINT
// ==========================================================================
import { 
  initRockerSwitches, 
  initFadersAndGauges, 
  initCartridgeHoverPhysics, 
  initOscilloscopeModal 
} from './hardware.js';
import { initEventStream } from './sandbox.js';

document.addEventListener('DOMContentLoaded', () => {
  initRockerSwitches();
  initFadersAndGauges();
  initCartridgeHoverPhysics();
  initOscilloscopeModal();
  initEventStream();

  console.log("⚡ Industrial Hardware Portfolio & The Daily Telemetry Initialized");
});
