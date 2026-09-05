import { describe, expect, it } from 'vitest';
import { luminance, ratioContraste, verdictWcag, versRgb } from '../outils/contraste';

describe('versRgb', () => {
  it('lit un hexadecimal a six chiffres', () => {
    expect(versRgb('#2251FF')).toEqual([34, 81, 255]);
  });

  it('accepte les minuscules et les espaces autour', () => {
    expect(versRgb('  #2251ff ')).toEqual([34, 81, 255]);
  });

  it('refuse une forme courte a trois chiffres', () => {
    expect(() => versRgb('#FFF')).toThrow(/Couleur invalide/);
  });

  it('refuse une chaine sans diese', () => {
    expect(() => versRgb('2251FF')).toThrow(/Couleur invalide/);
  });

  it('refuse une chaine vide', () => {
    expect(() => versRgb('')).toThrow(/Couleur invalide/);
  });
});

describe('luminance', () => {
  it('vaut 1 pour le blanc et 0 pour le noir', () => {
    expect(luminance('#FFFFFF')).toBeCloseTo(1, 5);
    expect(luminance('#000000')).toBeCloseTo(0, 5);
  });

  it('classe le papier tiede juste sous le blanc', () => {
    expect(luminance('#FAF7F2')).toBeLessThan(luminance('#FFFFFF'));
    expect(luminance('#FAF7F2')).toBeGreaterThan(0.9);
  });
});

describe('ratioContraste', () => {
  it('donne 21 entre le noir et le blanc', () => {
    expect(ratioContraste('#000000', '#FFFFFF')).toBeCloseTo(21, 2);
  });

  it('donne 1 pour deux couleurs identiques', () => {
    expect(ratioContraste('#2251FF', '#2251FF')).toBeCloseTo(1, 5);
  });

  it("est insensible a l'ordre des arguments", () => {
    expect(ratioContraste('#B42318', '#FAF7F2')).toBeCloseTo(
      ratioContraste('#FAF7F2', '#B42318'),
      10,
    );
  });

  // Ces valeurs sont celles mesurees et consignees dans la spec, section 2.4.
  // Elles servent d'ancrage : si ce module change, elles doivent tenir.
  it('reproduit les mesures consignees dans la spec', () => {
    expect(ratioContraste('#0E7C5A', '#FAF7F2')).toBeCloseTo(4.85, 1);
    expect(ratioContraste('#B45309', '#FAF7F2')).toBeCloseTo(4.7, 1);
    expect(ratioContraste('#B42318', '#FAF7F2')).toBeCloseTo(6.15, 1);
    expect(ratioContraste('#66747E', '#FAF7F2')).toBeCloseTo(4.5, 1);
    expect(ratioContraste('#66747E', '#FFFFFF')).toBeCloseTo(4.81, 1);
    expect(ratioContraste('#2251FF', '#FAF7F2')).toBeCloseTo(5.33, 1);
  });

  it('confirme que les valeurs institutionnelles echouent sur papier tiede', () => {
    // C'est la mesure qui justifie la divergence assumee en spec section 2.4.
    expect(ratioContraste('#1E874B', '#FAF7F2')).toBeLessThan(4.5);
    expect(ratioContraste('#B7791F', '#FFFFFF')).toBeLessThan(4.5);
  });

  it("confirme que l'ancienne valeur du texte faible echouait", () => {
    expect(ratioContraste('#6B7A85', '#FAF7F2')).toBeLessThan(4.5);
    expect(ratioContraste('#6B7A85', '#FFFFFF')).toBeLessThan(4.5);
  });

  it('confirme que la valeur corrigee passe le seuil sur les deux surfaces', () => {
    expect(ratioContraste('#66747E', '#FAF7F2')).toBeGreaterThanOrEqual(4.5);
    expect(ratioContraste('#66747E', '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('verdictWcag', () => {
  it('classe les quatre paliers', () => {
    expect(verdictWcag(7.1)).toBe('AAA');
    expect(verdictWcag(4.5)).toBe('AA');
    expect(verdictWcag(3.2)).toBe('AA-gros');
    expect(verdictWcag(2.9)).toBe('echec');
  });

  it('place les seuils sur la bonne borne', () => {
    expect(verdictWcag(7)).toBe('AAA');
    expect(verdictWcag(6.99)).toBe('AA');
    expect(verdictWcag(4.49)).toBe('AA-gros');
    expect(verdictWcag(3)).toBe('AA-gros');
  });
});
