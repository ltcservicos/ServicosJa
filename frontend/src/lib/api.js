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
  feed()                  { return this.request('GET', '/feed'); }
  curtirTrabalho(id)      { return this.request('POST', `/feed/${id}/aceitar`, {}); }
  pularTrabalho(id)       { return this.request('POST', `/feed/${id}/recusar`); }
  meusInteresses()        { return this.request('GET', '/aceites/meus'); }

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
