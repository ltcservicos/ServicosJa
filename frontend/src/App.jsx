import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SessionProvider, useSession } from './context/SessionContext';
import { ToastProvider } from './context/ToastContext';
import { PWAProvider } from './context/PWAContext';
import { InstallBanner } from './components/InstallBanner';
import { UpdateBanner } from './components/UpdateBanner';

import { LandingPage } from './pages/LandingPage';
import { Landing } from './pages/Landing';
import { Entrar } from './pages/Entrar';
import { Cadastro } from './pages/Cadastro';

import { ContratanteShell } from './shells/ContratanteShell';
import { Inicio } from './pages/contratante/Inicio';
import { Profissionais } from './pages/contratante/Profissionais';
import { Postar } from './pages/contratante/Postar';
import { Trabalho } from './pages/contratante/Trabalho';
import { PerfilTrabalhador } from './pages/contratante/PerfilTrabalhador';
import { PerfilContratante } from './pages/contratante/Perfil';

import { TrabalhadorShell } from './shells/TrabalhadorShell';
import { Explorar } from './pages/trabalhador/Explorar';
import { Interesses } from './pages/trabalhador/Interesses';
import { Interesse } from './pages/trabalhador/Interesse';
import { PerfilTrab } from './pages/trabalhador/Perfil';

import { Conversas } from './pages/chat/Conversas';
import { Chat } from './pages/chat/Chat';
import { Avisos } from './pages/Avisos';
import { Admin } from './pages/Admin';

function Splash() {
  return (
    <div className="app-shell items-center justify-center">
      <div className="font-display text-3xl font-extrabold animate-pulse">
        Serviço<span className="text-accent">Já.</span>
      </div>
    </div>
  );
}

// Protege rotas por papel; manda cada um para o lugar certo
function RequireRole({ tipo, children }) {
  const { user, loading } = useSession();
  const location = useLocation();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/" state={{ from: location }} replace />;
  if (user.tipo !== tipo) {
    return <Navigate to={user.tipo === 'solicitante' ? '/contratar' : '/trabalhar'} replace />;
  }
  return children;
}

// Se já está logado, pula a landing
function PublicOnly({ children }) {
  const { user, loading } = useSession();
  if (loading) return <Splash />;
  if (user) {
    return <Navigate to={user.tipo === 'solicitante' ? '/contratar' : '/trabalhar'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <PWAProvider>
        <SessionProvider>
          <Routes>
            <Route path="/" element={<PublicOnly><LandingPage /></PublicOnly>} />
            <Route path="/comecar" element={<PublicOnly><Landing /></PublicOnly>} />
            <Route path="/entrar" element={<PublicOnly><Entrar /></PublicOnly>} />
            <Route path="/cadastro" element={<PublicOnly><Cadastro /></PublicOnly>} />
            <Route path="/admin" element={<Admin />} />

            {/* App do CONTRATANTE */}
            <Route path="/contratar" element={<RequireRole tipo="solicitante"><ContratanteShell /></RequireRole>}>
              <Route index element={<Inicio />} />
              <Route path="profissionais" element={<Profissionais />} />
              <Route path="postar" element={<Postar />} />
              <Route path="trabalho/:id" element={<Trabalho />} />
              <Route path="trabalhador/:id" element={<PerfilTrabalhador />} />
              <Route path="conversas" element={<Conversas />} />
              <Route path="conversa/:id" element={<Chat />} />
              <Route path="avisos" element={<Avisos />} />
              <Route path="perfil" element={<PerfilContratante />} />
            </Route>

            {/* App do TRABALHADOR */}
            <Route path="/trabalhar" element={<RequireRole tipo="prestador"><TrabalhadorShell /></RequireRole>}>
              <Route index element={<Explorar />} />
              <Route path="interesses" element={<Interesses />} />
              <Route path="interesse/:id" element={<Interesse />} />
              <Route path="conversas" element={<Conversas />} />
              <Route path="conversa/:id" element={<Chat />} />
              <Route path="avisos" element={<Avisos />} />
              <Route path="perfil" element={<PerfilTrab />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <UpdateBanner />
          <InstallBanner />
        </SessionProvider>
        </PWAProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
