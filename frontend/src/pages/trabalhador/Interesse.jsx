import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Header, Badge, Button } from '../../components/UI';
import { Icon } from '../../components/Icons';
import { useSession } from '../../context/SessionContext';
import { useToast } from '../../context/ToastContext';
import { AvaliarModal } from '../../components/AvaliarModal';

export function Interesse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSession();
  const [servico, setServico] = useState(null);
  const [avaliando, setAvaliando] = useState(false);

  const reload = async () => {
    try { setServico(await api.getTrabalho(id)); } catch {}
  };

  useEffect(() => {
    reload();
    const t = setInterval(reload, 4000);
    return () => clearInterval(t);
  }, [id]);

  if (!servico) {
    return (
      <>
        <Header onBack={() => navigate('/trabalhar/interesses')} title="" />
        <div className="px-5 text-text-mute">Carregando…</div>
      </>
    );
  }

  const fuiEscolhido = servico.prestadorAceitoId === user.id;

  let statusBlock = null;
  if (servico.estado === 'ABERTO') {
    statusBlock = (
      <div className="bg-surface border border-border rounded-2xl p-5 text-center mt-4">
        <div className="text-3xl">👍</div>
        <div className="font-bold mt-1.5 text-[16px]">Interesse enviado!</div>
        <div className="text-[13.5px] text-text-mute mt-1 leading-relaxed">
          Agora é com o cliente. Se ele topar, a gente te avisa e a conversa abre na aba Chat.
        </div>
      </div>
    );
  } else if (servico.estado === 'APROVADO' && fuiEscolhido) {
    statusBlock = (
      <div className="bg-emerald-500/5 border border-emerald-500 rounded-2xl p-5 text-center mt-4">
        <div className="text-3xl">🎉</div>
        <div className="font-bold mt-1.5 text-[16px]">Fechado com você!</div>
        <div className="text-[13.5px] text-text-mute mt-1">Combine os detalhes com o cliente pelo chat.</div>
        {servico.minhaConversaId && (
          <div className="mt-3.5">
            <Button onClick={() => navigate(`/trabalhar/conversa/${servico.minhaConversaId}`)}>
              <Icon.Chat width={18} height={18} /> Abrir conversa
            </Button>
          </div>
        )}
      </div>
    );
  } else if (servico.estado === 'CONCLUIDO' && fuiEscolhido) {
    statusBlock = (
      <div className="bg-emerald-500/5 border border-emerald-500 rounded-2xl p-5 text-center mt-4">
        <div className="text-3xl">✅</div>
        <div className="font-bold mt-1.5 text-[16px]">Trabalho feito!</div>
        {servico.minhaAvaliacao ? (
          <div className="text-[13.5px] text-text-mute mt-1">Você avaliou o cliente com {servico.minhaAvaliacao.nota} ⭐</div>
        ) : (
          <button
            onClick={() => setAvaliando(true)}
            className="mt-2 font-bold text-[15px] underline"
            style={{ color: 'var(--accent)' }}
          >
            Avaliar o cliente ⭐
          </button>
        )}
      </div>
    );
  } else {
    statusBlock = (
      <div className="bg-red-500/5 border border-red-500/50 rounded-2xl p-5 text-center mt-4">
        <div className="font-bold text-[15px]">Este não rolou</div>
        <div className="text-[13.5px] text-text-mute mt-1">Continue deslizando — sempre tem trabalho novo. 💪</div>
      </div>
    );
  }

  return (
    <>
      <Header onBack={() => navigate('/trabalhar/interesses')} title="" />
      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        <div
          className="w-[calc(100%+40px)] -mx-5 h-[190px] bg-cover bg-center"
          style={{ backgroundImage: `url('${servico.fotos[0] || ''}')` }}
        />
        <div className="pt-4">
          <div className="flex gap-2 items-center flex-wrap mb-3">
            <Badge estado={servico.estado} />
            <span className="inline-flex items-center gap-1 bg-surface border border-border px-2.5 py-1 rounded-lg text-[12px] text-text-dim">
              {servico.categoria}
            </span>
            <span className="inline-flex items-center gap-1 bg-surface border border-border px-2.5 py-1 rounded-lg text-[12px] text-text-dim">
              <Icon.Loc /> {servico.bairro}
            </span>
          </div>
          <div className="font-display text-[24px] font-bold tracking-tight leading-tight mb-2">{servico.titulo}</div>
          <div className="text-text-dim leading-relaxed text-[15px]">{servico.descricao}</div>
          {statusBlock}
        </div>
      </div>

      {avaliando && (
        <AvaliarModal
          nomeAvaliado="o cliente"
          onAvaliar={async (nota, comentario) => {
            try {
              await api.avaliarTrabalho(servico.id, nota, comentario);
              toast('Avaliação enviada. Obrigado! ⭐', 'success');
              reload();
            } catch (e) { toast(e.message, 'error'); }
          }}
          onClose={() => setAvaliando(false)}
        />
      )}
    </>
  );
}
