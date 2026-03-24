-- Missing RLS Policies for the Golf Charity Backend

-- Charities: Anyone can view, only admins can modify (simple check, or just restrict modifications to service role)
CREATE POLICY "Anyone can view charities" ON public.charities FOR SELECT USING (true);

-- User Charities: Users can manage their own choice
CREATE POLICY "Users can view own charity selection" ON public.user_charities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own charity selection" ON public.user_charities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own charity selection" ON public.user_charities FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions: Users can manage their own subscription
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Scores: Users can manage their own scores
CREATE POLICY "Users can view own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id);

-- Draws: Anyone can view published draws
CREATE POLICY "Anyone can view draws" ON public.draws FOR SELECT USING (true);

-- Draw Entries: Users can see their own entries
CREATE POLICY "Users can view own entries" ON public.draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON public.draw_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Winners: Anyone can view winners (for transparency)
CREATE POLICY "Anyone can view winners" ON public.winners FOR SELECT USING (true);
CREATE POLICY "Winners can update their proof image" ON public.winners FOR UPDATE USING (auth.uid() = user_id);

-- Donations: Users can view their own, anyone can view aggregates
CREATE POLICY "Users can view own donations" ON public.donations FOR SELECT USING (auth.uid() = user_id);
