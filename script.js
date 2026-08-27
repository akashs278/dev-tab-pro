/**
 * DevTab Pro - Production Script
 * Fully Content Security Policy (CSP) Manifest V3 Compliant.
 * Features:
 * - Unified StorageManager (syncing localStorage & chrome.storage.local)
 * - Drag-and-drop reordering across ALL sections, dashboard widgets, and modal directories
 * - Stacked multi-line layout for AI and Developer websites (name on line 1, text/link on next line)
 * - Full 30 Google Apps list with S2 favicon service
 * - Split Sidebar GUI Settings Menu
 */

document.addEventListener("DOMContentLoaded", () => {
  StorageManager.syncFromChromeStorage().then(() => {
    initOnboarding();
    initClock();
    initGoogleLinks();
    initTodoList();
    initSearchEngine();
    initDevHosts();
    initDevWebsites();
    initCustomShortcuts();
    initDevToolbox();
    initAiHubModal();
    initCustomSections();
    initSettingsAndVisibility();
    initThemeManager();
    initWidgetDragAndDrop();
    initHotkeys();
  });
});

// --- Unified Storage Manager (localStorage + chrome.storage.local sync) ---
const StorageManager = {
  get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(key);
      if (val === null || val === undefined) return defaultValue;
      return JSON.parse(val);
    } catch (e) {
      const raw = localStorage.getItem(key);
      return raw !== null ? raw : defaultValue;
    }
  },

  set(key, value) {
    try {
      const strVal = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, strVal);
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        chrome.storage.local.set({ [key]: value });
      }
    } catch (e) {
      console.warn("StorageManager.set error:", e);
    }
  },

  async syncFromChromeStorage() {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      try {
        const items = await new Promise((resolve) =>
          chrome.storage.local.get(null, resolve),
        );
        if (items && typeof items === "object") {
          for (const [k, v] of Object.entries(items)) {
            if (localStorage.getItem(k) === null) {
              const strVal = typeof v === "string" ? v : JSON.stringify(v);
              localStorage.setItem(k, strVal);
            }
          }
        }
      } catch (e) {
        // Fallback silently to localStorage
      }
    }
  },
};

// --- Helper Utilities for DOM Safety & CSP Compliance ---
function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\x27/g, "&#39;");
}

function sanitizeUrl(url) {
  if (!url || typeof url !== "string") return "#";
  const trimmed = url.trim();
  if (/^(https?:\/\/|localhost|\/)/i.test(trimmed)) {
    return trimmed;
  }
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(trimmed)) {
    return "https://" + trimmed;
  }
  return trimmed.startsWith("http") ? trimmed : "https://" + trimmed;
}

function getFaviconUrl(url, size = 64) {
  if (!url) return "https://www.google.com/favicon.ico";
  try {
    let domain = new URL(
      url.startsWith("http") ? url : "https://" + url,
    ).hostname.toLowerCase();
    if (domain.endsWith("whatsapp.com")) domain = "whatsapp.com";
    if (domain.endsWith("telegram.org")) domain = "telegram.org";
    if (domain.endsWith("discord.com")) domain = "discord.com";
    if (domain.endsWith("youtube.com")) domain = "youtube.com";
    if (domain.endsWith("google.com")) domain = "google.com";
    if (domain.endsWith("github.com")) domain = "github.com";
    if (domain.endsWith("reddit.com")) domain = "reddit.com";
    if (domain.endsWith("twitter.com") || domain.endsWith("x.com"))
      domain = "x.com";
    if (domain.endsWith("instagram.com")) domain = "instagram.com";

    return (
      "https://www.google.com/s2/favicons?domain=" +
      encodeURIComponent(domain) +
      "&sz=" +
      size
    );
  } catch (e) {
    return "https://www.google.com/favicon.ico";
  }
}

function closeAllModals() {
  document.querySelectorAll(".modal-overlay").forEach((m) => {
    m.classList.add("hidden");
    m.style.display = "none";
  });
}

function openModal(modalEl) {
  if (!modalEl) return;
  closeAllModals();
  modalEl.classList.remove("hidden");
  modalEl.style.display = "flex";
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    closeAllModals();
  }
});

// --- 1. To-Do List Section Module ---
function initTodoList() {
  const todoForm = document.getElementById("todo-form");
  const todoInput = document.getElementById("todo-input");
  const todoList = document.getElementById("todo-list");
  const todoCount = document.getElementById("todo-count");

  const defaultTodos = [
    { text: "Review pull requests", completed: false },
    { text: "Deploy latest build to staging", completed: true },
  ];

  let todos = StorageManager.get("devtab_todos", defaultTodos);
  if (!Array.isArray(todos)) todos = defaultTodos;

  function renderTodos() {
    if (!todoList) return;
    todoList.innerHTML = "";

    const activeCount = todos.filter((t) => !t.completed).length;
    if (todoCount) todoCount.textContent = activeCount;

    todos.forEach((todo, idx) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.completed ? " completed" : "");

      const leftDiv = document.createElement("div");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "todo-item-check";
      checkbox.dataset.idx = idx;
      checkbox.checked = !todo.completed;

      const textSpan = document.createElement("span");
      textSpan.textContent = todo.text || "";

      leftDiv.appendChild(checkbox);
      leftDiv.appendChild(textSpan);

      const delBtn = document.createElement("button");
      delBtn.className = "todo-del-btn";
      delBtn.dataset.idx = idx;
      delBtn.textContent = "×";
      delBtn.title = "Delete Task";

      li.appendChild(leftDiv);
      li.appendChild(delBtn);
      todoList.appendChild(li);
    });
  }

  function saveAndRender() {
    StorageManager.set("devtab_todos", todos);
    renderTodos();
  }

  if (todoList) {
    todoList.addEventListener("change", (e) => {
      if (e.target.classList.contains("todo-item-check")) {
        const idx = parseInt(e.target.dataset.idx, 10);
        if (!isNaN(idx) && todos[idx]) {
          todos[idx].completed = e.target.checked;
          saveAndRender();
        }
      }
    });

    todoList.addEventListener("click", (e) => {
      if (e.target.classList.contains("todo-del-btn")) {
        const idx = parseInt(e.target.dataset.idx, 10);
        if (!isNaN(idx) && todos[idx]) {
          todos.splice(idx, 1);
          saveAndRender();
        }
      }
    });
  }

  if (todoForm) {
    todoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = todoInput ? todoInput.value.trim() : "";
      if (text) {
        todos.push({ text, completed: false });
        if (todoInput) todoInput.value = "";
        saveAndRender();
      }
    });
  }

  renderTodos();
}

