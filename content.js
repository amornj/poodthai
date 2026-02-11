if (window.__poodthaiLoaded) {
  // Already injected — skip re-init
} else {
window.__poodthaiLoaded = true;
(() => {
  const DEFAULTS = { speed: 1, volume: 1 };
  let settings = { ...DEFAULTS };
  let sentences = [];
  let currentIndex = 0;
  let isPaused = false;
  let isSpeaking = false;
  let playerEl = null;

  // ── Settings ──────────────────────────────────────────────
  function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULTS, (s) => {
        settings = s;
        resolve();
      });
    });
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.speed) settings.speed = changes.speed.newValue;
    if (changes.volume) settings.volume = changes.volume.newValue;
  });

  // ── Thai voice selection ──────────────────────────────────
  function getThaiVoice() {
    const voices = speechSynthesis.getVoices();
    const thai = voices.filter((v) => v.lang.startsWith("th"));
    // Prefer Google Thai voice for quality
    return (
      thai.find((v) => v.name.includes("Google")) ||
      thai.find((v) => v.localService === false) ||
      thai[0] ||
      null
    );
  }

  // Ensure voices are loaded
  function waitForVoices() {
    return new Promise((resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length) return resolve();
      speechSynthesis.onvoiceschanged = () => resolve();
    });
  }

  // ── Text splitting ────────────────────────────────────────
  function splitSentences(text) {
    // Split Thai text by common sentence-ending patterns
    const parts = text
      .split(/(?<=[ๆฯ।\.\!\?\n])\s*|(?<=\s{2,})/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    // If no splits, chunk by ~200 chars at space boundaries
    if (parts.length === 1 && parts[0].length > 200) {
      const chunks = [];
      let remaining = parts[0];
      while (remaining.length > 200) {
        let cut = remaining.lastIndexOf(" ", 200);
        if (cut <= 0) cut = 200;
        chunks.push(remaining.slice(0, cut).trim());
        remaining = remaining.slice(cut).trim();
      }
      if (remaining) chunks.push(remaining);
      return chunks;
    }
    return parts;
  }

  // ── Player UI ─────────────────────────────────────────────
  function createPlayer() {
    if (playerEl) return;

    playerEl = document.createElement("div");
    playerEl.id = "poodthai-player";
    playerEl.innerHTML = `
      <div class="poodthai-inner">
        <div class="poodthai-brand">พูดไทย</div>
        <div class="poodthai-text-display"></div>
        <div class="poodthai-controls">
          <button class="poodthai-btn" data-action="prev" title="Previous sentence">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button class="poodthai-btn poodthai-play-btn" data-action="play" title="Play / Pause">
            <svg class="icon-play" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <svg class="icon-pause" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>
          </button>
          <button class="poodthai-btn" data-action="next" title="Next sentence">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2 0h2V6h-2v12z" transform="scale(-1,1) translate(-24,0)"/></svg>
          </button>
          <button class="poodthai-btn" data-action="stop" title="Stop">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
          </button>
          <div class="poodthai-speed">
            <label>Speed</label>
            <input type="range" min="0.5" max="2" step="0.1" class="poodthai-speed-slider">
            <span class="poodthai-speed-val"></span>
          </div>
          <div class="poodthai-volume">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
            <input type="range" min="0" max="1" step="0.05" class="poodthai-volume-slider">
          </div>
        </div>
        <button class="poodthai-close" data-action="close" title="Close">&times;</button>
      </div>
    `;

    document.documentElement.appendChild(playerEl);

    // Wire controls
    playerEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === "play") togglePause();
      else if (action === "stop") stopSpeaking();
      else if (action === "close") closePlayer();
      else if (action === "prev") prevSentence();
      else if (action === "next") nextSentence();
    });

    const speedSlider = playerEl.querySelector(".poodthai-speed-slider");
    speedSlider.value = settings.speed;
    playerEl.querySelector(".poodthai-speed-val").textContent =
      settings.speed + "x";
    speedSlider.addEventListener("input", (e) => {
      settings.speed = parseFloat(e.target.value);
      playerEl.querySelector(".poodthai-speed-val").textContent =
        settings.speed.toFixed(1) + "x";
      chrome.storage.sync.set({ speed: settings.speed });
      // Restart current sentence at new speed
      if (isSpeaking) speakCurrent();
    });

    const volSlider = playerEl.querySelector(".poodthai-volume-slider");
    volSlider.value = settings.volume;
    volSlider.addEventListener("input", (e) => {
      settings.volume = parseFloat(e.target.value);
      chrome.storage.sync.set({ volume: settings.volume });
      if (isSpeaking) speakCurrent();
    });
  }

  function updatePlayButton(playing) {
    if (!playerEl) return;
    const iconPlay = playerEl.querySelector(".icon-play");
    const iconPause = playerEl.querySelector(".icon-pause");
    iconPlay.style.display = playing ? "none" : "block";
    iconPause.style.display = playing ? "block" : "none";
  }

  function updateTextDisplay(text) {
    if (!playerEl) return;
    const display = playerEl.querySelector(".poodthai-text-display");
    display.textContent = text || "";
  }

  function showPlayer() {
    createPlayer();
    playerEl.classList.add("poodthai-visible");
  }

  function closePlayer() {
    stopSpeaking();
    if (playerEl) {
      playerEl.classList.remove("poodthai-visible");
    }
  }

  // ── Speech control ────────────────────────────────────────
  async function startSpeaking(text) {
    await loadSettings();
    await waitForVoices();

    const voice = getThaiVoice();
    if (!voice) {
      showPlayer();
      updateTextDisplay(
        "No Thai voice found! Open Poodthai popup for setup instructions."
      );
      updatePlayButton(false);
      return;
    }

    speechSynthesis.cancel();
    sentences = splitSentences(text);
    currentIndex = 0;
    isPaused = false;
    isSpeaking = true;

    showPlayer();
    updatePlayButton(true);
    speakCurrent();
  }

  function speakCurrent() {
    if (currentIndex >= sentences.length) {
      isSpeaking = false;
      updatePlayButton(false);
      updateTextDisplay("");
      return;
    }

    speechSynthesis.cancel();
    const text = sentences[currentIndex];
    updateTextDisplay(text);

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "th-TH";
    const voice = getThaiVoice();
    if (voice) utter.voice = voice;
    utter.rate = settings.speed;
    utter.volume = settings.volume;

    utter.onend = () => {
      if (!isPaused) {
        currentIndex++;
        speakCurrent();
      }
    };

    utter.onerror = (e) => {
      if (e.error !== "canceled") {
        currentIndex++;
        speakCurrent();
      }
    };

    speechSynthesis.speak(utter);
  }

  function togglePause() {
    if (!isSpeaking && !isPaused) return;
    if (isPaused) {
      isPaused = false;
      speechSynthesis.resume();
      updatePlayButton(true);
    } else {
      isPaused = true;
      speechSynthesis.pause();
      updatePlayButton(false);
    }
  }

  function stopSpeaking() {
    speechSynthesis.cancel();
    isSpeaking = false;
    isPaused = false;
    sentences = [];
    currentIndex = 0;
    updatePlayButton(false);
    updateTextDisplay("");
  }

  function nextSentence() {
    if (currentIndex < sentences.length - 1) {
      currentIndex++;
      speakCurrent();
    }
  }

  function prevSentence() {
    if (currentIndex > 0) {
      currentIndex--;
      speakCurrent();
    }
  }

  // ── Message handling ──────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "speak" && msg.text) {
      startSpeaking(msg.text);
    } else if (msg.action === "speak-selection") {
      const sel = window.getSelection().toString().trim();
      if (sel) startSpeaking(sel);
    }
  });
})();
} // end __poodthaiLoaded guard
