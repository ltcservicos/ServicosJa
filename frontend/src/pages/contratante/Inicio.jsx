import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Header, IconButton, SectionTitle, Badge, EmptyState, Button } from '../../components/UI';
import { Icon } from '../../components/Icons';
import { useSession } from '../../context/SessionContext';
import { primeiroNome } from '../../lib/helpers';
import { catIcone } from '../../lib/constants';

export function Inicio() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [servicos, setServicos] = useState(null);
  const [notifDot, setNotifDot] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [data, unread] = await Promise.all([api.meusTrabalhos(), api.notifUnread()]);
        if (!alive) return;
        setServicos(data);
        setNotifDot(unread.count > 0);
      } catch {}
    };
    load();
    const id = setInterval(load, 4000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const grupos = servicos
    ? {
        'No ar — esperando interessados': servicos.filter((s) => s.estado === 'ABERTO'),
        'Combinados': servicos.filter((s) => s.estado === 'APROVADO'),
        'Já feitos': servicos.filter((s) => ['CONCLUIDO', 'CANCELADO'].includes(s.estado)),
      }
    : {};
  const temAlgum = servicos && servicos.length > 0;

  return (
    <>
      <Header
        title={`Olá, ${primeiroNome(user.nome)}!`}
        sub="Seus trabalhos"
        right={
          <IconButton onClick={() => navigate('/contratar/avisos')} hasDot={notifDot} title="Avisos">
            <Icon.Bell />
          </IconButton>
        }
      />
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        {servicos && !temAlgum && (
          <div className="flex flex-col gap-6">
            <EmptyState emoji="🏠" titulo="Vamos começar?">
              Conte o que você precisa e profissionais da sua região vão se interessar.
            </EmptyState>
            <div className="px-4">
              <Button onClick={() => navigate('/contratar/postar')}>
                <Icon.Plus /> Postar meu primeiro trabalho
              </Button>
            </div>
          </div>
        )}

        {Object.entries(grupos).map(([titulo, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={titulo}>
              <SectionTitle>{titulo}</SectionTitle>
              {items.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/contratar/trabalho/${s.id}`)}
                  className="w-full text-left bg-surface border border-border rounded-2xl p-3.5 mb-2.5 cursor-pointer flex gap-3 items-center hover:border-text-mute transition active:scale-[0.99]"
                >
                  <div
                    className="w-[62px] h-[62px] rounded-xl bg-cover bg-center flex-shrink-0 border border-border flex items-center justify-center text-2xl bg-surface-2"
                    style={s.fotos[0] ? { backgroundImage: `url('${s.fotos[0]}')` } : {}}
                  >
                    {!s.fotos[0] && catIcone(s.categoria)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px] mb-1 truncate">{s.titulo}</div>
                    <div className="flex items-center gap-2 text-[12px] text-text-mute">
                      <Badge estado={s.estado} />
                      {s.estado === 'ABERTO' && (
                        <span className={s.aceitesCount > 0 ? 'text-accent font-bold' : ''}>
                          {s.aceitesCount > 0
                            ? `🙋 ${s.aceitesCount} interessado${s.aceitesCount > 1 ? 's' : ''}!`
                            : '👀 aguardando interessados'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-text-mute">→</span>
                </button>
              ))}
            </div>
          );
        })}
        <div className="h-4" />
      </div>
    </>
  );
}
