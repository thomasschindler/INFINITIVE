-- Create profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create videos table
CREATE TABLE public.videos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id text NOT NULL,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_progress table
CREATE TABLE public.user_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, video_id) -- A user can only complete a video once
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND email = 't@delodi.net'));

-- Trigger to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Videos policies (Read-only for everyone)
CREATE POLICY "Videos are viewable by everyone" ON public.videos FOR SELECT USING (true);

-- User Progress policies
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all progress" ON public.user_progress FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND email = 't@delodi.net'));

-- Insert 38 videos
INSERT INTO public.videos (youtube_id, title, description, order_index) VALUES 
('igUZzWZVXSo', 'INFINITIVE Video 1', 'Description for video 1', 1),
('ISccxXurQjQ', 'INFINITIVE Video 2', 'Description for video 2', 2),
('gOKvVKhjhBY', 'INFINITIVE Video 3', 'Description for video 3', 3),
('X0uagMUxNYE', 'INFINITIVE Video 4', 'Description for video 4', 4),
('KdJZ23OZLxM', 'INFINITIVE Video 5', 'Description for video 5', 5),
('bsbKinlRIQs', 'INFINITIVE Video 6', 'Description for video 6', 6),
('_vdBUcuHweM', 'INFINITIVE Video 7', 'Description for video 7', 7),
('esVIplqR0BM', 'INFINITIVE Video 8', 'Description for video 8', 8),
('y-QaYCEzhDg', 'INFINITIVE Video 9', 'Description for video 9', 9),
('cD3c8_3YGzg', 'INFINITIVE Video 10', 'Description for video 10', 10),
('9KfOIIAlzp4', 'INFINITIVE Video 11', 'Description for video 11', 11),
('3J5EBvZ9UQE', 'INFINITIVE Video 12', 'Description for video 12', 12),
('0RR-vsDzfj0', 'INFINITIVE Video 13', 'Description for video 13', 13),
('zRXR__GLXNM', 'INFINITIVE Video 14', 'Description for video 14', 14),
('8j2f16X7CKo', 'INFINITIVE Video 15', 'Description for video 15', 15),
('kFEc8q5RjlM', 'INFINITIVE Video 16', 'Description for video 16', 16),
('TP-3X7BE2H8', 'INFINITIVE Video 17', 'Description for video 17', 17),
('V1YOMCVou14', 'INFINITIVE Video 18', 'Description for video 18', 18),
('GFgl_XM_qMA', 'INFINITIVE Video 19', 'Description for video 19', 19),
('xtupndfMkhM', 'INFINITIVE Video 20', 'Description for video 20', 20),
('TfhSjgt-v20', 'INFINITIVE Video 21', 'Description for video 21', 21),
('HMDyMmaiNcA', 'INFINITIVE Video 22', 'Description for video 22', 22),
('aPYCsfp_vtU', 'INFINITIVE Video 23', 'Description for video 23', 23),
('_hhPlU_NM20', 'INFINITIVE Video 24', 'Description for video 24', 24),
('0stH2z5Sljg', 'INFINITIVE Video 25', 'Description for video 25', 25),
('MgaJmukdas8', 'INFINITIVE Video 26', 'Description for video 26', 26),
('Xn5tVSiY__E', 'INFINITIVE Video 27', 'Description for video 27', 27),
('OQ0Pt1ZOqdU', 'INFINITIVE Video 28', 'Description for video 28', 28),
('hkMZRAZmKCw', 'INFINITIVE Video 29', 'Description for video 29', 29),
('i7N1S6N8rHg', 'INFINITIVE Video 30', 'Description for video 30', 30),
('iU6GQqZ6eYs', 'INFINITIVE Video 31', 'Description for video 31', 31),
('mu8J-5ZxXDg', 'INFINITIVE Video 32', 'Description for video 32', 32),
('S-BBgkxJUcw', 'INFINITIVE Video 33', 'Description for video 33', 33),
('xqZO9ucMems', 'INFINITIVE Video 34', 'Description for video 34', 34),
('FSh26xMa83E', 'INFINITIVE Video 35', 'Description for video 35', 35),
('z1S5iPwp5fA', 'INFINITIVE Video 36', 'Description for video 36', 36),
('_F4m_jJqWHQ', 'INFINITIVE Video 37', 'Description for video 37', 37),
('BWlqWfJzVPM', 'INFINITIVE Video 38', 'Description for video 38', 38);