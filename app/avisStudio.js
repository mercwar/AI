/*
 * AIFVS-ARTIFACT
 * @id: AVIS-STUDIO-JS-003
 * @version: 1.1.2
 * @nexus_root: NEXUS.ROOT.V3
 * @visibility: PUBLIC_INDEX
 * @description: Complete multi-file/folder resource loader, automatic AIFVS-HEADER extractor, and safe DOM controller.
 */

const loadedPacks = [];
let statusTimer = null;

function generateAvisPasteProgrammer(options = {}) {
  const config = {
    projectName: options.projectName || "Mercwar AVIS Workspace",
    windowRole: options.windowRole || "AVIS Header/Body Build Engine",
    targetStack: options.targetStack || "Vanilla JS / HTML5 / JSON",
    nexusRoot: options.nexusRoot || "NEXUS.ROOT.V3",
    version: options.version || "3.3.0",
    directories: options.directories || ["/VERSION 1/", "/VERSION 2/", "/VERSION 3/", "/dl/", "/SYMBOLIC/", "/GEMINI/"],
    strictJson: options.strictJson !== false,
    initialHeaders: options.initialHeaders || ""
  };

  const dirList = config.directories.join(", ");
  const headerPayload = config.initialHeaders.trim()
    ? `\n## 5. PRELOADED AVIS.REF RESOURCE HEADERS\n${config.initialHeaders.trim()}\n`
    : "";

  const handshakeStatus = config.initialHeaders.trim()
    ? `[${config.windowRole.toUpperCase()} FORGED | AVIS.REF RESOURCES LOADED]`
    : `[${config.windowRole.toUpperCase()} FORGED | READY FOR AVIS.REF]`;

  return [
    "/*",
    " * AIFVS-ARTIFACT",
    ` * @id: FORGE-KERNEL-${Date.now().toString(36).toUpperCase()}`,
    ` * @version: ${config.version}`,
    ` * @nexus_root: ${config.nexusRoot}`,
    " * @visibility: PUBLIC_INDEX",
    ` * @description: Forged AI session kernel for ${config.projectName} (${config.windowRole}).`,
    " */",
    "",
    `=== BOOT SEQUENCE: FORGE ${config.windowRole.toUpperCase()} ===`,
    `SYSTEM DIRECTIVE: You are forged as the **${config.windowRole}** for project "${config.projectName}".`,
    `TARGET STACK: ${config.targetStack}.`,
    "Operate strictly like a C compiler: separate compact interface Headers (AIFVS-HEADER) from full implementation Bodies (AIFVS-BODY). Never dump bulk code unless explicitly commanded.",
    "",
    "## 1. HEADER / BODY SEPARATION LAWS",
    "- **Headers First (AVIS.REF):** Every module is declared first as a lightweight AIFVS-HEADER block (ID, path, dependencies, exported signatures, and data schemas) with zero implementation body.",
    "- **Lazy Body Compilation:** Synthesize full AIFVS-BODY source code for a single module ONLY when the user calls `/body <ID>`.",
    "- **Contract Enforcement:** Every compiled body must satisfy its own AIFVS-HEADER exports and strictly match the signatures of its `@deps`.",
    `- **Directory Governance:** Respect deterministic paths (${dirList}).`,
    "",
    "## 2. MANDATORY ARTIFACT TAGS",
    "- **Header Block (AVIS.REF entry):**",
    "  /*",
    "   * AIFVS-HEADER",
    "   * @id: <MODULE-ID>",
    "   * @path: <FILE-PATH>",
    "   * @version: 1.0.0",
    "   * @deps: [<IDS>]",
    "   * @exports: <Function signatures and return types>",
    "   * @schema: <Data shapes>",
    "   */",
    "- **Body File (Generated source):**",
    "  /*",
    "   * AIFVS-BODY",
    "   * @id: <MODULE-ID>",
    "   * @header_ref: <MODULE-ID>@1.0.0",
    `   * @nexus_root: ${config.nexusRoot}`,
    "   * @description: <Single-line summary>",
    "   */",
    config.strictJson
      ? '- **Strict JSON Rule:** For `.json` files, embed metadata inside a top-level `"$avis_artifact"` key instead of `/* */` comments.'
      : "",
    "",
    "## 3. SESSION COMMAND INTERFACE",
    "- `/headers <idea or module range>` -> Generate or append compact AIFVS-HEADER blocks for AVIS.REF.",
    "- `/body <MODULE-ID>` -> Compile the complete implementation body for one module using its header contract and dependency headers.",
    "- `/batch <ID-1, ID-2>` -> Compile up to 3 coupled module bodies in one response.",
    "- `/check` -> Audit loaded headers in AVIS.REF for missing dependencies or type mismatches.",
    "- `/ref` -> Output the consolidated AVIS.REF header file for local saving.",
    headerPayload,
    "## 4. INITIALIZATION HANDSHAKE",
    "Do NOT write code yet. Acknowledge boot by printing ONLY:",
    `\`${handshakeStatus}\``,
    "followed by a 1-line command summary (`/headers`, `/body`, `/check`, `/ref`).",
    "=== END KERNEL ==="
  ]
    .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""))
    .join("\n");
}

