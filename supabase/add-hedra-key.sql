-- Add hedra_api_key column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hedra_api_key TEXT;
