-- This script will help you become an admin
-- After you sign up/log in, run this query replacing YOUR_EMAIL with your actual email

-- Option 1: Make yourself admin by email
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::app_role
-- FROM auth.users
-- WHERE email = 'YOUR_EMAIL_HERE'
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Option 2: Make the first user an admin (useful for initial setup)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;

-- If you need to see all users to find your user_id, uncomment this:
-- SELECT id, email, created_at FROM auth.users;