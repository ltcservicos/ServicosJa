import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Header, Stars } from '../../components/UI';
import { Icon } from '../../components/Icons';
import { useToast } from '../../context/ToastContext';
import { CATEGORIAS, catIcone } from '../../lib/constants';
import { initials as ini } from '../../lib/helpers';

// Contratante navega profissionais por área e curte (sem precisar postar trabalho).
// Curtir → cria conversa direta e avisa o profissional.
export function Profissionais() {
  const navigate = useNavigate();
  const toast = useToast();
  const [categoria, setCategoria] = useState(null); // null = todas
  const [lista, setLista] = useState(null);
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState(null);

  const carregar = async (cat = categoria, p = pos) => {
    try {
      const data = await api.profissionais(cat?.nome, p ? { lat: p.lat, lng: p.lng } : null);
      setLista(data);
      setIdx(0);
    } catch (e) { toast(e.message, 'error'); }
  };

  // Pega a localização do contratante p/ mostrar a distância de cada profissional
  useEffect(() => {
    let cancelado = false;
    const seguir = (p) => { if (cancelado) return; setPos(p); carregar(categoria, p); };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (r) => seguir({ lat: r.coords.latitude, lng: r.coords.longitude }),
        () => carregar(categoria, null), // sem GPS: lista sem distância
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
      );
    } else {
      carregar(categoria, null);
    }
    return () => { cancelado = true; };
  }, []);

  const escolherCat = (c) => {
    const nova = categoria?.nome === c?.nome ? null : c;
    setCategoria(nova);
    carregar(nova);
  };

  const onSwipe = (dir) => {
    const p = lista[idx];
    if (!p) return;
    setIdx((i) => i + 1);
    if (dir === 'yes') {
      api.curtirProfissional(p.id)
        .then(() => toast(`Você curtiu ${p.nome.split(' ')[0]}! Ele foi avisado e pode te chamar no chat. 💬`, 'success'))
        .catch((e) => toast(e.message, 'error'));
    } else {
      api.pularProfissional(p.id).catch(() => {});
    }
  };

  const empty = lista && idx >= lista.length;

  return (
    <>
      <Header title="Buscar profissionais" sub="Curta quem você gostou — sem precisar postar" />

      {/* Filtro por área */}
      <div className="px-5 pb-2.5 flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        <button onClick={() => escolherCat(null)}
          className="px-3 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap border flex-shrink-0"
          style={!categoria ? { background: 'var(--accent)', color: 'var(--accent-text)', borderColor: 'var(--accent)' } : { background: '#1E1E24', color: '#9C9CA8', borderColor: '#2E2E38' }}>
          Todas
        </button>
        {CATEGORIAS.map((c) => (
          <button key={c.nome} onClick={() => escolherCat(c)}
            className="px-3 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap border flex-shrink-0"
            style={categoria?.nome === c.nome ? { background: 'var(--accent)', color: 'var(--accent-text)', borderColor: 'var(--accent)' } : { background: '#1E1E24', color: '#9C9CA8', borderColor: '#2E2E38' }}>
            {c.icone} {c.curto}
          </button>
        ))}
      </div>

      <div className="flex-1 px-5 pb-4 pt-1 flex flex-col">
        <div className="flex-1 relative">
          {!lista ? null : empty ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3.5 text-text-mute p-8">
              <div className="text-5xl">👷</div>
              <div className="font-display text-xl font-bold text-text-main">
                {categoria ? `Nenhum profissional de ${categoria.curto}` : 'Você viu todos'}
              </div>
              <div className="text-[14.5px] max-w-[260px] leading-relaxed">
                Conforme novos profissionais se cadastram, eles aparecem aqui. Troque a área acima ou volte mais tarde.
              </div>
              <button onClick={() => carregar()} className="mt-2 px-6 py-3 rounded-2xl font-bold text-[15px]"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                Atualizar
              </button>
            </div>
          ) : (
            <Pilha lista={lista} idx={idx} onSwipe={onSwipe} />
          )}
        </div>

        {lista && !empty && (
          <div className="flex justify-center items-center gap-8 pt-4 flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={() => onSwipe('no')}
                className="w-[68px] h-[68px] rounded-full bg-surface border-2 border-red-500 text-red-500 flex items-center justify-center active:scale-90 transition"
                aria-label="Passar">
                <Icon.X />
              </button>
              <span className="text-[12px] font-bold text-red-400">Passar</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={() => onSwipe('yes')}
                className="w-[68px] h-[68px] rounded-full bg-emerald-400 text-bg flex items-center justify-center active:scale-90 transition shadow-[0_8px_28px_rgba(52,211,153,0.35)]"
                aria-label="Tenho interesse">
                <Icon.HeartFill />
              </button>
              <span className="text-[12px] font-bold text-emerald-400">Tenho interesse</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Pilha({ lista, idx, onSwipe }) {
  const visiveis = lista.slice(idx, idx + 3);
  return (
    <>
      {visiveis.slice().reverse().map((p, i) => {
        const isTop = i === visiveis.length - 1;
        const depth = visiveis.length - 1 - i;
        return <Cartao key={p.id} prof={p} isTop={isTop} depth={depth} onSwipe={onSwipe} />;
      })}
    </>
  );
}

function Cartao({ prof, isTop, depth, onSwipe }) {
  const ref = useRef(null);
  const okRef = useRef(null);
  const noRef = useRef(null);

  useEffect(() => {
    if (!isTop || !ref.current) return;
    const card = ref.current;
    let sx = 0, sy = 0, dx = 0, dy = 0, drag = false;
    const start = (x, y) => { sx = x; sy = y; dx = 0; dy = 0; drag = true; card.classList.add('grabbing'); };
    const move = (x, y) => {
      if (!drag) return;
      dx = x - sx; dy = y - sy;
      card.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 15}deg)`;
      if (okRef.current) okRef.current.style.opacity = Math.max(0, Math.min(1, dx / 80));
      if (noRef.current) noRef.current.style.opacity = Math.max(0, Math.min(1, -dx / 80));
    };
    const end = () => {
      if (!drag) return;
      drag = false; card.classList.remove('grabbing');
      if (dx > 100) exit('yes'); else if (dx < -100) exit('no');
      else { card.style.transform = ''; if (okRef.current) okRef.current.style.opacity = 0; if (noRef.current) noRef.current.style.opacity = 0; }
    };
    const exit = (dir) => {
      card.style.transform = dir === 'yes' ? 'translate(600px,-50px) rotate(30deg)' : 'translate(-600px,-50px) rotate(-30deg)';
      card.style.opacity = '0';
      setTimeout(() => onSwipe(dir), 280);
    };
    const md = (e) => start(e.clientX, e.clientY);
    const mm = (e) => move(e.clientX, e.clientY);
    const mu = () => end();
    const ts = (e) => start(e.touches[0].clientX, e.touches[0].clientY);
    const tm = (e) => move(e.touches[0].clientX, e.touches[0].clientY);
    const te = () => end();
    card.addEventListener('mousedown', md);
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    card.addEventListener('touchstart', ts, { passive: true });
    window.addEventListener('touchmove', tm, { passive: true });
    window.addEventListener('touchend', te);
    return () => {
      card.removeEventListener('mousedown', md);
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
      card.removeEventListener('touchstart', ts);
      window.removeEventListener('touchmove', tm);
      window.removeEventListener('touchend', te);
    };
  }, [isTop, onSwipe]);

  const scale = 1 - depth * 0.04;
  const ty = depth * -10;

  return (
    <div ref={ref}
      className="swipe-card absolute inset-0 bg-surface rounded-3xl border border-border overflow-hidden shadow-2xl flex flex-col select-none"
      style={{ transform: `scale(${scale}) translateY(${ty}px)`, zIndex: 10 - depth, cursor: isTop ? 'grab' : 'default' }}>

      <div ref={okRef} className="absolute top-9 right-4 px-5 py-2.5 rounded-xl font-display font-extrabold text-[26px] tracking-wider border-4 border-emerald-400 text-emerald-400 opacity-0 z-[3]" style={{ transform: 'rotate(15deg)' }}>QUERO ❤️</div>
      <div ref={noRef} className="absolute top-9 left-4 px-5 py-2.5 rounded-xl font-display font-extrabold text-[26px] tracking-wider border-4 border-red-500 text-red-500 opacity-0 z-[3]" style={{ transform: 'rotate(-15deg)' }}>PASSO ✖️</div>

      {/* Topo com avatar grande */}
      <div className="h-[42%] flex flex-col items-center justify-center gap-3" style={{ background: 'linear-gradient(135deg, rgba(214,255,58,0.10), rgba(96,165,250,0.10))' }}>
        <div className="w-[110px] h-[110px] rounded-full bg-surface-2 border-4 border-bg-soft flex items-center justify-center font-display font-bold text-[42px]">
          {ini(prof.nome)}
        </div>
        <Stars nota={prof.notaMedia} total={prof.totalAvaliacoes} size={16} />
      </div>

      <div className="p-5 flex-1 flex flex-col gap-3 overflow-hidden">
        <div>
          <div className="font-display text-[24px] font-bold tracking-tight leading-tight">{prof.nome}</div>
          <div className="text-[13px] text-text-mute flex items-center gap-1 mt-0.5 flex-wrap">
            <Icon.Loc /> {prof.cidade}
            {prof.distanciaKm != null && <span className="font-bold text-emerald-400">· a {String(prof.distanciaKm).replace('.', ',')} km de você</span>}
            <span>· {prof.servicosConcluidos} trabalhos</span>
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {prof.categorias.slice(0, 4).map((c) => (
            <span key={c} className="bg-surface-2 rounded-lg px-2.5 py-1 text-[12px] font-semibold flex items-center gap-1">
              {catIcone(c)} {c.split(' ')[0]}
            </span>
          ))}
        </div>

        <div className="text-[13.5px] text-text-dim leading-relaxed flex-1 overflow-hidden">
          {prof.descricao || 'Profissional cadastrado no ServiçoJá.'}
        </div>
      </div>
    </div>
  );
}
