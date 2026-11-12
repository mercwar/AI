/*
 * AIFVS-ARTIFACT
 * @id: AVIS-STUDIO-UI-004
 * @version: 1.3.0
 * @nexus_root: NEXUS.ROOT.V3
 * @visibility: PUBLIC_INDEX
 * @deps: [AVIS-STUDIO-ENGINE-003]
 * @description: Server .ref catalog loader, DOM controller, and clipboard/download handlers.
 */

const loadedPacks = [];
let serverCatalog = [];
let statusTimer = null;

function syncResourceUI() {
  const pillsEl = document.getElementById("resourcePackPills");
  const textareaEl = document.getElementById("initialHeaders");
  const countEl = document.getElementById("headerCount");

  const allBlocks = [];
  if (pillsEl) pillsEl.innerHTML = "";

  loadedPacks.forEach((pack, index) => {
    allBlocks.push(...pack.headers);

    if (pillsEl) {
      const pill = document.createElement("span");
      pill.className = "pill";
      pill.innerHTML = `${pack.label} (${pack.headers.length} headers) <button type="button" title="Remove pack">&times;</button>`;
      pill.querySelector("button").addEventListener("click", () => {
        loadedPacks.splice(index, 1);
        syncResourceUI();
        buildPrompt();
      });
      pillsEl.appendChild(pill);
    }
  });

  if (textareaEl) textareaEl.value = allBlocks.join("\n");
  if (countEl) countEl.textContent = allBlocks.length;
}

function setStatus(msg) {
  const statusEl = document.getElementById("status");
  if (!statusEl) return;
  statusEl.textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    statusEl.textContent = "";
  }, 4000);
}

function buildPrompt() {
  const projectEl = document.getElementById("projectName");
  const roleEl = document.getElementById("windowRole");
  const stackEl = document.getElementById("targetStack");
  const dirEl = document.getElementById("directories");
  const headersEl = document.getElementById("initialHeaders");
  const outputEl = document.getElementById("output");
  const countEl = document.getElementById("headerCount");

  if (!outputEl) return;

  const dirs = dirEl
    ? dirEl.value.split(",").map(s => s.trim()).filter(Boolean)
    : ["/VERSION 1/", "/VERSION 2/", "/VERSION 3/", "/dl/", "/SYMBOLIC/", "/GEMINI/"];

  const currentHeaders = headersEl ? headersEl.value : "";
  const headerMatches = currentHeaders.match(/AIFVS-HEADER/g);
  if (countEl) countEl.textContent = headerMatches ? headerMatches.length : 0;

  outputEl.value = generateAvisPasteProgrammer({
    projectName: projectEl ? projectEl.value.trim() : "Mercwar AVIS Workspace",
    windowRole: roleEl ? roleEl.value : "AVIS Header/Body Build Engine",
    targetStack: stackEl ? stackEl.value.trim() : "Vanilla JS / HTML5 / JSON",
    directories: dirs,
    initialHeaders: currentHeaders
  });
}

async function initServerCatalog() {
  const selectEl = document.getElementById("serverPackSelect");
  if (!selectEl) return;

  try {
    const response = await fetch("app/resources/index.json?v=" + Date.now());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    serverCatalog = Array.isArray(data.packs) ? data.packs : [];

    selectEl.innerHTML = "";
    if (serverCatalog.length === 0) {
      selectEl.innerHTML = '<option value="">No packs listed in resources/index.json</option>';
      return;
    }

    serverCatalog.forEach(pack => {
      const opt = document.createElement("option");
      opt.value = pack.path;
      opt.textContent = pack.label;
      selectEl.appendChild(opt);
    });
  } catch (err) {
    selectEl.innerHTML = '<option value="">Server catalog unavailable (serve over HTTP)</option>';
    console.warn("[AVIS Studio] Could not fetch resources/index.json:", err);
  }
}

async function fetchServerRefPack(packPath, packLabel) {
  if (!packPath) {
    setStatus("Select a .ref pack from the dropdown first.");
    return;
  }

  try {
    const response = await fetch(packPath + "?v=" + Date.now());
    if (!response.ok) throw new Error(`Failed to fetch ${packPath} (HTTP ${response.status})`);
    const text = await response.text();
    const blocks = extractHeadersFromFile(packPath, text);

    // Replace existing pack with the same label if already loaded
    const existingIdx = loadedPacks.findIndex(p => p.label === packLabel);
    if (existingIdx !== -1) loadedPacks.splice(existingIdx, 1);

    loadedPacks.push({
      label: packLabel,
      headers: blocks
    });

    syncResourceUI();
    buildPrompt();
    setStatus(`Loaded ${blocks.length} header(s) from ${packLabel}.`);
  } catch (err) {
    setStatus(`Error loading ${packPath}: ${err.message}`);
  }
}

