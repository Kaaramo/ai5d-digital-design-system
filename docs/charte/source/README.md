# Source de la charte de référence

Deux livrables, deux moteurs, un seul fond.

| Fichier | Moteur | Rôle |
| ------- | ------ | ---- |
| `../AI5D_Digital_Design_System_Charte.pdf` | HTML + CSS d'impression, rendu par Chrome | **La référence visuelle.** 24 pages A4, fonds perdus, planches de composants, nuanciers |
| `../AI5D_Digital_Design_System_Charte.docx` | `python-docx` | La version **éditable**, pour relire et annoter |

En cas d'écart de mise en page entre les deux, c'est le PDF qui fait foi. En cas d'écart de
valeur, c'est [`noyau/jetons.css`](../../../noyau/jetons.css).

---

## Régénérer

Depuis ce dossier.

```bash
# Le PDF
python "$HOME/.claude/skills/document-premium/scripts/imprimer.py" \
  charte.html ../AI5D_Digital_Design_System_Charte.pdf

# Le DOCX
python generer-docx.py
```

Puis, systématiquement, le contrôle :

```bash
python "$HOME/.claude/skills/document-premium/scripts/controler.py" \
  ../AI5D_Digital_Design_System_Charte.pdf --images /tmp/controle
```

---

## Les fichiers

| Fichier | Contenu |
| ------- | ------- |
| `charte.html` | Le document. Une `<section class="page">` par page imprimée |
| `fonts.css` | Fraunces, Inter et JetBrains Mono en base64, **repris des `.woff2` du dépôt** |
| `generer-docx.py` | Le générateur de la version Word |

`fonts.css` est régénérable :

```bash
python - <<'PY'
import base64, pathlib
src = pathlib.Path("../../../noyau/polices")
faces = [("Fraunces", "fraunces-variable.woff2", "300 700"),
         ("Inter", "inter-variable.woff2", "300 700"),
         ("JetBrains Mono", "jetbrains-mono-500.woff2", "500")]
out = []
for fam, fic, poids in faces:
    b = base64.b64encode((src / fic).read_bytes()).decode()
    out.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{poids};"
               f"font-display:block;src:url(data:font/woff2;base64,{b}) format('woff2');}}")
pathlib.Path("fonts.css").write_text("\n".join(out), encoding="utf-8")
PY
```

Les polices viennent des fichiers que le système sert réellement, pas d'un téléchargement
séparé. C'est ce qui rend les spécimens typographiques vrais : une charte qui prescrit
Fraunces et se compose en Georgia se contredit dès sa page de typographie.

---

## Ce qui a été vérifié

- **Géométrie**, mot par mot sur les 24 pages : aucun texte ni aplat ne franchit le filet de
  pied de page, aucun ne sort des marges latérales. Le contrôle est dans l'historique de
  commandes ; il se rejoue avec `controler.py` plus la vérification par mots.
- **Cohérence des valeurs** : chaque hexadécimal cité dans le PDF existe dans
  `noyau/jetons.css` ou `noyau/marque.css`, à l'exception des valeurs explicitement
  présentées comme rejetées (`#6B7A85`, `#1E874B`, `#B7791F`, `#D02B2B`, `#757575`,
  `#66747E`, `#10312A`).
- **Le document respecte sa propre voix** : zéro tiret cadratin, zéro emoji, zéro point
  d'exclamation en prose, vouvoiement partout.
- **Rendu visuel** : les pages ont été rendues en image et regardées.

## Ce qui n'a pas été vérifié

- **Le rendu du DOCX.** Ni Word ni LibreOffice n'est installé sur le poste de génération.
  Sa structure est contrôlée (216 paragraphes, 30 tableaux, 18 sauts de page, relecture par
  `python-docx`) et son fond est complet, mais son apparence dans Word n'a pas été vue.
- **Les polices dans le DOCX.** Word ne sait pas lire un `.woff2`. Fraunces, Inter et
  JetBrains Mono y sont déclarées par leur nom : sur un poste qui ne les a pas installées,
  Word substitue. Le PDF, lui, embarque les fichiers et ne dépend de rien.

---

## Le rapport au reste du dépôt

Ce document **explique** ; il ne remplace pas les fichiers exécutables :

- [`noyau/jetons.css`](../../../noyau/jetons.css) et [`noyau/marque.css`](../../../noyau/marque.css) portent les valeurs,
- [`densites/profils.css`](../../../densites/profils.css) porte les quatre profils,
- [`noyau/NOYAU.md`](../../../noyau/NOYAU.md) et [`densites/DENSITES.md`](../../../densites/DENSITES.md) portent la documentation de travail.

Une modification de jeton se fait **d'abord** dans le CSS, avec son test, puis se répercute
ici par une nouvelle édition.
