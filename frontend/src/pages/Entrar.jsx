import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useToast } from '../context/ToastContext';
import { Button, Header, Input } from '../components/UI';

export function Entrar() {
  const { login } = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email.trim(), senha);
      navigate(u.tipo === 'solicitante' ? '/contratar' : '/trabalhar', { replace: true });
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell" style={{ '--accent': '#D6FF3A', '--accent-text': '#0E0E10' }}>
      <Header onBack={() => navigate('/')} title="Entrar" sub="Bom te ver de novo!" />
      <form onSubmit={submit} className="flex-1 px-6 pt-4 flex flex-col gap-4">
        <Input label="Seu e-mail" type="email" value={email} onChange={setEmail} placeholder="exemplo@email.com" required autoComplete="email" />
        <Input label="Sua senha" type="password" value={senha} onChange={setSenha} placeholder="••••" required autoComplete="current-password" />
        <div className="pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </div>
        <Link to="/" className="text-center text-text-mute text-[15px] py-2">
          Não tem conta? <span className="underline font-semibold text-text-dim">Criar agora</span>
        </Link>
      </form>
    </div>
  );
}