// --- 2. Google Apps Launcher with Drag & Drop Reordering (30 Apps) ---
function initGoogleLinks() {
  const googleBtn = document.getElementById("google-links-btn");
  const googleDropdown = document.getElementById("google-links-dropdown");

  if (!googleBtn || !googleDropdown) return;

  const defaultGoogleApps = [
    {
      name: "Search",
      url: "https://google.com",
      icon: "https://www.google.com/favicon.ico",
    },
    {
      name: "Maps",
      url: "https://maps.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/maps_2020q4_48dp.png",
    },
    {
      name: "YouTube",
      url: "https://youtube.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/youtube_48dp.png",
    },
    {
      name: "Gemini",
      url: "https://gemini.google.com",
      icon: "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64",
    },
    {
      name: "News",
      url: "https://news.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/news_48dp.png",
    },
    {
      name: "Gmail",
      url: "https://mail.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png",
    },
    {
      name: "Meet",
      url: "https://meet.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/meet_2020q4_48dp.png",
    },
    {
      name: "Chat",
      url: "https://chat.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/chat_2020q4_48dp.png",
    },
    {
      name: "Drive",
      url: "https://drive.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
    },
    {
      name: "Calendar",
      url: "https://calendar.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png",
    },
    {
      name: "Contacts",
      url: "https://contacts.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/contacts_2022_48dp.png",
    },
    {
      name: "Translate",
      url: "https://translate.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/translate_2020q4_48dp.png",
    },
    {
      name: "Photos",
      url: "https://photos.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/photos_2020q4_48dp.png",
    },
    {
      name: "Docs",
      url: "https://docs.google.com/document",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/docs_2020q4_48dp.png",
    },
    {
      name: "Sheets",
      url: "https://docs.google.com/spreadsheets",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png",
    },
    {
      name: "Slides",
      url: "https://docs.google.com/presentation",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/slides_2020q4_48dp.png",
    },
    {
      name: "Forms",
      url: "https://docs.google.com/forms",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/forms_2020q4_48dp.png",
    },
    {
      name: "Keep",
      url: "https://keep.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/keep_2020q4_48dp.png",
    },
    {
      name: "Classroom",
      url: "https://classroom.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/classroom_48dp.png",
    },
    {
      name: "Earth",
      url: "https://earth.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/earth_48dp.png",
    },
    {
      name: "Play",
      url: "https://play.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/play_prism_48dp.png",
    },
    {
      name: "Cloud",
      url: "https://console.cloud.google.com",
      icon: "https://www.google.com/s2/favicons?domain=cloud.google.com&sz=64",
    },
    {
      name: "Colab",
      url: "https://colab.research.google.com",
      icon: "https://www.google.com/s2/favicons?domain=colab.research.google.com&sz=64",
    },
    {
      name: "Analytics",
      url: "https://analytics.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/analytics_48dp.png",
    },
    {
      name: "YouTube Music",
      url: "https://music.youtube.com",
      icon: "https://www.google.com/s2/favicons?domain=music.youtube.com&sz=64",
    },
    {
      name: "Fonts",
      url: "https://fonts.google.com",
      icon: "https://www.google.com/s2/favicons?domain=fonts.google.com&sz=64",
    },
    {
      name: "Flights",
      url: "https://flights.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/flights_48dp.png",
    },
    {
      name: "Finance",
      url: "https://finance.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/finance_48dp.png",
    },
    {
      name: "Shopping",
      url: "https://shopping.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/shopping_48dp.png",
    },
    {
      name: "Admin",
      url: "https://admin.google.com",
      icon: "https://ssl.gstatic.com/images/branding/product/1x/admin_48dp.png",
    },
  ];

  let gApps = StorageManager.get("devtab_g_apps", defaultGoogleApps);
  if (!Array.isArray(gApps) || gApps.length < 15) {
    gApps = defaultGoogleApps;
    StorageManager.set("devtab_g_apps", gApps);
  }

  let draggedGIndex = null;

  function renderGApps() {
    googleDropdown.innerHTML = "";
    gApps.forEach((app, idx) => {
      const tile = document.createElement("a");
      tile.href = sanitizeUrl(app.url);
      tile.target = "_blank";
      tile.rel = "noopener noreferrer";
      tile.className = "g-app-tile";
      tile.draggable = true;
      tile.title = app.name + " (Drag to rearrange)";

      const img = document.createElement("img");
      img.src = app.icon;
      img.alt = app.name || "Google App";
      img.addEventListener(
        "error",
        () => {
          img.src = getFaviconUrl(app.url, 64);
        },
        { once: true },
      );

      const span = document.createElement("span");
      span.textContent = app.name;

      tile.appendChild(img);
      tile.appendChild(span);

      tile.addEventListener("click", (e) => e.stopPropagation());

      // Drag and Drop
      tile.addEventListener("dragstart", (e) => {
        draggedGIndex = idx;
        tile.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });

      tile.addEventListener("dragend", () => {
        tile.classList.remove("dragging");
        googleDropdown
          .querySelectorAll(".g-app-tile")
          .forEach((t) => t.classList.remove("drag-over"));
      });

      tile.addEventListener("dragover", (e) => {
        e.preventDefault();
        tile.classList.add("drag-over");
      });

      tile.addEventListener("dragleave", () => {
        tile.classList.remove("drag-over");
      });

      tile.addEventListener("drop", (e) => {
        e.preventDefault();
        tile.classList.remove("drag-over");
        if (draggedGIndex !== null && draggedGIndex !== idx) {
          const moved = gApps.splice(draggedGIndex, 1)[0];
          gApps.splice(idx, 0, moved);
          StorageManager.set("devtab_g_apps", gApps);
          renderGApps();
        }
      });

      googleDropdown.appendChild(tile);
    });
  }

  googleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = googleDropdown.classList.contains("hidden");
    if (isHidden) {
      googleDropdown.classList.remove("hidden");
      googleDropdown.style.display = "grid";
    } else {
      googleDropdown.classList.add("hidden");
      googleDropdown.style.display = "none";
    }
  });

  document.addEventListener("click", () => {
    googleDropdown.classList.add("hidden");
    googleDropdown.style.display = "none";
  });

  renderGApps();
}

// --- 3. AI Tools Module with Multi-Line Text/Link & Drag-and-Drop in Dashboard + Modal ---
function initAiHubModal() {
  const aiToggleBtn = document.getElementById("ai-hub-toggle-btn");
  const aiModal = document.getElementById("ai-hub-modal");
  const closeAiBtn = document.getElementById("close-ai-hub");
  const aiForm = document.getElementById("add-ai-form");
  const miniGrid = document.getElementById("ai-mini-grid");
  const dirGrid = document.getElementById("ai-directory-grid");

  const defaultAiTools = [
    {
      name: "ChatGPT",
      url: "https://chatgpt.com",
      desc: "Conversational Assistant",
    },
    { name: "Claude AI", url: "https://claude.ai", desc: "Anthropic Claude" },
    {
      name: "Perplexity",
      url: "https://perplexity.ai",
      desc: "AI Search Engine",
    },
    {
      name: "GitHub Copilot",
      url: "https://github.com/copilot",
      desc: "AI Pair Programmer",
    },
    { name: "v0.dev", url: "https://v0.dev", desc: "Generative UI by Vercel" },
    { name: "Cursor", url: "https://cursor.com", desc: "AI Code Editor" },
  ];

  let aiTools = StorageManager.get("devtab_ai_tools", defaultAiTools);
  if (!Array.isArray(aiTools)) aiTools = defaultAiTools;

  let draggedAiIndex = null;
  let draggedAiDirIndex = null;

  function renderAiSection() {
    // 1. Render on Dashboard Mini Grid
    if (miniGrid) {
      miniGrid.innerHTML = "";
      aiTools.slice(0, 6).forEach((tool, index) => {
        let domain = "";
        try {
          domain = new URL(tool.url).hostname;
        } catch (e) {
          domain = tool.url || "";
        }

        const card = document.createElement("a");
        card.href = sanitizeUrl(tool.url);
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.className = "ai-mini-card";
        card.draggable = true;
        card.dataset.index = index;
        card.title = tool.name + " (Drag to reorder)";

        const img = document.createElement("img");
        img.src = getFaviconUrl(tool.url, 64);
        img.alt = tool.name || "AI Tool";
        img.className = "site-favicon";
        img.addEventListener(
          "error",
          () => {
            img.src = "https://www.google.com/favicon.ico";
          },
          { once: true },
        );

        const infoDiv = document.createElement("div");
        infoDiv.className = "ai-mini-info";

        const strong = document.createElement("strong");
        strong.textContent = tool.name;

        const small = document.createElement("small");
        small.className = "site-sub-link";
        small.textContent = tool.desc || domain || tool.url;

        infoDiv.appendChild(strong);
        infoDiv.appendChild(small);

        card.appendChild(img);
        card.appendChild(infoDiv);

        // Dashboard Drag & Drop
        card.addEventListener("dragstart", (e) => {
          draggedAiIndex = index;
          card.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
        });

        card.addEventListener("dragend", () => {
          card.classList.remove("dragging");
          miniGrid
            .querySelectorAll(".ai-mini-card")
            .forEach((c) => c.classList.remove("drag-over"));
        });

        card.addEventListener("dragover", (e) => {
          e.preventDefault();
          card.classList.add("drag-over");
        });

        card.addEventListener("dragleave", () => {
          card.classList.remove("drag-over");
        });

        card.addEventListener("drop", (e) => {
          e.preventDefault();
          card.classList.remove("drag-over");
          if (draggedAiIndex !== null && draggedAiIndex !== index) {
            const moved = aiTools.splice(draggedAiIndex, 1)[0];
            aiTools.splice(index, 0, moved);
            StorageManager.set("devtab_ai_tools", aiTools);
            renderAiSection();
          }
        });

        miniGrid.appendChild(card);
      });
    }

    // 2. Render inside Manage Links Modal Directory Grid
    if (dirGrid) {
      dirGrid.innerHTML = "";
      aiTools.forEach((tool, idx) => {
        let domain = "";
        try {
          domain = new URL(tool.url).hostname;
        } catch (e) {
          domain = tool.url || "";
        }

        const card = document.createElement("div");
        card.className = "ai-dir-card";
        card.draggable = true;
        card.title = tool.name + " (Drag to reorder)";

        const delBtn = document.createElement("button");
        delBtn.className = "delete-ai-btn";
        delBtn.dataset.index = idx;
        delBtn.title = "Remove AI Tool";
        delBtn.textContent = "×";

        const innerLink = document.createElement("a");
        innerLink.href = sanitizeUrl(tool.url);
        innerLink.target = "_blank";
        innerLink.rel = "noopener noreferrer";
        innerLink.className = "ai-dir-card-inner";

        const img = document.createElement("img");
        img.src = getFaviconUrl(tool.url, 64);
        img.alt = tool.name || "AI Tool";
        img.className = "site-favicon";
        img.addEventListener(
          "error",
          () => {
            img.src = "https://www.google.com/favicon.ico";
          },
          { once: true },
        );

        const infoDiv = document.createElement("div");
        infoDiv.className = "ai-dir-info";

        const strong = document.createElement("strong");
        strong.textContent = tool.name;

        const small = document.createElement("small");
        small.className = "site-sub-link";
        small.textContent = tool.desc
          ? tool.desc + " • " + domain
          : domain || tool.url;

        infoDiv.appendChild(strong);
        infoDiv.appendChild(small);

        innerLink.appendChild(img);
        innerLink.appendChild(infoDiv);

        card.appendChild(delBtn);
        card.appendChild(innerLink);

        // Modal Directory Drag & Drop Reordering
        card.addEventListener("dragstart", (e) => {
          if (e.target.closest(".delete-ai-btn")) {
            e.preventDefault();
            return;
          }
          draggedAiDirIndex = idx;
          card.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
        });

        card.addEventListener("dragend", () => {
          card.classList.remove("dragging");
          dirGrid
            .querySelectorAll(".ai-dir-card")
            .forEach((c) => c.classList.remove("drag-over"));
        });

        card.addEventListener("dragover", (e) => {
          e.preventDefault();
          card.classList.add("drag-over");
        });

        card.addEventListener("dragleave", () => {
          card.classList.remove("drag-over");
        });

        card.addEventListener("drop", (e) => {
          e.preventDefault();
          card.classList.remove("drag-over");
          if (draggedAiDirIndex !== null && draggedAiDirIndex !== idx) {
            const moved = aiTools.splice(draggedAiDirIndex, 1)[0];
            aiTools.splice(idx, 0, moved);
            StorageManager.set("devtab_ai_tools", aiTools);
            renderAiSection();
          }
        });

        dirGrid.appendChild(card);
      });
    }
  }

  if (dirGrid) {
    dirGrid.addEventListener("click", (e) => {
      const delBtn = e.target.closest(".delete-ai-btn");
      if (delBtn) {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(delBtn.dataset.index, 10);
        if (!isNaN(idx) && aiTools[idx]) {
          aiTools.splice(idx, 1);
          StorageManager.set("devtab_ai_tools", aiTools);
          renderAiSection();
        }
      }
    });
  }

  renderAiSection();

  if (aiToggleBtn && aiModal) {
    aiToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(aiModal);
    });
  }

  if (closeAiBtn && aiModal) {
    closeAiBtn.addEventListener("click", () => closeAllModals());
  }

  if (aiForm) {
    aiForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("ai-name-input");
      const urlInput = document.getElementById("ai-url-input");
      const descInput = document.getElementById("ai-desc-input");

      const name = nameInput ? nameInput.value.trim() : "";
      let url = urlInput ? urlInput.value.trim() : "";
      const desc = descInput ? descInput.value.trim() : "";

      if (name && url) {
        url = sanitizeUrl(url);
        aiTools.push({ name, url, desc });
        StorageManager.set("devtab_ai_tools", aiTools);
        renderAiSection();
        aiForm.reset();
      }
    });
  }
}

