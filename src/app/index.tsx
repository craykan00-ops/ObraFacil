import { useCallback, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

// ─── TEMA ─────────────────────────────────────────────────
const T = {
  amarelo:    "#C77700",
  amareloC:   "#FFF3DC",
  laranja:    "#B85000",
  fundo:      "#F5F5F0",
  fundoCard:  "#FFFFFF",
  cinza1:     "#1A1A1A",
  cinza2:     "#4A4A4A",
  cinza3:     "#8A8A8A",
  cinzaBorda: "#E0E0D8",
  verde:      "#2E7D32",
  verdeC:     "#E8F5E9",
  vermelho:   "#C62828",
  vermelhoC:  "#FFEBEE",
};

// ─── COMPONENTES BASE ──────────────────────────────────────
function Badge({ label, cor, fundo }) {
  return <span style={{ background:fundo, color:cor, fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20, whiteSpace:"nowrap" }}>{label}</span>;
}

function ProgBar({ valor, cor=T.amarelo }) {
  return (
    <div style={{ height:5, background:T.cinzaBorda, borderRadius:3, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${valor}%`, background:cor, borderRadius:3, transition:"width 0.6s" }} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
      <div style={{ width:32, height:32, border:`3px solid ${T.cinzaBorda}`, borderTop:`3px solid ${T.amarelo}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Input({ label, type="text", value, onChange, placeholder, erro }) {
  const [foco, setFoco] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const isSenha = type === "password";
  return (
    <div style={{ marginBottom:16 }}>
      {label && <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:6 }}>{label}</div>}
      <div style={{ display:"flex", alignItems:"center", border:`1.5px solid ${erro ? T.vermelho : foco ? T.amarelo : T.cinzaBorda}`, borderRadius:12, background:T.fundoCard, boxShadow: foco ? `0 0 0 3px ${T.amarelo}18` : "none", transition:"all 0.2s" }}>
        <input
          type={isSenha && !mostrar ? "password" : "text"}
          value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFoco(true)} onBlur={() => setFoco(false)}
          style={{ flex:1, padding:"13px 14px", border:"none", outline:"none", fontSize:15, color:T.cinza1, background:"transparent", fontFamily:"inherit" }}
        />
        {isSenha && (
          <button type="button" onClick={() => setMostrar(p=>!p)} style={{ background:"none", border:"none", padding:"0 14px", cursor:"pointer", fontSize:16, color:T.cinza3 }}>
            {mostrar ? "🙈" : "👁️"}
          </button>
        )}
      </div>
      {erro && <div style={{ fontSize:12, color:T.vermelho, marginTop:5 }}>⚠️ {erro}</div>}
    </div>
  );
}

function BtnPrimario({ children, onClick, loading, disabled, style={} }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width:"100%", padding:"15px", border:"none", borderRadius:12,
      background: disabled || loading ? T.cinzaBorda : T.amarelo,
      color:"#fff", fontSize:16, fontWeight:700,
      cursor: disabled || loading ? "default" : "pointer",
      boxShadow: disabled || loading ? "none" : "0 4px 16px rgba(199,119,0,0.3)",
      transition:"all 0.2s", ...style,
    }}>
      {loading ? "⏳ Aguarde..." : children}
    </button>
  );
}

function Header({ titulo, subtitulo, onVoltar, acao }) {
  return (
    <div style={{ background:T.fundoCard, borderBottom:`1px solid ${T.cinzaBorda}`, padding:"44px 20px 14px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", position:"sticky", top:0, zIndex:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {onVoltar && <button onClick={onVoltar} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:T.cinza2, padding:"0 4px 0 0" }}>←</button>}
          <div>
            {subtitulo && <div style={{ fontSize:11, color:T.cinza3, letterSpacing:1, textTransform:"uppercase", marginBottom:2 }}>{subtitulo}</div>}
            <div style={{ fontSize:19, fontWeight:800, color:T.cinza1 }}>{titulo}</div>
          </div>
        </div>
        {acao}
      </div>
    </div>
  );
}

