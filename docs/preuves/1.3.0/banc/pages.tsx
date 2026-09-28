/**
 * Le banc d'essai de la 1.3.0 : les composants du système rendus par React, au serveur puis au
 * navigateur, comme un produit les rend.
 *
 * Les spécimens sont une page statique qui reproduit le balisage sans React : ils ne peuvent montrer
 * ni une feuille hissée, ni un style en ligne posé par un composant, ni un menu qui s'ouvre au
 * clavier (plan, écart E3). Construit par `docs/preuves/1.3.0/banc.mjs`, mesuré par
 * `sonde-banc.cjs`. Hors de `tsconfig.json`, d'ESLint et de Prettier, comme tout `docs/` : ce n'est
 * pas du code du produit, et il n'importe que ce que le produit importerait.
 */
import type { ReactNode } from 'react';
import { BookOpen, Home, Shield, User } from 'lucide-react';
import {
  Bouton,
  Champ,
  CoquilleRail,
  GabaritApp,
  LiensRail,
} from '../../../../noyau/composants';

export type Section = 'feuilles' | 'feuilles-client' | 'reserve-coquille' | 'reserve-app' | 'rail';

export const SECTIONS: readonly Section[] = [
  'feuilles',
  'feuilles-client',
  'reserve-coquille',
  'reserve-app',
  'rail',
];

/** Cinq cents boutons et un champ : la table de la console, réduite à ce qui compte. */
function CinqCents() {
  return (
    <div data-banc="cinq-cents">
      {Array.from({ length: 500 }, (_, i) => (
        <Bouton key={i} variante="discret" taille="sm">
          {`Ligne ${i + 1}`}
        </Bouton>
      ))}
      <Champ libelle="Rechercher une personne" />
    </div>
  );
}

/** La coquille en mode complet, avec sa barre basse : la réserve se mesure à 390 et à 1 280 px. */
function ReserveCoquille() {
  return (
    <CoquilleRail
      produit="Portail"
      navigationRail={<nav aria-label="Rubriques">rail</nav>}
      navigationBarre={<nav aria-label="Barre">barre</nav>}
      rechargerAuRetour={false}
    >
      <p>Un contenu court.</p>
    </CoquilleRail>
  );
}

function ReserveApp() {
  return (
    <GabaritApp
      produit="Compte"
      onglets={[
        { id: 'accueil', libelle: 'Accueil', icone: Home },
        { id: 'profil', libelle: 'Profil', icone: User },
        { id: 'securite', libelle: 'Sécurité', icone: Shield },
      ]}
      actif="accueil"
    >
      <p>Un contenu court.</p>
    </GabaritApp>
  );
}

/** Le rail sur sa surface, la rubrique active et deux autres : le survol se capture ici. */
function Rail() {
  return (
    <div
      data-banc="rail"
      style={{
        width: '17.5rem',
        padding: 'var(--espace-4) var(--espace-3)',
        background: 'var(--surface-2)',
        borderRight: '1px solid var(--bordure)',
      }}
    >
      <LiensRail
        etiquette="Rubriques"
        actif="formations"
        rubriques={[
          { id: 'accueil', libelle: 'Accueil', icone: Home, href: '#accueil' },
          { id: 'formations', libelle: 'Formations', icone: BookOpen, href: '#formations' },
          { id: 'securite', libelle: 'Sécurité', icone: Shield, href: '#securite' },
        ]}
      />
    </div>
  );
}

export function Contenu({ section }: { section: Section }): ReactNode {
  if (section === 'feuilles' || section === 'feuilles-client') return <CinqCents />;
  if (section === 'reserve-coquille') return <ReserveCoquille />;
  if (section === 'reserve-app') return <ReserveApp />;
  return <Rail />;
}

/** Le document entier, comme Next le rend : les feuilles hissées vont dans ce `<head>`. */
export function Page({ section }: { section: Section }) {
  return (
    <html lang="fr" data-densite="equilibre" data-section={section}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`Banc 1.3.0 · ${section}`}</title>
        <link rel="stylesheet" href="../../../../../noyau/ai5d.preset.css" />
      </head>
      <body
        style={{
          margin: 0,
          background: 'var(--surface-1)',
          color: 'var(--texte)',
          fontFamily: 'var(--police-corps)',
        }}
      >
        <div id="racine">{section === 'feuilles-client' ? null : <Contenu section={section} />}</div>
        <script src="client.js" />
      </body>
    </html>
  );
}
