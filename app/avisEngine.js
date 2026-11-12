/*
 * AIFVS-ARTIFACT
 * @id: AVIS-STUDIO-ENGINE-003
 * @version: 1.2.0
 * @nexus_root: NEXUS.ROOT.V3
 * @visibility: PUBLIC_INDEX
 * @exports: generateAvisPasteProgrammer(options), formatHeaderBlock(mod), extractHeadersFromFile(relativePath, content)
 * @description: Pure JavaScript engine for forging AVIS session kernels and parsing AIFVS-HEADER contracts.
 */

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

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    generateAvisPasteProgrammer,
    formatHeaderBlock,
    extractHeadersFromFile
  };
}
