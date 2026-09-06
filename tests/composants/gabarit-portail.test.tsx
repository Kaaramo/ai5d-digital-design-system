import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { Shield, UserRound, MonitorSmartphone } from 'lucide-react';
import {
  GabaritPortail,
  HAUTEUR_BARRE_ONGLETS,
  LARGEUR_RAIL_BUREAU,
  LARGEUR_RAIL_TABLETTE,
  ONGLETS_MAX,
  ONGLETS_MIN,
} from '../../noyau/composants';
import type { Rubrique } from '../../noyau/composants';
import { LARGE, TABLETTE } from '../../noyau/paliers';

const RUBRIQUES: Rubrique[] = [
  { id: 'profil', libelle: 'Profil', icone: UserRound, href: '/profil' },
  { id: 'securite', libelle: 'Sécurité', icone: Shield, href: '/securite' },
  { id: 'sessions', libelle: 'Sessions', icone: MonitorSmartphone, href: '/sessions' },
];

function poser(actif = 'profil') {
  return render(
    <GabaritPortail produit="Compte" rubriques={RUBRIQUES} actif={actif}>
      <p>Le contenu de la rubrique</p>
    </GabaritPortail>,
  );
}

describe('GabaritPortail — les deux navigations', () => {
  it('rend chaque rubrique deux fois dans le HTML : le rail et la barre basse', () => {
    // Les deux sont dans le HTML, et c'est la requête média qui en masque une. Choisir
    // au montage en mesurant la fenêtre produirait un écart d'hydratation, et le rendu
    // au serveur ne saurait pas laquelle servir.
    //
    // `hidden: true` est nécessaire : jsdom n'évalue pas les requêtes média, donc les
    // styles de base s'appliquent, donc le rail est masqué. C'est le palier de référence,
    // le téléphone, et c'est exactement le bon comportement. Voir le test suivant.
    poser();
    for (const rubrique of RUBRIQUES) {
      expect(screen.getAllByRole('link', { name: rubrique.libelle, hidden: true })).toHaveLength(2);
    }
  });

  it('un lecteur d écran n entend la navigation qu UNE fois, jamais deux', () => {
    // Le test le plus important du fichier, et il a été découvert en écrivant le
    // précédent. Deux navigations identiques dans le HTML, si les deux étaient dans
    // l'arbre d'accessibilité, feraient annoncer six rubriques au lieu de trois.
    //
    // Ce qui l'empêche est le `display: none` de la navigation masquée : il la retire de
    // l'arbre, là où `visibility` ou une classe visuelle ne l'auraient pas fait. jsdom
    // applique les styles de base, donc c'est la barre basse qu'on entend ici.
    poser();
    expect(screen.getAllByRole('navigation')).toHaveLength(1);
    for (const rubrique of RUBRIQUES) {
      expect(screen.getAllByRole('link', { name: rubrique.libelle })).toHaveLength(1);
    }
  });

  it('les deux navigations pointent les mêmes adresses', () => {
    const { container } = poser();
    const rail = [...container.querySelectorAll('.ai5d-portail__rail a')].map((a) =>
      a.getAttribute('href'),
    );
    const barre = [...container.querySelectorAll('.ai5d-onglets a')].map((a) =>
      a.getAttribute('href'),
    );
    expect(rail).toEqual(['/profil', '/securite', '/sessions']);
    expect(barre).toEqual(rail);
  });

  it('marque la rubrique courante dans les DEUX navigations', () => {
    const { container } = poser('securite');
    const courants = [...container.querySelectorAll('[aria-current="page"]')];
    expect(courants).toHaveLength(2);
    for (const noeud of courants) expect(noeud.textContent).toContain('Sécurité');
  });

  it("n'active rien quand l'identifiant actif est inconnu", () => {
    // Mieux vaut aucune rubrique active qu'une rubrique active au hasard : la seconde
    // ment sur l'endroit où l'on se trouve.
    const { container } = poser('rubrique-qui-n-existe-pas');
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(0);
  });

  it('les rubriques sont des liens, jamais des boutons', () => {
    // Une navigation qui ne s'ouvre pas au clic du milieu, ne se copie pas et disparaît
    // sans JavaScript n'est pas une navigation.
    const { container } = poser();
    expect(container.querySelectorAll('.ai5d-portail__rail button')).toHaveLength(0);
    expect(container.querySelectorAll('.ai5d-onglets button')).toHaveLength(0);
  });

  it('donne aux deux navigations la même étiquette', () => {
    // L'assertion porte sur l'attribut et non sur le rôle nommé : `dom-accessibility-api`
    // ne calcule pas de nom accessible pour un élément en `display: none`, même avec
    // `hidden: true`. Ce que l'on veut garantir est que les deux portent la même
    // étiquette, quelle que soit celle qui est visible au palier courant.
    const { container } = poser();
    const etiquettes = [...container.querySelectorAll('nav')].map((n) =>
      n.getAttribute('aria-label'),
    );
    expect(etiquettes).toEqual(['Rubriques du compte', 'Rubriques du compte']);
  });
});

