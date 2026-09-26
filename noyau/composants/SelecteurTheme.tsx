'use client';

import { useState } from 'react';
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import {
  COOKIE_THEME,
  DUREE_COOKIE_THEME_S,
  LIBELLE_THEME,
  THEMES,
  attributTheme,
  type Theme,
} from '../theme';
import { Icone } from './Icone';

/**
 * Le choix du thème : clair, sombre, ou celui de l'appareil.
 *
 * ── LE BASCULEMENT EST IMMÉDIAT ─────────────────────────────────────────────
 * L'attribut est posé sur `<html>` à la seconde du clic, sans attendre le serveur. Le cookie ne
 * sert qu'à ce que le choix survive au rechargement, où le gabarit racine du produit le relira.
 * Rien n'est rafraîchi : rejouer l'arbre serveur pour un changement que le CSS opère seul serait
 * un aller-retour sans objet.
 *
 * ── LE COOKIE SUIT LA PERSONNE D'UN PRODUIT À L'AUTRE ───────────────────────
 * Dans Compte, il était posé sur l'hôte seul : le sombre choisi sur Compte ne valait pas sur les
 * autres produits, et chacun redemandait. Avec `domaine`, il vaut pour tout le domaine de
 * l'écosystème.
 *
 * ── UN GROUPE DE BOUTONS RADIO, PAS TROIS BOUTONS ───────────────────────────
 * `role="radiogroup"` avec trois `role="radio"` : un lecteur d'écran annonce « 2 sur 3 ». Trois
 * boutons indépendants auraient laissé croire à trois actions sans rapport.
 *
 * ── AU DOIGT, CHAQUE SEGMENT FAIT 44 PX, EN v1.2.0 ──────────────────────────
 * Des segments de 32 px, dans un groupe de 40 : le commentaire qui les justifiait disait « on vise le
 * groupe ». C'était faux : chaque segment est une cible distincte, et le groupe lui-même était sous le
 * plancher. Sous `(pointer: coarse)`, chaque segment prend 44 px au moins, et le groupe 52. À la
 * souris, rien ne change.
 *
 * ── LES LIBELLÉS VISIBLES, EN v1.2.0 ────────────────────────────────────────
 * Avec `libellesVisibles`, « Clair », « Sombre », « Système » s'écrivent à côté de l'icône et le groupe
 * occupe toute la largeur : c'est la forme d'un pied de page de téléphone. Le nom visible devient le
 * nom accessible, sans `aria-label` ni `title`, pour qu'une commande vocale qui entend « Sombre »
 * trouve « Sombre ». Sous 17rem de largeur disponible, l'icône se retire et le mot reste : un mot seul
 * se lit, une icône seule s'apprend. Le segment coché prend la graisse semi-grasse en plus de sa
 * couleur.
 *
 * ── LE SEGMENT ACTIF A ENFIN UN FOND EN SOMBRE ──────────────────────────────
 * Il prenait `--info-fond`, qui se détache en clair et disparaît en sombre : le choix courant ne se
 * voyait plus justement quand on venait de choisir le sombre. Il prend `--surface-selection`, réglé
 * par thème. C'est l'une des trois différences voulues de la migration.
 */

const ICONE_DU_THEME: Record<Theme, LucideIcon> = {
  clair: Sun,
  sombre: Moon,
  systeme: Monitor,
};

const ID_STYLE = 'ai5d-selecteur-theme';

export const STYLE_SELECTEUR_THEME = `
.ai5d-theme {
  display: inline-flex; align-items: center; gap: 2px;
  padding: 3px;
  border: 1px solid var(--bordure);
  border-radius: var(--rayon-plein);
}
.ai5d-theme__segment {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  padding: 0;
  border: none; border-radius: var(--rayon-plein);
  background: none; color: var(--texte-faible);
  cursor: pointer;
  transition: background var(--duree-courte) var(--courbe-sortie),
              color var(--duree-courte) var(--courbe-sortie);
}
@media (hover: hover) {
  .ai5d-theme__segment:hover { background: var(--surface-1); color: var(--texte-fort); }
}
.ai5d-theme__segment[aria-checked='true'] {
  background: var(--surface-selection);
  color: var(--action);
}
.ai5d-theme__segment:active { background: var(--surface-selection); transition: none; }
.ai5d-theme__segment:focus-visible {
  outline: 2px solid var(--action);
  outline-offset: 2px;
}

@media (pointer: coarse) {
  .ai5d-theme__segment { min-width: var(--cible-tactile); min-height: var(--cible-tactile); }
}

.ai5d-theme[data-libelles] {
  display: flex; width: 100%;
  container-type: inline-size;
}
.ai5d-theme[data-libelles] .ai5d-theme__segment {
  flex: 1 1 0; width: auto; min-width: 0;
  gap: var(--espace-1); padding: 0 var(--espace-2);
  font-family: var(--police-corps); font-size: var(--taille-sm);
  font-weight: var(--graisse-moyenne); white-space: nowrap;
}
.ai5d-theme[data-libelles] .ai5d-theme__segment[aria-checked='true'] {
  font-weight: var(--graisse-semi);
}
@container (max-width: 17rem) {
  .ai5d-theme[data-libelles] .ai5d-theme__icone { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ai5d-theme__segment { transition: none; }
}
`;

