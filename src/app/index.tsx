import { useState } from "react";

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

// ── DADOS GLOBAIS MOCKADOS ────────────────────────────────────────────────────
const USUARIO_MOCK = { nome:"João Silva", email:"joao@email.com", perfil:"mestre", plano:"autonomo" };

const OBRAS = [
  { id:"o1", nome:"Residência Silva", fase:"Alvenaria",  progresso:65, status:"em_dia",  funcionarios:4, tarefas:3 },
  { id:"o2", nome:"Comercial Rua 7",  fase:"Fundação",   progresso:30, status:"atencao", funcionarios:6, tarefas:5 },
  { id:"o3", nome:"Apt. Costa",       fase:"Acabamento", progresso:85, status:"atrasado",funcionarios:2, tarefas:2 },
];

const TAREFAS = [
  { id:"t1", obraId:"o1", titulo:"Misturar concreto",    responsavel:"João P.",  status:"concluida",    turno:"Manhã",  prioridade:"normal"  },
  { id:"t2", obraId:"o1", titulo:"Assentar tijolos A",   responsavel:"João P.",  status:"concluida",    turno:"Manhã",  prioridade:"normal"  },
  { id:"t3", obraId:"o1", titulo:"Molhar parede",        responsavel:"Pedro S.", status:"em_andamento", turno:"Manhã",  prioridade:"normal"  },
  { id:"t4", obraId:"o1", titulo:"Nivelar piso setor 2", responsavel:"Pedro S.", status:"pendente",     turno:"Tarde",  prioridade:"normal"  },
  { id:"t5", obraId:"o1", titulo:"Instalar forma laje",  responsavel:"Marcos L.",status:"pendente",     turno:"Tarde",  prioridade:"urgente" },
  { id:"t6", obraId:"o2", titulo:"Escavar fundação",     responsavel:"João P.",  status:"concluida",    turno:"Manhã",  prioridade:"normal"  },
  { id:"t7", obraId:"o2", titulo:"Concretar pilares",    responsavel:"Marcos L.",status:"pendente",     turno:"Tarde",  prioridade:"urgente" },
];

const ORCAMENTOS = [
  { id:"or1", cliente:"Família Lima",     total:18500, status:"aprovado",   data:"12/05" },
  { id:"or2", cliente:"Sr. Roberto Alves",total:7200,  status:"aguardando", data:"18/05" },
  { id:"or3", cliente:"Construtora Omega",total:42000, status:"recusado",   data:"05/05" },
];

const ESTOQUE = [
  { id:"e1", obraId:"o1", material:"Cimento 50kg",   unidade:"saco", atual:3,    minimo:10 },
  { id:"e2", obraId:"o1", material:"Tijolo 8 furos", unidade:"un",   atual:1200, minimo:500},
  { id:"e3", obraId:"o1", material:"Areia média",    unidade:"m³",   atual:4,    minimo:3  },
  { id:"e4", obraId:"o2", material:"Cimento 50kg",   unidade:"saco", atual:25,   minimo:10 },
];

const STATUS_OBRA = {
  em_dia:   { label:"Em dia",   cor:T.verde,   fundo:T.verdeC    },
  atencao:  { label:"Atenção",  cor:T.amarelo, fundo:T.amareloC  },
  atrasado: { label:"Atrasado", cor:T.vermelho,fundo:T.vermelhoC },
};

const STATUS_ORC = {
  aprovado:   { label:"Aprovado",   cor:T.verde,   fundo:T.verdeC    },
  aguardando: { label:"Aguardando", cor:T.amarelo, fundo:T.amareloC  },
  recusado:   { label:"Recusado",   cor:T.vermelho,fundo:T.vermelhoC },
};

const STATUS_TAR = {
  pendente:     { label:"Pendente",     cor:T.cinza3,  fundo:"#F0F0F0"  },
  em_andamento: { label:"Andamento",    cor:T.amarelo, fundo:T.amareloC },
  concluida:    { label:"Concluída",    cor:T.verde,   fundo:T.verdeC   },
};

function moeda(v) { return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits:2 }); }

// ── COMPONENTES COMPARTILHADOS ────────────────────────────────────────────────

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

