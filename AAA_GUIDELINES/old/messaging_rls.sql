-- ==============================================================================
-- SCRIPT DE CONFIGURATION DES POLITIQUES DE SÉCURITÉ (RLS) POUR LA MESSAGERIE
-- À exécuter dans l'éditeur SQL de Supabase
-- ==============================================================================

-- 1. Activer la sécurité RLS sur les tables (si ce n'est pas déjà fait)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES POUR LA TABLE CONVERSATIONS

-- Lecture : Les participants peuvent voir leurs conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Insertion : Un utilisateur authentifié peut créer une conversation s'il est l'un des participants
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Mise à jour : Les participants peuvent mettre à jour (ex: last_message_at)
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
CREATE POLICY "Users can update their conversations"
ON conversations FOR UPDATE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- 3. POLICIES POUR LA TABLE MESSAGES

-- Lecture : Si je suis participant de la conversation liée
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = messages.conversation_id 
        AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
);

-- Insertion : Je peux envoyer un message si je suis l'expéditeur ET participant de la conversation
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id 
    AND 
    EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = conversation_id 
        AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
);

-- 4. POLICIES POUR LES PROFILS (Nécessaire pour afficher les noms/avatars)

-- Lecture publique des profils (Tout le monde peut voir les profils basiques)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);
