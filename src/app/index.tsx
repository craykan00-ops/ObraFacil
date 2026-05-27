import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";

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
      <div style={{ height:"100%", width:`${Math.min(valor,100)}%`, background:cor, borderRadius:3, transition:"width 0.6s" }} />
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
        {isSenha && <button type="button" onClick={() => setMostrar(p=>!p)} style={{ background:"none", border:"none", padding:"0 14px", cursor:"pointer", fontSize:16, color:T.cinza3 }}>{mostrar ? "🙈" : "👁️"}</button>}
      </div>
      {erro && <div style={{ fontSize:12, color:T.vermelho, marginTop:5 }}>⚠️ {erro}</div>}
    </div>
  );
}

function Btn({ children, onClick, loading, disabled, cor=T.amarelo, ghost=false, style={} }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width:"100%", padding:"13px", border: ghost ? `1.5px solid ${cor}` : "none", borderRadius:12,
      background: ghost ? "transparent" : (disabled || loading ? T.cinzaBorda : cor),
      color: ghost ? cor : "#fff", fontSize:15, fontWeight:700,
      cursor: disabled || loading ? "default" : "pointer",
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
          {onVoltar && <button onClick={onVoltar} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:T.cinza2 }}>←</button>}
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

function BottomNav({ aba, setAba }) {
  return (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:T.fundoCard, borderTop:`1px solid ${T.cinzaBorda}`, display:"flex", padding:"10px 0 16px", boxShadow:"0 -4px 16px rgba(0,0,0,0.07)", zIndex:20 }}>
      {[
        { id:"dashboard", emoji:"🏠", label:"Início"    },
        { id:"tarefas",   emoji:"✅", label:"Tarefas"   },
        { id:"cronograma", emoji:"📅", label:"Cronograma" },
        { id:"estoque",   emoji:"📦", label:"Estoque"   },
        { id:"perfil",    emoji:"👤", label:"Perfil"    },
      ].map(item => (
        <div key={item.id} onClick={() => setAba(item.id)} style={{ flex:1, textAlign:"center", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <span style={{ fontSize:21 }}>{item.emoji}</span>
          <span style={{ fontSize:10, fontWeight: aba===item.id ? 700 : 500, color: aba===item.id ? T.amarelo : T.cinza3 }}>{item.label}</span>
          {aba===item.id && <div style={{ width:4, height:4, borderRadius:2, background:T.amarelo }} />}
        </div>
      ))}
    </div>
  );
}

