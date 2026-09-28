/** L'hydratation du banc, ou le rendu client seul pour `feuilles-client`. */
import { createRoot, hydrateRoot } from 'react-dom/client';
import { Contenu, Page, type Section } from './pages';

const section = document.documentElement.dataset.section as Section;

if (section === 'feuilles-client') {
  const racine = document.getElementById('racine');
  if (racine !== null) createRoot(racine).render(<Contenu section={section} />);
} else {
  hydrateRoot(document, <Page section={section} />, {
    onRecoverableError: (erreur) => console.error(`HYDRATATION ${String(erreur)}`),
  });
}
