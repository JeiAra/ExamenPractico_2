/**
 * Portafolio interactivo – SIS-214
 * Módulos: tema, menú, filtro, formulario y consumo de API REST.
 */

/* ---------- Utilidades ---------- */
const $ = (selector) => document.querySelector(selector);

/** Escapa texto para insertarlo de forma segura en innerHTML. */
const escapeHTML = (text = '') =>
  String(text).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* ---------- 1. Conmutador de tema (localStorage + JSON) ---------- */
const THEME_KEY = 'portfolio-preferences';

const loadPreferences = () => {
  try {
    return JSON.parse(localStorage.getItem(THEME_KEY)) ?? {};
  } catch {
    return {}; // JSON corrupto o localStorage bloqueado
  }
};

const applyTheme = (theme) => {
  const isDark = theme === 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  const btn = $('#themeToggle');
  btn.setAttribute('aria-pressed', String(isDark));
  btn.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  $('#themeIcon').textContent = isDark ? '☀' : '☾';
};

const initTheme = () => {
  const storedTheme = loadPreferences().theme;
  const saved = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : null;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ?? (systemDark ? 'dark' : 'light'));

  $('#themeToggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify({ ...loadPreferences(), theme: next }));
    } catch { /* almacenamiento no disponible: se ignora */ }
  });
};

/* ---------- 2. Menú hamburguesa (aria-expanded) ---------- */
const initMenu = () => {
  const toggle = $('#menuToggle');
  const nav = $('#mainNav');

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
};

/* ---------- 3. Filtro en tiempo real (inmutable, filter + map) ---------- */
const PROJECTS = Object.freeze([
  {
    title: 'My Virtual Buddy',
    description: 'Aplicación universitaria para organizar tareas con una mascota virtual que motiva al usuario a cumplir sus objetivos.',
    tags: ['Programación orientada a objetos', 'Organización de tareas', 'Interfaz']
  },
  {
    title: 'Portafolio web personal',
    description: 'Hoja de vida web para Tecnologías Web I con diseño responsivo, accesibilidad, tema claro/oscuro, filtro de proyectos y consumo de la API de GitHub.',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Fetch API']
  },
]);

const projectCard = ({ title, description, tags }) => `
  <li>
    <article>
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(description)}</p>
      <ul class="tags">${tags.map((t) => `<li>${escapeHTML(t)}</li>`).join('')}</ul>
    </article>
  </li>`;

const filterProjects = (query) => {
  const q = query.trim().toLowerCase();
  // Tubería funcional: el arreglo original no se modifica.
  return PROJECTS
    .filter(({ title, description, tags }) =>
      [title, description, ...tags].some((field) => field.toLowerCase().includes(q)))
    .map(projectCard);
};

const initFilter = () => {
  const list = $('#projectList');
  const status = $('#searchStatus');

  const render = (query = '') => {
    const cards = filterProjects(query);
    list.innerHTML = cards.join('');
    status.textContent = cards.length
      ? `${cards.length} de ${PROJECTS.length} proyectos`
      : 'No hay proyectos que coincidan. Prueba con otra palabra.';
  };

  $('#searchInput').addEventListener('input', (e) => render(e.target.value));
  render();
};

/* ---------- 4. Formulario de contacto ---------- */
const initContactForm = () => {
  const form = $('#contactForm');
  const fields = [...form.querySelectorAll('input, textarea')];

  const errorText = (el) => {
    const v = el.validity;
    if (v.valueMissing) return 'Este campo es obligatorio.';
    if (v.typeMismatch) return 'Escribe un correo válido, por ejemplo nombre@correo.com.';
    if (v.tooShort) return `Escribe al menos ${el.minLength} caracteres (llevas ${el.value.length}).`;
    return '';
  };

  const validateField = (el) => {
    const msg = $(`#${el.id}Msg`);
    const error = errorText(el);
    el.classList.toggle('is-invalid', Boolean(error));
    el.classList.toggle('is-valid', !error);
    el.setAttribute('aria-invalid', String(Boolean(error)));
    msg.textContent = error || 'Correcto.';
    msg.className = `msg ${error ? 'error' : 'ok'}`;
    return !error;
  };

  fields.forEach((el) => el.addEventListener('input', () => validateField(el)));

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // evita la recarga de la página
    const status = $('#formStatus');
    const results = fields.map(validateField);

    if (results.includes(false)) {
      status.className = 'status error';
      status.textContent = 'Revisa los campos marcados antes de enviar.';
      fields.find((el) => el.classList.contains('is-invalid'))?.focus();
      return;
    }

    const name = form.elements.name.value.trim();
    status.className = 'status success';
    status.textContent = `Gracias, ${name}. La validación se completó correctamente. Este formulario es demostrativo y no envía correos ni almacena el mensaje.`;
  });
};

/* ---------- 5. Fetch API: repositorios de GitHub ---------- */
const HTTP_MESSAGES = {
  400: 'Solicitud incorrecta (400).',
  401: 'GitHub rechazó la solicitud (401).',
  403: 'Acceso limitado o límite de peticiones alcanzado (403). Intenta más tarde.',
  404: 'No existe ese usuario en GitHub (404).',
  429: 'Se hicieron demasiadas solicitudes (429). Intenta más tarde.',
  500: 'Error interno del servidor de GitHub (500).',
  502: 'GitHub respondió con un error de puerta de enlace (502).',
  503: 'El servicio de GitHub no está disponible temporalmente (503).',
  504: 'La solicitud a GitHub agotó el tiempo de espera (504).',
};

const repoCard = ({ name, description, html_url, language, stargazers_count }) => `
  <li>
    <article>
      <h3><a href="${escapeHTML(html_url)}" target="_blank" rel="noopener">${escapeHTML(name)}</a></h3>
      <p>${escapeHTML(description ?? 'Sin descripción.')}</p>
      <ul class="tags">
        <li>${escapeHTML(language ?? 'N/D')}</li>
        <li>★ ${stargazers_count}</li>
      </ul>
    </article>
  </li>`;

const setGhState = (state, message) => {
  const status = $('#ghStatus');
  status.className = `status ${state}`;
  status.textContent = message;
};

const fetchRepos = async (user) => {
  const list = $('#ghList');
  list.innerHTML = '';
  setGhState('loading', 'Cargando repositorios…');

  try {
    const url = `https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=6`;
    const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });

    if (!response.ok) {
      throw new Error(HTTP_MESSAGES[response.status] ?? `Error inesperado (${response.status}).`);
    }

    const repos = await response.json(); // 200 OK
    if (repos.length === 0) {
      setGhState('success', `${user} no tiene repositorios públicos todavía.`);
      return;
    }
    list.innerHTML = repos.map(repoCard).join('');
    setGhState('success', `${repos.length} repositorios de ${user}.`);
  } catch (error) {
    // TypeError = fallo de red; Error = respuesta HTTP no exitosa
    const message = error instanceof TypeError
      ? 'No hay conexión con GitHub. Revisa tu internet.'
      : error.message;
    setGhState('error', message);
  }
};

const initGithub = () => {
  const input = $('#ghUser');
  $('#ghForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = input.value.trim();
    if (!user) {
      setGhState('error', 'Escribe un nombre de usuario de GitHub.');
      input.focus();
      return;
    }
    fetchRepos(user);
  });
  fetchRepos(input.value.trim());
};

/* ---------- Arranque ---------- */
initTheme();
initMenu();
initFilter();
initContactForm();
initGithub();
