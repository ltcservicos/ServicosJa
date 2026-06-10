import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Avatar, Button } from '../../components/UI';
import { Icon } from '../../components/Icons';
import { useToast } from '../../context/ToastContext';
import { horaMsg, primeiroNome } from '../../lib/helpers';

// Tela de chat estilo WhatsApp: balões, hora, ✓✓, polling de 3s
export function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [conversa, setConversa] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [confirmFechar, setConfirmFechar] = useState(false);
  const scrollRef = useRef(null);
  const lastTsRef = useRef(null);

  const base = location.pathname.startsWith('/contratar') ? '/contratar' : '/trabalhar';

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  };

  // Carga inicial + polling incremental
  useEffect(() => {
    let alive = true;

    const init = async () => {
      try {
        const [c, m] = await Promise.all([api.getConversa(id), api.mensagens(id)]);
        if (!alive) return;
        setConversa(c);
        setMsgs(m);
        if (m.length) lastTsRef.current = m[m.length - 1].criadoEm;
        scrollToBottom();
      } catch (e) {
        toast(e.message, 'error');
        navigate(`${base}/conversas`);
      }
    };

    const poll = async () => {
      try {
        const novas = await api.mensagens(id, lastTsRef.current || undefined);
        if (!alive || novas.length === 0) return;
        setMsgs((prev) => {
          const ids = new Set(prev.map((x) => x.id));
          const add = novas.filter((x) => !ids.has(x.id));
          if (add.length === 0) return prev;
          lastTsRef.current = add[add.length - 1].criadoEm;
          return [...prev, ...add];
        });
        scrollToBottom();
      } catch {}
    };

    init();
    const t = setInterval(poll, 3000);
    return () => { alive = false; clearInterval(t); };
  }, [id]);

  const enviar = async (e) => {
    e?.preventDefault();
    const t = texto.trim();
    if (!t || enviando) return;
    setEnviando(true);
    setTexto('');
    try {
      const msg = await api.enviarMensagem(id, t);
      setMsgs((prev) => [...prev, msg]);
      lastTsRef.current = msg.criadoEm;
      scrollToBottom();
    } catch (err) {
      toast(err.message, 'error');
      setTexto(t);
    } finally {
      setEnviando(false);
    }
  };

  const fecharNegocio = async () => {
    try {
      await api.escolherTrabalhador(conversa.servico.id, conversa.outraParte.id);
      toast(`Fechado com ${primeiroNome(conversa.outraParte.nome)}! 🤝`, 'success');
      setConfirmFechar(false);
      setConversa(await api.getConversa(id));
    } catch (e) { toast(e.message, 'error'); }
  };

  if (!conversa) {
    return <div className="flex-1 flex items-center justify-center text-text-mute">Carregando…</div>;
  }

  const aberta = conversa.status === 'ABERTA';
  const jaFechado = conversa.servico.prestadorAceitoId === conversa.outraParte?.id;
  const podeFecharNegocio = conversa.souContratante && conversa.servico.estado === 'ABERTO' && aberta;

  return (
    <>
      {/* Cabeçalho do chat */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0 bg-bg-soft z-10">
        <button
          onClick={() => navigate(`${base}/conversas`)}
          className="w-10 h-10 -ml-1 rounded-xl flex items-center justify-center text-text-dim hover:text-text-main"
          aria-label="Voltar"
        >
          <Icon.Back />
        </button>
        <Avatar name={conversa.outraParte?.nome} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[16px] truncate">{conversa.outraParte?.nome}</div>
          <div className="text-[12px] text-text-mute truncate">🛠️ {conversa.servico.titulo}</div>
        </div>
      </div>

      {/* Faixa de ação: fechar negócio / status */}
      {podeFecharNegocio && (
        <button
          onClick={() => setConfirmFechar(true)}
          className="flex-shrink-0 mx-4 mt-3 rounded-xl py-3 px-4 font-bold text-[14.5px] flex items-center justify-center gap-2 active:scale-[0.98] transition"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          🤝 Fechar negócio com {primeiroNome(conversa.outraParte?.nome)}
        </button>
      )}
      {jaFechado && conversa.servico.estado === 'APROVADO' && (
        <div className="flex-shrink-0 mx-4 mt-3 rounded-xl py-2.5 px-4 text-[13.5px] font-bold text-center bg-emerald-500/15 text-emerald-400">
          🤝 Negócio fechado — combinem os detalhes!
        </div>
      )}
      {!aberta && (
        <div className="flex-shrink-0 mx-4 mt-3 rounded-xl py-2.5 px-4 text-[13px] font-semibold text-center bg-surface-2 text-text-mute">
          Esta conversa foi encerrada
        </div>
      )}

      {/* Mensagens */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar flex flex-col gap-1.5">
        {msgs.length === 0 && (
          <div className="text-center text-text-mute text-[13.5px] py-10 leading-relaxed">
            Diga olá e combine os detalhes: <br />o que precisa, quando e o preço. 👋
          </div>
        )}
        {msgs.map((m, i) => {
          const prev = msgs[i - 1];
          const gap = prev && prev.minha !== m.minha;
          return (
            <div
              key={m.id}
              className={`max-w-[80%] px-3.5 py-2.5 text-[15px] leading-snug ${gap ? 'mt-2' : ''} ${
                m.minha
                  ? 'self-end msg-out bg-emerald-600/90 text-white'
                  : 'self-start msg-in bg-surface-2 text-text-main'
              }`}
            >
              {m.texto}
              <span className={`inline-flex items-center gap-1 text-[10.5px] ml-2 align-bottom ${m.minha ? 'text-white/70' : 'text-text-mute'}`}>
                {horaMsg(m.criadoEm)}
                {m.minha && <Icon.DoubleCheck style={{ opacity: m.lida ? 1 : 0.45 }} />}
              </span>
            </div>
          );
        })}
      </div>

      {/* Caixa de envio */}
      {aberta ? (
        <form onSubmit={enviar} className="flex-shrink-0 flex items-end gap-2.5 px-4 py-3 border-t border-border bg-bg-soft">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva sua mensagem…"
            className="flex-1 bg-surface border border-border rounded-2xl px-4 py-3.5 text-[16px] outline-none focus:border-[var(--accent)]"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!texto.trim() || enviando}
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition disabled:opacity-40"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
            aria-label="Enviar"
          >
            <Icon.Send />
          </button>
        </form>
      ) : (
        <div className="flex-shrink-0 px-4 py-4 border-t border-border bg-bg-soft text-center text-[13.5px] text-text-mute">
          Não dá mais para enviar mensagens nesta conversa.
        </div>
      )}

      {/* Confirmação de fechar negócio */}
      {confirmFechar && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-end animate-fade-in" onClick={() => setConfirmFechar(false)}>
          <div className="w-full bg-bg-soft border-t border-border rounded-t-3xl p-6 pb-9 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🤝</div>
              <div className="font-display font-bold text-[20px]">
                Fechar com {primeiroNome(conversa.outraParte?.nome)}?
              </div>
              <div className="text-text-mute text-[14px] mt-1.5 leading-relaxed">
                Os outros interessados serão avisados de que você escolheu outra pessoa.
              </div>
            </div>
            <Button onClick={fecharNegocio}>Sim, fechar negócio</Button>
            <button onClick={() => setConfirmFechar(false)} className="w-full text-center text-text-mute text-[14px] font-semibold pt-3.5">
              Ainda não
            </button>
          </div>
        </div>
      )}
    </>
  );
}
