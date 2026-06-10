import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useToast } from '../context/ToastContext';
import { Button, Header, Input } from '../components/UI';
import { CATEGORIAS } from '../lib/constants';

// Cadastro mínimo: nome, WhatsApp, cidade, e-mail, senha.
// Trabalhador tem um passo a mais: escolher o ramo (com ícones grandes).
export function Cadastro() {
  const [params] = useSearchParams();
  const papel = params.get('papel') === 'trabalhador' ? 'trabalhador' : 'contratante';
  const isTrab = papel === 'trabalhador';
  const accent = isTrab ? '#60A5FA' : '#D6FF3A';

  const { signup } = useSession();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleCat = (nome) =>
    setCats((prev) => (prev.includes(nome) ? prev.filter((c) => c !== nome) : [...prev, nome]));

  const doSignup = async (extra = {}) => {
    setLoading(true);
    try {
      await signup({
        tipo: isTrab ? 'prestador' : 'solicitante',
        nome: nome.trim(),
        whatsapp: whatsapp.replace(/\D/g, ''),
        cidade: cidade.trim(),
        email: email.trim(),
        senha,
        ...extra,
      });
      navigate(isTrab ? '/trabalhar' : '/contratar', { replace: true });
    } catch (err) {
      toast(err.message, 'error');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (senha.length < 4) { toast('A senha precisa de pelo menos 4 letras ou números', 'error'); return; }
    if (isTrab) setStep(2);
    else doSignup();
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (cats.length === 0) { toast('Escolha pelo menos um ramo de trabalho', 'error'); return; }
    doSignup({ categorias: cats, bairros: [], descricao: 'Profissional cadastrado no ServiçoJá.' });
  };

  return (
    <div className="app-shell" style={{ '--accent': accent, '--accent-text': '#0E0E10' }}>
      <Header
        onBack={() => (step === 2 ? setStep(1) : navigate('/'))}
        title={isTrab ? 'Quero trabalhar' : 'Quero contratar'}
        sub={isTrab ? `Passo ${step} de 2` : 'Leva menos de 1 minuto'}
      />

      {step === 1 ? (
        <form onSubmit={handleStep1} className="flex-1 overflow-y-auto no-scrollbar px-6 pt-2 pb-8 flex flex-col gap-4">
          <Input label="Seu nome" value={nome} onChange={setNome} placeholder="Como te chamam?" required autoComplete="name" />
          <Input label="Seu WhatsApp" value={whatsapp} onChange={setWhatsapp} placeholder="Com DDD. Ex: 11 99999-9999" required inputMode="tel" autoComplete="tel" />
          <Input label="Sua cidade" value={cidade} onChange={setCidade} placeholder="Ex: São Paulo" required />
          <Input label="Seu e-mail" type="email" value={email} onChange={setEmail} placeholder="exemplo@email.com" required autoComplete="email" />
          <Input label="Crie uma senha" type="password" value={senha} onChange={setSenha} placeholder="Mínimo de 4 caracteres" required autoComplete="new-password" />
          <div className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando…' : isTrab ? 'Próximo passo →' : 'Criar minha conta'}
            </Button>
          </div>
          <Link to="/entrar" className="text-center text-text-mute text-[15px] py-1">
            Já tem conta? <span className="underline font-semibold text-text-dim">Entrar</span>
          </Link>
        </form>
      ) : (
        <form onSubmit={handleStep2} className="flex-1 overflow-y-auto no-scrollbar px-6 pt-2 pb-8 flex flex-col">
          <div className="mb-4">
            <div className="font-display font-bold text-[20px] leading-tight">Qual é o seu ramo?</div>
            <div className="text-text-mute text-[14px] mt-1">
              Pode escolher mais de um. Você só verá trabalhos desses ramos.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIAS.map((c) => {
              const active = cats.includes(c.nome);
              return (
                <button
                  key={c.nome}
                  type="button"
                  onClick={() => toggleCat(c.nome)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border p-4 transition active:scale-[0.97]"
                  style={
                    active
                      ? { background: accent, color: '#0E0E10', borderColor: accent }
                      : { background: '#1E1E24', color: '#9C9CA8', borderColor: '#2E2E38' }
                  }
                >
                  <span className="text-[30px]">{c.icone}</span>
                  <span className="text-[13px] font-bold text-center leading-tight">{c.curto}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-5">
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando…' : `Pronto! Criar minha conta${cats.length ? ` (${cats.length})` : ''}`}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
