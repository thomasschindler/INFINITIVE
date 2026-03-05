-- 1. Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. Update the trigger function to insert the email as well
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update existing profiles with emails from auth.users (requires superuser/postgres role)
-- NOTE: In Supabase, you can run this block in the SQL Editor to backfill existing users:
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 4. Add Admin policies for profiles and user_progress
-- Allows admin to read all profiles
CREATE POLICY "Admin can view all profiles" ON public.profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 't@delodi.net'
  )
);

-- Allows admin to read all user progress
CREATE POLICY "Admin can view all progress" ON public.user_progress 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 't@delodi.net'
  )
);
