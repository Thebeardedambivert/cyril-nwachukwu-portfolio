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
        // Metallic snap - loud, punchy, authoritative
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.055);
        gain.gain.setValueAtTime(0.95, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.055);
      } else if (type === 'slider' || type === 'rotary') {
        // Tactile friction tick - clear and crisp
        osc.type = 'sine';
        osc.frequency.setValueAtTime(460, now);
        gain.gain.setValueAtTime(0.55, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      } else if (type === 'button') {
        // Resonant pushbutton thud - deep, tactile, loud
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.07);
        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      }
    } catch (e) {
      // Audio context policy
    }
  }
}

export const soundFx = new MechanicalAudio();

// 0. Hero Dual 1080p Video Playback Controls
export function initHeroVideos() {
  const chassisList = document.querySelectorAll('.hero-video-chassis');
  chassisList.forEach((chassis) => {
    const video = chassis.querySelector('video');
    const toggleBtn = chassis.querySelector('.video-toggle-btn');
    if (!video) return;

    const togglePlayback = () => {
      soundFx.playClick('button');
      if (video.paused) {
        video.play();
        if (toggleBtn) toggleBtn.textContent = 'PAUSE / PLAY';
      } else {
        video.pause();
        if (toggleBtn) toggleBtn.textContent = 'RESUME ▶';
      }
    };

    if (toggleBtn) toggleBtn.addEventListener('click', togglePlayback);
    video.addEventListener('click', togglePlayback);
  });
}
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

// Helper: Open Oscilloscope Video Monitor with Maximized Audio Volume
export function openVideoModal(videoId, title) {
  const modal = document.getElementById('oscilloscope-modal');
  const videoFrame = document.getElementById('crt-video-frame');
  const titleEl = document.getElementById('modal-project-title');
  const youtubeLink = document.getElementById('modal-youtube-link');

  if (!modal || !videoFrame || !videoId) return;

  soundFx.playClick('rocker');

  if (titleEl) {
    titleEl.textContent = title || 'PROJECT RECOVERY TRACE';
  }

  if (youtubeLink) {
    youtubeLink.href = `https://youtu.be/${videoId}`;
  }

  // Load with YouTube JS API enabled and explicitly bound origin for postMessage volume control
  const origin = encodeURIComponent(window.location.origin || '*');
  videoFrame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=${origin}&playsinline=1`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Actively send volume boost commands (unmute + 100% volume) via YouTube postMessage API
  const sendVolumeBoost = () => {
    try {
      if (videoFrame && videoFrame.contentWindow) {
        videoFrame.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'unMute',
          args: []
        }), '*');
        videoFrame.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [100]
        }), '*');
      }
    } catch (err) {}
  };

  videoFrame.onload = () => {
    sendVolumeBoost();
    setTimeout(sendVolumeBoost, 200);
    setTimeout(sendVolumeBoost, 600);
  };

  setTimeout(sendVolumeBoost, 300);
  setTimeout(sendVolumeBoost, 700);
  setTimeout(sendVolumeBoost, 1400);
  setTimeout(sendVolumeBoost, 2200);
}

// 2. 3D Modular Cartridge Dock Interaction (Videos 2242 & 2244)
export function initCartridgeDock() {
  const primaryCartridge = document.querySelector('.cartridge-primary-unit');
  const miniCartridges = document.querySelectorAll('.cartridge-slot-mini');

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
      if (videoId) {
        openVideoModal(videoId, 'AGENTPIPE: CRASH-SAFE CODING PIPELINE');
      }
    });
  }

  miniCartridges.forEach((mini) => {
    mini.addEventListener('click', () => {
      const videoId = mini.dataset.videoId;
      const title = mini.dataset.projectTitle;
      if (videoId) {
        openVideoModal(videoId, title);
      }
    });
  });
}

// 3. Lower Project Cartridge Hover & Oscilloscope Modal
export function initCartridgeCards() {
  const cards = document.querySelectorAll('.cartridge-card');
  const modal = document.getElementById('oscilloscope-modal');
  const videoFrame = document.getElementById('crt-video-frame');
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
      if (videoId) {
        openVideoModal(videoId, title);
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

  // Auto respond to YouTube iframe ready messages to ensure immediate unmuting and max volume
  window.addEventListener('message', (event) => {
    try {
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        if (data.event === 'onReady' || data.infoDelivery) {
          if (videoFrame && videoFrame.contentWindow) {
            videoFrame.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: 'unMute',
              args: []
            }), '*');
            videoFrame.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: 'setVolume',
              args: [100]
            }), '*');
          }
        }
      }
    } catch (e) {}
  });

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
