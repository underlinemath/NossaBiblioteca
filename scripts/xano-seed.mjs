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
    if (value && !value.startsWith('#')) process.env[match[1]] = value;
  }
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
const prefix = process.env.XANO_TEST_PREFIX?.trim();
const required = [
  'XANO_AUTH_BASE_URL',
  'XANO_ADMIN_BASE_URL',
  'XANO_CATALOG_BASE_URL',
  'XANO_CIRCULATION_BASE_URL',
  'XANO_LIBRARIAN_EMAIL',
  'XANO_LIBRARIAN_PASSWORD',
  'XANO_TEST_READER_EMAIL',
  'XANO_TEST_READER_PASSWORD',
  'XANO_TEST_PREFIX',
];

function configure() {
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(`Configuração ausente: ${missing.join(', ')}. Nenhuma requisição foi enviada.`);
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,23}$/.test(prefix)) {
    throw new Error('XANO_TEST_PREFIX deve ter de 3 a 24 caracteres alfanuméricos, _ ou - e começar por letra/número.');
  }
}

const groups = {
  auth: process.env.XANO_AUTH_BASE_URL,
  admin: process.env.XANO_ADMIN_BASE_URL,
  catalog: process.env.XANO_CATALOG_BASE_URL,
  circulation: process.env.XANO_CIRCULATION_BASE_URL,
};
const calls = [];
let librarianToken;
let readerToken;

