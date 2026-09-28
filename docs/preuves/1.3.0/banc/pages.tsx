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
  MenuActions,
} from '../../../../noyau/composants';

export type Section =
  | 'feuilles'
  | 'feuilles-client'
  | 'reserve-coquille'
  | 'reserve-app'
  | 'rail'
  | 'menu'
  | 'survol';

export const SECTIONS: readonly Section[] = [
  'feuilles',
  'feuilles-client',
  'reserve-coquille',
  'reserve-app',
  'rail',
  'menu',
  'survol',
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

const RIEN = () => undefined;

/** Le menu d'une ligne de la console : deux gestes, un lien, un geste grave. */
function Menu({ nom }: { nom: string }) {
  return (
    <MenuActions
      libelle={`Actions pour ${nom}`}
      actions={[
        { id: 'retirer', libelle: 'Retirer de la session', grave: true, onChoisir: RIEN },
        { id: 'corriger', libelle: 'Corriger l’adresse', onChoisir: RIEN },
        { id: 'fiche', libelle: 'Voir la fiche', href: '#fiche' },
        { id: 'renvoyer', libelle: 'Renvoyer l’invitation', onChoisir: RIEN },
      ]}
    />
  );
}

const PERSONNES = ['Aïssatou Camara', 'Mamadou Diallo', 'Fatoumata Bah', 'Ibrahima Sow'];

/*
  La table factice du Portail : ses lignes survolent sur --surface-survol et se selectionnent sur
  --surface-selection, comme le fera TableauDonnees (P10). La feuille est celle du banc, sous sa
  propre precedence : jamais celle du systeme.
*/
const STYLE_TABLE = `
.banc-table { max-height: 12rem; overflow: auto; background: var(--surface-2); border: 1px solid var(--bordure); border-radius: var(--rayon-md); }
.banc-ligne { display: flex; align-items: center; gap: var(--espace-3); padding: var(--espace-2) var(--espace-4); border-bottom: 1px solid var(--bordure); color: var(--texte-fort); }
.banc-ligne:hover { background: var(--surface-survol); }
.banc-ligne[data-selectionnee] { background: var(--surface-selection); }
.banc-ligne > span:first-of-type { flex: 1 1 auto; }
`;

/** Une table qui défile, un menu par ligne ; un dernier menu au bas de la page, pour le retournement. */
function Tableau({ basDePage }: { basDePage: boolean }) {
  return (
    <div data-banc="menu" style={{ padding: 'var(--espace-8)', maxWidth: '48rem' }}>
      <style href="banc-table" precedence="banc">
        {STYLE_TABLE}
      </style>
      <div className="banc-table" data-banc="table">
        {PERSONNES.map((nom, index) => (
          <div
            key={nom}
            className="banc-ligne"
            data-ligne={nom}
            data-selectionnee={index >= 2 ? '' : undefined}
          >
            <input type="checkbox" defaultChecked={index >= 2} aria-label={`Sélectionner ${nom}`} />
            <span>{nom}</span>
            <Menu nom={nom} />
          </div>
        ))}
      </div>
      {basDePage ? (
        <>
          <p style={{ height: '40rem' }}>Un espace qui pousse le dernier menu au bord de la fenêtre.</p>
          <div data-banc="bas" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Menu nom="Ibrahima Sow" />
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Le survol côte à côte : la table, un menu ouvert par la sonde, et le rail. */
function Survol() {
  return (
    <div data-banc="survol" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--espace-8)' }}>
      <Rail />
      <Tableau basDePage={false} />
    </div>
  );
}

export function Contenu({ section }: { section: Section }): ReactNode {
  if (section === 'feuilles' || section === 'feuilles-client') return <CinqCents />;
  if (section === 'reserve-coquille') return <ReserveCoquille />;
  if (section === 'reserve-app') return <ReserveApp />;
  if (section === 'menu') return <Tableau basDePage />;
  if (section === 'survol') return <Survol />;
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
