import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePWA } from '../context/PWAContext';

// Banner que convida a instalar o app na tela inicial.
// Android/Chrome: 1 toque instala. iPhone (Safari): mostra o passo a passo.
// Aparece só nas páginas públicas (pra não cobrir a tabbar dentro do app).
const ROTAS_PUBLICAS = ['/', '/entrar', '/cadastro', '/comecar'];

export function InstallBanner() {
  const { canInstall, isIOS, isStandalone, promptInstall } = usePWA();
  const { pathname } = useLocation();
  const [fechado, setFechado] = useState(() => sessionStorage.getItem('pwa_dismiss') === '1');
  const [iosOpen, setIosOpen] = useState(false);

  // Não mostra fora das páginas públicas, se já instalado, se foi fechado, ou sem suporte (desktop)
  if (!ROTAS_PUBLICAS.includes(pathname) || isStandalone || fechado || (!canInstall && !isIOS)) return null;

  const fechar = () => { setFechado(true); sessionStorage.setItem('pwa_dismiss', '1'); };

  const instalar = async () => {
    if (canInstall) {
      const r = await promptInstall();
      if (r === 'accepted') fechar();
    } else if (isIOS) {
      setIosOpen((v) => !v);
    }
  };

  return (
    <div className="lp-install" role="dialog" aria-label="Instalar aplicativo">
      <style>{CSS}</style>
      <div className="pwa-row">
        <div className="pwa-ic">📲</div>
        <div className="pwa-tx">
          <strong>Use como aplicativo</strong>
          <span>Adicione à tela inicial — abre em tela cheia, sem baixar nada.</span>
        </div>
        <button className="pwa-btn" onClick={instalar}>{canInstall ? 'Instalar' : 'Como instalar'}</button>
        <button className="pwa-x" onClick={fechar} aria-label="Fechar">✕</button>
      </div>

      {iosOpen && isIOS && (
        <div className="pwa-ios">
          <div className="pwa-ios-step"><span>1</span> Toque em <b>Compartilhar</b> <i className="pwa-share">􀈂</i> na barra do Safari</div>
          <div className="pwa-ios-step"><span>2</span> Role e escolha <b>“Adicionar à Tela de Início”</b></div>
          <div className="pwa-ios-step"><span>3</span> Toque em <b>Adicionar</b> — pronto, vira um app! 🎉</div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.lp-install { position:fixed; left:50%; transform:translateX(-50%); bottom:16px; width:min(440px, calc(100vw - 24px));
  background:#16161A; border:1px solid #2E2E38; border-radius:18px; z-index:9000;
  box-shadow:0 20px 50px rgba(0,0,0,.55); animation:pwa-up .35s cubic-bezier(.2,.8,.2,1); }
@keyframes pwa-up { from{ transform:translate(-50%, 30px); opacity:0 } to{ transform:translate(-50%,0); opacity:1 } }
.pwa-row { display:flex; align-items:center; gap:12px; padding:13px 14px; }
.pwa-ic { font-size:30px; flex-shrink:0; }
.pwa-tx { flex:1; min-width:0; display:flex; flex-direction:column; line-height:1.25; }
.pwa-tx strong { font-family:'Bricolage Grotesque',sans-serif; font-size:15px; color:#F4F4F6; }
.pwa-tx span { font-size:12px; color:#9C9CA8; margin-top:2px; }
.pwa-btn { flex-shrink:0; background:#D6FF3A; color:#0E0E10; font-weight:800; font-size:14px;
  border:0; border-radius:12px; padding:11px 16px; cursor:pointer; }
.pwa-btn:active { transform:scale(.96); }
.pwa-x { flex-shrink:0; background:transparent; border:0; color:#6B6B78; font-size:15px; cursor:pointer; padding:6px; }
.pwa-ios { padding:0 16px 15px; display:flex; flex-direction:column; gap:9px; }
.pwa-ios-step { display:flex; align-items:center; gap:9px; font-size:13.5px; color:#D7D7DE; }
.pwa-ios-step span { flex-shrink:0; width:22px; height:22px; border-radius:50%; background:#D6FF3A; color:#0E0E10;
  font-weight:800; font-size:12px; display:flex; align-items:center; justify-content:center; }
.pwa-ios-step b { color:#F4F4F6; }
.pwa-share { font-style:normal; color:#60A5FA; }
`;