function Card({ children, onClick, style={} }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background:T.fundoCard, borderRadius:14, padding:16, marginBottom:12,
        border:`1px solid ${hover && onClick ? T.amarelo+"60" : T.cinzaBorda}`,
        boxShadow: hover && onClick ? "0 6px 20px rgba(0,0,0,0.08)" : "0 2px 6px rgba(0,0,0,0.04)",
        cursor: onClick ? "pointer" : "default", transition:"all 0.2s", ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
function BottomNav({ aba, setAba, alertas=0 }) {
  const items = [
    { id:"dashboard", emoji:"🏠", label:"Início"    },
    { id:"tarefas",   emoji:"✅", label:"Tarefas"   },
    { id:"orcamento", emoji:"💰", label:"Orçamento" },
    { id:"estoque",   emoji:"📦", label:"Estoque", badge: alertas },
    { id:"perfil",    emoji:"👤", label:"Perfil"    },
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:T.fundoCard, borderTop:`1px solid ${T.cinzaBorda}`, display:"flex", padding:"10px 0 16px", boxShadow:"0 -4px 16px rgba(0,0,0,0.07)", zIndex:20 }}>
      {items.map(item => (
        <div key={item.id} onClick={() => setAba(item.id)} style={{ flex:1, textAlign:"center", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, position:"relative" }}>
          <span style={{ fontSize:21 }}>{item.emoji}</span>
          {item.badge > 0 && (
            <div style={{ position:"absolute", top:-2, right:"18%", width:16, height:16, borderRadius:8, background:T.vermelho, fontSize:9, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${T.fundoCard}` }}>{item.badge}</div>
          )}
          <span style={{ fontSize:10, fontWeight: aba===item.id ? 700 : 500, color: aba===item.id ? T.amarelo : T.cinza3 }}>{item.label}</span>
          {aba===item.id && <div style={{ width:4, height:4, borderRadius:2, background:T.amarelo }} />}
        </div>
      ))}
    </div>
  );
}

// ── HEADER ────────────────────────────────────────────────────────────────────
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

// ══════════════════════════════════════════════════════════════════════════════
// TELA: DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard({ usuario, obras, tarefas, orcamentos, estoque, nav, onObraClick }) {
  const totalFuncs   = obras.reduce((s,o)=>s+o.funcionarios,0);
  const totalTarefas = obras.reduce((s,o)=>s+o.tarefas,0);
  const alertasEst   = estoque.filter(e=>e.atual < e.minimo).length;

  return (
    <>
      <Header
        titulo={`Olá, ${usuario.nome.split(" ")[0]} 👷`}
        subtitulo="Boa tarde"
        acao={
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ position:"relative" }}>
              <span style={{ fontSize:22, cursor:"pointer" }}>🔔</span>
              {alertasEst > 0 && <div style={{ position:"absolute", top:-2, right:-2, width:10, height:10, borderRadius:5, background:T.vermelho, border:`2px solid ${T.fundoCard}` }} />}
            </div>
            <div style={{ width:34, height:34, borderRadius:17, background:T.amarelo, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, color:"#fff" }}>
              {usuario.nome.split(" ").map(n=>n[0]).join("").slice(0,2)}
            </div>
          </div>
        }
      />

      <div style={{ padding:"20px 16px 100px" }}>

        {/* LOGO */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
          <span style={{ fontWeight:900, fontSize:20, letterSpacing:4, color:T.cinza1 }}>OBRAFÁCIL</span>
          <span style={{ background:T.amareloC, color:T.amarelo, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4, letterSpacing:1 }}>BETA</span>
        </div>

        {/* STATS */}
        <div style={{ display:"flex", gap:10, marginBottom:22 }}>
          {[
            { emoji:"🏗️", valor:obras.length,    label:"Obras",       cor:T.amarelo  },
            { emoji:"👥", valor:totalFuncs,        label:"Equipe",      cor:T.cinza1   },
            { emoji:"✅", valor:totalTarefas,      label:"Tarefas",     cor:T.verde    },
            { emoji:"⚠️", valor:alertasEst,         label:"Alertas",     cor:T.vermelho },
          ].map((s,i) => (
            <div key={i} style={{ flex:1, background:T.fundoCard, borderRadius:12, padding:"12px 8px", textAlign:"center", border:`1px solid ${T.cinzaBorda}`, boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{s.emoji}</div>
              <div style={{ fontSize:20, fontWeight:800, color:s.cor, lineHeight:1 }}>{s.valor}</div>
              <div style={{ fontSize:9,  color:T.cinza3, marginTop:3, fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ALERTAS ESTOQUE */}
        {alertasEst > 0 && (
          <div onClick={() => nav("estoque")} style={{ background:T.vermelhoC, border:`1px solid ${T.vermelho}`, borderRadius:12, padding:"12px 14px", marginBottom:18, cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>🚨</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:T.vermelho }}>{alertasEst} material(is) abaixo do mínimo</div>
              <div style={{ fontSize:12, color:T.vermelho }}>Toque para ver o estoque →</div>
            </div>
          </div>
        )}

        {/* OBRAS */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:16, fontWeight:700, color:T.cinza1 }}>🏗️ Obras ativas</span>
          <div style={{ background:T.amareloC, padding:"5px 12px", borderRadius:20, fontSize:13, color:T.amarelo, fontWeight:600, cursor:"pointer" }}>+ Nova</div>
        </div>

        {obras.map(obra => {
          const st = STATUS_OBRA[obra.status];
          return (
            <Card key={obra.id} onClick={() => onObraClick(obra)}>
              <div style={{ height:4, background:st.cor, borderRadius:"4px 4px 0 0", margin:"-16px -16px 12px" }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:T.cinza1, marginBottom:2 }}>{obra.nome}</div>
                  <div style={{ fontSize:12, color:T.cinza3 }}>Fase: {obra.fase}</div>
                </div>
                <Badge label={st.label} cor={st.cor} fundo={st.fundo} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:12, color:T.cinza3 }}>Progresso</span>
                <span style={{ fontSize:12, fontWeight:700, color:st.cor }}>{obra.progresso}%</span>
              </div>
              <ProgBar valor={obra.progresso} cor={st.cor} />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, paddingTop:10, borderTop:`1px solid ${T.cinzaBorda}` }}>
                <span style={{ fontSize:12, color:T.cinza3 }}>👥 {obra.funcionarios} funcionários</span>
                <span style={{ fontSize:12, color:T.cinza3 }}>✅ {obra.tarefas} tarefas</span>
                <span style={{ fontSize:12, color:T.amarelo, fontWeight:600 }}>Ver →</span>
              </div>
            </Card>
          );
        })}

        {/* ATALHOS */}
        <div style={{ fontSize:16, fontWeight:700, color:T.cinza1, margin:"20px 0 12px" }}>🔧 Atalhos</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {[
            { emoji:"✅", label:"Tarefas",    id:"tarefas",   cor:T.verde    },
            { emoji:"💰", label:"Orçamentos", id:"orcamento", cor:T.amarelo  },
            { emoji:"📦", label:"Estoque",    id:"estoque",   cor:T.laranja  },
            { emoji:"👥", label:"Equipe",     id:"perfil",    cor:T.cinza1   },
            { emoji:"💵", label:"Financeiro", id:"dashboard", cor:T.verde    },
            { emoji:"📊", label:"Relatórios", id:"dashboard", cor:T.amarelo  },
          ].map((a,i) => (
            <div key={i} onClick={() => nav(a.id)} style={{ background:T.fundoCard, borderRadius:12, padding:14, textAlign:"center", border:`1px solid ${T.cinzaBorda}`, cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor=a.cor}
              onMouseLeave={e => e.currentTarget.style.borderColor=T.cinzaBorda}
            >
              <div style={{ width:42, height:42, borderRadius:11, background:a.cor+"15", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px", fontSize:20 }}>{a.emoji}</div>
              <div style={{ fontSize:12, fontWeight:600, color:T.cinza2 }}>{a.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TELA: DETALHE DA OBRA
// ══════════════════════════════════════════════════════════════════════════════
function DetalheObra({ obra, tarefas, estoque, onVoltar, navGlobal }) {
  const [abaObra, setAbaObra] = useState("tarefas");
  const tarefasObra  = tarefas.filter(t=>t.obraId===obra.id);
  const estoqueObra  = estoque.filter(e=>e.obraId===obra.id);
  const alertasObra  = estoqueObra.filter(e=>e.atual<e.minimo);
  const concluid     = tarefasObra.filter(t=>t.status==="concluida").length;
  const st           = STATUS_OBRA[obra.status];

  return (
    <>
      <Header titulo={obra.nome} subtitulo={`← Obras · ${obra.fase}`} onVoltar={onVoltar}
        acao={<Badge label={st.label} cor={st.cor} fundo={st.fundo} />}
      />
      <div style={{ padding:"16px 16px 100px" }}>

        {/* Mini stats da obra */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:18 }}>
          {[
            { v:obra.progresso+"%", l:"Progresso", c:st.cor  },
            { v:obra.funcionarios,   l:"Equipe",    c:T.cinza1 },
            { v:tarefasObra.length,  l:"Tarefas",   c:T.amarelo},
            { v:alertasObra.length,  l:"Alertas",   c:alertasObra.length>0?T.vermelho:T.verde },
          ].map((s,i)=>(
            <div key={i} style={{ background:T.fundoCard, borderRadius:10, padding:"10px 6px", textAlign:"center", border:`1px solid ${T.cinzaBorda}` }}>
              <div style={{ fontSize:17, fontWeight:800, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:9, color:T.cinza3, marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Barra de progresso */}
        <div style={{ marginBottom:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:12, color:T.cinza3 }}>Progresso geral</span>
            <span style={{ fontSize:12, fontWeight:700, color:st.cor }}>{obra.progresso}%</span>
          </div>
          <ProgBar valor={obra.progresso} cor={st.cor} />
        </div>

        {/* Abas da obra */}
        <div style={{ display:"flex", background:T.fundo, borderRadius:10, padding:3, marginBottom:16 }}>
          {[{id:"tarefas",label:"✅ Tarefas"},{id:"estoque",label:"📦 Estoque"},{id:"info",label:"ℹ️ Info"}].map(a=>(
            <button key={a.id} onClick={()=>setAbaObra(a.id)} style={{
              flex:1, padding:"8px 4px", border:"none", borderRadius:8,
              fontWeight:600, fontSize:12, cursor:"pointer",
              background: abaObra===a.id ? T.fundoCard : "transparent",
              color: abaObra===a.id ? T.cinza1 : T.cinza3,
              boxShadow: abaObra===a.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            }}>{a.label}</button>
          ))}
        </div>

        {/* ABA TAREFAS */}
        {abaObra==="tarefas" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontSize:13, color:T.cinza3 }}>{concluid}/{tarefasObra.length} concluídas</span>
              <span onClick={()=>navGlobal("tarefas")} style={{ fontSize:13, color:T.amarelo, fontWeight:600, cursor:"pointer" }}>Ver todas →</span>
            </div>
            {tarefasObra.map(t=>{
              const st2=STATUS_TAR[t.status];
              return (
                <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, background:T.fundoCard, borderRadius:10, padding:"12px 14px", marginBottom:8, border:`1px solid ${T.cinzaBorda}` }}>
                  <div style={{ width:20,height:20,borderRadius:5,flexShrink:0, border:`2px solid ${t.status==="concluida"?T.verde:T.cinzaBorda}`, background:t.status==="concluida"?T.verde:"transparent", display:"flex",alignItems:"center",justifyContent:"center" }}>
                    {t.status==="concluida"&&<span style={{color:"#fff",fontSize:11}}>✓</span>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color: t.status==="concluida"?T.cinza3:T.cinza1, textDecoration:t.status==="concluida"?"line-through":"none" }}>{t.titulo}</div>
                    <div style={{ fontSize:11, color:T.cinza3 }}>{t.responsavel} · {t.turno}</div>
                  </div>
                  <Badge label={st2.label} cor={st2.cor} fundo={st2.fundo} />
                  {t.prioridade==="urgente"&&<span style={{fontSize:10,color:T.vermelho,fontWeight:700}}>🔴</span>}
                </div>
              );
            })}
          </>
        )}

        {/* ABA ESTOQUE DA OBRA */}
        {abaObra==="estoque" && (
          <>
            {alertasObra.length>0&&(
              <div style={{ background:T.vermelhoC, border:`1px solid ${T.vermelho}`, borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:T.vermelho, marginBottom:4 }}>🚨 Materiais críticos</div>
                {alertasObra.map(a=><div key={a.id} style={{ fontSize:12, color:T.vermelho }}>• {a.material}: {a.atual} {a.unidade}</div>)}
              </div>
            )}
            {estoqueObra.map(item=>{
              const pct=Math.min((item.atual/Math.max(item.minimo*2,item.atual))*100,100);
              const cor=item.atual<item.minimo?T.vermelho:item.atual<item.minimo*1.5?T.amarelo:T.verde;
              return (
                <Card key={item.id}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:T.cinza1 }}>{item.material}</div>
                    <span style={{ fontSize:18, fontWeight:900, color:cor }}>{item.atual} <span style={{ fontSize:12, fontWeight:500, color:T.cinza3 }}>{item.unidade}</span></span>
                  </div>
                  <ProgBar valor={pct} cor={cor} />
                  {item.atual<item.minimo&&<div style={{ fontSize:11, color:T.vermelho, marginTop:5, fontWeight:600 }}>⚠️ Repor {item.minimo-item.atual} {item.unidade}</div>}
                </Card>
              );
            })}
            <div onClick={()=>navGlobal("estoque")} style={{ textAlign:"center", fontSize:13, color:T.amarelo, fontWeight:600, cursor:"pointer", marginTop:8 }}>Ver estoque completo →</div>
          </>
        )}

        {/* ABA INFO */}
        {abaObra==="info" && (
          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:T.cinza3, letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>Informações da obra</div>
            {[
              { label:"Nome",       valor:obra.nome },
              { label:"Fase atual", valor:obra.fase },
              { label:"Progresso",  valor:`${obra.progresso}%` },
              { label:"Status",     valor:STATUS_OBRA[obra.status].label },
              { label:"Equipe",     valor:`${obra.funcionarios} funcionários` },
            ].map((i,idx)=>(
              <div key={idx} style={{ display:"flex", justifyContent:"space-between", paddingBottom:10, marginBottom:10, borderBottom:`1px solid ${T.cinzaBorda}` }}>
                <span style={{ fontSize:13, color:T.cinza3 }}>{i.label}</span>
                <span style={{ fontSize:13, fontWeight:600, color:T.cinza1 }}>{i.valor}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TELA: TAREFAS
// ══════════════════════════════════════════════════════════════════════════════
function Tarefas({ tarefas, obras }) {
  const [obraFiltro, setObraFiltro] = useState("todas");
  const filtradas = obraFiltro==="todas" ? tarefas : tarefas.filter(t=>t.obraId===obraFiltro);
  const concluid  = filtradas.filter(t=>t.status==="concluida").length;

  return (
    <>
      <Header titulo="Tarefas" subtitulo="✅ Módulo" acao={<div style={{ background:T.amareloC, padding:"5px 12px", borderRadius:20, fontSize:13, color:T.amarelo, fontWeight:600, cursor:"pointer" }}>+ Nova</div>} />
      <div style={{ padding:"16px 16px 100px" }}>

        {/* Filtro por obra */}
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, marginBottom:14 }}>
          <button onClick={()=>setObraFiltro("todas")} style={{ padding:"6px 14px", border:`1.5px solid ${obraFiltro==="todas"?T.amarelo:T.cinzaBorda}`, borderRadius:20, background:obraFiltro==="todas"?T.amareloC:T.fundoCard, color:obraFiltro==="todas"?T.amarelo:T.cinza3, fontWeight:600, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>Todas obras</button>
          {obras.map(o=>(
            <button key={o.id} onClick={()=>setObraFiltro(o.id)} style={{ padding:"6px 14px", border:`1.5px solid ${obraFiltro===o.id?T.amarelo:T.cinzaBorda}`, borderRadius:20, background:obraFiltro===o.id?T.amareloC:T.fundoCard, color:obraFiltro===o.id?T.amarelo:T.cinza3, fontWeight:600, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>{o.nome.split(" ")[0]}</button>
          ))}
        </div>

        {/* Progresso */}
        <div style={{ marginBottom:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:13, color:T.cinza3 }}>Progresso geral</span>
            <span style={{ fontSize:13, fontWeight:700, color:T.verde }}>{concluid}/{filtradas.length} concluídas</span>
          </div>
          <ProgBar valor={filtradas.length>0?(concluid/filtradas.length)*100:0} cor={T.verde} />
        </div>

        {filtradas.map(t=>{
          const st=STATUS_TAR[t.status];
          const obra=obras.find(o=>o.id===t.obraId);
          return (
            <div key={t.id} style={{ background:T.fundoCard, borderRadius:12, padding:14, marginBottom:10, border:`1px solid ${t.prioridade==="urgente"?T.vermelho+"40":T.cinzaBorda}`, boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}>
              {t.prioridade==="urgente"&&<div style={{ height:3, background:T.vermelho, borderRadius:"4px 4px 0 0", margin:"-14px -14px 12px" }} />}
              <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                <div style={{ width:22,height:22,borderRadius:6,flexShrink:0,border:`2px solid ${t.status==="concluida"?T.verde:T.cinzaBorda}`,background:t.status==="concluida"?T.verde:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginTop:1 }}>
                  {t.status==="concluida"&&<span style={{color:"#fff",fontSize:12}}>✓</span>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:t.status==="concluida"?T.cinza3:T.cinza1, textDecoration:t.status==="concluida"?"line-through":"none", marginBottom:5 }}>{t.titulo}</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, color:T.cinza3 }}>👤 {t.responsavel}</span>
                    <span style={{ fontSize:11, color:T.cinza3 }}>🏗️ {obra?.nome}</span>
                    <span style={{ fontSize:11, color:T.cinza3 }}>{t.turno}</span>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5 }}>
                  <Badge label={st.label} cor={st.cor} fundo={st.fundo} />
                  {t.prioridade==="urgente"&&<span style={{ fontSize:10, color:T.vermelho, fontWeight:700 }}>🔴 Urgente</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TELA: ORÇAMENTO (resumida)
// ══════════════════════════════════════════════════════════════════════════════
function Orcamento({ orcamentos }) {
  const tot = { aprovado:0, aguardando:0, recusado:0 };
  orcamentos.forEach(o => { tot[o.status] = (tot[o.status]||0) + o.total; });

  return (
    <>
      <Header titulo="Orçamentos" subtitulo="💰 Módulo" acao={<div style={{ background:T.amareloC, padding:"5px 12px", borderRadius:20, fontSize:13, color:T.amarelo, fontWeight:600, cursor:"pointer" }}>+ Novo</div>} />
      <div style={{ padding:"16px 16px 100px" }}>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
          {[
            { label:"Aprovados",  valor:tot.aprovado,   cor:T.verde,   fundo:T.verdeC    },
            { label:"Aguardando", valor:tot.aguardando, cor:T.amarelo, fundo:T.amareloC  },
            { label:"Perdidos",   valor:tot.recusado,   cor:T.vermelho,fundo:T.vermelhoC },
          ].map((s,i)=>(
            <div key={i} style={{ background:s.fundo, borderRadius:12, padding:"12px 8px", textAlign:"center", border:`1px solid ${s.cor}30` }}>
              <div style={{ fontSize:13, fontWeight:800, color:s.cor }}>{s.valor>=1000?`R$${(s.valor/1000).toFixed(0)}k`:moeda(s.valor)}</div>
              <div style={{ fontSize:10, color:s.cor, fontWeight:600, marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {orcamentos.map(o=>{
          const st=STATUS_ORC[o.status];
          return (
            <Card key={o.id} onClick={()=>{}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div style={{ fontSize:15, fontWeight:700, color:T.cinza1 }}>{o.cliente}</div>
                <Badge label={st.label} cor={st.cor} fundo={st.fundo} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:`1px solid ${T.cinzaBorda}` }}>
                <span style={{ fontSize:16, fontWeight:800, color:T.cinza1 }}>{moeda(o.total)}</span>
                <span style={{ fontSize:12, color:T.cinza3 }}>{o.data}</span>
                <span style={{ fontSize:12, color:T.amarelo, fontWeight:600 }}>Abrir →</span>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TELA: ESTOQUE (resumida)
// ══════════════════════════════════════════════════════════════════════════════
function Estoque({ estoque }) {
  const alertas = estoque.filter(e=>e.atual<e.minimo);
  return (
    <>
      <Header titulo="Estoque" subtitulo="📦 Módulo" acao={<div style={{ background:T.amareloC, padding:"5px 12px", borderRadius:20, fontSize:13, color:T.amarelo, fontWeight:600, cursor:"pointer" }}>+ Item</div>} />
      <div style={{ padding:"16px 16px 100px" }}>
        {alertas.length>0&&(
          <div style={{ background:T.vermelhoC, border:`1px solid ${T.vermelho}`, borderRadius:12, padding:"12px 14px", marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.vermelho, marginBottom:6 }}>🚨 {alertas.length} material(is) crítico(s)</div>
            {alertas.map(a=><div key={a.id} style={{ fontSize:12, color:T.vermelho }}>• {a.material}: {a.atual}/{a.minimo} {a.unidade}</div>)}
          </div>
        )}
        {estoque.map(item=>{
          const pct=Math.min((item.atual/Math.max(item.minimo*2,item.atual))*100,100);
          const cor=item.atual<item.minimo?T.vermelho:item.atual<item.minimo*1.5?T.amarelo:T.verde;
          return (
            <Card key={item.id}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div style={{ fontSize:14, fontWeight:700, color:T.cinza1 }}>{item.material}</div>
                <span style={{ fontSize:20, fontWeight:900, color:cor, lineHeight:1 }}>{item.atual} <span style={{ fontSize:12, color:T.cinza3, fontWeight:500 }}>{item.unidade}</span></span>
              </div>
              <ProgBar valor={pct} cor={cor} />
              {item.atual<item.minimo&&<div style={{ fontSize:11, color:T.vermelho, marginTop:5, fontWeight:600 }}>⚠️ Repor {item.minimo-item.atual} {item.unidade}</div>}
              <div style={{ display:"flex", gap:8, marginTop:12 }}>
                <button style={{ flex:1, padding:"7px", background:T.verdeC, border:`1px solid ${T.verde}`, borderRadius:8, color:T.verde, fontWeight:700, fontSize:12, cursor:"pointer" }}>↑ Entrada</button>
                <button style={{ flex:1, padding:"7px", background:T.vermelhoC, border:`1px solid ${T.vermelho}`, borderRadius:8, color:T.vermelho, fontWeight:700, fontSize:12, cursor:"pointer" }}>↓ Saída</button>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TELA: PERFIL
// ══════════════════════════════════════════════════════════════════════════════
function Perfil({ usuario, onLogout }) {
  const planos = { autonomo:"Autônomo · R$47/mês", mestre:"Mestre · R$97/mês", gratis:"Grátis" };
  return (
    <>
      <Header titulo="Perfil" subtitulo="👤 Conta" />
      <div style={{ padding:"16px 16px 100px" }}>

        {/* Avatar */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:72, height:72, borderRadius:36, background:T.amarelo, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:26, fontWeight:700, color:"#fff" }}>
            {usuario.nome.split(" ").map(n=>n[0]).join("").slice(0,2)}
          </div>
          <div style={{ fontSize:20, fontWeight:800, color:T.cinza1 }}>{usuario.nome}</div>
          <div style={{ fontSize:13, color:T.cinza3, marginTop:3 }}>{usuario.email}</div>
          <div style={{ display:"inline-block", marginTop:8, background:T.amareloC, color:T.amarelo, fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20 }}>
            {planos[usuario.plano] || "Grátis"}
          </div>
        </div>

        {/* Opções */}
        {[
          { emoji:"👤", label:"Editar perfil"         },
          { emoji:"🔔", label:"Notificações"          },
          { emoji:"🔒", label:"Alterar senha"          },
          { emoji:"💰", label:"Gerenciar plano"        },
          { emoji:"📱", label:"Sobre o app"            },
          { emoji:"❓", label:"Central de ajuda"       },
        ].map((item,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:14, background:T.fundoCard, borderRadius:12, padding:"14px 16px", marginBottom:8, border:`1px solid ${T.cinzaBorda}`, cursor:"pointer" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=T.amarelo+"60"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=T.cinzaBorda}
          >
            <span style={{ fontSize:20 }}>{item.emoji}</span>
            <span style={{ flex:1, fontSize:14, fontWeight:500, color:T.cinza1 }}>{item.label}</span>
            <span style={{ color:T.cinza3 }}>›</span>
          </div>
        ))}

        <div onClick={onLogout} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:T.vermelhoC, borderRadius:12, padding:"14px", marginTop:8, border:`1px solid ${T.vermelho}40`, cursor:"pointer" }}>
          <span style={{ fontSize:20 }}>🚪</span>
          <span style={{ fontSize:14, fontWeight:700, color:T.vermelho }}>Sair da conta</span>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP ROOT — NAVEGAÇÃO GLOBAL
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [aba, setAba]                 = useState("dashboard");
  const [obraSelecionada, setObraSelecionada] = useState(null);
  const [usuario, setUsuario]         = useState(null);

  const alertasEstoque = ESTOQUE.filter(e=>e.atual<e.minimo).length;

  // TELA DE LOGIN SIMPLIFICADA
  if (!autenticado) {
    return (
      <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", maxWidth:430, margin:"0 auto", minHeight:"100vh", background:`linear-gradient(160deg,#1A1A1A 0%,#2D2008 100%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 32px", textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:16 }}>🏗️</div>
        <div style={{ fontWeight:900, fontSize:34, letterSpacing:6, color:T.amarelo, marginBottom:4 }}>OBRAFÁCIL</div>
        <div style={{ fontSize:13, color:"#666", letterSpacing:2, marginBottom:40 }}>NAVEGAÇÃO COMPLETA</div>

        <div style={{ width:"100%", marginBottom:16 }}>
          {[
            { perfil:"mestre",      emoji:"👑", label:"Entrar como Mestre",      desc:"Acesso completo ao app"        },
            { perfil:"funcionario", emoji:"👷", label:"Entrar como Funcionário", desc:"Vê apenas suas tarefas"        },
          ].map(p=>(
            <button key={p.perfil} onClick={()=>{ setUsuario({...USUARIO_MOCK, perfil:p.perfil}); setAutenticado(true); }} style={{
              width:"100%", padding:"16px", marginBottom:12, border:`1.5px solid rgba(255,255,255,0.15)`,
              borderRadius:14, background:"rgba(255,255,255,0.05)", cursor:"pointer",
              display:"flex", alignItems:"center", gap:14, textAlign:"left",
            }}>
              <span style={{ fontSize:28 }}>{p.emoji}</span>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:"#EEE" }}>{p.label}</div>
                <div style={{ fontSize:12, color:"#888", marginTop:2 }}>{p.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ fontSize:12, color:"#444" }}>Simulação de autenticação — sem senha necessária</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", maxWidth:430, margin:"0 auto", minHeight:"100vh", background:T.fundo, display:"flex", flexDirection:"column" }}>

      <div style={{ flex:1, overflowY:"auto" }}>
        {/* DETALHE DE OBRA — sobrepõe a aba atual */}
        {obraSelecionada ? (
          <DetalheObra
            obra={obraSelecionada}
            tarefas={TAREFAS}
            estoque={ESTOQUE}
            onVoltar={() => setObraSelecionada(null)}
            navGlobal={(a) => { setObraSelecionada(null); setAba(a); }}
          />
        ) : (
          <>
            {aba==="dashboard" && <Dashboard usuario={usuario} obras={OBRAS} tarefas={TAREFAS} orcamentos={ORCAMENTOS} estoque={ESTOQUE} nav={setAba} onObraClick={setObraSelecionada} />}
            {aba==="tarefas"   && <Tarefas   tarefas={TAREFAS} obras={OBRAS} />}
            {aba==="orcamento" && <Orcamento orcamentos={ORCAMENTOS} />}
            {aba==="estoque"   && <Estoque   estoque={ESTOQUE} />}
            {aba==="perfil"    && <Perfil    usuario={usuario} onLogout={()=>{ setAutenticado(false); setAba("dashboard"); }} />}
          </>
        )}
      </div>

      {!obraSelecionada && <BottomNav aba={aba} setAba={setAba} alertas={alertasEstoque} />}
    </div>
  );
}