async function ingestLocalFileList(fileList) {
  const allowedExt = /\.(ref|txt|json|js|html|md)$/i;
  const validFiles = Array.from(fileList).filter(f => allowedExt.test(f.name));

  if (validFiles.length === 0) {
    setStatus("No supported files (.ref, .json, .js, .html, .txt) found.");
    return;
  }

  const extractedBlocks = [];
  const label = validFiles.length === 1 ? validFiles[0].name : `${validFiles.length} Local Files`;

  for (const file of validFiles) {
    const text = await file.text();
    const relPath = file.webkitRelativePath || file.name;
    extractedBlocks.push(...extractHeadersFromFile(relPath, text));
  }

  loadedPacks.push({ label, headers: extractedBlocks });
  syncResourceUI();
  buildPrompt();
  setStatus(`Loaded ${extractedBlocks.length} header(s) from ${label}.`);
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function bindEvent(id, eventName, handler) {
  const el = document.getElementById(id);
  if (!el) return null;
  el.addEventListener(eventName, handler);
  return el;
}

document.addEventListener("DOMContentLoaded", () => {
  initServerCatalog();

  bindEvent("loadServerPackBtn", "click", () => {
    const selectEl = document.getElementById("serverPackSelect");
    if (!selectEl || !selectEl.value) return;
    const selectedText = selectEl.options[selectEl.selectedIndex].textContent;
    fetchServerRefPack(selectEl.value, selectedText);
  });

  bindEvent("loadAllServerPacksBtn", "click", async () => {
    if (serverCatalog.length === 0) {
      setStatus("No server packs available to load.");
      return;
    }
    for (const pack of serverCatalog) {
      await fetchServerRefPack(pack.path, pack.label);
    }
    setStatus(`Loaded all ${serverCatalog.length} server .ref packs.`);
  });

  const folderInput = document.getElementById("folderInput");
  const fileInput = document.getElementById("fileInput");
  bindEvent("pickFolderBtn", "click", () => folderInput && folderInput.click());
  bindEvent("pickFilesBtn", "click", () => fileInput && fileInput.click());

  bindEvent("folderInput", "change", async (e) => {
    await ingestLocalFileList(e.target.files);
    e.target.value = "";
  });

  bindEvent("fileInput", "change", async (e) => {
    await ingestLocalFileList(e.target.files);
    e.target.value = "";
  });

  bindEvent("addHeaderBtn", "click", () => {
    const id = document.getElementById("modId").value.trim().toUpperCase();
    const path = document.getElementById("modPath").value.trim();
    const deps = document.getElementById("modDeps").value.trim();
    const exportsSig = document.getElementById("modExports").value.trim() || "init() -> Void";
    const schema = document.getElementById("modSchema").value.trim() || "{}";

    if (!id || !path) {
      setStatus("Enter both Module @id and File @path first.");
      return;
    }

    loadedPacks.push({
      label: id,
      headers: [formatHeaderBlock({ id, path, deps, exports: exportsSig, schema })]
    });

    document.getElementById("modId").value = "";
    document.getElementById("modPath").value = "";
    document.getElementById("modDeps").value = "";
    document.getElementById("modExports").value = "";
    document.getElementById("modSchema").value = "";

    syncResourceUI();
    buildPrompt();
    setStatus(`Added ${id} to AVIS.REF.`);
  });

  bindEvent("clearHeadersBtn", "click", () => {
    loadedPacks.length = 0;
    const headersEl = document.getElementById("initialHeaders");
    if (headersEl) headersEl.value = "";
    syncResourceUI();
    buildPrompt();
    setStatus("Cleared all loaded resource headers.");
  });

  bindEvent("generateBtn", "click", () => {
    buildPrompt();
    setStatus("Paste-Programmer forged.");
  });

  bindEvent("copyBtn", "click", async () => {
    const outputEl = document.getElementById("output");
    if (!outputEl) return;
    try {
      await navigator.clipboard.writeText(outputEl.value);
      setStatus("Copied to clipboard! Paste into your AI chat window.");
    } catch (err) {
      outputEl.select();
      document.execCommand("copy");
      setStatus("Copied to clipboard! Paste into your AI chat window.");
    }
  });

  bindEvent("downloadKernelBtn", "click", () => {
    const outputEl = document.getElementById("output");
    if (!outputEl) return;
    downloadTextFile("AVIS-PASTE-PROGRAMMER.txt", outputEl.value);
    setStatus("Downloaded AVIS-PASTE-PROGRAMMER.txt.");
  });

  bindEvent("downloadRefBtn", "click", () => {
    const headersEl = document.getElementById("initialHeaders");
    const refContent = (headersEl && headersEl.value.trim()) || "/* Empty AVIS.REF */";
    downloadTextFile("AVIS.REF", refContent);
    setStatus("Downloaded AVIS.REF.");
  });

  ["projectName", "windowRole", "targetStack", "directories", "initialHeaders"].forEach((id) => {
    bindEvent(id, "input", buildPrompt);
  });

  buildPrompt();
});
/*
 * AIFVS-ARTIFACT
 * @id: AVIS-DHTML-HEADER-005
 * @version: 1.4.0
 * @nexus_root: NEXUS.ROOT.V3
 * @visibility: PUBLIC_INDEX
 * @description: Hover-only DHTML Firegem color wave animator supporting multiple header links without underlines.
 */

window.addEventListener("load", function () {
  var links = document.querySelectorAll("header .mercwar-title-link, header h1 a");
  if (!links || links.length === 0) return;

  var palette = [
    { color: "#f5ebe0", glow: "rgba(245, 235, 224, 0.25)" },
    { color: "#ffb703", glow: "rgba(255, 183, 3, 0.50)" },
    { color: "#fb8500", glow: "rgba(251, 133, 0, 0.60)" },
    { color: "#ff5400", glow: "rgba(255, 84, 0, 0.80)" },
    { color: "#d9480f", glow: "rgba(217, 72, 15, 0.60)" },
    { color: "#ffb703", glow: "rgba(255, 183, 3, 0.45)" }
  ];

  function attachDhtmlWave(link) {
    var text = link.textContent.trim();
    if (!text) return;

    link.textContent = "";
    link.style.setProperty("text-decoration", "none", "important");
    link.style.setProperty("border-bottom", "none", "important");
    link.style.setProperty("-webkit-text-fill-color", "initial", "important");
    link.style.display = "inline-block";
    link.style.fontWeight = "700";
    link.style.cursor = "pointer";

    var spans = [];
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      var span = document.createElement("span");
      span.textContent = ch === " " ? "\u00A0" : ch;
      span.style.display = "inline-block";
      span.style.setProperty("text-decoration", "none", "important");
      span.style.setProperty("border-bottom", "none", "important");
      link.appendChild(span);
      spans.push(span);
    }

    function applyRestingColors() {
      for (var i = 0; i < spans.length; i++) {
        var ratio = spans.length > 1 ? i / (spans.length - 1) : 0;
        var idx = Math.min(palette.length - 1, Math.floor(ratio * palette.length));
        var entry = palette[idx];

        spans[i].style.transform = "translateY(0px)";
        spans[i].style.setProperty("color", entry.color, "important");
        spans[i].style.setProperty("-webkit-text-fill-color", entry.color, "important");
        spans[i].style.textShadow = "0 0 4px " + entry.glow;
      }
    }

    var phase = 0;
    var hovered = false;
    var animId = null;

    function animate() {
      if (!hovered) {
        animId = null;
        return;
      }

      phase += 0.14;

      for (var i = 0; i < spans.length; i++) {
        var wave = Math.sin(phase - i * 0.25);
        var norm = (wave + 1) * 0.5;
        var idx = Math.min(palette.length - 1, Math.floor(norm * palette.length));
        var entry = palette[idx];
        var y = wave * 2.2;
        var blur = 6 + norm * 10;

        spans[i].style.transform = "translateY(" + y.toFixed(2) + "px)";
        spans[i].style.setProperty("color", entry.color, "important");
        spans[i].style.setProperty("-webkit-text-fill-color", entry.color, "important");
        spans[i].style.textShadow = "0 0 " + blur.toFixed(1) + "px " + entry.glow;
      }

      animId = requestAnimationFrame(animate);
    }

    link.addEventListener("mouseenter", function () {
      hovered = true;
      for (var i = 0; i < spans.length; i++) {
        spans[i].style.transition = "none";
      }
      if (!animId) {
        animId = requestAnimationFrame(animate);
      }
    });

    link.addEventListener("mouseleave", function () {
      hovered = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      for (var i = 0; i < spans.length; i++) {
        spans[i].style.transition = "transform 0.25s ease, color 0.25s ease, text-shadow 0.25s ease";
      }
      applyRestingColors();
    });

    applyRestingColors();
  }

  for (var j = 0; j < links.length; j++) {
    attachDhtmlWave(links[j]);
  }
});