function formatHeaderBlock(mod) {
  return [
    "/*",
    " * AIFVS-HEADER",
    ` * @id: ${mod.id}`,
    ` * @path: ${mod.path}`,
    ` * @version: ${mod.version || "1.0.0"}`,
    ` * @deps: [${mod.deps || ""}]`,
    ` * @exports: ${mod.exports || "init() -> Void"}`,
    ` * @schema: ${mod.schema || "{}"}`,
    " */"
  ].join("\n");
}

function extractHeadersFromFile(relativePath, content) {
  const explicitHeaders = content.match(/\/\*\s*\*\s*AIFVS-HEADER[\s\S]*?\*\//g);
  if (explicitHeaders && explicitHeaders.length > 0) {
    return explicitHeaders.map(block => block.trim());
  }

  const cleanPath = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  const idMatch = content.match(/@id:\s*([A-Za-z0-9_-]+)/);
  const verMatch = content.match(/@version:\s*([0-9]+\.[0-9]+\.[0-9]+)/);
  const depsMatch = content.match(/@deps:\s*\[([^\]]*)\]/);
  const descMatch = content.match(/@description:\s*(.+)/);

  const fallbackId = cleanPath
    .replace(/^\/+/, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toUpperCase();

  const fnMatches = [...content.matchAll(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g)]
    .map(m => `${m[1]}(${m[2].trim()})`)
    .slice(0, 6);

  const exportsSummary = fnMatches.length > 0
    ? fnMatches.join(", ")
    : (descMatch ? descMatch[1].trim() : `Resource module (${cleanPath})`);

  return [
    formatHeaderBlock({
      id: idMatch ? idMatch[1] : fallbackId,
      path: cleanPath,
      version: verMatch ? verMatch[1] : "1.0.0",
      deps: depsMatch ? depsMatch[1].trim() : "",
      exports: exportsSummary,
      schema: "{}"
    })
  ];
}

function syncResourceUI() {
  const pillsEl = document.getElementById("resourcePackPills") || document.getElementById("headerPills");
  const textareaEl = document.getElementById("initialHeaders");
  const countEl = document.getElementById("headerCount");

  const allBlocks = [];
  if (pillsEl) pillsEl.innerHTML = "";

  loadedPacks.forEach((pack, index) => {
    allBlocks.push(...pack.headers);

    if (pillsEl) {
      const pill = document.createElement("span");
      pill.className = "pill";
      pill.innerHTML = `${pack.label} (${pack.headers.length} headers) <button type="button" title="Remove resource pack">&times;</button>`;
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
  }, 3800);
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

async function ingestFileList(fileList) {
  const allowedExt = /\.(ref|txt|json|js|html|md)$/i;
  const validFiles = Array.from(fileList).filter(f => allowedExt.test(f.name));

  if (validFiles.length === 0) {
    setStatus("No supported resource files (.ref, .json, .js, .html, .txt) found.");
    return;
  }

  const extractedBlocks = [];
  let folderName = "Resource Files";

  if (validFiles[0].webkitRelativePath) {
    folderName = validFiles[0].webkitRelativePath.split("/")[0] || "Resource Folder";
  } else if (validFiles.length === 1) {
    folderName = validFiles[0].name;
  } else {
    folderName = `${validFiles.length} Files`;
  }

  for (const file of validFiles) {
    const text = await file.text();
    const relPath = file.webkitRelativePath || file.name;
    const blocks = extractHeadersFromFile(relPath, text);
    extractedBlocks.push(...blocks);
  }

  loadedPacks.push({
    label: folderName,
    headers: extractedBlocks
  });

  syncResourceUI();
  buildPrompt();
  setStatus(`Loaded ${extractedBlocks.length} header(s) from "${folderName}".`);
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
  if (!el) {
console.warn([AVIS Studio] Element #${id} not found in index.html; skipping listener.);
return null;
}
el.addEventListener(eventName, handler);
return el;
}
document.addEventListener("DOMContentLoaded", () => {
const folderInput = document.getElementById("folderInput");
const fileInput = document.getElementById("fileInput");
bindEvent("pickFolderBtn", "click", () => folderInput && folderInput.click());
bindEvent("pickFilesBtn", "click", () => fileInput && fileInput.click());
bindEvent("folderInput", "change", async (e) => {
await ingestFileList(e.target.files);
e.target.value = "";
});
bindEvent("fileInput", "change", async (e) => {
await ingestFileList(e.target.files);
e.target.value = "";
});
const dropZone = bindEvent("dropZone", "dragover", (e) => {
e.preventDefault();
dropZone.classList.add("drag-over");
});
bindEvent("dropZone", "dragleave", () => {
if (dropZone) dropZone.classList.remove("drag-over");
});
bindEvent("dropZone", "drop", async (e) => {
e.preventDefault();
if (dropZone) dropZone.classList.remove("drag-over");
if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
await ingestFileList(e.dataTransfer.files);
}
});
bindEvent("addHeaderBtn", "click", () => {
const idEl = document.getElementById("modId");
const pathEl = document.getElementById("modPath");
const depsEl = document.getElementById("modDeps");
const exportsEl = document.getElementById("modExports");
const schemaEl = document.getElementById("modSchema");
const id = idEl ? idEl.value.trim().toUpperCase() : "";
const path = pathEl ? pathEl.value.trim() : "";
const deps = depsEl ? depsEl.value.trim() : "";
const exportsSig = (exportsEl && exportsEl.value.trim()) || "init() -> Void";
const schema = (schemaEl && schemaEl.value.trim()) || "{}";
if (!id || !path) {
setStatus("Enter both Module @id and File @path first.");
return;
}
loadedPacks.push({
label: id,
headers: [formatHeaderBlock({ id, path, deps, exports: exportsSig, schema })]
});
if (idEl) idEl.value = "";
if (pathEl) pathEl.value = "";
if (depsEl) depsEl.value = "";
if (exportsEl) exportsEl.value = "";
if (schemaEl) schemaEl.value = "";
syncResourceUI();
buildPrompt();
setStatus(Added ${id} to AVIS.REF.);
});
bindEvent("clearHeadersBtn", "click", () => {
loadedPacks.length = 0;
const headersEl = document.getElementById("initialHeaders");
if (headersEl) headersEl.value = "";
syncResourceUI();
buildPrompt();
setStatus("Cleared all loaded resource headers.");
});
bindEvent("loadSampleBtn", "click", () => {
loadedPacks.push({
label: "Sample Starter Pack",
headers: [
formatHeaderBlock({
id: "CORE-LOOP-001",
path: "/engine/coreLoop.js",
deps: "",
exports: "startLoop(fps, tickCallback) -> Void, stopLoop() -> Void",
schema: '{ fps: "number", delta: "number" }'
}),
formatHeaderBlock({
id: "NODE-FETCH-002",
path: "/dl/nodeFetch.js",
deps: "CORE-LOOP-001",
exports: "loadDatalakeNode(nodeId) -> Promise",
schema: '{ nodeId: "string", payload: "object" }'
})
]
});
syncResourceUI();
buildPrompt();
setStatus("Loaded 2 sample headers.");
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