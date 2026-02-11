# 📜 GUIDELINES.md - Projet TravelLocalFood 🥗✈️

## 1. Vision & Concept
**TravelLocalFood** est une application mobile communautaire mettant en relation des **Voyageurs** et des **Locaux (Contributeurs)**. 
- Les **Locaux** partagent leurs adresses favorites (restaurants).
- Les **Voyageurs** explorent ces adresses, gèrent leurs souvenirs et peuvent souscrire à un abonnement premium (**TLF+**).

## 2. Stack Technique Obligatoire
* **Framework :** Expo (React Native) avec `npx create-expo-app@latest`.
* **Navigation :** Expo Router (File-based navigation).
* **Backend :** Supabase (PostgreSQL, Auth, Storage, Realtime).
* **Stylage :** NativeWind (Tailwind CSS).
* **Icônes :** `lucide-react-native`.
* **Cartographie :** `react-native-maps`.

## 3. Architecture de la Base de Données (Supabase)
Le projet utilise un schéma relationnel strict dans le schéma `public` :

### Tables Clés :
- **`profiles`** : Extension de `auth.users`. Contient `bio`, `city`, `is_contributor`, `subscription_end_date`.
- **`restaurants`** : Données géolocalisées (`lat`, `lng`) et tags de filtrage (`food_types`, `dietary_prefs`, `services`, `atmospheres` en format `TEXT[]`).
- **`reviews`** : Avis publics postés par les contributeurs sur les restaurants.
- **`souvenirs`** : Carnets de voyage privés des voyageurs (photos, notes 0-5, date).
- **`conversations` & `messages`** : Système de chat privé avec support Realtime.
- **`favorite_restaurants` / `favorite_contributors`** : Tables de liaison pour le système de likes.

## 4. Design System (UI/UX)
* **Palette de Couleurs :**
    * Fond principal : Beige Crème `#FFFDF0`.
    * Accent Primaire (Filtres/Boutons) : Orange chaud `#E65127`.
    * Accent Secondaire (Messages/Action) : Vert Forêt `#006400`.
    * Texte & Contrastes : Noir `#000000`.
* **Composants Visuels :**
    * **Bordures :** `border-radius: 20px` minimum pour les boutons, cartes et champs de saisie.
    * **Typographie :** Titres en gras, hiérarchie claire.
    * **Navigation :** Bottom Tab Bar personnalisée avec les 5 onglets : Explorer, Favoris, Découvrir, Message, Profil.

## 5. Spécifications Fonctionnelles par Écran
- **Explorer (Home) :** Listes horizontales pour les locaux et les adresses. Carte interactive avec marqueurs personnalisés.
- **Découvrir (Filtres) :** Sliders pour le budget (0-60€) et la distance (0-100km). Boutons de catégories avec icônes.
- **Profil Voyageur :** Bouton "Ajouter un souvenir". Liste chronologique avec carrousel d'images. Badge `TLF+` dynamique.
- **Détail Restaurant :** Boutons d'itinéraire ouvrant Google Maps/Waze/Apple Maps via `Linking`.
- **Messagerie :** Liste des conversations avec indicateur de messages non lus (pastille verte).

## 6. Règles de Qualité du Code
* **TypeScript :** Typage obligatoire pour toutes les données provenant de Supabase.
* **Séparation :** Isoler la logique API dans des **Hooks personnalisés** (ex: `useAuth`, `useRestaurants`).
* **Sécurité (RLS) :** - Souvenirs : Visibles uniquement par leur créateur.
    - Messages : Accessibles uniquement aux participants.
    - Restaurants : Lecture publique.
* **Performance :** Utiliser `FlashList` pour les listes de messages et de souvenirs. Charger les images via `expo-image` pour la mise en cache.

## 7. Structure de Dossiers Recommandée
```text
/src
  /app          # Routes Expo Router
  /components   # Atomes, Molécules et Organismes UI
  /hooks        # Logique métier et appels Supabase
  /services     # Config supabase.ts et instances
  /types        # Interfaces TypeScript
  /utils        # Helpers (formatage de date, calculs distance)