function BottomNav({ aba, setAba, alertas=0 }) {
  const items = [
    { id:"dashboard", emoji:"🏠", label:"Início"    },
    { id:"tarefas",   emoji:"✅", label:"Tarefas"   },
    { id:"orcamento", emoji:"💰", label:"Orçamento" },
    { id:"estoque",   emoji:"📦", label:"Estoque",  badge:alertas },
    { id:"perfil",    emoji:"👤", label:"Perfil"    },
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:T.fundoCard, borderTop:`1px solid ${T.cinzaBorda}`, display:"flex", padding:"10px 0 16px", boxShadow:"0 -4px 16px rgba(0,0,0,0.07)", zIndex:20 }}>
      {items.map(item => (
        <div key={item.id} onClick={() => setAba(item.id)} style={{ flex:1, textAlign:"center", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, position:"relative" }}>
          <span style={{ fontSize:21 }}>{item.emoji}</span>
          {item.badge > 0 && <div style={{ position:"absolute", top:-2, right:"18%", width:16, height:16, borderRadius:8, background:T.vermelho, fontSize:9, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${T.fundoCard}` }}>{item.badge}</div>}
          <span style={{ fontSize:10, fontWeight: aba===item.id ? 700 : 500, color: aba===item.id ? T.amarelo : T.cinza3 }}>{item.label}</span>
          {aba===item.id && <div style={{ width:4, height:4, borderRadius:2, background:T.amarelo }} />}
        </div>
      ))}
    </div>
  );
}

// ─── TELA LOGIN ────────────────────────────────────────────
function TelaLogin({ onLogin, onIrCadastro }) {
  const [email, setEmail]     = useState("");
  const [senha, setSenha]     = useState("");
  const [erro, setErro]       = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) { setErro("Preencha todos os campos"); return; }
    setErro(""); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
      onLogin();
    } catch (e) {
      setErro("E-mail ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:T.fundo, display:"flex", flexDirection:"column", maxWidth:430, margin:"0 auto" }}>
      <div style={{ background:T.fundoCard, padding:"48px 24px 24px", borderBottom:`1px solid ${T.cinzaBorda}`, textAlign:"center" }}>
        <div style={{ fontWeight:900, fontSize:26, letterSpacing:4, color:T.cinza1, marginBottom:4 }}>OBRAFÁCIL</div>
        <div style={{ fontSize:13, color:T.cinza3 }}>Entre na sua conta</div>
      </div>
      <div style={{ flex:1, padding:"32px 24px" }}>
        <div style={{ fontSize:22, fontWeight:800, color:T.cinza1, marginBottom:6 }}>Bem-vindo de volta 👷</div>
        <div style={{ fontSize:14, color:T.cinza3, marginBottom:28 }}>Entre para gerenciar suas obras</div>
        <Input label="E-mail" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" />
        <Input label="Senha" type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Sua senha" />
        {erro && <div style={{ background:T.vermelhoC, color:T.vermelho, padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>⚠️ {erro}</div>}
        <BtnPrimario onClick={handleLogin} loading={loading} disabled={!email || !senha}>Entrar →</BtnPrimario>
        <div style={{ textAlign:"center", marginTop:20, fontSize:14, color:T.cinza3 }}>
          Não tem conta? <span onClick={onIrCadastro} style={{ color:T.amarelo, fontWeight:700, cursor:"pointer" }}>Criar grátis</span>
        </div>
      </div>
    </div>
  );
}

// ─── TELA CADASTRO ─────────────────────────────────────────
function TelaCadastro({ onCadastrar, onIrLogin }) {
  const [nome, setNome]       = useState("");
  const [email, setEmail]     = useState("");
  const [telefone, setTel]    = useState("");
  const [senha, setSenha]     = useState("");
  const [perfil, setPerfil]   = useState("mestre");
  const [erro, setErro]       = useState("");
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha) { setErro("Preencha todos os campos obrigatórios"); return; }
    if (senha.length < 6) { setErro("Senha deve ter pelo menos 6 caracteres"); return; }
    setErro(""); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password: senha,
        options: { data: { nome, telefone, perfil } }
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from("profiles").insert({ id: data.user.id, nome, telefone, perfil });
      }
      onCadastrar();
    } catch (e) {
      setErro(e.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:T.fundo, display:"flex", flexDirection:"column", maxWidth:430, margin:"0 auto" }}>
      <div style={{ background:T.fundoCard, padding:"48px 24px 20px", borderBottom:`1px solid ${T.cinzaBorda}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <button onClick={onIrLogin} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:T.cinza2 }}>←</button>
          <div style={{ fontWeight:900, fontSize:20, letterSpacing:3, color:T.cinza1 }}>OBRAFÁCIL</div>
        </div>
        <div style={{ fontSize:13, color:T.cinza3 }}>Criar conta grátis</div>
      </div>
      <div style={{ flex:1, padding:"28px 24px" }}>
        <Input label="Nome completo *" value={nome} onChange={e=>setNome(e.target.value)} placeholder="João da Silva" />
        <Input label="E-mail *" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" />
        <Input label="Telefone / WhatsApp" value={telefone} onChange={e=>setTel(e.target.value)} placeholder="(11) 99999-0000" />
        <Input label="Senha *" type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />

        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:10 }}>Você é:</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              { id:"mestre",      emoji:"👑", label:"Mestre / Dono",  desc:"Gerencio obras e equipe"   },
              { id:"funcionario", emoji:"👷", label:"Funcionário",     desc:"Recebo tarefas para fazer"  },
            ].map(p => (
              <button key={p.id} onClick={() => setPerfil(p.id)} style={{
                padding:"14px 12px", border:`2px solid ${perfil===p.id ? T.amarelo : T.cinzaBorda}`,
                borderRadius:12, background: perfil===p.id ? T.amareloC : T.fundoCard,
                cursor:"pointer", textAlign:"left", transition:"all 0.2s",
              }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{p.emoji}</div>
                <div style={{ fontSize:13, fontWeight:700, color: perfil===p.id ? T.amarelo : T.cinza1 }}>{p.label}</div>
                <div style={{ fontSize:11, color:T.cinza3, marginTop:3 }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {erro && <div style={{ background:T.vermelhoC, color:T.vermelho, padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>⚠️ {erro}</div>}
        <BtnPrimario onClick={handleCadastro} loading={loading} disabled={!nome||!email||!senha}>🎉 Criar minha conta</BtnPrimario>
        <div style={{ textAlign:"center", marginTop:16, fontSize:14, color:T.cinza3 }}>
          Já tem conta? <span onClick={onIrLogin} style={{ color:T.amarelo, fontWeight:700, cursor:"pointer" }}>Entrar</span>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ usuario, nav, onObraClick }) {
  const [obras, setObras]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalNova, setModalNova] = useState(false);
  const [novaObra, setNovaObra]   = useState({ nome:"", endereco:"", fase_atual:"Fundação" });
  const [salvando, setSalvando]   = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("obras").select("*").eq("dono_id", usuario.id).order("criado_em", { ascending:false });
      setObras(data || []);
    } finally { setLoading(false); }
  }, [usuario.id]);

  useEffect(() => { carregar(); }, [carregar]);

  const criarObra = async () => {
    if (!novaObra.nome.trim()) return;
    setSalvando(true);
    try {
      await supabase.from("obras").insert({ ...novaObra, dono_id: usuario.id, status:"em_andamento", progresso:0 });
      setModalNova(false);
      setNovaObra({ nome:"", endereco:"", fase_atual:"Fundação" });
      carregar();
    } finally { setSalvando(false); }
  };

  const STATUS = {
    em_andamento: { label:"Em andamento", cor:T.verde,   fundo:T.verdeC    },
    em_dia:       { label:"Em dia",        cor:T.verde,   fundo:T.verdeC    },
    atencao:      { label:"Atenção",       cor:T.amarelo, fundo:T.amareloC  },
    atrasado:     { label:"Atrasado",      cor:T.vermelho,fundo:T.vermelhoC },
    pausada:      { label:"Pausada",       cor:T.cinza3,  fundo:"#F5F5F5"   },
    concluida:    { label:"Concluída",     cor:T.verde,   fundo:T.verdeC    },
  };

  return (
    <>
      <Header
        titulo={`Olá, ${usuario.nome?.split(" ")[0] || "Mestre"} 👷`}
        subtitulo="Boa tarde"
        acao={
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ width:34, height:34, borderRadius:17, background:T.amarelo, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, color:"#fff" }}>
              {usuario.nome?.split(" ").map(n=>n[0]).join("").slice(0,2) || "MJ"}
            </div>
          </div>
        }
      />

      <div style={{ padding:"20px 16px 100px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
          <span style={{ fontWeight:900, fontSize:20, letterSpacing:4, color:T.cinza1 }}>OBRAFÁCIL</span>
          <span style={{ background:T.amareloC, color:T.amarelo, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4 }}>BETA</span>
        </div>

        {/* STATS */}
        <div style={{ display:"flex", gap:10, marginBottom:22 }}>
          {[
            { emoji:"🏗️", valor:obras.length,      label:"Obras",   cor:T.amarelo },
            { emoji:"✅", valor:obras.filter(o=>o.status==="concluida").length, label:"Concluídas", cor:T.verde },
            { emoji:"⚠️", valor:obras.filter(o=>o.status==="atrasado").length,  label:"Atrasadas",  cor:T.vermelho },
          ].map((s,i) => (
            <div key={i} style={{ flex:1, background:T.fundoCard, borderRadius:12, padding:"12px 8px", textAlign:"center", border:`1px solid ${T.cinzaBorda}` }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{s.emoji}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.cor }}>{s.valor}</div>
              <div style={{ fontSize:9, color:T.cinza3, marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* OBRAS */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:16, fontWeight:700, color:T.cinza1 }}>🏗️ Obras ativas</span>
          <div onClick={() => setModalNova(true)} style={{ background:T.amareloC, padding:"5px 12px", borderRadius:20, fontSize:13, color:T.amarelo, fontWeight:600, cursor:"pointer" }}>+ Nova</div>
        </div>

        {loading ? <Spinner /> : obras.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 24px", color:T.cinza3 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🏗️</div>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Nenhuma obra ainda</div>
            <div style={{ fontSize:14, marginBottom:20 }}>Crie sua primeira obra agora!</div>
            <button onClick={() => setModalNova(true)} style={{ padding:"12px 24px", background:T.amarelo, border:"none", borderRadius:12, color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer" }}>
              + Criar primeira obra
            </button>
          </div>
        ) : obras.map(obra => {
          const st = STATUS[obra.status] || STATUS.em_andamento;
          return (
            <div key={obra.id} onClick={() => onObraClick(obra)}
              style={{ background:T.fundoCard, borderRadius:14, marginBottom:14, overflow:"hidden", border:`1px solid ${T.cinzaBorda}`, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor=T.amarelo+"60"}
              onMouseLeave={e => e.currentTarget.style.borderColor=T.cinzaBorda}
            >
              <div style={{ height:4, background:st.cor }} />
              <div style={{ padding:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:16, fontWeight:700, color:T.cinza1, marginBottom:2 }}>{obra.nome}</div>
                    <div style={{ fontSize:12, color:T.cinza3 }}>Fase: {obra.fase_atual || "—"}</div>
                  </div>
                  <Badge label={st.label} cor={st.cor} fundo={st.fundo} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:12, color:T.cinza3 }}>Progresso</span>
                  <span style={{ fontSize:12, fontWeight:700, color:st.cor }}>{obra.progresso || 0}%</span>
                </div>
                <ProgBar valor={obra.progresso || 0} cor={st.cor} />
                <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12, paddingTop:10, borderTop:`1px solid ${T.cinzaBorda}` }}>
                  <span style={{ fontSize:12, color:T.amarelo, fontWeight:600 }}>Ver detalhes →</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* ATALHOS */}
        <div style={{ fontSize:16, fontWeight:700, color:T.cinza1, margin:"20px 0 12px" }}>🔧 Atalhos</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {[
            { emoji:"✅", label:"Tarefas",    id:"tarefas",   cor:T.verde   },
            { emoji:"💰", label:"Orçamentos", id:"orcamento", cor:T.amarelo },
            { emoji:"📦", label:"Estoque",    id:"estoque",   cor:T.laranja },
          ].map((a,i) => (
            <div key={i} onClick={() => nav(a.id)} style={{ background:T.fundoCard, borderRadius:12, padding:14, textAlign:"center", border:`1px solid ${T.cinzaBorda}`, cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor=a.cor}
              onMouseLeave={e => e.currentTarget.style.borderColor=T.cinzaBorda}
            >
              <div style={{ width:44, height:44, borderRadius:12, background:a.cor+"15", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px", fontSize:22 }}>{a.emoji}</div>
              <div style={{ fontSize:12, fontWeight:600, color:T.cinza2 }}>{a.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL NOVA OBRA */}
      {modalNova && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:T.fundoCard, borderRadius:"20px 20px 0 0", padding:"24px 20px 40px", width:"100%", maxWidth:430 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontSize:17, fontWeight:700, color:T.cinza1 }}>Nova Obra</div>
              <button onClick={() => setModalNova(false)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:T.cinza3 }}>✕</button>
            </div>
            <Input label="Nome da obra *" value={novaObra.nome} onChange={e=>setNovaObra(p=>({...p,nome:e.target.value}))} placeholder="Ex: Residência Silva" />
            <Input label="Endereço" value={novaObra.endereco} onChange={e=>setNovaObra(p=>({...p,endereco:e.target.value}))} placeholder="Rua, número, bairro" />
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:6 }}>Fase atual</div>
              <select value={novaObra.fase_atual} onChange={e=>setNovaObra(p=>({...p,fase_atual:e.target.value}))}
                style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${T.cinzaBorda}`, fontSize:14, color:T.cinza1, background:T.fundoCard }}>
                {["Fundação","Estrutura","Alvenaria","Cobertura","Instalações","Acabamento","Entrega"].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <BtnPrimario onClick={criarObra} loading={salvando} disabled={!novaObra.nome.trim()}>
              🏗️ Criar obra
            </BtnPrimario>
          </div>
        </div>
      )}
    </>
  );
}

// ─── DETALHE OBRA ──────────────────────────────────────────
function DetalheObra({ obra, usuario, onVoltar }) {
  const [tarefas, setTarefas]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalTarefa, setModalTarefa] = useState(false);
  const [novaTarefa, setNovaTarefa]   = useState({ titulo:"", instrucoes:"", prioridade:"normal" });
  const [salvando, setSalvando]       = useState(false);
  const [progresso, setProgresso]     = useState(obra.progresso || 0);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("tarefas").select("*").eq("obra_id", obra.id).order("criado_em", { ascending:true });
      setTarefas(data || []);
      const total = data?.length || 0;
      const conc  = data?.filter(t=>t.status==="concluida").length || 0;
      const pct   = total > 0 ? Math.round((conc/total)*100) : 0;
      setProgresso(pct);
      await supabase.from("obras").update({ progresso:pct }).eq("id", obra.id);
    } finally { setLoading(false); }
  }, [obra.id]);

  useEffect(() => { carregar(); }, [carregar]);

  const criarTarefa = async () => {
    if (!novaTarefa.titulo.trim()) return;
    setSalvando(true);
    try {
      await supabase.from("tarefas").insert({ ...novaTarefa, obra_id: obra.id, status:"pendente", criado_por: usuario.id });
      setModalTarefa(false);
      setNovaTarefa({ titulo:"", instrucoes:"", prioridade:"normal" });
      carregar();
    } finally { setSalvando(false); }
  };

  const toggleTarefa = async (tarefa) => {
    const novoStatus = tarefa.status === "concluida" ? "pendente" : "concluida";
    await supabase.from("tarefas").update({ status: novoStatus }).eq("id", tarefa.id);
    carregar();
  };

  const ST = { pendente:{ cor:T.cinza3, fundo:"#F0F0F0" }, em_andamento:{ cor:T.amarelo, fundo:T.amareloC }, concluida:{ cor:T.verde, fundo:T.verdeC } };
  const conc = tarefas.filter(t=>t.status==="concluida").length;

  return (
    <>
      <Header titulo={obra.nome} subtitulo="← Obras" onVoltar={onVoltar}
        acao={<span style={{ background:T.amareloC, color:T.amarelo, fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20 }}>{obra.fase_atual}</span>}
      />
      <div style={{ padding:"16px 16px 100px" }}>

        {/* Progresso */}
        <div style={{ background:T.fundoCard, borderRadius:14, padding:16, marginBottom:16, border:`1px solid ${T.cinzaBorda}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:600, color:T.cinza2 }}>Progresso geral</span>
            <span style={{ fontSize:13, fontWeight:700, color:T.verde }}>{conc}/{tarefas.length} tarefas</span>
          </div>
          <ProgBar valor={progresso} cor={T.verde} />
          <div style={{ fontSize:22, fontWeight:900, color:T.amarelo, marginTop:10 }}>{progresso}%</div>
        </div>

        {/* Tarefas */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:16, fontWeight:700, color:T.cinza1 }}>✅ Tarefas</span>
          <div onClick={() => setModalTarefa(true)} style={{ background:T.amareloC, padding:"5px 12px", borderRadius:20, fontSize:13, color:T.amarelo, fontWeight:600, cursor:"pointer" }}>+ Nova</div>
        </div>

        {loading ? <Spinner /> : tarefas.length === 0 ? (
          <div style={{ textAlign:"center", padding:"32px 0", color:T.cinza3 }}>
            <div style={{ fontSize:36, marginBottom:8 }}>📋</div>
            <div style={{ fontSize:14 }}>Nenhuma tarefa ainda</div>
          </div>
        ) : tarefas.map(t => {
          const st = ST[t.status] || ST.pendente;
          return (
            <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, background:T.fundoCard, borderRadius:12, padding:"12px 14px", marginBottom:8, border:`1px solid ${t.prioridade==="urgente" ? T.vermelho+"40" : T.cinzaBorda}` }}>
              {t.prioridade==="urgente" && <div style={{ position:"absolute", height:3, background:T.vermelho }} />}
              <div onClick={() => toggleTarefa(t)} style={{ width:22, height:22, borderRadius:6, flexShrink:0, border:`2px solid ${t.status==="concluida" ? T.verde : T.cinzaBorda}`, background: t.status==="concluida" ? T.verde : "transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                {t.status==="concluida" && <span style={{ color:"#fff", fontSize:12 }}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color: t.status==="concluida" ? T.cinza3 : T.cinza1, textDecoration: t.status==="concluida" ? "line-through" : "none" }}>{t.titulo}</div>
                {t.instrucoes && <div style={{ fontSize:11, color:T.cinza3, marginTop:2 }}>{t.instrucoes.slice(0,60)}...</div>}
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                <Badge label={t.status==="concluida" ? "Concluída" : t.status==="em_andamento" ? "Andamento" : "Pendente"} cor={st.cor} fundo={st.fundo} />
                {t.prioridade==="urgente" && <span style={{ fontSize:10, color:T.vermelho, fontWeight:700 }}>🔴 Urgente</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL NOVA TAREFA */}
      {modalTarefa && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:T.fundoCard, borderRadius:"20px 20px 0 0", padding:"24px 20px 40px", width:"100%", maxWidth:430 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontSize:17, fontWeight:700, color:T.cinza1 }}>Nova Tarefa</div>
              <button onClick={() => setModalTarefa(false)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:T.cinza3 }}>✕</button>
            </div>
            <Input label="Título *" value={novaTarefa.titulo} onChange={e=>setNovaTarefa(p=>({...p,titulo:e.target.value}))} placeholder="Ex: Assentar tijolos bloco A" />
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:6 }}>Instruções (passo a passo)</div>
              <textarea value={novaTarefa.instrucoes} onChange={e=>setNovaTarefa(p=>({...p,instrucoes:e.target.value}))}
                placeholder="1. Faça isso&#10;2. Depois isso..."
                style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${T.cinzaBorda}`, fontSize:13, color:T.cinza1, outline:"none", fontFamily:"inherit", boxSizing:"border-box", resize:"none", height:90 }} />
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:8 }}>Prioridade</div>
              <div style={{ display:"flex", gap:10 }}>
                {["normal","urgente"].map(p => (
                  <button key={p} onClick={() => setNovaTarefa(prev=>({...prev,prioridade:p}))} style={{
                    flex:1, padding:"9px", border:`1.5px solid ${novaTarefa.prioridade===p ? (p==="urgente" ? T.vermelho : T.verde) : T.cinzaBorda}`,
                    borderRadius:10, background: novaTarefa.prioridade===p ? (p==="urgente" ? T.vermelhoC : T.verdeC) : T.fundoCard,
                    color: novaTarefa.prioridade===p ? (p==="urgente" ? T.vermelho : T.verde) : T.cinza3,
                    fontWeight:600, fontSize:13, cursor:"pointer",
                  }}>
                    {p==="urgente" ? "🔴 Urgente" : "🟢 Normal"}
                  </button>
                ))}
              </div>
            </div>
            <BtnPrimario onClick={criarTarefa} loading={salvando} disabled={!novaTarefa.titulo.trim()}>Adicionar tarefa</BtnPrimario>
          </div>
        </div>
      )}
    </>
  );
}

// ─── PERFIL ────────────────────────────────────────────────
function Perfil({ usuario, onLogout }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <>
      <Header titulo="Perfil" subtitulo="👤 Conta" />
      <div style={{ padding:"16px 16px 100px" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:72, height:72, borderRadius:36, background:T.amarelo, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:26, fontWeight:700, color:"#fff" }}>
            {usuario.nome?.split(" ").map(n=>n[0]).join("").slice(0,2) || "MJ"}
          </div>
          <div style={{ fontSize:20, fontWeight:800, color:T.cinza1 }}>{usuario.nome}</div>
          <div style={{ fontSize:13, color:T.cinza3, marginTop:3 }}>{usuario.email}</div>
          <div style={{ display:"inline-block", marginTop:8, background:T.amareloC, color:T.amarelo, fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20 }}>
            {usuario.perfil === "mestre" ? "👑 Mestre" : "👷 Funcionário"}
          </div>
        </div>

        {[
          { emoji:"👤", label:"Editar perfil"   },
          { emoji:"🔔", label:"Notificações"    },
          { emoji:"🔒", label:"Alterar senha"   },
          { emoji:"💰", label:"Planos e preços" },
          { emoji:"❓", label:"Central de ajuda"},
        ].map((item,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:14, background:T.fundoCard, borderRadius:12, padding:"14px 16px", marginBottom:8, border:`1px solid ${T.cinzaBorda}`, cursor:"pointer" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=T.amarelo+"60"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=T.cinzaBorda}
          >
            <span style={{ fontSize:20 }}>{item.emoji}</span>
            <span style={{ flex:1, fontSize:14, fontWeight:500, color:T.cinza1 }}>{item.label}</span>
            <span style={{ color:T.cinza3 }}>›</span>
          </div>
        ))}

        <div onClick={handleLogout} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:T.vermelhoC, borderRadius:12, padding:"14px", marginTop:8, cursor:"pointer" }}>
          <span style={{ fontSize:20 }}>🚪</span>
          <span style={{ fontSize:14, fontWeight:700, color:T.vermelho }}>Sair da conta</span>
        </div>
      </div>
    </>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────
export default function App() {
  const [tela, setTela]           = useState("splash");
  const [aba, setAba]             = useState("dashboard");
  const [usuario, setUsuario]     = useState(null);
  const [obraSel, setObraSel]     = useState(null);
  const [checandoAuth, setChecando] = useState(true);

  useEffect(() => {
    // Verifica se já tem sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        carregarPerfil(session.user);
      } else {
        setChecando(false);
        setTela("splash");
      }
    });

    // Ouve mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        carregarPerfil(session.user);
      } else {
        setUsuario(null);
        setTela("splash");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const carregarPerfil = async (user) => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setUsuario({ ...user, ...data, email: user.email });
      setTela("app");
    } catch {
      setUsuario({ ...user, nome: user.email, perfil:"mestre" });
      setTela("app");
    } finally {
      setChecando(false);
    }
  };

  if (checandoAuth) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:T.fundo, fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🏗️</div>
          <div style={{ fontWeight:900, fontSize:24, letterSpacing:4, color:T.cinza1, marginBottom:16 }}>OBRAFÁCIL</div>
          <Spinner />
        </div>
      </div>
    );
  }

  // SPLASH
  if (tela === "splash") {
    return (
      <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", maxWidth:430, margin:"0 auto", minHeight:"100vh", background:`linear-gradient(160deg,#1A1A1A 0%,#2D2008 100%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 32px", textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:16 }}>🏗️</div>
        <div style={{ fontWeight:900, fontSize:34, letterSpacing:6, color:T.amarelo, marginBottom:4 }}>OBRAFÁCIL</div>
        <div style={{ fontSize:13, color:"#666", letterSpacing:2, marginBottom:40 }}>CONTROLE DE OBRAS</div>
        {[
          { emoji:"✅", texto:"Checklist de tarefas para sua equipe" },
          { emoji:"💰", texto:"Orçamentos profissionais em minutos"  },
          { emoji:"📦", texto:"Alertas de estoque antes de faltar"    },
        ].map((item,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:14, background:"rgba(255,255,255,0.05)", borderRadius:12, padding:"12px 16px", marginBottom:10, width:"100%", border:"1px solid rgba(255,255,255,0.08)", textAlign:"left" }}>
            <span style={{ fontSize:20 }}>{item.emoji}</span>
            <span style={{ fontSize:14, color:"#CCC", fontWeight:500 }}>{item.texto}</span>
          </div>
        ))}
        <div style={{ width:"100%", marginTop:20 }}>
          <button onClick={() => setTela("cadastro")} style={{ width:"100%", padding:"15px", border:"none", borderRadius:12, background:T.amarelo, color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", marginBottom:12, boxShadow:"0 4px 20px rgba(199,119,0,0.4)" }}>
            🚀 Criar conta grátis
          </button>
          <button onClick={() => setTela("login")} style={{ width:"100%", padding:"15px", border:"1.5px solid rgba(255,255,255,0.2)", borderRadius:12, background:"transparent", color:"#DDD", fontSize:16, fontWeight:600, cursor:"pointer" }}>
            Já tenho conta — Entrar
          </button>
        </div>
      </div>
    );
  }

  if (tela === "login")    return <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif" }}><TelaLogin onLogin={() => {}} onIrCadastro={() => setTela("cadastro")} /></div>;
  if (tela === "cadastro") return <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif" }}><TelaCadastro onCadastrar={() => {}} onIrLogin={() => setTela("login")} /></div>;

  // APP PRINCIPAL
  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", maxWidth:430, margin:"0 auto", minHeight:"100vh", background:T.fundo, display:"flex", flexDirection:"column" }}>
      <div style={{ flex:1, overflowY:"auto" }}>
        {obraSel ? (
          <DetalheObra obra={obraSel} usuario={usuario} onVoltar={() => setObraSel(null)} />
        ) : (
          <>
            {aba==="dashboard" && <Dashboard usuario={usuario} nav={setAba} onObraClick={setObraSel} />}
            {aba==="tarefas"   && <div style={{ padding:"80px 20px", textAlign:"center", color:T.cinza3 }}><div style={{ fontSize:40, marginBottom:12 }}>✅</div><div style={{ fontSize:16, fontWeight:700 }}>Tarefas</div><div style={{ fontSize:13, marginTop:8 }}>Selecione uma obra no Dashboard para ver as tarefas</div></div>}
            {aba==="orcamento" && <div style={{ padding:"80px 20px", textAlign:"center", color:T.cinza3 }}><div style={{ fontSize:40, marginBottom:12 }}>💰</div><div style={{ fontSize:16, fontWeight:700 }}>Orçamentos</div><div style={{ fontSize:13, marginTop:8 }}>Em breve</div></div>}
            {aba==="estoque"   && <div style={{ padding:"80px 20px", textAlign:"center", color:T.cinza3 }}><div style={{ fontSize:40, marginBottom:12 }}>📦</div><div style={{ fontSize:16, fontWeight:700 }}>Estoque</div><div style={{ fontSize:13, marginTop:8 }}>Em breve</div></div>}
            {aba==="perfil"    && <Perfil usuario={usuario} onLogout={() => setTela("splash")} />}
          </>
        )}
      </div>
      {!obraSel && <BottomNav aba={aba} setAba={setAba} />}
    </div>
  );
}
