import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Header, Avatar, EmptyState } from '../../components/UI';
import { timeAgo } from '../../lib/helpers';
import { useSession } from '../../context/SessionContext';

// Lista de conversas estilo WhatsApp: foto, nome, última mensagem, badge
export function Conversas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSession();
  const [conversas, setConversas] = useState(null);

  const base = location.pathname.startsWith('/contratar') ? '/contratar' : '/trabalhar';
  const souContratante = user.tipo === 'solicitante';

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await api.conversas();
        if (alive) setConversas(data);
      } catch {}
    };
    load();
    const id = setInterval(load, 4000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <>
      <Header title="Conversas" sub="Combine tudo por aqui" />
      <div className="flex-1 overflow-y-auto pb-4 no-scrollbar">
        {conversas && conversas.length === 0 && (
          <EmptyState emoji="💬" titulo="Nenhuma conversa ainda">
            {souContratante
              ? 'Quando alguém se interessar pelo seu trabalho, toque em "Conversar" para chamar a pessoa aqui.'
              : 'Quando um cliente gostar de você, a conversa dele aparece aqui. Continue dando ❤️ nos trabalhos!'}
          </EmptyState>
        )}

        {(conversas || []).map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`${base}/conversa/${c.id}`)}
            className="w-full text-left px-5 py-3.5 flex gap-3.5 items-center hover:bg-surface/60 active:bg-surface transition border-b border-border/50"
          >
            <div className="relative">
              <Avatar name={c.outraParte?.nome} />
              {c.naoLidas > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-bg-soft">
                  {c.naoLidas > 9 ? '9+' : c.naoLidas}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className={`text-[16px] truncate ${c.naoLidas > 0 ? 'font-bold' : 'font-semibold'}`}>
                  {c.outraParte?.nome}
                </span>
                {c.ultimaMensagem && (
                  <span className="text-[11.5px] text-text-mute flex-shrink-0">{timeAgo(c.ultimaMensagem.criadoEm)}</span>
                )}
              </div>
              <div className="text-[12.5px] text-text-mute truncate mt-0.5">
                {c.servico ? `🛠️ ${c.servico.titulo}` : `💼 ${c.assunto || 'Contato direto'}`}
              </div>
              <div className={`text-[13.5px] truncate mt-0.5 ${c.naoLidas > 0 ? 'text-text-main font-semibold' : 'text-text-dim'}`}>
                {c.ultimaMensagem
                  ? `${c.ultimaMensagem.minha ? 'Você: ' : ''}${c.ultimaMensagem.texto}`
                  : 'Conversa aberta — diga olá! 👋'}
              </div>
            </div>
            {c.status === 'FECHADA' && (
              <span className="text-[10.5px] uppercase font-bold text-text-mute bg-surface-2 px-2 py-1 rounded-md flex-shrink-0">
                Encerrada
              </span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