function endpoint(base, path, query) {
  const url = new URL(path.replace(/^\/+/, ''), base.endsWith('/') ? base : `${base}/`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url;
}

async function request(group, method, path, { body, token, query, allowStatus = [] } = {}) {
  const url = endpoint(groups[group], path, query);
  const headers = { accept: 'application/json' };
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(url, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  let payload;
  try { payload = text ? JSON.parse(text) : null; }
  catch { payload = { nonJson: true }; }
  calls.push({ method, route: `${group}:${path}`, status: response.status });
  const xanoThrew = payload?.statement === 'Throw Error';
  if (xanoThrew || (!response.ok && !allowStatus.includes(response.status))) {
    const responseBody = payload?.payload ?? payload;
    const code = responseBody?.error?.code ?? responseBody?.code ?? payload?.statement ?? 'HTTP_ERROR';
    const message = typeof responseBody === 'string'
      ? responseBody
      : responseBody?.error?.message ?? responseBody?.message ?? 'Resposta sem mensagem estruturada';
    throw new Error(`${method} ${group}:${path} retornou HTTP ${response.status} (${code}): ${message}`);
  }
  return { status: response.status, payload };
}

function dataOf(payload) {
  const responseBody = payload?.payload ?? payload;
  return responseBody?.data ?? responseBody;
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
  if (data && !Array.isArray(data) && typeof data === 'object' && data.id !== undefined) return data;
  if (data?.item?.id !== undefined) return data.item;
  throw new Error('A API não retornou o registro criado no formato esperado.');
}

function slug(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function getAll(path, token, query = {}) {
  const result = await request('admin', 'GET', path, { token, query: { page: 1, ...query } });
  return rowsOf(result.payload);
}

async function librarianLogin() {
  const { payload } = await request('auth', 'POST', 'auth/bibliotecarios/login', {
    body: { email: process.env.XANO_LIBRARIAN_EMAIL, senha: process.env.XANO_LIBRARIAN_PASSWORD },
  });
  librarianToken = dataOf(payload)?.authToken;
  if (!librarianToken) throw new Error('Login de bibliotecário não retornou token.');
}

async function readerLoginOrSignup() {
  const body = {
    nome: `${prefix} Leitor de integração`,
    email: process.env.XANO_TEST_READER_EMAIL,
    senha: process.env.XANO_TEST_READER_PASSWORD,
    telefone: '11999990000',
  };
  let result = await request('auth', 'POST', 'auth/leitores/signup', { body, allowStatus: [400, 409] });
  if (!result.payload?.data?.authToken) {
    result = await request('auth', 'POST', 'auth/leitores/login', {
      body: { email: body.email, senha: body.senha },
    });
  }
  readerToken = dataOf(result.payload)?.authToken;
  if (!readerToken) throw new Error('Cadastro/login do leitor de teste não retornou token.');
  return dataOf(result.payload).user;
}

async function upsertNamed({ path, name, token, body }) {
  const found = (await getAll(path, token, { busca: name })).filter((item) => item.nome === name);
  if (found.length > 1) throw new Error(`Chave natural duplicada em ${path}: ${name}`);
  if (found.length === 1) return { record: found[0], created: false };
  const { payload } = await request('admin', 'POST', path, { token, body });
  return { record: recordOf(payload), created: true };
}

const catalog = [
  { category: 'Literatura', title: 'Dom Casmurro', authors: ['Machado de Assis'], isbn: '9788535902778', copies: 2 },
  { category: 'Literatura', title: 'Memórias Póstumas de Brás Cubas', authors: ['Machado de Assis'], isbn: '9788535910668', copies: 1 },
  { category: 'Literatura', title: 'A Moreninha', authors: ['Joaquim Manuel de Macedo'], isbn: '9788533901232', copies: 1 },
  { category: 'Ficção científica', title: 'A Máquina do Tempo', authors: ['H. G. Wells'], isbn: '9788535911139', copies: 1 },
  { category: 'Ficção científica', title: 'Vinte Mil Léguas Submarinas', authors: ['Júlio Verne'], isbn: '9788535911450', copies: 1 },
  { category: 'Filosofia', title: 'O Príncipe', authors: ['Nicolau Maquiavel'], isbn: '9788525410790', copies: 1 },
  { category: 'Contos', title: 'O Alienista', authors: ['Machado de Assis'], isbn: '9788525408865', copies: 1 },
  { category: 'Contos', title: 'A Cartomante e Outros Contos', authors: ['Machado de Assis'], isbn: '9788572326488', copies: 1 },
];

async function run() {
  configure();
  await librarianLogin();
  const reader = await readerLoginOrSignup();
  const created = { categorias: 0, autores: 0, livros: 0, livros_autores: 0, exemplares: 0, leitores: 0, reservas: 0, emprestimos: 0, itens_emprestimos: 0 };
  const reused = { categorias: 0, autores: 0, livros: 0, livros_autores: 0, exemplares: 0, leitores: 0, reservas: 0, emprestimos: 0, itens_emprestimos: 0 };
  created.leitores = reader?.id ? 0 : 1;
  reused.leitores = reader?.id ? 1 : 0;

  const categoryIds = new Map();
  for (const name of [...new Set(catalog.map((book) => book.category))]) {
    const { record, created: fresh } = await upsertNamed({ path: 'categorias', name: `${prefix}-${name}`, token: librarianToken, body: { nome: `${prefix}-${name}` } });
    categoryIds.set(name, record.id);
    (fresh ? created : reused).categorias++;
  }

  const authorIds = new Map();
  for (const name of [...new Set(catalog.flatMap((book) => book.authors))]) {
    const authorName = `${prefix}-${name}`;
    const { record, created: fresh } = await upsertNamed({ path: 'autores', name: authorName, token: librarianToken, body: { nome: authorName } });
    authorIds.set(name, record.id);
    (fresh ? created : reused).autores++;
  }

  const seedBooks = [];
  for (const [index, book] of catalog.entries()) {
    const isbn = `${prefix}-${book.isbn}`;
    const matches = (await request('catalog', 'GET', 'livros', { query: { busca: isbn, page: 1 } })).payload;
    const books = rowsOf(matches).filter((row) => row.isbn === isbn);
    if (books.length > 1) throw new Error(`ISBN duplicado no catálogo: ${isbn}`);
    let row;
    if (books.length) {
      row = books[0];
      reused.livros++;
    } else {
      const { payload } = await request('admin', 'POST', 'livros', {
        token: librarianToken,
        body: {
          categoria_id: categoryIds.get(book.category),
          titulo: `${prefix} ${book.title}`,
          autor: book.authors.join(', '),
          autor_ids: book.authors.map((author) => authorIds.get(author)),
          isbn,
          descricao: `Registro de demonstração controlado pela massa ${prefix}.`,
        },
      });
      row = recordOf(payload);
      created.livros++;
    }
    if (row.categoria_id !== categoryIds.get(book.category)) throw new Error(`Livro ${isbn} vinculado à categoria incorreta.`);
    const associations = rowsOf((await request('admin', 'GET', `livros/${row.id}/autores`, { token: librarianToken })).payload);
    for (const author of book.authors) {
      const matches = associations.filter((entry) => entry.livro_id === row.id && entry.autor_id === authorIds.get(author));
      if (matches.length > 1) throw new Error(`Associação livros_autores duplicada para ${isbn} / ${author}.`);
      if (!matches.length) {
        await request('admin', 'POST', `livros/${row.id}/autores`, { token: librarianToken, body: { autor_id: authorIds.get(author) } });
        created.livros_autores++;
      } else reused.livros_autores++;
    }

    const copies = await getAll('exemplares', librarianToken, { livro_id: row.id });
    const expectedCodes = Array.from({ length: book.copies }, (_, copy) => `${prefix}-${slug(book.title)}-${copy + 1}`);
    for (const [copy, code] of expectedCodes.entries()) {
      const matching = copies.filter((item) => item.codigo === code);
      if (matching.length > 1) throw new Error(`Código de exemplar duplicado: ${code}`);
      if (!matching.length) {
        const { payload } = await request('admin', 'POST', 'exemplares', {
          token: librarianToken,
          body: { livro_id: row.id, codigo: code, situacao: 'disponivel' },
        });
        const newCopy = recordOf(payload);
        if (newCopy.livro_id !== row.id || newCopy.codigo !== code) throw new Error(`Exemplar ${code} não foi persistido com o vínculo esperado.`);
        copies.push(newCopy);
        created.exemplares++;
      } else {
        if (matching[0].livro_id !== row.id) throw new Error(`Exemplar ${code} associado a livro incorreto.`);
        reused.exemplares++;
      }
    }
    seedBooks.push({ ...book, id: row.id, isbn, codes: expectedCodes });
  }

  const reservationBook = seedBooks[0];
  const reservationList = rowsOf((await request('circulation', 'GET', 'reservas', { token: readerToken })).payload);
  const existingReservation = reservationList.find((item) => item.livro_id === reservationBook.id && item.modalidade === 'emprestimo' && item.situacao === 'pendente');
  if (existingReservation) reused.reservas++;
  else {
    const { payload } = await request('circulation', 'POST', 'reservas', {
      token: readerToken,
      body: { livro_id: reservationBook.id, modalidade: 'emprestimo' },
    });
    const reservation = recordOf(payload);
    if (reservation.leitor_id !== reader.id || reservation.livro_id !== reservationBook.id) throw new Error('Reserva não persistida com leitor/livro esperado.');
    created.reservas++;
  }

  const loanBook = seedBooks[1];
  const loanCode = loanBook.codes[0];
  const loanCopies = await getAll('exemplares', librarianToken, { livro_id: loanBook.id });
  const loanCopy = loanCopies.find((item) => item.codigo === loanCode);
  if (!loanCopy) throw new Error(`Exemplar de empréstimo não localizado: ${loanCode}`);
  if (loanCopy.disponivel === true) {
    const due = new Date();
    due.setUTCDate(due.getUTCDate() + 14);
    const { payload } = await request('circulation', 'POST', 'emprestimos', {
      token: librarianToken,
      body: { leitor_id: reader.id, exemplar_id: loanCopy.id, data_prevista_devolucao: due.toISOString().slice(0, 10) },
    });
    const result = dataOf(payload);
    if (result.emprestimo?.leitor_id !== reader.id || result.item?.exemplar_id !== loanCopy.id || result.exemplar?.disponivel !== false) {
      throw new Error('Empréstimo, item ou transição de disponibilidade não corresponde à resposta esperada.');
    }
    created.emprestimos++;
    created.itens_emprestimos++;
  } else {
    reused.emprestimos++;
    reused.itens_emprestimos++;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    environment: 'Xano configurado por variáveis de ambiente',
    prefix,
    tables: { created, reused },
    requests: calls,
    failures: [],
  };
  const reportPath = process.env.XANO_REPORT_PATH;
  if (reportPath) {
    const destination = resolve(root, reportPath);
    await mkdir(dirname(destination), { recursive: true });
    await appendFile(destination, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(`Relatório salvo: ${reportPath}`);
  }
  console.log(JSON.stringify(report, null, 2));
}

try {
  await run();
} catch (error) {
  // Nunca imprimir headers, bodies ou tokens. O erro de rede pode conter URL, então ele é omitido.
  console.error(`Carga interrompida: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
  process.exitCode = 1;
}
