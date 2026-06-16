import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { CATEGORIAS, catIcone } from '../lib/constants';

// Vitrine pública: o profissional vê as vagas ANTES de se cadastrar.
// Qualquer ação (ver detalhe / demonstrar interesse) abre o cadastro —
// assim a gente não perde quem chegou só pra dar uma olhada.
export function Vagas() {
  const navigate = useNavigate();
  const [vagas, setVagas] = useState(null);
  const [cat, setCat] = useState(null);
  const [gate, setGate] = useState(false);

  useEffect(() => {
    api.vitrine().then(setVagas).catch(() => setVagas([]));
  }, []);

  const lista = useMemo(
    () => (vagas || []).filter((v) => !cat || v.categoria === cat.nome),
    [vagas, cat],
  );

  const pedirCadastro = () => setGate(true);

  return (
    <div className="app-shell relative" style={{ '--accent': '#60A5FA', '--accent-text': '#0E0E10' }}>
      <style>{'@keyframes vagasUp{from{transform:translateY(100%)}to{transform:translateY(0)}}'}</style>

      {/* topo */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
        <Link to="/" className="font-display font-extrabold text-[20px]">
          Serviço<span style={{ color: 'var(--accent)' }}>Já.</span>
        </Link>
        <Link to="/entrar" className="text-[14px] font-bold text-text-dim underline">Entrar</Link>
      </div>

      <div className="px-5 pb-3 flex-shrink-0">
        <div className="font-display text-[25px] font-extrabold leading-tight">Vagas perto de você</div>
        <div className="text-text-mute text-[14px] mt-1 leading-relaxed">
          Veja os trabalhos disponíveis. Pra demonstrar interesse, é só criar sua conta — <b className="text-text-dim">grátis</b>.
        </div>
      </div>

      {/* filtro por área */}
      <div className="px-5 pb-2.5 flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        <button onClick={() => setCat(null)}
          className="px-3 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap border flex-shrink-0"
          style={!cat ? { background: 'var(--accent)', color: 'var(--accent-text)', borderColor: 'var(--accent)' } : { background: '#1E1E24', color: '#9C9CA8', borderColor: '#2E2E38' }}>
          Todas
        </button>
        {CATEGORIAS.map((c) => (
          <button key={c.nome} onClick={() => setCat(cat?.nome === c.nome ? null : c)}
            className="px-3 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap border flex-shrink-0"
            style={cat?.nome === c.nome ? { background: 'var(--accent)', color: 'var(--accent-text)', borderColor: 'var(--accent)' } : { background: '#1E1E24', color: '#9C9CA8', borderColor: '#2E2E38' }}>
            {c.icone} {c.curto}
          </button>
        ))}
      </div>

      {/* lista de vagas (rolar é livre; tocar pede cadastro) */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-1">
        {vagas === null ? (
          <div className="text-text-mute text-center pt-10">Carregando vagas…</div>
        ) : lista.length === 0 ? (
          <div className="text-text-mute text-center pt-10 px-6 leading-relaxed">
            Nenhuma vaga nessa área agora. Troque o filtro ou volte mais tarde.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {lista.map((v) => (
              <button key={v.id} onClick={pedirCadastro}
                className="text-left bg-surface border border-border rounded-2xl overflow-hidden active:scale-[0.99] transition">
                <div className="h-[116px] bg-cover bg-center relative"
                  style={{ backgroundImage: v.foto ? `url('${v.foto}')` : 'linear-gradient(135deg, rgba(96,165,250,.18), rgba(214,255,58,.12))' }}>
                  <span className="absolute top-2.5 left-2.5 bg-bg/80 backdrop-blur px-2.5 py-1 rounded-lg text-[11.5px] font-bold">
                    {catIcone(v.categoria)} {v.categoria.split(' ')[0]}
                  </span>
                  <span className="absolute top-2.5 right-2.5 bg-bg/80 backdrop-blur px-2.5 py-1 rounded-lg text-[11.5px] font-bold">
                    {v.origem === 'EXTERNO' ? '🤝 Contrato' : '⚡ Esporádico'}
                  </span>
                </div>
                <div className="p-3.5">
                  <div className="font-display text-[17px] font-bold leading-tight">{v.titulo}</div>
                  <div className="text-[12.5px] text-text-mute mt-0.5">
                    📍 {v.bairro && v.bairro !== v.cidade ? `${v.bairro}, ` : ''}{v.cidade}
                  </div>
                  <div className="text-[13.5px] text-text-dim mt-2 leading-relaxed">{v.resumo}</div>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold" style={{ color: 'var(--accent)' }}>
                    🤝 Tenho interesse →
                  </div>
                </div>
              </button>
            ))}
            <div className="h-2" />
          </div>
        )}
      </div>

      {/* CTA fixo */}
      <div className="px-4 pt-3 pb-4 flex-shrink-0 border-t border-border bg-bg">
        <button onClick={() => navigate('/cadastro?papel=trabalhador')}
          className="w-full min-h-[54px] rounded-2xl font-bold text-[16px]"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
          🛠️ Criar conta grátis pra trabalhar
        </button>
      </div>

      {/* gate de cadastro */}
      {gate && (
        <div className="absolute inset-0 z-50 flex items-end" onClick={() => setGate(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full bg-surface rounded-t-3xl p-6 pb-8"
            onClick={(e) => e.stopPropagation()} style={{ animation: 'vagasUp .25s ease' }}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="text-4xl text-center">🤝</div>
            <div className="font-display text-[22px] font-extrabold text-center mt-2">Quase lá!</div>
            <div className="text-text-mute text-[14.5px] text-center mt-1.5 leading-relaxed max-w-[300px] mx-auto">
              Pra ver os detalhes e demonstrar interesse na vaga, crie sua conta. É grátis e leva 1 minuto.
            </div>
            <div className="flex flex-col gap-2.5 mt-5">
              <button onClick={() => navigate('/cadastro?papel=trabalhador')}
                className="w-full min-h-[52px] rounded-2xl font-bold text-[16px]"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                Criar conta grátis
              </button>
              <button onClick={() => navigate('/entrar')}
                className="w-full min-h-[48px] rounded-2xl font-bold text-[15px] border border-border text-text-dim">
                Já tenho conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