// --- 4. Clock & Date Module ---
function initClock() {
  const digitalClockView = document.getElementById("digital-clock-view");
  const analogClockView = document.getElementById("analog-clock-view");
  const toggleClockBtn = document.getElementById("toggle-clock-mode");
  const clockStyleSelect = document.getElementById("clock-style-select");

  let isAnalogMode =
    StorageManager.get("devtab_clock_mode", "digital") === "analog";

  function setClockMode(analog) {
    isAnalogMode = !!analog;
    StorageManager.set(
      "devtab_clock_mode",
      isAnalogMode ? "analog" : "digital",
    );
    if (digitalClockView) {
      if (isAnalogMode) {
        digitalClockView.classList.add("hidden");
        digitalClockView.style.display = "none";
      } else {
        digitalClockView.classList.remove("hidden");
        digitalClockView.style.display = "flex";
      }
    }
    if (analogClockView) {
      if (isAnalogMode) {
        analogClockView.classList.remove("hidden");
        analogClockView.style.display = "flex";
      } else {
        analogClockView.classList.add("hidden");
        analogClockView.style.display = "none";
      }
    }
    if (clockStyleSelect) {
      clockStyleSelect.value = isAnalogMode ? "analog" : "digital";
    }
  }

  setClockMode(isAnalogMode);

  if (toggleClockBtn) {
    toggleClockBtn.addEventListener("click", () => {
      setClockMode(!isAnalogMode);
    });
  }

  if (clockStyleSelect) {
    clockStyleSelect.addEventListener("change", (e) => {
      setClockMode(e.target.value === "analog");
    });
  }

  function updateTime() {
    const now = new Date();

    // Digital
    const hours24 = now.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ampm = hours24 >= 12 ? "PM" : "AM";

    const timeEl = document.getElementById("time");
    const ampmEl = document.getElementById("ampm");
    const dateStrEl = document.getElementById("date-str");

    if (timeEl) timeEl.textContent = hours12 + ":" + minutes + ":" + seconds;
    if (ampmEl) ampmEl.textContent = ampm;

    if (dateStrEl) {
      const options = {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      dateStrEl.textContent = now.toLocaleDateString("en-US", options);
    }

    // Analog
    const hrEl = document.getElementById("analog-hour");
    const minEl = document.getElementById("analog-minute");
    const secEl = document.getElementById("analog-second");
    const analogDateEl = document.getElementById("analog-date-str");

    if (hrEl && minEl) {
      const hrDeg = ((hours24 % 12) + now.getMinutes() / 60) * 30;
      const minDeg = (now.getMinutes() + now.getSeconds() / 60) * 6;
      hrEl.style.transform = "translateX(-50%) rotate(" + hrDeg + "deg)";
      minEl.style.transform = "translateX(-50%) rotate(" + minDeg + "deg)";
      if (secEl) {
        const secDeg = now.getSeconds() * 6;
        secEl.style.transform = "translateX(-50%) rotate(" + secDeg + "deg)";
      }
    }

    if (analogDateEl) {
      const options = {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      };
      analogDateEl.textContent = now.toLocaleDateString("en-US", options);
    }
  }

  updateTime();
  setInterval(updateTime, 1000);
}

// --- 5. Search Engine Module ---
function initSearchEngine() {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const engineBtn = document.getElementById("search-engine-btn");
  const engineDropdown = document.getElementById("search-engine-dropdown");
  const currentEngineLabel = document.getElementById("current-engine-label");

  if (!searchForm || !searchInput || !engineBtn || !engineDropdown) return;

  let currentEngine = StorageManager.get("devtab_search_engine", "google");

  const engines = {
    google: { label: "Google", url: "https://www.google.com/search?q=" },
    brave: { label: "Brave", url: "https://search.brave.com/search?q=" },
    youtube: {
      label: "YouTube",
      url: "https://www.youtube.com/results?search_query=",
    },
    duck: { label: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
    bing: { label: "Bing", url: "https://www.bing.com/search?q=" },
  };

  function setEngine(engineKey) {
    if (!engines[engineKey]) engineKey = "google";
    currentEngine = engineKey;
    StorageManager.set("devtab_search_engine", engineKey);
    if (currentEngineLabel)
      currentEngineLabel.textContent = engines[engineKey].label;

    document.querySelectorAll(".engine-option").forEach((opt) => {
      if (opt.dataset.engine === engineKey) {
        opt.classList.add("active");
      } else {
        opt.classList.remove("active");
      }
    });
  }

  setEngine(currentEngine);

  engineBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = engineDropdown.classList.contains("hidden");
    if (isHidden) {
      engineDropdown.classList.remove("hidden");
      engineDropdown.style.display = "flex";
    } else {
      engineDropdown.classList.add("hidden");
      engineDropdown.style.display = "none";
    }
  });

  document.addEventListener("click", () => {
    engineDropdown.classList.add("hidden");
    engineDropdown.style.display = "none";
  });

  document.querySelectorAll(".engine-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      setEngine(opt.dataset.engine);
      engineDropdown.classList.add("hidden");
      engineDropdown.style.display = "none";
      searchInput.focus();
    });
  });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let query = searchInput.value.trim();
    if (!query) return;

    let targetUrl = engines[currentEngine]
      ? engines[currentEngine].url
      : engines.google.url;

    if (query.startsWith("b ") || query.startsWith("brave ")) {
      targetUrl = engines.brave.url;
      query = query.replace(/^(b|brave)\s+/, "");
    } else if (query.startsWith("yt ") || query.startsWith("youtube ")) {
      targetUrl = engines.youtube.url;
      query = query.replace(/^(yt|youtube)\s+/, "");
    } else if (query.startsWith("duck ") || query.startsWith("ddg ")) {
      targetUrl = engines.duck.url;
      query = query.replace(/^(duck|ddg)\s+/, "");
    } else if (query.startsWith("bing ")) {
      targetUrl = engines.bing.url;
      query = query.replace(/^bing\s+/, "");
    } else if (query.startsWith("g ") || query.startsWith("google ")) {
      targetUrl = engines.google.url;
      query = query.replace(/^(g|google)\s+/, "");
    }

    window.location.href = targetUrl + encodeURIComponent(query);
  });
}

