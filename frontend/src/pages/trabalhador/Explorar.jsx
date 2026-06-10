import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Header, IconButton } from '../../components/UI';
import { Icon } from '../../components/Icons';
import { useToast } from '../../context/ToastContext';
import { useSession } from '../../context/SessionContext';
import { timeAgo, primeiroNome } from '../../lib/helpers';
import { catIcone } from '../../lib/constants';

// Pilha de cartões: arrasta para o lado ou usa os botões grandes
export function Explorar() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [feed, setFeed] = useState(null);
  const [idx, setIdx] = useState(0);
  const [notifDot, setNotifDot] = useState(false);
  const toast = useToast();

  const loadFeed = async () => {
    try {
      const [data, unread] = await Promise.all([api.feed(), api.notifUnread()]);
      setFeed(data);
      setIdx(0);
      setNotifDot(unread.count > 0);
    } catch (e) { toast(e.message, 'error'); }
  };

  useEffect(() => { loadFeed(); }, []);

  const onSwipe = (dir) => {
    const s = feed[idx];
    if (!s) return;
    setIdx((prev) => prev + 1);
    if (dir === 'yes') {
      api.curtirTrabalho(s.id)
        .then(() => toast('❤️ Interesse enviado! Se o cliente gostar, ele te chama no chat.', 'success'))
        .catch((e) => toast(e.message, 'error'));
    } else {
      api.pularTrabalho(s.id).catch(() => {});
    }
  };

  const empty = feed && idx >= feed.length;

  return (
    <>
      <Header
        title={`Olá, ${primeiroNome(user.nome)}!`}
        sub="Trabalhos do seu ramo, pertinho de você"
        right={
          <div className="flex gap-2">
            <IconButton onClick={() => navigate('/trabalhar/avisos')} hasDot={notifDot} title="Avisos">
              <Icon.Bell />
            </IconButton>
            <IconButton onClick={loadFeed} title="Atualizar">
              <Icon.Refresh />
            </IconButton>
          </div>
        }
      />
      <div className="flex-1 px-5 pb-4 pt-2 flex flex-col">
        <div className="flex-1 relative">
          {!feed ? null : empty ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3.5 text-text-mute p-8">
              <div className="text-5xl">🎉</div>
              <div className="font-display text-xl font-bold text-text-main">Você viu tudo por hoje</div>
              <div className="text-[14.5px] max-w-[260px] leading-relaxed">
                Quando aparecer trabalho novo do seu ramo, ele chega aqui. Toque em atualizar para conferir.
              </div>
              <button
                onClick={loadFeed}
                className="mt-2 px-6 py-3 rounded-2xl font-bold text-[15px]"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                Atualizar agora
              </button>
            </div>
          ) : (
            <SwipeStack feed={feed} idx={idx} onSwipe={onSwipe} />
          )}
        </div>

        {feed && !empty && (
          <div className="flex justify-center items-center gap-8 pt-4 flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => onSwipe('no')}
                className="w-[68px] h-[68px] rounded-full bg-surface border-2 border-red-500 text-red-500 flex items-center justify-center active:scale-90 transition"
                aria-label="Não quero"
              >
                <Icon.X />
              </button>
              <span className="text-[12px] font-bold text-red-400">Não quero</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => onSwipe('yes')}
                className="w-[68px] h-[68px] rounded-full bg-emerald-400 text-bg flex items-center justify-center active:scale-90 transition shadow-[0_8px_28px_rgba(52,211,153,0.35)]"
                aria-label="Tenho interesse"
              >
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

function SwipeStack({ feed, idx, onSwipe }) {
  const visible = feed.slice(idx, idx + 3);
  return (
    <>
      {visible.slice().reverse().map((s, i) => {
        const isTop = i === visible.length - 1;
        const depth = visible.length - 1 - i;
        return <SwipeCard key={s.id} servico={s} isTop={isTop} depth={depth} onSwipe={onSwipe} />;
      })}
    </>
  );
}

function SwipeCard({ servico, isTop, depth, onSwipe }) {
  const cardRef = useRef(null);
  const stampAcceptRef = useRef(null);
  const stampRejectRef = useRef(null);

  useEffect(() => {
    if (!isTop || !cardRef.current) return;

    const card = cardRef.current;
    let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;

    const onStart = (cx, cy) => { startX = cx; startY = cy; dx = 0; dy = 0; dragging = true; card.classList.add('grabbing'); };
    const onMove = (cx, cy) => {
      if (!dragging) return;
      dx = cx - startX; dy = cy - startY;
      const rot = dx / 15;
      card.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      if (stampAcceptRef.current) stampAcceptRef.current.style.opacity = Math.max(0, Math.min(1, dx / 80));
      if (stampRejectRef.current) stampRejectRef.current.style.opacity = Math.max(0, Math.min(1, -dx / 80));
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove('grabbing');
      if (dx > 100) doExit('yes');
      else if (dx < -100) doExit('no');
      else {
        card.style.transform = '';
        if (stampAcceptRef.current) stampAcceptRef.current.style.opacity = 0;
        if (stampRejectRef.current) stampRejectRef.current.style.opacity = 0;
      }
    };
    const doExit = (dir) => {
      card.style.transform = dir === 'yes' ? 'translate(600px, -50px) rotate(30deg)' : 'translate(-600px, -50px) rotate(-30deg)';
      card.style.opacity = '0';
      setTimeout(() => onSwipe(dir), 280);
    };

    const md = (e) => onStart(e.clientX, e.clientY);
    const mm = (e) => onMove(e.clientX, e.clientY);
    const mu = () => onEnd();
    const ts = (e) => onStart(e.touches[0].clientX, e.touches[0].clientY);
    const tm = (e) => onMove(e.touches[0].clientX, e.touches[0].clientY);
    const te = () => onEnd();

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
  const translateY = depth * -10;

  return (
    <div
      ref={cardRef}
      className="swipe-card absolute inset-0 bg-surface rounded-3xl border border-border overflow-hidden shadow-2xl flex flex-col select-none"
      style={{
        transform: `scale(${scale}) translateY(${translateY}px)`,
        zIndex: 10 - depth,
        cursor: isTop ? 'grab' : 'default',
      }}
    >
      <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[12px] font-bold z-[2] flex items-center gap-1.5">
        {catIcone(servico.categoria)} {servico.categoria}
      </div>
      <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[12px] flex items-center gap-1 z-[2]">
        <Icon.Loc /> {servico.bairro}
      </div>

      <div
        ref={stampAcceptRef}
        className="absolute top-9 right-4 px-5 py-2.5 rounded-xl font-display font-extrabold text-[26px] tracking-wider border-4 border-emerald-400 text-emerald-400 opacity-0 z-[3]"
        style={{ transform: 'rotate(15deg)' }}
      >QUERO ❤️</div>
      <div
        ref={stampRejectRef}
        className="absolute top-9 left-4 px-5 py-2.5 rounded-xl font-display font-extrabold text-[26px] tracking-wider border-4 border-red-500 text-red-500 opacity-0 z-[3]"
        style={{ transform: 'rotate(-15deg)' }}
      >PASSO ✖️</div>

      <div
        className="w-full h-[52%] bg-cover bg-center relative"
        style={{ backgroundImage: `url('${servico.fotos[0] || ''}')` }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(30,30,36,0.95) 100%)' }} />
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="font-display text-[22px] font-bold tracking-tight leading-tight">{servico.titulo}</div>
        <div className="text-[14px] text-text-dim leading-relaxed flex-1 overflow-hidden">{servico.descricao}</div>
        <div className="flex items-center gap-2 text-[12px] text-text-mute border-t border-border pt-2.5 mt-auto">
          <Icon.Loc /> {servico.cidade} · postado {timeAgo(servico.criadoEm)}
        </div>
      </div>
    </div>
  );
}
