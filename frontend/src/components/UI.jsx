import { badgeClasses, initials } from '../lib/helpers';
import { Icon } from './Icons';

// O accent do papel atual vem da CSS var --accent (definida no shell)

export function Badge({ estado }) {
  const { cls, label } = badgeClasses(estado);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

export function SectionTitle({ children }) {
  return (
    <div className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-text-mute mt-5 mb-3">
      {children}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface border border-border rounded-2xl p-4 mb-3 ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ emoji, titulo, children }) {
  return (
    <div className="pt-14 text-center px-6">
      <div className="text-5xl mb-3">{emoji}</div>
      <div className="font-display font-bold text-xl mb-1.5 text-text-main">{titulo}</div>
      <div className="text-text-mute text-[14px] max-w-[270px] mx-auto leading-relaxed">{children}</div>
    </div>
  );
}

export function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'w-10 h-10 text-sm', md: 'w-12 h-12 text-lg', lg: 'w-[90px] h-[90px] text-[34px]' };
  return (
    <div className={`rounded-full bg-surface-2 flex items-center justify-center font-display font-bold flex-shrink-0 text-text-main ${sizes[size]}`}>
      {initials(name)}
    </div>
  );
}

export function Stars({ nota = 0, total = null, size = 13 }) {
  if (!total) {
    return <span className="text-[12px] text-text-mute">Novo por aqui</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-amber-400 text-[13px] font-semibold">
      <Icon.Star width={size} height={size} />
      {Number(nota).toFixed(1).replace('.', ',')}
      <span className="text-text-mute font-normal">({total})</span>
    </span>
  );
}

export function StatCard({ n, l }) {
  return (
    <div className="flex-1 bg-surface border border-border rounded-2xl p-3">
      <div className="font-display font-bold text-[22px]">{n}</div>
      <div className="text-[11px] text-text-mute uppercase tracking-wider mt-0.5">{l}</div>
    </div>
  );
}

export function Chip({ children, active = false }) {
  if (active) {
    return (
      <div className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
        {children}
      </div>
    );
  }
  return (
    <div className="bg-surface border border-border rounded-lg px-2.5 py-1.5 text-[12px] text-text-dim">
      {children}
    </div>
  );
}

// Botão grande (mín. 56px) — uma ação principal por tela
export function Button({ children, variant = 'primary', className = '', ...rest }) {
  const variants = {
    primary: { background: 'var(--accent)', color: 'var(--accent-text)' },
    success: { background: '#34D399', color: '#0E0E10' },
    danger: { background: 'rgba(248,113,113,0.12)', color: '#F87171', border: '1px solid rgba(248,113,113,0.4)' },
    ghost: { background: 'transparent', color: '#F4F4F6', border: '1px solid #2E2E38' },
  };
  return (
    <button
      className={`w-full min-h-[56px] py-3.5 px-4 rounded-2xl font-bold text-[16px] active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      style={variants[variant]}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Header({ title, sub, right, onBack }) {
  return (
    <div className="px-5 pt-4 pb-3.5 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 -ml-1 rounded-xl flex items-center justify-center text-text-dim hover:text-text-main flex-shrink-0"
            aria-label="Voltar"
          >
            <Icon.Back />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="font-display font-bold text-[22px] tracking-tight truncate">{title}</h1>
          {sub && <div className="text-[13px] text-text-mute mt-0.5 truncate">{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function IconButton({ children, onClick, hasDot = false, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-[42px] h-[42px] rounded-xl bg-surface border border-border flex items-center justify-center text-text-main hover:bg-surface-2 relative flex-shrink-0"
    >
      {children}
      {hasDot && <span className="absolute top-2 right-2 w-[9px] h-[9px] rounded-full bg-red-500 border-2 border-bg-soft" />}
    </button>
  );
}

export function Input({ label, value, onChange, placeholder, type = 'text', required, ...rest }) {
  return (
    <div>
      {label && <label className="block text-[13px] text-text-dim mb-1.5 font-semibold">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-[16px] text-text-main outline-none focus:border-[var(--accent)] transition"
        {...rest}
      />
    </div>
  );
}
