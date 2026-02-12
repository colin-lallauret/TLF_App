-- ==========================================================
-- SCRIPT COMPLET DE SÉCURITÉ (RLS) - TravelLocalFood
-- ==========================================================

-- 1. ACTIVATION GÉNÉRALE DU RLS
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvenirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_contributors ENABLE ROW LEVEL SECURITY;

-- 2. POLITIQUES POUR LES PROFILS
-- ==========================================================
-- Lecture : Tout le monde peut voir les profils (pour voir les locaux et contributeurs).
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Modification : Seul l'utilisateur peut modifier ses propres infos (bio, avatar).
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. POLITIQUES POUR LES RESTAURANTS
-- ==========================================================
-- Lecture : Tout le monde peut voir les restaurants sur la carte et l'accueil.
DROP POLICY IF EXISTS "Restaurants visibles par tous" ON public.restaurants;
CREATE POLICY "Restaurants visibles par tous" 
ON public.restaurants FOR SELECT USING (true);

-- 4. POLITIQUES POUR LES AVIS (REVIEWS)
-- ==========================================================
-- Lecture : Tout le monde peut lire les avis des locaux.
DROP POLICY IF EXISTS "Avis publics" ON public.reviews;
CREATE POLICY "Avis publics" 
ON public.reviews FOR SELECT USING (true);

-- Insertion : Seuls les utilisateurs authentifiés peuvent poster un avis.
DROP POLICY IF EXISTS "Insertion avis par authentifiés" ON public.reviews;
CREATE POLICY "Insertion avis par authentifiés" 
ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. POLITIQUES POUR LES SOUVENIRS (STRICTEMENT PRIVÉ)
-- ==========================================================
-- Un voyageur ne voit, n'ajoute, ne modifie et ne supprime QUE ses propres souvenirs.
DROP POLICY IF EXISTS "Souvenirs personnels" ON public.souvenirs;
CREATE POLICY "Souvenirs personnels" 
ON public.souvenirs FOR ALL USING (auth.uid() = traveler_id);

-- 6. POLITIQUES POUR LA MESSAGERIE (TEMPS RÉEL)
-- ==========================================================

-- Conversations : Les participants peuvent voir, créer et mettre à jour leurs conversations.
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
CREATE POLICY "Users can update their conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Messages : Lecture et envoi autorisés uniquement pour les membres de la conversation.
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = messages.conversation_id 
        AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = conversation_id 
        AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
);

-- 7. POLITIQUES POUR LES FAVORIS
-- ==========================================================
-- Gestion des favoris propre à chaque utilisateur (Restaurants et Contributeurs).
DROP POLICY IF EXISTS "Favoris restaurants personnels" ON public.favorite_restaurants;
CREATE POLICY "Favoris restaurants personnels" 
ON public.favorite_restaurants FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Favoris contributeurs personnels" ON public.favorite_contributors;
CREATE POLICY "Favoris contributeurs personnels" 
ON public.favorite_contributors FOR ALL USING (auth.uid() = follower_id);