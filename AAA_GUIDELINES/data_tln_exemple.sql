-- 1. DESACTIVATION TEMPORAIRE DE LA CONTRAINTE DE CLE ETRANGERE
-- Cela permet de créer les "Locaux" sans créer de comptes emails réels.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

DO $$ 
DECLARE 
    -- TON UUID VOYAGEUR
    v_id UUID := '3a03cc54-3122-424b-8e68-45678385efd7'; 
    
    -- GENÉRATION D'IDS POUR LES LOCAUX
    c1_id UUID := uuid_generate_v4(); -- Pierre
    c2_id UUID := uuid_generate_v4(); -- Alizée
    c3_id UUID := uuid_generate_v4(); -- Louise
    c4_id UUID := uuid_generate_v4(); -- Theodore
    
    -- VARIABLES POUR LES CONVERSATIONS
    conv1 UUID := uuid_generate_v4();
    conv2 UUID := uuid_generate_v4();
BEGIN

-- 2. MISE À JOUR DE TON PROFIL VOYAGEUR
UPDATE public.profiles 
SET username = 'voyageur_tlf', 
    full_name = 'Margot FERNANDEZ', 
    bio = 'Passionnée de cuisine locale et de photographie.', 
    city = 'Toulon',
    is_contributor = false,
    subscription_end_date = NOW() + INTERVAL '1 month'
WHERE id = v_id;

-- 3. INSERTION DES LOCAUX (CONTRIBUTEURS)
INSERT INTO public.profiles (id, username, full_name, bio, city, is_contributor) VALUES 
(c1_id, 'pierre_d', 'Pierre DESCHAMPS', 'Amateur de bons petits plats mijotés.', 'Toulon', true),
(c2_id, 'alizee_g', 'Alizée GAUTIER', 'Spécialiste de la cuisine fusion.', 'La Valette', true),
(c3_id, 'louise_t', 'Louise TURPIN', 'Amoureuse du terroir provençal.', 'Hyères', true),
(c4_id, 'theo_k', 'Theodore KUMAR', 'Toujours en quête du meilleur street-food.', 'La Garde', true)
ON CONFLICT (id) DO NOTHING;

-- 4. INSERTION DES RESTAURANTS
INSERT INTO public.restaurants (id, name, address, postal_code, city, lat, lng, budget_level, food_types, dietary_prefs, atmospheres) VALUES
(uuid_generate_v4(), 'Hôi An', '3 Rue Louis Jourdan', '83000', 'Toulon', 43.1207, 5.9298, 2, '{Vietnamien, Asia}', '{Végétarien}', '{Authentique}'),
(uuid_generate_v4(), 'Le Pointu', 'Quai Cronstadt', '83000', 'Toulon', 43.1201, 5.9325, 3, '{Méditerranéen, Français}', '{Sans gluten}', '{Animé, Vue Mer}'),
(uuid_generate_v4(), 'Pizza Da Franco', 'Avenue de la Victoire', '83000', 'Toulon', 43.1245, 5.9350, 1, '{Italien}', '{Végétarien}', '{Familial}'),
(uuid_generate_v4(), 'Gaetano', 'Plage du Mourillon', '83000', 'Toulon', 43.1095, 5.9520, 2, '{Italien, Pizza}', '{}', '{Romantique, Bord de mer}');

-- 5. INSERTION DES SOUVENIRS (POUR TON PROFIL)
INSERT INTO public.souvenirs (traveler_id, title, description, rating, photos_urls, date) VALUES
(v_id, 'Sushi Night', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam tristique, erat quis elementum.', 4, '{"https://images.unsplash.com/photo-1579871494447-9811cf80d66c"}', NOW() - INTERVAL '2 days'),
(v_id, 'Déjeuner au port', 'Une superbe découverte, le poisson était frais et l''accueil parfait.', 5, '{"https://images.unsplash.com/photo-1555939594-58d7cb561ad1"}', NOW() - INTERVAL '5 days');

-- 6. MESSAGERIE DE TEST
-- Création des conversations
INSERT INTO public.conversations (id, participant_1, participant_2, last_message_text, last_message_at) VALUES
(conv1, v_id, c1_id, 'a envoyé un message', NOW()),
(conv2, v_id, c2_id, 'a envoyé un message', NOW() - INTERVAL '1 hour');

-- Insertion des messages
INSERT INTO public.messages (conversation_id, sender_id, text, is_read) VALUES
(conv1, c1_id, 'Salut Margot ! Tu as aimé le restaurant Hôi An ?', false),
(conv2, c2_id, 'Je te recommande vivement de tester Le Pointu ce soir.', true);

END $$;