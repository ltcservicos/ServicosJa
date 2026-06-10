export function timeAgo(ts) {
  const d = typeof ts === 'string' ? new Date(ts).getTime() : ts;
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const days = Math.floor(h / 24);
  return `há ${days}d`;
}

export function horaMsg(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatWpp(n) {
  if (!n) return '';
  const clean = n.replace(/\D/g, '');
  if (clean.length === 13) return `+${clean.slice(0,2)} (${clean.slice(2,4)}) ${clean.slice(4,9)}-${clean.slice(9)}`;
  return n;
}

export function initials(name) {
  if (!name) return '';
  return name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
}

export function primeiroNome(name) {
  return (name || '').split(' ')[0];
}

export function badgeClasses(estado) {
  const map = {
    ABERTO:               { cls: 'bg-blue-500/15 text-blue-400', label: 'No ar' },
    AGUARDANDO_APROVACAO: { cls: 'bg-orange-500/15 text-orange-400', label: 'Aguardando' },
    APROVADO:             { cls: 'bg-emerald-500/15 text-emerald-400', label: 'Combinado' },
    CONCLUIDO:            { cls: 'bg-zinc-500/15 text-zinc-400', label: 'Feito' },
    CANCELADO:            { cls: 'bg-red-500/15 text-red-400', label: 'Cancelado' },
  };
  return map[estado] || map.CONCLUIDO;
}

// Redimensiona uma foto local para no máx. 1280px e devolve data-URL JPEG
export function compressImage(file, maxSize = 1280, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler a foto'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo não é uma foto válida'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
