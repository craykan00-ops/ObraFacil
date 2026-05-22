ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plano TEXT DEFAULT 'gratis';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Popula email de usuarios existentes
UPDATE profiles
SET email = u.email
FROM auth.users u
WHERE profiles.id = u.id;

-- Permite busca por email entre usuarios autenticados (necessario para convites)
DROP POLICY IF EXISTS "Authenticated users can search profiles" ON profiles;
CREATE POLICY "Authenticated users can search profiles"
ON profiles FOR SELECT TO authenticated
USING (true);
