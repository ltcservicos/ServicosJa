import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Header, EmptyState } from '../components/UI';
import { timeAgo } from '../lib/helpers';

const EMOJI = {
  PRESTADOR_ACEITOU: '🙋',
  APROVADO: '🤝',
  RECUSADO: '😕',
  CHAT: '💬',
  CONCLUIDO: '✅',
};

export function Avisos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifs, setNotifs] = useState(null);

  const base = location.pathname.startsWith('/contratar') ? '/contratar' : '/trabalhar';

  useEffect(() => {
    (async () => {
      try {
        const list = await api.notificacoes();
        setNotifs(list);
        await api.notifMarcarTodasLidas();
      } catch {}
    })();
  }, []);

  const click = (n) => {
    if (!n.servicoId) return;
    if (n.tipo === 'CHAT') navigate(`${base}/conversas`);
    else if (base === '/contratar') navigate(`${base}/trabalho/${n.servicoId}`);
    else navigate(`${base}/interesse/${n.servicoId}`);
  };

  return (
    <>
      <Header onBack={() => navigate(base)} title="Avisos" sub="O que aconteceu por aqui" />
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        {notifs && notifs.length === 0 && (
          <EmptyState emoji="🔔" titulo="Nenhum aviso ainda">
            Quando algo importante acontecer, você fica sabendo aqui.
          </EmptyState>
        )}
        {(notifs || []).map((n) => (
          <button
            key={n.id}
            onClick={() => click(n)}
            className={`w-full text-left bg-surface border rounded-2xl p-3.5 mb-2 cursor-pointer flex gap-3 items-start ${n.lida ? 'border-border' : 'border-[var(--accent)]'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center flex-shrink-0 text-lg">
              {EMOJI[n.tipo] || '📋'}
            </div>
            <div className="flex-1 text-[14px] leading-snug">
              <div className="font-bold">{n.titulo}</div>
              <div className="text-text-dim mt-0.5">{n.mensagem}</div>
              <div className="text-[12px] text-text-mute mt-1">{timeAgo(n.criadoEm)}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