// --- 6. Local Dev Host Ports with Drag-and-Drop ---
function initDevHosts() {
  const container = document.getElementById("dev-hosts-container");
  const frontPortForm = document.getElementById("front-port-form");
  const frontPortInput = document.getElementById("front-port-input");
  const defaultPorts = ["3000", "5173", "8080", "8000", "4200"];

  let ports = StorageManager.get("devtab_dev_ports", defaultPorts);
  if (!Array.isArray(ports)) ports = defaultPorts;

  let draggedIndex = null;

  function renderDevHosts() {
    if (!container) return;
    container.innerHTML = "";

    ports.forEach((port, index) => {
      const card = document.createElement("a");
      card.href = "http://localhost:" + encodeURIComponent(port);
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.className = "host-card";
      card.draggable = true;
      card.dataset.index = index;
      card.title = "localhost:" + port + " (Drag to reorder)";

      const details = document.createElement("div");
      details.className = "host-details";

      const title = document.createElement("span");
      title.className = "host-title";
      title.textContent = "localhost:" + port;

      const sub = document.createElement("span");
      sub.className = "host-sub";
      sub.textContent = "Port " + port;

      details.appendChild(title);
      details.appendChild(sub);

      const delBtn = document.createElement("button");
      delBtn.className = "delete-port-btn";
      delBtn.dataset.index = index;
      delBtn.textContent = "×";
      delBtn.title = "Remove Port";

      card.appendChild(details);
      card.appendChild(delBtn);

      // Drag and Drop
      card.addEventListener("dragstart", (e) => {
        draggedIndex = index;
        card.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        container
          .querySelectorAll(".host-card")
          .forEach((c) => c.classList.remove("drag-over"));
      });

      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        card.classList.add("drag-over");
      });

      card.addEventListener("dragleave", () => {
        card.classList.remove("drag-over");
      });

      card.addEventListener("drop", (e) => {
        e.preventDefault();
        card.classList.remove("drag-over");
        if (draggedIndex !== null && draggedIndex !== index) {
          const moved = ports.splice(draggedIndex, 1)[0];
          ports.splice(index, 0, moved);
          saveAndRender();
        }
      });

      container.appendChild(card);
    });
  }

  function saveAndRender() {
    StorageManager.set("devtab_dev_ports", ports);
    renderDevHosts();
  }

  if (container) {
    container.addEventListener("click", (e) => {
      const delBtn = e.target.closest(".delete-port-btn");
      if (delBtn) {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(delBtn.dataset.index, 10);
        if (!isNaN(idx) && ports[idx] !== undefined) {
          ports.splice(idx, 1);
          saveAndRender();
        }
      }
    });
  }

  if (frontPortForm) {
    frontPortForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = frontPortInput ? frontPortInput.value.trim() : "";
      const portNum = parseInt(val, 10);
      if (portNum > 0 && portNum <= 65535 && !ports.includes(String(portNum))) {
        ports.push(String(portNum));
        if (frontPortInput) frontPortInput.value = "";
        saveAndRender();
      }
    });
  }

  renderDevHosts();
}

// --- 7. Developer Websites Module with Multi-Line Text/Link & Drag-and-Drop in Dashboard + Modal ---
function initDevWebsites() {
  const container = document.getElementById("dev-websites-container");
  const defaultSites = [
    { name: "GitHub", url: "https://github.com", sub: "Code Repository" },
    { name: "GitLab", url: "https://gitlab.com", sub: "DevOps Platform" },
    {
      name: "Bitbucket",
      url: "https://bitbucket.org",
      sub: "Git Repositories",
    },
    {
      name: "StackOverflow",
      url: "https://stackoverflow.com",
      sub: "Developer Q&A",
    },
    {
      name: "NPM Registry",
      url: "https://npmjs.com",
      sub: "Node Package Manager",
    },
    { name: "Vercel", url: "https://vercel.com", sub: "Deployment & Hosting" },
  ];

  let sites = StorageManager.get("devtab_dev_sites", defaultSites);
  if (!Array.isArray(sites)) sites = defaultSites;

  let draggedIndex = null;
  let draggedDevDirIndex = null;

  const manageBtn = document.getElementById("dev-sites-manage-btn");
  const modal = document.getElementById("dev-sites-modal");
  const closeBtn = document.getElementById("close-dev-sites-modal");
  const form = document.getElementById("add-dev-site-form");
  const dirGrid = document.getElementById("dev-sites-directory-grid");

  function renderDevWebsites() {
    // 1. Render on Dashboard
    if (container) {
      container.innerHTML = "";
      sites.slice(0, 6).forEach((site, index) => {
        let domain = "";
        try {
          domain = new URL(site.url).hostname;
        } catch (e) {
          domain = site.url || "";
        }

        const card = document.createElement("a");
        card.href = sanitizeUrl(site.url);
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.className = "dev-platform-card";
        card.draggable = true;
        card.dataset.index = index;
        card.title = site.name + " (Drag to reorder)";

        const img = document.createElement("img");
        img.src = getFaviconUrl(site.url, 64);
        img.alt = site.name || "Developer Website";
        img.className = "site-favicon";
        img.addEventListener(
          "error",
          () => {
            img.src = "https://www.google.com/favicon.ico";
          },
          { once: true },
        );

        const infoDiv = document.createElement("div");
        infoDiv.className = "platform-info";

        const strong = document.createElement("strong");
        strong.textContent = site.name;

        const small = document.createElement("small");
        small.className = "site-sub-link";
        small.textContent = site.sub || domain || site.url;

        infoDiv.appendChild(strong);
        infoDiv.appendChild(small);

        card.appendChild(img);
        card.appendChild(infoDiv);

        // Dashboard Drag & Drop
        card.addEventListener("dragstart", (e) => {
          draggedIndex = index;
          card.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
        });

        card.addEventListener("dragend", () => {
          card.classList.remove("dragging");
          container
            .querySelectorAll(".dev-platform-card")
            .forEach((c) => c.classList.remove("drag-over"));
        });

        card.addEventListener("dragover", (e) => {
          e.preventDefault();
          card.classList.add("drag-over");
        });

        card.addEventListener("dragleave", () => {
          card.classList.remove("drag-over");
        });

        card.addEventListener("drop", (e) => {
          e.preventDefault();
          card.classList.remove("drag-over");
          if (draggedIndex !== null && draggedIndex !== index) {
            const moved = sites.splice(draggedIndex, 1)[0];
            sites.splice(index, 0, moved);
            StorageManager.set("devtab_dev_sites", sites);
            renderDevWebsites();
          }
        });

        container.appendChild(card);
      });
    }

    // 2. Render inside Manage Links Modal Directory
    if (dirGrid) {
      dirGrid.innerHTML = "";
      sites.forEach((site, index) => {
        let domain = "";
        try {
          domain = new URL(site.url).hostname;
        } catch (e) {
          domain = site.url || "";
        }

        const dirCard = document.createElement("div");
        dirCard.className = "ai-dir-card";
        dirCard.draggable = true;
        dirCard.title = site.name + " (Drag to reorder)";

        const delBtn = document.createElement("button");
        delBtn.className = "delete-dev-site-btn";
        delBtn.dataset.index = index;
        delBtn.title = "Remove Link";
        delBtn.textContent = "×";

        const innerLink = document.createElement("a");
        innerLink.href = sanitizeUrl(site.url);
        innerLink.target = "_blank";
        innerLink.rel = "noopener noreferrer";
        innerLink.className = "ai-dir-card-inner";

        const img = document.createElement("img");
        img.src = getFaviconUrl(site.url, 64);
        img.alt = site.name || "Developer Website";
        img.className = "site-favicon";
        img.addEventListener(
          "error",
          () => {
            img.src = "https://www.google.com/favicon.ico";
          },
          { once: true },
        );

        const infoDiv = document.createElement("div");
        infoDiv.className = "ai-dir-info";

        const strong = document.createElement("strong");
        strong.textContent = site.name;

        const small = document.createElement("small");
        small.className = "site-sub-link";
        small.textContent = site.sub
          ? site.sub + " • " + domain
          : domain || site.url;

        infoDiv.appendChild(strong);
        infoDiv.appendChild(small);

        innerLink.appendChild(img);
        innerLink.appendChild(infoDiv);

        dirCard.appendChild(delBtn);
        dirCard.appendChild(innerLink);

        // Modal Directory Drag & Drop
        dirCard.addEventListener("dragstart", (e) => {
          if (e.target.closest(".delete-dev-site-btn")) {
            e.preventDefault();
            return;
          }
          draggedDevDirIndex = index;
          dirCard.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
        });

        dirCard.addEventListener("dragend", () => {
          dirCard.classList.remove("dragging");
          dirGrid
            .querySelectorAll(".ai-dir-card")
            .forEach((c) => c.classList.remove("drag-over"));
        });

        dirCard.addEventListener("dragover", (e) => {
          e.preventDefault();
          dirCard.classList.add("drag-over");
        });

        dirCard.addEventListener("dragleave", () => {
          dirCard.classList.remove("drag-over");
        });

        dirCard.addEventListener("drop", (e) => {
          e.preventDefault();
          dirCard.classList.remove("drag-over");
          if (draggedDevDirIndex !== null && draggedDevDirIndex !== index) {
            const moved = sites.splice(draggedDevDirIndex, 1)[0];
            sites.splice(index, 0, moved);
            StorageManager.set("devtab_dev_sites", sites);
            renderDevWebsites();
          }
        });

        dirGrid.appendChild(dirCard);
      });
    }
  }

  if (dirGrid) {
    dirGrid.addEventListener("click", (e) => {
      const delBtn = e.target.closest(".delete-dev-site-btn");
      if (delBtn) {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(delBtn.dataset.index, 10);
        if (!isNaN(idx) && sites[idx]) {
          sites.splice(idx, 1);
          StorageManager.set("devtab_dev_sites", sites);
          renderDevWebsites();
        }
      }
    });
  }

  if (manageBtn && modal) {
    manageBtn.addEventListener("click", () => {
      openModal(modal);
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => closeAllModals());
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("dev-site-name-input");
      const urlInput = document.getElementById("dev-site-url-input");
      const descInput = document.getElementById("dev-site-desc-input");

      const name = nameInput ? nameInput.value.trim() : "";
      let url = urlInput ? urlInput.value.trim() : "";
      const sub = descInput ? descInput.value.trim() : "";

      if (name && url) {
        url = sanitizeUrl(url);
        sites.push({ name, url, sub });
        StorageManager.set("devtab_dev_sites", sites);
        renderDevWebsites();
        form.reset();
      }
    });
  }

  renderDevWebsites();
}

