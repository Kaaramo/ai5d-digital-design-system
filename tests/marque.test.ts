import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const SOURCE = 'C:/Users/ksthe/Documents/AI5D_Brand_2026/tokens.css';
const marque = readFileSync('noyau/marque.css', 'utf8');

/** Correspondance nom local vers nom amont, identique a celle du script de synchronisation. */
const CORRESPONDANCE: Array<[string, string]> = [
  ['--marque-encre', '--ai5d-ink'],
  ['--marque-navy', '--ai5d-navy'],
  ['--marque-action', '--ai5d-blue'],
  ['--marque-action-survol', '--ai5d-blue-hover'],
  ['--marque-action-clair', '--ai5d-blue-light'],
  ['--marque-blanc', '--ai5d-white'],
];

function valeur(css: string, nom: string): string | null {
  const correspondance = new RegExp(`${nom}\\s*:\\s*(#[0-9A-Fa-f]{6})\\s*;`).exec(css);
  return correspondance ? (correspondance[1] as string).toUpperCase() : null;
}

describe('jetons de marque - forme', () => {
  it('declare exactement six jetons, la liste est fermee', () => {
    const declares = marque.match(/^\s*--[a-z-]+:/gm) ?? [];
    expect(declares.length).toBe(6);
  });

  it('prefixe tous ses jetons par --marque-, ce qui les rend intouchables', () => {
    for (const declaration of marque.match(/^\s*(--[a-z-]+):/gm) ?? []) {
      expect(declaration.trim()).toMatch(/^--marque-/);
    }
  });

  it('porte son en-tete de provenance et son empreinte', () => {
    expect(marque).toContain('GENERE par _build/synchroniser-marque.mjs');
    expect(marque).toContain(SOURCE);
    expect(marque).toMatch(/Empreinte : sha256\(16\) [0-9a-f]{16}/);
  });

  it('nomme le jeton amont en regard de chaque jeton local', () => {
    for (const [, amont] of CORRESPONDANCE) {
      expect(marque, `${amont} n'est pas trace`).toContain(amont);
    }
  });
});

/*
  LA SOURCE DE MARQUE N EXISTE QUE SUR LE POSTE DU COMMANDITAIRE.

  `AI5D_Brand_2026` est un depot local, prive, hors de ce depot. La premiere integration continue du
  systeme, le 15 septembre 2026, est tombee sur ce seul test : `ENOENT` sur un chemin `C:/Users/...`
  qu une machine Linux ne peut pas avoir. Le test etait juste ; il n avait jamais tourne ailleurs.

  Il saute donc sur GitHub Actions, et SEULEMENT la, et seulement si la source est absente. Ailleurs,
  une source manquante reste un echec : sur ce poste, meme lance avec `CI=true`, la derive se verifie.
  C est `GITHUB_ACTIONS` et non `CI` qui decide, parce que les commandes de verification locales
  posent elles aussi `CI=true`. Le test des valeurs connues, juste en dessous, tourne partout et fige
  les six valeurs : sur la CI, c est lui qui garde la marque.
*/
const SOURCE_INACCESSIBLE_EN_CI = process.env.GITHUB_ACTIONS === 'true' && !existsSync(SOURCE);

describe("jetons de marque - garde d'integrite", () => {
  it.skipIf(SOURCE_INACCESSIBLE_EN_CI)("n'a pas derive de la source", () => {
    const source = readFileSync(SOURCE, 'utf8');
    for (const [local, amont] of CORRESPONDANCE) {
      const localeValeur = valeur(marque, local);
      const amontValeur = valeur(source, amont);
      expect(localeValeur, `${local} absent de marque.css`).not.toBeNull();
      expect(amontValeur, `${amont} absent de la source de marque`).not.toBeNull();
      expect(localeValeur, `${local} a derive de ${amont}. Relancer : pnpm marque`).toBe(
        amontValeur,
      );
    }
  });

  it('reproduit les valeurs de marque connues et non negociables', () => {
    expect(valeur(marque, '--marque-encre')).toBe('#051C2C');
    expect(valeur(marque, '--marque-navy')).toBe('#042A76');
    expect(valeur(marque, '--marque-action')).toBe('#2251FF');
    expect(valeur(marque, '--marque-action-survol')).toBe('#1B44DB');
    expect(valeur(marque, '--marque-action-clair')).toBe('#5B7BFF');
    expect(valeur(marque, '--marque-blanc')).toBe('#FFFFFF');
  });
});
