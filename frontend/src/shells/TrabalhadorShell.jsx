import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Tabbar } from '../components/Tabbar';
import { Onboarding } from '../components/Onboarding';
import { Icon } from '../components/Icons';
import { api } from '../lib/api';

const SLIDES = [
  { emoji: '👉', titulo: 'Deslize os trabalhos', texto: 'Aparecem só trabalhos do seu ramo. Arraste para o lado ou use os botões.' },
  { emoji: '🤝', titulo: 'Gostou? Demonstre interesse', texto: 'Toque no 🤝 e o cliente fica sabendo. Sem compromisso ainda.' },
  { emoji: '💬', titulo: 'O cliente chama no chat', texto: 'Se ele gostar de você, abre uma conversa. Combinem o preço e fechem o trabalho.' },
];

export function TrabalhadorShell() {
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('onboarding_trabalhador')
  );
  const [chatBadge, setChatBadge] = useState(0);

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

  const hideTabbar = /\/conversa\//.test(location.pathname);

  return (
    <div className="app-shell" style={{ '--accent': '#60A5FA', '--accent-text': '#0E0E10' }}>
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <Outlet />
      </div>
      {!hideTabbar && (
        <Tabbar
          tabs={[
            { to: '/trabalhar', end: true, label: 'Trabalhos', icon: <Icon.Cards /> },
            { to: '/trabalhar/interesses', label: 'Interesses', icon: <Icon.Handshake width={22} height={22} /> },
            { to: '/trabalhar/conversas', label: 'Conversas', icon: <Icon.Chat />, badge: chatBadge },
            { to: '/trabalhar/perfil', label: 'Perfil', icon: <Icon.User /> },
          ]}
        />
      )}
      {showOnboarding && (
        <Onboarding
          slides={SLIDES}
          storageKey="onboarding_trabalhador"
          onDone={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
