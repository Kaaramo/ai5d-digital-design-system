import type { Bloc } from './document';

/**
 * Le rendu d un bloc de document, cinq formes et pas une de plus.
 *
 * ── POURQUOI LE TABLEAU DEFILE DANS SON PROPRE CADRE ────────────────────────
 * Un document juridique porte volontiers un tableau de onze lignes sur deux colonnes. Aucun ne
 * tient sur un telephone. Sans ce conteneur, c est la PAGE qui defile de cote : le
 * texte des autres sections sort de l ecran a chaque fois qu on relache le doigt, et la
 * lecture devient impossible sur l appareil ou elle a le plus de chances d avoir lieu.
 *
 * ── L ENCART EST UNE CITATION, LE TABLEAU N A PAS DE CADRE ─────────────────
 * Sur le modele de la politique du site vitrine. L encart portait un fond
 * et un filet bleu : il devient un retrait marque d un filet gauche, sans fond. Le tableau
 * perdait sa lisibilite dans un cadre borde : il garde ses filets entre les lignes, et ses
 * en-tetes passent en capitales discretes.
 *
 * ── LES CLES SONT DES INDEX, DELIBEREMENT ───────────────────────────────────
 * Deux cellules d une meme ligne peuvent porter le meme texte, et deux entrees de liste
 * aussi. Une cle tiree du contenu produirait alors un doublon, que React signale et qui
 * casse la reconciliation. Ces listes ne sont ni triees ni filtrees ni reordonnees : l index
 * est stable, c est le cas ou il est le bon choix.
 */
export function BlocDocument({ bloc }: { bloc: Bloc }) {
  switch (bloc.type) {
    case 'paragraphe':
      return (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--taille-md)',
            lineHeight: 1.7,
            color: 'var(--texte)',
          }}
        >
          {bloc.texte}
        </p>
      );

    case 'sous-titre':
      return (
        <p
          style={{
            margin: 'var(--espace-2) 0 0',
            fontSize: 'var(--taille-md)',
            fontWeight: 600,
            color: 'var(--texte-fort)',
          }}
        >
          {bloc.texte}
        </p>
      );

    case 'liste':
      return (
        <ul
          style={{
            margin: 0,
            paddingLeft: 'var(--espace-4)',
            fontSize: 'var(--taille-md)',
            lineHeight: 1.7,
            color: 'var(--texte)',
          }}
        >
          {bloc.entrees.map((entree, index) => (
            <li key={index} style={{ marginBottom: 'var(--espace-2)' }}>
              {entree}
            </li>
          ))}
        </ul>
      );

    case 'encart':
      return (
        <div
          style={{
            borderLeft: '2px solid var(--bordure-forte)',
            paddingLeft: 'var(--espace-4)',
            fontSize: 'var(--taille-md)',
            lineHeight: 1.7,
            color: 'var(--texte)',
          }}
        >
          {bloc.texte}
        </div>
      );

    case 'tableau':
      return (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {bloc.entetes.map((entete, index) => (
                  <th
                    key={index}
                    scope="col"
                    style={{
                      textAlign: 'left',
                      padding: 'var(--espace-3) var(--espace-4) var(--espace-3) 0',
                      fontSize: 'var(--taille-xs)',
                      fontWeight: 'var(--graisse-semi)',
                      letterSpacing: 'var(--lettrage-overline)',
                      textTransform: 'uppercase',
                      color: 'var(--texte-faible)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entete}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bloc.lignes.map((ligne, indexLigne) => (
                <tr key={indexLigne}>
                  {ligne.map((cellule, indexCellule) => (
                    <td
                      key={indexCellule}
                      style={{
                        padding: 'var(--espace-3) var(--espace-4) var(--espace-3) 0',
                        fontSize: 'var(--taille-sm)',
                        lineHeight: 1.6,
                        color: 'var(--texte)',
                        borderTop: '1px solid var(--bordure)',
                        verticalAlign: 'top',
                      }}
                    >
                      {cellule}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}
