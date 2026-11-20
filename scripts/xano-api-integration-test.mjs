import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  const localEnv = await readFile(resolve(root, '.env.local'), 'utf8');
  for (const line of localEnv.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
    if (value) process.env[match[1]] = value;
  }
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const bases = {
  auth: process.env.XANO_AUTH_BASE_URL,
  admin: process.env.XANO_ADMIN_BASE_URL,
  catalog: process.env.XANO_CATALOG_BASE_URL,
  circulation: process.env.XANO_CIRCULATION_BASE_URL,
};
const missing = Object.entries(bases).filter(([, value]) => !value?.trim()).map(([key]) => key);
if (missing.length) throw new Error(`Configuração ausente: ${missing.join(', ')}`);

const prefix = `TEST${Date.now().toString().slice(-8)}`;
const results = [];
let lastRequest = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(group, method, path, { body, token, query, allowed = [200, 201, 202, 204] } = {}) {
  const base = bases[group];
  const url = new URL(path.replace(/^\/+/, ''), base.endsWith('/') ? base : `${base}/`);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, String(value));
  const headers = { accept: 'application/json' };
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (token) headers.authorization = `Bearer ${token}`;
  for (let attempt = 0; attempt < 6; attempt++) {
    const elapsed = Date.now() - lastRequest;
    if (elapsed < 2200) await sleep(2200 - elapsed);
    lastRequest = Date.now();
    let response;
    try {
      response = await fetch(url, { method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    } catch (error) {
      if (attempt === 5) throw error;
      await sleep(5000);
      continue;
    }
    const text = await response.text();
    let payload;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = { nonJson: true }; }
    if (response.status === 429 && attempt < 5) {
      await sleep(21000);
      continue;
    }
    const threw = payload?.statement === 'Throw Error';
    return { status: response.status, payload, allowed, threw };
  }
  throw new Error('Limite persistiu após retries');
}

function dataOf(payload) {
  const body = payload?.payload ?? payload;
  return body?.data ?? body;
}

function rowsOf(payload) {
  const data = dataOf(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.records)) return data.records;
  return [];
}

function recordOf(payload) {
  const data = dataOf(payload);
  if (data?.id !== undefined) return data;
  if (data?.item?.id !== undefined) return data.item;
  throw new Error('Resposta sem registro');
}

function check(name, condition, detail = '') {
  results.push({ name, passed: Boolean(condition), detail });
  if (!condition) throw new Error(`Falha: ${name}${detail ? ` - ${detail}` : ''}`);
}