/**
 * Écrit le choix dans le cookie, côté client.
 *
 * `samesite=lax` et non `strict` : le cookie doit survivre au retour d'un fournisseur d'identité.
 * `secure` seulement en HTTPS, sinon le navigateur refuserait le cookie en développement.
 *
 * ── L'ANCIEN COOKIE D'HÔTE EST EXPIRÉ D'ABORD ───────────────────────────────
 * Avec un domaine, deux cookies du même nom coexisteraient : celui d'hôte, posé avant, et celui du
 * domaine. Le navigateur enverrait les deux, dans un ordre que le serveur ne peut pas interpréter,
 * et le thème lu serait tantôt l'ancien, tantôt le nouveau. On expire donc celui d'hôte, puis on
 * écrit celui du domaine, dans cet ordre.
 */
export function memoriserTheme(theme: Theme, domaine?: string): void {
  const sur = window.location.protocol === 'https:' ? '; secure' : '';
  const base = `${COOKIE_THEME}=${theme}; path=/; max-age=${DUREE_COOKIE_THEME_S}; samesite=lax`;

  if (domaine !== undefined && domaine.length > 0) {
    document.cookie = `${COOKIE_THEME}=; path=/; max-age=0${sur}`;
    document.cookie = `${base}; domain=${domaine}${sur}`;
    return;
  }

  document.cookie = `${base}${sur}`;
}

export interface ProprietesSelecteurTheme {
  /** L'état de départ, lu du cookie par le gabarit racine du produit. */
  theme: Theme;
  /**
   * Le domaine du cookie : `.ai5d.technology` en production, `.staging.ai5d.technology` en
   * préproduction, absent en local, où un domaine ne se pose pas sur `localhost`.
   */
  domaine?: string | undefined;
  /**
   * Écrit « Clair », « Sombre », « Système » à côté de l'icône, et occupe toute la largeur
   * disponible. Faux par défaut : le pied du rail de Compte garde ses icônes.
   */
  libellesVisibles?: boolean | undefined;
}

export function SelecteurTheme({
  theme: themeInitial,
  domaine,
  libellesVisibles = false,
}: ProprietesSelecteurTheme) {
  const [theme, setTheme] = useState<Theme>(themeInitial);

  function choisir(suivant: Theme): void {
    setTheme(suivant);
    memoriserTheme(suivant, domaine);

    const attribut = attributTheme(suivant);
    if (attribut === undefined) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', attribut);
  }

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_SELECTEUR_THEME }} />

      <div
        className="ai5d-theme"
        role="radiogroup"
        aria-label="Thème de l’interface"
        data-libelles={libellesVisibles ? '' : undefined}
      >
        {THEMES.map((valeur) => (
          <button
            key={valeur}
            type="button"
            role="radio"
            aria-checked={theme === valeur}
            // En mode icônes, le libellé n'est pas à l'écran : sans lui, le bouton n'aurait pas de
            // nom. En mode libellés, le nom visible EST le nom accessible.
            aria-label={libellesVisibles ? undefined : LIBELLE_THEME[valeur]}
            title={libellesVisibles ? undefined : LIBELLE_THEME[valeur]}
            onClick={() => choisir(valeur)}
            className="ai5d-theme__segment"
          >
            {libellesVisibles ? (
              <>
                <Icone nom={ICONE_DU_THEME[valeur]} taille={16} className="ai5d-theme__icone" />
                <span>{LIBELLE_THEME[valeur]}</span>
              </>
            ) : (
              <Icone nom={ICONE_DU_THEME[valeur]} taille={16} />
            )}
          </button>
        ))}
      </div>
    </>
  );
}
