(() => {
  'use strict';

  const config = window.XANO_CONFIG;
  const tokenKey = 'nossabiblioteca.librarian-token';
  let token = sessionStorage.getItem(tokenKey) || '';

  class XanoError extends Error {
    constructor(message, { status = 0, code = 'NETWORK_ERROR', route = '' } = {}) {
      super(message);
      this.name = 'XanoError';
      this.status = status;
      this.code = code;
      this.route = route;
    }
  }

  function normalizeError(payload, response, route) {
    const body = payload?.payload ?? payload;
    const error = body?.error;
    const message = typeof body === 'string'
      ? body
      : error?.message ?? body?.message ?? `Falha ao comunicar com o Xano (${response.status}).`;
    const code = error?.code ?? body?.code ?? payload?.statement ?? 'HTTP_ERROR';
    return new XanoError(message, { status: response.status, code, route });
  }

  async function request(group, path, { method = 'GET', query, body, auth = false } = {}) {
    if (!config?.[group]) throw new XanoError(`URL do grupo Xano "${group}" não configurada.`);
    const url = new URL(`${config[group].replace(/\/$/, '')}/${path.replace(/^\//, '')}`);
    for (const [key, value] of Object.entries(query || {})) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const headers = { accept: 'application/json' };
    if (body !== undefined) headers['content-type'] = 'application/json';
    if (auth && token) headers.authorization = `Bearer ${token}`;

    let response;
    try {
      response = await fetch(url, {
        method,
        headers,
        signal: controller.signal,
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
      });
    } catch (error) {
      const message = error.name === 'AbortError'
        ? 'A solicitação ao Xano expirou.'
        : 'Não foi possível conectar ao Xano. Verifique a conexão e o CORS.';
      throw new XanoError(message, { code: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR', route: `${method} ${url.pathname}` });
    } finally {
      clearTimeout(timeout);
    }

    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; }
    catch { throw new XanoError('O Xano retornou uma resposta que não é JSON.', { status: response.status, code: 'INVALID_JSON', route: url.pathname }); }

    if (payload?.statement === 'Throw Error' || !response.ok) {
      const error = normalizeError(payload, response, url.pathname);
      if (response.status === 401 && auth) clearToken();
      throw error;
    }
    if (payload?.error) {
      throw new XanoError(payload.error.message || 'O Xano recusou a solicitação.', {
        status: response.status,
        code: payload.error.code || 'XANO_ERROR',
        route: url.pathname
      });
    }
    return payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
  }

  function setToken(value) {
    token = value || '';
    if (token) sessionStorage.setItem(tokenKey, token);
    else sessionStorage.removeItem(tokenKey);
  }

  function clearToken() { setToken(''); }

  window.XanoClient = Object.freeze({
    XanoError,
    get hasSession() { return Boolean(token); },
    clearToken,
    login: async (email, password) => {
      const result = await request('auth', '/auth/bibliotecarios/login', {
        method: 'POST', body: { email, senha: password }
      });
      const authToken = result?.authToken ?? result?.token;
      if (!authToken) throw new XanoError('O login não retornou um token de bibliotecário.', { code: 'INVALID_AUTH_RESPONSE' });
      setToken(authToken);
      return result.user ?? result.bibliotecario ?? null;
    },
    me: () => request('auth', '/auth/bibliotecarios/me', { auth: true }),
    catalog: (query = {}) => request('catalog', '/livros', { query }),
    categories: () => request('admin', '/categorias', { auth: true }),
    authors: (query = {}) => request('admin', '/autores', { query, auth: true }),
    readers: (query = {}) => request('admin', '/leitores', { query, auth: true }),
    copies: (query = {}) => request('admin', '/exemplares', { query, auth: true }),
    loans: (query = {}) => request('admin', '/emprestimos', { query, auth: true }),
    createCategory: body => request('admin', '/categorias', { method: 'POST', body, auth: true }),
    createAuthor: body => request('admin', '/autores', { method: 'POST', body, auth: true }),
    createBook: body => request('admin', '/livros', { method: 'POST', body, auth: true }),
    createCopy: body => request('admin', '/exemplares', { method: 'POST', body, auth: true }),
    createReader: body => request('admin', '/leitores', { method: 'POST', body, auth: true }),
    createLoan: body => request('circulation', '/emprestimos', { method: 'POST', body, auth: true }),
    returnItem: (id, body = {}) => request('circulation', `/itens-emprestimos/${encodeURIComponent(id)}/devolucao`, { method: 'PATCH', body, auth: true })
  });
})();
