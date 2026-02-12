-- ==========================================
-- 1. ACTIVATION DU RLS SUR TOUTES LES TABLES
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvenirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_contributors ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. POLITIQUES POUR LES PROFILS
-- ==========================================
-- Tout le monde peut voir les profils (pour voir les locaux et contributeurs).
CREATE POLICY "Profils publics" ON public.profiles 
FOR SELECT USING (true);

-- Seul l'utilisateur peut modifier ses propres infos (bio, avatar).
CREATE POLICY "Propriétaire peut modifier son profil" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- 3. POLITIQUES POUR LES RESTAURANTS (LECTURE SEULE)
-- ==========================================
-- Tout le monde peut voir les restaurants sur la carte et l'accueil.
CREATE POLICY "Restaurants visibles par tous" ON public.restaurants 
FOR SELECT USING (true);

-- ==========================================
-- 4. POLITIQUES POUR LES AVIS (REVIEWS)
-- ==========================================
-- Tout le monde peut lire les avis des locaux.
CREATE POLICY "Avis publics" ON public.reviews 
FOR SELECT USING (true);

-- Seuls les utilisateurs authentifiés peuvent poster un avis.
CREATE POLICY "Insertion avis par authentifiés" ON public.reviews 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- 5. POLITIQUES POUR LES SOUVENIRS (STRICTEMENT PRIVÉ)
-- ==========================================
-- Un voyageur ne voit, n'ajoute et ne modifie QUE ses propres souvenirs.
CREATE POLICY "Souvenirs strictement privés" ON public.souvenirs 
FOR ALL USING (auth.uid() = traveler_id);

-- ==========================================
-- 6. POLITIQUES POUR LA MESSAGERIE
-- ==========================================
-- Un utilisateur ne peut voir que les conversations auxquelles il participe.
CREATE POLICY "Conversations personnelles" ON public.conversations 
FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Un utilisateur ne voit que les messages des conversations dont il est membre.
CREATE POLICY "Lecture messages personnels" ON public.messages 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = messages.conversation_id 
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  )
);

-- Envoi de message autorisé si l'expéditeur est l'utilisateur connecté.
CREATE POLICY "Envoi de message" ON public.messages 
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ==========================================
-- 7. POLITIQUES POUR LES FAVORIS
-- ==========================================
-- Gestion des favoris propre à chaque utilisateur.
CREATE POLICY "Gestion favoris restos personnels" ON public.favorite_restaurants 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Gestion favoris contributeurs personnels" ON public.favorite_contributors 
FOR ALL USING (auth.uid() = follower_id);