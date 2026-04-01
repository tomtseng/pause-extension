const siteList = document.getElementById("siteList");
const newSiteInput = document.getElementById("newSite");
const addBtn = document.getElementById("addBtn");

function save(sites, callback) {
  chrome.storage.sync.set({ blockedSites: sites }, callback);
}

function render(sites) {
  siteList.innerHTML = "";
  if (sites.length === 0) {
    siteList.innerHTML = '<li class="empty">No sites blocked</li>';
    return;
  }
  sites.forEach((entry, idx) => {
    const li = document.createElement("li");
    li.className = "site-entry";

    // Domain row
    const header = document.createElement("div");
    header.className = "site-header";

    const domain = document.createElement("span");
    domain.className = "site-domain";
    domain.textContent = entry.domain;

    const actions = document.createElement("div");
    actions.className = "site-actions";

    const excBtn = document.createElement("button");
    excBtn.className = "icon-btn";
    excBtn.textContent = "+ except";
    excBtn.title = "Add a path exception";
    excBtn.addEventListener("click", () => {
      toggleExcInput(li, sites, idx);
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "icon-btn remove";
    removeBtn.textContent = "\u00d7";
    removeBtn.addEventListener("click", () => {
      sites.splice(idx, 1);
      save(sites, () => render(sites));
    });

    actions.appendChild(excBtn);
    actions.appendChild(removeBtn);
    header.appendChild(domain);
    header.appendChild(actions);
    li.appendChild(header);

    // Show existing exceptions
    if (entry.exceptions.length > 0) {
      const excList = document.createElement("div");
      excList.className = "exceptions";
      entry.exceptions.forEach((exc) => {
        const item = document.createElement("div");
        item.className = "exception-item";

        const label = document.createElement("span");
        label.textContent = "allow " + exc;
        item.appendChild(label);

        const rmBtn = document.createElement("button");
        rmBtn.className = "remove-exc";
        rmBtn.textContent = "\u00d7";
        rmBtn.addEventListener("click", () => {
          entry.exceptions = entry.exceptions.filter((e) => e !== exc);
          save(sites, () => render(sites));
        });

        item.appendChild(rmBtn);
        excList.appendChild(item);
      });
      li.appendChild(excList);
    }

    siteList.appendChild(li);
  });
}

function toggleExcInput(li, sites, idx) {
  if (li.querySelector(".add-exc-row")) return;
  const row = document.createElement("div");
  row.className = "add-exc-row";
  const input = document.createElement("input");
  input.placeholder = "/messages";
  const btn = document.createElement("button");
  btn.textContent = "Add";

  function addException() {
    let path = input.value.trim();
    if (!path) return;
    if (!path.startsWith("/")) path = "/" + path;
    // Remove trailing slash
    path = path.replace(/\/+$/, "");
    if (sites[idx].exceptions.includes(path)) return;
    sites[idx].exceptions.push(path);
    save(sites, () => render(sites));
  }

  btn.addEventListener("click", addException);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addException();
  });

  row.appendChild(input);
  row.appendChild(btn);
  li.appendChild(row);
  input.focus();
}

chrome.storage.sync.get("blockedSites", (data) => {
  render(data.blockedSites || []);
});

addBtn.addEventListener("click", addSite);
newSiteInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addSite();
});

function addSite() {
  const domain = newSiteInput.value
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
  if (!domain) return;

  chrome.storage.sync.get("blockedSites", (data) => {
    const sites = data.blockedSites || [];
    if (sites.some((s) => s.domain === domain)) return;
    sites.push({ domain, exceptions: [] });
    save(sites, () => {
      render(sites);
      newSiteInput.value = "";
    });
  });
}
