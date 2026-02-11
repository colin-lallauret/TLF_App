-- ==========================================================
-- 1. RESET COMPLET
-- ==========================================================
TRUNCATE public.messages, public.conversations, public.souvenirs, 
         public.reviews, public.restaurants, public.favorite_restaurants, 
         public.favorite_contributors RESTART IDENTITY CASCADE;

DELETE FROM public.profiles WHERE id != '3a03cc54-3122-424b-8e68-45678385efd7';
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ==========================================================
-- 2. GÉNÉRATION DES DONNÉES
-- ==========================================================
DO $$ 
DECLARE 
    v_id UUID := '3a03cc54-3122-424b-8e68-45678385efd7'; 
    r_ids UUID[];
    c_ids UUID[] := ARRAY[]::UUID[];
    temp_c_id UUID;
    temp_r_id UUID;
    
    i INT;
    num_to_review INT;
    
    titles TEXT[] := ARRAY['Incroyable !', 'Une pépite', 'Authentique', 'Génial', 'Ma cantine', 'Top'];
    comments TEXT[] := ARRAY['Une explosion de saveurs.', 'Accueil parfait.', 'Le meilleur de la ville.', 'Une adresse cachée.', 'Rapport qualité-prix imbattable.'];
BEGIN

-- A. PROFIL VOYAGEUR
UPDATE public.profiles SET username = 'margot_fdz', full_name = 'Margot FERNANDEZ', city = 'Toulon' WHERE id = v_id;

-- B. CRÉATION DES 10 RESTAURANTS (Fixes)
WITH ins AS (
    INSERT INTO public.restaurants (name, address, city, lat, lng, budget_level, food_types, atmospheres) VALUES
    ('Hôi An', '3 Rue Louis Jourdan', 'Toulon', 43.1207, 5.9298, 2, '{Vietnamien}', '{Authentique}'),
    ('Le Pointu', 'Quai Cronstadt', 'Toulon', 43.1201, 5.9325, 3, '{Méditerranéen}', '{Vue Mer}'),
    ('Pizza Da Franco', 'Avenue de la Victoire', 'Toulon', 43.1245, 5.9350, 1, '{Italien}', '{Familial}'),
    ('Gaetano', 'Plage du Mourillon', 'Toulon', 43.1095, 5.9520, 2, '{Pizza}', '{Bord de mer}'),
    ('Dakota Burger', 'Rue d Alger', 'Toulon', 43.1215, 5.9310, 1, '{Burger}', '{Jeune}'),
    ('La Tortue', 'Anse de Magaud', 'Toulon', 43.1065, 5.9780, 4, '{Gastronomique}', '{Exceptionnel}'),
    ('L Aperitivo', 'Place de la Liberté', 'Toulon', 43.1248, 5.9285, 2, '{Tapas}', '{Convivial}'),
    ('Ollioules Terroir', 'Place Jean Jaurès', 'Ollioules', 43.1397, 5.8475, 3, '{Français}', '{Calme}'),
    ('Sushi d Or', 'Boulevard de Strasbourg', 'Toulon', 43.1232, 5.9321, 2, '{Japonais}', '{Moderne}'),
    ('Le Cargo', 'Port de Plaisance', 'Toulon', 43.1190, 5.9330, 2, '{Burger}', '{Animé}')
    RETURNING id
)
SELECT array_agg(id) INTO r_ids FROM ins;

-- C. CRÉATION DE 30 LOCAUX ET GÉNÉRATION DES AVIS
FOR i IN 1..30 LOOP
    temp_c_id := uuid_generate_v4();
    c_ids := array_append(c_ids, temp_c_id);
    
    INSERT INTO public.profiles (id, username, full_name, bio, city, is_contributor)
    VALUES (temp_c_id, 'local_' || i, 'Local ' || i, 'Guide à Toulon', 'Toulon', true);

    -- DÉFINITION ALÉATOIRE : Ce local va recommander entre 3 et 9 adresses
    num_to_review := floor(random() * (9 - 3 + 1)) + 3; 

    -- Insertion des avis (1 Avis inséré = 1 Recommandation créée)
    INSERT INTO public.reviews (restaurant_id, contributor_id, title, description, rating, created_at)
    SELECT r_id, temp_c_id, 
           titles[floor(random()*array_length(titles, 1))+1],
           comments[floor(random()*array_length(comments, 1))+1],
           floor(random()*3)+3,
           NOW() - (random() * interval '90 days')
    FROM unnest(r_ids) AS r_id
    ORDER BY random()
    LIMIT num_to_review;
END LOOP;

END $$;