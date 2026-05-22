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

-- ── OBRAS ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Dono gerencia obras" ON obras;
CREATE POLICY "Dono gerencia obras" ON obras
FOR ALL TO authenticated
USING (dono_id = auth.uid())
WITH CHECK (dono_id = auth.uid());

DROP POLICY IF EXISTS "Membros veem obras" ON obras;
CREATE POLICY "Membros veem obras" ON obras
FOR SELECT TO authenticated
USING (id IN (SELECT obra_id FROM obra_funcionarios WHERE funcionario_id = auth.uid()));

-- ── TAREFAS ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Acesso a tarefas" ON tarefas;
CREATE POLICY "Acesso a tarefas" ON tarefas
FOR ALL TO authenticated
USING (
  obra_id IN (SELECT id FROM obras WHERE dono_id = auth.uid())
  OR obra_id IN (SELECT obra_id FROM obra_funcionarios WHERE funcionario_id = auth.uid())
)
WITH CHECK (
  obra_id IN (SELECT id FROM obras WHERE dono_id = auth.uid())
  OR obra_id IN (SELECT obra_id FROM obra_funcionarios WHERE funcionario_id = auth.uid())
);

-- ── ESTOQUE ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Acesso ao estoque" ON estoque;
CREATE POLICY "Acesso ao estoque" ON estoque
FOR ALL TO authenticated
USING (
  obra_id IN (SELECT id FROM obras WHERE dono_id = auth.uid())
  OR obra_id IN (SELECT obra_id FROM obra_funcionarios WHERE funcionario_id = auth.uid())
)
WITH CHECK (
  obra_id IN (SELECT id FROM obras WHERE dono_id = auth.uid())
  OR obra_id IN (SELECT obra_id FROM obra_funcionarios WHERE funcionario_id = auth.uid())
);

-- ── ESTOQUE MOVIMENTAÇÕES ──────────────────────────────────
DROP POLICY IF EXISTS "Acesso a movimentacoes" ON estoque_movimentacoes;
CREATE POLICY "Acesso a movimentacoes" ON estoque_movimentacoes
FOR ALL TO authenticated
USING (
  estoque_id IN (
    SELECT e.id FROM estoque e
    JOIN obras o ON e.obra_id = o.id
    WHERE o.dono_id = auth.uid()
       OR e.obra_id IN (SELECT obra_id FROM obra_funcionarios WHERE funcionario_id = auth.uid())
  )
)
WITH CHECK (
  estoque_id IN (
    SELECT e.id FROM estoque e
    JOIN obras o ON e.obra_id = o.id
    WHERE o.dono_id = auth.uid()
       OR e.obra_id IN (SELECT obra_id FROM obra_funcionarios WHERE funcionario_id = auth.uid())
  )
);

-- ── ORÇAMENTOS ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Acesso a orcamentos" ON orcamentos;
CREATE POLICY "Acesso a orcamentos" ON orcamentos
FOR ALL TO authenticated
USING (criado_por = auth.uid())
WITH CHECK (criado_por = auth.uid());

-- ── ITENS DE ORÇAMENTO ─────────────────────────────────────
DROP POLICY IF EXISTS "Acesso a orcamento_itens" ON orcamento_itens;
CREATE POLICY "Acesso a orcamento_itens" ON orcamento_itens
FOR ALL TO authenticated
USING (orcamento_id IN (SELECT id FROM orcamentos WHERE criado_por = auth.uid()))
WITH CHECK (orcamento_id IN (SELECT id FROM orcamentos WHERE criado_por = auth.uid()));

-- ── NOTIFICAÇÕES ───────────────────────────────────────────
DROP POLICY IF EXISTS "Acesso a notificacoes" ON notificacoes;
CREATE POLICY "Acesso a notificacoes" ON notificacoes
FOR ALL TO authenticated
USING (usuario_id = auth.uid())
WITH CHECK (true);
