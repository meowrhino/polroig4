// header.js — capçalera amb el selector d'idioma a l'esquerra i el
// títol braille a la dreta. El selector mostra tots els idiomes
// disponibles (no toggle binari): el actiu va en color acento.

import { getData } from './data.js';
import { toBrailleHTML } from './braille.js';

export function createHeader({ lang, onChangeLang }) {
  const data = getData();
  const langs = data.config.idiomas;
  const labels = data.i18n[lang]?.idiomas || {};

  const header = document.createElement('header');
  header.className = 'header';

  // ---- Selector d'idioma (esquerra) ----
  const langNav = document.createElement('nav');
  langNav.className = 'lang';
  langNav.setAttribute('aria-label', 'idioma');

  langs.forEach((l, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'lang__sep';
      sep.textContent = '/';
      langNav.appendChild(sep);
    }
    const btn = document.createElement('button');
    btn.className = 'lang__btn' + (l === lang ? ' is-active' : '');
    btn.dataset.lang = l;
    btn.textContent = labels[l] || l;
    btn.addEventListener('click', () => {
      if (l !== lang) onChangeLang(l);
    });
    langNav.appendChild(btn);
  });

  header.appendChild(langNav);

  // ---- Braille (dreta) ----
  const braille = document.createElement('h1');
  braille.className = 'braille';
  braille.setAttribute('aria-label', data.config.titulo_braille);
  braille.innerHTML = toBrailleHTML(data.config.titulo_braille);
  header.appendChild(braille);

  return header;
}
