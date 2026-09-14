import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  decrire,
  exceptionsEspacementPerimees,
  JETONS_DE_MARQUE,
  PLANCHER_LARGEUR,
  PLANCHER_TACTILE,
  verifierAucuneCouleurEnDur,
  verifierAucunEspacementEnDur,
  verifierAucuneLargeurFixe,
  verifierAucunJetonDeMarqueRedefini,
  verifierHauteurDeVueDynamique,
  verifierPlancherTactile,
} from './index';

/**
 * Les gardes s'appliquent d'abord au depot lui-meme : un systeme qui ne respecte pas
 * ses propres regles ne peut pas les imposer a ses consommateurs.
 *
 * Les fichiers qui DEFINISSENT les jetons sont les seules exceptions legitimes, et
 * elles sont enumerees ici plutot que devinees.
 */
const EXCEPTIONS_DU_DEPOT = [
  'noyau/marque.css',
  'noyau/jetons.css',
  'noyau/ai5d.preset.css',
  'noyau/polices',
  'tests',
  'gardes',
  '_build',
  'specimens',
  'docs',
];

function depotTemporaire(): string {
  return mkdtempSync(join(tmpdir(), 'ai5d-gardes-'));
}

describe('garde 1 - aucune couleur en dur', () => {
  it('ne releve aucune infraction dans le depot lui-meme', () => {
    const infractions = verifierAucuneCouleurEnDur('.', { exceptions: EXCEPTIONS_DU_DEPOT });
    expect(infractions.length, `\n${decrire(infractions)}`).toBe(0);
  });

  it('releve un hexadecimal ecrit dans un composant', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'Ecran.tsx'), "const c = '#2251FF';\n");
    const infractions = verifierAucuneCouleurEnDur(racine);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.regle).toBe('aucune-couleur-en-dur');
    expect(infractions[0]?.ligne).toBe(1);
  });

  it('ne prend pas une entite HTML numerique pour une couleur', () => {
    // `&#8239;` est l espace fine insecable, exigee par la typographie francaise avant un
    // point d interrogation. La garde y voyait la couleur `#8239` et refusait un ecran
    // parfaitement conforme. Trouve dans le portail Compte, sur la ligne
    // « Mot de passe oublie&#8239;? ».
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'Ecran.tsx'), 'const t = "Mot de passe oublie&#8239;?";\n');
    expect(verifierAucuneCouleurEnDur(racine)).toEqual([]);
  });

  it('releve encore un hexadecimal colle a une esperluette au loin', () => {
    // La correction ne doit pas ouvrir de porte : seul le `&` IMMEDIATEMENT avant le
    // croisillon designe une entite.
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'Ecran.tsx'), "const c = a && '#2251FF';\n");
    expect(verifierAucuneCouleurEnDur(racine)).toHaveLength(1);
  });

  it('releve rgba autant qu un hexadecimal', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'styles.css'), '.a { color: rgba(5, 28, 44, 0.6); }\n');
    expect(verifierAucuneCouleurEnDur(racine)).toHaveLength(1);
  });

  it('laisse passer les commentaires, qui ont le droit de citer une valeur ecartee', () => {
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'note.ts'),
      "// L'ancienne valeur #6B7A85 echouait a 4,14.\nconst a = 'var(--texte-faible)';\n",
    );
    expect(verifierAucuneCouleurEnDur(racine)).toHaveLength(0);
  });

  it('honore les exceptions, dossier compris', () => {
    const racine = depotTemporaire();
    mkdirSync(join(racine, 'jetons'));
    writeFileSync(join(racine, 'jetons', 'base.css'), ':root { --a: #FAF7F2; }\n');
    expect(verifierAucuneCouleurEnDur(racine)).toHaveLength(1);
    expect(verifierAucuneCouleurEnDur(racine, { exceptions: ['jetons'] })).toHaveLength(0);
  });

  it('ignore node_modules sans qu on ait a le demander', () => {
    const racine = depotTemporaire();
    mkdirSync(join(racine, 'node_modules'));
    writeFileSync(join(racine, 'node_modules', 'x.css'), '.a { color: #FFF; }\n');
    expect(verifierAucuneCouleurEnDur(racine)).toHaveLength(0);
  });
});

describe('garde 2 - aucun jeton de marque redefini', () => {
  it('ne releve aucune infraction dans le depot, hors marque.css', () => {
    const infractions = verifierAucunJetonDeMarqueRedefini('.', {
      exceptions: ['noyau/marque.css', 'gardes', 'tests', 'docs', 'node_modules'],
    });
    expect(infractions.length, `\n${decrire(infractions)}`).toBe(0);
  });

  it('releve la redefinition de chacun des six jetons', () => {
    for (const jeton of JETONS_DE_MARQUE) {
      const racine = depotTemporaire();
      writeFileSync(join(racine, 'produit.css'), `:root {\n  ${jeton}: #123456;\n}\n`);
      const infractions = verifierAucunJetonDeMarqueRedefini(racine);
      expect(infractions.length, `${jeton} non detecte`).toBe(1);
      expect(infractions[0]?.regle).toBe('aucun-jeton-de-marque-redefini');
    }
  });

  it('laisse passer une simple lecture du jeton', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'produit.css'), ':root { --action: var(--marque-action); }\n');
    expect(verifierAucunJetonDeMarqueRedefini(racine)).toHaveLength(0);
  });
});

