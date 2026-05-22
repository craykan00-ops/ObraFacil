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

-- Policies para obra_funcionarios
DROP POLICY IF EXISTS "Dono pode adicionar membros" ON obra_funcionarios;
CREATE POLICY "Dono pode adicionar membros" ON obra_funcionarios
FOR INSERT TO authenticated
WITH CHECK (
  obra_id IN (SELECT id FROM obras WHERE dono_id = auth.uid())
);

DROP POLICY IF EXISTS "Membros podem ver obra_funcionarios" ON obra_funcionarios;
CREATE POLICY "Membros podem ver obra_funcionarios" ON obra_funcionarios
FOR SELECT TO authenticated
USING (
  obra_id IN (SELECT id FROM obras WHERE dono_id = auth.uid())
  OR funcionario_id = auth.uid()
);
