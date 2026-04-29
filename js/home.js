// home.js — única vista de polroig4. Renderitza:
//   1) Capçalera (selector idioma + braille)
//   2) Llista inline de projectes (links àncora)
//   3) Totes les seccions de projecte renderitzades en seqüència,
//      cada una amb els seus grups (slideshow, títol, text, desplegable),
//      seguint la mateixa lògica que data.json descriu.

import { getData, pickLang, imgPath, t } from './data.js';
import { createHeader } from './header.js';
import { createSlideshow } from './slideshow.js';
import { createDesplegable } from './desplegable.js';

export function renderHome({ root, lang, onChangeLang, onScrollTo }) {
  const data = getData();
  const projects = data.proyectos;

  root.innerHTML = '';
  const home = document.createElement('div');
  home.className = 'home';

  // 1) Capçalera
  home.appendChild(createHeader({ lang, onChangeLang }));

  // 2) Llista inline + 3) seccions
  const main = document.createElement('main');
  main.className = 'home__main';

  // ---- Llista inline de projectes ----
  const nav = document.createElement('nav');
  nav.className = 'proyectos-nav';
  nav.setAttribute('aria-label', 'projectes');

  const navList = document.createElement('p');
  navList.className = 'proyectos-nav__list';

  projects.forEach((p, i) => {
    const a = document.createElement('a');
    a.className = 'proyectos-nav__link';
    a.href = `#/${p.slug}/${lang}`;
    a.textContent = pickLang(p.nombre, lang);
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      onScrollTo(p.slug);
    });
    navList.appendChild(a);
    if (i < projects.length - 1) {
      const sep = document.createElement('span');
      sep.className = 'proyectos-nav__sep';
      sep.textContent = ', ';
      navList.appendChild(sep);
    }
  });

  nav.appendChild(navList);
  main.appendChild(nav);

  // ---- Seccions de projecte ----
  for (const p of projects) {
    const section = document.createElement('section');
    section.className = 'proyecto';
    section.id = `proyecto-${p.slug}`;

    for (const grupo of (p.grupos || [])) {
      const groupEl = renderGrupo(grupo, p.slug, lang);
      if (groupEl) section.appendChild(groupEl);
    }

    main.appendChild(section);
  }

  home.appendChild(main);
  root.appendChild(home);
}

function renderGrupo(grupo, slug, lang) {
  const hasSlideshow   = Array.isArray(grupo.slideshow) && grupo.slideshow.length > 0;
  const hasTitulo      = !!grupo.titulo;
  const hasTexto       = Array.isArray(grupo.texto) && grupo.texto.length > 0;
  const hasDesplegable = Array.isArray(grupo.texto_desplegable) && grupo.texto_desplegable.length > 0;
  if (!hasSlideshow && !hasTitulo && !hasTexto && !hasDesplegable) return null;

  const section = document.createElement('section');
  section.className = 'grupo';

  if (hasSlideshow) {
    const urls = grupo.slideshow.map(name => imgPath(slug, name));
    section.appendChild(createSlideshow(urls));
  }

  if (hasTitulo) {
    const h2 = document.createElement('h2');
    h2.className = 'grupo__titulo';
    h2.textContent = pickLang(grupo.titulo, lang);
    section.appendChild(h2);
  }

  if (hasTexto) {
    for (const para of grupo.texto) {
      const p = document.createElement('p');
      p.className = 'grupo__parrafo';
      p.textContent = pickLang(para, lang);
      section.appendChild(p);
    }
  }

  if (hasDesplegable) {
    const parrafos = grupo.texto_desplegable.map(p => pickLang(p, lang));
    const txtMas   = t('leer_mas',   lang) || 'llegir més';
    const txtMenos = t('leer_menos', lang) || 'tancar';
    section.appendChild(createDesplegable(parrafos, txtMas, txtMenos));
  }

  return section;
}
