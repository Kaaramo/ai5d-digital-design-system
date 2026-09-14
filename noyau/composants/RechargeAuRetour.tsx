'use client';

import { useEffect } from 'react';

/**
 * Redemande la page au serveur quand le navigateur l'a ressortie de son cache.
 *
 * Toute coquille qui affiche une identité en a besoin, et `CoquilleRail` le monte par défaut.
 * Il vient de Compte, où le défaut a été mesuré ; il est remonté dans le système au sprint 17
 * avec la coquille qui le porte.
 *
 * ── LE DÉFAUT, ET IL A ÉTÉ MESURÉ ───────────────────────────────────────────
 * On se connecte, on visite deux rubriques, on se déconnecte, on presse « précédent ». La
 * rubrique revient intacte, rail compris, nom lisible. Le serveur, lui, faisait son travail : une
 * navigation fraîche au même moment redirigeait vers la connexion. La session était fermée,
 * c'est la PAGE qui ne l'était pas.
 *
 * Sur le poste partagé d'une salle de formation ou d'un cybercafé, c'est la différence entre
 * « quelqu'un est passé par là » et « voici son identité ».
 *
 * ── TROIS PARADES, ET IL A FALLU LES TROIS ──────────────────────────────────
 * `location.replace` à la déconnexion ne retire qu'une entrée d'historique. `Cache-Control:
 * private, no-store` écarte Firefox et Safari, pas Chromium, qui recrée le document depuis son
 * cache HTTP sans un octet de réseau. Ce composant est la troisième parade, et c'est lui qui ferme
 * le trou dans Chromium. Les deux premières restent à la charge du produit.
 *
 * ── POURQUOI `back_forward` ET NON SEULEMENT `persisted` ────────────────────
 * `pageshow` avec `event.persisted` est le signal du cache aller-retour, et il ne se déclenche
 * jamais dans le cas mesuré : le document est recréé, avec une nouvelle entrée de navigation. Le
 * type de navigation `back_forward` décrit exactement ce cas. Les deux signaux sont écoutés,
 * parce que les moteurs ne choisissent pas le même mécanisme.
 *
 * ── POURQUOI UN RECHARGEMENT AVEUGLE ────────────────────────────────────────
 * Un cookie de session `HttpOnly` ne se lit pas depuis un script : rien ici ne peut savoir si la
 * session tient encore. Le rechargement pose la question au serveur, qui, lui, le sait.
 *
 * ── POURQUOI IL NE BOUCLE PAS ───────────────────────────────────────────────
 * Après `location.reload()`, le type de navigation devient `reload` : la condition est fausse au
 * second passage. Le coût est un aller-retour à chaque retour arrière, pour quelqu'un toujours
 * connecté, et c'est le bon côté du marché pour un écran qui affiche une identité.
 */
export function RechargeAuRetour() {
  useEffect(() => {
    const redemander = () => window.location.reload();

    const navigation = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;

    if (navigation?.type === 'back_forward') {
      redemander();
      return;
    }

    const auRetour = (evenement: PageTransitionEvent) => {
      if (evenement.persisted) redemander();
    };

    window.addEventListener('pageshow', auRetour);
    return () => window.removeEventListener('pageshow', auRetour);
  }, []);

  return null;
}
