const speedSlider = document.getElementById("speed");
const speedVal = document.getElementById("speed-val");
const volumeSlider = document.getElementById("volume");
const volumeVal = document.getElementById("volume-val");
const voiceNameEl = document.getElementById("voice-name");
const noVoiceGuide = document.getElementById("no-voice-guide");

// Load saved settings
chrome.storage.sync.get({ speed: 1, volume: 1 }, (s) => {
  speedSlider.value = s.speed;
  speedVal.textContent = parseFloat(s.speed).toFixed(1) + "x";
  volumeSlider.value = s.volume;
  volumeVal.textContent = Math.round(s.volume * 100) + "%";
});

speedSlider.addEventListener("input", () => {
  const v = parseFloat(speedSlider.value);
  speedVal.textContent = v.toFixed(1) + "x";
  chrome.storage.sync.set({ speed: v });
});

volumeSlider.addEventListener("input", () => {
  const v = parseFloat(volumeSlider.value);
  volumeVal.textContent = Math.round(v * 100) + "%";
  chrome.storage.sync.set({ volume: v });
});

// Detect OS for setup guide
function showOsGuide() {
  const ua = navigator.userAgent;
  if (ua.includes("Mac")) {
    document.getElementById("guide-mac").style.display = "block";
    document.getElementById("guide-win").style.display = "none";
    document.getElementById("guide-linux").style.display = "none";
  } else if (ua.includes("Win")) {
    document.getElementById("guide-mac").style.display = "none";
    document.getElementById("guide-win").style.display = "block";
    document.getElementById("guide-linux").style.display = "none";
  } else {
    document.getElementById("guide-mac").style.display = "none";
    document.getElementById("guide-win").style.display = "none";
    document.getElementById("guide-linux").style.display = "block";
  }
}

// Detect Thai voice
function detectVoice() {
  const voices = speechSynthesis.getVoices();
  const thai = voices.filter((v) => v.lang.startsWith("th"));
  const best =
    thai.find((v) => v.name.includes("Google")) ||
    thai.find((v) => !v.localService) ||
    thai[0];

  if (best) {
    voiceNameEl.textContent = best.name;
    voiceNameEl.style.color = "#059669";
    noVoiceGuide.style.display = "none";
  } else {
    voiceNameEl.textContent = "Not found";
    voiceNameEl.style.color = "#dc2626";
    noVoiceGuide.style.display = "block";
    showOsGuide();
  }
}

// Voices may load asynchronously — try multiple times
function tryDetectVoice(attempts) {
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0 || attempts <= 0) {
    detectVoice();
  } else {
    setTimeout(() => tryDetectVoice(attempts - 1), 200);
  }
}

speechSynthesis.onvoiceschanged = () => detectVoice();
tryDetectVoice(10);