function Modal({ titulo, onFechar, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div style={{ background:T.fundoCard, borderRadius:"20px 20px 0 0", padding:"24px 20px 40px", width:"100%", maxWidth:430, maxHeight:"85vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ fontSize:17, fontWeight:700, color:T.cinza1 }}>{titulo}</div>
          <button onClick={onFechar} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:T.cinza3 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function moeda(v) { return "R$ " + Number(v||0).toLocaleString("pt-BR", { minimumFractionDigits:2 }); }

// ─── AUTH ──────────────────────────────────────────────────
function TelaAuth({ onLogin }) {
  const [tela, setTela]   = useState("splash");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome]   = useState("");
  const [tel, setTel]     = useState("");
  const [perfil, setPerfil] = useState("mestre");
  const [erro, setErro]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState("");

  const handleLogin = async () => {
    setErro(""); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
    } catch (e) { setErro("E-mail ou senha incorretos"); }
    finally { setLoading(false); }
  };

  const handleCadastro = async () => {
    if (!nome || !email || !senha) { setErro("Preencha todos os campos"); return; }
    if (senha.length < 6) { setErro("Senha mínimo 6 caracteres"); return; }
    setErro(""); setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password: senha,
        options: { data: { nome, telefone: tel, perfil } }
      });
      if (error) throw error;
      setSucesso("Conta criada! Verifique seu e-mail para confirmar.");
    } catch (e) { setErro(e.message || "Erro ao criar conta"); }
    finally { setLoading(false); }
  };

  if (tela === "splash") return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,#1A1A1A 0%,#2D2008 100%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 32px", textAlign:"center", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ fontSize:52, marginBottom:16 }}>🏗️</div>
      <div style={{ fontWeight:900, fontSize:34, letterSpacing:6, color:T.amarelo, marginBottom:4 }}>OBRAFÁCIL</div>
      <div style={{ fontSize:13, color:"#666", letterSpacing:2, marginBottom:40 }}>CONTROLE DE OBRAS</div>
      {[{ emoji:"✅", texto:"Checklist de tarefas para sua equipe" },{ emoji:"💰", texto:"Orçamentos profissionais em minutos" },{ emoji:"📦", texto:"Alertas de estoque antes de faltar" }].map((item,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:14, background:"rgba(255,255,255,0.05)", borderRadius:12, padding:"12px 16px", marginBottom:10, width:"100%", border:"1px solid rgba(255,255,255,0.08)", textAlign:"left" }}>
          <span style={{ fontSize:20 }}>{item.emoji}</span>
          <span style={{ fontSize:14, color:"#CCC", fontWeight:500 }}>{item.texto}</span>
        </div>
      ))}
      <div style={{ width:"100%", marginTop:20 }}>
        <button onClick={() => setTela("cadastro")} style={{ width:"100%", padding:"15px", border:"none", borderRadius:12, background:T.amarelo, color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", marginBottom:12, boxShadow:"0 4px 20px rgba(199,119,0,0.4)" }}>🚀 Criar conta grátis</button>
        <button onClick={() => setTela("login")} style={{ width:"100%", padding:"15px", border:"1.5px solid rgba(255,255,255,0.2)", borderRadius:12, background:"transparent", color:"#DDD", fontSize:16, fontWeight:600, cursor:"pointer" }}>Já tenho conta — Entrar</button>
      </div>
    </div>
  );

  if (tela === "login") return (
    <div style={{ minHeight:"100vh", background:T.fundo, fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background:T.fundoCard, padding:"48px 24px 24px", borderBottom:`1px solid ${T.cinzaBorda}`, textAlign:"center" }}>
        <div style={{ fontWeight:900, fontSize:26, letterSpacing:4, color:T.cinza1, marginBottom:4 }}>OBRAFÁCIL</div>
        <div style={{ fontSize:13, color:T.cinza3 }}>Entre na sua conta</div>
      </div>
      <div style={{ padding:"32px 24px" }}>
        <div style={{ fontSize:22, fontWeight:800, color:T.cinza1, marginBottom:6 }}>Bem-vindo de volta 👷</div>
        <div style={{ fontSize:14, color:T.cinza3, marginBottom:28 }}>Entre para gerenciar suas obras</div>
        <Input label="E-mail" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" />
        <Input label="Senha" type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Sua senha" />
        {erro && <div style={{ background:T.vermelhoC, color:T.vermelho, padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>⚠️ {erro}</div>}
        <Btn onClick={handleLogin} loading={loading} disabled={!email||!senha}>Entrar →</Btn>
        <div style={{ textAlign:"center", marginTop:16, fontSize:14, color:T.cinza3 }}>
          Não tem conta? <span onClick={() => setTela("cadastro")} style={{ color:T.amarelo, fontWeight:700, cursor:"pointer" }}>Criar grátis</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:T.fundo, fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background:T.fundoCard, padding:"48px 24px 20px", borderBottom:`1px solid ${T.cinzaBorda}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => setTela("splash")} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:T.cinza2 }}>←</button>
          <div style={{ fontWeight:900, fontSize:20, letterSpacing:3, color:T.cinza1 }}>Criar conta grátis</div>
        </div>
      </div>
      <div style={{ padding:"28px 24px" }}>
        {sucesso ? (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ fontSize:52, marginBottom:16 }}>📧</div>
            <div style={{ fontSize:20, fontWeight:800, color:T.verde, marginBottom:8 }}>Verifique seu e-mail!</div>
            <div style={{ fontSize:14, color:T.cinza3, marginBottom:24 }}>{sucesso}</div>
            <Btn onClick={() => setTela("login")}>Ir para o login</Btn>
          </div>
        ) : (
          <>
            <Input label="Nome completo *" value={nome} onChange={e=>setNome(e.target.value)} placeholder="João da Silva" />
            <Input label="E-mail *" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" />
            <Input label="Telefone" value={tel} onChange={e=>setTel(e.target.value)} placeholder="(11) 99999-0000" />
            <Input label="Senha *" type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:10 }}>Você é:</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[{ id:"mestre", emoji:"👑", label:"Mestre / Dono" },{ id:"funcionario", emoji:"👷", label:"Funcionário" }].map(p => (
                  <button key={p.id} onClick={() => setPerfil(p.id)} style={{ padding:"14px 12px", border:`2px solid ${perfil===p.id ? T.amarelo : T.cinzaBorda}`, borderRadius:12, background: perfil===p.id ? T.amareloC : T.fundoCard, cursor:"pointer" }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{p.emoji}</div>
                    <div style={{ fontSize:13, fontWeight:700, color: perfil===p.id ? T.amarelo : T.cinza1 }}>{p.label}</div>
                  </button>
                ))}
              </div>
            </div>
            {erro && <div style={{ background:T.vermelhoC, color:T.vermelho, padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>⚠️ {erro}</div>}
            <Btn onClick={handleCadastro} loading={loading} disabled={!nome||!email||!senha}>🎉 Criar minha conta</Btn>
            <div style={{ textAlign:"center", marginTop:16, fontSize:14, color:T.cinza3 }}>
              Já tem conta? <span onClick={() => setTela("login")} style={{ color:T.amarelo, fontWeight:700, cursor:"pointer" }}>Entrar</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────
const LIMITES: Record<string, number> = { gratis: 1, autonomo: 3, mestre: Infinity };

function Dashboard({ usuario, nav, onObraClick }) {
  const [obras, setObras]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [modalUpgrade, setModalUpgrade] = useState(false);
  const [nova, setNova]       = useState({ nome:"", endereco:"", fase_atual:"Fundação" });
  const [salvando, setSalvando] = useState(false);
  const ehFunc = usuario.perfil === "funcionario";

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      if (ehFunc) {
        const { data: vincs } = await supabase.from("obra_funcionarios").select("obra_id").eq("funcionario_id", usuario.id);
        const ids = (vincs || []).map((v: any) => v.obra_id);
        if (ids.length === 0) { setObras([]); return; }
        const { data } = await supabase.from("obras").select("*").in("id", ids).order("criado_em", { ascending:false });
        setObras(data || []);
      } else {
        const [{ data: proprias }, { data: vincs }] = await Promise.all([
          supabase.from("obras").select("*").eq("dono_id", usuario.id),
          supabase.from("obra_funcionarios").select("obra_id").eq("funcionario_id", usuario.id),
        ]);
        const idsConvite = (vincs || []).map((v: any) => v.obra_id);
        let convidadas: any[] = [];
        if (idsConvite.length > 0) {
          const { data } = await supabase.from("obras").select("*").in("id", idsConvite);
          convidadas = data || [];
        }
        const todas = [...(proprias || []), ...convidadas]
          .filter((o, i, arr) => arr.findIndex(x => x.id === o.id) === i)
          .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
        setObras(todas);
      }
    } finally { setLoading(false); }
  }, [usuario.id, ehFunc]);

  useEffect(() => { carregar(); }, [carregar]);

  const tentarCriar = () => {
    const plano = usuario.plano || "gratis";
    const limite = LIMITES[plano] ?? 1;
    if (obras.length >= limite) { setModalUpgrade(true); } else { setModal(true); }
  };

  const criar = async () => {
    if (!nova.nome.trim()) return;
    setSalvando(true);
    try {
      const { error } = await supabase.from("obras").insert({ ...nova, dono_id: usuario.id, status:"em_andamento", progresso:0 });
      if (error) throw error;
      setModal(false); setNova({ nome:"", endereco:"", fase_atual:"Fundação" }); carregar();
    } catch (e: any) {
      alert("Erro ao criar obra: " + (e?.message || "tente novamente"));
    } finally { setSalvando(false); }
  };

  const ST = { em_andamento:{ label:"Em andamento", cor:T.verde, fundo:T.verdeC }, atencao:{ label:"Atenção", cor:T.amarelo, fundo:T.amareloC }, atrasado:{ label:"Atrasado", cor:T.vermelho, fundo:T.vermelhoC }, pausada:{ label:"Pausada", cor:T.cinza3, fundo:"#F5F5F5" }, concluida:{ label:"Concluída", cor:T.verde, fundo:T.verdeC } };

  return (
    <>
      <Header titulo={`Olá, ${usuario.nome?.split(" ")[0] || "Mestre"} 👷`} subtitulo="Boa tarde"
        acao={<div style={{ width:34, height:34, borderRadius:17, background:T.amarelo, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, color:"#fff" }}>{usuario.nome?.split(" ").map(n=>n[0]).join("").slice(0,2)||"MJ"}</div>}
      />
      <div style={{ padding:"20px 16px 100px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
          <span style={{ fontWeight:900, fontSize:20, letterSpacing:4, color:T.cinza1 }}>OBRAFÁCIL</span>
          <span style={{ background:T.amareloC, color:T.amarelo, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4 }}>BETA</span>
        </div>
        <div style={{ display:"flex", gap:10, marginBottom:22 }}>
          {[{ emoji:"🏗️", v:obras.length, l:"Obras", c:T.amarelo },{ emoji:"✅", v:obras.filter(o=>o.status==="concluida").length, l:"Concluídas", c:T.verde },{ emoji:"⚠️", v:obras.filter(o=>o.status==="atrasado").length, l:"Atrasadas", c:T.vermelho }].map((s,i) => (
            <div key={i} style={{ flex:1, background:T.fundoCard, borderRadius:12, padding:"12px 8px", textAlign:"center", border:`1px solid ${T.cinzaBorda}` }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{s.emoji}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:9, color:T.cinza3, marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:16, fontWeight:700, color:T.cinza1 }}>🏗️ Obras ativas</span>
          {!ehFunc && <div onClick={tentarCriar} style={{ background:T.amareloC, padding:"5px 12px", borderRadius:20, fontSize:13, color:T.amarelo, fontWeight:600, cursor:"pointer" }}>+ Nova</div>}
        </div>
        {loading ? <Spinner /> : obras.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 24px", color:T.cinza3 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🏗️</div>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{ehFunc ? "Você não está em nenhuma obra ainda" : "Nenhuma obra ainda"}</div>
            {!ehFunc && <button onClick={tentarCriar} style={{ padding:"12px 24px", background:T.amarelo, border:"none", borderRadius:12, color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer" }}>+ Criar primeira obra</button>}
          </div>
        ) : obras.map(obra => {
          const st = ST[obra.status] || ST.em_andamento;
          return (
            <div key={obra.id} onClick={() => onObraClick(obra)} style={{ background:T.fundoCard, borderRadius:14, marginBottom:14, overflow:"hidden", border:`1px solid ${T.cinzaBorda}`, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", cursor:"pointer" }}
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
                  <span style={{ fontSize:12, fontWeight:700, color:st.cor }}>{obra.progresso||0}%</span>
                </div>
                <ProgBar valor={obra.progresso||0} cor={st.cor} />
                <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12, paddingTop:10, borderTop:`1px solid ${T.cinzaBorda}` }}>
                  <span style={{ fontSize:12, color:T.amarelo, fontWeight:600 }}>Ver detalhes →</span>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ fontSize:16, fontWeight:700, color:T.cinza1, margin:"20px 0 12px" }}>🔧 Atalhos</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {[{ emoji:"✅", label:"Tarefas", id:"tarefas", cor:T.verde },{ emoji:"💰", label:"Orçamentos", id:"orcamento", cor:T.amarelo },{ emoji:"📦", label:"Estoque", id:"estoque", cor:T.laranja }].map((a,i) => (
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
      {modal && (
        <Modal titulo="Nova Obra" onFechar={() => setModal(false)}>
          <Input label="Nome da obra *" value={nova.nome} onChange={e=>setNova(p=>({...p,nome:e.target.value}))} placeholder="Ex: Residência Silva" />
          <Input label="Endereço" value={nova.endereco} onChange={e=>setNova(p=>({...p,endereco:e.target.value}))} placeholder="Rua, número, bairro" />
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:6 }}>Fase atual</div>
            <select value={nova.fase_atual} onChange={e=>setNova(p=>({...p,fase_atual:e.target.value}))} style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${T.cinzaBorda}`, fontSize:14, color:T.cinza1, background:T.fundoCard }}>
              {["Fundação","Estrutura","Alvenaria","Cobertura","Instalações","Acabamento","Entrega"].map(f=><option key={f}>{f}</option>)}
            </select>
          </div>
          <Btn onClick={criar} loading={salvando} disabled={!nova.nome.trim()}>🏗️ Criar obra</Btn>
        </Modal>
      )}
      {modalUpgrade && (
        <Modal titulo="Limite atingido 🚧" onFechar={() => setModalUpgrade(false)}>
          <div style={{ textAlign:"center", padding:"8px 0 16px" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🚧</div>
            <div style={{ fontSize:15, fontWeight:700, color:T.cinza1, marginBottom:8 }}>
              Limite do plano {(usuario.plano||"gratis").charAt(0).toUpperCase()+(usuario.plano||"gratis").slice(1)} atingido
            </div>
            <div style={{ fontSize:13, color:T.cinza3, marginBottom:24, lineHeight:1.6 }}>
              {usuario.plano === "autonomo" ? "Faça upgrade para o plano Mestre e crie obras ilimitadas." : "Faça upgrade e desbloqueie mais obras e recursos exclusivos."}
            </div>
            <Btn onClick={() => { setModalUpgrade(false); nav("perfil"); }}>🚀 Ver planos de upgrade</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── TAREFAS ───────────────────────────────────────────────
function Tarefas({ usuario, onVoltar }) {
  const [obras, setObras]     = useState([]);
  const [obraSel, setObraSel] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [nova, setNova]       = useState({ titulo:"", instrucoes:"", prioridade:"normal" });
  const [salvando, setSalvando] = useState(false);
  const ehFunc = usuario.perfil === "funcionario";

  useEffect(() => {
    if (ehFunc) {
      supabase.from("obra_funcionarios").select("obra_id").eq("funcionario_id", usuario.id).then(({ data: vincs }) => {
        const ids = (vincs || []).map((v: any) => v.obra_id);
        if (ids.length === 0) { setObras([]); return; }
        supabase.from("obras").select("*").in("id", ids).then(({ data }) => {
          setObras(data || []);
          if (data?.length > 0) setObraSel(data[0].id);
        });
      });
    } else {
      Promise.all([
        supabase.from("obras").select("*").eq("dono_id", usuario.id),
        supabase.from("obra_funcionarios").select("obra_id").eq("funcionario_id", usuario.id),
      ]).then(async ([{ data: proprias }, { data: vincs }]) => {
        const ids = (vincs || []).map((v: any) => v.obra_id);
        let convidadas: any[] = [];
        if (ids.length > 0) {
          const { data } = await supabase.from("obras").select("*").in("id", ids);
          convidadas = data || [];
        }
        const todas = [...(proprias || []), ...convidadas]
          .filter((o, i, arr) => arr.findIndex(x => x.id === o.id) === i);
        setObras(todas);
        if (todas.length > 0) setObraSel(todas[0].id);
      });
    }
  }, [usuario.id, ehFunc]);

  const carregarTarefas = useCallback(async () => {
    if (!obraSel) return;
    setLoading(true);
    try {
      let query = supabase.from("tarefas").select("*").eq("obra_id", obraSel).order("criado_em", { ascending:true });
      if (ehFunc) query = (query as any).eq("responsavel_id", usuario.id);
      const { data } = await query;
      setTarefas(data || []);
      const total = data?.length || 0;
      const conc  = data?.filter(t=>t.status==="concluida").length || 0;
      if (total > 0) await supabase.from("obras").update({ progresso: Math.round((conc/total)*100) }).eq("id", obraSel);
    } finally { setLoading(false); }
  }, [obraSel, usuario.id, ehFunc]);

  useEffect(() => { carregarTarefas(); }, [carregarTarefas]);

  const criar = async () => {
    if (!nova.titulo.trim()) return;
    setSalvando(true);
    try {
      await supabase.from("tarefas").insert({ ...nova, obra_id: obraSel, status:"pendente", criado_por: usuario.id });
      setModal(false); setNova({ titulo:"", instrucoes:"", prioridade:"normal" }); carregarTarefas();
    } finally { setSalvando(false); }
  };

  const toggle = async (t) => {
    await supabase.from("tarefas").update({ status: t.status==="concluida" ? "pendente" : "concluida" }).eq("id", t.id);
    carregarTarefas();
  };

  const ST = { pendente:{ label:"Pendente", cor:T.cinza3, fundo:"#F0F0F0" }, em_andamento:{ label:"Andamento", cor:T.amarelo, fundo:T.amareloC }, concluida:{ label:"Concluída", cor:T.verde, fundo:T.verdeC } };
  const conc = tarefas.filter(t=>t.status==="concluida").length;

  return (
    <>
      <Header titulo="Tarefas" subtitulo="✅ Módulo" onVoltar={onVoltar} acao={<div onClick={() => setModal(true)} style={{ background:T.amareloC, padding:"5px 12px", borderRadius:20, fontSize:13, color:T.amarelo, fontWeight:600, cursor:"pointer" }}>+ Nova</div>} />
      <div style={{ padding:"16px 16px 100px" }}>
        {/* Seletor de obra */}
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, marginBottom:14 }}>
          {obras.map(o => (
            <button key={o.id} onClick={() => setObraSel(o.id)} style={{ padding:"6px 14px", border:`1.5px solid ${obraSel===o.id ? T.amarelo : T.cinzaBorda}`, borderRadius:20, background: obraSel===o.id ? T.amareloC : T.fundoCard, color: obraSel===o.id ? T.amarelo : T.cinza3, fontWeight:600, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>
              {o.nome}
            </button>
          ))}
        </div>
        {obraSel && (
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontSize:13, color:T.cinza3 }}>Progresso</span>
              <span style={{ fontSize:13, fontWeight:700, color:T.verde }}>{conc}/{tarefas.length} concluídas</span>
            </div>
            <ProgBar valor={tarefas.length > 0 ? (conc/tarefas.length)*100 : 0} cor={T.verde} />
          </div>
        )}
        {loading ? <Spinner /> : tarefas.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 0", color:T.cinza3 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>Nenhuma tarefa ainda</div>
            <button onClick={() => setModal(true)} style={{ padding:"10px 20px", background:T.amarelo, border:"none", borderRadius:10, color:"#fff", fontWeight:700, cursor:"pointer" }}>+ Criar tarefa</button>
          </div>
        ) : tarefas.map(t => {
          const st = ST[t.status] || ST.pendente;
          return (
            <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, background:T.fundoCard, borderRadius:12, padding:"12px 14px", marginBottom:8, border:`1px solid ${t.prioridade==="urgente" ? T.vermelho+"40" : T.cinzaBorda}` }}>
              <div onClick={() => toggle(t)} style={{ width:22, height:22, borderRadius:6, flexShrink:0, border:`2px solid ${t.status==="concluida" ? T.verde : T.cinzaBorda}`, background: t.status==="concluida" ? T.verde : "transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                {t.status==="concluida" && <span style={{ color:"#fff", fontSize:12 }}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color: t.status==="concluida" ? T.cinza3 : T.cinza1, textDecoration: t.status==="concluida" ? "line-through" : "none" }}>{t.titulo}</div>
                {t.instrucoes && <div style={{ fontSize:11, color:T.cinza3, marginTop:2 }}>{t.instrucoes.slice(0,60)}{t.instrucoes.length > 60 ? "..." : ""}</div>}
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                <Badge label={st.label} cor={st.cor} fundo={st.fundo} />
                {t.prioridade==="urgente" && <span style={{ fontSize:10, color:T.vermelho, fontWeight:700 }}>🔴</span>}
              </div>
            </div>
          );
        })}
      </div>
      {modal && (
        <Modal titulo="Nova Tarefa" onFechar={() => setModal(false)}>
          <Input label="Título *" value={nova.titulo} onChange={e=>setNova(p=>({...p,titulo:e.target.value}))} placeholder="Ex: Assentar tijolos bloco A" />
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:6 }}>Instruções</div>
            <textarea value={nova.instrucoes} onChange={e=>setNova(p=>({...p,instrucoes:e.target.value}))} placeholder="1. Faça isso&#10;2. Depois isso..." style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${T.cinzaBorda}`, fontSize:13, color:T.cinza1, outline:"none", fontFamily:"inherit", boxSizing:"border-box", resize:"none", height:90 }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:8 }}>Prioridade</div>
            <div style={{ display:"flex", gap:10 }}>
              {["normal","urgente"].map(p => (
                <button key={p} onClick={() => setNova(prev=>({...prev,prioridade:p}))} style={{ flex:1, padding:"9px", border:`1.5px solid ${nova.prioridade===p ? (p==="urgente" ? T.vermelho : T.verde) : T.cinzaBorda}`, borderRadius:10, background: nova.prioridade===p ? (p==="urgente" ? T.vermelhoC : T.verdeC) : T.fundoCard, color: nova.prioridade===p ? (p==="urgente" ? T.vermelho : T.verde) : T.cinza3, fontWeight:600, fontSize:13, cursor:"pointer" }}>
                  {p==="urgente" ? "🔴 Urgente" : "🟢 Normal"}
                </button>
              ))}
            </div>
          </div>
          <Btn onClick={criar} loading={salvando} disabled={!nova.titulo.trim()}>Adicionar tarefa</Btn>
        </Modal>
      )}
    </>
  );
}

// ─── ORÇAMENTOS ────────────────────────────────────────────
function Orcamentos({ usuario, onVoltar }) {
  const [orcs, setOrcs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [detalhe, setDetalhe] = useState(null);
  const [itens, setItens]     = useState([]);
  const [novo, setNovo]       = useState({ cliente_nome:"", cliente_telefone:"", endereco_obra:"", descricao:"" });
  const [novoItem, setNovoItem] = useState({ descricao:"", tipo:"material", quantidade:"", unidade:"un", valor_unitario:"" });
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("orcamentos").select("*").eq("criado_por", usuario.id).order("criado_em", { ascending:false });
      setOrcs(data || []);
    } finally { setLoading(false); }
  }, [usuario.id]);

  useEffect(() => { carregar(); }, [carregar]);

  const carregarItens = async (orcId) => {
    const { data } = await supabase.from("orcamento_itens").select("*").eq("orcamento_id", orcId);
    setItens(data || []);
  };

  const abrirDetalhe = async (orc) => {
    setDetalhe(orc);
    await carregarItens(orc.id);
  };

  const criar = async () => {
    if (!novo.cliente_nome.trim()) return;
    setSalvando(true);
    try {
      const { error } = await supabase.from("orcamentos").insert({ ...novo, status:"rascunho", criado_por: usuario.id, total_geral:0 });
      if (error) throw error;
      setModal(false); setNovo({ cliente_nome:"", cliente_telefone:"", endereco_obra:"", descricao:"" }); carregar();
    } catch (e) {
      alert("Erro ao criar orçamento: " + (e?.message || "tente novamente"));
    } finally { setSalvando(false); }
  };

  const adicionarItem = async () => {
    if (!novoItem.descricao || !novoItem.quantidade || !novoItem.valor_unitario) return;
    setSalvando(true);
    try {
      await supabase.from("orcamento_itens").insert({ ...novoItem, orcamento_id: detalhe.id, quantidade: parseFloat(novoItem.quantidade), valor_unitario: parseFloat(novoItem.valor_unitario) });
      setNovoItem({ descricao:"", tipo:"material", quantidade:"", unidade:"un", valor_unitario:"" });
      await carregarItens(detalhe.id);
      const total = itens.reduce((s,i) => s + (parseFloat(i.quantidade)||0)*(parseFloat(i.valor_unitario)||0), 0) + (parseFloat(novoItem.quantidade)||0)*(parseFloat(novoItem.valor_unitario)||0);
      await supabase.from("orcamentos").update({ total_geral: total }).eq("id", detalhe.id);
      carregar();
    } finally { setSalvando(false); }
  };

  const gerarPDF = () => {
    const total = itens.reduce((s, i) => s + (i.quantidade||0) * (i.valor_unitario||0), 0);
    const fmt = (v) => Number(v||0).toLocaleString("pt-BR", { minimumFractionDigits:2 });
    const linhas = itens.map(i => `
      <tr>
        <td>${i.descricao}</td>
        <td style="text-align:center">${i.quantidade}</td>
        <td style="text-align:center">${i.unidade}</td>
        <td style="text-align:right">R$ ${fmt(i.valor_unitario)}</td>
        <td style="text-align:right;font-weight:700">R$ ${fmt((i.quantidade||0)*(i.valor_unitario||0))}</td>
      </tr>`).join("");
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
      <title>Orçamento — ${detalhe.cliente_nome}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;color:#1A1A1A;max-width:740px;margin:0 auto}
        h1{color:#C77700;letter-spacing:4px;margin:0 0 4px}
        .sub{font-size:12px;color:#8A8A8A;letter-spacing:2px;margin-bottom:28px}
        .info{background:#F5F5F0;border-radius:8px;padding:16px;margin-bottom:24px;font-size:14px;line-height:1.8}
        table{width:100%;border-collapse:collapse;margin-bottom:16px}
        th{background:#FFF3DC;color:#C77700;padding:10px 12px;text-align:left;font-size:13px}
        td{padding:10px 12px;border-bottom:1px solid #E0E0D8;font-size:13px}
        .total{background:#FFF3DC;border-radius:8px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-top:8px}
        .total-label{font-size:14px;font-weight:700;color:#4A4A4A}
        .total-val{font-size:24px;font-weight:900;color:#C77700}
        @media print{@page{margin:20mm}}
      </style></head><body>
      <h1>OBRAFÁCIL</h1>
      <div class="sub">ORÇAMENTO</div>
      <div class="info">
        <strong>Cliente:</strong> ${detalhe.cliente_nome}<br>
        ${detalhe.cliente_telefone ? `<strong>Telefone:</strong> ${detalhe.cliente_telefone}<br>` : ""}
        ${detalhe.endereco_obra ? `<strong>Endereço:</strong> ${detalhe.endereco_obra}<br>` : ""}
        ${detalhe.descricao ? `<strong>Serviço:</strong> ${detalhe.descricao}` : ""}
      </div>
      <table><thead><tr><th>Item</th><th style="text-align:center">Qtd</th><th style="text-align:center">Unid</th><th style="text-align:right">Unit.</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${linhas}</tbody></table>
      <div class="total"><span class="total-label">TOTAL GERAL</span><span class="total-val">R$ ${fmt(total)}</span></div>
      <script>window.onload=function(){window.print();}</script>
      </body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); }
  };

  const ST = { rascunho:{ label:"Rascunho", cor:T.cinza3, fundo:"#F0F0F0" }, enviado:{ label:"Enviado", cor:T.azul, fundo:T.azulC }, aprovado:{ label:"Aprovado", cor:T.verde, fundo:T.verdeC }, recusado:{ label:"Recusado", cor:T.vermelho, fundo:T.vermelhoC }, aguardando:{ label:"Aguardando", cor:T.amarelo, fundo:T.amareloC } };
  const totalAprov = orcs.filter(o=>o.status==="aprovado").reduce((s,o)=>s+(o.total_geral||0),0);

  if (detalhe) return (
    <>
      <Header titulo={detalhe.cliente_nome} subtitulo="← Orçamentos" onVoltar={() => { setDetalhe(null); carregar(); }}
        acao={<Badge label={(ST[detalhe.status]||ST.rascunho).label} cor={(ST[detalhe.status]||ST.rascunho).cor} fundo={(ST[detalhe.status]||ST.rascunho).fundo} />}
      />
      <div style={{ padding:"16px 16px 100px" }}>
        <div style={{ background:T.fundoCard, borderRadius:14, padding:16, border:`1px solid ${T.cinzaBorda}`, marginBottom:16 }}>
          <div style={{ fontSize:12, color:T.cinza3, marginBottom:4 }}>📍 {detalhe.endereco_obra || "—"}</div>
          <div style={{ fontSize:12, color:T.cinza3, marginBottom:4 }}>📞 {detalhe.cliente_telefone || "—"}</div>
          <div style={{ fontSize:12, color:T.cinza3 }}>📝 {detalhe.descricao || "—"}</div>
        </div>

        <div style={{ fontSize:14, fontWeight:700, color:T.cinza1, marginBottom:12 }}>Itens do orçamento</div>
        {itens.map((item,i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:T.fundoCard, borderRadius:10, padding:"12px 14px", marginBottom:8, border:`1px solid ${T.cinzaBorda}` }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:T.cinza1 }}>{item.descricao}</div>
              <div style={{ fontSize:11, color:T.cinza3 }}>{item.quantidade} {item.unidade} × {moeda(item.valor_unitario)}</div>
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:T.cinza1 }}>{moeda((item.quantidade||0)*(item.valor_unitario||0))}</div>
          </div>
        ))}

        <div style={{ background:T.amareloC, border:`1px solid ${T.amarelo}`, borderRadius:12, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontSize:15, fontWeight:700, color:T.cinza1 }}>TOTAL</span>
          <span style={{ fontSize:24, fontWeight:900, color:T.amarelo }}>{moeda(itens.reduce((s,i)=>s+(i.quantidade||0)*(i.valor_unitario||0),0))}</span>
        </div>

        <div style={{ background:T.fundo, borderRadius:12, padding:14, border:`1px solid ${T.cinzaBorda}`, marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:T.cinza3, marginBottom:10, letterSpacing:1, textTransform:"uppercase" }}>+ Adicionar item</div>
          <Input value={novoItem.descricao} onChange={e=>setNovoItem(p=>({...p,descricao:e.target.value}))} placeholder="Descrição do item" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:8 }}>
            <input type="number" value={novoItem.quantidade} onChange={e=>setNovoItem(p=>({...p,quantidade:e.target.value}))} placeholder="Qtd" style={{ padding:"10px", borderRadius:8, border:`1.5px solid ${T.cinzaBorda}`, fontSize:13, fontFamily:"inherit" }} />
            <select value={novoItem.unidade} onChange={e=>setNovoItem(p=>({...p,unidade:e.target.value}))} style={{ padding:"10px", borderRadius:8, border:`1.5px solid ${T.cinzaBorda}`, fontSize:13, background:T.fundoCard }}>
              {["un","m²","m³","kg","saco","lata","barra","dia"].map(u=><option key={u}>{u}</option>)}
            </select>
            <input type="number" value={novoItem.valor_unitario} onChange={e=>setNovoItem(p=>({...p,valor_unitario:e.target.value}))} placeholder="R$ unit" style={{ padding:"10px", borderRadius:8, border:`1.5px solid ${T.cinzaBorda}`, fontSize:13, fontFamily:"inherit" }} />
          </div>
          <Btn onClick={adicionarItem} loading={salvando} disabled={!novoItem.descricao||!novoItem.quantidade||!novoItem.valor_unitario}>Adicionar</Btn>
        </div>

        <div style={{ fontSize:12, fontWeight:700, color:T.cinza3, marginBottom:10, letterSpacing:1, textTransform:"uppercase" }}>Status</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {["rascunho","aguardando","aprovado","recusado"].map(s => {
            const cfg = ST[s] || ST.rascunho;
            return (
              <button key={s} onClick={async () => { await supabase.from("orcamentos").update({ status:s }).eq("id", detalhe.id); setDetalhe(p=>({...p,status:s})); carregar(); }} style={{ padding:"10px", border:`1.5px solid ${detalhe.status===s ? cfg.cor : T.cinzaBorda}`, borderRadius:10, background: detalhe.status===s ? cfg.fundo : T.fundoCard, color: detalhe.status===s ? cfg.cor : T.cinza3, fontWeight:600, fontSize:12, cursor:"pointer" }}>{cfg.label}</button>
            );
          })}
        </div>

        <button onClick={gerarPDF} style={{ marginTop:20, width:"100%", padding:"13px", border:`1.5px solid ${T.amarelo}`, borderRadius:12, background:T.amareloC, color:T.amarelo, fontSize:15, fontWeight:700, cursor:"pointer" }}>
          🖨️ Gerar PDF / Imprimir
        </button>
      </div>
    </>
  );

  return (
    <>
      <Header titulo="Orçamentos" subtitulo="💰 Módulo" onVoltar={onVoltar} acao={<div onClick={() => setModal(true)} style={{ background:T.amareloC, padding:"5px 12px", borderRadius:20, fontSize:13, color:T.amarelo, fontWeight:600, cursor:"pointer" }}>+ Novo</div>} />
      <div style={{ padding:"16px 16px 100px" }}>
        <div style={{ background:T.verdeC, border:`1px solid ${T.verde}`, borderRadius:12, padding:"14px 16px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, color:T.verde, fontWeight:600 }}>💰 Total aprovado</span>
          <span style={{ fontSize:20, fontWeight:800, color:T.verde }}>{moeda(totalAprov)}</span>
        </div>
        {loading ? <Spinner /> : orcs.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 0", color:T.cinza3 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>💰</div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>Nenhum orçamento ainda</div>
            <button onClick={() => setModal(true)} style={{ padding:"10px 20px", background:T.amarelo, border:"none", borderRadius:10, color:"#fff", fontWeight:700, cursor:"pointer" }}>+ Criar orçamento</button>
          </div>
        ) : orcs.map(o => {
          const st = ST[o.status] || ST.rascunho;
          return (
            <div key={o.id} onClick={() => abrirDetalhe(o)} style={{ background:T.fundoCard, borderRadius:14, padding:16, marginBottom:12, border:`1px solid ${T.cinzaBorda}`, cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor=T.amarelo+"60"}
              onMouseLeave={e => e.currentTarget.style.borderColor=T.cinzaBorda}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div style={{ fontSize:15, fontWeight:700, color:T.cinza1 }}>{o.cliente_nome}</div>
                <Badge label={st.label} cor={st.cor} fundo={st.fundo} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:`1px solid ${T.cinzaBorda}` }}>
                <span style={{ fontSize:16, fontWeight:800, color:T.cinza1 }}>{moeda(o.total_geral||0)}</span>
                <span style={{ fontSize:12, color:T.amarelo, fontWeight:600 }}>Abrir →</span>
              </div>
            </div>
          );
        })}
      </div>
      {modal && (
        <Modal titulo="Novo Orçamento" onFechar={() => setModal(false)}>
          <Input label="Nome do cliente *" value={novo.cliente_nome} onChange={e=>setNovo(p=>({...p,cliente_nome:e.target.value}))} placeholder="Ex: Família Silva" />
          <Input label="Telefone" value={novo.cliente_telefone} onChange={e=>setNovo(p=>({...p,cliente_telefone:e.target.value}))} placeholder="(11) 99999-0000" />
          <Input label="Endereço da obra" value={novo.endereco_obra} onChange={e=>setNovo(p=>({...p,endereco_obra:e.target.value}))} placeholder="Rua, número, bairro" />
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:6 }}>Descrição do serviço</div>
            <textarea value={novo.descricao} onChange={e=>setNovo(p=>({...p,descricao:e.target.value}))} placeholder="Ex: Reforma completa do banheiro..." style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${T.cinzaBorda}`, fontSize:13, color:T.cinza1, outline:"none", fontFamily:"inherit", boxSizing:"border-box", resize:"none", height:80 }} />
          </div>
          <Btn onClick={criar} loading={salvando} disabled={!novo.cliente_nome.trim()}>Continuar →</Btn>
        </Modal>
      )}
    </>
  );
}

