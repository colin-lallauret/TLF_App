-- Ajout de la colonne restaurant_id à la table souvenirs
ALTER TABLE souvenirs ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id);

-- Activer RLS sur souvenirs
ALTER TABLE souvenirs ENABLE ROW LEVEL SECURITY;

-- Policies pour souvenirs
-- Lecture : Le voyageur peut voir ses propres souvenirs
DROP POLICY IF EXISTS "Users can view their own souvenirs" ON souvenirs;
CREATE POLICY "Users can view their own souvenirs"
ON souvenirs FOR SELECT
USING (auth.uid() = traveler_id);

-- Insertion : Le voyageur peut créer ses souvenirs
DROP POLICY IF EXISTS "Users can create their own souvenirs" ON souvenirs;
CREATE POLICY "Users can create their own souvenirs"
ON souvenirs FOR INSERT
WITH CHECK (auth.uid() = traveler_id);

-- Update
DROP POLICY IF EXISTS "Users can update their own souvenirs" ON souvenirs;
CREATE POLICY "Users can update their own souvenirs"
ON souvenirs FOR UPDATE
USING (auth.uid() = traveler_id);

-- Delete
DROP POLICY IF EXISTS "Users can delete their own souvenirs" ON souvenirs;
CREATE POLICY "Users can delete their own souvenirs"
ON souvenirs FOR DELETE
USING (auth.uid() = traveler_id);
