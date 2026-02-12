-- ==========================================================
-- 1. RESET ET NETTOYAGE
-- ==========================================================
TRUNCATE public.messages, public.conversations, public.souvenirs, 
         public.reviews, public.restaurants, public.favorite_restaurants, 
         public.favorite_contributors RESTART IDENTITY CASCADE;

DELETE FROM public.profiles WHERE id != '3a03cc54-3122-424b-8e68-45678385efd7';

-- ==========================================================
-- 2. GÉNÉRATION DES DONNÉES
-- ==========================================================
DO $$ 
DECLARE 
    target_user_id UUID := '3a03cc54-3122-424b-8e68-45678385efd7'; 
    fn TEXT[] := ARRAY['Jean', 'Pierre', 'Marc', 'Lucas', 'Antoine', 'Marie', 'Camille', 'Léa', 'Chloé', 'Sarah'];
    ln TEXT[] := ARRAY['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau'];
    
    -- Liste officielle pour le tirage unique
    foods_list TEXT[] := ARRAY['Italien', 'Chinois', 'Japonais', 'Mexicain', 'Thaï', 'Indien', 'Libanais', 'Américain'];
BEGIN

-- A. RÉINSTALLATION DU PROFIL MARGOT
INSERT INTO public.profiles (id, username, full_name, bio, city, avatar_url, is_contributor)
VALUES (target_user_id, 'margot_fdz', 'Margot FERNANDEZ', 'Passionnée de photo.', 'Toulon', 'https://i.pravatar.cc/300?u=margot', false)
ON CONFLICT (id) DO UPDATE SET is_contributor = false;

-- B. CRÉATION DES 60 RESTAURANTS (Un seul food_type par resto)
INSERT INTO public.restaurants (name, address, city, lat, lng, budget_level, meal_types, food_types, dietary_prefs, services, atmospheres)
SELECT 
    'Restaurant ' || i, 
    i || ' Rue de Toulon', 
    'Toulon',
    43.12 + (random() * 0.04), 
    5.92 + (random() * 0.04), 
    floor(random()*4)+1,
    ARRAY['Déjeuner', 'Dîner']::text[], 
    -- Sélection d'UN SEUL élément aléatoire de la liste
    ARRAY[foods_list[floor(random() * array_length(foods_list, 1)) + 1]]::text[], 
    ARRAY['Végétarien']::text[], 
    ARRAY['Sur place']::text[], 
    ARRAY['Conviviale']::text[]
FROM generate_series(1, 60) s(i);

-- C. CRÉATION DES 150 LOCAUX
INSERT INTO public.profiles (id, username, full_name, bio, city, is_contributor, avatar_url)
SELECT 
    uuid_generate_v4(), 
    'local_' || i || '_' || floor(random()*999), 
    fn[floor(random()*10)+1] || ' ' || ln[floor(random()*10)+1], 
    'Expert local passionné.', 'Toulon', true, 'https://i.pravatar.cc/300?u=' || i
FROM generate_series(1, 150) s(i);

-- D. GÉNÉRATION DES AVIS (LOGIQUE ENSEMBLISTE RAPIDE)
INSERT INTO public.reviews (restaurant_id, contributor_id, title, description, rating, created_at)
SELECT 
    r_id, c_id, 
    CASE WHEN random() > 0.5 THEN 'Incroyable !' ELSE 'Top' END,
    'Une adresse validée par la communauté locale.',
    floor(random()*3)+3,
    NOW() - (random() * interval '90 days')
FROM (
    SELECT 
        r.id as r_id, 
        p.id as c_id,
        ROW_NUMBER() OVER(PARTITION BY r.id ORDER BY random()) as per_resto,
        ROW_NUMBER() OVER(PARTITION BY p.id ORDER BY random()) as per_local
    FROM public.restaurants r
    CROSS JOIN public.profiles p
    WHERE p.is_contributor = true
) as combinations
WHERE per_resto <= 40  -- Max 40 avis par resto
  AND per_local <= 20  -- Max 20 avis par local
  AND (per_resto <= 3 OR per_local <= 3 OR random() < 0.2);

END $$;