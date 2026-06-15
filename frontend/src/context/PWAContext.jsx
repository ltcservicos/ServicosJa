import { createContext, useContext, useEffect, useState } from 'react';

const PWACtx = createContext(null);

// Detecta se já está rodando "instalado" (tela cheia, sem barra do navegador)
function checkStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export function PWAProvider({ children }) {
  const [deferred, setDeferred] = useState(null); // evento beforeinstallprompt (Android/Chrome)
  const [standalone, setStandalone] = useState(checkStandalone());

  const isIOS = typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(/crios|fxios|edgios/i.test(navigator.userAgent)); // Safari iOS (só ele instala PWA no iOS)

  useEffect(() => {
    const onBIP = (e) => { e.preventDefault(); setDeferred(e); };
    const onInstalled = () => { setDeferred(null); setStandalone(true); };
    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferred) return 'unavailable';
    deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') setDeferred(null);
    return choice.outcome; // 'accepted' | 'dismissed'
  };

  return (
    <PWACtx.Provider value={{ canInstall: !!deferred, isIOS, isStandalone: standalone, promptInstall }}>
      {children}
    </PWACtx.Provider>
  );
}

export const usePWA = () => useContext(PWACtx);
