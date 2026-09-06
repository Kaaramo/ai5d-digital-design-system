import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import * as composants from '../noyau/composants';

const DOSSIER = 'noyau/composants';
const index = readFileSync(`${DOSSIER}/index.ts`, 'utf8');

const ATTENDUS = [
  'Bandeau',
  'BarreOnglets',
  'Bouton',
  'Carte',
  'CarteAction',
  'Champ',
  'GabaritApp',
  'GabaritAuth',
  'GabaritPortail',
  'Icone',
  'Logotype',
  'Pastille',
] as const;

describe('index des composants', () => {
  it('exporte les douze composants du noyau', () => {
    for (const nom of ATTENDUS) {
      expect(composants, `${nom} n'est pas exporte`).toHaveProperty(nom);
      expect(typeof composants[nom], `${nom} n'est pas un composant`).toBe('function');
    }
  });

  it("n'oublie aucun fichier de composant", () => {
    const fichiers = readdirSync(DOSSIER)
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => f.replace('.tsx', ''));
    for (const fichier of fichiers) {
      expect(index, `${fichier}.tsx existe mais n'est pas dans l'index`).toContain(
        `from './${fichier}'`,
      );
    }
    expect(fichiers.sort()).toEqual([...ATTENDUS].sort());
  });

  it('exporte aussi les constantes que les consommateurs doivent pouvoir citer', () => {
    expect(composants.EPAISSEUR_TRAIT).toBe(1.75);
    expect(composants.LARGEUR_FORMULAIRE).toBe(440);
    expect(composants.BASCULE_DEUX_COLONNES).toBe(1024);
    expect(composants.LARGEUR_MAX_PANNEAU).toBe(560);
    expect(composants.HAUTEUR_BARRE_ONGLETS).toBe(56);
    expect(composants.HAUTEUR_ENTETE).toBe(56);
    expect(composants.TAILLE_PASTILLE_ICONE).toBe(48);
    expect(composants.ONGLETS_MIN).toBe(3);
    expect(composants.ONGLETS_MAX).toBe(5);
  });

  it("n'exporte aucun composant inter-produits - ils appartiennent a l'ecosysteme", () => {
    for (const interdit of [
      'MenuCompte',
      'SelecteurOrganisation',
      'SelecteurProduit',
      'AccesRefuse',
      'BandeauEnvironnement',
    ]) {
      expect(composants, `${interdit} appartient a la couche ecosysteme`).not.toHaveProperty(
        interdit,
      );
    }
  });
});
