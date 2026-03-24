-- Seed script to insert the original demo charities into the database

INSERT INTO public.charities (name, category, description)
VALUES 
  ('Green Future Foundation', 'Environment', 'Protecting our planet through sustainable golf course management and reforestation.'),
  ('Youth Sports Academy', 'Education', 'Introducing underprivileged youth to golf and mentorship programs worldwide.'),
  ('Mental Health Links', 'Health', 'Using sport and outdoor activities to improve mental health and wellbeing.'),
  ('Community Builders', 'Community', 'Building community spaces and sports facilities in underserved areas.')
ON CONFLICT DO NOTHING;
