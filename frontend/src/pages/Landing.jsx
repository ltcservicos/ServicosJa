import { Link } from 'react-router-dom';

// Primeira tela: uma pergunta, duas respostas grandes. Sem jargão.
export function Landing() {
  return (
    <div className="app-shell" style={{ '--accent': '#D6FF3A', '--accent-text': '#0E0E10' }}>
      <div className="flex-1 flex flex-col p-7 pt-14 relative overflow-hidden">
        {/* Decoração */}
        <div className="blob" style={{ width: 260, height: 260, background: '#D6FF3A', top: -60, right: -80 }} />
        <div className="blob" style={{ width: 200, height: 200, background: '#60A5FA', bottom: 60, left: -80, opacity: 0.35 }} />

        <div className="relative z-10">
          <div className="font-display text-[52px] font-extrabold leading-none tracking-tight">
            Serviço<span className="text-accent">Já.</span>
          </div>
          <div className="mt-3 text-text-dim text-[17px] leading-relaxed max-w-[300px]">
            Quem precisa encontra quem faz. Direto, pelo celular, sem complicação.
          </div>
        </div>

        <div className="flex-1" />

        <div className="relative z-10 flex flex-col gap-3.5 pb-2">
          <div className="font-display font-bold text-[19px] mb-1">O que você quer fazer?</div>

          <Link
            to="/cadastro?papel=contratante"
            className="flex items-center gap-4 bg-accent text-bg rounded-2xl p-5 active:scale-[0.98] transition-transform"
          >
            <span className="text-[34px]">🏠</span>
            <span className="flex-1">
              <span className="block font-display font-extrabold text-[19px] leading-tight">Quero contratar</span>
              <span className="block text-[13.5px] opacity-80 mt-0.5">Preciso de alguém para um serviço</span>
            </span>
            <span className="text-[22px] font-bold">→</span>
          </Link>

          <Link
            to="/cadastro?papel=trabalhador"
            className="flex items-center gap-4 rounded-2xl p-5 active:scale-[0.98] transition-transform"
            style={{ background: '#60A5FA', color: '#0E0E10' }}
          >
            <span className="text-[34px]">🛠️</span>
            <span className="flex-1">
              <span className="block font-display font-extrabold text-[19px] leading-tight">Quero trabalhar</span>
              <span className="block text-[13.5px] opacity-80 mt-0.5">Sou profissional e busco serviços</span>
            </span>
            <span className="text-[22px] font-bold">→</span>
          </Link>

          <Link
            to="/entrar"
            className="text-center text-text-dim text-[15px] font-semibold py-3.5 hover:text-text-main"
          >
            Já tenho conta — <span className="underline">Entrar</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
