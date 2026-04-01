const params = new URLSearchParams(window.location.search);
const redirectUrl = params.get("redirect");

// Show destination
const dest = document.getElementById("destination");
try {
  dest.textContent = new URL(redirectUrl).hostname;
} catch {
  dest.textContent = redirectUrl;
}

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
