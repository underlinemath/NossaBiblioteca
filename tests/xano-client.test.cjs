const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'xano-client.js'), 'utf8');

function clientWith(fetchImpl) {
  const storage = new Map();
  const window = {
    XANO_CONFIG: {
      auth: 'https://example.test/auth',
      admin: 'https://example.test/admin',
      catalog: 'https://example.test/catalog',
      circulation: 'https://example.test/circulation'
    }
  };
  const context = {
    window,
    sessionStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key)
    },
    URL,
    AbortController,
    setTimeout,
    clearTimeout,
    fetch: fetchImpl,
    JSON,
    Object,
    Error,
    Boolean,
    String
  };
  vm.runInNewContext(source, context);
  return { client: window.XanoClient, storage };
}

const response = (status, body) => ({
  status,
  ok: status >= 200 && status < 300,
  text: async () => JSON.stringify(body)
});

test('desembrulha envelope Xano e codifica parâmetros', async () => {
  let requested;
  const { client } = clientWith(async (url) => {
    requested = new URL(url);
    return response(200, { data: [{ id: 1 }], error: null });
  });
  const result = await client.catalog({ busca: 'A & B', page: 2 });
  assert.equal(result[0].id, 1);
  assert.equal(requested.searchParams.get('busca'), 'A & B');
  assert.equal(requested.searchParams.get('page'), '2');
});

test('envia token apenas em operações autenticadas e salva a sessão', async () => {
  const headers = [];
  const { client, storage } = clientWith(async (_url, options) => {
    headers.push(options.headers);
    return response(200, { data: { authToken: 'session-token', user: { id: 5 } }, error: null });
  });
  await client.login('lib@example.test', 'secret');
  assert.equal(storage.get('nossabiblioteca.librarian-token'), 'session-token');
  await client.readers();
  assert.equal(headers[0].authorization, undefined);
  assert.equal(headers[1].authorization, 'Bearer session-token');
});

test('converte erros Xano e limpa sessão em 401', async () => {
  const { client, storage } = clientWith(async () => response(401, {
    error: { code: 'UNAUTHORIZED', message: 'Sessão expirada' }
  }));
  await assert.rejects(client.me(), error => error.status === 401 && error.message === 'Sessão expirada');
  assert.equal(storage.has('nossabiblioteca.librarian-token'), false);
});

test('trata erro Xano Throw Error', async () => {
  const { client } = clientWith(async () => response(400, {
    statement: 'Throw Error', payload: 'ISBN já cadastrado'
  }));
  await assert.rejects(client.createBook({}), /ISBN já cadastrado/);
});

test('converte falha de rede em erro legível', async () => {
  const { client } = clientWith(async () => { throw new TypeError('offline'); });
  await assert.rejects(client.catalog(), error => error.code === 'NETWORK_ERROR');
});

test('executa PATCH e DELETE administrativos com bearer token', async () => {
  const calls = [];
  const { client } = clientWith(async (url, options) => {
    calls.push({ url: new URL(url), options });
    const route = String(url);
    if (route.includes('/auth/bibliotecarios/login')) {
      return response(200, { data: { authToken: 'session-token', user: { id: 1 } }, error: null });
    }
    if (route.includes('/livros/12') && options.method === 'PATCH') {
      return response(200, { data: { id: 12, titulo: 'Atualizado' }, error: null });
    }
    return response(200, { data: { deleted: true, id: 12 }, error: null });
  });
  await client.login('lib@example.test', 'secret');
  await client.updateBook(12, { titulo: 'Atualizado' });
  await client.deleteBook(12);
  assert.equal(calls[1].options.method, 'PATCH');
  assert.equal(calls[1].options.headers.authorization, 'Bearer session-token');
  assert.equal(calls[2].options.method, 'DELETE');
  assert.equal(calls[2].options.headers.authorization, 'Bearer session-token');
});

test('frontend não usa localStorage como fonte de dados', () => {
  const appSource = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  assert.equal(/localStorage/.test(appSource), false);
  assert.equal(/biblioteca_demo_v1/.test(appSource), false);
});
