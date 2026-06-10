import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Button, Header, Input } from '../../components/UI';
import { Icon } from '../../components/Icons';
import { CATEGORIAS, fotoDefault } from '../../lib/constants';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../lib/helpers';

// Postar em 3 passos: O quê? → Onde? → Foto e revisão
export function Postar() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);

  const [step, setStep] = useState(1);
  const [categoria, setCategoria] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cep, setCep] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCep = async (val) => {
    const cleaned = val.replace(/\D/g, '');
    setCep(cleaned);
    if (cleaned.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setCidade(data.localidade || '');
          setBairro(data.bairro || '');
        } else toast('CEP não encontrado. Preencha cidade e bairro abaixo.', 'error');
      } catch {
        toast('Não deu para buscar o CEP. Preencha cidade e bairro abaixo.', 'error');
      } finally {
        setCepLoading(false);
      }
    }
  };

  const addFoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (fotos.length >= 3) { toast('Máximo de 3 fotos', 'error'); return; }
    try {
      const dataUrl = await compressImage(file);
      setFotos((f) => [...f, dataUrl]);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const publicar = async () => {
    setLoading(true);
    try {
      await api.publicarTrabalho({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria: categoria.nome,
        fotos: fotos.length > 0 ? fotos : [fotoDefault(categoria.nome)],
        cidade: cidade.trim(),
        bairro: bairro.trim(),
      });
      toast('Pronto! Seu trabalho está no ar ✅', 'success');
      navigate('/contratar', { replace: true });
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const canStep1 = categoria && titulo.trim().length >= 5 && descricao.trim().length >= 10;
  const canStep2 = cidade.trim() && bairro.trim();

  return (
    <>
      <Header
        onBack={() => (step === 1 ? navigate('/contratar') : setStep(step - 1))}
        title="Postar trabalho"
        sub={`Passo ${step} de 3`}
      />

      {/* Barra de progresso */}
      <div className="px-5 pb-3 flex gap-1.5 flex-shrink-0">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ background: i <= step ? 'var(--accent)' : '#2E2E38' }}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="font-display font-bold text-[20px] mb-2.5">Que tipo de serviço?</div>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIAS.map((c) => {
                  const active = categoria?.nome === c.nome;
                  return (
                    <button
                      key={c.nome}
                      type="button"
                      onClick={() => setCategoria(c)}
                      className="flex items-center gap-2.5 rounded-xl border px-3 py-3 transition active:scale-[0.97] text-left"
                      style={
                        active
                          ? { background: 'var(--accent)', color: 'var(--accent-text)', borderColor: 'var(--accent)' }
                          : { background: '#1E1E24', color: '#9C9CA8', borderColor: '#2E2E38' }
                      }
                    >
                      <span className="text-[22px]">{c.icone}</span>
                      <span className="text-[13px] font-bold leading-tight">{c.curto}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label="Dê um nome curto para o trabalho"
              value={titulo}
              onChange={setTitulo}
              placeholder="Ex: Vazamento na pia da cozinha"
              maxLength={60}
            />

            <div>
              <label className="block text-[13px] text-text-dim mb-1.5 font-semibold">
                Conte o que está acontecendo
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                maxLength={500}
                placeholder="Explique com suas palavras. Quanto mais detalhes, melhor."
                className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-[16px] outline-none focus:border-[var(--accent)] resize-none min-h-[110px]"
              />
            </div>

            <Button onClick={() => setStep(2)} disabled={!canStep1}>Próximo →</Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="font-display font-bold text-[20px]">Onde é o trabalho?</div>

            <div>
              <label className="block text-[13px] text-text-dim mb-1.5 font-semibold">
                CEP (preenche o resto sozinho)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={cep}
                  onChange={(e) => handleCep(e.target.value)}
                  maxLength={8}
                  placeholder="Só números. Ex: 05422010"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-[16px] outline-none focus:border-[var(--accent)]"
                />
                {cepLoading && <span className="absolute right-4 top-4 text-[13px] text-text-mute">buscando…</span>}
              </div>
            </div>

            <Input label="Cidade" value={cidade} onChange={setCidade} placeholder="Ex: São Paulo" />
            <Input label="Bairro" value={bairro} onChange={setBairro} placeholder="Ex: Pinheiros" />

            <div className="bg-surface border border-border rounded-xl p-3.5 text-[13px] text-text-mute leading-relaxed">
              🔒 Seu endereço completo fica só com você. Os profissionais veem apenas a cidade e o bairro.
            </div>

            <Button onClick={() => setStep(3)} disabled={!canStep2}>Próximo →</Button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="font-display font-bold text-[20px]">Quer mostrar uma foto?</div>
              <div className="text-text-mute text-[14px] mt-1">
                Uma foto ajuda muito quem vai fazer. Mas é opcional.
              </div>
            </div>

            <div className="flex gap-2.5">
              {fotos.map((f, i) => (
                <div
                  key={i}
                  className="w-[88px] h-[88px] rounded-xl border-2 bg-cover bg-center relative"
                  style={{ backgroundImage: `url('${f}')`, borderColor: 'var(--accent)' }}
                >
                  <button
                    onClick={() => setFotos(fotos.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-base font-bold"
                    aria-label="Remover foto"
                  >×</button>
                </div>
              ))}
              {fotos.length < 3 && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-[88px] h-[88px] rounded-xl bg-surface border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-text-mute active:scale-95 transition"
                >
                  <Icon.Camera />
                  <span className="text-[11px] font-semibold">Foto</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addFoto} />
            </div>

            {/* Revisão */}
            <div className="bg-surface border border-border rounded-2xl p-4">
              <div className="text-[12px] text-text-mute uppercase tracking-wider font-semibold mb-2.5">Confira antes de postar</div>
              <div className="flex items-center gap-2 text-[15px] font-bold mb-1">
                <span>{categoria?.icone}</span> {titulo}
              </div>
              <div className="text-[13.5px] text-text-dim leading-relaxed mb-2">{descricao}</div>
              <div className="text-[13px] text-text-mute">📍 {bairro}, {cidade}</div>
            </div>

            <Button onClick={publicar} disabled={loading}>
              {loading ? 'Postando…' : '✅ Postar agora'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
