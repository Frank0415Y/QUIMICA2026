/* ==========================================================================
   TABLA PERIÓDICA — lógica
   ========================================================================== */

// progreso eliminado

const CATEGORIAS = [
  { id: "alcalino",         nombre: "Alcalinos",           color: "var(--cat-alcalino)" },
  { id: "alcalinoterreo",   nombre: "Alcalinotérreos",     color: "var(--cat-alcalinoterreo)" },
  { id: "transicion",       nombre: "Transición",          color: "var(--cat-transicion)" },
  { id: "post-transicion",  nombre: "Post-transición",     color: "var(--cat-post-transicion)" },
  { id: "metaloide",        nombre: "Metaloides",          color: "var(--cat-metaloide)" },
  { id: "no-metal",         nombre: "No metales",          color: "var(--cat-no-metal)" },
  { id: "halogeno",         nombre: "Halógenos",           color: "var(--cat-halogeno)" },
  { id: "gas-noble",        nombre: "Gases nobles",        color: "var(--cat-gas-noble)" },
  { id: "lantanido",        nombre: "Lantánidos",          color: "var(--cat-lantanido)" },
  { id: "actinido",         nombre: "Actínidos",           color: "var(--cat-actinido)" },
];

const colorDeCategoria = (cat) => {
  const found = CATEGORIAS.find((c) => c.id === cat);
  return found ? found.color.replace("var(", "").replace(")", "") : "--flame";
};

const ESTADO_LABEL = {
  gas: "Gas",
  liquido: "Líquido",
  solido: "Sólido",
  desconocido: "Desconocido (sintético)",
};

let elementos = [];
let filtroCategoria = null;

/* ---------- Render de la leyenda ---------- */

function renderLeyenda() {
  const wrap = document.getElementById("tpLegend");
  wrap.innerHTML = CATEGORIAS.map(
    (c) => `
    <button type="button" class="tp-legend__item" data-cat="${c.id}">
      <span class="tp-legend__swatch" style="background:${c.color}"></span>
      ${c.nombre}
    </button>`
  ).join("");

  wrap.querySelectorAll(".tp-legend__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      filtroCategoria = filtroCategoria === cat ? null : cat;
      wrap.querySelectorAll(".tp-legend__item").forEach((b) =>
        b.classList.toggle("is-active", b.dataset.cat === filtroCategoria)
      );
      aplicarFiltros();
    });
  });
}

/* ---------- Render de la tabla ---------- */

function renderTabla() {
  const grid = document.getElementById("tpTable");
  grid.innerHTML = "";

  elementos.forEach((el) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "tp-cell";
    cell.dataset.cat = el.categoria;
    cell.dataset.z = el.z;
    cell.style.gridColumn = el.grupo;
    cell.style.gridRow = el.periodo;
    cell.style.setProperty("--cell-color", `var(${colorDeCategoria(el.categoria)})`);
    cell.innerHTML = `
      <span class="tp-cell__z">${el.z}</span>
      <span class="tp-cell__symbol">${el.simbolo}</span>
      <span class="tp-cell__name">${el.nombre}</span>
    `;
    cell.addEventListener("click", () => abrirDetalle(el));
    grid.appendChild(cell);
  });
}

function aplicarFiltros() {
  const q = document.getElementById("tpSearchInput").value.trim().toLowerCase();
  document.querySelectorAll(".tp-cell").forEach((cell) => {
    const z = cell.dataset.z;
    const el = elementos.find((e) => String(e.z) === z);
    const matchTexto =
      !q ||
      el.nombre.toLowerCase().includes(q) ||
      el.simbolo.toLowerCase().includes(q) ||
      String(el.z) === q;
    const matchCat = !filtroCategoria || el.categoria === filtroCategoria;
    cell.classList.toggle("is-dimmed", !(matchTexto && matchCat));
  });
}

/* ---------- Modal de detalle ---------- */

function abrirDetalle(el) {
  const modal = document.getElementById("tpModal");
  const card = modal.querySelector(".tp-modal__card");
  card.style.setProperty("--modal-color", `var(${colorDeCategoria(el.categoria)})`);

  document.getElementById("tpModalZ").textContent = `Nº ${el.z}`;
  document.getElementById("tpModalSymbol").textContent = el.simbolo;
  document.getElementById("tpModalName").textContent = el.nombre;
  const catInfo = CATEGORIAS.find((c) => c.id === el.categoria);
  document.getElementById("tpModalCategory").textContent = catInfo ? catInfo.nombre : el.categoria;
  document.getElementById("tpModalDesc").textContent = el.descripcion;
  document.getElementById("tpModalMasa").textContent = `${el.masa} u`;
  document.getElementById("tpModalEn").textContent =
    el.electronegatividad ? el.electronegatividad.toFixed(2) : "No aplica";
  document.getElementById("tpModalEstado").textContent = ESTADO_LABEL[el.estado] || el.estado;
  const periodoVisible = el.periodo === 8 ? 6 : el.periodo === 9 ? 7 : el.periodo;
  document.getElementById("tpModalPos").textContent = `${periodoVisible} / ${el.grupo}`;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // Guarda el progreso si el usuario tiene sesión iniciada (no hace nada si no)
  
}

function cerrarDetalle() {
  const modal = document.getElementById("tpModal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* ---------- Init ---------- */

async function init() {
  renderLeyenda();

  document.querySelectorAll("[data-tp-close]").forEach((el) =>
    el.addEventListener("click", cerrarDetalle)
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarDetalle();
  });

  const form = document.getElementById("tpSearchForm");
  const input = document.getElementById("tpSearchInput");
  input.addEventListener("input", aplicarFiltros);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    aplicarFiltros();
  });

  try {
    const res = await fetch("../js/elementos.json");
    elementos = await res.json();
    renderTabla();
  } catch (err) {
    console.error("No se pudo cargar la tabla periódica:", err);
    document.getElementById("tpTable").innerHTML =
      '<p style="font-family: var(--font-mono); font-size: 13px;">No se pudo cargar la tabla. Verifica que estés usando un servidor local (Live Server), no doble clic al archivo.</p>';
  }
}

document.addEventListener("DOMContentLoaded", init);