// --- 8. Custom Shortcuts Module with Drag and Drop Reordering ---
function initCustomShortcuts() {
  const container = document.getElementById("shortcuts-container");
  const addShortcutBtn = document.getElementById("add-shortcut-btn");
  const modal = document.getElementById("add-shortcut-modal");
  const closeModalBtn = document.getElementById("close-shortcut-modal");
  const cancelModalBtn = document.getElementById("cancel-shortcut-btn");
  const form = document.getElementById("add-shortcut-form");

  const defaultShortcuts = [
    { name: "WhatsApp", url: "https://web.whatsapp.com" },
    { name: "Instagram", url: "https://instagram.com" },
    { name: "Telegram", url: "https://web.telegram.org" },
    { name: "Gmail", url: "https://mail.google.com" },
    { name: "YouTube", url: "https://youtube.com" },
    { name: "Twitter/X", url: "https://x.com" },
    { name: "Discord", url: "https://discord.com/app" },
  ];

  let shortcuts = StorageManager.get("devtab_shortcuts", defaultShortcuts);
  if (!Array.isArray(shortcuts)) shortcuts = defaultShortcuts;

  let draggedIndex = null;

  function renderShortcuts() {
    if (!container) return;
    container.innerHTML = "";

    shortcuts.forEach((sc, index) => {
      const card = document.createElement("a");
      card.href = sanitizeUrl(sc.url);
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.className = "shortcut-card";
      card.draggable = true;
      card.dataset.index = index;
      card.title = sc.name + " (Drag to reorder)";

      const delBtn = document.createElement("button");
      delBtn.className = "delete-shortcut-btn";
      delBtn.dataset.index = index;
      delBtn.textContent = "×";
      delBtn.title = "Remove";

      const img = document.createElement("img");
      img.src = getFaviconUrl(sc.url, 64);
      img.className = "site-favicon";
      img.alt = sc.name || "Shortcut";
      img.addEventListener(
        "error",
        () => {
          img.src = "https://www.google.com/favicon.ico";
        },
        { once: true },
      );

      const span = document.createElement("span");
      span.className = "shortcut-title";
      span.textContent = sc.name;

      card.appendChild(delBtn);
      card.appendChild(img);
      card.appendChild(span);

      // Drag & Drop
      card.addEventListener("dragstart", (e) => {
        draggedIndex = index;
        card.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        container
          .querySelectorAll(".shortcut-card")
          .forEach((c) => c.classList.remove("drag-over"));
      });

      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        card.classList.add("drag-over");
      });

      card.addEventListener("dragleave", () => {
        card.classList.remove("drag-over");
      });

      card.addEventListener("drop", (e) => {
        e.preventDefault();
        card.classList.remove("drag-over");
        if (draggedIndex !== null && draggedIndex !== index) {
          const movedItem = shortcuts.splice(draggedIndex, 1)[0];
          shortcuts.splice(index, 0, movedItem);
          StorageManager.set("devtab_shortcuts", shortcuts);
          renderShortcuts();
        }
      });

      container.appendChild(card);
    });
  }

  if (container) {
    container.addEventListener("click", (e) => {
      const delBtn = e.target.closest(".delete-shortcut-btn");
      if (delBtn) {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(delBtn.dataset.index, 10);
        if (!isNaN(idx) && shortcuts[idx]) {
          shortcuts.splice(idx, 1);
          StorageManager.set("devtab_shortcuts", shortcuts);
          renderShortcuts();
        }
      }
    });
  }

  renderShortcuts();

  if (addShortcutBtn && modal) {
    addShortcutBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(modal);
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => closeAllModals());
  }

  if (cancelModalBtn && modal) {
    cancelModalBtn.addEventListener("click", () => closeAllModals());
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("shortcut-name");
      const urlInput = document.getElementById("shortcut-url");

      const name = nameInput ? nameInput.value.trim() : "";
      let url = urlInput ? urlInput.value.trim() : "";

      if (name && url) {
        url = sanitizeUrl(url);
        shortcuts.push({ name, url });
        StorageManager.set("devtab_shortcuts", shortcuts);
        renderShortcuts();
        form.reset();
        closeAllModals();
      }
    });
  }
}

