import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { Inbox, Shield, Trash2 } from 'lucide-react';
import { Chiffre } from '../../noyau/composants/Chiffre';
import { EnteteCarte } from '../../noyau/composants/EnteteCarte';
import { EnteteRubrique, TAILLE_CADRE_RUBRIQUE } from '../../noyau/composants/EnteteRubrique';
import { EtatVide } from '../../noyau/composants/EtatVide';
import { PastilleEtat } from '../../noyau/composants/PastilleEtat';
import { formaterTempsRelatif, TempsRelatif } from '../../noyau/composants/TempsRelatif';

/**
 * Les six briques de page montées de Compte au sprint 17.
 *
 * Les tests d'`EnteteCarte`, de `PastilleEtat` et d'`EtatVide` sont ceux de Compte, montés avec
 * leur brique. Ceux d'`EnteteRubrique`, de `TempsRelatif` et de `Chiffre` sont écrits ici :
 * Compte ne les testait que par leur EMPLOI dans un écran, et ces tests-là restent dans Compte.
 */

function code(chemin: string): string {
  return readFileSync(chemin, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

describe('EnteteRubrique', () => {
  it('rend le titre de la rubrique en h1, et son intention', () => {
    render(
      <EnteteRubrique icone={Shield} titre="Sécurité" intention="Ce qui protège votre compte." />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Sécurité' })).toBeInTheDocument();
    expect(screen.getByText('Ce qui protège votre compte.')).toBeInTheDocument();
  });

  it('aligne l intention sur le titre, a partir de la meme taille que le cadre', () => {
    render(<EnteteRubrique icone={Shield} titre="Sécurité" intention="Une phrase." />);
    const intention = screen.getByText('Une phrase.');
    expect(intention.style.marginLeft).toBe(`calc(${TAILLE_CADRE_RUBRIQUE}px + var(--espace-4))`);
  });

  it('ne recopie plus la taille du cadre en dur', () => {
    expect(code('noyau/composants/EnteteRubrique.tsx')).not.toContain('40px');
  });
});

describe('EnteteCarte', () => {
  it('rend le titre en h2, sous le h1 de la rubrique', () => {
    render(<EnteteCarte icone={Shield} titre="Mot de passe" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Mot de passe' })).toBeInTheDocument();
  });

  it('affiche la description quand elle est fournie, et rien sinon', () => {
    const { rerender } = render(
      <EnteteCarte icone={Shield} titre="Mot de passe" description="Jamais modifié." />,
    );
    expect(screen.getByText('Jamais modifié.')).toBeInTheDocument();

    rerender(<EnteteCarte icone={Shield} titre="Mot de passe" />);
    expect(screen.queryByText('Jamais modifié.')).not.toBeInTheDocument();
  });

  it('rend l emplacement de droite dans le flux du titre', () => {
    render(
      <EnteteCarte
        icone={Shield}
        titre="Double authentification"
        droite={<PastilleEtat ton="attention">Inactive</PastilleEtat>}
      />,
    );

    const titre = screen.getByRole('heading', { level: 2 });
    const pastille = screen.getByText('Inactive');

    // Mesure faite au navigateur a 390 px : en colonne separee, la pastille prenait sa largeur
    // sur la description, qui se repliait sur quatre lignes de 135 px.
    expect(titre.parentElement).toContainElement(pastille);
    expect(titre.parentElement).toHaveStyle({ flexWrap: 'wrap' });
  });

  it('le ton danger teinte le cadre en erreur, le ton neutre non', () => {
    const { container, rerender } = render(
      <EnteteCarte icone={Trash2} titre="Supprimer votre compte" ton="danger" />,
    );
    expect(container.querySelector('[aria-hidden="true"]')).toHaveStyle({
      background: 'var(--erreur-fond)',
    });

    rerender(<EnteteCarte icone={Shield} titre="Mot de passe" />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveStyle({
      background: 'var(--surface-1)',
    });
  });

  it('garde l icone decorative : le titre est deja a cote', () => {
    const { container } = render(<EnteteCarte icone={Shield} titre="Mot de passe" />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});

describe('PastilleEtat', () => {
  it('porte un MOT en plus de sa couleur', () => {
    // Pres d un homme sur douze ne distingue pas correctement le rouge du vert.
    render(<PastilleEtat ton="reussite">Active</PastilleEtat>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('le point est un renfort de forme, retire de l arbre d accessibilite', () => {
    const { container } = render(<PastilleEtat ton="attention">Inactive</PastilleEtat>);
    const point = container.querySelector('[aria-hidden="true"]');
    expect(point).toBeInTheDocument();
    // `currentColor` : le point ne peut pas diverger de la pastille qui le porte.
    expect(point).toHaveStyle({ background: 'currentColor' });
  });
});

describe('EtatVide', () => {
  it('rend le titre et la phrase, et RIEN de plus sans commande', () => {
    render(
      <EtatVide
        icone={Inbox}
        titre="Aucune session ouverte"
        phrase="Ce compte n’est connecté sur aucun appareil."
      />,
    );

    expect(screen.getByText('Aucune session ouverte')).toBeInTheDocument();
    expect(screen.getByText('Ce compte n’est connecté sur aucun appareil.')).toBeInTheDocument();
    expect(document.querySelector('code')).toBeNull();
  });

  it('rend la commande SEULE dans son bloc', () => {
    /*
      Collee dans un terminal, elle doit partir sans les mots qui l entouraient. Noyee dans une
      phrase, elle se selectionne avec eux et il faut la nettoyer a la main.
    */
    render(
      <EtatVide
        icone={Inbox}
        titre="Aucun point de réception"
        phrase="Les points de réception se déclarent en ligne de commande."
        commande="pnpm webhook:declarer"
      />,
    );

    expect(document.querySelector('code')?.textContent).toBe('pnpm webhook:declarer');
  });
});

describe('TempsRelatif', () => {
  const maintenant = new Date('2026-09-14T12:00:00Z');

  it('choisit la plus grande unite sous le seuil', () => {
    expect(formaterTempsRelatif(new Date('2026-09-14T10:00:00Z'), maintenant)).toBe(
      'il y a 2 heures',
    );
    expect(formaterTempsRelatif(new Date('2026-09-14T11:58:00Z'), maintenant)).toBe(
      'il y a 2 minutes',
    );
  });

  it('ecrit la date absolue au premier rendu, puis le temps relatif apres montage', async () => {
    const quand = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const { container } = render(<TempsRelatif quand={quand} />);
    const temps = container.querySelector('time');

    expect(temps).toHaveAttribute('dateTime', quand.toISOString());
    await waitFor(() => expect(temps).toHaveTextContent('il y a 2 heures'));
  });

  it('prend le lettrage du systeme, et non plus 0.08em', () => {
    // L une des trois differences voulues de la migration, SPEC 5.13.
    const { container } = render(<TempsRelatif quand={new Date()} />);
    expect(container.querySelector('time')).toHaveStyle({
      letterSpacing: 'var(--lettrage-overline)',
    });
    expect(code('noyau/composants/TempsRelatif.tsx')).not.toContain('0.08em');
  });
});

describe('Chiffre', () => {
  it('rend la valeur, le libelle, et la cible seulement si elle existe', () => {
    const { rerender } = render(<Chiffre valeur="42" libelle="Comptes créés" cible="Cible : 50" />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Comptes créés')).toBeInTheDocument();
    expect(screen.getByText('Cible : 50')).toBeInTheDocument();

    rerender(<Chiffre valeur="42" libelle="Comptes créés" />);
    expect(screen.queryByText('Cible : 50')).not.toBeInTheDocument();
  });

  it('met en avant le seul chiffre qui porte l ecran', () => {
    render(<Chiffre valeur="7" libelle="Incidents" mise />);
    expect(screen.getByText('7')).toHaveStyle({ color: 'var(--action)' });
  });

  it('ne cite plus le document d un produit particulier', () => {
    expect(readFileSync('noyau/composants/Chiffre.tsx', 'utf8')).not.toMatch(/PRD\s*\d+/);
  });
});