describe('garde 3 - plancher tactile', () => {
  it('valide le fichier de profils du depot', () => {
    const infractions = verifierPlancherTactile('densites/profils.css');
    expect(infractions.length, `\n${decrire(infractions)}`).toBe(0);
  });

  it('releve une requete media absente', () => {
    const racine = depotTemporaire();
    const chemin = join(racine, 'profils.css');
    writeFileSync(chemin, "[data-densite='compact'] { --hauteur-controle: 40px; }\n");
    const infractions = verifierPlancherTactile(chemin);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.extrait).toContain('absente');
  });

  it('releve une variable oubliee dans la requete', () => {
    const racine = depotTemporaire();
    const chemin = join(racine, 'profils.css');
    writeFileSync(
      chemin,
      '@media (pointer: coarse) {\n  :root { --hauteur-controle: max(var(--hauteur-controle), 44px); }\n}\n',
    );
    const infractions = verifierPlancherTactile(chemin);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.extrait).toContain('--ligne-liste');
  });

  it('fixe le plancher a 44 px, valeur non negociable', () => {
    expect(PLANCHER_TACTILE).toBe(44);
  });
});

describe('garde 4 - aucune largeur fixe', () => {
  it('ne releve aucune infraction dans le depot lui-meme', () => {
    const infractions = verifierAucuneLargeurFixe('.', { exceptions: EXCEPTIONS_DU_DEPOT });
    expect(infractions.length, `\n${decrire(infractions)}`).toBe(0);
  });

  it('accepte max-width et min-width, qui sont la solution et non le probleme', () => {
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'ecran.css'),
      '.a { max-width: 440px; }\n.b { min-width: 600px; }\n.c { maxWidth: 900px; }\n',
    );
    expect(verifierAucuneLargeurFixe(racine)).toHaveLength(0);
  });

  it('refuse une largeur figee au-dela du plancher', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'ecran.css'), '.panneau { width: 440px; }\n');
    const infractions = verifierAucuneLargeurFixe(racine);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.regle).toBe('aucune-largeur-fixe');
  });

  it('tolere une largeur figee sous le plancher : une pastille, une icone, un avatar', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'ecran.css'), '.pastille { width: 48px; }\n');
    expect(verifierAucuneLargeurFixe(racine)).toHaveLength(0);
  });

  it('voit la meme faute ecrite en style en ligne', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'Ecran.tsx'), "const s = { width: '600px' };\n");
    expect(verifierAucuneLargeurFixe(racine)).toHaveLength(1);
  });

  it('laisse passer les pourcentages et les unites souples', () => {
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'ecran.css'),
      '.a { width: 100%; }\n.b { width: 45vw; }\n.c { width: auto; }\n',
    );
    expect(verifierAucuneLargeurFixe(racine)).toHaveLength(0);
  });

  it('laisse passer les commentaires, qui ont le droit de citer la faute', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'ecran.css'), '/* jamais width: 900px ici */\n.a { color: red; }\n');
    expect(verifierAucuneLargeurFixe(racine)).toHaveLength(0);
  });

  it('fixe le plancher a 320 px', () => {
    expect(PLANCHER_LARGEUR).toBe(320);
  });
});

describe('garde 5 - hauteur de vue dynamique', () => {
  it('ne releve aucune infraction dans le depot lui-meme', () => {
    const infractions = verifierHauteurDeVueDynamique('.', { exceptions: EXCEPTIONS_DU_DEPOT });
    expect(infractions.length, `\n${decrire(infractions)}`).toBe(0);
  });

  it('refuse 100vh', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'ecran.css'), '.page { min-height: 100vh; }\n');
    const infractions = verifierHauteurDeVueDynamique(racine);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.regle).toBe('hauteur-de-vue-dynamique');
  });

  it('accepte dvh, svh et lvh', () => {
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'ecran.css'),
      '.a { height: 100dvh; }\n.b { height: 50svh; }\n.c { height: 80lvh; }\n',
    );
    expect(verifierHauteurDeVueDynamique(racine)).toHaveLength(0);
  });

  it('voit vh a l interieur d un calc', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'ecran.css'), '.a { height: calc(100vh - 56px); }\n');
    expect(verifierHauteurDeVueDynamique(racine)).toHaveLength(1);
  });

  it('ne confond pas vh avec vw ou vmin', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'ecran.css'), '.a { width: 50vw; }\n.b { font-size: 4vmin; }\n');
    expect(verifierHauteurDeVueDynamique(racine)).toHaveLength(0);
  });
});

