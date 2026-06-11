// Cliente HTTP único — o papel (contratante/trabalhador) vem do usuário logado
const API_BASE = '/api';
const TOKEN_KEY = 'servicoja_token';

class ApiClient {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let msg = 'Algo deu errado. Tente de novo.';
      try {
        const j = await res.json();
        msg = j.message || msg;
        if (Array.isArray(msg)) msg = msg.join(', ');
      } catch {}
      throw new Error(msg);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  // === AUTH ===
  signup(data) { return this.request('POST', '/auth/signup', data); }
  login(data)  { return this.request('POST', '/auth/login', data); }

  // === USERS ===
  me()                { return this.request('GET', '/me'); }
  getTrabalhador(id)  { return this.request('GET', `/prestadores/${id}`); }

  // === CONTRATANTE ===
  publicarTrabalho(data)         { return this.request('POST', '/servicos', data); }
  meusTrabalhos()                { return this.request('GET', '/servicos/meus'); }
  getTrabalho(id)                { return this.request('GET', `/servicos/${id}`); }
  escolherTrabalhador(id, prestadorId) { return this.request('POST', `/servicos/${id}/aprovar`, { prestadorId }); }
  concluirTrabalho(id)           { return this.request('POST', `/servicos/${id}/concluir`); }
  cancelarTrabalho(id)           { return this.request('POST', `/servicos/${id}/cancelar`); }
  avaliarTrabalho(id, nota, comentario) { return this.request('POST', `/servicos/${id}/avaliar`, { nota, comentario }); }

  // === TRABALHADOR ===
  feed(pos) {
    let q = '';
    if (pos?.lat != null && pos?.lng != null) {
      q = `?lat=${pos.lat}&lng=${pos.lng}`;
      if (pos.raioKm) q += `&raioKm=${pos.raioKm}`;
    }
    return this.request('GET', `/feed${q}`);
  }
  curtirTrabalho(id)      { return this.request('POST', `/feed/${id}/aceitar`, {}); }
  pularTrabalho(id)       { return this.request('POST', `/feed/${id}/recusar`); }
  meusInteresses()        { return this.request('GET', '/aceites/meus'); }

  // === CONTRATANTE: buscar profissionais (marketplace reverso) ===
  profissionais(categoria) { return this.request('GET', `/profissionais${categoria ? `?categoria=${encodeURIComponent(categoria)}` : ''}`); }
  curtirProfissional(id)   { return this.request('POST', `/profissionais/${id}/curtir`); }
  pularProfissional(id)    { return this.request('POST', `/profissionais/${id}/pular`); }

  // === CONVERSAS (chat) ===
  abrirConversa(servicoId, trabalhadorId) { return this.request('POST', '/conversas', { servicoId, trabalhadorId }); }
  conversas()             { return this.request('GET', '/conversas'); }
  conversasUnread()       { return this.request('GET', '/conversas/unread-count'); }
  getConversa(id)         { return this.request('GET', `/conversas/${id}`); }
  mensagens(id, after)    { return this.request('GET', `/conversas/${id}/mensagens${after ? `?after=${encodeURIComponent(after)}` : ''}`); }
  enviarMensagem(id, texto) { return this.request('POST', `/conversas/${id}/mensagens`, { texto }); }

  // === NOTIFICAÇÕES ===
  notificacoes()          { return this.request('GET', '/notificacoes'); }
  notifUnread()           { return this.request('GET', '/notificacoes/unread-count'); }
  notifMarcarTodasLidas() { return this.request('POST', '/notificacoes/todas-lidas'); }
}

export const api = new ApiClient();

// === ADMIN (token próprio, separado do app) ===
const ADMIN_KEY = 'servicoja_admin_token';

class AdminApi {
  getToken() { return localStorage.getItem(ADMIN_KEY); }
  setToken(t) { t ? localStorage.setItem(ADMIN_KEY, t) : localStorage.removeItem(ADMIN_KEY); }

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const tk = this.getToken();
    if (tk) headers.Authorization = `Bearer ${tk}`;
    const res = await fetch(`/api/admin${path}`, {
      method, headers, body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      let msg = 'Erro';
      try { const j = await res.json(); msg = Array.isArray(j.message) ? j.message.join(', ') : (j.message || msg); } catch {}
      const err = new Error(msg); err.status = res.status; throw err;
    }
    return res.status === 204 ? null : res.json();
  }

  login(usuario, senha) { return this.request('POST', '/login', { usuario, senha }); }
  resumo()              { return this.request('GET', '/resumo'); }
  importar(body)        { return this.request('POST', '/importar', body); }
  postarExterno(body)   { return this.request('POST', '/externo', body); }
  externos()            { return this.request('GET', '/externos'); }
  remover(id)           { return this.request('DELETE', `/externos/${id}`); }
  // analytics
  analytics()           { return this.request('GET', '/analytics'); }
  // blog
  blogKeywords()        { return this.request('GET', '/blog/keywords'); }
  blogPosts()           { return this.request('GET', '/blog/posts'); }
  blogGerar(keyword, publishAt) { return this.request('POST', '/blog/gerar', { keyword, publishAt }); }
  blogAgendarLote()     { return this.request('POST', '/blog/agendar-lote'); }
  blogPublicar(id)      { return this.request('POST', `/blog/posts/${id}/publicar`); }
  blogRemover(id)       { return this.request('DELETE', `/blog/posts/${id}`); }
}

export const adminApi = new AdminApi();
