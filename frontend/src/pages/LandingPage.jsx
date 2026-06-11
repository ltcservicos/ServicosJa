import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ============================================================
   Landing de marketing do ServiçoJá
   Autocontida: estilos em <style>, demo do app animada (JS),
   reveal no scroll (IntersectionObserver) e cartão arrastável.
   ============================================================ */

// Ícones de UI (traço) — emoji fica só dentro do "app" (conteúdo real)
const I = {
  cards: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="6" y="4" width="13" height="16" rx="2.5"/><path d="M3.5 7v11A2.5 2.5 0 006 20.5h9"/></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>,
  chat: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M21 11.5a8.4 8.4 0 01-8.5 8.4 8.5 8.5 0 01-3.8-.9L3 21l2-5.7a8.4 8.4 0 01-.9-3.8A8.5 8.5 0 0112.5 3 8.5 8.5 0 0121 11.5z"/></svg>,
  star: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z"/></svg>,
  phone: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="6.5" y="2.5" width="11" height="19" rx="2.6"/><path d="M11 18.5h2"/></svg>,
  bolt: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13z"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...p}><path d="M5 13l4 4L19 7"/></svg>,
};

const DEMO_JOBS = [
  { emoji: '🎨', titulo: 'Pintar a parede da sala', bairro: 'Pinheiros', dist: 'a 1,2 km', tempo: 'há 3 min', g: ['#D6FF3A', '#7Bb800'] },
  { emoji: '🚰', titulo: 'Vazamento na pia', bairro: 'Centro', dist: 'a 800 m', tempo: 'há 12 min', g: ['#60A5FA', '#2563EB'] },
  { emoji: '💡', titulo: 'Trocar tomada queimada', bairro: 'Vila Madalena', dist: 'a 2,4 km', tempo: 'há 25 min', g: ['#FB923C', '#EA580C'] },
];

/* ---- Telefone com a demo do app rodando sozinha (v2) ----
   Realismo: status bar, tabbar do app, mãozinha que arrasta o cartão,
   "digitando…" no chat e tilt 3D suave seguindo o mouse. */
const SWIPE_MS = 2900;
const CHAT_MS = 5200;