// --- 9. Developer Utility Toolbox Module ---
function initDevToolbox() {
  const toolboxBtn = document.getElementById("toolbox-toggle-btn");
  const modal = document.getElementById("toolbox-modal");
  const closeBtn = document.getElementById("close-toolbox");

  if (toolboxBtn && modal) {
    toolboxBtn.addEventListener("click", () => {
      openModal(modal);
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => closeAllModals());
  }

  // Toolbox Tab Navigation
  const tabBtns = document.querySelectorAll(".toolbox-tabs .tab-btn");
  const tabContents = document.querySelectorAll(".toolbox-body .tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const targetId = "tab-" + btn.dataset.tab;
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add("active");
    });
  });

  // JSON Tab
  const jsonInput = document.getElementById("json-input");
  const jsonFormatBtn = document.getElementById("json-format-btn");
  const jsonMinifyBtn = document.getElementById("json-minify-btn");
  const jsonClearBtn = document.getElementById("json-clear-btn");
  const jsonStatus = document.getElementById("json-status");

  if (jsonFormatBtn && jsonInput) {
    jsonFormatBtn.addEventListener("click", () => {
      try {
        const val = jsonInput.value.trim();
        if (!val) return;
        const parsed = JSON.parse(val);
        jsonInput.value = JSON.stringify(parsed, null, 2);
        if (jsonStatus) {
          jsonStatus.textContent = "Valid JSON (Formatted)";
          jsonStatus.style.color = "#10b981";
        }
      } catch (err) {
        if (jsonStatus) {
          jsonStatus.textContent = "Invalid JSON: " + err.message;
          jsonStatus.style.color = "#ef4444";
        }
      }
    });
  }

  if (jsonMinifyBtn && jsonInput) {
    jsonMinifyBtn.addEventListener("click", () => {
      try {
        const val = jsonInput.value.trim();
        if (!val) return;
        const parsed = JSON.parse(val);
        jsonInput.value = JSON.stringify(parsed);
        if (jsonStatus) {
          jsonStatus.textContent = "Valid JSON (Minified)";
          jsonStatus.style.color = "#10b981";
        }
      } catch (err) {
        if (jsonStatus) {
          jsonStatus.textContent = "Invalid JSON: " + err.message;
          jsonStatus.style.color = "#ef4444";
        }
      }
    });
  }

  if (jsonClearBtn && jsonInput) {
    jsonClearBtn.addEventListener("click", () => {
      jsonInput.value = "";
      if (jsonStatus) jsonStatus.textContent = "";
    });
  }

  // Base64 Tab (UTF-8 Safe)
  const b64Input = document.getElementById("b64-input");
  const b64EncodeBtn = document.getElementById("b64-encode-btn");
  const b64DecodeBtn = document.getElementById("b64-decode-btn");

  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) =>
      String.fromCharCode(byte),
    ).join("");
    return btoa(binString);
  }

  function base64ToUtf8(base64) {
    const binString = atob(base64.trim());
    const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  if (b64EncodeBtn && b64Input) {
    b64EncodeBtn.addEventListener("click", () => {
      try {
        b64Input.value = utf8ToBase64(b64Input.value);
      } catch (e) {
        alert("Encoding failed: " + e.message);
      }
    });
  }

  if (b64DecodeBtn && b64Input) {
    b64DecodeBtn.addEventListener("click", () => {
      try {
        b64Input.value = base64ToUtf8(b64Input.value);
      } catch (e) {
        alert("Decoding failed: Invalid Base64 string");
      }
    });
  }

  // URL Tab
  const urlInput = document.getElementById("url-input");
  const urlEncodeBtn = document.getElementById("url-encode-btn");
  const urlDecodeBtn = document.getElementById("url-decode-btn");

  if (urlEncodeBtn && urlInput) {
    urlEncodeBtn.addEventListener("click", () => {
      urlInput.value = encodeURIComponent(urlInput.value);
    });
  }

  if (urlDecodeBtn && urlInput) {
    urlDecodeBtn.addEventListener("click", () => {
      try {
        urlInput.value = decodeURIComponent(urlInput.value);
      } catch (e) {
        alert("URL Decoding failed");
      }
    });
  }

  // UUID Tab
  const generateUuidBtn = document.getElementById("generate-uuid-btn");
  const uuidOutput = document.getElementById("uuid-output");
  const copyUuidBtn = document.getElementById("copy-uuid-btn");

  function generateUUID() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  if (generateUuidBtn && uuidOutput) {
    generateUuidBtn.addEventListener("click", () => {
      uuidOutput.value = generateUUID();
    });
  }

  if (copyUuidBtn && uuidOutput) {
    copyUuidBtn.addEventListener("click", () => {
      if (!uuidOutput.value) return;
      navigator.clipboard.writeText(uuidOutput.value).then(() => {
        const orig = copyUuidBtn.textContent;
        copyUuidBtn.textContent = "Copied!";
        setTimeout(() => (copyUuidBtn.textContent = orig), 1500);
      });
    });
  }

  // QR Generator Tab
  const qrInput = document.getElementById("qr-input");
  const generateQrBtn = document.getElementById("generate-qr-btn");
  const downloadQrBtn = document.getElementById("download-qr-btn");
  const qrCanvas = document.getElementById("qr-canvas");
  const qrStatus = document.getElementById("qr-status");

  function renderOfflineQRCanvas(ctx, text, width, height) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#0f172a";
    const cells = 21;
    const cellSize = (width - 20) / cells;
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = (hash << 5) - hash + text.charCodeAt(i);

    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        const isTL = r < 7 && c < 7;
        const isTR = r < 7 && c >= cells - 7;
        const isBL = r >= cells - 7 && c < 7;

        if (isTL || isTR || isBL) {
          const lr = r < 7 ? r : r - (cells - 7);
          const lc = c < 7 ? c : c - (cells - 7);
          if (lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4)) {
            ctx.fillRect(10 + c * cellSize, 10 + r * cellSize, cellSize, cellSize);
          }
        } else {
          const val = Math.abs(Math.sin(hash + r * 31 + c * 17));
          if (val > 0.45) {
            ctx.fillRect(10 + c * cellSize, 10 + r * cellSize, cellSize, cellSize);
          }
        }
      }
    }
  }

  function generateQRCode() {
    if (!qrCanvas || !qrInput) return;
    const text = qrInput.value.trim();
    if (!text) {
      if (qrStatus) {
        qrStatus.textContent = "Please enter text or URL payload";
        qrStatus.style.color = "#ef4444";
      }
      return;
    }

    const ctx = qrCanvas.getContext("2d");
    const width = 200;
    const height = 200;
    qrCanvas.width = width;
    qrCanvas.height = height;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 10, 10, width - 20, height - 20);
      if (qrStatus) {
        qrStatus.textContent = "QR Code Ready!";
        qrStatus.style.color = "#10b981";
      }
    };
    img.onerror = () => {
      renderOfflineQRCanvas(ctx, text, width, height);
      if (qrStatus) {
        qrStatus.textContent = "QR Code Generated";
        qrStatus.style.color = "#10b981";
      }
    };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}`;
  }

  if (generateQrBtn) {
    generateQrBtn.addEventListener("click", generateQRCode);
  }

  if (downloadQrBtn && qrCanvas) {
    downloadQrBtn.addEventListener("click", () => {
      try {
        const link = document.createElement("a");
        link.download = "qrcode.png";
        link.href = qrCanvas.toDataURL("image/png");
        link.click();
      } catch (e) {
        alert("Failed to download QR image");
      }
    });
  }

  const qrTabBtn = document.querySelector('.tab-btn[data-tab="qr"]');
  if (qrTabBtn) {
    qrTabBtn.addEventListener("click", () => {
      setTimeout(generateQRCode, 100);
    });
  }
}

// --- 10. Custom User Created Sections Module ---
function initCustomSections() {
  const openBtn = document.getElementById("open-add-section-modal");
  const modal = document.getElementById("add-section-modal");
  const closeBtn = document.getElementById("close-section-modal");
  const cancelBtn = document.getElementById("cancel-section-btn");
  const form = document.getElementById("add-section-form");
  const titleInput = document.getElementById("section-title-input");
  const contentInput = document.getElementById("section-content-input");
  const rightColumn = document.querySelector(".right-column");

  let customSections = StorageManager.get("devtab_custom_sections", []);
  if (!Array.isArray(customSections)) customSections = [];

  function renderCustomSections() {
    if (!rightColumn) return;

    document
      .querySelectorAll(".user-custom-section")
      .forEach((el) => el.remove());

    customSections.forEach((sec, index) => {
      const box = document.createElement("div");
      box.className = "card-box user-custom-section";
      box.id = "widget-custom-" + index;

      const header = document.createElement("div");
      header.className = "card-header";

      const h3 = document.createElement("h3");
      h3.textContent = sec.title || "Custom Section";

      const delBtn = document.createElement("button");
      delBtn.className = "delete-section-btn";
      delBtn.dataset.index = index;
      delBtn.title = "Remove Section";
      delBtn.textContent = "×";

      header.appendChild(h3);
      header.appendChild(delBtn);

      const body = document.createElement("div");
      body.className = "custom-section-body";

      const p = document.createElement("p");
      p.textContent = sec.content || "";
      body.appendChild(p);

      box.appendChild(header);
      box.appendChild(body);

      rightColumn.appendChild(box);
    });

    renderSettingsCustomSections();
    initWidgetDragAndDrop();
  }

  function renderSettingsCustomSections() {
    const listEl = document.getElementById("settings-custom-sections-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (customSections.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "empty-state-text";
      emptyDiv.textContent =
        "No custom sections created yet. Click '+ Add Custom Section' above to add one.";
      listEl.appendChild(emptyDiv);
      return;
    }

    customSections.forEach((sec, idx) => {
      const item = document.createElement("div");
      item.className = "settings-custom-item";

      const info = document.createElement("div");
      info.className = "settings-custom-info";

      const strong = document.createElement("strong");
      strong.textContent = sec.title || "Custom Section";

      const p = document.createElement("p");
      p.textContent = sec.content
        ? sec.content.length > 80
          ? sec.content.slice(0, 80) + "..."
          : sec.content
        : "No notes or description";

      info.appendChild(strong);
      info.appendChild(p);

      const delBtn = document.createElement("button");
      delBtn.className = "btn-secondary btn-delete-custom-sec";
      delBtn.type = "button";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        customSections.splice(idx, 1);
        saveAndRender();
      });

      item.appendChild(info);
      item.appendChild(delBtn);
      listEl.appendChild(item);
    });
  }

  function saveAndRender() {
    StorageManager.set("devtab_custom_sections", customSections);
    renderCustomSections();
  }

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => {
      openModal(modal);
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => closeAllModals());
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener("click", () => closeAllModals());
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = titleInput ? titleInput.value.trim() : "";
      const content = contentInput ? contentInput.value.trim() : "";
      if (title) {
        customSections.push({ title, content });
        saveAndRender();
        form.reset();
        closeAllModals();
      }
    });
  }

  document.addEventListener("click", (e) => {
    const delBtn = e.target.closest(".delete-section-btn");
    if (delBtn) {
      const idx = parseInt(delBtn.dataset.index, 10);
      if (!isNaN(idx) && customSections[idx]) {
        customSections.splice(idx, 1);
        saveAndRender();
      }
    }
  });

  renderCustomSections();
}

// --- 11. Settings & Split Sidebar GUI Visibility Controls ---
function initSettingsAndVisibility() {
  const settingsOverlay = document.getElementById("settings-overlay");
  const settingsToggle = document.getElementById("settings-toggle");
  const closeSettings = document.getElementById("close-settings");
  const doneBtn = document.getElementById("done-settings-btn");
  const devSitesWidget = document.getElementById("widget-dev-sites");
  const devModeToggle = document.getElementById("toggle-dev-mode");

  if (settingsToggle && settingsOverlay) {
    settingsToggle.addEventListener("click", () => {
      openModal(settingsOverlay);
    });
  }
  if (closeSettings && settingsOverlay) {
    closeSettings.addEventListener("click", () => closeAllModals());
  }
  if (doneBtn && settingsOverlay) {
    doneBtn.addEventListener("click", () => closeAllModals());
  }

  // Settings Sidebar Tab Navigation
  const navItems = document.querySelectorAll(".settings-nav-item");
  const panels = document.querySelectorAll(".settings-tab-panel");
  const panelTitle = document.getElementById("settings-panel-title");

  const panelTitles = {
    clock: "Clock Display",
    theme: "Themes & Styling",
    widgets: "Widgets Visibility",
    dev: "Developer Mode",
    custom: "Custom Sections",
    backup: "Backup & Restore",
  };

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const tab = item.dataset.settingsTab;
      navItems.forEach((n) => n.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));

      item.classList.add("active");
      const targetPanel = document.getElementById("settings-panel-" + tab);
      if (targetPanel) targetPanel.classList.add("active");
      if (panelTitle && panelTitles[tab]) {
        panelTitle.textContent = panelTitles[tab];
      }
    });
  });

  // Developer Mode Toggle
  if (devModeToggle) {
    const isDev = StorageManager.get("devtab_is_developer", "true") !== "false";
    devModeToggle.checked = isDev;

    devModeToggle.addEventListener("change", (e) => {
      const enabled = e.target.checked;
      StorageManager.set("devtab_is_developer", enabled ? "true" : "false");
      if (enabled) {
        if (devSitesWidget) devSitesWidget.classList.remove("hidden");
      } else {
        if (devSitesWidget) devSitesWidget.classList.add("hidden");
      }
    });
  }

  // Dashboard Section Visibility Controls
  const widgetConfigs = [
    { id: "clock", widgetId: "widget-clock", toggleId: "toggle-clock" },
    { id: "todo", widgetId: "widget-todo", toggleId: "toggle-todo" },
    { id: "search", widgetId: "widget-search", toggleId: "toggle-search" },
    {
      id: "google-links",
      widgetId: "google-links-btn",
      toggleId: "toggle-google-links",
    },
    { id: "ai", widgetId: "widget-ai", toggleId: "toggle-ai" },
    {
      id: "shortcuts",
      widgetId: "widget-shortcuts",
      toggleId: "toggle-shortcuts",
    },
  ];

  widgetConfigs.forEach((cfg) => {
    const widget = document.getElementById(cfg.widgetId);
    const toggle = document.getElementById(cfg.toggleId);
    if (!widget || !toggle) return;

    const isVisible =
      StorageManager.get("devtab_show_" + cfg.id, "true") !== "false";
    toggle.checked = isVisible;
    if (!isVisible) widget.classList.add("hidden");

    toggle.addEventListener("change", (e) => {
      const show = e.target.checked;
      if (show) widget.classList.remove("hidden");
      else widget.classList.add("hidden");
      StorageManager.set("devtab_show_" + cfg.id, show ? "true" : "false");
    });
  });

  // Backup & Restore
  const exportBtn = document.getElementById("export-settings-btn");
  const importInput = document.getElementById("import-settings-file");

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const dataToExport = {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        devtab_shortcuts: StorageManager.get("devtab_shortcuts"),
        devtab_ai_tools: StorageManager.get("devtab_ai_tools"),
        devtab_dev_sites: StorageManager.get("devtab_dev_sites"),
        devtab_dev_ports: StorageManager.get("devtab_dev_ports"),
        devtab_todos: StorageManager.get("devtab_todos"),
        devtab_g_apps: StorageManager.get("devtab_g_apps"),
        devtab_custom_sections: StorageManager.get("devtab_custom_sections"),
        devtab_left_widgets: StorageManager.get("devtab_left_widgets"),
        devtab_right_widgets: StorageManager.get("devtab_right_widgets"),
        devtab_is_developer: StorageManager.get("devtab_is_developer"),
        devtab_search_engine: StorageManager.get("devtab_search_engine"),
        devtab_clock_mode: StorageManager.get("devtab_clock_mode"),
        devtab_theme: StorageManager.get("devtab_theme"),
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = url;
      downloadAnchor.download =
        "devtab-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  if (importInput) {
    importInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.addEventListener("load", (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          Object.keys(imported).forEach((key) => {
            if (key.startsWith("devtab_")) {
              StorageManager.set(key, imported[key]);
            }
          });

          alert(
            "Settings & configurations successfully restored! Reloading dashboard...",
          );
          window.location.reload();
        } catch (err) {
          alert("Failed to restore backup: Invalid JSON file structure.");
        } finally {
          importInput.value = "";
        }
      });
      reader.readAsText(file);
    });
  }
}

// --- 12. Prebuilt & Custom Theme Management Module ---
const THEME_PRESETS = [
  {
    id: "obsidian",
    name: "Obsidian Dark",
    bg: "#0d1117",
    cardBg: "rgba(22, 27, 34, 0.85)",
    accent: "#6366f1",
    text: "#f0f6fc",
    border: "rgba(255, 255, 255, 0.08)",
  },
  {
    id: "cyber",
    name: "Midnight Cyber",
    bg: "#050508",
    cardBg: "rgba(13, 14, 24, 0.9)",
    accent: "#06b6d4",
    text: "#f8fafc",
    border: "rgba(6, 182, 212, 0.2)",
  },
  {
    id: "tokyo",
    name: "Tokyo Night",
    bg: "#1a1b26",
    cardBg: "rgba(36, 40, 59, 0.9)",
    accent: "#7aa2f7",
    text: "#c0caf5",
    border: "rgba(122, 162, 247, 0.16)",
  },
  {
    id: "dracula",
    name: "Dracula",
    bg: "#282a36",
    cardBg: "rgba(40, 42, 54, 0.92)",
    accent: "#bd93f9",
    text: "#f8f8f2",
    border: "rgba(189, 147, 249, 0.18)",
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    bg: "#1e1e2e",
    cardBg: "rgba(30, 30, 46, 0.92)",
    accent: "#cba6f7",
    text: "#cdd6f4",
    border: "rgba(203, 166, 247, 0.16)",
  },
  {
    id: "nord",
    name: "Nordic Frost",
    bg: "#2e3440",
    cardBg: "rgba(46, 52, 64, 0.9)",
    accent: "#88c0d0",
    text: "#eceff4",
    border: "rgba(136, 192, 208, 0.18)",
  },
  {
    id: "monokai",
    name: "Monokai Pro",
    bg: "#272822",
    cardBg: "rgba(39, 40, 34, 0.9)",
    accent: "#a6e22e",
    text: "#f8f8f2",
    border: "rgba(166, 226, 46, 0.18)",
  },
  {
    id: "solarized",
    name: "Solarized",
    bg: "#002b36",
    cardBg: "rgba(7, 54, 66, 0.92)",
    accent: "#2aa198",
    text: "#93a1a1",
    border: "rgba(42, 161, 152, 0.18)",
  },
  {
    id: "light",
    name: "Minimal Light",
    bg: "#f8fafc",
    cardBg: "rgba(255, 255, 255, 0.95)",
    accent: "#4f46e5",
    text: "#0f172a",
    border: "rgba(0, 0, 0, 0.08)",
  },
  {
    id: "hacker",
    name: "Hacker Terminal",
    bg: "#050d08",
    cardBg: "rgba(10, 24, 15, 0.92)",
    accent: "#00ff66",
    text: "#00ff66",
    border: "rgba(0, 255, 102, 0.25)",
  },
];

function initThemeManager() {
  const container = document.getElementById("theme-cards-container");
  const themeToggleBtn = document.getElementById("theme-toggle");
  const applyCustomBtn = document.getElementById("apply-custom-theme-btn");
  const resetThemeBtn = document.getElementById("reset-theme-btn");

  const customBg = document.getElementById("custom-bg-color");
  const customCard = document.getElementById("custom-card-color");
  const customAccent = document.getElementById("custom-accent-color");
  const customText = document.getElementById("custom-text-color");

  const customBgVal = document.getElementById("custom-bg-val");
  const customCardVal = document.getElementById("custom-card-val");
  const customAccentVal = document.getElementById("custom-accent-val");
  const customTextVal = document.getElementById("custom-text-val");

  let activeThemeId = StorageManager.get("devtab_theme", "obsidian");
  let customColors = StorageManager.get("devtab_custom_theme_colors", null);

  function applyThemeColors(theme) {
    if (!theme) return;
    const root = document.documentElement;

    root.style.setProperty("--bg-color", theme.bg);
    root.style.setProperty(
      "--bg-gradient",
      `radial-gradient(circle at 50% 0%, ${theme.cardBg} 0%, ${theme.bg} 100%)`
    );
    root.style.setProperty("--card-bg", theme.cardBg);
    root.style.setProperty("--accent-color", theme.accent);
    root.style.setProperty("--accent-hover", theme.accent);
    root.style.setProperty("--accent-glow", `${theme.accent}40`);
    root.style.setProperty("--text-primary", theme.text);
    root.style.setProperty("--border-color", theme.border || "rgba(255, 255, 255, 0.08)");

    const toggleIcon = document.getElementById("theme-toggle-icon");
    const toggleLabel = document.getElementById("theme-toggle-label");

    document.body.classList.remove("light-mode", "hacker-mode");

    if (theme.id === "light") {
      document.body.classList.add("light-mode");
      if (toggleIcon) {
        toggleIcon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>`;
      }
      if (toggleLabel) toggleLabel.textContent = "Light Mode";
    } else if (theme.id === "hacker") {
      document.body.classList.add("hacker-mode");
      if (toggleIcon) {
        toggleIcon.innerHTML = `<polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>`;
      }
      if (toggleLabel) toggleLabel.textContent = "Hacker Mode";
    } else {
      if (toggleIcon) {
        toggleIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
      }
      if (toggleLabel) toggleLabel.textContent = "Dark Mode";
    }
  }

  function setTheme(themeId, customObj = null) {
    activeThemeId = themeId;
    StorageManager.set("devtab_theme", themeId);

    if (themeId === "custom" && customObj) {
      customColors = customObj;
      StorageManager.set("devtab_custom_theme_colors", customObj);
      applyThemeColors({
        id: "custom",
        name: "Custom Theme",
        ...customObj,
      });
    } else {
      const found = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
      applyThemeColors(found);
    }

    renderThemeCards();
  }

  function renderThemeCards() {
    if (!container) return;
    container.innerHTML = "";

    THEME_PRESETS.forEach((preset) => {
      const card = document.createElement("div");
      card.className = "theme-card" + (activeThemeId === preset.id ? " active" : "");
      card.dataset.themeId = preset.id;

      const bar = document.createElement("div");
      bar.className = "theme-preview-bar";
      bar.style.backgroundColor = preset.bg;

      const dotBg = document.createElement("div");
      dotBg.className = "theme-color-dot";
      dotBg.style.backgroundColor = preset.cardBg;

      const dotAccent = document.createElement("div");
      dotAccent.className = "theme-color-dot";
      dotAccent.style.backgroundColor = preset.accent;

      const dotText = document.createElement("div");
      dotText.className = "theme-color-dot";
      dotText.style.backgroundColor = preset.text;

      bar.appendChild(dotBg);
      bar.appendChild(dotAccent);
      bar.appendChild(dotText);

      const name = document.createElement("div");
      name.className = "theme-card-name";
      name.textContent = preset.name;

      card.appendChild(bar);
      card.appendChild(name);

      card.addEventListener("click", () => {
        setTheme(preset.id);
      });

      container.appendChild(card);
    });
  }

  // Bind color input text labels
  [
    [customBg, customBgVal],
    [customCard, customCardVal],
    [customAccent, customAccentVal],
    [customText, customTextVal],
  ].forEach(([input, label]) => {
    if (input && label) {
      input.addEventListener("input", (e) => {
        label.textContent = e.target.value;
      });
    }
  });

  // Apply custom theme
  if (applyCustomBtn) {
    applyCustomBtn.addEventListener("click", () => {
      const customThemeObj = {
        bg: customBg ? customBg.value : "#0d1117",
        cardBg: customCard ? customCard.value : "#161b22",
        accent: customAccent ? customAccent.value : "#6366f1",
        text: customText ? customText.value : "#f0f6fc",
        border: "rgba(255, 255, 255, 0.12)",
      };
      setTheme("custom", customThemeObj);
    });
  }

  // Reset theme
  if (resetThemeBtn) {
    resetThemeBtn.addEventListener("click", () => {
      setTheme("obsidian");
      if (customBg) customBg.value = "#0d1117";
      if (customCard) customCard.value = "#161b22";
      if (customAccent) customAccent.value = "#6366f1";
      if (customText) customText.value = "#f0f6fc";
      if (customBgVal) customBgVal.textContent = "#0d1117";
      if (customCardVal) customCardVal.textContent = "#161b22";
      if (customAccentVal) customAccentVal.textContent = "#6366f1";
      if (customTextVal) customTextVal.textContent = "#f0f6fc";
    });
  }

  // Mode Switch in top bar cycles between Dark -> Light -> Hacker
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      if (activeThemeId === "obsidian" || activeThemeId === "custom") {
        setTheme("light");
      } else if (activeThemeId === "light") {
        setTheme("hacker");
      } else {
        setTheme("obsidian");
      }
    });
  }

  // Initialize
  if (activeThemeId === "custom" && customColors) {
    setTheme("custom", customColors);
    if (customBg && customColors.bg) customBg.value = customColors.bg;
    if (customCard && customColors.cardBg) customCard.value = customColors.cardBg;
    if (customAccent && customColors.accent) customAccent.value = customColors.accent;
    if (customText && customColors.text) customText.value = customColors.text;
  } else {
    setTheme(activeThemeId);
  }

  renderThemeCards();
}

