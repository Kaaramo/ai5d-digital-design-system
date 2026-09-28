import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { Champ } from '../../noyau/composants/Champ';
import { Selecteur } from '../../noyau/composants/Selecteur';
import { texteFeuille } from '../aides/feuille';

/**
 * `Selecteur` (SPEC 1.3.0, §5.9). Les cas du test du Portail (`tests/unites/champs.test.tsx`),
 * repris, et ce que Compte emploie : le libellé masqué et l'invite.
 */

const rien = () => undefined;

function rendre(erreur?: string) {
  return render(
    <Selecteur
      libelle="Rôle"
      valeur="membre"
      onChange={rien}
      nom="role"
      aide="Le rôle décide de ce que la personne peut gérer."
      erreur={erreur}
      options={[
        { valeur: 'membre', libelle: 'Membre' },
        { valeur: 'administrateur', libelle: 'Administrateur' },
      ]}
    />,
  );
}

describe('Selecteur', () => {
  it('rend un select natif, lie a son libelle, qui rend la valeur choisie', () => {
    const changer = vi.fn();
    render(
      <Selecteur
        libelle="Rôle"
        valeur="membre"
        onChange={changer}
        nom="role"
        options={[
          { valeur: 'membre', libelle: 'Membre' },
          { valeur: 'administrateur', libelle: 'Administrateur' },
        ]}
      />,
    );
    const select = screen.getByLabelText('Rôle');
    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveAttribute('name', 'role');
    fireEvent.change(select, { target: { value: 'administrateur' } });
    expect(changer).toHaveBeenCalledWith('administrateur');
  });

  it('aide reliee sans erreur ; erreur en alerte qui masque l aide, et n est plus citee', () => {
    const { unmount } = rendre();
    const controle = screen.getByLabelText('Rôle');
    expect(controle).not.toHaveAttribute('aria-invalid');
    expect(controle.getAttribute('aria-describedby')).toBe(
      screen.getByText('Le rôle décide de ce que la personne peut gérer.').id,
    );
    unmount();

    rendre('Choisissez un rôle.');
    const enErreur = screen.getByLabelText('Rôle');
    expect(enErreur).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Choisissez un rôle.');
    expect(screen.queryByText('Le rôle décide de ce que la personne peut gérer.')).toBeNull();
    expect(enErreur.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id);
  });

  it('range les options d un groupe dans leur optgroup, dans l ordre de leur premier', () => {
    const { container } = render(
      <Selecteur
        libelle="Fuseau horaire"
        valeur="Africa/Conakry"
        onChange={rien}
        nom="fuseau"
        options={[
          { valeur: 'Africa/Conakry', libelle: 'Conakry', groupe: 'Fréquents' },
          { valeur: 'UTC', libelle: 'Temps universel', groupe: 'Fréquents' },
          { valeur: 'Africa/Abidjan', libelle: 'Abidjan', groupe: 'Tous' },
        ]}
      />,
    );
    const groupes = [...container.querySelectorAll('optgroup')].map((groupe) => groupe.label);
    expect(groupes).toEqual(['Fréquents', 'Tous']);
    expect(container.querySelectorAll('optgroup')[0]?.querySelectorAll('option')).toHaveLength(2);
  });

  it('masque le libelle a l oeil sans le retirer de l arbre d accessibilite', () => {
    render(
      <Selecteur
        libelle="Rôle de Mamadou Diallo"
        libelleMasque
        valeur="membre"
        onChange={rien}
        nom="role"
        options={[{ valeur: 'membre', libelle: 'Membre' }]}
      />,
    );
    const select = screen.getByRole('combobox', { name: 'Rôle de Mamadou Diallo' });
    const libelle = document.querySelector(`label[for="${select.id}"]`) as HTMLElement;
    expect(libelle.style.position).toBe('absolute');
    expect(libelle.style.width).toBe('1px');
  });

  it('pose une invite vide et non choisissable avant le premier choix', () => {
    const { container } = render(
      <Selecteur
        libelle="Produit"
        invite="Choisissez un produit"
        valeur=""
        onChange={rien}
        nom="produit"
        options={[{ valeur: 'portail', libelle: 'AI5D Portail' }]}
      />,
    );
    const invite = container.querySelector('option') as HTMLOptionElement;
    expect(invite.value).toBe('');
    expect(invite.disabled).toBe(true);
    expect(invite).toHaveTextContent('Choisissez un produit');
  });

  it('marque l obligation et la desactivation', () => {
    render(
      <Selecteur
        libelle="Rôle"
        valeur="membre"
        onChange={rien}
        nom="role"
        obligatoire
        desactive
        options={[{ valeur: 'membre', libelle: 'Membre' }]}
      />,
    );
    const select = screen.getByLabelText('Rôle');
    expect(select).toHaveAttribute('aria-required', 'true');
    expect(select).toBeDisabled();
    expect(select.style.opacity).toBe('0.6');
  });

  it('partage la classe et la feuille de Champ : une seule feuille pour les deux', () => {
    render(
      <>
        <Champ libelle="Adresse" />
        <Selecteur
          libelle="Rôle"
          valeur="membre"
          onChange={rien}
          nom="role"
          options={[{ valeur: 'membre', libelle: 'Membre' }]}
        />
      </>,
    );
    expect(screen.getByLabelText('Rôle')).toHaveClass('ai5d-champ__entree');
    expect(screen.getByLabelText('Adresse')).toHaveClass('ai5d-champ__entree');
    expect(document.querySelectorAll('style[data-href~="ai5d-champ"]')).toHaveLength(1);
    expect(texteFeuille('ai5d-champ')).toContain('.ai5d-champ__entree:focus-visible');
    expect(screen.getByLabelText('Rôle').style.height).toBe('var(--hauteur-controle)');
    expect(screen.getByLabelText('Rôle').style.minHeight).toBe('var(--cible-tactile)');
  });

  it('se declare module client', () => {
    expect(readFileSync('noyau/composants/Selecteur.tsx', 'utf8').startsWith("'use client';")).toBe(
      true,
    );
  });
});
