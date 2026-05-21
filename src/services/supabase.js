// ============================================================
// OBRAFÁCIL — INTEGRAÇÃO SUPABASE COMPLETA
// ============================================================
// Arquivo: src/services/supabase.js
//
// COMO CONFIGURAR:
// 1. Acesse https://supabase.com e crie uma conta grátis
// 2. Clique em "New Project"
// 3. Dê um nome: "obrafacil"
// 4. Escolha uma senha forte para o banco
// 5. Região: South America (São Paulo)
// 6. Clique em "Create new project"
// 7. Vá em Settings > API
// 8. Copie a "Project URL" e a "anon public key"
// 9. Cole abaixo substituindo os valores
// ============================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://puwebhhkuehlkswycqtz.supabase.co";   // ← cole aqui
const SUPABASE_KEY  = "sb_publishable_SoWnt85Pu03k7Nb8dsM3Wg_q1PmkZRy";            // ← cole aqui

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// INSTALAR DEPENDÊNCIA:
// npx expo install @supabase/supabase-js
// ============================================================


// ============================================================
// AUTH — AUTENTICAÇÃO
// ============================================================

/** Cadastrar novo usuário */
export async function cadastrar({ nome, email, senha, telefone, perfil }) {
  // 1. Cria o usuário no Auth do Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome, telefone, perfil }, // dados extras salvos no token
    },
  });

  if (error) throw error;

  // 2. Salva o perfil completo na tabela profiles
  if (data.user) {
    const { error: perfilError } = await supabase
      .from("profiles")
      .insert({
        id:       data.user.id,
        nome,
        telefone,
        perfil,   // "mestre" ou "funcionario"
      });

    if (perfilError) throw perfilError;
  }

  return data;
}

/** Fazer login */
export async function login({ email, senha }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) throw error;
  return data;
}

/** Logout */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Recuperar senha por e-mail */
export async function recuperarSenha(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "obrafacil://reset-password",
  });
  if (error) throw error;
}

/** Ouvir mudanças de sessão (login/logout automático) */
export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

