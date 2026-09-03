// ==========================================================================
// HARDWARE SKEUOMORPHIC CONTROLS & OSCILLOSCOPE MODAL LOGIC
// Mechanical sound synthesis, interactive rockers, fader tracks, and analog dials
// ==========================================================================

// 1. Web Audio API Mechanical Sound Synthesizer (Zero External Audio Files)
class MechanicalAudio {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playClick(type = 'rocker') {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      if (type === 'rocker') {
        // Crisp physical snap
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'slider') {
        // Subtle tactile friction tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
      }
    } catch (e) {
      // Audio context silently fails if restricted by browser policy
    }
  }
}

const soundFx = new MechanicalAudio();

// 2. Interactive Rocker Switches
export function initRockerSwitches() {
  const switches = document.querySelectorAll('.rocker-switch');
  switches.forEach((sw) => {
    sw.addEventListener('click', () => {
      soundFx.playClick('rocker');
      sw.classList.toggle('active');
      
      const targetSystem = sw.dataset.system;
      const isActive = sw.classList.contains('active');
      
      // Update matching LED diode if present
      const led = document.querySelector(`.led-bulb[data-system="${targetSystem}"]`);
      if (led) {
        if (isActive) {
          led.classList.add('green');
          led.classList.remove('yellow', 'red');
        } else {
          led.classList.remove('green');
          led.classList.add('yellow');
        }
      }
    });
  });
}

// 3. Knurled Fader Sliders driving Analog Dials
export function initFadersAndGauges() {
  const faderRows = document.querySelectorAll('.fader-row');

  faderRows.forEach((row) => {
    const track = row.querySelector('.fader-track');
    const knob = row.querySelector('.fader-knob');
    const fill = row.querySelector('.fader-fill');
    const readout = row.querySelector('.fader-value');
    const gaugeId = row.dataset.gaugeTarget;
    const needle = document.getElementById(gaugeId);
    const gaugeValDisplay = document.querySelector(`.gauge-readout[data-gauge="${gaugeId}"]`);

    let isDragging = false;

    const updatePosition = (clientX) => {
      const rect = track.getBoundingClientRect();
      let offsetX = clientX - rect.left;
      let percentage = Math.max(0, Math.min(1, offsetX / rect.width));

      knob.style.left = `${percentage * 100}%`;
      fill.style.width = `${percentage * 100}%`;

      const displayVal = Math.round(percentage * 100);
      if (readout) readout.textContent = `${displayVal}%`;

      // Update Analog Needle Gauge (-60deg to +60deg sweep)
      if (needle) {
        const angle = -60 + percentage * 120;
        needle.style.transform = `rotate(${angle}deg)`;
      }

      if (gaugeValDisplay) {
        if (gaugeId === 'needle-throughput') {
          gaugeValDisplay.textContent = `${Math.round(percentage * 2400)} t/s`;
        } else if (gaugeId === 'needle-latency') {
          gaugeValDisplay.textContent = `${Math.round(15 + percentage * 180)}ms`;
        } else if (gaugeId === 'needle-memory') {
          gaugeValDisplay.textContent = `${Math.round(percentage * 100)}%`;
        }
      }
    };

    track.addEventListener('mousedown', (e) => {
      isDragging = true;
      soundFx.playClick('slider');
      updatePosition(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        updatePosition(e.clientX);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
      }
    });

    // Touch support
    track.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches[0]) updatePosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches[0]) {
        updatePosition(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  });
}

// 4. 3D Isometric Mouse Tilt for Project Cartridges
export function initCartridgeHoverPhysics() {
  const cards = document.querySelectorAll('.cartridge-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotateX = (-y / rect.height) * 10;
      const rotateY = (x / rect.width) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

// 5. Hardware Oscilloscope Video Monitor Modal
export function initOscilloscopeModal() {
  const modal = document.getElementById('oscilloscope-modal');
  const videoFrame = document.getElementById('crt-video-frame');
  const titleEl = document.getElementById('modal-project-title');
  const closeBtn = document.getElementById('close-modal-btn');
  const cards = document.querySelectorAll('.cartridge-card');

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const videoId = card.dataset.videoId;
      const title = card.dataset.projectTitle;

      if (videoId && modal && videoFrame) {
        soundFx.playClick('rocker');
        titleEl.textContent = title || 'PROJECT RECOVERY TRACE';
        videoFrame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeModal = () => {
    if (modal) {
      soundFx.playClick('rocker');
      modal.classList.remove('open');
      if (videoFrame) videoFrame.src = '';
      document.body.style.overflow = '';
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });
}
