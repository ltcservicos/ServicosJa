import { useState } from 'react';
import { Button } from './UI';

// Avaliação 1–5 estrelas, com toque grande e rótulo por nota
const ROTULOS = { 1: 'Ruim', 2: 'Mais ou menos', 3: 'Bom', 4: 'Muito bom', 5: 'Excelente!' };

export function AvaliarModal({ nomeAvaliado, onAvaliar, onClose }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  const enviar = async () => {
    setLoading(true);
    try {
      await onAvaliar(nota, comentario.trim() || undefined);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 flex items-end animate-fade-in" onClick={onClose}>
      <div
        className="w-full bg-bg-soft border-t border-border rounded-t-3xl p-6 pb-9 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />
        <div className="text-center mb-5">
          <div className="font-display font-bold text-[21px]">Como foi com {nomeAvaliado}?</div>
          <div className="text-text-mute text-[14px] mt-1">Sua nota ajuda outras pessoas a escolher.</div>
        </div>

        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setNota(n)}
              className="text-[40px] active:scale-90 transition-transform"
              style={{ filter: n <= nota ? 'none' : 'grayscale(1) opacity(0.35)' }}
              aria-label={`${n} estrelas`}
            >
              ⭐
            </button>
          ))}
        </div>
        <div className="text-center h-6 text-[15px] font-bold mb-3" style={{ color: 'var(--accent)' }}>
          {nota > 0 ? ROTULOS[nota] : ''}
        </div>

        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          maxLength={300}
          placeholder="Quer contar como foi? (opcional)"
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[var(--accent)] resize-none min-h-[70px] mb-4"
        />

        <Button onClick={enviar} disabled={nota === 0 || loading}>
          {loading ? 'Enviando…' : 'Enviar avaliação'}
        </Button>
        <button onClick={onClose} className="w-full text-center text-text-mute text-[14px] font-semibold pt-3.5">
          Agora não
        </button>
      </div>
    </div>
  );
}
