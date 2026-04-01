const DEFAULT_SITES = [
  { domain: "reddit.com", exceptions: [] },
  { domain: "twitter.com", exceptions: [] },
  { domain: "x.com", exceptions: [] },
  { domain: "youtube.com", exceptions: [] },
  { domain: "news.ycombinator.com", exceptions: [] },
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("blockedSites", (data) => {
    if (!data.blockedSites) {
      chrome.storage.sync.set({ blockedSites: DEFAULT_SITES });
    }
  });
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;

  let url;
  try {
    url = new URL(details.url);
  } catch {
    return;
  }
  if (url.protocol === "chrome-extension:") return;

  chrome.storage.sync.get("blockedSites", (data) => {
    const sites = data.blockedSites || [];
    const hostname = url.hostname.replace(/^www\./, "");
    const pathname = url.pathname;

    const match = sites.find(
      (s) => hostname === s.domain || hostname.endsWith("." + s.domain)
    );

    if (!match) return;

    // Check if the path matches any exception
    const isExcepted = match.exceptions.some(
      (exc) => pathname === exc || pathname.startsWith(exc + "/")
    );

    if (isExcepted) return;

    chrome.storage.session.get("passthrough", (sessionData) => {
      const passthrough = sessionData.passthrough || {};
      const key = details.tabId.toString();

      // Prune expired passthrough entries
      const now = Date.now();
      for (const [k, v] of Object.entries(passthrough)) {
        if (now - v >= 30000) delete passthrough[k];
      }

      if (passthrough[key] && now - passthrough[key] < 30000) {
        delete passthrough[key];
        chrome.storage.session.set({ passthrough });
        return;
      }

      const pauseUrl =
        chrome.runtime.getURL("pause.html") +
        "?redirect=" +
        encodeURIComponent(details.url);

      chrome.tabs.update(details.tabId, { url: pauseUrl });
    });
  });
});
