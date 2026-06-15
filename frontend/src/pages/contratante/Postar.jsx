import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Button, Header, Input } from '../../components/UI';
import { Icon } from '../../components/Icons';
import { CATEGORIAS, fotoDefault } from '../../lib/constants';
import { useToast } from '../../context/ToastContext';
import { useSession } from '../../context/SessionContext';
import { compressImage } from '../../lib/helpers';

// Postar em 2 passos: O quê? → Onde (+ foto opcional)
// O título é gerado sozinho: "Pintura em Pinheiros"
export function Postar() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSession();
  const fileRef = useRef(null);    // galeria
  const cameraRef = useRef(null);  // câmera (capture)

  const [step, setStep] = useState(1);
  const [categoria, setCategoria] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [cidade, setCidade] = useState(user.cidade || '');
  const [bairro, setBairro] = useState('');
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);

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
        titulo: `${categoria.curto} em ${bairro.trim()}`,
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

  const canStep1 = categoria && descricao.trim().length >= 10;
  const canPublicar = cidade.trim() && bairro.trim();

  return (
    <>
      <Header
        onBack={() => (step === 1 ? navigate('/contratar') : setStep(1))}
        title="Postar trabalho"
        sub={`Passo ${step} de 2`}
      />

      {/* Barra de progresso */}
      <div className="px-5 pb-3 flex gap-1.5 flex-shrink-0">
        {[1, 2].map((i) => (
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

            <div>
              <label className="block text-[13px] text-text-dim mb-1.5 font-semibold">
                Conte o que você precisa
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                maxLength={500}
                placeholder="Com suas palavras. Ex: a torneira da cozinha está pingando há dois dias."
                className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-[16px] outline-none focus:border-[var(--accent)] resize-none min-h-[120px]"
              />
            </div>

            <Button onClick={() => setStep(2)} disabled={!canStep1}>Próximo →</Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="font-display font-bold text-[20px]">Onde é?</div>

            <Input label="Cidade" value={cidade} onChange={setCidade} placeholder="Ex: São Paulo" />
            <Input label="Bairro" value={bairro} onChange={setBairro} placeholder="Ex: Pinheiros" />

            <div>
              <label className="block text-[13px] text-text-dim mb-1.5 font-semibold">
                Foto do problema (opcional, mas ajuda muito)
              </label>

              {/* miniaturas das fotos já escolhidas */}
              {fotos.length > 0 && (
                <div className="flex gap-2.5 mb-2.5">
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
                </div>
              )}

              {/* dois caminhos claros: câmera (abre direto) ou galeria */}
              {fotos.length < 3 && (
                <div className="flex gap-2.5">
                  <button
                    onClick={() => cameraRef.current?.click()}
                    className="flex-1 min-h-[52px] rounded-xl bg-surface border border-border flex items-center justify-center gap-2 text-[14px] font-semibold text-text-main active:scale-95 transition"
                  >
                    <Icon.Camera /> Tirar foto
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex-1 min-h-[52px] rounded-xl bg-surface border border-border flex items-center justify-center gap-2 text-[14px] font-semibold text-text-dim active:scale-95 transition"
                  >
                    🖼️ Galeria
                  </button>
                </div>
              )}

              {/* câmera: capture abre a câmera traseira direto no celular */}
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={addFoto} />
              {/* galeria: sem capture, deixa escolher arquivo/foto existente */}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addFoto} />
            </div>

            {/* Revisão compacta */}
            {canPublicar && (
              <div className="bg-surface border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[15px] font-bold mb-1">
                  <span>{categoria?.icone}</span> {categoria?.curto} em {bairro.trim()}
                </div>
                <div className="text-[13.5px] text-text-dim leading-relaxed">{descricao}</div>
              </div>
            )}

            <Button onClick={publicar} disabled={loading || !canPublicar}>
              {loading ? 'Postando…' : '✅ Postar agora'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