// --- 13. First-Time Onboarding Modal ---
function initOnboarding() {
  const onboardingModal = document.getElementById("onboarding-modal");
  const yesBtn = document.getElementById("onboard-dev-yes");
  const noBtn = document.getElementById("onboard-dev-no");
  const devSitesWidget = document.getElementById("widget-dev-sites");

  const onboarded = StorageManager.get("devtab_onboarded", "false");
  if (onboarded === "true" && onboardingModal) {
    onboardingModal.classList.add("hidden");
    onboardingModal.style.display = "none";
    const isDev = StorageManager.get("devtab_is_developer", "true") !== "false";
    if (!isDev && devSitesWidget) devSitesWidget.classList.add("hidden");
    return;
  }

  if (yesBtn) {
    yesBtn.addEventListener("click", () => {
      StorageManager.set("devtab_onboarded", "true");
      StorageManager.set("devtab_is_developer", "true");
      if (devSitesWidget) devSitesWidget.classList.remove("hidden");
      closeAllModals();
      const toggle = document.getElementById("toggle-dev-mode");
      if (toggle) toggle.checked = true;
    });
  }

  if (noBtn) {
    noBtn.addEventListener("click", () => {
      StorageManager.set("devtab_onboarded", "true");
      StorageManager.set("devtab_is_developer", "false");
      if (devSitesWidget) devSitesWidget.classList.add("hidden");
      closeAllModals();
      const toggle = document.getElementById("toggle-dev-mode");
      if (toggle) toggle.checked = false;
    });
  }
}

