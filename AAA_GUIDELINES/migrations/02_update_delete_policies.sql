-- ==========================================================
-- MISSING RLS POLICIES FOR TRIPS (UPDATE & DELETE)
-- ==========================================================

-- 1. TRIPS TABLE
-- Allow users to update their own trips (e.g., rename)
CREATE POLICY "Users can update own trips" ON public.trips
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own trips
CREATE POLICY "Users can delete own trips" ON public.trips
    FOR DELETE USING (auth.uid() = user_id);

-- 2. TRIP STEPS TABLE
-- Allow users to update their own trip steps (e.g., change restaurant)
CREATE POLICY "Users can update own trip steps" ON public.trip_steps
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.trips t WHERE t.id = trip_steps.trip_id AND t.user_id = auth.uid()
        )
    );

-- Allow users to delete their own trip steps (cascade delete or manual removal)
CREATE POLICY "Users can delete own trip steps" ON public.trip_steps
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.trips t WHERE t.id = trip_steps.trip_id AND t.user_id = auth.uid()
        )
    );
