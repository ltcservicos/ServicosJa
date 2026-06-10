import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Header, SectionTitle, EmptyState } from '../../components/UI';
import { catIcone } from '../../lib/constants';

const RESULT_LABEL = {
  AGUARDANDO: { txt: 'Esperando o cliente', cls: 'bg-orange-500/15 text-orange-400' },
  APROVADO: { txt: '🤝 Fechado com você!', cls: 'bg-emerald-500/15 text-emerald-400' },
  CONCLUIDO: { txt: '✅ Feito', cls: 'bg-zinc-500/15 text-zinc-400' },
  NAO_SELECIONADO: { txt: 'Cliente escolheu outro', cls: 'bg-red-500/15 text-red-400' },
};

export function Interesses() {
  const navigate = useNavigate();
  const [aceites, setAceites] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await api.meusInteresses();
        if (alive) setAceites(data);
      } catch {}
    };
    load();
    const id = setInterval(load, 4000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const grupos = aceites
    ? {
        'Fechados com você': aceites.filter((s) => s.resultado === 'APROVADO'),
        'Esperando resposta': aceites.filter((s) => s.resultado === 'AGUARDANDO'),
        'Já feitos': aceites.filter((s) => s.resultado === 'CONCLUIDO'),
        'Não rolou': aceites.filter((s) => s.resultado === 'NAO_SELECIONADO'),
      }
    : {};
  const temAlgum = aceites && aceites.length > 0;

  return (
    <>
      <Header title="Meus interesses" sub="Trabalhos que você curtiu" />
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        {aceites && !temAlgum && (
          <EmptyState emoji="❤️" titulo="Nada por aqui ainda">
            Quando você der ❤️ em um trabalho, ele aparece aqui para você acompanhar.
          </EmptyState>
        )}

        {Object.entries(grupos).map(([titulo, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={titulo}>
              <SectionTitle>{titulo}</SectionTitle>
              {items.map((s) => {
                const r = RESULT_LABEL[s.resultado] || RESULT_LABEL.AGUARDANDO;
                return (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/trabalhar/interesse/${s.id}`)}
                    className="w-full text-left bg-surface border border-border rounded-2xl p-3.5 mb-2.5 flex gap-3 items-center hover:border-text-mute transition active:scale-[0.99]"
                  >
                    <div
                      className="w-[62px] h-[62px] rounded-xl bg-cover bg-center flex-shrink-0 border border-border flex items-center justify-center text-2xl bg-surface-2"
                      style={s.fotos[0] ? { backgroundImage: `url('${s.fotos[0]}')` } : {}}
                    >
                      {!s.fotos[0] && catIcone(s.categoria)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[15px] mb-1 truncate">{s.titulo}</div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11.5px] font-bold ${r.cls}`}>
                        {r.txt}
                      </span>
                    </div>
                    <span className="text-text-mute">→</span>
                  </button>
                );
              })}
            </div>
          );
        })}
        <div className="h-4" />
      </div>
    </>
  );
}