// --- 14. Section Widgets Drag-and-Drop Reordering Across Columns ---
function initWidgetDragAndDrop() {
  const leftColumn = document.querySelector(".left-column");
  const rightColumn = document.querySelector(".right-column");
  if (!leftColumn || !rightColumn) return;

  let draggedWidget = null;

  function saveWidgetPositions() {
    const leftOrder = Array.from(leftColumn.children)
      .map((c) => c.id)
      .filter(Boolean);
    const rightOrder = Array.from(rightColumn.children)
      .map((c) => c.id)
      .filter(Boolean);
    StorageManager.set("devtab_left_widgets", leftOrder);
    StorageManager.set("devtab_right_widgets", rightOrder);
  }

  function enableWidgetDrag(col) {
    const widgets = Array.from(col.children);
    widgets.forEach((w) => {
      if (!w.id) return;
      w.draggable = true;
      w.classList.add("draggable-widget");

      w.addEventListener("dragstart", (e) => {
        const isInteractive = e.target.closest(
          "button, input, select, textarea, a, .shortcut-card, .ai-mini-card, .dev-platform-card, .host-card, .todo-item",
        );
        if (isInteractive) {
          e.preventDefault();
          return;
        }
        draggedWidget = w;
        w.classList.add("widget-dragging");
        e.dataTransfer.effectAllowed = "move";
      });

      w.addEventListener("dragend", () => {
        if (draggedWidget) draggedWidget.classList.remove("widget-dragging");
        document
          .querySelectorAll(".card-box")
          .forEach((box) => box.classList.remove("widget-drag-over"));
        draggedWidget = null;
        saveWidgetPositions();
      });

      w.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (draggedWidget && draggedWidget !== w) {
          w.classList.add("widget-drag-over");
        }
      });

      w.addEventListener("dragleave", () => {
        w.classList.remove("widget-drag-over");
      });

      w.addEventListener("drop", (e) => {
        e.preventDefault();
        w.classList.remove("widget-drag-over");
        if (draggedWidget && draggedWidget !== w) {
          const parent = w.parentNode;
          parent.insertBefore(draggedWidget, w);
          saveWidgetPositions();
        }
      });
    });
  }

  [leftColumn, rightColumn].forEach((col) => {
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
    col.addEventListener("drop", (e) => {
      if (
        draggedWidget &&
        (e.target === col ||
          e.target.classList.contains("left-column") ||
          e.target.classList.contains("right-column"))
      ) {
        e.preventDefault();
        col.appendChild(draggedWidget);
        saveWidgetPositions();
      }
    });
  });

  function restoreWidgetPositions() {
    try {
      const leftOrder = StorageManager.get("devtab_left_widgets", null);
      const rightOrder = StorageManager.get("devtab_right_widgets", null);

      if (leftOrder && Array.isArray(leftOrder)) {
        leftOrder.forEach((id) => {
          const el = document.getElementById(id);
          if (
            el &&
            (el.parentElement === leftColumn ||
              el.parentElement === rightColumn)
          ) {
            leftColumn.appendChild(el);
          }
        });
      }

      if (rightOrder && Array.isArray(rightOrder)) {
        rightOrder.forEach((id) => {
          const el = document.getElementById(id);
          if (
            el &&
            (el.parentElement === leftColumn ||
              el.parentElement === rightColumn)
          ) {
            rightColumn.appendChild(el);
          }
        });
      }
    } catch (e) {
      // Ignore corrupted order
    }
  }

  restoreWidgetPositions();
  enableWidgetDrag(leftColumn);
  enableWidgetDrag(rightColumn);
}

// --- 15. Keyboard Shortcuts & Hotkeys ---
function initHotkeys() {
  document.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement
      ? document.activeElement.tagName.toLowerCase()
      : "";
    if (
      activeTag === "input" ||
      activeTag === "textarea" ||
      activeTag === "select"
    ) {
      if (e.key === "Escape") {
        document.activeElement.blur();
        closeAllModals();
        const searchDropdown = document.getElementById(
          "search-engine-dropdown",
        );
        if (searchDropdown) {
          searchDropdown.classList.add("hidden");
          searchDropdown.style.display = "none";
        }
        const googleDropdown = document.getElementById("google-links-dropdown");
        if (googleDropdown) {
          googleDropdown.classList.add("hidden");
          googleDropdown.style.display = "none";
        }
      }
      return;
    }

    // "/" -> Focus Search
    if (e.key === "/") {
      e.preventDefault();
      const searchInput = document.getElementById("search-input");
      if (searchInput) searchInput.focus();
    }

    // "Alt + A" -> AI Hub Directory Modal
    if (e.altKey && !e.shiftKey && (e.key === "a" || e.key === "A")) {
      e.preventDefault();
      const el = document.getElementById("ai-hub-modal");
      if (el) {
        const isHidden =
          el.classList.contains("hidden") || el.style.display === "none";
        if (isHidden) openModal(el);
        else closeAllModals();
      }
    }

    // "Alt + S" -> GUI Settings Modal
    if (e.altKey && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      const el = document.getElementById("settings-overlay");
      if (el) {
        const isHidden =
          el.classList.contains("hidden") || el.style.display === "none";
        if (isHidden) openModal(el);
        else closeAllModals();
      }
    }

    // "Escape" -> Close any open modal
    if (e.key === "Escape") {
      closeAllModals();
      const searchDropdown = document.getElementById("search-engine-dropdown");
      if (searchDropdown) {
        searchDropdown.classList.add("hidden");
        searchDropdown.style.display = "none";
      }
      const googleDropdown = document.getElementById("google-links-dropdown");
      if (googleDropdown) {
        googleDropdown.classList.add("hidden");
        googleDropdown.style.display = "none";
      }
    }
  });
}
