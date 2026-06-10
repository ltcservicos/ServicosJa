import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Header, Badge, Avatar, Button, SectionTitle, Stars, EmptyState } from '../../components/UI';
import { Icon } from '../../components/Icons';
import { AvaliarModal } from '../../components/AvaliarModal';
import { useToast } from '../../context/ToastContext';
import { primeiroNome } from '../../lib/helpers';

// Detalhe do trabalho: aqui o contratante vê os interessados,
// conversa com eles e fecha com um.
export function Trabalho() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [servico, setServico] = useState(null);
  const [confirmando, setConfirmando] = useState(null); // interessado sendo confirmado
  const [avaliando, setAvaliando] = useState(false);

  const reload = async () => {
    try { setServico(await api.getTrabalho(id)); } catch (e) { toast(e.message, 'error'); }
  };

  useEffect(() => {
    reload();
    const t = setInterval(reload, 4000);
    return () => clearInterval(t);
  }, [id]);

  if (!servico) {
    return (
      <>
        <Header onBack={() => navigate('/contratar')} title="" />
        <div className="px-5 text-text-mute">Carregando…</div>
      </>
    );
  }

  const conversar = async (interessado) => {
    try {
      const conversaId = interessado.conversaId
        ? interessado.conversaId
        : (await api.abrirConversa(servico.id, interessado.prestador.id)).id;
      navigate(`/contratar/conversa/${conversaId}`);
    } catch (e) { toast(e.message, 'error'); }
  };

  const escolher = async (interessado) => {
    try {
      await api.escolherTrabalhador(servico.id, interessado.prestador.id);
      toast(`Combinado com ${primeiroNome(interessado.prestador.nome)}! 🤝`, 'success');
      setConfirmando(null);
      reload();
    } catch (e) { toast(e.message, 'error'); }
  };

  const concluir = async () => {
    try {
      await api.concluirTrabalho(servico.id);
      toast('Trabalho concluído ✅', 'success');
      await reload();
      setAvaliando(true);
    } catch (e) { toast(e.message, 'error'); }
  };

  const cancelar = async () => {
    if (!confirm('Tem certeza que quer tirar este trabalho do ar?')) return;
    try {
      await api.cancelarTrabalho(servico.id);
      toast('Trabalho cancelado', 'success');
      navigate('/contratar');
    } catch (e) { toast(e.message, 'error'); }
  };

  const p = servico.prestadorAceito;

  return (
    <>
      <Header onBack={() => navigate('/contratar')} title="" />
      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        {/* Foto de capa */}
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
          <div className="text-text-dim leading-relaxed text-[15px] mb-4">{servico.descricao}</div>

          {/* === NO AR: lista de interessados === */}
          {servico.estado === 'ABERTO' && (
            <>
              <SectionTitle>
                {servico.aceites.length > 0
                  ? `🙋 ${servico.aceites.length} interessado${servico.aceites.length > 1 ? 's' : ''}`
                  : 'Interessados'}
              </SectionTitle>

              {servico.aceites.length === 0 && (
                <div className="bg-surface border border-dashed border-border rounded-2xl p-6 text-center text-text-mute mb-4">
                  <div className="text-3xl mb-2">⏳</div>
                  <div className="font-bold text-text-main mb-1">Ainda ninguém se interessou</div>
                  <div className="text-[13.5px] leading-relaxed">
                    Seu trabalho está no ar. Assim que alguém se interessar, aparece aqui — e você recebe um aviso.
                  </div>
                </div>
              )}

              {servico.aceites.map((a) => (
                <div key={a.acaoId} className="bg-surface border border-border rounded-2xl p-4 mb-3">
                  <button
                    className="flex gap-3 items-center w-full text-left mb-3"
                    onClick={() => navigate(`/contratar/trabalhador/${a.prestador.id}`)}
                  >
                    <Avatar name={a.prestador.nome} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[16px] truncate">{a.prestador.nome}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Stars nota={a.prestador.notaMedia} total={a.prestador.totalAvaliacoes} />
                        <span className="text-[12px] text-text-mute">· {a.prestador.servicosConcluidos} trabalhos</span>
                      </div>
                    </div>
                    <span className="text-text-mute text-[13px]">ver →</span>
                  </button>

                  {a.valorProposto != null && (
                    <div className="text-[14px] mb-3 bg-surface-2 rounded-lg px-3 py-2">
                      💰 Propôs: <strong>R$ {a.valorProposto}</strong>
                    </div>
                  )}

                  <div className="flex gap-2.5">
                    <Button variant="ghost" className="!min-h-[48px] !text-[14.5px]" onClick={() => conversar(a)}>
                      <Icon.Chat width={18} height={18} /> Conversar
                    </Button>
                    <Button className="!min-h-[48px] !text-[14.5px]" onClick={() => setConfirmando(a)}>
                      🤝 Fechar com ele
                    </Button>
                  </div>
                </div>
              ))}

              <div className="h-2" />
              <Button variant="danger" onClick={cancelar}>Tirar trabalho do ar</Button>
            </>
          )}

          {/* === COMBINADO === */}
          {servico.estado === 'APROVADO' && p && (
            <>
              <SectionTitle>Combinado com</SectionTitle>
              <div className="bg-emerald-500/5 border border-emerald-500/50 rounded-2xl p-4 mb-3">
                <div className="flex gap-3 items-center mb-3">
                  <Avatar name={p.nome} />
                  <div className="flex-1">
                    <div className="font-bold text-[16px]">{p.nome}</div>
                    <Stars nota={p.notaMedia} total={p.totalAvaliacoes} />
                  </div>
                </div>
                {servico.minhaConversaId && (
                  <Button variant="ghost" onClick={() => navigate(`/contratar/conversa/${servico.minhaConversaId}`)}>
                    <Icon.Chat width={18} height={18} /> Abrir conversa
                  </Button>
                )}
              </div>

              <Button variant="success" onClick={concluir}>✅ O trabalho foi feito</Button>
            </>
          )}

          {/* === FEITO === */}
          {servico.estado === 'CONCLUIDO' && (
            <div className="bg-emerald-500/10 border border-emerald-500 rounded-2xl p-6 text-center">
              <div className="text-3xl">🎉</div>
              <div className="font-bold mt-1.5 text-emerald-400 text-[17px]">Trabalho feito!</div>
              {servico.minhaAvaliacao ? (
                <div className="text-[14px] text-text-dim mt-2">
                  Você avaliou com {servico.minhaAvaliacao.nota} ⭐. Obrigado!
                </div>
              ) : (
                <button
                  onClick={() => setAvaliando(true)}
                  className="mt-3 font-bold text-[15px] underline"
                  style={{ color: 'var(--accent)' }}
                >
                  Avaliar {p ? primeiroNome(p.nome) : 'o profissional'} ⭐
                </button>
              )}
            </div>
          )}

          {servico.estado === 'CANCELADO' && (
            <div className="bg-red-500/10 border border-red-500 rounded-2xl p-6 text-center text-red-400 font-semibold">
              Este trabalho foi cancelado
            </div>
          )}
        </div>
      </div>

      {/* Confirmação de escolha */}
      {confirmando && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-end animate-fade-in" onClick={() => setConfirmando(null)}>
          <div className="w-full bg-bg-soft border-t border-border rounded-t-3xl p-6 pb-9 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🤝</div>
              <div className="font-display font-bold text-[20px]">
                Fechar com {primeiroNome(confirmando.prestador.nome)}?
              </div>
              <div className="text-text-mute text-[14px] mt-1.5 leading-relaxed">
                Os outros interessados serão avisados de que você escolheu outra pessoa.
              </div>
            </div>
            <Button onClick={() => escolher(confirmando)}>Sim, fechar negócio</Button>
            <button onClick={() => setConfirmando(null)} className="w-full text-center text-text-mute text-[14px] font-semibold pt-3.5">
              Ainda não
            </button>
          </div>
        </div>
      )}

      {/* Avaliação após concluir */}
      {avaliando && p && (
        <AvaliarModal
          nomeAvaliado={primeiroNome(p.nome)}
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