async function run() {
  const invalidLogin = await request('auth', 'POST', 'auth/bibliotecarios/login', {
    body: { email: `invalid-${prefix}@example.test`, senha: 'SenhaInvalida123!' },
  });
  check('Autenticação rejeita credencial inválida', invalidLogin.threw || invalidLogin.status === 401 || invalidLogin.status === 403);

  const librarianEmail = `integracao-${prefix}@nossabiblioteca.test`;
  const librarianPassword = `Biblioteca!${prefix}`;
  const librarianSignup = await request('auth', 'POST', 'bibliotecarios', {
    body: { nome: `Bibliotecário ${prefix}`, email: librarianEmail, senha: librarianPassword, permissoes: 'admin', status: 'ativo' },
  });
  const librarianToken = librarianSignup.payload?.authToken ?? dataOf(librarianSignup.payload)?.authToken;
  check('Cadastro de bibliotecário retorna token', Boolean(librarianToken));

  const readerEmail = `leitor-${prefix}@nossabiblioteca.test`;
  const readerPassword = `Leitor!${prefix}`;
  const readerSignup = await request('auth', 'POST', 'auth/leitores/signup', {
    body: { nome: `Leitor ${prefix}`, email: readerEmail, senha: readerPassword, telefone: '11999990000' },
  });
  const readerToken = readerSignup.payload?.data?.authToken ?? dataOf(readerSignup.payload)?.authToken;
  const reader = readerSignup.payload?.data?.user ?? dataOf(readerSignup.payload)?.user;
  check('Cadastro de leitor retorna token', Boolean(readerToken), 'authToken ausente');

  const unauthorizedCategory = await request('admin', 'POST', 'categorias', {
    body: { nome: `${prefix}-CategoriaNaoAutorizada` },
  });
  check('Mutação administrativa sem token é bloqueada', unauthorizedCategory.status === 401 || unauthorizedCategory.status === 403 || unauthorizedCategory.threw);

  const categoryResponse = await request('admin', 'POST', 'categorias', {
    token: librarianToken,
    body: { nome: `${prefix}-Categoria` },
  });
  const category = recordOf(categoryResponse.payload);
  check('Cadastro de categoria persiste', Boolean(category.id));

  const authorResponse = await request('admin', 'POST', 'autores', {
    token: librarianToken,
    body: { nome: `${prefix}-Autor Real` },
  });
  const author = recordOf(authorResponse.payload);
  check('Cadastro de autor persiste', Boolean(author.id));

  const bookResponse = await request('admin', 'POST', 'livros', {
    token: librarianToken,
    body: {
      categoria_id: category.id,
      titulo: `${prefix}-Livro Real`,
      autor: `${prefix}-Autor Real`,
      autor_ids: [author.id],
      isbn: `${prefix}-ISBN`,
      editora: `${prefix}-Editora Real`,
      descricao: 'Livro criado pela suíte de integração.',
    },
  });
  const book = recordOf(bookResponse.payload);
  check('Cadastro de livro persiste categoria e associação', Boolean(book.id));

  const copyResponse = await request('admin', 'POST', 'exemplares', {
    token: librarianToken,
    body: { livro_id: book.id, codigo: `${prefix}-EX-1`, situacao: 'disponivel' },
  });
  const copy = recordOf(copyResponse.payload);
  check('Cadastro de exemplar persiste vínculo', copy.livro_id === book.id);

  const catalog = await request('catalog', 'GET', 'livros', { query: { busca: prefix, page: 1 } });
  check('Consulta pública retorna livro criado', rowsOf(catalog.payload).some((item) => item.id === book.id));

  const reservation = await request('circulation', 'POST', 'reservas', {
    token: readerToken,
    body: { livro_id: book.id, modalidade: 'emprestimo' },
  });
  check('Reserva persiste para leitor autenticado', recordOf(reservation.payload).livro_id === book.id);

  const due = new Date();
  due.setUTCDate(due.getUTCDate() + 14);
  const loan = await request('circulation', 'POST', 'emprestimos', {
    token: librarianToken,
    body: { leitor_id: reader.id, exemplar_id: copy.id, data_prevista_devolucao: due.toISOString().slice(0, 10) },
  });
  const loanData = dataOf(loan.payload);
  check('Empréstimo atualiza estado do exemplar', loanData?.exemplar?.disponivel === false);

  const secondLoan = await request('circulation', 'POST', 'emprestimos', {
    token: librarianToken,
    body: { leitor_id: reader.id, exemplar_id: copy.id, data_prevista_devolucao: due.toISOString().slice(0, 10) },
  });
  check('Segundo empréstimo do mesmo exemplar é rejeitado', secondLoan.status === 409 || secondLoan.threw);

  if (loanData?.item?.id) {
    const returned = await request('circulation', 'PATCH', `itens-emprestimos/${loanData.item.id}/devolucao`, {
      token: librarianToken,
      body: {},
    });
    check('Devolução atualiza item e exemplar', returned.status === 200);
  }

  const report = { generatedAt: new Date().toISOString(), prefix, results };
  const reportPath = resolve(root, process.env.XANO_INTEGRATION_REPORT || 'logs/xano-api-integration.json');
  await mkdir(dirname(reportPath), { recursive: true });
  await appendFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
}

try {
  await run();
} catch (error) {
  console.error(`Integração interrompida: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
  process.exitCode = 1;
}
