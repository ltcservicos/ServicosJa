import { useState } from 'react';
import { Button } from './UI';

// 3 telas no máximo, com gesto/ação principal explicado por desenho + frase curta
export function Onboarding({ slides, storageKey, onDone }) {
  const [idx, setIdx] = useState(0);
  const last = idx === slides.length - 1;
  const s = slides[idx];

  const finish = () => {
    localStorage.setItem(storageKey, '1');
    onDone();
  };

  return (
    <div className="absolute inset-0 z-50 bg-bg-soft flex flex-col animate-fade-in">
      <div className="flex justify-end p-4">
        <button onClick={finish} className="text-text-mute text-[14px] font-semibold px-3 py-2">
          Pular
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-5" key={idx}>
        <div className="text-[88px] leading-none animate-pop-in">{s.emoji}</div>
        <div className="font-display text-[26px] font-extrabold tracking-tight leading-tight">{s.titulo}</div>
        <div className="text-text-dim text-[16px] leading-relaxed max-w-[290px]">{s.texto}</div>
      </div>

      <div className="p-6 pb-9 flex flex-col gap-5">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === idx ? 24 : 8,
                background: i === idx ? 'var(--accent)' : '#2E2E38',
              }}
            />
          ))}
        </div>
        <Button onClick={() => (last ? finish() : setIdx(idx + 1))}>
          {last ? 'Começar agora' : 'Próximo'}
        </Button>
      </div>
    </div>
  );
}
