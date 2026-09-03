// ==========================================================================
// HARDWARE SKEUOMORPHIC CONTROLS & OSCILLOSCOPE MODAL LOGIC
// Mechanical sound synthesis, interactive rockers, console toggles, faders, and dials
// ==========================================================================

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

      if (type === 'rocker' || type === 'toggle') {
        // Metallic snap
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.04);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'slider' || type === 'rotary') {
        // Subtle tactile friction tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(360, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
      } else if (type === 'button') {
        // Dampened pushbutton thud
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      // Audio context policy
    }
  }
}

export const soundFx = new MechanicalAudio();

// 1. Interactive Synthesizer Console (Video 2244 & Hero)
export function initConsoleControls() {
  // Chrome metal bat toggles
  const batUnits = document.querySelectorAll('.chrome-bat-unit');
  batUnits.forEach((unit) => {
    unit.addEventListener('click', () => {
      soundFx.playClick('toggle');
      unit.classList.toggle('active');
    });
  });

  // Black pushbutton
  const blackBtn = document.querySelector('.push-btn-black');
  if (blackBtn) {
    blackBtn.addEventListener('click', () => {
      soundFx.playClick('button');
    });
  }

  // Orange dome indicator button
  const orangeDome = document.querySelector('.orange-dome-indicator');
  if (orangeDome) {
    orangeDome.addEventListener('click', () => {
      soundFx.playClick('button');
      orangeDome.style.boxShadow = '0 0 25px #ff5500, inset 0 1px 2px #fff';
      setTimeout(() => {
        orangeDome.style.boxShadow = '';
      }, 400);
    });
  }

  // Console rotary dial knob
  const rotary = document.querySelector('.rotary-knob-casing');
  if (rotary) {
    let currentAngle = 0;
    rotary.addEventListener('click', () => {
      soundFx.playClick('rotary');
      currentAngle = (currentAngle + 30) % 360;
      rotary.style.transform = `rotate(${currentAngle}deg)`;
    });
  }

  // Console Slotted Fader Tracks
  const grooveRows = document.querySelectorAll('.groove-slider-row');
  grooveRows.forEach((row) => {
    const groove = row.querySelector('.slider-groove');
    const knob = row.querySelector('.knurled-fader-knob');
    const targetGauge = row.dataset.gaugeTarget;
    const needle = document.getElementById(targetGauge);

    let isDragging = false;

    const updateSlider = (clientX) => {
      const rect = groove.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const pct = Math.max(0, Math.min(1, offsetX / rect.width));

      knob.style.left = `${pct * 100}%`;
      soundFx.playClick('slider');

      if (needle) {
        const angle = -60 + pct * 120;
        needle.style.transform = `rotate(${angle}deg)`;
      }

      const readout = document.querySelector(`.gauge-readout[data-gauge="${targetGauge}"]`);
      if (readout) {
        if (targetGauge === 'needle-throughput') {
          readout.textContent = `${Math.round(pct * 2400)} t/s`;
        } else if (targetGauge === 'needle-latency') {
          readout.textContent = `${Math.round(15 + pct * 180)}ms`;
        }
      }
    };

    groove.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) updateSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) isDragging = false;
    });

    // Touch support
    groove.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches[0]) updateSlider(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches[0]) updateSlider(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  });
}

// 2. 3D Modular Cartridge Dock Interaction (Videos 2242 & 2244)
export function initCartridgeDock() {
  const primaryCartridge = document.querySelector('.cartridge-primary-unit');
  const miniCartridges = document.querySelectorAll('.cartridge-slot-mini');
  const modal = document.getElementById('oscilloscope-modal');
  const videoFrame = document.getElementById('crt-video-frame');
  const titleEl = document.getElementById('modal-project-title');

  if (primaryCartridge) {
    primaryCartridge.addEventListener('click', () => {
      soundFx.playClick('rocker');
      // Elevate in 3D
      primaryCartridge.style.transform = 'rotateX(4deg) translateY(-28px) scale(1.04)';
      setTimeout(() => {
        primaryCartridge.style.transform = '';
      }, 500);

      // Open Video Modal if videoId exists or show agentpipe repo
      const videoId = primaryCartridge.dataset.videoId;
      if (videoId && modal && videoFrame) {
        titleEl.textContent = 'AGENTPIPE: CRASH-SAFE CODING PIPELINE';
        videoFrame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  miniCartridges.forEach((mini) => {
    mini.addEventListener('click', () => {
      soundFx.playClick('rocker');
      const videoId = mini.dataset.videoId;
      const title = mini.dataset.projectTitle;

      if (videoId && modal && videoFrame) {
        titleEl.textContent = title || 'PROJECT RECOVERY TRACE';
        videoFrame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });
}

// 3. Lower Project Cartridge Hover & Oscilloscope Modal
export function initCartridgeCards() {
  const cards = document.querySelectorAll('.cartridge-card');
  const modal = document.getElementById('oscilloscope-modal');
  const videoFrame = document.getElementById('crt-video-frame');
  const titleEl = document.getElementById('modal-project-title');
  const closeBtn = document.getElementById('close-modal-btn');

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
