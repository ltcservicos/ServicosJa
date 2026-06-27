import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { CATEGORIAS } from '../lib/constants';

// Painel do admin — fora do app de usuário. Login admin/Taci123.
export function Admin() {
  const [logado, setLogado] = useState(!!adminApi.getToken());
  return (
    <div className="min-h-[100dvh] bg-bg text-text-main" style={{ '--accent': '#D6FF3A', '--accent-text': '#0E0E10' }}>
      <div className="max-w-[680px] mx-auto px-5 py-7">
        {logado ? <Painel onSair={() => { adminApi.setToken(null); setLogado(false); }} /> : <Login onOk={() => setLogado(true)} />}
      </div>
    </div>
  );
}

function Login({ onOk }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setLoading(true); setErro('');
    try {
      const r = await adminApi.login(usuario.trim(), senha);
      adminApi.setToken(r.token);
      onOk();
    } catch (err) {
      setErro(err.message);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={entrar} className="max-w-[360px] mx-auto pt-16 flex flex-col gap-3">
      <div className="font-display text-3xl font-extrabold mb-1">Serviço<span className="text-accent">Já.</span> <span className="text-text-mute text-base font-bold">admin</span></div>
      <div className="text-text-mute text-sm mb-3">Área restrita ao administrador.</div>
      <input value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Usuário" autoFocus
        className="bg-surface border border-border rounded-xl px-4 py-3.5 text-[16px] outline-none focus:border-accent" />
      <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha"
        className="bg-surface border border-border rounded-xl px-4 py-3.5 text-[16px] outline-none focus:border-accent" />
      {erro && <div className="text-red-400 text-sm">{erro}</div>}
      <button disabled={loading} className="min-h-[52px] rounded-xl font-bold text-[16px] bg-accent text-bg disabled:opacity-50">
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}

function Painel({ onSair }) {
  const [tab, setTab] = useState('analytics'); // analytics | importar | manual | lista | blog
  const [resumo, setResumo] = useState(null);
  const [externos, setExternos] = useState([]);
  const [msg, setMsg] = useState(null);

  const recarregar = async () => {
    try {
      const [r, e] = await Promise.all([adminApi.resumo(), adminApi.externos()]);
      setResumo(r); setExternos(e);
    } catch (err) {
      if (err.status === 401) onSair();
    }
  };
  useEffect(() => { recarregar(); }, []);

  const flash = (texto, tipo = 'ok') => { setMsg({ texto, tipo }); setTimeout(() => setMsg(null), 6000); };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div className="font-display text-2xl font-extrabold">Serviço<span className="text-accent">Já.</span> <span className="text-text-mute text-sm font-bold">admin</span></div>
        <button onClick={onSair} className="text-text-mute text-sm font-semibold hover:text-text-main">Sair</button>
      </div>

      {/* Resumo */}
      {resumo && (
        <div className="grid grid-cols-4 gap-2 mb-5">
          <Stat n={resumo.externos} l="Externos" />
          <Stat n={resumo.comWhats} l="c/ WhatsApp" />
          <Stat n={resumo.proprios} l="Próprios" />
          <Stat n={resumo.usuarios} l="Usuários" />
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-1.5 mb-4 bg-surface border border-border rounded-xl p-1 overflow-x-auto no-scrollbar">
        <TabBtn ativo={tab === 'analytics'} onClick={() => setTab('analytics')}>📊 Analytics</TabBtn>
        <TabBtn ativo={tab === 'importar'} onClick={() => setTab('importar')}>🤖 Importar</TabBtn>
        <TabBtn ativo={tab === 'manual'} onClick={() => setTab('manual')}>✍️ Manual</TabBtn>
        <TabBtn ativo={tab === 'lista'} onClick={() => setTab('lista')}>📋 ({externos.length})</TabBtn>
        <TabBtn ativo={tab === 'blog'} onClick={() => setTab('blog')}>📰 Blog</TabBtn>
      </div>

      {msg && (
        <div className={`rounded-xl px-4 py-3 mb-4 text-[14px] ${msg.tipo === 'erro' ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
          {msg.texto}
        </div>
      )}

      {tab === 'analytics' && <Analytics />}
      {tab === 'importar' && <Importar onFeito={(r) => { flash(r); recarregar(); }} onErro={(e) => flash(e, 'erro')} />}
      {tab === 'manual' && <Manual onFeito={() => { flash('Trabalho externo publicado! ✅'); recarregar(); setTab('lista'); }} onErro={(e) => flash(e, 'erro')} />}
      {tab === 'lista' && <Lista externos={externos} onRemover={async (id) => { await adminApi.remover(id); recarregar(); }} />}
      {tab === 'blog' && <Blog onFlash={flash} />}
    </>
  );
}

function Importar({ onFeito, onErro }) {
  const [categoria, setCategoria] = useState(CATEGORIAS[2].nome); // Pintura
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [somenteWhatsapp, setSomenteWhatsapp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const buscar = async () => {
    if (!cidade.trim()) { onErro('Informe a cidade'); return; }
    setLoading(true); setResult(null);
    try {
      const r = await adminApi.importar({ categoria, cidade: cidade.trim(), bairro: bairro.trim() || undefined, somenteWhatsapp });
      setResult(r);
      onFeito(
        r.publicadas > 0
          ? `Encontrei ${r.naCidade} vaga(s) de ${r.termo} em ${cidade}. ${r.comWhatsapp} com WhatsApp → ${r.publicadas} publicada(s)! ✅`
          : `Encontrei ${r.naCidade} vaga(s) em ${cidade}, mas nenhuma com WhatsApp${somenteWhatsapp ? ' (filtro ligado)' : ''}. Nada publicado.`,
      );
    } catch (e) { onErro(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">
    <Varredura onFlash={onFeito} onErro={onErro} />
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <div className="font-bold text-[17px] mb-1">Importar 1 categoria + cidade</div>
        <div className="text-text-mute text-[13.5px] leading-relaxed">
          Busca em <b>empregos.com.br</b> e <b>infojobs.com.br</b>. Com WhatsApp na descrição, o app abre o WhatsApp
          direto quando o trabalhador curte. Desmarcando o filtro abaixo, traz também anúncios sem WhatsApp
          (o app abre o anúncio original) — mais volume no feed.
        </div>
      </div>

      <Campo label="Segmento">
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:border-accent">
          {CATEGORIAS.map((c) => <option key={c.nome} value={c.nome}>{c.icone} {c.nome}</option>)}
        </select>
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Cidade"><input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: Guarulhos"
          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:border-accent" /></Campo>
        <Campo label="Bairro (opcional)"><input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Ex: Centro"
          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:border-accent" /></Campo>
      </div>

      <label className="flex items-center gap-2.5 text-[14px] cursor-pointer">
        <input type="checkbox" checked={somenteWhatsapp} onChange={(e) => setSomenteWhatsapp(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
        Publicar só vagas com WhatsApp do contratante
      </label>

      <button onClick={buscar} disabled={loading}
        className="min-h-[52px] rounded-xl font-bold text-[16px] bg-accent text-bg disabled:opacity-50">
        {loading ? 'Buscando em empregos.com.br + infojobs.com.br…' : '🔎 Buscar e publicar'}
      </button>

      {result && (
        <div className="text-[13px] text-text-dim bg-bg border border-border rounded-xl p-3 leading-relaxed">
          <b>{result.encontradas}</b> vagas no resultado · <b>{result.naCidade}</b> em {result.cidade} ·{' '}
          <b>{result.comWhatsapp}</b> com WhatsApp · <b className="text-emerald-400">{result.publicadas}</b> publicadas
        </div>
      )}
    </div>
    </div>
  );
}

/* Varredura noturna: Guarulhos + região, em background (a mesma do cron das ~4h) */
function Varredura({ onFlash, onErro }) {
  const [status, setStatus] = useState(null);

  const carregar = () => adminApi.varrerStatus().then(setStatus).catch(() => {});
  useEffect(() => {
    carregar();
    const id = setInterval(carregar, 8000);
    return () => clearInterval(id);
  }, []);

  const varrer = async () => {
    try {
      const r = await adminApi.varrerNoturna();
      if (r.jaRodando) { onErro('Já tem uma varredura rodando — aguarde terminar.'); return; }
      onFlash(r.mensagem);
      carregar();
    } catch (e) { onErro(e.message); }
  };

  return (
    <div className="bg-surface border border-accent/40 rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: 'linear-gradient(135deg, rgba(214,255,58,.06), transparent)' }}>
      <div>
        <div className="font-bold text-[17px] mb-1">🌙 Varredura noturna (Guarulhos + região)</div>
        <div className="text-text-mute text-[13.5px] leading-relaxed">
          Busca <b>todos os ofícios</b> na região de Guarulhos (raio 40 km, pega a zona norte de SP e a Grande SP),
          publicando link e WhatsApp; e <b>serviços em geral só com WhatsApp</b> (lead direto). Roda <b>sozinha toda
          madrugada</b> (~1h, horário de Brasília). Os trabalhos aparecem na aba "Publicados".
        </div>
      </div>

      {status?.varrendo ? (
        <div className="min-h-[48px] rounded-xl bg-bg border border-border flex items-center justify-center gap-2 text-[14px] font-bold text-accent">
          <span className="animate-pulse">⏳ Varrendo agora… pode fechar a tela, continua rodando</span>
        </div>
      ) : (
        <button onClick={varrer} className="min-h-[48px] rounded-xl font-bold text-[15px] bg-accent text-bg">
          🌙 Rodar a varredura noturna agora
        </button>
      )}

      {status?.ultima && (
        <div className="text-[12.5px] text-text-dim bg-bg border border-border rounded-xl p-3 leading-relaxed">
          Última: <b className="text-emerald-400">{status.ultima.publicadas}</b> publicadas ·{' '}
          {status.ultima.comWhatsapp ?? 0} ofícios c/ WhatsApp · {status.ultima.geralWhats ?? 0} serviços gerais ·{' '}
          {status.ultima.duracaoSeg}s
        </div>
      )}
    </div>
  );
}

function Manual({ onFeito, onErro }) {
  const [categoria, setCategoria] = useState(CATEGORIAS[2].nome);
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [descricao, setDescricao] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);

  const publicar = async () => {
    if (!cidade.trim() || descricao.trim().length < 10 || whatsapp.replace(/\D/g, '').length < 10) {
      onErro('Preencha cidade, descrição (10+ letras) e um WhatsApp válido'); return;
    }
    setLoading(true);
    try {
      await adminApi.postarExterno({ categoria, cidade: cidade.trim(), bairro: bairro.trim() || undefined, descricao: descricao.trim(), whatsapp });
      onFeito();
      setCidade(''); setBairro(''); setDescricao(''); setWhatsapp('');
    } catch (e) { onErro(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <div className="font-bold text-[17px] mb-1">Postar trabalho externo</div>
        <div className="text-text-mute text-[13.5px] leading-relaxed">
          Para trabalhos que você conhece (grupos, indicações). O trabalhador curte e fala direto no WhatsApp do contratante.
        </div>
      </div>

      <Campo label="Segmento">
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:border-accent">
          {CATEGORIAS.map((c) => <option key={c.nome} value={c.nome}>{c.icone} {c.nome}</option>)}
        </select>
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Cidade"><input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: Guarulhos"
          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:border-accent" /></Campo>
        <Campo label="Bairro (opcional)"><input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Ex: Centro"
          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:border-accent" /></Campo>
      </div>
      <Campo label="O que o contratante precisa">
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={500}
          placeholder="Ex: Precisa pintar 2 quartos, cerca de 30m². Material por conta do cliente."
          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:border-accent resize-none min-h-[90px]" />
      </Campo>
      <Campo label="WhatsApp do contratante">
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" placeholder="Com DDD. Ex: 11 99999-9999"
          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:border-accent" />
      </Campo>

      <button onClick={publicar} disabled={loading}
        className="min-h-[52px] rounded-xl font-bold text-[16px] bg-accent text-bg disabled:opacity-50">
        {loading ? 'Publicando…' : '✅ Publicar trabalho'}
      </button>
    </div>
  );
}

function Lista({ externos, onRemover }) {
  if (externos.length === 0) {
    return <div className="text-center text-text-mute py-12">Nenhum trabalho externo publicado ainda.</div>;
  }
  return (
    <div className="flex flex-col gap-2">
      {externos.map((e) => (
        <div key={e.id} className="bg-surface border border-border rounded-xl p-3.5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[15px] truncate">{e.titulo}</div>
            <div className="text-[12.5px] text-text-mute mt-0.5 flex items-center gap-2 flex-wrap">
              <span>📍 {e.cidade}</span>
              <span className={e.temWhatsapp ? 'text-emerald-400 font-semibold' : 'text-orange-400'}>
                {e.temWhatsapp ? '💬 WhatsApp' : '🔗 Link'}
              </span>
              <span>· {e.fonteNome}</span>
              <span>· 🤝 {e.interesses}</span>
            </div>
          </div>
          <button onClick={() => onRemover(e.id)} className="text-red-400 text-[13px] font-semibold px-2 py-1 hover:bg-red-500/10 rounded-lg flex-shrink-0">
            Remover
          </button>
        </div>
      ))}
    </div>
  );
}

/* ===== ANALYTICS ===== */
function Analytics() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    const load = () => adminApi.analytics().then((d) => alive && setData(d)).catch(() => {});
    load();
    const id = setInterval(load, 15000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (!data) return <div className="text-text-mute text-center py-10">Carregando…</div>;
  const c = data.cards;
  const max = Math.max(1, ...data.serie.map((d) => Math.max(d.visitas, d.cadastros, d.trabalhos, d.interesses)));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        <Big n={c.visitas} l="Visitas" />
        <Big n={c.cadastros} l="Cadastros" />
        <Big n={`${c.conversao}%`} l="Conversão" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Stat n={c.contratantes} l="Contratantes" />
        <Stat n={c.trabalhadores} l="Trabalhadores" />
        <Stat n={c.trabalhos} l="Trabalhos" />
        <Stat n={c.interesses} l="Interesses" />
      </div>

      {/* Gráfico de barras — últimos 14 dias */}
      <div className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-[15px]">Últimos 14 dias</div>
          <div className="flex gap-3 text-[11px] text-text-mute">
            <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#D6FF3A' }} />visitas</span>
            <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#60A5FA' }} />cadastros</span>
          </div>
        </div>
        <div className="flex items-end gap-1 h-[130px]">
          {data.serie.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 justify-end h-full" title={`${d.dia}: ${d.visitas} visitas, ${d.cadastros} cadastros`}>
              <div className="w-full flex items-end gap-[2px] justify-center h-full">
                <span className="w-[42%] rounded-t" style={{ height: `${(d.visitas / max) * 100}%`, background: '#D6FF3A', minHeight: d.visitas ? 3 : 0 }} />
                <span className="w-[42%] rounded-t" style={{ height: `${(d.cadastros / max) * 100}%`, background: '#60A5FA', minHeight: d.cadastros ? 3 : 0 }} />
              </div>
              <span className="text-[8px] text-text-mute">{d.dia.slice(0, 2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat n={c.conversas} l="Conversas abertas" />
        <Stat n={c.importados} l="Importados" />
      </div>
      <div className="text-[12px] text-text-mute text-center">Atualiza sozinho a cada 15s · funil: visita → cadastro → trabalho → interesse → conversa</div>
    </div>
  );
}

/* ===== BLOG ===== */
function Blog({ onFlash }) {
  const [keywords, setKeywords] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const recarregar = async () => {
    try {
      const [k, p] = await Promise.all([adminApi.blogKeywords(), adminApi.blogPosts()]);
      setKeywords(k); setPosts(p);
    } catch {}
  };
  useEffect(() => { recarregar(); }, []);

  const gerar = async (kw, agora) => {
    setLoading(true);
    try {
      const publishAt = agora ? undefined : new Date(Date.now() + 86400000).toISOString();
      const r = await adminApi.blogGerar(kw, publishAt);
      onFlash(r.status === 'PUBLICADO' ? 'Post publicado! ✅' : 'Post agendado para amanhã 🗓️');
      recarregar();
    } catch (e) { onFlash(e.message, 'erro'); }
    finally { setLoading(false); }
  };

  const agendarLote = async () => {
    setLoading(true);
    try {
      const r = await adminApi.blogAgendarLote();
      onFlash(r.agendados > 0 ? `${r.agendados} post(s) agendados — 1 por dia 🗓️` : 'Todos os posts já foram criados');
      recarregar();
    } catch (e) { onFlash(e.message, 'erro'); }
    finally { setLoading(false); }
  };

  const STATUS = { PUBLICADO: { t: '🟢 No ar', c: 'text-emerald-400' }, AGENDADO: { t: '🗓️ Agendado', c: 'text-orange-400' }, RASCUNHO: { t: 'Rascunho', c: 'text-text-mute' } };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="font-bold text-[17px] mb-1">Blog com SEO automático</div>
        <div className="text-text-mute text-[13.5px] leading-relaxed mb-3">
          Artigos otimizados para as palavras-chave mais buscadas do nicho. Geram páginas em
          <code className="text-accent"> /blog</code> com meta tags, dados estruturados e sitemap.
          Publique já ou agende.
        </div>
        <button onClick={agendarLote} disabled={loading}
          className="min-h-[48px] w-full rounded-xl font-bold text-[15px] bg-accent text-bg disabled:opacity-50">
          {loading ? '…' : '🗓️ Agendar todos (1 por dia)'}
        </button>
        <a href="/blog" target="_blank" rel="noreferrer" className="block text-center text-[13px] text-text-dim underline mt-3">Ver o blog publicado →</a>
      </div>

      <div>
        <div className="text-[12.5px] text-text-mute uppercase tracking-wide font-semibold mb-2">Palavras-chave</div>
        <div className="flex flex-col gap-2">
          {keywords.map((k) => (
            <div key={k.keyword} className="bg-surface border border-border rounded-xl p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-[14px]">{k.titulo}</div>
                  <div className="text-[12px] text-text-mute mt-0.5">🔎 {k.keyword} · {k.categoria}</div>
                </div>
                {k.gerado
                  ? <span className={`text-[11.5px] font-bold flex-shrink-0 ${STATUS[k.status]?.c}`}>{STATUS[k.status]?.t}</span>
                  : <span className="text-[11.5px] text-text-mute flex-shrink-0">não criado</span>}
              </div>
              {!k.gerado && (
                <div className="flex gap-2 mt-2.5">
                  <button onClick={() => gerar(k.keyword, true)} disabled={loading}
                    className="flex-1 py-2 rounded-lg text-[13px] font-bold bg-accent text-bg disabled:opacity-50">Publicar agora</button>
                  <button onClick={() => gerar(k.keyword, false)} disabled={loading}
                    className="flex-1 py-2 rounded-lg text-[13px] font-bold border border-border text-text-dim disabled:opacity-50">Agendar amanhã</button>
                </div>
              )}
              {k.gerado && (
                <a href={`/blog/${k.slug}`} target="_blank" rel="noreferrer" className="inline-block text-[12.5px] text-accent underline mt-2">Ver artigo →</a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Big({ n, l }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-3.5 text-center">
      <div className="font-display font-extrabold text-[26px] leading-none" style={{ color: 'var(--accent)' }}>{n ?? '—'}</div>
      <div className="text-[11px] text-text-mute uppercase tracking-wide mt-1">{l}</div>
    </div>
  );
}
function Stat({ n, l }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 text-center">
      <div className="font-display font-bold text-2xl">{n ?? '—'}</div>
      <div className="text-[10.5px] text-text-mute uppercase tracking-wide mt-0.5">{l}</div>
    </div>
  );
}
function TabBtn({ ativo, onClick, children }) {
  return (
    <button onClick={onClick}
      className="flex-1 py-2.5 rounded-lg text-[13.5px] font-bold transition"
      style={ativo ? { background: 'var(--accent)', color: 'var(--accent-text)' } : { color: '#9C9CA8' }}>
      {children}
    </button>
  );
}
function Campo({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] text-text-dim mb-1.5 font-semibold">{label}</span>
      {children}
    </label>
  );
}