function PhoneDemo() {
  const [phase, setPhase] = useState(0); // 0,1,2 = swipe ; 3 = chat
  const tiltRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setPhase((p) => (p + 1) % 4), phase === 3 ? CHAT_MS : SWIPE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // tilt 3D sutil seguindo o mouse (desktop)
  useEffect(() => {
    const el = tiltRef.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1100px) rotateY(${px * 7}deg) rotateX(${-py * 5}deg)`;
      });
    };
    const onLeave = () => { cancelAnimationFrame(raf); el.style.transform = 'perspective(1100px)'; };
    const zone = el.parentElement;
    zone.addEventListener('mousemove', onMove);
    zone.addEventListener('mouseleave', onLeave);
    return () => { zone.removeEventListener('mousemove', onMove); zone.removeEventListener('mouseleave', onLeave); cancelAnimationFrame(raf); };
  }, []);

  const isChat = phase === 3;
  const job = DEMO_JOBS[phase % 3];
  const dir = phase % 2 === 0 ? 'yes' : 'no';
  const nextJob = DEMO_JOBS[(phase + 1) % 3];

  return (
    <div className="lp-tilt" ref={tiltRef} aria-hidden="true">
      <div className="lp-phone">
        <div className="lp-phone-notch" />
        <div className="lp-screen">
          {/* status bar */}
          <div className="lp-status">
            <span>9:41</span>
            <span className="lp-status-r"><i className="lp-sig" /><i className="lp-bat" /></span>
          </div>

          {/* topo do app */}
          <div className="lp-appbar">
            <div>
              <div className="lp-appbar-t">Olá, João!</div>
              <div className="lp-appbar-s">Trabalhos perto de você</div>
            </div>
            <div className="lp-appbar-dot"><span /></div>
          </div>

          {!isChat ? (
            <div className="lp-stage">
              {/* cartão de baixo (espia o próximo) */}
              <div className="lp-card lp-card-behind">
                <div className="lp-card-img" style={{ background: `linear-gradient(135deg, ${nextJob.g[0]}, ${nextJob.g[1]})` }}>
                  <span>{nextJob.emoji}</span>
                </div>
                <div className="lp-card-body">
                  <div className="lp-card-title">{nextJob.titulo}</div>
                </div>
              </div>

              {/* cartão de cima — entra, "é arrastado" pela mãozinha e sai */}
              <div key={phase} className={`lp-card lp-card-top lp-fly-${dir}`}>
                <div className={`lp-stamp lp-stamp-${dir}`}>{dir === 'yes' ? 'QUERO ❤️' : 'PASSO ✖'}</div>
                <div className="lp-card-img" style={{ background: `linear-gradient(135deg, ${job.g[0]}, ${job.g[1]})` }}>
                  <span>{job.emoji}</span>
                  <div className="lp-chip-cat">{job.emoji} {job.titulo.split(' ')[0]}</div>
                  <div className="lp-chip-loc">📍 {job.dist}</div>
                </div>
                <div className="lp-card-body">
                  <div className="lp-card-title">{job.titulo}</div>
                  <div className="lp-lines"><i style={{ width: '92%' }} /><i style={{ width: '74%' }} /></div>
                  <div className="lp-card-meta">📍 {job.bairro} · <b className="lp-dist">{job.dist} de você</b> · {job.tempo}</div>
                </div>
              </div>

              {/* mãozinha que faz o gesto */}
              <div key={`h${phase}`} className={`lp-hand lp-hand-${dir}`}>👆</div>

              {/* botões do app */}
              <div className="lp-actions">
                <div key={`n${phase}`} className={`lp-act lp-act-no ${dir === 'no' ? 'lp-act-pulse' : ''}`}>✕</div>
                <div key={`y${phase}`} className={`lp-act lp-act-yes ${dir === 'yes' ? 'lp-act-pulse' : ''}`}>♥</div>
              </div>
            </div>
          ) : (
            <div className="lp-chat" key="chat">
              <div className="lp-chat-head">
                <div className="lp-chat-av">MC</div>
                <div className="lp-chat-hd">
                  <div className="lp-chat-name">Maria Costa</div>
                  <div className="lp-chat-sub">🛠️ Pintar a parede da sala</div>
                </div>
                <div className="lp-chat-online" />
              </div>
              <div className="lp-bubbles">
                <div className="lp-bub lp-bub-in lp-typing lp-t1"><i/><i/><i/></div>
                <div className="lp-bub lp-bub-in lp-d1">Oi João! Pode vir amanhã de manhã? 😊<em>09:12</em></div>
                <div className="lp-bub lp-bub-out lp-d2">Posso sim! Chego às 9h ✅<em>09:13 ✓✓</em></div>
                <div className="lp-bub lp-bub-in lp-typing lp-t2"><i/><i/><i/></div>
                <div className="lp-bub lp-bub-in lp-d3">Combinado! Te espero 🙌<em>09:13</em></div>
              </div>
              <div className="lp-chat-bar"><span>Escreva sua mensagem…</span><div className="lp-send">➤</div></div>
            </div>
          )}

          {/* tabbar do app */}
          <div className="lp-tabbar">
            <div className={`lp-tab ${!isChat ? 'lp-tab-on' : ''}`}><i>▢</i>Trabalhos</div>
            <div className="lp-tab"><i>♡</i>Interesses</div>
            <div className={`lp-tab ${isChat ? 'lp-tab-on' : ''}`}><i>💬</i>Conversas{isChat && <b>1</b>}</div>
            <div className="lp-tab"><i>◯</i>Perfil</div>
          </div>
        </div>
        <div className="lp-screen-glare" />
      </div>
      <div className="lp-phone-glow" />
    </div>
  );
}

/* ---- Cartão arrastável de verdade (seção "experimente") ---- */
function DragCard() {
  const ref = useRef(null);
  const [i, setI] = useState(0);
  const [liked, setLiked] = useState(null);

  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    let sx = 0, dx = 0, drag = false;
    const start = (x) => { sx = x; dx = 0; drag = true; card.style.transition = 'none'; };
    const move = (x) => {
      if (!drag) return;
      dx = x - sx;
      card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
      card.style.setProperty('--yes', String(Math.max(0, Math.min(1, dx / 90))));
      card.style.setProperty('--no', String(Math.max(0, Math.min(1, -dx / 90))));
    };
    const end = () => {
      if (!drag) return; drag = false;
      card.style.transition = 'transform .4s cubic-bezier(.2,.8,.2,1), opacity .3s';
      if (Math.abs(dx) > 90) {
        const yes = dx > 0;
        card.style.transform = `translateX(${yes ? 600 : -600}px) rotate(${yes ? 28 : -28}deg)`;
        card.style.opacity = '0';
        setLiked(yes);
        setTimeout(() => {
          card.style.transition = 'none';
          card.style.transform = '';
          card.style.opacity = '1';
          card.style.setProperty('--yes', '0'); card.style.setProperty('--no', '0');
          setI((v) => (v + 1) % DEMO_JOBS.length);
          setTimeout(() => setLiked(null), 1400);
        }, 380);
      } else {
        card.style.transform = '';
        card.style.setProperty('--yes', '0'); card.style.setProperty('--no', '0');
      }
    };
    const md = (e) => start(e.clientX);
    const mm = (e) => move(e.clientX);
    const mu = () => end();
    const ts = (e) => start(e.touches[0].clientX);
    const tm = (e) => move(e.touches[0].clientX);
    const te = () => end();
    card.addEventListener('mousedown', md);
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    card.addEventListener('touchstart', ts, { passive: true });
    window.addEventListener('touchmove', tm, { passive: true });
    window.addEventListener('touchend', te);
    return () => {
      card.removeEventListener('mousedown', md);
      window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu);
      card.removeEventListener('touchstart', ts); window.removeEventListener('touchmove', tm); window.removeEventListener('touchend', te);
    };
  }, []);

  const job = DEMO_JOBS[i];
  return (
    <div className="lp-drag-wrap">
      <div className="lp-drag-card" ref={ref}>
        <div className="lp-drag-yes">❤ QUERO</div>
        <div className="lp-drag-no">✖ PASSO</div>
        <div className="lp-card-img lp-drag-img" style={{ background: `linear-gradient(135deg, ${job.g[0]}, ${job.g[1]})` }}>
          <span>{job.emoji}</span>
          <div className="lp-chip-loc">📍 {job.dist}</div>
        </div>
        <div className="lp-card-body">
          <div className="lp-card-title">{job.titulo}</div>
          <div className="lp-card-meta">📍 {job.bairro} · <b className="lp-dist">{job.dist} de você</b></div>
        </div>
      </div>
      <div className="lp-drag-hint">{liked === true ? '❤️ Interesse enviado!' : liked === false ? 'Tudo bem, próximo!' : '⟵ arraste para os lados ⟶'}</div>
    </div>
  );
}

export function LandingPage() {
  // reveal no scroll
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('lp-in')),
      { threshold: 0.16 },
    );
    document.querySelectorAll('.lp-reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* NAV */}
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-in">
          <div className="lp-logo">Serviço<span>Já.</span></div>
          <nav className="lp-nav-links">
            <a href="#como">Como funciona</a>
            <a href="#recursos">Recursos</a>
            <a href="#pro">Para profissionais</a>
          </nav>
          <div className="lp-nav-cta">
            <Link to="/entrar" className="lp-btn lp-btn-ghost">Entrar</Link>
            <Link to="/cadastro?papel=contratante" className="lp-btn lp-btn-sm">Criar conta</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-blob lp-blob-1" />
        <div className="lp-blob lp-blob-2" />
        <div className="lp-wrap lp-hero-grid">
          <div className="lp-hero-text">
            <div className="lp-eyebrow"><span className="lp-dot" /> 100% grátis · sem burocracia</div>
            <h1 className="lp-h1">Quem precisa<br/>encontra <span className="lp-hl">quem faz.</span></h1>
            <p className="lp-sub">
              Pintor, encanador, eletricista, diarista e muito mais — pertinho de você.
              Deslize, demonstre interesse e combine tudo pelo chat. Simples como deve ser.
            </p>
            <div className="lp-hero-cta">
              <Link to="/cadastro?papel=contratante" className="lp-btn lp-btn-lime">🏠 Quero contratar</Link>
              <Link to="/cadastro?papel=trabalhador" className="lp-btn lp-btn-blue">🛠️ Quero trabalhar</Link>
            </div>
            <div className="lp-trust">
              <div className="lp-stars">★★★★★</div>
              <span>Profissionais avaliados · contato direto · perto de você</span>
            </div>
          </div>
          <div className="lp-hero-phone">
            <PhoneDemo />
            <div className="lp-float lp-float-1">🎨 Pintura</div>
            <div className="lp-float lp-float-2">💬 Chat direto</div>
            <div className="lp-float lp-float-3">📍 No seu bairro</div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="lp-strip">
        <div className="lp-wrap lp-strip-in">
          {['100% grátis', 'Chat no app', 'Avaliações reais', 'Login pelo WhatsApp', 'Instala no celular'].map((t) => (
            <div key={t} className="lp-strip-item"><I.check width="16" height="16" /> {t}</div>
          ))}
        </div>
      </div>

      {/* COMO FUNCIONA */}
      <section id="como" className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head lp-reveal">
            <span className="lp-kicker">Como funciona</span>
            <h2 className="lp-h2">Do problema ao combinado em 3 passos</h2>
          </div>
          <div className="lp-cols">
            <div className="lp-col lp-reveal">
              <div className="lp-col-tag lp-tag-lime">Para quem contrata</div>
              <Step n="1" t="Conte o que precisa" d="Tire uma foto, escolha a categoria e o bairro. Leva menos de 1 minuto." />
              <Step n="2" t="Veja os interessados" d="Profissionais da sua região levantam a mão. Você vê nota, trabalhos feitos e distância." />
              <Step n="3" t="Converse e feche" d="Chame quem você gostou no chat, combine o preço e pronto." />
            </div>
            <div className="lp-col lp-reveal">
              <div className="lp-col-tag lp-tag-blue">Para quem trabalha</div>
              <Step n="1" t="Escolha seu ramo" d="Você só vê trabalhos do seu segmento e perto de você." blue />
              <Step n="2" t="Deslize e curta" d="Gostou do trabalho? Toque no coração. O cliente é avisado na hora." blue />
              <Step n="3" t="Receba no chat" d="Quando o cliente te escolhe, vocês combinam tudo direto pelo app." blue />
            </div>
          </div>
        </div>
      </section>

      {/* DEMO ARRASTÁVEL */}
      <section className="lp-section lp-demo-sec">
        <div className="lp-wrap lp-demo-grid">
          <div className="lp-reveal">
            <span className="lp-kicker">Experimente agora</span>
            <h2 className="lp-h2">Escolher é tão fácil<br/>quanto deslizar.</h2>
            <p className="lp-sub lp-sub2">
              A mesma sensação de um app de relacionamento, mas para resolver a sua casa.
              Arraste o cartão para o lado — vai, pode brincar. 👉
            </p>
            <Link to="/cadastro?papel=contratante" className="lp-btn lp-btn-lime lp-mt">Começar de graça</Link>
          </div>
          <div className="lp-reveal lp-demo-right">
            <DragCard />
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head lp-reveal">
            <span className="lp-kicker">Recursos</span>
            <h2 className="lp-h2">Tudo que você precisa, nada que atrapalha</h2>
          </div>
          <div className="lp-feats">
            <Feat icon={<I.cards/>} t="Matching por deslize" d="Estilo Tinder: deslize trabalhos ou profissionais e curta os que gostar." />
            <Feat icon={<I.pin/>} t="Perto de você + mapa" d="Filtre por raio de km e veja os trabalhos num mapa dinâmico do seu bairro." accent="blue" />
            <Feat icon={<I.chat/>} t="Chat igual WhatsApp" d="Converse dentro do app, com balões, hora e confirmação de leitura." />
            <Feat icon={<I.star/>} t="Avaliações reais" d="Os dois lados se avaliam. Confiança de quem já fez, não de promessa." accent="blue" />
            <Feat icon={<I.bolt/>} t="Login pelo WhatsApp" d="Sem e-mail, sem senha complicada. Entra com o número e pronto." />
            <Feat icon={<I.phone/>} t="Instala no celular" d="Adicione à tela inicial e use como um aplicativo de verdade." accent="blue" />
          </div>
        </div>
      </section>

      {/* BANNER PROFISSIONAIS */}
      <section id="pro" className="lp-section">
        <div className="lp-wrap">
          <div className="lp-pro lp-reveal">
            <div className="lp-pro-blob" />
            <div className="lp-pro-text">
              <span className="lp-kicker lp-kicker-blue">Você é profissional?</span>
              <h2 className="lp-h2 lp-h2-w">Receba trabalhos do<br/>seu bairro, sem prospecção.</h2>
              <p className="lp-sub">Nada de ligação fria. Os pedidos chegam até você — é só deslizar e curtir.</p>
              <Link to="/cadastro?papel=trabalhador" className="lp-btn lp-btn-blue lp-mt">🛠️ Quero trabalhar</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="lp-section lp-cta-sec">
        <div className="lp-wrap lp-cta lp-reveal">
          <h2 className="lp-h2 lp-cta-h">Pronto pra começar?</h2>
          <p className="lp-sub lp-cta-sub">Crie sua conta grátis em menos de 1 minuto.</p>
          <div className="lp-hero-cta lp-center">
            <Link to="/cadastro?papel=contratante" className="lp-btn lp-btn-lime">🏠 Quero contratar</Link>
            <Link to="/cadastro?papel=trabalhador" className="lp-btn lp-btn-blue">🛠️ Quero trabalhar</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-foot">
        <div className="lp-wrap lp-foot-in">
          <div className="lp-logo">Serviço<span>Já.</span></div>
          <div className="lp-foot-links">
            <Link to="/entrar">Entrar</Link>
            <a href="#como">Como funciona</a>
            <a href="#recursos">Recursos</a>
          </div>
          <div className="lp-foot-copy">Feito no Brasil 🇧🇷 · ServiçoJá</div>
        </div>
      </footer>
    </div>
  );
}

function Step({ n, t, d, blue }) {
  return (
    <div className="lp-step">
      <div className={`lp-step-n ${blue ? 'lp-step-blue' : ''}`}>{n}</div>
      <div>
        <div className="lp-step-t">{t}</div>
        <div className="lp-step-d">{d}</div>
      </div>
    </div>
  );
}

function Feat({ icon, t, d, accent }) {
  return (
    <div className="lp-feat lp-reveal">
      <div className={`lp-feat-ic ${accent === 'blue' ? 'lp-ic-blue' : 'lp-ic-lime'}`}>{icon}</div>
      <div className="lp-feat-t">{t}</div>
      <div className="lp-feat-d">{d}</div>
    </div>
  );
}

/* =========================== CSS =========================== */
const CSS = `
/* libera o scroll: o app trava html/body/#root na altura da tela; a landing cresce */
html:has(.lp), body:has(.lp) { height:auto; }
body:has(.lp) #root { height:auto; min-height:100dvh; }
.lp { --bg:#0E0E10; --soft:#16161A; --surf:#1E1E24; --surf2:#2A2A33; --bd:#2E2E38;
  --tx:#F4F4F6; --dim:#9C9CA8; --mut:#6B6B78; --lime:#D6FF3A; --blue:#60A5FA;
  background:var(--bg); color:var(--tx); font-family:'DM Sans',system-ui,sans-serif;
  overflow-x:hidden; }
.lp * { box-sizing:border-box; }
.lp a { text-decoration:none; color:inherit; }
.lp-wrap { width:100%; max-width:1140px; margin:0 auto; padding:0 22px; }
.lp h1,.lp h2 { font-family:'Bricolage Grotesque',sans-serif; letter-spacing:-.02em; margin:0; }

/* NAV */
.lp-nav { position:sticky; top:0; z-index:50; background:rgba(14,14,16,.72); backdrop-filter:blur(14px); border-bottom:1px solid var(--bd); }
.lp-nav-in { display:flex; align-items:center; justify-content:space-between; height:66px; }
.lp-logo { font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:22px; }
.lp-logo span { color:var(--lime); }
.lp-nav-links { display:flex; gap:28px; font-size:14.5px; color:var(--dim); font-weight:500; }
.lp-nav-links a:hover { color:var(--tx); }
.lp-nav-cta { display:flex; gap:10px; align-items:center; }
@media (max-width:780px){ .lp-nav-links{ display:none; } }

/* BOTÕES */
.lp-btn { display:inline-flex; align-items:center; gap:8px; font-weight:700; border-radius:14px;
  padding:13px 20px; font-size:15px; transition:transform .15s, box-shadow .2s, background .2s; cursor:pointer; border:0; }
.lp-btn:active { transform:scale(.97); }
/* .lp .x para vencer a especificidade de ".lp a { color:inherit }" */
.lp .lp-btn-lime { background:var(--lime); color:#0E0E10; box-shadow:0 8px 30px rgba(214,255,58,.25); }
.lp .lp-btn-lime:hover { box-shadow:0 12px 40px rgba(214,255,58,.4); transform:translateY(-2px); }
.lp .lp-btn-blue { background:var(--blue); color:#06122b; box-shadow:0 8px 30px rgba(96,165,250,.22); }
.lp .lp-btn-blue:hover { box-shadow:0 12px 40px rgba(96,165,250,.38); transform:translateY(-2px); }
.lp .lp-btn-ghost { background:transparent; color:var(--tx); border:1px solid var(--bd); }
.lp .lp-btn-ghost:hover { background:var(--surf); }
.lp .lp-btn-sm { background:var(--lime); color:#0E0E10; padding:10px 16px; font-size:14px; border-radius:12px; }
.lp-mt { margin-top:24px; }

/* HERO */
.lp-hero { position:relative; padding:64px 0 40px; }
.lp-hero-grid { display:grid; grid-template-columns:1.05fr .95fr; gap:40px; align-items:center; }
.lp-eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:var(--dim);
  background:var(--surf); border:1px solid var(--bd); padding:7px 13px; border-radius:999px; }
.lp-dot { width:8px; height:8px; border-radius:50%; background:var(--lime); box-shadow:0 0 12px var(--lime); animation:lp-pulse 2s infinite; }
@keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
.lp-h1 { font-size:clamp(40px,6vw,66px); font-weight:800; line-height:1.02; margin:18px 0 0; }
.lp-hl { color:var(--lime); position:relative; }
.lp-sub { color:var(--dim); font-size:17px; line-height:1.6; margin:18px 0 0; max-width:480px; }
.lp-hero-cta { display:flex; gap:12px; margin-top:28px; flex-wrap:wrap; }
.lp-center { justify-content:center; }
.lp-trust { display:flex; align-items:center; gap:10px; margin-top:24px; font-size:13.5px; color:var(--mut); }
.lp-stars { color:var(--lime); letter-spacing:2px; font-size:15px; }

/* blobs */
.lp-blob { position:absolute; border-radius:50%; filter:blur(80px); opacity:.5; z-index:0; pointer-events:none; }
.lp-blob-1 { width:420px; height:420px; background:var(--lime); top:-120px; right:-80px; opacity:.16; animation:lp-drift 16s ease-in-out infinite; }
.lp-blob-2 { width:360px; height:360px; background:var(--blue); bottom:-160px; left:-100px; opacity:.14; animation:lp-drift 20s ease-in-out infinite reverse; }
@keyframes lp-drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,40px)} }
.lp-hero-text,.lp-hero-phone { position:relative; z-index:1; }

/* PHONE v2 */
.lp-hero-phone { display:flex; justify-content:center; position:relative; }
.lp-tilt { position:relative; transition:transform .25s ease-out; will-change:transform; }
.lp-phone { position:relative; width:294px; height:600px; background:linear-gradient(160deg,#17171c,#0b0b0e); border-radius:44px;
  border:1px solid #2c2c36; box-shadow:0 50px 100px rgba(0,0,0,.65), 0 0 0 2px #07070a, inset 0 1px 0 rgba(255,255,255,.06); padding:10px; z-index:2; }
.lp-phone-glow { position:absolute; left:50%; bottom:-26px; transform:translateX(-50%); width:78%; height:60px;
  background:radial-gradient(ellipse at center, rgba(214,255,58,.32), rgba(96,165,250,.12) 55%, transparent 75%);
  filter:blur(26px); z-index:1; pointer-events:none; animation:lp-glow 5s ease-in-out infinite; }
@keyframes lp-glow { 0%,100%{opacity:.8} 50%{opacity:.45} }
.lp-phone-notch { position:absolute; top:18px; left:50%; transform:translateX(-50%); width:92px; height:23px; background:#07070a; border-radius:13px; z-index:6; }
.lp-screen { width:100%; height:100%; background:var(--soft); border-radius:36px; overflow:hidden; position:relative; display:flex; flex-direction:column; }
.lp-screen-glare { position:absolute; inset:10px; border-radius:36px; pointer-events:none; z-index:7;
  background:linear-gradient(115deg, rgba(255,255,255,.06) 0%, transparent 28%); }

/* status bar */
.lp-status { display:flex; justify-content:space-between; align-items:center; padding:14px 24px 0; font-size:12px; font-weight:700; flex-shrink:0; }
.lp-status-r { display:flex; gap:5px; align-items:center; }
.lp-sig { width:15px; height:9px; display:inline-block;
  background:linear-gradient(to right,#F4F4F6 0 2.5px,transparent 2.5px 4px,#F4F4F6 4px 6.5px,transparent 6.5px 8px,#F4F4F6 8px 10.5px,transparent 10.5px 12px,#9C9CA8 12px 14.5px);
  clip-path:polygon(0 60%,100% 0,100% 100%,0 100%); }
.lp-bat { width:20px; height:10px; border:1.5px solid #9C9CA8; border-radius:3px; display:inline-block; position:relative; }
.lp-bat::after { content:''; position:absolute; inset:1.5px; right:5px; background:var(--lime); border-radius:1px; }

/* appbar */
.lp-appbar { padding:10px 18px 10px; display:flex; justify-content:space-between; align-items:flex-end; flex-shrink:0; }
.lp-appbar-t { font-family:'Bricolage Grotesque'; font-weight:800; font-size:18px; }
.lp-appbar-s { color:var(--mut); font-size:11.5px; margin-top:2px; }
.lp-appbar-dot { width:34px; height:34px; border-radius:11px; background:var(--surf); border:1px solid var(--bd); position:relative; }
.lp-appbar-dot span { position:absolute; top:7px; right:7px; width:7px; height:7px; border-radius:50%; background:#F87171; }

/* swipe stage */
.lp-stage { flex:1; position:relative; padding:4px 16px 12px; }
.lp-card { position:absolute; left:16px; right:16px; top:4px; bottom:72px; background:var(--surf); border:1px solid var(--bd);
  border-radius:22px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 18px 40px rgba(0,0,0,.35); }
.lp-card-behind { transform:scale(.93) translateY(-10px); opacity:.55; filter:saturate(.7); }
.lp-card-top { z-index:2; }
.lp-card-img { height:56%; display:flex; align-items:center; justify-content:center; font-size:62px; position:relative; }
.lp-card-img::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,.12), transparent 35%, transparent 55%, rgba(20,20,26,.9)); }
.lp-card-img span { filter:drop-shadow(0 8px 18px rgba(0,0,0,.4)); position:relative; }
.lp-chip-cat { position:absolute; top:10px; left:10px; background:rgba(0,0,0,.55); backdrop-filter:blur(6px);
  font-size:10.5px; font-weight:700; padding:5px 9px; border-radius:8px; color:#fff; z-index:1; }
.lp-chip-loc { position:absolute; top:10px; right:10px; background:rgba(0,0,0,.55); backdrop-filter:blur(6px);
  font-size:10.5px; padding:5px 9px; border-radius:8px; color:#fff; z-index:1; }
.lp-card-body { padding:12px 15px; flex:1; display:flex; flex-direction:column; }
.lp-card-title { font-family:'Bricolage Grotesque'; font-weight:700; font-size:16.5px; line-height:1.15; }
.lp-lines { margin-top:8px; display:flex; flex-direction:column; gap:5px; }
.lp-lines i { display:block; height:7px; border-radius:4px; background:var(--surf2); }
.lp-card-meta { color:var(--mut); font-size:11px; margin-top:auto; padding-top:8px; border-top:1px solid var(--bd); }
.lp-dist { color:#34D399; font-weight:700; font-style:normal; }
.lp-stamp { position:absolute; top:22px; padding:6px 12px; border-radius:9px; font-family:'Bricolage Grotesque';
  font-weight:800; font-size:17px; z-index:4; opacity:0; background:rgba(10,10,12,.45); backdrop-filter:blur(3px); }
.lp-stamp-yes { right:14px; transform:rotate(12deg); color:#34D399; border:3px solid #34D399; }
.lp-stamp-no { left:14px; transform:rotate(-12deg); color:#F87171; border:3px solid #F87171; }

/* coreografia: entra → mãozinha arrasta → sai (2.9s no total) */
.lp-fly-yes { animation:lp-card-yes ${SWIPE_MS}ms cubic-bezier(.3,.7,.3,1) forwards; }
.lp-fly-no { animation:lp-card-no ${SWIPE_MS}ms cubic-bezier(.3,.7,.3,1) forwards; }
@keyframes lp-card-yes {
  0% { transform:scale(.93) translateY(10px); opacity:.55; }
  10%,46% { transform:none; opacity:1; }
  62% { transform:translateX(34px) rotate(2.5deg); }
  74% { transform:translateX(110px) rotate(8deg); }
  100% { transform:translateX(420px) rotate(26deg) translateY(-30px); opacity:0; }
}
@keyframes lp-card-no {
  0% { transform:scale(.93) translateY(10px); opacity:.55; }
  10%,46% { transform:none; opacity:1; }
  62% { transform:translateX(-34px) rotate(-2.5deg); }
  74% { transform:translateX(-110px) rotate(-8deg); }
  100% { transform:translateX(-420px) rotate(-26deg) translateY(-30px); opacity:0; }
}
.lp-fly-yes .lp-stamp-yes, .lp-fly-no .lp-stamp-no { animation:lp-stamp ${SWIPE_MS}ms ease forwards; }
@keyframes lp-stamp { 0%,52%{opacity:0; transform:scale(1.3) rotate(12deg)} 64%,88%{opacity:1; transform:scale(1) rotate(12deg)} 100%{opacity:1} }

/* mãozinha do gesto */
.lp-hand { position:absolute; bottom:38%; left:50%; font-size:38px; z-index:5; pointer-events:none; opacity:0;
  filter:drop-shadow(0 6px 12px rgba(0,0,0,.5)); }
.lp-hand-yes { animation:lp-hand-yes ${SWIPE_MS}ms cubic-bezier(.3,.7,.3,1) forwards; }
.lp-hand-no { animation:lp-hand-no ${SWIPE_MS}ms cubic-bezier(.3,.7,.3,1) forwards; }
@keyframes lp-hand-yes {
  0%,34% { opacity:0; transform:translate(-50%,16px) scale(1.15); }
  44% { opacity:1; transform:translate(-50%,0) scale(1); }
  62% { opacity:1; transform:translate(calc(-50% + 38px),-6px) scale(.95); }
  78% { opacity:0; transform:translate(calc(-50% + 120px),-14px) scale(.9); }
  100% { opacity:0; }
}
@keyframes lp-hand-no {
  0%,34% { opacity:0; transform:translate(-50%,16px) scale(1.15); }
  44% { opacity:1; transform:translate(-50%,0) scale(1); }
  62% { opacity:1; transform:translate(calc(-50% - 38px),-6px) scale(.95); }
  78% { opacity:0; transform:translate(calc(-50% - 120px),-14px) scale(.9); }
  100% { opacity:0; }
}

/* botões do app */
.lp-actions { position:absolute; bottom:14px; left:0; right:0; display:flex; justify-content:center; gap:26px; z-index:3; }
.lp-act { width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:19px; font-weight:700;
  background:var(--surf); border:2px solid var(--bd); }
.lp-act-no { color:#F87171; border-color:#F8717155; }
.lp-act-yes { color:#0E0E10; background:#34D399; border-color:#34D399; box-shadow:0 6px 18px rgba(52,211,153,.3); }
.lp-act-pulse { animation:lp-press ${SWIPE_MS}ms ease forwards; }
@keyframes lp-press { 0%,60%{transform:none} 70%{transform:scale(1.25); box-shadow:0 0 0 10px rgba(52,211,153,.18)} 82%,100%{transform:none} }

/* tabbar do app */
.lp-tabbar { flex-shrink:0; display:flex; justify-content:space-around; padding:8px 8px 18px; border-top:1px solid var(--bd); background:rgba(12,12,15,.7); }
.lp-tab { display:flex; flex-direction:column; align-items:center; gap:3px; font-size:9.5px; font-weight:700; color:var(--mut); position:relative; }
.lp-tab i { font-style:normal; font-size:15px; line-height:1; }
.lp-tab-on { color:var(--lime); }
.lp-tab b { position:absolute; top:-3px; right:-7px; background:#F87171; color:#fff; font-size:8px; width:13px; height:13px;
  border-radius:50%; display:flex; align-items:center; justify-content:center; }

/* chat */
.lp-chat { flex:1; display:flex; flex-direction:column; animation:lp-fade .4s ease; min-height:0; }
.lp-chat-head { display:flex; gap:10px; align-items:center; padding:6px 16px 11px; border-bottom:1px solid var(--bd); }
.lp-chat-av { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,var(--surf2),#3a3a46); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; }
.lp-chat-hd { flex:1; }
.lp-chat-name { font-weight:700; font-size:14.5px; }
.lp-chat-sub { color:var(--mut); font-size:11px; }
.lp-chat-online { width:9px; height:9px; border-radius:50%; background:#34D399; box-shadow:0 0 8px #34D399; }
.lp-bubbles { flex:1; padding:14px 16px; display:flex; flex-direction:column; gap:8px; overflow:hidden; }
.lp-bub { max-width:80%; padding:8px 11px; font-size:12.5px; line-height:1.35; opacity:0; position:relative; }
.lp-bub em { font-style:normal; font-size:9px; opacity:.65; margin-left:7px; }
.lp-bub-in { align-self:flex-start; background:var(--surf2); border-radius:15px 15px 15px 4px; }
.lp-bub-out { align-self:flex-end; background:#0c7c59; color:#fff; border-radius:15px 15px 4px 15px; }
/* digitando… aparece e some antes da mensagem */
.lp-typing { display:flex; gap:4px; align-items:center; padding:11px 13px; }
.lp-typing i { width:6px; height:6px; border-radius:50%; background:var(--mut); animation:lp-dot 1s infinite; }
.lp-typing i:nth-child(2){ animation-delay:.15s } .lp-typing i:nth-child(3){ animation-delay:.3s }
@keyframes lp-dot { 0%,100%{opacity:.3; transform:translateY(0)} 50%{opacity:1; transform:translateY(-3px)} }
.lp-t1 { animation:lp-show .2s ease .3s forwards, lp-hide .2s ease 1.15s forwards; }
.lp-d1 { animation:lp-pop .35s cubic-bezier(.2,.8,.2,1) 1.35s forwards; }
.lp-d2 { animation:lp-pop .35s cubic-bezier(.2,.8,.2,1) 2.45s forwards; }
.lp-t2 { animation:lp-show .2s ease 3.1s forwards, lp-hide .2s ease 3.85s forwards; }
.lp-d3 { animation:lp-pop .35s cubic-bezier(.2,.8,.2,1) 4.05s forwards; }
@keyframes lp-show { to{opacity:1} }
@keyframes lp-hide { to{opacity:0; height:0; padding:0; margin:-4px 0 0} }
@keyframes lp-pop { from{opacity:0; transform:translateY(10px) scale(.95)} to{opacity:1; transform:none} }
@keyframes lp-fade { from{opacity:0} to{opacity:1} }
.lp-chat-bar { margin:0 14px 12px; padding:10px 14px; background:var(--surf); border:1px solid var(--bd); border-radius:14px;
  display:flex; align-items:center; justify-content:space-between; color:var(--mut); font-size:12.5px; flex-shrink:0; }
.lp-send { width:30px; height:30px; border-radius:50%; background:var(--lime); color:#0E0E10; display:flex; align-items:center; justify-content:center; font-size:13px; }

/* floats */
.lp-float { position:absolute; background:var(--surf); border:1px solid var(--bd); border-radius:12px; padding:9px 13px;
  font-size:13px; font-weight:600; box-shadow:0 10px 30px rgba(0,0,0,.4); white-space:nowrap; }
.lp-float-1 { top:54px; left:-18px; animation:lp-bob 4s ease-in-out infinite; }
.lp-float-2 { top:250px; right:-30px; animation:lp-bob 5s ease-in-out infinite .5s; }
.lp-float-3 { bottom:70px; left:-26px; animation:lp-bob 4.5s ease-in-out infinite 1s; }
@keyframes lp-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
@media (max-width:920px){
  .lp-hero-grid{ grid-template-columns:1fr; }
  .lp-hero-phone{ margin-top:22px; }
  .lp-float-1,.lp-float-3{ left:8px; } .lp-float-2{ right:8px; }
}

/* STRIP */
.lp-strip { border-top:1px solid var(--bd); border-bottom:1px solid var(--bd); background:var(--soft); }
.lp-strip-in { display:flex; flex-wrap:wrap; gap:10px 30px; justify-content:center; padding:18px 22px; }
.lp-strip-item { display:flex; align-items:center; gap:7px; font-size:13.5px; font-weight:600; color:var(--dim); }
.lp-strip-item svg { color:var(--lime); }

/* SECTIONS */
.lp-section { padding:76px 0; position:relative; }
.lp-head { text-align:center; max-width:640px; margin:0 auto 46px; }
.lp-kicker { font-size:13px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--lime); }
.lp-kicker-blue { color:var(--blue); }
.lp-h2 { font-size:clamp(28px,4vw,42px); font-weight:800; line-height:1.08; margin-top:12px; }
.lp-h2-w { color:#fff; }

/* COLS / STEPS */
.lp-cols { display:grid; grid-template-columns:1fr 1fr; gap:22px; }
@media (max-width:820px){ .lp-cols{ grid-template-columns:1fr; } }
.lp-col { background:var(--soft); border:1px solid var(--bd); border-radius:24px; padding:28px; }
.lp-col-tag { display:inline-block; font-size:12.5px; font-weight:700; padding:6px 12px; border-radius:999px; margin-bottom:18px; }
.lp-tag-lime { background:rgba(214,255,58,.14); color:var(--lime); }
.lp-tag-blue { background:rgba(96,165,250,.16); color:var(--blue); }
.lp-step { display:flex; gap:14px; padding:14px 0; border-top:1px solid var(--bd); }
.lp-step:first-of-type { border-top:0; }
.lp-step-n { flex-shrink:0; width:34px; height:34px; border-radius:11px; background:var(--lime); color:#0E0E10;
  font-family:'Bricolage Grotesque'; font-weight:800; display:flex; align-items:center; justify-content:center; }
.lp-step-blue { background:var(--blue); color:#06122b; }
.lp-step-t { font-weight:700; font-size:16px; }
.lp-step-d { color:var(--dim); font-size:14px; line-height:1.5; margin-top:4px; }

/* DEMO SEC */
.lp-demo-sec { background:linear-gradient(180deg, transparent, rgba(96,165,250,.04), transparent); }
.lp-demo-grid { display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center; }
@media (max-width:820px){ .lp-demo-grid{ grid-template-columns:1fr; } .lp-demo-right{ order:-1; } }
.lp-sub2 { margin-top:14px; }
.lp-demo-right { display:flex; justify-content:center; }
.lp-drag-wrap { width:300px; max-width:88vw; }
.lp-drag-card { position:relative; background:var(--surf); border:1px solid var(--bd); border-radius:24px; overflow:hidden;
  cursor:grab; user-select:none; touch-action:pan-y; box-shadow:0 30px 70px rgba(0,0,0,.45); }
.lp-drag-card:active { cursor:grabbing; }
.lp-drag-img { height:210px; font-size:80px; }
.lp-drag-img span { margin-top:55px; }
.lp-drag-yes,.lp-drag-no { position:absolute; top:20px; font-family:'Bricolage Grotesque'; font-weight:800; font-size:22px; padding:6px 14px; border-radius:10px; z-index:3; }
.lp-drag-yes { right:18px; color:#34D399; border:3px solid #34D399; transform:rotate(12deg); opacity:var(--yes,0); }
.lp-drag-no { left:18px; color:#F87171; border:3px solid #F87171; transform:rotate(-12deg); opacity:var(--no,0); }
.lp-drag-hint { text-align:center; color:var(--mut); font-size:13.5px; font-weight:600; margin-top:18px; height:18px; }

/* FEATS */
.lp-feats { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
@media (max-width:860px){ .lp-feats{ grid-template-columns:1fr 1fr; } }
@media (max-width:560px){ .lp-feats{ grid-template-columns:1fr; } }
.lp-feat { background:var(--soft); border:1px solid var(--bd); border-radius:20px; padding:26px 22px; transition:transform .25s, border-color .25s; }
.lp-feat:hover { transform:translateY(-5px); border-color:var(--mut); }
.lp-feat-ic { width:46px; height:46px; border-radius:13px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
.lp-feat-ic svg { width:24px; height:24px; }
.lp-ic-lime { background:rgba(214,255,58,.14); color:var(--lime); }
.lp-ic-blue { background:rgba(96,165,250,.16); color:var(--blue); }
.lp-feat-t { font-family:'Bricolage Grotesque'; font-weight:700; font-size:18px; }
.lp-feat-d { color:var(--dim); font-size:14px; line-height:1.55; margin-top:8px; }

/* PRO BANNER */
.lp-pro { position:relative; background:linear-gradient(135deg, #11213b, #0f1729); border:1px solid #1e3a5f;
  border-radius:30px; padding:54px 48px; overflow:hidden; }
.lp-pro-blob { position:absolute; width:340px; height:340px; border-radius:50%; background:var(--blue); filter:blur(90px); opacity:.22; top:-100px; right:-60px; }
.lp-pro-text { position:relative; max-width:540px; }

/* CTA */
.lp-cta-sec { text-align:center; }
.lp-cta { background:var(--soft); border:1px solid var(--bd); border-radius:30px; padding:60px 30px;
  background-image:radial-gradient(600px 300px at 50% -20%, rgba(214,255,58,.1), transparent); }
.lp-cta-h { font-size:clamp(30px,5vw,48px); }
.lp-cta-sub { margin:14px auto 0; }

/* FOOTER */
.lp-foot { border-top:1px solid var(--bd); padding:36px 0; }
.lp-foot-in { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.lp-foot-links { display:flex; gap:22px; color:var(--dim); font-size:14px; }
.lp-foot-links a:hover { color:var(--tx); }
.lp-foot-copy { color:var(--mut); font-size:13px; }

/* REVEAL */
.lp-reveal { opacity:0; transform:translateY(26px); transition:opacity .6s ease, transform .6s cubic-bezier(.2,.8,.2,1); }
.lp-reveal.lp-in { opacity:1; transform:none; }
@media (prefers-reduced-motion:reduce){ .lp-reveal{ opacity:1; transform:none; } }
`;
