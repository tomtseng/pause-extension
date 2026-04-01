const params = new URLSearchParams(window.location.search);
const redirectUrl = params.get("redirect");

// Validate redirect URL
const dest = document.getElementById("destination");
let redirectHost = "";
try {
  const parsed = new URL(redirectUrl);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("bad protocol");
  }
  redirectHost = parsed.hostname;
} catch {
  dest.textContent = "invalid URL";
  document.getElementById("timer").style.display = "none";
  throw new Error("Invalid redirect URL");
}

dest.textContent = redirectHost;

function proceed() {
  // Set passthrough flag so background.js allows this navigation
  chrome.storage.session.get("passthrough", (data) => {
    const passthrough = data.passthrough || {};
    chrome.tabs.getCurrent((tab) => {
      if (tab) {
        passthrough[tab.id.toString()] = Date.now();
      }
      chrome.storage.session.set({ passthrough }, () => {
        window.location.href = redirectUrl;
      });
    });
  });
}

// Countdown
let remaining = 10;
const timerEl = document.getElementById("timer");

const interval = setInterval(() => {
  remaining--;
  timerEl.textContent = remaining;

  if (remaining <= 0) {
    clearInterval(interval);
    proceed();
  }
}, 1000);
