/* ==========================================================================
   CTI · CIENCIAS — main.js
   Sitio estático: no requiere build ni servidor. Los "módulos" (fichas de la
   página de inicio) se cargan desde modulos.json para que sea fácil añadir
   o editar temas sin tocar el HTML.
   ========================================================================== */

const state = {
  modulos: [],
};

/* ---------- Render de fichas ---------- */

function renderModulos(lista) {
  const grid = document.getElementById('moduleGrid');
  const count = document.getElementById('resultCount');
  grid.innerHTML = '';

  if (lista.length === 0) {
    grid.innerHTML = `<p style="font-family: var(--font-mono); color: var(--ink-soft); font-size: 13px;">Sin resultados. Prueba con otra palabra.</p>`;
    count.textContent = '';
    return;
  }

  count.textContent = `${lista.length} disponible${lista.length === 1 ? '' : 's'}`;

  lista.forEach((mod) => {
    const card = document.createElement('a');
    card.href = mod.url;
    card.className = 'element-card';
    card.style.setProperty('--card-accent', mod.color);
    card.innerHTML = `
      <div class="element-card__top">
        <span class="element-card__number">${mod.numero}</span>
        <span class="element-card__symbol">${mod.simbolo}</span>
      </div>
      <p class="element-card__name">${mod.nombre}</p>
      <p class="element-card__desc">${mod.descripcion}</p>
      <span class="element-card__bar"></span>
    `;
    grid.appendChild(card);
  });
}

/* ---------- Buscador ---------- */

function filtrarModulos(query) {
  const q = query.trim().toLowerCase();
  if (!q) return state.modulos;
  return state.modulos.filter((mod) => {
    const haystack = [mod.nombre, mod.descripcion, ...(mod.keywords || [])]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

function setupSearch() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');

  input.addEventListener('input', () => {
    renderModulos(filtrarModulos(input.value));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    renderModulos(filtrarModulos(input.value));
  });
}

/* ---------- Menú móvil (placeholder simple) ---------- */

function setupMenuToggle() {
  const btn = document.getElementById('menuToggle');
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    document.getElementById("sideMenu").style.right=expanded?"-260px":"0";
  });
}

/* ---------- Init ---------- */

async function init() {
  setupSearch();
  setupMenuToggle();

  try {
    const res = await fetch('js/modulos.json');
    state.modulos = await res.json();
    renderModulos(state.modulos);
  } catch (err) {
    console.error('No se pudieron cargar los módulos:', err);
    document.getElementById('moduleGrid').innerHTML =
      '<p style="font-family: var(--font-mono); font-size: 13px; color: var(--ink-soft);">No se pudo cargar el contenido. Revisa que estés abriendo el sitio desde un servidor local (no doble clic al archivo).</p>';
  }
}

document.addEventListener('DOMContentLoaded', init);
