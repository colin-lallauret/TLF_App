# Design System TLF

## Couleurs

| Nom            | Hex Code  | Usage                                      |
| -------------- | --------- | ------------------------------------------ |
| **Noir**       | `#141414` | Texte principal, Titres, Arrière-plans sombres |
| **Orange**     | `#DC4928` | Couleur primaire, Actions, Boutons, Accents |
| **Blanc Crème**| `#FFFCEB` | Arrière-plan principal, Cartes claires     |
| **Vert**       | `#00661D` | Couleur secondaire, Validation, Nature     |

## Typographie

*   **Famille** : `Fustat` (Google Fonts)
*   **Usage** : Utilisée pour tous les textes de l'application (Titres et Corps).

## Icônes

Les icônes personnalisées sont situées dans `/assets/icons`.
Elles doivent être utilisées en priorité sur les icônes `Ionicons` pour l'identité de marque (ex: TabBar, Actions spécifiques).

### Liste des icônes clés :
*   `logo_tlf.svg` / `logo_tlf_text.svg` : Identité
*   `explorer.svg` : Tab Explorer
*   `decouvrir.svg` : Tab Découvrir
*   `favoris.svg` : Tab Favoris
*   `profil.svg` : Tab Profil
*   `message.svg` / `send_message.svg` : Messagerie
*   `fire.svg` : Tendance / Populaire
*   `star_*.svg` : Système de notation

## Règles d'intégration

1.  Toujours utiliser les constantes de `constants/theme.ts`.
2.  Pour la typographie, utiliser la famille `Fustat`.
