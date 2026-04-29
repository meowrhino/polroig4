// app.js — bootstrap de polroig4. Una sola vista (home), single-page.
// El hash de la URL controla només idioma i scroll a un projecte:
//
//   #/                      → home, idioma defecte
//   #/<lang>                → home, idioma forçat
//   #/<slug>                → home, scroll al projecte <slug>
//   #/<slug>/<lang>         → home, scroll a <slug> + idioma
//
// Canviar idioma fa rerender amb fade i preserva el slug a la URL.
// Clicar un link de la llista inline fa scroll smooth i actualitza la URL
// sense rerender.

import { loadData, getData, resolveLang, findProject } from './data.js';
import { renderHome } from './home.js';

const root = document.getElementById('app');

const state = {
  lang: null,
  slug: null,    // últim slug enfocat (per preservar a la URL)
};

// ---- Hash parsing ----
function parseHash(hash = location.hash) {
  const raw = (hash || '#/').replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  const data = getData();
  const langs = data?.config?.idiomas || ['cat'];
  const isLang = (s) => langs.includes(s);

  if (parts.length === 0) {
    return { slug: null, lang: resolveLang() };
  }

  // 1 part: o lang o slug
  if (parts.length === 1) {
    if (isLang(parts[0])) return { slug: null, lang: parts[0] };
    if (findProject(parts[0])) return { slug: parts[0], lang: resolveLang() };
    return { slug: null, lang: resolveLang() };
  }

  // 2+ parts: slug/lang
  const slug = findProject(parts[0]) ? parts[0] : null;
  const lang = isLang(parts[1]) ? parts[1] : resolveLang();
  return { slug, lang };
}

// ---- Configuració de colors ----
function applyConfig() {
  const c = getData().config;
  document.documentElement.style.setProperty('--color-acento', c.color_acento);
  document.documentElement.style.setProperty('--color-titulo', c.color_titulo);
  document.documentElement.lang = c.idioma_defecto || 'ca';
}

// ---- Mount + scroll ----
function mount(lang, opts = {}) {
  state.lang = lang;
  renderHome({
    root,
    lang,
    onChangeLang: (newLang) => routeToWithFade(newLang),
    onScrollTo: (slug) => {
      state.slug = slug;
      const newHash = `#/${slug}/${lang}`;
      if (location.hash !== newHash) history.replaceState(null, '', newHash);
      scrollToProject(slug, true);
    },
  });

  if (opts.scrollToSlug) {
    // Esperar 1 frame perquè el DOM estigui pintat abans de mesurar
    requestAnimationFrame(() => scrollToProject(opts.scrollToSlug, opts.smooth));
  } else if (opts.preserveScroll === false) {
    window.scrollTo(0, 0);
  }
}

function scrollToProject(slug, smooth = true) {
  const el = document.getElementById(`proyecto-${slug}`);
  if (!el) return;
  el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
}

// ---- Canvi d'idioma amb fade ----
const FADE_DUR = 200;
async function routeToWithFade(newLang) {
  if (newLang === state.lang) return;
  root.classList.add('is-fading');
  await new Promise(r => setTimeout(r, FADE_DUR));

  const slug = state.slug;
  const newHash = slug ? `#/${slug}/${newLang}` : `#/${newLang}`;
  history.replaceState(null, '', newHash);
  mount(newLang, { scrollToSlug: slug, smooth: false });

  void root.offsetHeight;
  root.classList.remove('is-fading');
}

// ---- Boot ----
async function boot() {
  await loadData();
  applyConfig();

  const { slug, lang } = parseHash();
  state.slug = slug;
  mount(lang, { scrollToSlug: slug, smooth: false });

  // Canvis manuals al hash o back/forward del navegador. Sempre
  // actualitzem state.slug primer perquè routeToWithFade el llegirà
  // per fer scroll a la posició correcta després del rerender.
  window.addEventListener('hashchange', () => {
    const next = parseHash();
    state.slug = next.slug;
    if (next.lang !== state.lang) {
      routeToWithFade(next.lang);
      return;
    }
    if (next.slug) scrollToProject(next.slug, true);
  });
}

boot().catch(err => {
  console.error(err);
  root.innerHTML = `<p style="padding:2rem">Error carregant la web: ${err.message}</p>`;
});
