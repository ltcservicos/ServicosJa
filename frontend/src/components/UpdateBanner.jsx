import { useEffect, useState } from 'react';

// Detecta nova versão comparando o bundle carregado com o que está no servidor.
// Quando o app é redeployado, o nome do arquivo /assets/index-XXXX.js muda —
// é isso que usamos pra saber que tem versão nova, sem depender do service worker.
function bundleAtual() {
  const s = [...document.querySelectorAll('script[type="module"][src]')]
    .map((x) => { try { return new URL(x.src).pathname; } catch { return ''; } })
    .find((p) => /\/assets\/index-.*\.js$/.test(p));
  return s || null;
}

export function UpdateBanner() {
  // ?nova-versao=1 força o banner (útil pra demonstrar/testar o visual)
  const [novaVersao, setNovaVersao] = useState(() => {
    try { return new URLSearchParams(window.location.search).has('nova-versao'); } catch { return false; }
  });

  useEffect(() => {
    const atual = bundleAtual();
    if (!atual) return; // dev (sem bundle hash) — ignora

    const checar = async () => {
      try {
        const html = await fetch('/?v=' + Date.now(), { cache: 'no-store' }).then((r) => r.text());
        const m = html.match(/\/assets\/index-[^"']+\.js/);
        if (m && m[0] !== atual) setNovaVersao(true);
      } catch {}
    };

    checar();
    const id = setInterval(checar, 60000);              // checa a cada 1 min
    const onFocus = () => checar();
    window.addEventListener('focus', onFocus);          // e quando volta pro app
    document.addEventListener('visibilitychange', onFocus);
    return () => { clearInterval(id); window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onFocus); };
  }, []);

  const atualizar = async () => {
    // limpa caches do PWA e força recarregar a versão nova
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update()));
      }
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {}
    window.location.reload();
  };

  if (!novaVersao) return null;

  return (
    <div className="upd-banner" role="alert">
      <style>{CSS}</style>
      <span className="upd-ic">🚀</span>
      <span className="upd-tx">Nova versão disponível</span>
      <button className="upd-btn" onClick={atualizar}>Atualizar</button>
    </div>
  );
}

const CSS = `
.upd-banner { position:fixed; top:0; left:0; right:0; z-index:9500; display:flex; align-items:center; gap:10px;
  padding:11px 16px calc(11px + env(safe-area-inset-top)); padding-top:max(11px, env(safe-area-inset-top));
  background:#D6FF3A; color:#0E0E10; box-shadow:0 6px 24px rgba(0,0,0,.35); animation:upd-down .3s ease; }
@keyframes upd-down { from{ transform:translateY(-100%) } to{ transform:translateY(0) } }
.upd-ic { font-size:18px; }
.upd-tx { flex:1; font-weight:800; font-size:14.5px; font-family:'Bricolage Grotesque',sans-serif; }
.upd-btn { background:#0E0E10; color:#D6FF3A; border:0; border-radius:10px; padding:9px 16px; font-weight:800; font-size:14px; cursor:pointer; }
.upd-btn:active { transform:scale(.96); }
`;
