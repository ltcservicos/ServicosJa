import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Header, Card, SectionTitle, StatCard, Chip, Stars } from '../../components/UI';
import { initials } from '../../lib/helpers';

export function PerfilTrabalhador() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);

  useEffect(() => {
    api.getTrabalhador(id).then(setP).catch(() => {});
  }, [id]);

  if (!p) {
    return (
      <>
        <Header onBack={() => navigate(-1)} title="Perfil" />
        <div className="px-5 text-text-mute">Carregando…</div>
      </>
    );
  }

  return (
    <>
      <Header onBack={() => navigate(-1)} title="Perfil do profissional" />
      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        <div className="h-[110px] -mx-5" style={{ background: 'linear-gradient(135deg, var(--accent), #60A5FA)' }} />
        <div className="flex items-end -mt-[44px] pl-1.5">
          <div className="w-[88px] h-[88px] rounded-full bg-surface-2 border-4 border-bg-soft flex items-center justify-center font-display font-bold text-[32px]">
            {initials(p.nome)}
          </div>
        </div>
        <div className="font-display text-2xl font-bold tracking-tight mt-3">{p.nome}</div>
        <div className="flex items-center gap-2 mt-1">
          <Stars nota={p.notaMedia} total={p.totalAvaliacoes} size={15} />
          <span className="text-text-mute text-[13px]">· {p.cidade}</span>
        </div>

        <Card className="mt-4">
          <div className="text-[14px] leading-relaxed text-text-dim">
            {p.descricao || 'Profissional cadastrado no ServiçoJá.'}
          </div>
        </Card>

        <div className="flex gap-2 mb-1">
          <StatCard n={p.servicosConcluidos || 0} l="Trabalhos feitos" />
          <StatCard n={p.totalAvaliacoes || 0} l="Avaliações" />
        </div>

        <SectionTitle>O que ele faz</SectionTitle>
        <div className="flex gap-1.5 flex-wrap">
          {(p.categorias || []).map((c) => <Chip key={c}>{c}</Chip>)}
        </div>

        {(p.bairros || []).length > 0 && (
          <>
            <SectionTitle>Onde atende</SectionTitle>
            <div className="flex gap-1.5 flex-wrap">
              {(p.bairros || []).map((b) => <Chip key={b}>{b}</Chip>)}
            </div>
          </>
        )}
      </div>
    </>
  );
}
