-- ==========================================================
-- 4. TABLE TRIPS (PARCOURS)
-- ==========================================================
-- Contains user-created trips (parcours)
CREATE TABLE public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft', -- draft, published, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 5. TABLE TRIP_STEPS (ÉTAPES DU PARCOURS)
-- ==========================================================
-- Contains steps (selected restaurants) for each trip
CREATE TABLE public.trip_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
    step_order INT NOT NULL,     -- 1, 2, 3, 4
    meal_type TEXT,              -- 'Petit-déjeuner', 'Déjeuner', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies (Row Level Security)
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_steps ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own trips
CREATE POLICY "Users can view own trips" ON public.trips
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own trips
CREATE POLICY "Users can create own trips" ON public.trips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own trip steps
CREATE POLICY "Users can view own trip steps" ON public.trip_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.trips t WHERE t.id = trip_steps.trip_id AND t.user_id = auth.uid()
        )
    );

-- Allow users to insert their own trip steps
CREATE POLICY "Users can create own trip steps" ON public.trip_steps
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trips t WHERE t.id = trip_steps.trip_id AND t.user_id = auth.uid()
        )
    );
