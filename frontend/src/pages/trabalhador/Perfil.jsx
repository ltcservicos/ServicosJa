import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useSession } from '../../context/SessionContext';
import { Header, SectionTitle, StatCard, Chip, Button, Stars } from '../../components/UI';
import { initials, formatWpp } from '../../lib/helpers';

export function PerfilTrab() {
  const { user, logout } = useSession();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ interesses: 0, fechados: 0 });

  useEffect(() => {
    (async () => {
      try {
        const aceites = await api.meusInteresses();
        setStats({
          interesses: aceites.length,
          fechados: aceites.filter((s) => ['APROVADO', 'CONCLUIDO'].includes(s.resultado)).length,
        });
      } catch {}
    })();
  }, []);

  const sair = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      <Header title="Meu perfil" sub={`📱 ${formatWpp(user.whatsapp)}`} />
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        <div className="h-[110px] -mx-5" style={{ background: 'linear-gradient(135deg, var(--accent), #2A2A33)' }} />
        <div className="flex items-end -mt-[44px] pl-1.5">
          <div
            className="w-[88px] h-[88px] rounded-full border-4 border-bg-soft flex items-center justify-center font-display font-bold text-[32px]"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {initials(user.nome)}
          </div>
        </div>
        <div className="font-display text-2xl font-bold tracking-tight mt-3">{user.nome}</div>
        <div className="flex items-center gap-2 mt-1">
          <Stars nota={user.notaMedia} total={user.totalAvaliacoes} size={15} />
          <span className="text-text-mute text-[13px]">· {user.cidade}</span>
        </div>

        <SectionTitle>Meus números</SectionTitle>
        <div className="flex gap-2">
          <StatCard n={user.servicosConcluidos || 0} l="Trabalhos feitos" />
          <StatCard n={stats.fechados} l="Fechados" />
          <StatCard n={stats.interesses} l="Interesses" />
        </div>

        <SectionTitle>Meu ramo</SectionTitle>
        <div className="flex gap-1.5 flex-wrap mb-6">
          {(user.categorias || []).map((c) => <Chip key={c} active>{c}</Chip>)}
        </div>

        <Button variant="ghost" onClick={sair}>Sair da conta</Button>
      </div>
    </>
  );
}
