-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Pour la recherche par distance

-- ==========================================
-- 2. TABLES PRINCIPALES
-- ==========================================

-- Profils (Liés à auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  city TEXT,
  avatar_url TEXT,
  is_contributor BOOLEAN DEFAULT false,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurants (L'annuaire)
CREATE TABLE public.restaurants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  region TEXT,
  department TEXT,
  country TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  budget_level INT CHECK (budget_level BETWEEN 1 AND 4),
  food_types TEXT[],      -- Italien, Japonais, etc.
  dietary_prefs TEXT[],   -- Végan, Sans Gluten, etc.
  services TEXT[],        -- Livraison, Sur place, etc.
  atmospheres TEXT[],     -- Romantique, Animé, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avis des Contributeurs
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  contributor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  rating INT CHECK (rating BETWEEN 0 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Souvenirs des Voyageurs (Privé)
CREATE TABLE public.souvenirs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  traveler_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  rating INT CHECK (rating BETWEEN 0 AND 5),
  photos_urls TEXT[], 
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. MESSAGERIE (Temps Réel)
-- ==========================================

-- Conversations
CREATE TABLE public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_text TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

-- Messages
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. TABLES DE LIAISON (Favoris)
-- ==========================================

CREATE TABLE public.favorite_restaurants (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, restaurant_id)
);

CREATE TABLE public.favorite_contributors (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  contributor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, contributor_id)
);

-- ==========================================
-- 5. AUTOMATISATION & REALTIME
-- ==========================================

-- Création automatique du profil après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Activer le Realtime pour les messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;