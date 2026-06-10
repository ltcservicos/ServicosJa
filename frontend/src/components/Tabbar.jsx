import { NavLink } from 'react-router-dom';

// Tabbar fixa inferior — ícone SEMPRE com texto junto
export function Tabbar({ tabs }) {
  return (
    <nav
      className="flex-shrink-0 h-[78px] px-2 pb-[16px] pt-2 flex justify-around items-center border-t border-border backdrop-blur-xl z-20"
      style={{ background: 'rgba(14,14,16,0.92)' }}
    >
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold tracking-wide transition-colors relative"
          style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : '#6B6B78' })}
        >
          <span className="relative">
            {t.icon}
            {t.badge > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-bg">
                {t.badge > 9 ? '9+' : t.badge}
              </span>
            )}
          </span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