describe('GabaritPortail — la coquille', () => {
  it('rend le logotype avec le nom du produit et le contenu', () => {
    poser();
    expect(screen.getByText('Compte')).toBeTruthy();
    expect(screen.getByText('Le contenu de la rubrique')).toBeTruthy();
  });

  it('place le contenu dans un <main>, une seule fois', () => {
    const { container } = poser();
    expect(container.querySelectorAll('main')).toHaveLength(1);
  });

  it("n'affiche aucune zone d'actions quand le produit n'en fournit pas", () => {
    const { container } = poser();
    expect(container.querySelector('.ai5d-portail__entete > div')).toBeNull();
  });

  it("affiche les actions de l'en-tête quand elles sont fournies", () => {
    render(
      <GabaritPortail rubriques={RUBRIQUES} actif="profil" actions={<span>MD</span>}>
        <p>x</p>
      </GabaritPortail>,
    );
    expect(screen.getByText('MD')).toBeTruthy();
  });

  it('réserve la hauteur de la barre sous le contenu', () => {
    // Sans cette réserve, le dernier élément de la page se glisse SOUS la barre. Le
    // défaut ne se voit pas sur les pages courtes, et apparaît le jour où quelqu'un
    // ajoute une ligne. C'est pour cela qu'il est porté ici et non par chaque écran.
    const { container } = poser();
    const racine = container.querySelector('[data-gabarit="portail"]') as HTMLElement;
    expect(racine.style.getPropertyValue('--reserve-barre')).toContain(
      `${HAUTEUR_BARRE_ONGLETS}px`,
    );
    expect(racine.style.getPropertyValue('--reserve-barre')).toContain('--zone-sure-basse');
  });

  it('respecte un style et une classe fournis par le produit', () => {
    const { container } = render(
      <GabaritPortail
        rubriques={RUBRIQUES}
        actif="profil"
        className="mienne"
        style={{ gap: '4px' }}
      >
        <p>x</p>
      </GabaritPortail>,
    );
    const racine = container.querySelector('[data-gabarit="portail"]') as HTMLElement;
    expect(racine.className).toContain('mienne');
    expect(racine.className).toContain('ai5d-portail');
    expect(racine.style.gap).toBe('4px');
  });
});

/**
 * jsdom ne calcule pas les requêtes média. Ces trois-là portent donc sur la feuille de
 * style elle-même : c'est moins satisfaisant qu'un rendu, et c'est la seule façon de
 * garder des valeurs dont l'erreur ne se verrait qu'à l'œil, sur un écran de 1279 px.
 */
describe('GabaritPortail — les trois paliers', () => {
  const source = readFileSync('noyau/composants/GabaritPortail.tsx', 'utf8');

  it('masque le rail sous la tablette', () => {
    expect(source).toContain('.ai5d-portail__rail { display: none; }');
  });

  it('ouvre le rail à 768 px, à 240 px de large', () => {
    expect(source).toContain(`@media (min-width: \${TABLETTE}px)`);
    expect(LARGEUR_RAIL_TABLETTE).toBe(240);
    expect(TABLETTE).toBe(768);
  });

  it('élargit le rail à 280 px à partir de 1280 px, valeur de la charte ch. 07', () => {
    expect(source).toContain(`@media (min-width: \${LARGE}px)`);
    expect(LARGEUR_RAIL_BUREAU).toBe(280);
    expect(LARGE).toBe(1280);
  });

  it('remet la réserve basse à zéro là où la barre disparaît', () => {
    expect(source).toContain('--reserve-barre: 0px');
  });

  it('ne duplique pas la règle qui masque la barre : elle appartient à BarreOnglets', () => {
    // Deux endroits où changer le palier, c'est un palier qui finit par diverger.
    expect(source).not.toContain('.ai5d-portail__barre');
  });

  it('plafonne le contenu au jeton de densité, jamais à une valeur écrite', () => {
    expect(source).toContain('max-width: var(--contenu-max)');
  });

  it('supprime la transition sous prefers-reduced-motion', () => {
    expect(source).toContain('prefers-reduced-motion');
  });
});

describe('GabaritPortail — les règles du système', () => {
  const source = readFileSync('noyau/composants/GabaritPortail.tsx', 'utf8');

  it("n'écrit aucune couleur en dur", () => {
    expect(source).not.toMatch(/(?<!&)#[0-9A-Fa-f]{3,8}\b/);
    expect(source).not.toMatch(/\brgba?\(/);
  });

  it('ne fige aucune largeur au-dessus du plancher de 320 px, hors le rail', () => {
    // Le rail EST une largeur figée, et c'est sa raison d'être : la charte la prescrit.
    // Toute autre largeur figée serait un défaut.
    const figees = [...source.matchAll(/width: (\d+)px/g)].map((m) => Number(m[1]));
    for (const largeur of figees) {
      expect([LARGEUR_RAIL_TABLETTE, LARGEUR_RAIL_BUREAU]).toContain(largeur);
    }
  });

  it('borne les rubriques comme la barre borne ses onglets', () => {
    // Trois est le plancher, cinq le plafond. Le portail du compte en aura cinq à la fin
    // du Sprint 04, et pas une de plus.
    expect(RUBRIQUES.length).toBeGreaterThanOrEqual(ONGLETS_MIN);
    expect(RUBRIQUES.length).toBeLessThanOrEqual(ONGLETS_MAX);
  });
});