describe('garde 6 - aucun espacement en dur', () => {
  /**
   * LES LITTERAUX HORS ECHELLE DU DEPOT, NOMMES UN PAR UN.
   *
   * Releve le 14 septembre 2026 : trente-deux litteraux d espacement dans les composants. Les
   * dix-sept qui avaient leur jeton exact ont ete convertis, sans qu aucun pixel ne bouge : les
   * profils de densite ne redefinissent pas l echelle. Restent ceux-ci, que l echelle n offre pas.
   *
   * Les convertir changerait le rendu, et c est une decision de dessin, pas une correction
   * mecanique : un bandeau de 14 px de rembourrage devient plus haut a 16. Ils sont donc permis,
   * mais listes, et `exceptionsEspacementPerimees` refuse toute entree qui ne designe plus rien.
   *
   * Plusieurs disparaitront avec la tache 7 du sprint 17 (`GabaritPortail` retire, `GabaritAuth`
   * repris) : la garde de peremption obligera alors a les retirer d ici.
   */
  const HORS_ECHELLE: Record<string, string[]> = {
    // Le rembourrage vertical du bandeau, et deux alignements optiques de l icone et du titre.
    'noyau/composants/Bandeau.tsx': ['14px', '1px', '2px'],
    // L ecart entre l icone et le libelle d un onglet de la barre basse, serre par la hauteur.
    'noyau/composants/BarreOnglets.tsx': ['3px'],
    // Le rembourrage horizontal du bouton : entre 16 et 24, ni l un ni l autre ne tient.
    'noyau/composants/Bouton.tsx': ['20px'],
    // Le surtitre colle au titre, et la respiration avant l action.
    'noyau/composants/CarteAction.tsx': ['6px', '20px'],
    // Le titre et sa description, serres : un en-tete de carte, pas deux paragraphes.
    'noyau/composants/EnteteCarte.tsx': ['2px'],
    // L etiquette colle a son champ.
    'noyau/composants/Champ.tsx': ['6px'],
    // La marge du panneau d authentification sur telephone.
    'noyau/composants/GabaritAuth.tsx': ['40px'],
    // L ecart entre les lignes de la navigation du portail.
    'noyau/composants/GabaritPortail.tsx': ['2px'],
    // Le trait actif qui recouvre la bordure : un chevauchement, pas un espacement.
    'noyau/composants/OngletsRubrique.tsx': ['-1px'],
    // La pastille : sa hauteur est celle d une ligne de texte, pas celle d un bloc.
    'noyau/composants/Pastille.tsx': ['2px', '10px'],
  };

  it('ne releve aucune infraction dans le depot lui-meme', () => {
    const infractions = verifierAucunEspacementEnDur('.', {
      exceptions: EXCEPTIONS_DU_DEPOT,
      horsEchelle: HORS_ECHELLE,
    });
    expect(
      infractions.length,
      `
${decrire(infractions)}`,
    ).toBe(0);
  });

  it('ne garde aucune exception perimee', () => {
    expect(exceptionsEspacementPerimees('.', HORS_ECHELLE)).toEqual([]);
  });

  it('releve un espacement en pixels, en CSS comme en objet de style', () => {
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'Ecran.tsx'),
      "const s = { paddingTop: '12px' };\n.a { gap: 8px; }\n",
    );
    const infractions = verifierAucunEspacementEnDur(racine);
    expect(infractions).toHaveLength(2);
    expect(infractions[0]?.regle).toBe('aucun-espacement-en-dur');
  });

  it('laisse passer une remise a zero', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'Ecran.tsx'), '.a { padding: 0px; margin: 0; }\n');
    expect(verifierAucunEspacementEnDur(racine)).toEqual([]);
  });

  it('ne prend pas un trait pour un espacement', () => {
    // Un motif qui chercherait `top` n importe ou refuserait `border-top`. Le plan du sprint 17
    // proposait exactement ce motif : il aurait releve les bordures des composants comme des fautes.
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'Ecran.tsx'),
      '.a { border-top: 1px solid red; border-bottom: 2px solid; outline-offset: 2px; }\n',
    );
    expect(verifierAucunEspacementEnDur(racine)).toEqual([]);
  });

  it('refuse d excuser une valeur que l echelle offre', () => {
    // 16 px a son jeton : le declarer hors echelle serait un contournement nomme.
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'Ecran.tsx'), '.a { gap: 16px; }\n');
    const infractions = verifierAucunEspacementEnDur(racine, {
      horsEchelle: { 'Ecran.tsx': ['16px'] },
    });
    expect(infractions).toHaveLength(1);
    expect(exceptionsEspacementPerimees(racine, { 'Ecran.tsx': ['16px'] })).toHaveLength(1);
  });

  it('signale une exception qui ne designe plus rien', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'Ecran.tsx'), '.a { gap: var(--espace-3); }\n');
    expect(
      exceptionsEspacementPerimees(racine, { 'Ecran.tsx': ['14px'], 'Disparu.tsx': ['2px'] }),
    ).toHaveLength(2);
  });
});

describe('mise en forme', () => {
  it('dit clairement quand il n y a rien', () => {
    expect(decrire([])).toBe('Aucune infraction.');
  });

  it('nomme la regle, le fichier et la ligne', () => {
    const texte = decrire([
      { fichier: 'a.css', ligne: 12, extrait: 'color: #FFF', regle: 'aucune-couleur-en-dur' },
    ]);
    expect(texte).toContain('aucune-couleur-en-dur');
    expect(texte).toContain('a.css:12');
  });
});
