/*
 * Full File Extensions 1.1.3
 * Generated from main.ts with no external build dependencies.
 */
"use strict";

const { Plugin, PluginSettingTab, Setting, TFile } = require("obsidian");

const OWNED_CLASS = "full-file-extensions-item";
const SPLIT_CLASS = "full-file-extensions-split";
const LABEL_CLASS = "full-file-extensions-label";
const NAME_CLASS = "full-file-extensions-name";
const EXTENSION_CLASS = "full-file-extensions-extension";
const SHADE_CLASS = "full-file-extensions-shaded";
const OBSERVED_ATTRIBUTES = [
  "data-path",
  "data-file-path",
  "data-href",
  "href",
  "class",
];

const NAVIGATION_SELECTORS = [
  '.workspace-leaf-content[data-type="file-explorer"] .nav-file-title',
  '.workspace-leaf-content[data-type="bookmarks"] .tree-item-self.bookmark',
  '.workspace-leaf-content[data-type="search"] .search-result-file-title',
  '.workspace-leaf-content[data-type="backlink"] .search-result-file-title',
  '.workspace-leaf-content[data-type="backlink"] .tree-item-self',
  '.workspace-leaf-content[data-type="outgoing-link"] .search-result-file-title',
  '.workspace-leaf-content[data-type="outgoing-link"] .tree-item-self',
  '.workspace-leaf-content[data-type="recent-files"] .tree-item-self',
  '.workspace-leaf-content[data-type="recent-files-view"] .tree-item-self',
  '.workspace-leaf-content[data-type="recent-files"] .nav-file-title',
  '.workspace-leaf-content[data-type="recent-files-view"] .nav-file-title',
  '.workspace-split.mod-sidedock .workspace-leaf-content .tree-item-self',
  '.workspace-split.mod-sidedock .workspace-leaf-content .nav-file-title',
  '.workspace-split.mod-sidedock .workspace-leaf-content .search-result-file-title',
].join(", ");

const DEFAULT_SETTINGS = Object.freeze({
  showFinalExtension: true,
  preserveExtensionless: true,
  treatDotfilesAsComplete: true,
  preserveRenameField: true,
  showTooltip: true,
  shadeExtension: true,
});

class FullFileExtensionsPlugin extends Plugin {
  constructor(...args) {
    super(...args);
    this.settings = { ...DEFAULT_SETTINGS };
    this.styledDocuments = new Set();
    this.documentObservers = new Map();
    this.ownedRows = new Map();
    this.fileNameIndex = new Map();
    this.fileIndexDirty = true;
    this.refreshFrame = null;
  }

