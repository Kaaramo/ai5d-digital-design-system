/**
 * La feuille hissée d'un composant, lue où React la pose : dans `document.head` (décision 010).
 */
export function texteFeuille(id: string): string {
  const balises = document.head.querySelectorAll<HTMLStyleElement>(`style[data-href~="${id}"]`);
  if (balises.length !== 1) {
    throw new Error(
      `La feuille ${id} est posée ${balises.length} fois dans document.head ; attendu : une fois.`,
    );
  }
  return balises[0]?.textContent ?? '';
}
