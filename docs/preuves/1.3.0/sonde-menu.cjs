/**
 * Le menu d'actions au clavier et au pointeur, moteur par moteur (SPEC 1.3.0, §5.3, §11.2 ;
 * US-C03, US-C05). jsdom ne connaît ni `showPopover()`, ni la couche supérieure, ni l'ancre CSS : ce
 * qui suit est la seule preuve du comportement.
 *
 *   node docs/preuves/1.3.0/banc.mjs
 *   NODE_PATH="$(npm root -g)" node docs/preuves/1.3.0/sonde-menu.cjs
 *
 * Un moteur que Playwright n'a pas installé est écrit « non installé » : il va dans « Ce qui n'est pas
 * couvert ». WebKit de Playwright n'est pas Safari. Le repli sans ancre CSS est aussi joué dans
 * Chromium en retirant l'ancre (CSS.supports et position-area neutralisés) : c'est une simulation,
 * écrite comme telle.
 */
const pw = require('playwright');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const PAGE = pathToFileURL(resolve('docs/preuves/1.3.0/banc/genere/menu.html')).href;

/** Le menu ouvert, l'élément qui a le focus, et son rôle. */
function etat() {
  const ouvert = document.querySelector('.ai5d-menu__liste:popover-open');
  const actif = document.activeElement;
  return {
    ouvert: ouvert === null ? null : ouvert.getAttribute('aria-label'),
    focus: actif?.getAttribute('role') === 'menuitem' ? actif.textContent : (actif?.getAttribute('aria-label') ?? actif?.tagName),
  };
}

function position(selecteurDeclencheur) {
  const menu = document.querySelector('.ai5d-menu__liste:popover-open');
  const declencheur = document.querySelector(selecteurDeclencheur);
  if (menu === null || declencheur === null) return 'menu ferme';
  const m = menu.getBoundingClientRect();
  const d = declencheur.getBoundingClientRect();
  return {
    ecartSousDeclencheur: Math.round(m.top - d.bottom),
    ecartAuDessus: Math.round(d.top - m.bottom),
    bordsDeFinAlignes: Math.round(m.right) === Math.round(d.right),
    largeur: Math.round(m.width),
    dansLaFenetre: m.top >= 0 && m.bottom <= innerHeight && m.left >= 0 && m.right <= innerWidth,
  };
}

async function jouer(nom, options = {}) {
  let navigateur;
  try {
    navigateur = await pw[nom].launch();
  } catch {
    console.log(`\n== ${nom} : non installé sur ce poste, non couvert`);
    return;
  }
  const contexte = await navigateur.newContext({ viewport: { width: 1024, height: 700 } });
  if (options.sansAncre) {
    await contexte.addInitScript(() => {
      const vrai = CSS.supports.bind(CSS);
      CSS.supports = (...args) => (String(args[0]).includes('anchor') ? false : vrai(...args));
      document.addEventListener('DOMContentLoaded', () => {
        const neutre = document.createElement('style');
        neutre.textContent =
          '.ai5d-menu__liste { position-area: none !important; position-anchor: auto !important; margin-block-start: 0 !important; }';
        document.head.append(neutre);
      });
    });
  }
  const page = await contexte.newPage();
  const erreurs = [];
  page.on('pageerror', (erreur) => erreurs.push(erreur.message));
  page.on('console', (message) => {
    if (message.type() === 'error') erreurs.push(message.text());
  });
  await page.goto(PAGE, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const titre = options.sansAncre ? `${nom}, repli sans ancre SIMULÉ` : nom;
  console.log(`\n== ${titre} ${navigateur.version()}`);
  console.log(`ancre CSS prise en charge : ${await page.evaluate(() => CSS.supports('anchor-name: --a'))}`);

  const constater = async (geste) => console.log(`${geste} : ${JSON.stringify(await page.evaluate(etat))}`);
  const premier = '[data-ligne="Aïssatou Camara"] .ai5d-bouton';

  await page.focus(premier);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  await constater('Entrée sur le déclencheur');
  console.log(`position : ${JSON.stringify(await page.evaluate(position, premier))}`);
  await page.keyboard.press('ArrowDown');
  await constater('Flèche bas');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await constater('Flèche bas deux fois, le filet sauté');
  await page.keyboard.press('ArrowDown');
  await constater('Flèche bas en fin de menu, la boucle');
  await page.keyboard.press('End');
  await constater('Fin');
  await page.keyboard.press('Home');
  await constater('Début');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await constater('Échap');
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(250);
  await constater('Flèche haut sur le déclencheur');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(150);
  await constater('Tab');

  await page.click(premier);
  await page.waitForTimeout(250);
  await constater('Clic sur le déclencheur');
  await page.mouse.click(5, 5);
  await page.waitForTimeout(250);
  await constater('Clic à côté');

  await page.locator('[data-banc="table"]').evaluate((table) => table.scrollBy(0, 40));
  await page.click('[data-ligne="Ibrahima Sow"] .ai5d-bouton');
  await page.waitForTimeout(250);
  console.log(
    `menu d'une ligne après défilement de la table : ${JSON.stringify(await page.evaluate(position, '[data-ligne="Ibrahima Sow"] .ai5d-bouton'))}`,
  );
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(300);
  await constater('Défilement de la page, menu ouvert');
  await page.keyboard.press('Escape');

  const bas = '[data-banc="bas"] .ai5d-bouton';
  await page.locator(bas).scrollIntoViewIfNeeded();
  await page.evaluate((s) => {
    const d = document.querySelector(s).getBoundingClientRect();
    window.scrollBy(0, d.bottom - innerHeight + 8);
  }, bas);
  await page.waitForTimeout(200);
  await page.click(bas);
  await page.waitForTimeout(250);
  console.log(`menu au bord bas de la fenêtre : ${JSON.stringify(await page.evaluate(position, bas))}`);

  console.log(`erreurs de console : ${erreurs.length === 0 ? 'aucune' : erreurs.join(' | ')}`);
  await navigateur.close();
}

(async () => {
  await jouer('chromium');
  await jouer('chromium', { sansAncre: true });
  await jouer('firefox');
  await jouer('webkit');
})().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
