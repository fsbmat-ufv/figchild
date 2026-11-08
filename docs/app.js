/**
 * figchild - Catálogo Interativo de Figuras TikZ
 * Desenvolvido para o pacote LaTeX figchild (v3.1.3)
 */

(function () {
  "use strict";

  // Estado da aplicação
  const state = {
    allFigures: typeof FIGURES_DATA !== "undefined" ? FIGURES_DATA : [],
    filteredFigures: [],
    currentCategory: "all",
    searchQuery: "",
    currentPage: 1,
    itemsPerPage: 32,
    modalFigure: null,
    customOptions: {
      scale: 1.0,
      rotate: 0,
      color: "black",
      lineWidth: "default"
    }
  };

  // Elementos do DOM
  const elements = {
    grid: document.getElementById("figuresGrid"),
    searchInput: document.getElementById("searchInput"),
    searchClear: document.getElementById("searchClear"),
    categoriesBar: document.getElementById("categoriesBar"),
    resultsCount: document.getElementById("resultsCount"),
    pagination: document.getElementById("pagination"),
    modalOverlay: document.getElementById("customizerModal"),
    modalClose: document.getElementById("modalClose"),
    modalTitle: document.getElementById("modalTitle"),
    modalImg: document.getElementById("modalImg"),
    modalCodeOutput: document.getElementById("modalCodeOutput"),
    modalCopyBtn: document.getElementById("modalCopyBtn"),
    scaleSlider: document.getElementById("scaleSlider"),
    scaleVal: document.getElementById("scaleVal"),
    rotateSlider: document.getElementById("rotateSlider"),
    rotateVal: document.getElementById("rotateVal"),
    lineWidthSelect: document.getElementById("lineWidthSelect"),
    colorDots: document.querySelectorAll(".color-dot")
  };

  // Inicialização
  function init() {
    state.filteredFigures = [...state.allFigures];
    renderCategoryPills();
    updateResults();
    setupEventListeners();
  }

  // Renderiza as pílulas de categorias com a contagem de cada uma
  function renderCategoryPills() {
    if (!elements.categoriesBar) return;

    // Categorias com ícones
    const categoryIcons = {
      "all": "🌟",
      "Animais": "🐾",
      "Objetos & Casa": "🏠",
      "Veículos & Transporte": "🚗",
      "Alimentos & Frutas": "🍎",
      "Natureza & Espaço": "🌿",
      "Letras & Alfabeto": "🔤",
      "Brinquedos & Escola": "🎨",
      "Números": "🔢",
      "Corpo Humano": "🫀",
      "Pessoas & Fantasia": "👤",
      "Vestuário & Moda": "👗",
      "Outros": "✨"
    };

    // Contar por categoria
    const counts = { all: state.allFigures.length };
    state.allFigures.forEach(fig => {
      counts[fig.category] = (counts[fig.category] || 0) + 1;
    });

    const categories = [
      { id: "all", label: "Todas" },
      ...Object.keys(counts)
        .filter(c => c !== "all")
        .sort((a, b) => counts[b] - counts[a])
        .map(c => ({ id: c, label: c }))
    ];

    elements.categoriesBar.innerHTML = categories.map(cat => {
      const icon = categoryIcons[cat.id] || "📌";
      const isActive = cat.id === state.currentCategory ? "active" : "";
      return `
        <button class="category-pill ${isActive}" data-category="${cat.id}">
          <span>${icon} ${cat.label}</span>
          <span class="category-count">${counts[cat.id] || 0}</span>
        </button>
      `;
    }).join("");

    // Event listeners para as categorias
    elements.categoriesBar.querySelectorAll(".category-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        state.currentCategory = btn.dataset.category;
        state.currentPage = 1;
        
        elements.categoriesBar.querySelectorAll(".category-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        applyFilters();
      });
    });
  }

  // Aplica busca e filtro de categoria
  function applyFilters() {
    const q = state.searchQuery.trim().toLowerCase();
    const cat = state.currentCategory;

    state.filteredFigures = state.allFigures.filter(fig => {
      // Filtro de categoria
      if (cat !== "all" && fig.category !== cat) {
        return false;
      }
      // Filtro de texto
      if (q) {
        const matchCmd = fig.cmd.toLowerCase().includes(q) || ("\\" + fig.cmd.toLowerCase()).includes(q);
        const matchName = fig.name.toLowerCase().includes(q);
        const matchTags = (fig.tags || "").toLowerCase().includes(q);
        return matchCmd || matchName || matchTags;
      }
      return true;
    });

    state.currentPage = 1;
    updateResults();
  }

  // Atualiza exibição de resultados e paginação
  function updateResults() {
    renderCards();
    renderPagination();
    updateResultsCount();
  }

  // Atualiza contador textual
  function updateResultsCount() {
    if (!elements.resultsCount) return;
    const total = state.allFigures.length;
    const found = state.filteredFigures.length;

    if (found === total) {
      elements.resultsCount.innerHTML = `Mostrando todas as <strong>${total}</strong> figuras disponíveis`;
    } else {
      elements.resultsCount.innerHTML = `Exibindo <strong>${found}</strong> de <strong>${total}</strong> figuras encontradas`;
    }
  }

  // Renderiza os cards lado a lado da página atual
  function renderCards() {
    if (!elements.grid) return;

    if (state.filteredFigures.length === 0) {
      elements.grid.innerHTML = `
        <div class="empty-state">
          <h3>Nenhuma figura encontrada</h3>
          <p>Tente buscar por outro termo ou selecione a categoria "Todas".</p>
          <button class="btn-reset-filters" id="btnResetFilters">Limpar Filtros</button>
        </div>
      `;
      const resetBtn = document.getElementById("btnResetFilters");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          state.searchQuery = "";
          state.currentCategory = "all";
          if (elements.searchInput) elements.searchInput.value = "";
          if (elements.searchClear) elements.searchClear.style.display = "none";
          renderCategoryPills();
          applyFilters();
        });
      }
      return;
    }

    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const pageItems = state.filteredFigures.slice(start, end);

    elements.grid.innerHTML = pageItems.map(fig => {
      const codeSnippet = `\\${fig.cmd}`;
      return `
        <div class="figure-card" data-cmd="${fig.cmd}">
          <div class="card-top">
            <div class="card-title-group">
              <span class="card-title">${fig.name}</span>
              <span class="card-category-tag">${fig.category}</span>
            </div>
            <code>\\${fig.cmd}</code>
          </div>

          <div class="card-body">
            <!-- Lado Esquerdo: Código -->
            <div class="card-code-panel">
              <div>
                <div class="code-header-row">
                  <span class="code-lang-label">LaTeX / TikZ</span>
                </div>
                <div class="card-code-content">
                  <code>${codeSnippet}</code>
                </div>
              </div>
              <div class="card-code-actions">
                <button class="btn-copy-code" onclick="window.figchildApp.copyText('${codeSnippet}', this)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span>Copiar</span>
                </button>
                <button class="btn-customizer" onclick="window.figchildApp.openCustomizer('${fig.cmd}')" title="Ajustar escala, rotação e opções TikZ">
                  ⚙ Personalizar
                </button>
              </div>
            </div>

            <!-- Lado Direito: Figura SVG -->
            <div class="card-figure-panel">
              <img src="${fig.svg}" alt="${fig.name}" loading="lazy" />
              <a href="${fig.svg}" download="${fig.cmd}.svg" class="btn-download-svg" title="Baixar vetor SVG">
                SVG ↓
              </a>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Renderiza controles de paginação
  function renderPagination() {
    if (!elements.pagination) return;
    const totalPages = Math.ceil(state.filteredFigures.length / state.itemsPerPage);

    if (totalPages <= 1) {
      elements.pagination.innerHTML = "";
      return;
    }

    let pagesHtml = [];

    // Botão Anterior
    pagesHtml.push(`
      <button class="page-btn" ${state.currentPage === 1 ? "disabled" : ""} onclick="window.figchildApp.goToPage(${state.currentPage - 1})">
        ←
      </button>
    `);

    // Páginas a exibir
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (state.currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, "...", totalPages];
      } else if (state.currentPage >= totalPages - 3) {
        pages = [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, "...", state.currentPage - 1, state.currentPage, state.currentPage + 1, "...", totalPages];
      }
    }

    pages.forEach(p => {
      if (p === "...") {
        pagesHtml.push(`<span style="padding: 0 4px; color: #94a3b8;">…</span>`);
      } else {
        const isActive = p === state.currentPage ? "active" : "";
        pagesHtml.push(`
          <button class="page-btn ${isActive}" onclick="window.figchildApp.goToPage(${p})">
            ${p}
          </button>
        `);
      }
    });

    // Botão Próximo
    pagesHtml.push(`
      <button class="page-btn" ${state.currentPage === totalPages ? "disabled" : ""} onclick="window.figchildApp.goToPage(${state.currentPage + 1})">
        →
      </button>
    `);

    elements.pagination.innerHTML = pagesHtml.join("");
  }

  // Configura event listeners
  function setupEventListeners() {
    // Busca em tempo real
    if (elements.searchInput) {
      elements.searchInput.addEventListener("input", e => {
        state.searchQuery = e.target.value;
        if (elements.searchClear) {
          elements.searchClear.style.display = state.searchQuery ? "block" : "none";
        }
        applyFilters();
      });
    }

    // Limpar busca
    if (elements.searchClear) {
      elements.searchClear.addEventListener("click", () => {
        elements.searchInput.value = "";
        state.searchQuery = "";
        elements.searchClear.style.display = "none";
        applyFilters();
        elements.searchInput.focus();
      });
    }

    // Modal Events
    if (elements.modalClose) {
      elements.modalClose.addEventListener("click", closeModal);
    }
    if (elements.modalOverlay) {
      elements.modalOverlay.addEventListener("click", e => {
        if (e.target === elements.modalOverlay) closeModal();
      });
    }

    // Tecla ESC fecha modal
    window.addEventListener("keydown", e => {
      if (e.key === "Escape" && elements.modalOverlay.classList.contains("open")) {
        closeModal();
      }
    });

    // Customizer Controls
    if (elements.scaleSlider) {
      elements.scaleSlider.addEventListener("input", e => {
        state.customOptions.scale = parseFloat(e.target.value);
        if (elements.scaleVal) elements.scaleVal.textContent = state.customOptions.scale.toFixed(1) + "x";
        updateModalPreview();
      });
    }

    if (elements.rotateSlider) {
      elements.rotateSlider.addEventListener("input", e => {
        state.customOptions.rotate = parseInt(e.target.value, 10);
        if (elements.rotateVal) elements.rotateVal.textContent = state.customOptions.rotate + "°";
        updateModalPreview();
      });
    }

    if (elements.lineWidthSelect) {
      elements.lineWidthSelect.addEventListener("change", e => {
        state.customOptions.lineWidth = e.target.value;
        updateModalPreview();
      });
    }

    if (elements.colorDots) {
      elements.colorDots.forEach(dot => {
        dot.addEventListener("click", () => {
          elements.colorDots.forEach(d => d.classList.remove("active"));
          dot.classList.add("active");
          state.customOptions.color = dot.dataset.color;
          updateModalPreview();
        });
      });
    }

    if (elements.modalCopyBtn) {
      elements.modalCopyBtn.addEventListener("click", function () {
        const code = elements.modalCodeOutput.textContent.trim();
        copyText(code, this);
      });
    }
  }

  // Copia texto com feedback visual
  function copyText(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
      const originalHtml = btnElement.innerHTML;
      btnElement.classList.add("copied");
      btnElement.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Copiado!</span>
      `;
      setTimeout(() => {
        btnElement.classList.remove("copied");
        btnElement.innerHTML = originalHtml;
      }, 1600);
    });
  }

  // Modal Customizer
  function openCustomizer(cmd) {
    const figure = state.allFigures.find(f => f.cmd === cmd);
    if (!figure) return;

    state.modalFigure = figure;
    state.customOptions = {
      scale: 1.0,
      rotate: 0,
      color: "black",
      lineWidth: "default"
    };

    // Reset controls
    if (elements.scaleSlider) elements.scaleSlider.value = "1.0";
    if (elements.scaleVal) elements.scaleVal.textContent = "1.0x";
    if (elements.rotateSlider) elements.rotateSlider.value = "0";
    if (elements.rotateVal) elements.rotateVal.textContent = "0°";
    if (elements.lineWidthSelect) elements.lineWidthSelect.value = "default";
    if (elements.colorDots) {
      elements.colorDots.forEach(d => {
        d.classList.toggle("active", d.dataset.color === "black");
      });
    }

    if (elements.modalTitle) {
      elements.modalTitle.textContent = `${figure.name} (\\${figure.cmd})`;
    }
    if (elements.modalImg) {
      elements.modalImg.src = figure.svg;
    }

    updateModalPreview();
    elements.modalOverlay.classList.add("open");
  }

  function closeModal() {
    if (elements.modalOverlay) {
      elements.modalOverlay.classList.remove("open");
    }
    state.modalFigure = null;
  }

  function updateModalPreview() {
    if (!state.modalFigure) return;

    const { scale, rotate, color, lineWidth } = state.customOptions;
    const opts = [];

    if (scale !== 1.0) opts.push(`scale=${scale}`);
    if (rotate !== 0) opts.push(`rotate=${rotate}`);
    if (color !== "black") opts.push(`draw=${color}`);
    if (lineWidth !== "default") opts.push(`line width=${lineWidth}`);

    const optStr = opts.length > 0 ? `[${opts.join(", ")}]` : "";
    const fullCmd = `\\${state.modalFigure.cmd}${optStr}`;

    if (elements.modalCodeOutput) {
      elements.modalCodeOutput.textContent = fullCmd;
    }

    // Efeito visual no preview
    if (elements.modalImg) {
      elements.modalImg.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
      
      // Aplicar filtro de cor CSS aproximado
      if (color === "red") {
        elements.modalImg.style.filter = "invert(21%) sepia(85%) saturate(7400%) hue-rotate(355deg) brightness(90%) contrast(110%)";
      } else if (color === "blue") {
        elements.modalImg.style.filter = "invert(24%) sepia(90%) saturate(5000%) hue-rotate(215deg) brightness(95%) contrast(100%)";
      } else if (color === "green") {
        elements.modalImg.style.filter = "invert(35%) sepia(70%) saturate(2000%) hue-rotate(100deg) brightness(85%) contrast(95%)";
      } else if (color === "orange") {
        elements.modalImg.style.filter = "invert(55%) sepia(90%) saturate(3000%) hue-rotate(5deg) brightness(100%) contrast(100%)";
      } else if (color === "purple") {
        elements.modalImg.style.filter = "invert(25%) sepia(80%) saturate(4000%) hue-rotate(270deg) brightness(85%) contrast(105%)";
      } else if (color === "gray") {
        elements.modalImg.style.filter = "opacity(0.5)";
      } else {
        elements.modalImg.style.filter = "none";
      }
    }
  }

  function goToPage(page) {
    const totalPages = Math.ceil(state.filteredFigures.length / state.itemsPerPage);
    if (page < 1 || page > totalPages) return;
    state.currentPage = page;
    renderCards();
    renderPagination();
    window.scrollTo({ top: elements.grid.offsetTop - 80, behavior: "smooth" });
  }

  // API Global para chamadas inline nos botões
  window.figchildApp = {
    copyText: copyText,
    goToPage: goToPage,
    openCustomizer: openCustomizer,
    closeModal: closeModal
  };

  // Iniciar após carregar o DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
