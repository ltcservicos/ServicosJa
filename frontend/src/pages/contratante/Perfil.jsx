import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useSession } from '../../context/SessionContext';
import { Header, SectionTitle, StatCard, Button, Stars } from '../../components/UI';
import { initials } from '../../lib/helpers';

export function PerfilContratante() {
  const { user, logout } = useSession();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pub: 0, andamento: 0, conc: 0 });

  useEffect(() => {
    (async () => {
      try {
        const servicos = await api.meusTrabalhos();
        setStats({
          pub: servicos.length,
          andamento: servicos.filter((s) => ['ABERTO', 'APROVADO'].includes(s.estado)).length,
          conc: servicos.filter((s) => s.estado === 'CONCLUIDO').length,
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
      <Header title="Meu perfil" sub={user.email} />
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        <div className="h-[110px] -mx-5" style={{ background: 'linear-gradient(135deg, var(--accent), #60A5FA)' }} />
        <div className="flex items-end -mt-[44px] pl-1.5">
          <div className="w-[88px] h-[88px] rounded-full bg-surface-2 border-4 border-bg-soft flex items-center justify-center font-display font-bold text-[32px]">
            {initials(user.nome)}
          </div>
        </div>
        <div className="font-display text-2xl font-bold tracking-tight mt-3">{user.nome}</div>
        <div className="flex items-center gap-2 mt-1">
          <Stars nota={user.notaMedia} total={user.totalAvaliacoes} size={15} />
          <span className="text-text-mute text-[13px]">· {user.cidade}</span>
        </div>

        <SectionTitle>Meus números</SectionTitle>
        <div className="flex gap-2 mb-6">
          <StatCard n={stats.pub} l="Postados" />
          <StatCard n={stats.andamento} l="Em andamento" />
          <StatCard n={stats.conc} l="Feitos" />
        </div>

        <Button variant="ghost" onClick={sair}>Sair da conta</Button>
      </div>
    </>
  );
}
