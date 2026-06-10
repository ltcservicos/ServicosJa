import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Tabbar } from '../components/Tabbar';
import { Onboarding } from '../components/Onboarding';
import { Icon } from '../components/Icons';
import { api } from '../lib/api';

const SLIDES = [
  { emoji: '📸', titulo: 'Mostre o que precisa', texto: 'Tire uma foto do problema e conte em poucas palavras. Leva menos de 1 minuto.' },
  { emoji: '🙋', titulo: 'Os interessados aparecem', texto: 'Profissionais da sua região veem seu pedido e levantam a mão. Você vê a nota e os trabalhos de cada um.' },
  { emoji: '💬', titulo: 'Converse e feche negócio', texto: 'Chame quem você gostar no chat, combine o preço e pronto. Simples assim.' },
];

export function ContratanteShell() {
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('onboarding_contratante')
  );
  const [chatBadge, setChatBadge] = useState(0);

  // Badge de mensagens não lidas (polling leve)
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await api.conversasUnread();
        if (alive) setChatBadge(r.count);
      } catch {}
    };
    load();
    const id = setInterval(load, 5000);
    return () => { alive = false; clearInterval(id); };
  }, [location.pathname]);

  // Esconde a tabbar dentro do chat e do fluxo de postar
  const hideTabbar = /\/conversa\/|\/postar/.test(location.pathname);

  return (
    <div className="app-shell" style={{ '--accent': '#D6FF3A', '--accent-text': '#0E0E10' }}>
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <Outlet />
      </div>
      {!hideTabbar && (
        <Tabbar
          tabs={[
            { to: '/contratar', end: true, label: 'Início', icon: <Icon.Home /> },
            { to: '/contratar/postar', label: 'Postar', icon: <Icon.Plus /> },
            { to: '/contratar/conversas', label: 'Conversas', icon: <Icon.Chat />, badge: chatBadge },
            { to: '/contratar/perfil', label: 'Perfil', icon: <Icon.User /> },
          ]}
        />
      )}
      {showOnboarding && (
        <Onboarding
          slides={SLIDES}
          storageKey="onboarding_contratante"
          onDone={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