// ─── ESTOQUE ───────────────────────────────────────────────
function Estoque({ usuario, onVoltar }) {
  const [obras, setObras]     = useState([]);
  const [obraSel, setObraSel] = useState(null);
  const [itens, setItens]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [modalMov, setModalMov] = useState(null);
  const [novo, setNovo]       = useState({ material:"", unidade:"un", quantidade_atual:0, quantidade_minima:0 });
  const [mov, setMov]         = useState({ quantidade:"", motivo:"" });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    supabase.from("obras").select("*").eq("dono_id", usuario.id).then(({ data }) => {
      setObras(data || []);
      if (data?.length > 0) setObraSel(data[0].id);
    });
  }, [usuario.id]);

  const carregar = useCallback(async () => {
    if (!obraSel) return;
    setLoading(true);
    try {
      const { data } = await supabase.from("estoque").select("*").eq("obra_id", obraSel).order("material", { ascending:true });
      setItens(data || []);
    } finally { setLoading(false); }
  }, [obraSel]);

  useEffect(() => { carregar(); }, [carregar]);

  const criar = async () => {
    if (!novo.material.trim() || !obraSel) return;
    setSalvando(true);
    try {
      const { error } = await supabase.from("estoque").insert({ ...novo, obra_id: obraSel, quantidade_atual: parseFloat(novo.quantidade_atual)||0, quantidade_minima: parseFloat(novo.quantidade_minima)||0 });
      if (error) throw error;
      setModal(false); setNovo({ material:"", unidade:"un", quantidade_atual:0, quantidade_minima:0 }); carregar();
    } catch (e) {
      alert("Erro ao criar material: " + (e?.message || "tente novamente"));
    } finally { setSalvando(false); }
  };

  const registrarMov = async () => {
    if (!mov.quantidade || !mov.motivo) return;
    setSalvando(true);
    try {
      const { item, tipo } = modalMov;
      const qtd = parseFloat(mov.quantidade);
      const nova = tipo === "entrada" ? item.quantidade_atual + qtd : Math.max(0, item.quantidade_atual - qtd);
      await supabase.from("estoque").update({ quantidade_atual: nova }).eq("id", item.id);
      await supabase.from("estoque_movimentacoes").insert({ estoque_id: item.id, tipo, quantidade: qtd, motivo: mov.motivo, registrado_por: usuario.id });
      setModalMov(null); setMov({ quantidade:"", motivo:"" }); carregar();
    } finally { setSalvando(false); }
  };

  const alertas = itens.filter(i => i.quantidade_atual < i.quantidade_minima);

  return (
    <>
      <Header titulo="Estoque" subtitulo="📦 Módulo" onVoltar={onVoltar} acao={<div onClick={() => setModal(true)} style={{ background:T.amareloC, padding:"5px 12px", borderRadius:20, fontSize:13, color:T.amarelo, fontWeight:600, cursor:"pointer" }}>+ Item</div>} />
      <div style={{ padding:"16px 16px 100px" }}>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, marginBottom:14 }}>
          {obras.map(o => (
            <button key={o.id} onClick={() => setObraSel(o.id)} style={{ padding:"6px 14px", border:`1.5px solid ${obraSel===o.id ? T.amarelo : T.cinzaBorda}`, borderRadius:20, background: obraSel===o.id ? T.amareloC : T.fundoCard, color: obraSel===o.id ? T.amarelo : T.cinza3, fontWeight:600, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>
              {o.nome}
            </button>
          ))}
        </div>
        {alertas.length > 0 && (
          <div style={{ background:T.vermelhoC, border:`1px solid ${T.vermelho}`, borderRadius:12, padding:"12px 14px", marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.vermelho, marginBottom:6 }}>🚨 {alertas.length} material(is) abaixo do mínimo</div>
            {alertas.map(a => <div key={a.id} style={{ fontSize:12, color:T.vermelho }}>• {a.material}: {a.quantidade_atual} {a.unidade} (mín: {a.quantidade_minima})</div>)}
          </div>
        )}
        {loading ? <Spinner /> : itens.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 0", color:T.cinza3 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📦</div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>Nenhum material ainda</div>
            <button onClick={() => setModal(true)} style={{ padding:"10px 20px", background:T.amarelo, border:"none", borderRadius:10, color:"#fff", fontWeight:700, cursor:"pointer" }}>+ Adicionar material</button>
          </div>
        ) : itens.map(item => {
          const pct = Math.min((item.quantidade_atual / Math.max(item.quantidade_minima*2, item.quantidade_atual, 1))*100, 100);
          const cor = item.quantidade_atual < item.quantidade_minima ? T.vermelho : item.quantidade_atual < item.quantidade_minima*1.5 ? T.amarelo : T.verde;
          return (
            <div key={item.id} style={{ background:T.fundoCard, borderRadius:14, padding:16, marginBottom:12, border:`1px solid ${T.cinzaBorda}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div style={{ fontSize:15, fontWeight:700, color:T.cinza1 }}>{item.material}</div>
                <span style={{ fontSize:24, fontWeight:900, color:cor }}>{item.quantidade_atual} <span style={{ fontSize:12, color:T.cinza3, fontWeight:500 }}>{item.unidade}</span></span>
              </div>
              <ProgBar valor={pct} cor={cor} />
              {item.quantidade_atual < item.quantidade_minima && <div style={{ fontSize:11, color:T.vermelho, marginTop:5, fontWeight:600 }}>⚠️ Repor {item.quantidade_minima - item.quantidade_atual} {item.unidade}</div>}
              <div style={{ display:"flex", gap:8, marginTop:12 }}>
                <button onClick={() => setModalMov({ item, tipo:"entrada" })} style={{ flex:1, padding:"8px", background:T.verdeC, border:`1px solid ${T.verde}`, borderRadius:8, color:T.verde, fontWeight:700, fontSize:12, cursor:"pointer" }}>↑ Entrada</button>
                <button onClick={() => setModalMov({ item, tipo:"saida" })} style={{ flex:1, padding:"8px", background:T.vermelhoC, border:`1px solid ${T.vermelho}`, borderRadius:8, color:T.vermelho, fontWeight:700, fontSize:12, cursor:"pointer" }}>↓ Saída</button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal titulo="Novo Material" onFechar={() => setModal(false)}>
          <Input label="Nome do material *" value={novo.material} onChange={e=>setNovo(p=>({...p,material:e.target.value}))} placeholder="Ex: Cimento 50kg" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:6 }}>Unidade</div>
              <select value={novo.unidade} onChange={e=>setNovo(p=>({...p,unidade:e.target.value}))} style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:`1.5px solid ${T.cinzaBorda}`, fontSize:13, background:T.fundoCard }}>
                {["un","m²","m³","kg","saco","lata","barra","milh"].map(u=><option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:6 }}>Qtd mínima</div>
              <input type="number" value={novo.quantidade_minima} onChange={e=>setNovo(p=>({...p,quantidade_minima:e.target.value}))} style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:`1.5px solid ${T.cinzaBorda}`, fontSize:14, fontFamily:"inherit" }} />
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:6 }}>Quantidade atual</div>
            <input type="number" value={novo.quantidade_atual} onChange={e=>setNovo(p=>({...p,quantidade_atual:e.target.value}))} style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:`1.5px solid ${T.cinzaBorda}`, fontSize:14, fontFamily:"inherit" }} />
          </div>
          <Btn onClick={criar} loading={salvando} disabled={!novo.material.trim()}>Adicionar material</Btn>
        </Modal>
      )}

      {modalMov && (
        <Modal titulo={modalMov.tipo === "entrada" ? "↑ Registrar Entrada" : "↓ Registrar Saída"} onFechar={() => setModalMov(null)}>
          <div style={{ fontSize:13, color:T.cinza3, marginBottom:16 }}>{modalMov.item.material} · estoque atual: {modalMov.item.quantidade_atual} {modalMov.item.unidade}</div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:6 }}>Quantidade</div>
            <input type="number" value={mov.quantidade} onChange={e=>setMov(p=>({...p,quantidade:e.target.value}))} placeholder={`Qtd em ${modalMov.item.unidade}`} style={{ width:"100%", padding:"13px 14px", borderRadius:10, border:`1.5px solid ${modalMov.tipo==="entrada" ? T.verde : T.vermelho}`, fontSize:18, fontWeight:700, color: modalMov.tipo==="entrada" ? T.verde : T.vermelho, outline:"none", fontFamily:"inherit", boxSizing:"border-box", textAlign:"center" }} />
          </div>
          <Input label="Motivo" value={mov.motivo} onChange={e=>setMov(p=>({...p,motivo:e.target.value}))} placeholder={modalMov.tipo==="entrada" ? "Ex: Compra NF #1234" : "Ex: Uso na fundação"} />
          {mov.quantidade && !isNaN(parseFloat(mov.quantidade)) && (
            <div style={{ background: modalMov.tipo==="entrada" ? T.verdeC : T.vermelhoC, border:`1px solid ${modalMov.tipo==="entrada" ? T.verde : T.vermelho}`, borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, color: modalMov.tipo==="entrada" ? T.verde : T.vermelho, fontWeight:600 }}>Novo saldo:</span>
              <span style={{ fontSize:20, fontWeight:900, color: modalMov.tipo==="entrada" ? T.verde : T.vermelho }}>
                {Math.max(0, modalMov.item.quantidade_atual + (modalMov.tipo==="entrada" ? parseFloat(mov.quantidade) : -parseFloat(mov.quantidade)))} {modalMov.item.unidade}
              </span>
            </div>
          )}
          <Btn onClick={registrarMov} loading={salvando} disabled={!mov.quantidade||!mov.motivo} cor={modalMov.tipo==="entrada" ? T.verde : T.vermelho}>
            {modalMov.tipo==="entrada" ? "↑ Confirmar Entrada" : "↓ Confirmar Saída"}
          </Btn>
        </Modal>
      )}
    </>
  );
}

// ─── CRONOGRAMA ────────────────────────────────────────────
const CORES_FASES = ['#2E7D32','#1565C0','#6A1B9A','#E65100','#C62828','#F57F17','#00838F','#4E342E'];

function Cronograma({ usuario, onVoltar }) {
  const [aba, setAba]             = useState("timeline");
  const [obras, setObras]         = useState([]);
  const [obraSel, setObraSel]     = useState(null);
  const [fases, setFases]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editando, setEditando]   = useState(null);
  const [expandido, setExpandido] = useState(null);
  const [nova, setNova]           = useState({ nome:"", inicio:"", fim:"", responsavel:"", cor:"#2E7D32", progresso:0 });
  const [salvando, setSalvando]   = useState(false);
  const [modalGantt, setModalGantt] = useState(false);

  useEffect(() => {
    supabase.from("obras").select("*").eq("dono_id", usuario.id).then(({ data }) => {
      setObras(data || []);
      if (data?.length > 0) setObraSel(data[0].id);
    });
  }, [usuario.id]);

  const carregarFases = useCallback(async () => {
    if (!obraSel) return;
    setLoading(true);
    try {
      const { data } = await supabase.from("cronograma_fases").select("*").eq("obra_id", obraSel).order("inicio", { ascending:true });
      setFases(data || []);
    } finally { setLoading(false); }
  }, [obraSel]);

  useEffect(() => { carregarFases(); }, [carregarFases]);

  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const parseDate = (s) => { const d = new Date(s + "T00:00:00"); d.setHours(0,0,0,0); return d; };
  const fmtData = (s) => s ? parseDate(s).toLocaleDateString("pt-BR", { day:"2-digit", month:"short" }) : "—";
  const diasEntre = (a, b) => Math.round((b.getTime() - a.getTime()) / 86400000);

  const datas = fases.flatMap((f:any) => [parseDate(f.inicio), parseDate(f.fim)]);
  const minData = datas.length > 0 ? new Date(Math.min(...datas.map(d=>d.getTime()))) : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const maxData = datas.length > 0 ? new Date(Math.max(...datas.map(d=>d.getTime()))) : new Date(hoje.getFullYear(), hoje.getMonth()+2, 0);
  minData.setDate(minData.getDate() - 3);
  maxData.setDate(maxData.getDate() + 3);
  const totalDias = Math.max(diasEntre(minData, maxData), 1);
  const posLeft   = (d) => `${Math.max(0, diasEntre(minData, parseDate(d)) / totalDias * 100)}%`;
  const posWidth  = (ini, fim) => `${Math.max(2, diasEntre(parseDate(ini), parseDate(fim)) / totalDias * 100)}%`;
  const hojeRatio = Math.max(0, Math.min(1, diasEntre(minData, hoje) / totalDias));
  const semanas: Date[] = (() => { const s: Date[] = []; const c = new Date(minData); while (c <= maxData) { s.push(new Date(c)); c.setDate(c.getDate()+7); } return s; })();

  const concluidas  = fases.filter((f:any) => f.status === "concluida").length;
  const emAndamento = fases.filter((f:any) => f.status === "em_andamento").length;
  const progGeral   = fases.length > 0 ? Math.round((fases as any[]).reduce((s,f) => s + (f.progresso||0), 0) / fases.length) : 0;

  const abrirModal  = () => { setEditando(null); setNova({ nome:"", inicio:"", fim:"", responsavel:"", cor:"#2E7D32", progresso:0 }); setModal(true); };
  const abrirEditar = (fase:any) => { setEditando(fase); setNova({ nome:fase.nome, inicio:fase.inicio, fim:fase.fim, responsavel:fase.responsavel||"", cor:fase.cor||"#2E7D32", progresso:fase.progresso||0 }); setModal(true); };

  const salvar = async () => {
    if (!nova.nome.trim() || !nova.inicio || !nova.fim) return;
    setSalvando(true);
    try {
      const dados = { nome:nova.nome, inicio:nova.inicio, fim:nova.fim, responsavel:nova.responsavel, cor:nova.cor, progresso:nova.progresso, obra_id:obraSel };
      if (editando) {
        await supabase.from("cronograma_fases").update(dados).eq("id", (editando as any).id);
      } else {
        await supabase.from("cronograma_fases").insert({ ...dados, status:"pendente" });
      }
      setModal(false); setEditando(null);
      setNova({ nome:"", inicio:"", fim:"", responsavel:"", cor:"#2E7D32", progresso:0 });
      carregarFases();
    } finally { setSalvando(false); }
  };

  const deletar = async (id) => {
    if (!window.confirm("Excluir esta fase?")) return;
    await supabase.from("cronograma_fases").delete().eq("id", id);
    carregarFases();
  };

  const concluirFase = async (fase:any) => {
    await supabase.from("cronograma_fases").update({ status:"concluida", progresso:100 }).eq("id", fase.id);
    carregarFases();
  };

  const obraAtual   = (obras as any[]).find(o => o.id === obraSel);
  const linkPublico = obraSel ? `${typeof window !== "undefined" ? window.location.origin : ""}/obra/${obraSel}` : "";
  const copiarLink  = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(linkPublico).then(() => alert("✅ Link copiado!")).catch(() => alert("Link: " + linkPublico));
    } else { alert("Link: " + linkPublico); }
  };

  return (
    <>
      <Header titulo="Cronograma" subtitulo="📅 Módulo" onVoltar={onVoltar}
        acao={aba === "fases" ? <div onClick={abrirModal} style={{ background:T.amareloC, padding:"5px 12px", borderRadius:20, fontSize:13, color:T.amarelo, fontWeight:600, cursor:"pointer" }}>+ Fase</div> : null}
      />

      <div style={{ background:T.fundoCard, borderBottom:`1px solid ${T.cinzaBorda}`, padding:"10px 16px 0" }}>
        {obras.length > 0 && (
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8 }}>
            {(obras as any[]).map(o => (
              <button key={o.id} onClick={() => setObraSel(o.id)} style={{ padding:"6px 14px", border:`1.5px solid ${obraSel===o.id ? T.amarelo : T.cinzaBorda}`, borderRadius:20, background: obraSel===o.id ? T.amareloC : T.fundoCard, color: obraSel===o.id ? T.amarelo : T.cinza3, fontWeight:600, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>
                {o.nome}
              </button>
            ))}
          </div>
        )}
        <div style={{ display:"flex" }}>
          {[{ id:"timeline", emoji:"📊", label:"Timeline" },{ id:"fases", emoji:"📋", label:"Fases" },{ id:"cliente", emoji:"🔗", label:"Cliente" }].map(tab => (
            <button key={tab.id} onClick={() => setAba(tab.id)} style={{ flex:1, padding:"10px 4px", border:"none", background:"none", borderBottom:`2.5px solid ${aba===tab.id ? T.amarelo : "transparent"}`, color: aba===tab.id ? T.amarelo : T.cinza3, fontWeight: aba===tab.id ? 700 : 500, fontSize:12, cursor:"pointer" }}>
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"16px 16px 100px" }}>

        {aba === "timeline" && (
          <>
            <div style={{ display:"flex", gap:10, marginBottom:16 }}>
              {[
                { emoji:"✅", v:concluidas,      l:"Concluídas", c:T.verde   },
                { emoji:"🔄", v:emAndamento,     l:"Andamento",  c:T.amarelo },
                { emoji:"📊", v:`${progGeral}%`, l:"Progresso",  c:T.cinza1  },
              ].map((s,i) => (
                <div key={i} style={{ flex:1, background:T.fundoCard, borderRadius:12, padding:"12px 8px", textAlign:"center", border:`1px solid ${T.cinzaBorda}` }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{s.emoji}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:s.c }}>{s.v}</div>
                  <div style={{ fontSize:9, color:T.cinza3, marginTop:3 }}>{s.l}</div>
                </div>
              ))}
            </div>

            <div style={{ background:T.fundoCard, borderRadius:14, padding:16, border:`1px solid ${T.cinzaBorda}`, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:700, color:T.cinza1 }}>Progresso geral da obra</span>
                <span style={{ fontSize:13, fontWeight:800, color:T.verde }}>{progGeral}%</span>
              </div>
              <div style={{ height:12, background:T.cinzaBorda, borderRadius:6, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${progGeral}%`, background:`linear-gradient(90deg,${T.verde},#4CAF50)`, borderRadius:6, transition:"width 0.8s" }} />
              </div>
            </div>

            {loading ? <Spinner /> : fases.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:T.cinza3 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
                <div style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>Nenhuma fase cadastrada</div>
                <button onClick={() => setAba("fases")} style={{ padding:"10px 20px", background:T.amarelo, border:"none", borderRadius:10, color:"#fff", fontWeight:700, cursor:"pointer" }}>+ Adicionar fase</button>
              </div>
            ) : (
              <div style={{ background:T.fundoCard, borderRadius:14, padding:16, border:`1px solid ${T.cinzaBorda}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:T.cinza1 }}>📊 Gráfico Gantt</div>
                  <button onClick={() => setModalGantt(true)} style={{ background:T.amareloC, border:`1px solid ${T.amarelo}`, borderRadius:8, padding:"5px 12px", color:T.amarelo, fontWeight:700, fontSize:12, cursor:"pointer" }}>⤢ Ampliar</button>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:T.cinza3, marginBottom:6, paddingLeft:98 }}>
                  <span>{minData.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}</span>
                  <span style={{ color:T.vermelho, fontWeight:700 }}>Hoje</span>
                  <span>{maxData.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}</span>
                </div>
                <div style={{ position:"relative" }}>
                  {(fases as any[]).map(fase => (
                    <div key={fase.id} style={{ display:"flex", alignItems:"center", marginBottom:8, gap:8 }}>
                      <div style={{ width:90, fontSize:10, color:T.cinza2, fontWeight:600, flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={fase.nome}>{fase.nome}</div>
                      <div style={{ flex:1, position:"relative", height:22, background:"#F0F0EE", borderRadius:4 }}>
                        <div style={{ position:"absolute", left:posLeft(fase.inicio), width:posWidth(fase.inicio,fase.fim), height:"100%", background:fase.cor||"#2E7D32", borderRadius:4, display:"flex", alignItems:"center", paddingLeft:4, boxSizing:"border-box" as any, minWidth:20 }}>
                          <span style={{ fontSize:9, color:"#fff", fontWeight:700 }}>{fase.progresso||0}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ position:"absolute", top:0, bottom:0, left:`calc(98px + (100% - 98px) * ${hojeRatio})`, width:2, background:T.vermelho, opacity:0.85, pointerEvents:"none" as any, zIndex:5 }} />
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10, fontSize:10, color:T.cinza3 }}>
                  <div style={{ width:12, height:2, background:T.vermelho }} />
                  <span>Linha vermelha = Hoje ({hoje.toLocaleDateString("pt-BR")})</span>
                </div>
              </div>
            )}
          </>
        )}

        {aba === "fases" && (
          loading ? <Spinner /> : fases.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:T.cinza3 }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
              <div style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>Nenhuma fase ainda</div>
              <button onClick={abrirModal} style={{ padding:"10px 20px", background:T.amarelo, border:"none", borderRadius:10, color:"#fff", fontWeight:700, cursor:"pointer" }}>+ Adicionar primeira fase</button>
            </div>
          ) : (
            <>
              {(fases as any[]).map(fase => {
                const aberto = expandido === fase.id;
                const stCor  = fase.status === "concluida" ? T.verde : fase.status === "em_andamento" ? T.amarelo : T.cinza3;
                const stLbl  = fase.status === "concluida" ? "Concluída" : fase.status === "em_andamento" ? "Andamento" : "Pendente";
                return (
                  <div key={fase.id} style={{ background:T.fundoCard, borderRadius:14, marginBottom:12, border:`1px solid ${T.cinzaBorda}`, overflow:"hidden" }}>
                    <div style={{ height:4, background:fase.cor||"#2E7D32" }} />
                    <div onClick={() => setExpandido(aberto ? null : fase.id)} style={{ padding:"14px 16px", cursor:"pointer" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <div style={{ flex:1, paddingRight:8 }}>
                          <div style={{ fontSize:15, fontWeight:700, color:T.cinza1 }}>{fase.nome}</div>
                          <div style={{ fontSize:11, color:T.cinza3, marginTop:2 }}>📅 {fmtData(fase.inicio)} → {fmtData(fase.fim)}</div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <Badge label={stLbl} cor={stCor} fundo={stCor+"20"} />
                          <span style={{ color:T.cinza3, fontSize:14, display:"inline-block", transform: aberto ? "rotate(180deg)" : "none", transition:"transform 0.2s" }}>▼</span>
                        </div>
                      </div>
                      <div style={{ marginTop:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:11, color:T.cinza3 }}>Progresso</span>
                          <span style={{ fontSize:11, fontWeight:700, color:fase.cor||T.verde }}>{fase.progresso||0}%</span>
                        </div>
                        <ProgBar valor={fase.progresso||0} cor={fase.cor||T.verde} />
                      </div>
                    </div>
                    {aberto && (
                      <div style={{ padding:"12px 16px 16px", borderTop:`1px solid ${T.cinzaBorda}` }}>
                        {fase.responsavel && <div style={{ fontSize:12, color:T.cinza3, marginBottom:12 }}>👷 Responsável: <strong style={{ color:T.cinza1 }}>{fase.responsavel}</strong></div>}
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap" as any }}>
                          {fase.status !== "concluida" && (
                            <button onClick={() => concluirFase(fase)} style={{ flex:1, minWidth:80, padding:"9px 6px", background:T.verdeC, border:`1px solid ${T.verde}`, borderRadius:8, color:T.verde, fontWeight:700, fontSize:12, cursor:"pointer" }}>✅ Concluir</button>
                          )}
                          <button onClick={() => abrirEditar(fase)} style={{ flex:1, minWidth:70, padding:"9px 6px", background:T.amareloC, border:`1px solid ${T.amarelo}`, borderRadius:8, color:T.amarelo, fontWeight:700, fontSize:12, cursor:"pointer" }}>✏️ Editar</button>
                          <button onClick={() => deletar(fase.id)} style={{ flex:1, minWidth:70, padding:"9px 6px", background:T.vermelhoC, border:`1px solid ${T.vermelho}`, borderRadius:8, color:T.vermelho, fontWeight:700, fontSize:12, cursor:"pointer" }}>🗑️ Excluir</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )
        )}

        {aba === "cliente" && (
          <>
            <div style={{ background:`linear-gradient(135deg,${T.cinza1},#333)`, borderRadius:14, padding:20, marginBottom:16 }}>
              <div style={{ fontSize:12, color:"#888", marginBottom:4 }}>🔗 Link público desta obra</div>
              <div style={{ fontSize:11, color:"#AAA", wordBreak:"break-all" as any, marginBottom:14, lineHeight:1.5 }}>{linkPublico || "Selecione uma obra acima"}</div>
              <button onClick={copiarLink} disabled={!obraSel} style={{ width:"100%", padding:"11px", background:T.amarelo, border:"none", borderRadius:10, color:"#fff", fontWeight:700, fontSize:14, cursor: obraSel ? "pointer" : "default", opacity: obraSel ? 1 : 0.5 }}>
                📋 Copiar link
              </button>
            </div>

            <div style={{ fontSize:13, fontWeight:700, color:T.cinza1, marginBottom:12 }}>👁️ Preview — Visão do cliente</div>
            <div style={{ background:"#1A1A1A", borderRadius:14, padding:20, border:`1px solid #333` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ fontSize:28 }}>🏗️</div>
                <div>
                  <div style={{ fontSize:11, color:"#666", letterSpacing:1, textTransform:"uppercase" as any }}>OBRAFÁCIL</div>
                  <div style={{ fontSize:16, fontWeight:800, color:T.amarelo }}>{obraAtual?.nome || "—"}</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:"#888", marginBottom:6 }}>Progresso geral da obra</div>
              <div style={{ height:8, background:"#333", borderRadius:4, overflow:"hidden", marginBottom:4 }}>
                <div style={{ height:"100%", width:`${progGeral}%`, background:`linear-gradient(90deg,${T.amarelo},${T.laranja})`, borderRadius:4, transition:"width 0.8s" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#666", marginBottom:18 }}>
                <span>Conclusão estimada</span>
                <span style={{ color:T.amarelo, fontWeight:700 }}>{progGeral}%</span>
              </div>
              {fases.length === 0 ? (
                <div style={{ textAlign:"center", color:"#555", fontSize:13 }}>Nenhuma fase cadastrada</div>
              ) : (fases as any[]).slice(0,5).map((fase,i) => {
                const stCor = fase.status==="concluida" ? T.verde : fase.status==="em_andamento" ? T.amarelo : "#555";
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <div style={{ width:10, height:10, borderRadius:5, background:fase.cor||stCor, flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, color:"#DDD", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as any }}>{fase.nome}</div>
                      <div style={{ fontSize:10, color:"#555" }}>{fmtData(fase.inicio)} → {fmtData(fase.fim)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:stCor, fontWeight:700 }}>{fase.progresso||0}%</div>
                      <div style={{ height:3, background:"#333", borderRadius:2, width:40, marginTop:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${fase.progresso||0}%`, background:stCor, borderRadius:2 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {fases.length > 5 && <div style={{ textAlign:"center", fontSize:11, color:"#555", marginTop:8 }}>+ {fases.length-5} fases</div>}
            </div>
          </>
        )}
      </div>

      {/* ── MODAL GANTT AMPLIADO ── */}
      {modalGantt && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:T.fundo, display:"flex", flexDirection:"column", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

          {/* Cabeçalho */}
          <div style={{ background:T.cinza1, padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0, boxShadow:"0 2px 12px rgba(0,0,0,0.3)" }}>
            <div>
              <div style={{ fontSize:10, color:"#888", letterSpacing:2, textTransform:"uppercase" as any, marginBottom:2 }}>Cronograma</div>
              <div style={{ fontSize:17, fontWeight:800, color:T.amarelo }}>{obraAtual?.nome || "—"}</div>
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:12, color:"#888" }}>Progresso geral</div>
                <div style={{ fontSize:20, fontWeight:900, color:T.amarelo }}>{progGeral}%</div>
              </div>
              <button onClick={() => setModalGantt(false)} style={{ background:"rgba(255,255,255,0.12)", border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", padding:"8px 16px", borderRadius:10 }}>✕ Fechar</button>
            </div>
          </div>

          {/* Barra progresso geral */}
          <div style={{ height:5, background:"#333", flexShrink:0 }}>
            <div style={{ height:"100%", width:`${progGeral}%`, background:`linear-gradient(90deg,${T.amarelo},${T.laranja})`, transition:"width 0.8s" }} />
          </div>

          {/* Tabela Gantt scrollável */}
          <div style={{ flex:1, overflow:"auto" }}>
            {fases.length === 0 ? (
              <div style={{ textAlign:"center", padding:"80px 40px", color:T.cinza3 }}>
                <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
                <div style={{ fontSize:16, fontWeight:600 }}>Nenhuma fase cadastrada ainda</div>
              </div>
            ) : (
              <table style={{ borderCollapse:"collapse", tableLayout:"fixed" as any, minWidth:"100%" }}>
                <thead>
                  <tr>
                    {/* Coluna de fases — fixa */}
                    <th style={{ position:"sticky", left:0, zIndex:20, width:150, minWidth:150, background:T.cinza1, color:"#fff", padding:"10px 14px", borderRight:`2px solid #444`, textAlign:"left", fontSize:12, fontWeight:700, letterSpacing:0.5 }}>
                      FASE
                    </th>
                    {/* Colunas de semanas */}
                    {semanas.map((sem, i) => {
                      const semFim = new Date(sem.getTime() + 6*86400000);
                      const isHoje = hoje >= sem && hoje <= semFim;
                      const mes    = sem.toLocaleDateString("pt-BR", { month:"short" }).toUpperCase();
                      const prev   = i > 0 ? semanas[i-1].toLocaleDateString("pt-BR", { month:"short" }).toUpperCase() : null;
                      return (
                        <th key={i} style={{ minWidth:64, width:64, background: isHoje ? "#3a1f00" : (i%2===0 ? T.cinza1 : "#222"), color: isHoje ? T.amarelo : "#aaa", padding:"6px 4px", borderLeft:`1px solid #333`, fontSize:10, fontWeight:500, textAlign:"center", verticalAlign:"bottom" }}>
                          {prev !== mes && <div style={{ color: isHoje ? T.amarelo : "#666", fontWeight:700, fontSize:9, marginBottom:2 }}>{mes}</div>}
                          <div style={{ fontWeight: isHoje ? 700 : 400 }}>{sem.getDate()}/{String(sem.getMonth()+1).padStart(2,"0")}</div>
                          {isHoje && <div style={{ color:T.vermelho, fontSize:8, fontWeight:900, marginTop:2 }}>● HOJE</div>}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {(fases as any[]).map((fase, fi) => {
                    const fIni  = parseDate(fase.inicio);
                    const fFim  = parseDate(fase.fim);
                    const stCor = fase.status==="concluida" ? T.verde : fase.status==="em_andamento" ? T.amarelo : T.cinza3;
                    const stEmoji = fase.status==="concluida" ? "✅" : fase.status==="em_andamento" ? "🔄" : "⏳";
                    const rowBg = fi%2===0 ? "#fff" : "#F9F9F7";
                    return (
                      <tr key={fase.id}>
                        {/* Nome da fase — fixo à esquerda */}
                        <td style={{ position:"sticky", left:0, zIndex:10, background:rowBg, padding:"10px 14px", borderRight:`2px solid ${T.cinzaBorda}`, borderBottom:`1px solid ${T.cinzaBorda}`, minWidth:150, width:150 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                            <div style={{ width:10, height:10, borderRadius:5, background:fase.cor||"#2E7D32", flexShrink:0 }} />
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:700, color:T.cinza1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as any, maxWidth:110 }}>{fase.nome}</div>
                              <div style={{ fontSize:10, color:stCor, fontWeight:600 }}>{stEmoji} {fase.progresso||0}%</div>
                            </div>
                          </div>
                        </td>
                        {/* Células por semana */}
                        {semanas.map((sem, si) => {
                          const semFim = new Date(sem.getTime() + 6*86400000);
                          const ativo  = fIni <= semFim && fFim >= sem;
                          const inicio = fIni >= sem && fIni <= semFim;
                          const fim    = fFim >= sem && fFim <= semFim;
                          const isHoje = hoje >= sem && hoje <= semFim;
                          return (
                            <td key={si} style={{ minWidth:64, width:64, padding:"4px 2px", borderLeft:`1px solid ${isHoje ? T.vermelho+"60" : T.cinzaBorda}`, borderBottom:`1px solid ${T.cinzaBorda}`, background: isHoje ? T.vermelho+"08" : rowBg, verticalAlign:"middle" }}>
                              {ativo && (
                                <div style={{
                                  height:32,
                                  background: fase.cor || "#2E7D32",
                                  opacity: fase.status==="concluida" ? 1 : 0.82,
                                  borderRadius: inicio && fim ? 8 : inicio ? "8px 0 0 8px" : fim ? "0 8px 8px 0" : 0,
                                  marginLeft: inicio ? 4 : 0,
                                  marginRight: fim ? 4 : 0,
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                }}>
                                  {(inicio || fim) && <span style={{ fontSize:9, color:"#fff", fontWeight:800 }}>{fase.progresso||0}%</span>}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Rodapé */}
          <div style={{ padding:"10px 20px", borderTop:`1px solid ${T.cinzaBorda}`, background:T.fundoCard, display:"flex", gap:20, alignItems:"center", flexShrink:0, flexWrap:"wrap" as any }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:T.cinza3 }}>
              <div style={{ width:16, height:4, background:T.vermelho, borderRadius:2 }} />
              Coluna vermelha = Hoje
            </div>
            <div style={{ fontSize:11, color:T.cinza3 }}>✅ {concluidas} concluída(s) · 🔄 {emAndamento} em andamento · ⏳ {fases.length - concluidas - emAndamento} pendente(s)</div>
            <div style={{ fontSize:11, color:T.cinza3, marginLeft:"auto" }}>
              {minData.toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"})} → {maxData.toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"})}
            </div>
          </div>
        </div>
      )}

      {modal && (
        <Modal titulo={editando ? "✏️ Editar Fase" : "📅 Nova Fase"} onFechar={() => { setModal(false); setEditando(null); setNova({ nome:"", inicio:"", fim:"", responsavel:"", cor:"#2E7D32", progresso:0 }); }}>
          <Input label="Nome da fase *" value={nova.nome} onChange={e=>setNova(p=>({...p,nome:e.target.value}))} placeholder="Ex: Fundação" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:6 }}>Data início *</div>
              <input type="date" value={nova.inicio} onChange={e=>setNova(p=>({...p,inicio:e.target.value}))} style={{ width:"100%", padding:"11px 10px", borderRadius:10, border:`1.5px solid ${T.cinzaBorda}`, fontSize:13, fontFamily:"inherit", boxSizing:"border-box" as any }} />
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:6 }}>Data fim *</div>
              <input type="date" value={nova.fim} onChange={e=>setNova(p=>({...p,fim:e.target.value}))} style={{ width:"100%", padding:"11px 10px", borderRadius:10, border:`1.5px solid ${T.cinzaBorda}`, fontSize:13, fontFamily:"inherit", boxSizing:"border-box" as any }} />
            </div>
          </div>
          <Input label="Responsável" value={nova.responsavel} onChange={e=>setNova(p=>({...p,responsavel:e.target.value}))} placeholder="Ex: João Silva" />
          <div style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, fontWeight:600, color:T.cinza2 }}>Progresso</span>
              <span style={{ fontSize:12, fontWeight:700, color:nova.cor }}>{nova.progresso}%</span>
            </div>
            <input type="range" min={0} max={100} value={nova.progresso} onChange={e=>setNova(p=>({...p,progresso:parseInt(e.target.value)||0}))} style={{ width:"100%", accentColor:nova.cor }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:8 }}>Cor</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" as any }}>
              {CORES_FASES.map(cor => (
                <div key={cor} onClick={() => setNova(p=>({...p,cor}))} style={{ width:34, height:34, borderRadius:8, background:cor, cursor:"pointer", border:`3px solid ${nova.cor===cor ? "#fff" : "transparent"}`, outline:`2px solid ${nova.cor===cor ? cor : "transparent"}`, boxSizing:"border-box" as any, transition:"all 0.2s" }} />
              ))}
            </div>
          </div>
          <Btn onClick={salvar} loading={salvando} disabled={!nova.nome.trim()||!nova.inicio||!nova.fim}>
            {editando ? "💾 Salvar alterações" : "📅 Criar fase"}
          </Btn>
        </Modal>
      )}
    </>
  );
}

// ─── PERFIL ────────────────────────────────────────────────
const PLANO_LABEL: Record<string, string> = { gratis:"🪚 Grátis", autonomo:"🔨 Autônomo", mestre:"👑 Mestre" };

function Perfil({ usuario, onLogout, onVoltar, onPlanoAtualizado }) {
  const [tela, setTela]         = useState("menu"); // menu | editar | planos | notificacoes | ajuda | senha
  const [nome, setNome]         = useState(usuario.nome || "");
  const [telefone, setTelefone] = useState(usuario.telefone || "");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso]   = useState("");
  const [senhaAtual, setSenhaAtual]   = useState("");
  const [novaSenha, setNovaSenha]     = useState("");
  const [confirmar, setConfirmar]     = useState("");
  const [erroSenha, setErroSenha]     = useState("");

  // ── SINCRONIZAR PLANO ─────────────────────────────────────
  const sincronizarPlano = async () => {
    setSalvando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        "https://puwebhhkuehlkswycqtz.supabase.co/functions/v1/verificar-pagamento",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Erro ${resp.status}: ${txt}`);
      }
      const json = await resp.json();
      const plano = json.plano || "gratis";
      onPlanoAtualizado(plano);
      setSucesso(`✅ Plano: ${PLANO_LABEL[plano] || plano}`);
      setTimeout(() => setSucesso(""), 3000);
    } catch (e: any) {
      alert("Erro ao sincronizar: " + (e?.message || "tente novamente"));
    } finally { setSalvando(false); }
  };

  // ── STRIPE ────────────────────────────────────────────────
  const assinar = async (priceId) => {
    setSalvando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        "https://puwebhhkuehlkswycqtz.supabase.co/functions/v1/criar-pagamento",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ priceId }),
        }
      );
      const { url, error } = await response.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (e) {
      alert("Erro ao processar pagamento. Tente novamente.");
    } finally { setSalvando(false); }
  };

  // ── EDITAR PERFIL ─────────────────────────────────────────
  const salvarPerfil = async () => {
    setSalvando(true);
    try {
      await supabase.from("profiles").update({ nome, telefone }).eq("id", usuario.id);
      setSucesso("Perfil atualizado com sucesso!");
      setTimeout(() => { setSucesso(""); setTela("menu"); }, 1500);
    } catch (e) {
      setSucesso("Erro ao salvar. Tente novamente.");
    } finally { setSalvando(false); }
  };

  // ── ALTERAR SENHA ─────────────────────────────────────────
  const alterarSenha = async () => {
    if (novaSenha.length < 6) { setErroSenha("Senha mínimo 6 caracteres"); return; }
    if (novaSenha !== confirmar) { setErroSenha("As senhas não coincidem"); return; }
    setSalvando(true); setErroSenha("");
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      setSucesso("Senha alterada com sucesso!");
      setSenhaAtual(""); setNovaSenha(""); setConfirmar("");
      setTimeout(() => { setSucesso(""); setTela("menu"); }, 1500);
    } catch (e) {
      setErroSenha("Erro ao alterar senha. Tente novamente.");
    } finally { setSalvando(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  // ── MENU PRINCIPAL ────────────────────────────────────────
  if (tela === "menu") return (
    <>
      <Header titulo="Perfil" subtitulo="👤 Conta" onVoltar={onVoltar} />
      <div style={{ padding:"16px 16px 100px" }}>

        {/* Avatar e dados */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:80, height:80, borderRadius:40, background:`linear-gradient(135deg, ${T.amarelo}, ${T.laranja})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:30, fontWeight:700, color:"#fff", boxShadow:`0 4px 20px ${T.amarelo}40` }}>
            {usuario.nome?.split(" ").map(n=>n[0]).join("").slice(0,2)||"MJ"}
          </div>
          <div style={{ fontSize:22, fontWeight:800, color:T.cinza1 }}>{usuario.nome}</div>
          <div style={{ fontSize:13, color:T.cinza3, marginTop:3 }}>{usuario.email}</div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:10, background:T.amareloC, color:T.amarelo, fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:20 }}>
            {usuario.perfil==="mestre" ? "👑 Mestre" : "👷 Funcionário"}
          </div>
        </div>

        {/* Plano atual */}
        <div style={{ background:`linear-gradient(135deg, ${T.cinza1} 0%, #2D2D2D 100%)`, borderRadius:14, padding:18, marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:11, color:"#888", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>Plano atual</div>
            <div style={{ fontSize:18, fontWeight:800, color:T.amarelo }}>{PLANO_LABEL[usuario.plano||"gratis"]}</div>
            <div style={{ fontSize:12, color:"#AAA", marginTop:3 }}>{usuario.plano && usuario.plano !== "gratis" ? "Plano ativo ✓" : "Upgrade para desbloquear mais recursos"}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
            <div onClick={() => setTela("planos")} style={{ background:T.amarelo, color:"#fff", fontSize:12, fontWeight:700, padding:"8px 14px", borderRadius:10, cursor:"pointer" }}>Planos →</div>
            <div onClick={sincronizarPlano} style={{ background:"rgba(255,255,255,0.1)", color:"#CCC", fontSize:11, fontWeight:600, padding:"5px 10px", borderRadius:8, cursor:"pointer" }}>🔄 Sincronizar</div>
          </div>
        </div>
        {sucesso && <div style={{ background:T.verdeC, color:T.verde, padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:12 }}>{sucesso}</div>}

        {/* Opções */}
        <div style={{ marginBottom:8 }}>
          {[
            { emoji:"👤", label:"Editar perfil",    desc:"Nome e telefone",        tela:"editar"        },
            { emoji:"🔒", label:"Alterar senha",     desc:"Mude sua senha de acesso", tela:"senha"       },
            { emoji:"🔔", label:"Notificações",      desc:"Alertas e avisos",       tela:"notificacoes"  },
            { emoji:"💰", label:"Planos e preços",   desc:"Gerencie sua assinatura", tela:"planos"       },
            { emoji:"❓", label:"Central de ajuda",  desc:"Dúvidas frequentes",      tela:"ajuda"        },
          ].map((item,i) => (
            <div key={i} onClick={() => setTela(item.tela)} style={{ display:"flex", alignItems:"center", gap:14, background:T.fundoCard, borderRadius:12, padding:"14px 16px", marginBottom:8, border:`1px solid ${T.cinzaBorda}`, cursor:"pointer", transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.amarelo+"60"; e.currentTarget.style.transform="translateX(4px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.cinzaBorda; e.currentTarget.style.transform="translateX(0)";}}
            >
              <div style={{ width:40, height:40, borderRadius:12, background:T.amareloC, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{item.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:T.cinza1 }}>{item.label}</div>
                <div style={{ fontSize:12, color:T.cinza3, marginTop:2 }}>{item.desc}</div>
              </div>
              <span style={{ color:T.cinza3, fontSize:18 }}>›</span>
            </div>
          ))}
        </div>

        {/* Sair */}
        <div onClick={handleLogout} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, background:T.vermelhoC, borderRadius:12, padding:"15px", border:`1px solid ${T.vermelho}30`, cursor:"pointer" }}>
          <span style={{ fontSize:20 }}>🚪</span>
          <span style={{ fontSize:15, fontWeight:700, color:T.vermelho }}>Sair da conta</span>
        </div>

        {/* Versão */}
        <div style={{ textAlign:"center", marginTop:20, fontSize:12, color:T.cinza3 }}>ObraFácil v1.0 BETA · Feito 🇧🇷</div>
      </div>
    </>
  );

  // ── EDITAR PERFIL ─────────────────────────────────────────
  if (tela === "editar") return (
    <>
      <Header titulo="Editar Perfil" onVoltar={() => setTela("menu")} />
      <div style={{ padding:"24px 20px" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:72, height:72, borderRadius:36, background:`linear-gradient(135deg, ${T.amarelo}, ${T.laranja})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:26, fontWeight:700, color:"#fff" }}>
            {nome?.split(" ").map(n=>n[0]).join("").slice(0,2)||"MJ"}
          </div>
        </div>
        <Input label="Nome completo" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Seu nome" />
        <Input label="Telefone / WhatsApp" value={telefone} onChange={e=>setTelefone(e.target.value)} placeholder="(11) 99999-0000" />
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:600, color:T.cinza2, marginBottom:6 }}>E-mail</div>
          <div style={{ padding:"13px 14px", borderRadius:12, background:"#F0F0F0", border:`1px solid ${T.cinzaBorda}`, fontSize:15, color:T.cinza3 }}>{usuario.email}</div>
          <div style={{ fontSize:11, color:T.cinza3, marginTop:4 }}>O e-mail não pode ser alterado</div>
        </div>
        {sucesso && <div style={{ background: sucesso.includes("Erro") ? T.vermelhoC : T.verdeC, color: sucesso.includes("Erro") ? T.vermelho : T.verde, padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>{sucesso}</div>}
        <Btn onClick={salvarPerfil} loading={salvando} disabled={!nome.trim()}>💾 Salvar alterações</Btn>
      </div>
    </>
  );

  // ── ALTERAR SENHA ─────────────────────────────────────────
  if (tela === "senha") return (
    <>
      <Header titulo="Alterar Senha" onVoltar={() => setTela("menu")} />
      <div style={{ padding:"24px 20px" }}>
        <div style={{ background:T.amareloC, border:`1px solid ${T.amarelo}30`, borderRadius:12, padding:"12px 16px", marginBottom:24, fontSize:13, color:T.cinza2, lineHeight:1.5 }}>
          🔒 Use uma senha forte com letras e números. Mínimo 6 caracteres.
        </div>
        <Input label="Nova senha" type="password" value={novaSenha} onChange={e=>setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
        {novaSenha.length > 0 && (
          <div style={{ marginTop:-8, marginBottom:16 }}>
            <div style={{ display:"flex", gap:4, marginBottom:4 }}>
              {[1,2,3,4].map(n => {
                const forca = novaSenha.length < 4 ? 1 : novaSenha.length < 6 ? 2 : novaSenha.length < 10 ? 3 : 4;
                const cores = [T.vermelho, T.laranja, T.amarelo, T.verde];
                return <div key={n} style={{ flex:1, height:4, borderRadius:2, background: n <= forca ? cores[forca-1] : T.cinzaBorda, transition:"background 0.3s" }} />;
              })}
            </div>
            <div style={{ fontSize:11, color:T.cinza3 }}>
              {novaSenha.length < 4 ? "Muito fraca" : novaSenha.length < 6 ? "Fraca" : novaSenha.length < 10 ? "Boa" : "Forte 💪"}
            </div>
          </div>
        )}
        <Input label="Confirmar nova senha" type="password" value={confirmar} onChange={e=>setConfirmar(e.target.value)} placeholder="Repita a senha" />
        {erroSenha && <div style={{ background:T.vermelhoC, color:T.vermelho, padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>⚠️ {erroSenha}</div>}
        {sucesso && <div style={{ background:T.verdeC, color:T.verde, padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>{sucesso}</div>}
        <Btn onClick={alterarSenha} loading={salvando} disabled={!novaSenha||!confirmar}>🔒 Alterar senha</Btn>
      </div>
    </>
  );

  // ── NOTIFICAÇÕES ──────────────────────────────────────────
  if (tela === "notificacoes") return (
    <>
      <Header titulo="Notificações" onVoltar={() => setTela("menu")} />
      <div style={{ padding:"24px 20px" }}>
        {[
          { titulo:"Alertas de estoque",    desc:"Avisa quando material estiver baixo",   ativo:true  },
          { titulo:"Tarefas atrasadas",     desc:"Lembrete de tarefas pendentes",          ativo:true  },
          { titulo:"Novidades do app",      desc:"Atualizações e novas funcionalidades",   ativo:false },
          { titulo:"Relatório semanal",     desc:"Resumo da semana por e-mail",            ativo:false },
        ].map((item, i) => {
          const [ativo, setAtivo] = useState(item.ativo);
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:14, background:T.fundoCard, borderRadius:12, padding:"16px", marginBottom:10, border:`1px solid ${T.cinzaBorda}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:T.cinza1 }}>{item.titulo}</div>
                <div style={{ fontSize:12, color:T.cinza3, marginTop:3 }}>{item.desc}</div>
              </div>
              <div onClick={() => setAtivo(p=>!p)} style={{ width:48, height:26, borderRadius:13, background: ativo ? T.amarelo : T.cinzaBorda, cursor:"pointer", position:"relative", transition:"background 0.3s", flexShrink:0 }}>
                <div style={{ position:"absolute", top:3, left: ativo ? 24 : 3, width:20, height:20, borderRadius:10, background:"#fff", transition:"left 0.3s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
              </div>
            </div>
          );
        })}
        <div style={{ marginTop:20, padding:16, background:T.amareloC, borderRadius:12, fontSize:13, color:T.cinza2, lineHeight:1.6 }}>
          📧 Notificações por e-mail são enviadas para <strong>{usuario.email}</strong>
        </div>
      </div>
    </>
  );

  // ── PLANOS ────────────────────────────────────────────────
  if (tela === "planos") return (
    <>
      <Header titulo="Planos e Preços" onVoltar={() => setTela("menu")} />
      <div style={{ padding:"20px 16px 100px" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:13, color:T.cinza3, marginBottom:4 }}>Plano atual</div>
          <div style={{ fontSize:22, fontWeight:800, color:T.cinza1 }}>{PLANO_LABEL[usuario.plano||"gratis"]}</div>
        </div>

        {[
          { id:"gratis", nome:"🪚 Grátis", preco:"R$ 0", periodo:"para sempre", cor:T.verde, recursos:["1 obra ativa","Checklist básico","Até 2 funcionários"], atual:true },
          { id:"autonomo", nome:"🔨 Autônomo", preco:"R$ 47", periodo:"/mês", cor:T.amarelo, recursos:["3 obras simultâneas","Até 3 funcionários","Checklist + fotos","5 orçamentos/mês","Controle de estoque"], destaque:true },
          { id:"mestre", nome:"👑 Mestre", preco:"R$ 97", periodo:"/mês", cor:T.cinza1, recursos:["Obras ilimitadas","Até 15 funcionários","Orçamentos ilimitados + PDF","Financeiro completo","Relatórios"] },
        ].map((plano,i) => (
          <div key={i} style={{ background:T.fundoCard, borderRadius:16, padding:24, marginBottom:14, border:`2px solid ${plano.destaque ? T.amarelo : plano.atual ? T.verde : T.cinzaBorda}`, position:"relative", boxShadow: plano.destaque ? `0 4px 20px ${T.amarelo}20` : "none" }}>
            {plano.destaque && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:T.amarelo, color:"#fff", fontSize:11, fontWeight:700, padding:"4px 14px", borderRadius:20 }}>⭐ Mais popular</div>}
            {plano.atual && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:T.verde, color:"#fff", fontSize:11, fontWeight:700, padding:"4px 14px", borderRadius:20 }}>✓ Plano atual</div>}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div style={{ fontSize:18, fontWeight:800, color: plano.destaque ? T.amarelo : T.cinza1 }}>{plano.nome}</div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:26, fontWeight:900, color: plano.destaque ? T.amarelo : T.cinza1 }}>{plano.preco}</div>
                <div style={{ fontSize:12, color:T.cinza3 }}>{plano.periodo}</div>
              </div>
            </div>
            {plano.recursos.map((r,j) => (
              <div key={j} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ color: plano.destaque ? T.amarelo : T.verde, fontWeight:700 }}>✓</span>
                <span style={{ fontSize:13, color:T.cinza2 }}>{r}</span>
              </div>
            ))}
            {!plano.atual && (
              <button
                onClick={() => assinar(plano.id === "autonomo" ? "price_1TZUEgFJt0Umuncs25n4DLJq" : "price_1TZUFJFJt0UmuncsPpaqd4L4")}
                disabled={salvando}
                style={{ width:"100%", marginTop:16, padding:"12px", border:"none", borderRadius:10, background: plano.destaque ? T.amarelo : T.cinza1, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", opacity: salvando ? 0.7 : 1 }}>
                {salvando ? "⏳ Aguarde..." : "Assinar agora →"}
              </button>
            )}
          </div>
        ))}

        <div style={{ textAlign:"center", padding:"16px", fontSize:13, color:T.cinza3 }}>
          ✓ Cancele quando quiser &nbsp;·&nbsp; ✓ Sem multa &nbsp;·&nbsp; ✓ Suporte BR
        </div>
      </div>
    </>
  );

  // ── AJUDA ─────────────────────────────────────────────────
  if (tela === "ajuda") return (
    <>
      <Header titulo="Central de Ajuda" onVoltar={() => setTela("menu")} />
      <div style={{ padding:"20px 16px 100px" }}>

        <div style={{ background:`linear-gradient(135deg, ${T.amarelo}, ${T.laranja})`, borderRadius:14, padding:20, marginBottom:24, textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>👷</div>
          <div style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:4 }}>Precisa de ajuda?</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>Fale com a gente pelo WhatsApp</div>
          <button style={{ marginTop:14, padding:"10px 24px", background:"#fff", border:"none", borderRadius:10, color:T.amarelo, fontWeight:700, fontSize:14, cursor:"pointer" }}>
            📱 Chamar no WhatsApp
          </button>
        </div>

        <div style={{ fontSize:14, fontWeight:700, color:T.cinza1, marginBottom:14 }}>Dúvidas frequentes</div>

        {[
          { p:"Como adicionar funcionários?",     r:"Vá em uma obra, clique em equipe e convide pelo e-mail do funcionário. Ele precisa ter uma conta no ObraFácil." },
          { p:"Como funciona o checklist?",       r:"Crie tarefas para cada obra e atribua para um funcionário. Ele marca como concluído pelo celular e você vê em tempo real." },
          { p:"Meus dados estão seguros?",        r:"Sim! Usamos Supabase com criptografia de ponta a ponta. Seus dados nunca são compartilhados com terceiros." },
          { p:"Posso usar sem internet na obra?", r:"O app funciona offline para visualizar tarefas. Quando voltar a internet, tudo sincroniza automaticamente." },
          { p:"Como cancelar minha assinatura?",  r:"Acesse Planos e Preços e clique em cancelar. Sem burocracia, sem multa. Seus dados ficam por 30 dias." },
        ].map((faq, i) => {
          const [aberto, setAberto] = useState(false);
          return (
            <div key={i} style={{ background:T.fundoCard, borderRadius:12, marginBottom:8, border:`1px solid ${T.cinzaBorda}`, overflow:"hidden" }}>
              <div onClick={() => setAberto(p=>!p)} style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}>
                <span style={{ fontSize:14, fontWeight:600, color:T.cinza1, flex:1, paddingRight:10 }}>{faq.p}</span>
                <span style={{ color:T.amarelo, fontSize:16, transition:"transform 0.3s", transform: aberto ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </div>
              {aberto && (
                <div style={{ padding:"0 16px 14px", fontSize:13, color:T.cinza2, lineHeight:1.6, borderTop:`1px solid ${T.cinzaBorda}`, paddingTop:12 }}>
                  {faq.r}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ marginTop:20, textAlign:"center" }}>
          <div style={{ fontSize:13, color:T.cinza3, marginBottom:8 }}>Versão 1.0 BETA</div>
          <div style={{ fontSize:12, color:T.cinza3 }}>Feito com 🧱 para mestres de obras do Brasil</div>
        </div>
      </div>
    </>
  );

  return null;
}



// ─── DETALHE DA OBRA ───────────────────────────────────────
function ObraDetalhe({ obra, onVoltar, usuario }) {
  const [aba, setAba]               = useState("tarefas");
  const [tarefas, setTarefas]       = useState([]);
  const [fotos, setFotos]           = useState([]);
  const [membros, setMembros]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadingFotos, setLoadingFotos] = useState(false);
  const [modalConvidar, setModalConvidar] = useState(false);
  const [emailConvite, setEmailConvite]   = useState("");
  const [convidando, setConvidando] = useState(false);
  const [uploadando, setUploadando] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [excluindo, setExcluindo]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const podePagar = usuario.plano === "autonomo" || usuario.plano === "mestre";
  const ehDono    = obra.dono_id === usuario.id;

  const carregarTarefas = useCallback(async () => {
    setLoading(true);
    supabase.from("tarefas").select("*").eq("obra_id", obra.id).order("criado_em", { ascending:true })
      .then(({ data }) => { setTarefas(data || []); setLoading(false); });
  }, [obra.id]);

  const carregarMembros = useCallback(async () => {
    const { data } = await supabase.rpc("get_obra_membros", { p_obra_id: obra.id });
    setMembros(data || []);
  }, [obra.id]);

  const carregarFotos = useCallback(async () => {
    setLoadingFotos(true);
    try {
      const { data } = await supabase.storage.from("fotos-tarefas").list(`obras/${obra.id}`, { sortBy: { column:"created_at", order:"desc" } });
      if (data) {
        setFotos(data.map(f => ({
          name: f.name,
          url: supabase.storage.from("fotos-tarefas").getPublicUrl(`obras/${obra.id}/${f.name}`).data.publicUrl,
        })));
      }
    } finally { setLoadingFotos(false); }
  }, [obra.id]);

  useEffect(() => { carregarTarefas(); }, [carregarTarefas]);
  useEffect(() => { carregarMembros(); }, [carregarMembros]);
  useEffect(() => { if (aba === "fotos") carregarFotos(); }, [aba, carregarFotos]);

  const adicionarFoto = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadando(true);
    try {
      const path = `obras/${obra.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("fotos-tarefas").upload(path, file);
      if (error) throw error;
      await carregarFotos();
    } catch (err: any) {
      alert("Erro ao enviar foto: " + (err?.message || "tente novamente"));
    } finally {
      setUploadando(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const excluirFoto = async (nome: string) => {
    if (!window.confirm("Excluir esta foto?")) return;
    const { error } = await supabase.storage.from("fotos-tarefas").remove([`obras/${obra.id}/${nome}`]);
    if (error) { alert("Erro ao excluir foto: " + error.message); return; }
    await carregarFotos();
  };

  const excluir = async () => {
    setExcluindo(true);
    try {
      const { error } = await supabase.from("obras").delete().eq("id", obra.id);
      if (error) throw error;
      setModalExcluir(false);
      onVoltar();
    } catch (e: any) {
      alert("Erro ao excluir obra: " + (e?.message || "tente novamente"));
    } finally { setExcluindo(false); }
  };

  const convidar = async () => {
    if (!emailConvite.trim()) return;
    setConvidando(true);
    try {
      const { data: perfil, error: erroP } = await supabase.from("profiles").select("id, nome").eq("email", emailConvite.trim()).maybeSingle();
      if (erroP || !perfil) { alert("Usuário não encontrado com este e-mail."); return; }
      const { error: erroI } = await supabase.from("obra_funcionarios").insert({ obra_id: obra.id, funcionario_id: perfil.id });
      if (erroI && !erroI.message?.includes("duplicate") && !erroI.message?.includes("unique")) throw erroI;
      await supabase.from("notificacoes").insert({ usuario_id: perfil.id, tipo:"convite_obra", mensagem:`Você foi convidado para a obra "${obra.nome}"`, obra_id: obra.id });
      alert(`✅ ${perfil.nome || emailConvite} convidado com sucesso!`);
      setModalConvidar(false); setEmailConvite("");
    } catch (err: any) {
      alert("Erro ao convidar: " + (err?.message || "tente novamente"));
    } finally { setConvidando(false); }
  };

  const STobra  = { em_andamento:{ label:"Em andamento", cor:T.verde, fundo:T.verdeC }, atencao:{ label:"Atenção", cor:T.amarelo, fundo:T.amareloC }, atrasado:{ label:"Atrasado", cor:T.vermelho, fundo:T.vermelhoC }, pausada:{ label:"Pausada", cor:T.cinza3, fundo:"#F5F5F5" }, concluida:{ label:"Concluída", cor:T.verde, fundo:T.verdeC } };
  const STtarefa = { pendente:{ label:"Pendente", cor:T.cinza3, fundo:"#F0F0F0" }, em_andamento:{ label:"Andamento", cor:T.amarelo, fundo:T.amareloC }, concluida:{ label:"Concluída", cor:T.verde, fundo:T.verdeC } };
  const st  = STobra[obra.status] || STobra.em_andamento;
  const conc = tarefas.filter(t => t.status === "concluida").length;

  return (
    <>
      <Header titulo={obra.nome} subtitulo="← Obras" onVoltar={onVoltar}
        acao={
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <Badge label={st.label} cor={st.cor} fundo={st.fundo} />
            <button onClick={() => setModalConvidar(true)} style={{ background:T.amareloC, border:"none", borderRadius:8, padding:"6px 10px", color:T.amarelo, fontWeight:700, fontSize:12, cursor:"pointer" }}>👷+</button>
          </div>
        }
      />
      <div style={{ padding:"16px 16px 100px" }}>
        <div style={{ background:T.fundoCard, borderRadius:14, padding:16, border:`1px solid ${T.cinzaBorda}`, marginBottom:16 }}>
          {obra.endereco && <div style={{ fontSize:12, color:T.cinza3, marginBottom:6 }}>📍 {obra.endereco}</div>}
          <div style={{ fontSize:12, color:T.cinza3, marginBottom:10 }}>🔧 Fase: {obra.fase_atual || "—"}</div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:12, color:T.cinza3 }}>Progresso</span>
            <span style={{ fontSize:12, fontWeight:700, color:st.cor }}>{obra.progresso||0}%</span>
          </div>
          <ProgBar valor={obra.progresso||0} cor={st.cor} />
        </div>

        {membros.length > 0 && (
          <div style={{ background:T.fundoCard, borderRadius:14, padding:16, border:`1px solid ${T.cinzaBorda}`, marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.cinza1, marginBottom:12 }}>👷 Equipe ({membros.length})</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {membros.map((m: any, i: number) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:34, height:34, borderRadius:17, background:`linear-gradient(135deg,${T.amarelo},${T.laranja})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>
                    {(m.nome||"?").split(" ").map((n: string) => n[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:T.cinza1 }}>{m.nome || "—"}</div>
                    <div style={{ fontSize:11, color:T.cinza3 }}>{m.perfil === "mestre" ? "👑 Mestre" : "👷 Funcionário"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[{ id:"tarefas", emoji:"✅", label:"Tarefas" },{ id:"fotos", emoji:"📸", label:"Fotos" }].map(tab => (
            <button key={tab.id} onClick={() => setAba(tab.id)} style={{ flex:1, padding:"10px", border:`1.5px solid ${aba===tab.id ? T.amarelo : T.cinzaBorda}`, borderRadius:12, background: aba===tab.id ? T.amareloC : T.fundoCard, color: aba===tab.id ? T.amarelo : T.cinza3, fontWeight:700, fontSize:13, cursor:"pointer" }}>
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {aba === "tarefas" && (
          <>
            <div style={{ fontSize:14, fontWeight:700, color:T.cinza1, marginBottom:12 }}>
              ✅ Tarefas <span style={{ fontSize:12, fontWeight:500, color:T.cinza3 }}>({conc}/{tarefas.length} concluídas)</span>
            </div>
            {loading ? <Spinner /> : tarefas.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:T.cinza3 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
                <div style={{ fontSize:14 }}>Nenhuma tarefa nesta obra</div>
              </div>
            ) : tarefas.map(t => {
              const ts = STtarefa[t.status] || STtarefa.pendente;
              return (
                <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, background:T.fundoCard, borderRadius:12, padding:"12px 14px", marginBottom:8, border:`1px solid ${t.prioridade==="urgente" ? T.vermelho+"40" : T.cinzaBorda}` }}>
                  <div style={{ width:20, height:20, borderRadius:5, flexShrink:0, border:`2px solid ${t.status==="concluida" ? T.verde : T.cinzaBorda}`, background: t.status==="concluida" ? T.verde : "transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {t.status==="concluida" && <span style={{ color:"#fff", fontSize:11 }}>✓</span>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color: t.status==="concluida" ? T.cinza3 : T.cinza1, textDecoration: t.status==="concluida" ? "line-through" : "none" }}>{t.titulo}</div>
                    {t.instrucoes && <div style={{ fontSize:11, color:T.cinza3, marginTop:2 }}>{t.instrucoes.slice(0,60)}{t.instrucoes.length>60?"...":""}</div>}
                  </div>
                  <Badge label={ts.label} cor={ts.cor} fundo={ts.fundo} />
                </div>
              );
            })}
          </>
        )}

        {aba === "fotos" && (
          <>
            <input ref={fileRef} type="file" accept="image/*" onChange={adicionarFoto} style={{ display:"none" }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploadando} style={{ width:"100%", padding:"12px", background:T.amareloC, border:`1.5px dashed ${T.amarelo}`, borderRadius:12, color:T.amarelo, fontWeight:700, fontSize:14, cursor:"pointer", marginBottom:16 }}>
              {uploadando ? "⏳ Enviando..." : "📷 Adicionar foto"}
            </button>
            {loadingFotos ? <Spinner /> : fotos.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:T.cinza3 }}>
                <div style={{ fontSize:40, marginBottom:8 }}>📸</div>
                <div style={{ fontSize:14 }}>Nenhuma foto ainda</div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {fotos.map((f: any, i: number) => (
                  <div key={i} style={{ position:"relative", borderRadius:12, overflow:"hidden", border:`1px solid ${T.cinzaBorda}`, aspectRatio:"1/1", background:"#EEE" }}>
                    <a href={f.url} target="_blank" rel="noreferrer" style={{ display:"block", width:"100%", height:"100%" }}>
                      <img src={f.url} alt={f.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    </a>
                    <button
                      onClick={e => { e.preventDefault(); e.stopPropagation(); excluirFoto(f.name); }}
                      style={{ position:"absolute", top:6, right:6, width:28, height:28, borderRadius:14, background:"rgba(0,0,0,0.6)", border:"none", color:"#fff", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}
                    >🗑</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {ehDono && podePagar && (
        <div style={{ padding:"0 16px 32px" }}>
          <button onClick={() => setModalExcluir(true)} style={{ width:"100%", padding:"12px", background:T.vermelhoC, border:`1.5px solid ${T.vermelho}40`, borderRadius:12, color:T.vermelho, fontWeight:700, fontSize:14, cursor:"pointer" }}>
            🗑️ Excluir obra
          </button>
        </div>
      )}

      {modalExcluir && (
        <Modal titulo="Excluir obra?" onFechar={() => setModalExcluir(false)}>
          <div style={{ textAlign:"center", padding:"8px 0 20px" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🗑️</div>
            <div style={{ fontSize:15, fontWeight:700, color:T.cinza1, marginBottom:8 }}>{obra.nome}</div>
            <div style={{ fontSize:13, color:T.cinza3, marginBottom:24, lineHeight:1.6 }}>
              Esta ação é permanente. Todas as tarefas, fotos e membros desta obra serão removidos.
            </div>
            <Btn onClick={excluir} loading={excluindo} cor={T.vermelho}>🗑️ Confirmar exclusão</Btn>
            <button onClick={() => setModalExcluir(false)} style={{ marginTop:10, width:"100%", padding:"11px", background:"none", border:"none", color:T.cinza3, fontSize:14, cursor:"pointer" }}>Cancelar</button>
          </div>
        </Modal>
      )}

      {modalConvidar && (
        <Modal titulo="Adicionar à obra 👷" onFechar={() => { setModalConvidar(false); setEmailConvite(""); }}>
          <div style={{ fontSize:13, color:T.cinza3, marginBottom:16, lineHeight:1.5 }}>
            Qualquer usuário com conta ativa no ObraFácil pode ser adicionado — mestre ou funcionário.
          </div>
          <Input label="E-mail do usuário *" type="email" value={emailConvite} onChange={e=>setEmailConvite(e.target.value)} placeholder="usuario@email.com" />
          <Btn onClick={convidar} loading={convidando} disabled={!emailConvite.trim()}>👷 Adicionar à obra</Btn>
        </Modal>
      )}
    </>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────
export default function App() {
  const [usuario, setUsuario]   = useState(null);
  const [aba, setAba]           = useState("dashboard");
  const [obraSel, setObraSel]   = useState(null);
  const [checando, setChecando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) carregarPerfil(session.user);
      else setChecando(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) carregarPerfil(session.user);
      else { setUsuario(null); setChecando(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const carregarPerfil = async (user) => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!data?.email) {
        await supabase.from("profiles").update({ email: user.email }).eq("id", user.id);
      }
      setUsuario({ ...user, ...data, email: user.email });
    } catch {
      setUsuario({ ...user, nome: user.email?.split("@")[0], perfil:"mestre" });
    } finally { setChecando(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsuario(null); setAba("dashboard"); setObraSel(null);
  };

  if (checando) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:T.fundo, fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🏗️</div>
        <div style={{ fontWeight:900, fontSize:24, letterSpacing:4, color:T.cinza1, marginBottom:16 }}>OBRAFÁCIL</div>
        <Spinner />
      </div>
    </div>
  );

  if (!usuario) return <TelaAuth onLogin={() => {}} />;

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", maxWidth:430, margin:"0 auto", minHeight:"100vh", background:T.fundo, display:"flex", flexDirection:"column" }}>
      <div style={{ flex:1, overflowY:"auto" }}>
        {obraSel ? (
          <ObraDetalhe obra={obraSel} onVoltar={() => setObraSel(null)} usuario={usuario} />
        ) : (
          <>
            {aba==="dashboard" && <Dashboard usuario={usuario} nav={setAba} onObraClick={setObraSel} />}
            {aba==="tarefas"   && <Tarefas   usuario={usuario} onVoltar={() => setAba("dashboard")} />}
            {aba==="orcamento" && <Orcamentos usuario={usuario} onVoltar={() => setAba("dashboard")} />}
            {aba==="estoque"    && <Estoque    usuario={usuario} onVoltar={() => setAba("dashboard")} />}
            {aba==="cronograma" && <Cronograma usuario={usuario} onVoltar={() => setAba("dashboard")} />}
            {aba==="perfil"    && <Perfil    usuario={usuario} onLogout={handleLogout} onVoltar={() => setAba("dashboard")} onPlanoAtualizado={(plano) => setUsuario((prev: any) => ({ ...prev, plano }))} />}
          </>
        )}
      </div>
      {!obraSel && <BottomNav aba={aba} setAba={setAba} />}
    </div>
  );
}
