-- ==========================================================
-- 1. NETTOYAGE DES DONNÉES EXISTANTES
-- ==========================================================
TRUNCATE public.messages, public.conversations, public.souvenirs, 
         public.reviews, public.restaurants, public.favorite_restaurants, 
         public.favorite_contributors RESTART IDENTITY CASCADE;

-- Conservation du compte voyageur principal
DELETE FROM public.profiles WHERE id != '3a03cc54-3122-424b-8e68-45678385efd7';

-- Désactivation temporaire de la contrainte pour l'import massif
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ==========================================================
-- 2. GÉNÉRATION DES DONNÉES COHÉRENTES
-- ==========================================================
DO $$ 
DECLARE 
    v_id UUID := '3a03cc54-3122-424b-8e68-45678385efd7'; 
    r_ids UUID[] := ARRAY[]::UUID[];
    c_ids UUID[] := ARRAY[]::UUID[];
    temp_id UUID;
    
    i INT;
    current_resto_id UUID;
    current_local_id UUID;
    num_reviews_to_create INT;
    
    -- Listes de données pour le réalisme
    first_names TEXT[] := ARRAY['Jean', 'Pierre', 'Marc', 'Lucas', 'Antoine', 'Louis', 'Nicolas', 'Marie', 'Camille', 'Léa', 'Chloé', 'Emma', 'Sarah', 'Julie', 'Thomas', 'Julien', 'Benoît', 'Adrien', 'Mathilde', 'Céline'];
    last_names TEXT[] := ARRAY['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'];
    
    -- Filtres officiels
    meals_list TEXT[] := ARRAY['Petit-déjeuner', 'Déjeuner', 'Pause sucrée', 'Dîner'];
    foods_list TEXT[] := ARRAY['Italien', 'Chinois', 'Japonais', 'Mexicain', 'Thaï', 'Indien', 'Libanais', 'Américain'];
    dietary_list TEXT[] := ARRAY['Végan', 'Végétarien', 'Sans gluten', 'Halal', 'Casher'];
    services_list TEXT[] := ARRAY['Sur place', 'À emporter', 'Livraison', 'Click & Collect'];
    atmospheres_list TEXT[] := ARRAY['Romantique', 'Familial', 'Conviviale', 'Animé', 'Calme'];

    titles TEXT[] := ARRAY['Incroyable !', 'Une pépite', 'Authentique', 'Génial', 'Ma cantine', 'Top', 'Excellent'];
    comments TEXT[] := ARRAY['Une explosion de saveurs.', 'Accueil parfait.', 'Le meilleur de la ville.', 'Une adresse cachée.', 'Rapport qualité-prix imbattable.'];

BEGIN

-- A. RÉGLAGE DU PROFIL VOYAGEUR (MARGOT)
INSERT INTO public.profiles (id, username, full_name, bio, city, avatar_url, is_contributor)
VALUES (v_id, 'margot_fdz', 'Margot FERNANDEZ', 'Passionnée de photo et de street-food.', 'Toulon', 'https://i.pravatar.cc/300?u=margot', false)
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, full_name = EXCLUDED.full_name;

-- B. CRÉATION DES 60 RESTAURANTS
FOR i IN 1..60 LOOP
    INSERT INTO public.restaurants (name, address, city, lat, lng, budget_level, meal_types, food_types, dietary_prefs, services, atmospheres) 
    VALUES (
        'La Table de ' || first_names[mod(i, 20) + 1] || ' ' || i,
        i || ' Rue de la Gastronomie',
        CASE WHEN random() > 0.3 THEN 'Toulon' ELSE 'Hyères' END,
        43.12 + (random() * 0.05),
        5.92 + (random() * 0.05),
        floor(random()*4)+1,
        ARRAY[meals_list[floor(random()*4)+1]]::text[],
        ARRAY[foods_list[floor(random()*8)+1]]::text[],
        ARRAY[dietary_list[floor(random()*5)+1]]::text[],
        ARRAY[services_list[floor(random()*4)+1]]::text[],
        ARRAY[atmospheres_list[floor(random()*5)+1]]::text[]
    ) RETURNING id INTO temp_id;
    r_ids := array_append(r_ids, temp_id);
END LOOP;

-- C. CRÉATION DES 300 LOCAUX
FOR i IN 1..300 LOOP
    temp_id := uuid_generate_v4();
    INSERT INTO public.profiles (id, username, full_name, bio, city, is_contributor, avatar_url)
    VALUES (temp_id, 'local_guide_' || i, first_names[floor(random()*20)+1] || ' ' || last_names[floor(random()*20)+1], 
            'Guide local passionné.', 'Toulon', true, 'https://i.pravatar.cc/300?u=' || temp_id);
    c_ids := array_append(c_ids, temp_id);
END LOOP;

-- D. GÉNÉRATION DES AVIS COHÉRENTS (RECOMMANDATIONS)
-- Stratégie : On sature les restaurants pour respecter les min/max tout en vérifiant les quotas des locaux
FOR i IN 1..array_length(r_ids, 1) LOOP
    current_resto_id := r_ids[i];
    -- Chaque restaurant reçoit entre 3 et 80 avis
    num_reviews_to_create := floor(random() * (80 - 3 + 1)) + 3;

    INSERT INTO public.reviews (restaurant_id, contributor_id, title, description, rating, created_at)
    SELECT current_resto_id, contributor_id, 
           titles[floor(random()*array_length(titles, 1))+1],
           comments[floor(random()*array_length(comments, 1))+1],
           floor(random()*3)+3,
           NOW() - (random() * interval '120 days')
    FROM (
        -- On sélectionne des locaux qui n'ont pas encore atteint le plafond de 35 avis
        SELECT id AS contributor_id 
        FROM public.profiles p
        WHERE is_contributor = true 
        AND (SELECT count(*) FROM public.reviews r WHERE r.contributor_id = p.id) < 35
        ORDER BY random() 
        LIMIT num_reviews_to_create
    ) AS sub;
END LOOP;

-- E. AJUSTEMENT DES LOCAUX (MINIMUM 3 AVIS)
-- Pour les locaux qui auraient moins de 3 avis après la boucle précédente
FOR current_local_id IN SELECT id FROM public.profiles WHERE is_contributor = true AND (SELECT count(*) FROM public.reviews WHERE contributor_id = id) < 3 LOOP
    INSERT INTO public.reviews (restaurant_id, contributor_id, title, description, rating, created_at)
    SELECT r_id, current_local_id, 'Top !', 'Une adresse validée.', 5, NOW()
    FROM (
        SELECT unnest(r_ids) AS r_id 
        EXCEPT 
        SELECT restaurant_id FROM public.reviews WHERE contributor_id = current_local_id
    ) AS avail_restos
    ORDER BY random()
    LIMIT (3 - (SELECT count(*) FROM public.reviews WHERE contributor_id = current_local_id));
END LOOP;

END $$;