  static normalizePath(path) {
    if (typeof path !== "string") return "";
    return path.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "").trim();
  }

  static filenameFromPath(path) {
    const normalized = FullFileExtensionsPlugin.normalizePath(path);
    const parts = normalized.split("/").filter((part) => part.length > 0);
    return parts.at(-1) ?? "";
  }

  static nativeBasenameFallback(filename) {
    const value = String(filename ?? "");
    const finalDot = value.lastIndexOf(".");
    return finalDot > 0 ? value.slice(0, finalDot) : value;
  }

  static isDotfile(filename) {
    const value = String(filename ?? "");
    return value.length > 1 && value.startsWith(".");
  }

  static splitFinalExtension(filename, treatDotfilesAsComplete = true) {
    const value = String(filename ?? "");
    if (!value) {
      return { name: "", extension: "", hasExtension: false, isDotfile: false };
    }

    const isDotfile = FullFileExtensionsPlugin.isDotfile(value);
    if (isDotfile && treatDotfilesAsComplete) {
      return { name: value, extension: "", hasExtension: false, isDotfile: true };
    }

    const finalDot = value.lastIndexOf(".");
    const hasExtension = finalDot >= 0 && finalDot < value.length - 1;
    if (!hasExtension) {
      return { name: value, extension: "", hasExtension: false, isDotfile };
    }

    return {
      name: value.slice(0, finalDot),
      extension: value.slice(finalDot),
      hasExtension: true,
      isDotfile,
    };
  }

  static normalizeSettings(data) {
    const source = data && typeof data === "object" ? data : {};
    return {
      showFinalExtension: source.showFinalExtension !== false,
      preserveExtensionless: source.preserveExtensionless !== false,
      treatDotfilesAsComplete: source.treatDotfilesAsComplete !== false,
      preserveRenameField: source.preserveRenameField !== false,
      showTooltip: source.showTooltip !== false,
      shadeExtension: source.shadeExtension !== false,
    };
  }

  static parseObsidianOpenUrl(rawValue) {
    if (typeof rawValue !== "string" || !rawValue.startsWith("obsidian://open")) {
      return "";
    }
    try {
      const url = new URL(rawValue);
      return FullFileExtensionsPlugin.normalizePath(url.searchParams.get("file") ?? "");
    } catch (_) {
      return "";
    }
  }

  async onload() {
    this.settings = FullFileExtensionsPlugin.normalizeSettings(
      await this.loadData(),
    );
    this.addSettingTab(new FullFileExtensionsSettingTab(this.app, this));

    this.register(() => this.clearPresentation());
    this.registerEvent(
      this.app.workspace.on("layout-change", () => this.scheduleRefresh(false)),
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () =>
        this.scheduleRefresh(false),
      ),
    );
    this.registerEvent(
      this.app.vault.on("create", () => this.scheduleRefresh(true)),
    );
    this.registerEvent(
      this.app.vault.on("rename", () => this.scheduleRefresh(true)),
    );
    this.registerEvent(
      this.app.vault.on("delete", () => this.scheduleRefresh(true)),
    );

    this.addCommand({
      id: "refresh-full-file-extensions",
      name: "Refresh file name labels",
      callback: () => {
        this.fileIndexDirty = true;
        this.restoreOwnedRows();
        this.applyPresentation();
      },
    });

    this.app.workspace.onLayoutReady(() => {
      this.fileIndexDirty = true;
      this.applyPresentation();
    });
  }

  async updateSetting(key, value) {
    this.settings[key] = value;
    await this.saveData(this.settings);
    this.restoreOwnedRows();
    this.scheduleRefresh(false);
  }

  scheduleRefresh(rebuildIndex) {
    if (rebuildIndex) this.fileIndexDirty = true;
    if (this.refreshFrame !== null) return;

    const requestFrame =
      typeof window !== "undefined" &&
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame.bind(window)
        : (callback) => setTimeout(callback, 0);

    this.refreshFrame = requestFrame(() => {
      this.refreshFrame = null;
      this.applyPresentation();
    });
  }

  collectWorkspaceDocuments() {
    const documents = new Set();
    const addDocument = (doc) => {
      if (doc?.body) documents.add(doc);
    };
    const addLeafDocument = (leaf) => {
      addDocument(
        leaf?.view?.containerEl?.ownerDocument ??
          leaf?.containerEl?.ownerDocument ??
          null,
      );
    };

    if (typeof document !== "undefined") addDocument(document);

    if (typeof this.app.workspace.iterateAllLeaves === "function") {
      this.app.workspace.iterateAllLeaves((leaf) => addLeafDocument(leaf));
    } else {
      for (const type of [
        "file-explorer",
        "bookmarks",
        "search",
        "backlink",
        "outgoing-link",
        "recent-files",
        "recent-files-view",
      ]) {
        for (const leaf of this.app.workspace.getLeavesOfType?.(type) ?? []) {
          addLeafDocument(leaf);
        }
      }
    }

    return documents;
  }

  ensureDocumentObserver(doc) {
    if (!doc?.body || this.documentObservers.has(doc)) return;
    const Observer =
      doc.defaultView?.MutationObserver ??
      (typeof MutationObserver !== "undefined" ? MutationObserver : null);
    if (typeof Observer !== "function") return;

    const observer = new Observer(() => this.scheduleRefresh(false));
    observer.observe(doc.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: OBSERVED_ATTRIBUTES,
    });
    this.documentObservers.set(doc, observer);
  }

  rebuildFileNameIndex() {
    const map = new Map();
    const add = (key, file) => {
      const normalized = String(key ?? "").trim();
      if (!normalized || !(file instanceof TFile)) return;
      const existing = map.get(normalized) ?? [];
      if (!existing.some((candidate) => candidate.path === file.path)) {
        existing.push(file);
      }
      map.set(normalized, existing);
    };

    const loaded = this.app.vault.getFiles?.() ?? [];
    for (const file of loaded) {
      if (!(file instanceof TFile)) continue;
      add(file.name, file);
      add(file.basename, file);
      add(file.path, file);
      const extensionlessPath = file.extension
        ? file.path.slice(0, -(file.extension.length + 1))
        : file.path;
      add(extensionlessPath, file);
    }

    this.fileNameIndex = map;
    this.fileIndexDirty = false;
  }

  resolveUniqueName(rawValue) {
    const key = String(rawValue ?? "").trim();
    if (!key) return null;
    const matches = this.fileNameIndex.get(key) ?? [];
    return matches.length === 1 ? matches[0] : null;
  }

  resolvePath(rawValue, { allowLinkResolution = true } = {}) {
    const obsidianPath = FullFileExtensionsPlugin.parseObsidianOpenUrl(rawValue);
    const path = FullFileExtensionsPlugin.normalizePath(obsidianPath || rawValue);
    if (!path) return null;

    const exact = this.app.vault.getAbstractFileByPath?.(path);
    if (exact instanceof TFile) return exact;

    if (!/\.[^/]+$/.test(path)) {
      const markdown = this.app.vault.getAbstractFileByPath?.(`${path}.md`);
      if (markdown instanceof TFile) return markdown;
    }

    if (allowLinkResolution) {
      const linked = this.app.metadataCache?.getFirstLinkpathDest?.(path, "");
      if (linked instanceof TFile) return linked;
    }

    return null;
  }

  candidateValuesFromElement(element) {
    const values = [];
    const add = (value) => {
      if (typeof value !== "string") return;
      const trimmed = value.trim();
      if (trimmed && !values.includes(trimmed)) values.push(trimmed);
    };

    let cursor = element;
    for (let depth = 0; cursor && depth < 8; depth += 1) {
      add(cursor.dataset?.path);
      add(cursor.dataset?.filePath);
      add(cursor.dataset?.href);
      add(cursor.getAttribute?.("data-path"));
      add(cursor.getAttribute?.("data-file-path"));
      add(cursor.getAttribute?.("data-href"));
      add(cursor.getAttribute?.("href"));
      cursor = cursor.parentElement;
      if (cursor?.classList?.contains("workspace-leaf-content")) break;
    }

    return values;
  }

  getBookmarksPluginItems() {
    try {
      const items = this.app?.internalPlugins
        ?.getPluginById?.("bookmarks")
        ?.instance?.items;
      return Array.isArray(items) ? items : [];
    } catch (_) {
      return [];
    }
  }

  bookmarkItemDisplayName(item) {
    if (typeof item?.title === "string" && item.title.trim()) {
      return item.title.trim();
    }
    const path = FullFileExtensionsPlugin.normalizePath(item?.path);
    if (!path) return "";
    const filename = FullFileExtensionsPlugin.filenameFromPath(path);
    return FullFileExtensionsPlugin.nativeBasenameFallback(filename);
  }

  buildBookmarkFileMap(items = this.getBookmarksPluginItems()) {
    const map = new Map();
    const add = (renderedPath, file) => {
      if (!renderedPath || !(file instanceof TFile)) return;
      const existing = map.get(renderedPath) ?? [];
      if (!existing.some((candidate) => candidate.path === file.path)) {
        existing.push(file);
      }
      map.set(renderedPath, existing);
    };

    const visit = (entries, groups = [], depth = 0) => {
      if (!Array.isArray(entries) || depth > 20) return;
      for (const item of entries) {
        if (!item || typeof item !== "object") continue;
        if (item.type === "group") {
          const groupTitle =
            typeof item.title === "string" ? item.title.trim() : "";
          visit(
            item.items,
            groupTitle ? [...groups, groupTitle] : groups,
            depth + 1,
          );
          continue;
        }

        if (item.type !== "file") continue;
        const normalizedItemPath = FullFileExtensionsPlugin.normalizePath(item.path);
        const exactItem = this.app.vault.getAbstractFileByPath?.(normalizedItemPath);
        if (exactItem && !(exactItem instanceof TFile)) continue;
        const file = this.resolvePath(normalizedItemPath, {
          allowLinkResolution: false,
        });
        if (!file) continue;
        const displayName = this.bookmarkItemDisplayName(item);
        if (!displayName) continue;
        add([...groups, displayName].join("/"), file);
      }
    };

    visit(items);
    return map;
  }

  resolveBookmarkRow(row, map) {
    const treePath = FullFileExtensionsPlugin.normalizePath(
      row?.dataset?.path ?? row?.getAttribute?.("data-path") ?? "",
    );
    if (!treePath) return null;
    const matches = map.get(treePath) ?? [];
    return matches.length === 1 ? matches[0] : null;
  }

  paneTypeForRow(row) {
    return row
      ?.closest?.(".workspace-leaf-content")
      ?.getAttribute?.("data-type") ?? "";
  }

  labelForRow(row) {
    if (!row) return null;
    if (row.classList?.contains("nav-file-title")) {
      return row.querySelector?.(".nav-file-title-content") ?? null;
    }
    return (
      row.querySelector?.(".tree-item-inner-text") ??
      row.querySelector?.(".tree-item-inner") ??
      row.querySelector?.(".nav-file-title-content") ??
      null
    );
  }

  bookmarkTreeRow(row) {
    if (!row) return null;
    return row.closest?.(".tree-item[data-path]") ?? null;
  }

  resolveRowFile(row, label, bookmarkMap) {
    const paneType = this.paneTypeForRow(row);
    if (paneType === "bookmarks") {
      const treeRow = this.bookmarkTreeRow(row);
      const bookmarkFile = this.resolveBookmarkRow(treeRow, bookmarkMap);
      if (bookmarkFile) return bookmarkFile;
      return null;
    }

    for (const candidate of this.candidateValuesFromElement(row)) {
      const file = this.resolvePath(candidate);
      if (file) return file;
    }

    const displayText = label?.textContent?.trim() ?? "";
    return this.resolveUniqueName(displayText);
  }

  applyPresentation() {
    if (this.fileIndexDirty) this.rebuildFileNameIndex();

    const currentDocuments = this.collectWorkspaceDocuments();
    for (const doc of this.styledDocuments) {
      if (!currentDocuments.has(doc)) this.unstyleDocument(doc);
    }

    for (const doc of currentDocuments) {
      this.ensureDocumentObserver(doc);
      this.refreshDocument(doc);
    }

    this.styledDocuments = currentDocuments;
  }

  refreshDocument(doc) {
    if (!doc?.body) return;
    const processed = new Set();
    const bookmarkMap = this.buildBookmarkFileMap();

    for (const row of doc.querySelectorAll?.(NAVIGATION_SELECTORS) ?? []) {
      const label = this.labelForRow(row);
      if (!label) continue;
      const file = this.resolveRowFile(row, label, bookmarkMap);
      if (!file) continue;
      this.applyRowPresentation(row, label, file);
      processed.add(row);
    }

    for (const row of Array.from(this.ownedRows.keys())) {
      if (row?.ownerDocument === doc && !processed.has(row)) {
        this.restoreRow(row);
      }
    }
  }

  captureOriginalState(row, label) {
    if (this.ownedRows.has(row)) return this.ownedRows.get(row);

    const nodes = [];
    for (const node of Array.from(label.childNodes ?? [])) {
      if (typeof node.cloneNode === "function") nodes.push(node.cloneNode(true));
    }

    const state = {
      label,
      nodes,
      text: label.textContent ?? "",
      hadTitle: row.hasAttribute?.("title") === true,
      title: row.getAttribute?.("title") ?? "",
    };
    this.ownedRows.set(row, state);
    return state;
  }

  applyRowPresentation(row, label, file) {
    if (!row?.classList || !(file instanceof TFile)) return;

    const isRenaming = Boolean(
      row.querySelector?.('input, textarea, [contenteditable="true"]'),
    );
    if (isRenaming && this.settings.preserveRenameField) {
      this.restoreRow(row);
      return;
    }

    const existingState = this.ownedRows.get(row);
    if (existingState && existingState.filePath !== file.path) {
      this.ownedRows.delete(row);
      row.classList.remove(OWNED_CLASS, SPLIT_CLASS, SHADE_CLASS);
      label.classList?.remove(LABEL_CLASS);
    }
    const state = this.captureOriginalState(row, label);
    state.filePath = file.path;

    if (this.settings.showTooltip) {
      if (row.getAttribute?.("title") !== file.name) {
        row.setAttribute?.("title", file.name);
      }
    } else {
      const state = this.ownedRows.get(row);
      if (state?.hadTitle) row.setAttribute?.("title", state.title);
      else row.removeAttribute?.("title");
    }

    if (!this.settings.showFinalExtension) {
      this.restoreLabelOnly(row);
      return;
    }

    const parts = FullFileExtensionsPlugin.splitFinalExtension(
      file.name,
      this.settings.treatDotfilesAsComplete,
    );
    const leaveAsNormal =
      !parts.hasExtension && this.settings.preserveExtensionless;

    if (leaveAsNormal) {
      this.renderSingleLabel(row, label, file.name);
    } else {
      this.renderSplitLabel(row, label, parts.name, parts.extension);
    }
  }

  createSpan(label, className, text) {
    const doc = label.ownerDocument ?? label.closest?.("html")?.ownerDocument;
    const span = doc?.createElement?.("span") ?? null;
    if (!span) return null;
    span.className = className;
    span.textContent = text;
    return span;
  }

  renderSingleLabel(row, label, filename) {
    if (label.textContent !== filename || label.classList?.contains(LABEL_CLASS)) {
      label.classList?.remove(LABEL_CLASS);
      const textNode = label.ownerDocument?.createTextNode?.(filename);
      if (textNode) label.replaceChildren?.(textNode);
      else label.textContent = filename;
    }
    row.classList.add(OWNED_CLASS);
    row.classList.remove(SPLIT_CLASS, SHADE_CLASS);
  }

  renderSplitLabel(row, label, name, extension) {
    const currentName = label.querySelector?.(`.${NAME_CLASS}`);
    const currentExtension = label.querySelector?.(`.${EXTENSION_CLASS}`);

    if (
      currentName?.textContent !== name ||
      currentExtension?.textContent !== extension
    ) {
      const nameEl = this.createSpan(label, NAME_CLASS, name);
      const extensionEl = this.createSpan(label, EXTENSION_CLASS, extension);
      if (!nameEl || !extensionEl) return;
      extensionEl.setAttribute?.("aria-hidden", "true");
      label.replaceChildren?.(nameEl, extensionEl);
    }

    label.classList?.add(LABEL_CLASS);
    row.classList.add(OWNED_CLASS, SPLIT_CLASS);
    row.classList.toggle(SHADE_CLASS, this.settings.shadeExtension);
  }

  restoreLabelOnly(row) {
    const state = this.ownedRows.get(row);
    if (!state) return;
    const label = state.label;
    if (label) {
      label.classList?.remove(LABEL_CLASS);
      if (state.nodes.length > 0 && typeof label.replaceChildren === "function") {
        const clones = state.nodes.map((node) => node.cloneNode(true));
        label.replaceChildren(...clones);
      } else if (label.textContent !== state.text) {
        label.textContent = state.text;
      }
    }
    row.classList?.remove(OWNED_CLASS, SPLIT_CLASS, SHADE_CLASS);
  }

  restoreRow(row) {
    const state = this.ownedRows.get(row);
    if (!state) return;

    const label = state.label;
    if (label) {
      label.classList?.remove(LABEL_CLASS);
      if (state.nodes.length > 0 && typeof label.replaceChildren === "function") {
        const clones = state.nodes.map((node) => node.cloneNode(true));
        label.replaceChildren(...clones);
      } else if (label.textContent !== state.text) {
        label.textContent = state.text;
      }
    }

    if (state.hadTitle) row.setAttribute?.("title", state.title);
    else row.removeAttribute?.("title");
    row.classList?.remove(OWNED_CLASS, SPLIT_CLASS, SHADE_CLASS);
    this.ownedRows.delete(row);
  }

  restoreOwnedRows() {
    for (const row of Array.from(this.ownedRows.keys())) this.restoreRow(row);
  }

  unstyleDocument(doc) {
    const observer = this.documentObservers.get(doc);
    observer?.disconnect?.();
    this.documentObservers.delete(doc);

    for (const row of Array.from(this.ownedRows.keys())) {
      if (row?.ownerDocument === doc) this.restoreRow(row);
    }
  }

  clearPresentation() {
    if (this.refreshFrame !== null) {
      const cancelFrame =
        typeof window !== "undefined" &&
        typeof window.cancelAnimationFrame === "function"
          ? window.cancelAnimationFrame.bind(window)
          : clearTimeout;
      cancelFrame(this.refreshFrame);
      this.refreshFrame = null;
    }

    this.restoreOwnedRows();
    for (const observer of this.documentObservers.values()) observer?.disconnect?.();
    this.documentObservers.clear();
    this.styledDocuments.clear();
  }
}

class FullFileExtensionsSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Full File Extensions" });

    new Setting(containerEl)
      .setName("Show the final extension")
      .setDesc("Keep the actual final extension visible on supported navigation rows.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showFinalExtension)
          .onChange((value) =>
            this.plugin.updateSetting("showFinalExtension", value),
          ),
      );

    new Setting(containerEl)
      .setName("Shade file extension")
      .setDesc("Show the extension at 50% opacity.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.shadeExtension)
          .onChange((value) =>
            this.plugin.updateSetting("shadeExtension", value),
          ),
      );

    new Setting(containerEl)
      .setName("Preserve extensionless filenames")
      .setDesc("Keep extensionless files as one normal filename.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.preserveExtensionless)
          .onChange((value) =>
            this.plugin.updateSetting("preserveExtensionless", value),
          ),
      );

    new Setting(containerEl)
      .setName("Treat dotfiles as complete filenames")
      .setDesc("Keep names such as .env and .gitignore together.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.treatDotfilesAsComplete)
          .onChange((value) =>
            this.plugin.updateSetting("treatDotfilesAsComplete", value),
          ),
      );

    new Setting(containerEl)
      .setName("Preserve the normal rename field")
      .setDesc("Temporarily remove formatting while an inline rename editor is active.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.preserveRenameField)
          .onChange((value) =>
            this.plugin.updateSetting("preserveRenameField", value),
          ),
      );

    new Setting(containerEl)
      .setName("Show the complete filename on hover")
      .setDesc("Use a native tooltip containing the actual filename.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showTooltip)
          .onChange((value) =>
            this.plugin.updateSetting("showTooltip", value),
          ),
      );
  }
}

module.exports = FullFileExtensionsPlugin;

/* nosourcemap */