/** Pegar usuário atual */
export async function getUsuarioAtual() {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

/** Pegar perfil do usuário */
export async function getPerfil(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}


// ============================================================
// OBRAS
// ============================================================

/** Listar obras do mestre logado */
export async function getObras() {
  const user = await getUsuarioAtual();

  const { data, error } = await supabase
    .from("obras")
    .select(`
      *,
      obra_funcionarios (count),
      tarefas (count)
    `)
    .eq("dono_id", user.id)
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return data;
}

/** Buscar uma obra pelo ID */
export async function getObra(id) {
  const { data, error } = await supabase
    .from("obras")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/** Criar nova obra */
export async function criarObra({ nome, endereco, descricao, fase_atual, data_inicio, data_prevista }) {
  const user = await getUsuarioAtual();

  const { data, error } = await supabase
    .from("obras")
    .insert({
      nome,
      endereco,
      descricao,
      fase_atual,
      data_inicio,
      data_prevista,
      dono_id: user.id,
      status: "em_andamento",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Atualizar obra */
export async function atualizarObra(id, campos) {
  const { data, error } = await supabase
    .from("obras")
    .update(campos)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Deletar obra */
export async function deletarObra(id) {
  const { error } = await supabase
    .from("obras")
    .delete()
    .eq("id", id);

  if (error) throw error;
}


// ============================================================
// TAREFAS
// ============================================================

/** Listar tarefas de uma obra */
export async function getTarefas(obraId) {
  const { data, error } = await supabase
    .from("tarefas")
    .select(`
      *,
      profiles:responsavel_id (nome, foto_url)
    `)
    .eq("obra_id", obraId)
    .order("criado_em", { ascending: true });

  if (error) throw error;
  return data;
}

/** Listar tarefas do funcionário logado */
export async function getMinhasTarefas() {
  const user = await getUsuarioAtual();

  const { data, error } = await supabase
    .from("tarefas")
    .select(`
      *,
      obras (nome)
    `)
    .eq("responsavel_id", user.id)
    .neq("status", "cancelada")
    .order("data_prevista", { ascending: true });

  if (error) throw error;
  return data;
}

/** Criar tarefa */
export async function criarTarefa({ obraId, titulo, descricao, instrucoes, responsavelId, prioridade, dataPrevista }) {
  const user = await getUsuarioAtual();

  const { data, error } = await supabase
    .from("tarefas")
    .insert({
      obra_id:        obraId,
      titulo,
      descricao,
      instrucoes,
      responsavel_id: responsavelId,
      prioridade:     prioridade || "normal",
      data_prevista:  dataPrevista,
      status:         "pendente",
      criado_por:     user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Atualizar status da tarefa */
export async function atualizarStatusTarefa(id, status) {
  const campos = {
    status,
    ...(status === "concluida" ? { concluido_em: new Date().toISOString() } : {}),
  };

  const { data, error } = await supabase
    .from("tarefas")
    .update(campos)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Ouvir tarefas em tempo real (atualiza automaticamente) */
export function ouvirTarefas(obraId, callback) {
  return supabase
    .channel(`tarefas-obra-${obraId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tarefas", filter: `obra_id=eq.${obraId}` },
      (payload) => callback(payload)
    )
    .subscribe();
}


// ============================================================
// FOTOS DE APROVAÇÃO
// ============================================================

/** Enviar foto de conclusão de tarefa */
export async function enviarFotoTarefa(tarefaId, arquivo) {
  const user    = await getUsuarioAtual();
  const caminho = `tarefas/${tarefaId}/${Date.now()}.jpg`;

  // 1. Faz upload da foto no Storage
  const { error: uploadError } = await supabase.storage
    .from("fotos-tarefas")
    .upload(caminho, arquivo, { contentType: "image/jpeg" });

  if (uploadError) throw uploadError;

  // 2. Pega a URL pública da foto
  const { data: urlData } = supabase.storage
    .from("fotos-tarefas")
    .getPublicUrl(caminho);

  // 3. Salva a referência no banco
  const { data, error } = await supabase
    .from("fotos_tarefas")
    .insert({
      tarefa_id:   tarefaId,
      foto_url:    urlData.publicUrl,
      enviado_por: user.id,
      aprovado:    null, // null = aguardando aprovação
    })
    .select()
    .single();

  if (error) throw error;

  // 4. Atualiza status da tarefa para aguardando aprovação
  await atualizarStatusTarefa(tarefaId, "aguardando_aprovacao");

  return data;
}

/** Aprovar ou reprovar foto */
export async function aprovarFoto(fotoId, aprovado, observacao = "") {
  const user = await getUsuarioAtual();

  const { data, error } = await supabase
    .from("fotos_tarefas")
    .update({ aprovado, observacao, aprovado_por: user.id })
    .eq("id", fotoId)
    .select()
    .single();

  if (error) throw error;
  return data;
}


// ============================================================
// ORÇAMENTOS
// ============================================================

/** Listar orçamentos */
export async function getOrcamentos(obraId = null) {
  const user = await getUsuarioAtual();

  let query = supabase
    .from("orcamentos")
    .select(`
      *,
      orcamento_itens (*)
    `)
    .eq("criado_por", user.id)
    .order("criado_em", { ascending: false });

  if (obraId) query = query.eq("obra_id", obraId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Criar orçamento */
export async function criarOrcamento({ obraId, clienteNome, clienteTelefone, clienteEmail, enderecoObra, descricao, validoAte }) {
  const user = await getUsuarioAtual();

  const { data, error } = await supabase
    .from("orcamentos")
    .insert({
      obra_id:          obraId,
      cliente_nome:     clienteNome,
      cliente_telefone: clienteTelefone,
      cliente_email:    clienteEmail,
      endereco_obra:    enderecoObra,
      descricao,
      valido_ate:       validoAte,
      status:           "rascunho",
      criado_por:       user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Adicionar item ao orçamento */
export async function adicionarItemOrcamento({ orcamentoId, tipo, descricao, quantidade, unidade, valorUnitario }) {
  const { data, error } = await supabase
    .from("orcamento_itens")
    .insert({
      orcamento_id:   orcamentoId,
      tipo,           // "material" | "mao_obra" | "servico"
      descricao,
      quantidade,
      unidade,
      valor_unitario: valorUnitario,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Atualizar status do orçamento */
export async function atualizarStatusOrcamento(id, status) {
  const { data, error } = await supabase
    .from("orcamentos")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}


// ============================================================
// ESTOQUE
// ============================================================

/** Listar estoque de uma obra */
export async function getEstoque(obraId) {
  const { data, error } = await supabase
    .from("estoque")
    .select("*")
    .eq("obra_id", obraId)
    .order("material", { ascending: true });

  if (error) throw error;
  return data;
}

/** Listar itens abaixo do mínimo (alertas) */
export async function getAlertasEstoque(obraId) {
  const { data, error } = await supabase
    .from("estoque")
    .select("*")
    .eq("obra_id", obraId)
    .filter("quantidade_atual", "lt", supabase.raw("quantidade_minima"));

  if (error) throw error;
  return data;
}

/** Adicionar material ao estoque */
export async function adicionarMaterial({ obraId, material, unidade, quantidadeAtual, quantidadeMinima }) {
  const { data, error } = await supabase
    .from("estoque")
    .insert({
      obra_id:           obraId,
      material,
      unidade,
      quantidade_atual:  quantidadeAtual,
      quantidade_minima: quantidadeMinima,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Registrar movimentação de estoque (entrada ou saída) */
export async function movimentarEstoque({ estoqueId, tipo, quantidade, motivo }) {
  const user = await getUsuarioAtual();

  // O trigger no banco atualiza quantidade_atual automaticamente!
  const { data, error } = await supabase
    .from("estoque_movimentacoes")
    .insert({
      estoque_id:    estoqueId,
      tipo,          // "entrada" | "saida" | "ajuste"
      quantidade,
      motivo,
      registrado_por: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Histórico de movimentações */
export async function getHistoricoEstoque(obraId) {
  // Busca todos os IDs de estoque da obra
  const { data: itens } = await supabase
    .from("estoque")
    .select("id")
    .eq("obra_id", obraId);

  const ids = itens?.map(i => i.id) || [];

  const { data, error } = await supabase
    .from("estoque_movimentacoes")
    .select(`
      *,
      estoque (material, unidade),
      profiles:registrado_por (nome)
    `)
    .in("estoque_id", ids)
    .order("criado_em", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}


// ============================================================
// FINANCEIRO
// ============================================================

/** Listar lançamentos financeiros */
export async function getFinanceiro(obraId) {
  const { data, error } = await supabase
    .from("financeiro")
    .select("*")
    .eq("obra_id", obraId)
    .order("data_lancamento", { ascending: false });

  if (error) throw error;
  return data;
}

/** Adicionar lançamento */
export async function adicionarLancamento({ obraId, tipo, categoria, descricao, valor, dataLancamento, pago }) {
  const user = await getUsuarioAtual();

  const { data, error } = await supabase
    .from("financeiro")
    .insert({
      obra_id:         obraId,
      tipo,            // "receita" | "despesa"
      categoria,
      descricao,
      valor,
      data_lancamento: dataLancamento,
      pago:            pago || false,
      registrado_por:  user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}


// ============================================================
// NOTIFICAÇÕES
// ============================================================

/** Listar notificações do usuário */
export async function getNotificacoes() {
  const user = await getUsuarioAtual();

  const { data, error } = await supabase
    .from("notificacoes")
    .select("*")
    .eq("usuario_id", user.id)
    .order("criado_em", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

/** Marcar notificação como lida */
export async function marcarLida(id) {
  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("id", id);

  if (error) throw error;
}

/** Ouvir notificações em tempo real */
export function ouvirNotificacoes(userId, callback) {
  return supabase
    .channel(`notificacoes-${userId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notificacoes", filter: `usuario_id=eq.${userId}` },
      (payload) => callback(payload.new)
    )
    .subscribe();
}


// ============================================================
// EQUIPE
// ============================================================

/** Listar funcionários de uma obra */
export async function getEquipe(obraId) {
  const { data, error } = await supabase
    .from("obra_funcionarios")
    .select(`
      *,
      profiles (nome, telefone, foto_url, perfil)
    `)
    .eq("obra_id", obraId)
    .eq("ativo", true);

  if (error) throw error;
  return data;
}

/** Adicionar funcionário à obra por e-mail */
export async function adicionarFuncionario(obraId, email) {
  // 1. Busca o usuário pelo e-mail
  const { data: perfis, error: perfilError } = await supabase
    .from("profiles")
    .select("id, nome")
    .eq("email", email)
    .single();

  if (perfilError) throw new Error("Funcionário não encontrado. Peça para ele criar uma conta primeiro.");

  // 2. Adiciona à obra
  const { data, error } = await supabase
    .from("obra_funcionarios")
    .insert({
      obra_id:        obraId,
      funcionario_id: perfis.id,
      ativo:          true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}


