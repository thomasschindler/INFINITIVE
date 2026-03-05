-- In Supabase, normal users do NOT have access to auth.users. 
-- The previous policy tried to query auth.users, which results in "permission denied for table users".

-- Drop the broken policies
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all progress" ON public.user_progress;

-- Create correct policies by checking the public.profiles table instead of auth.users
CREATE POLICY "Admin can view all profiles" ON public.profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND email = 't@delodi.net'
  )
);

CREATE POLICY "Admin can view all progress" ON public.user_progress 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND email = 't@delodi.net'
  )
);
