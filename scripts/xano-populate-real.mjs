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

const required = ['XANO_AUTH_BASE_URL', 'XANO_ADMIN_BASE_URL', 'XANO_CATALOG_BASE_URL'];
const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) throw new Error(`Configuração ausente: ${missing.join(', ')}`);

const authBase = process.env.XANO_AUTH_BASE_URL;
const adminBase = process.env.XANO_ADMIN_BASE_URL;
const catalogBase = process.env.XANO_CATALOG_BASE_URL;
let librarianToken = '';
let lastRequest = 0;
const calls = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(base, method, path, { body, token, query, allowStatus = [] } = {}) {
  const url = new URL(path.replace(/^\/+/, ''), base.endsWith('/') ? base : `${base}/`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
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
    } catch {
      if (attempt < 5) {
        await sleep(5000);
        continue;
      }
      throw new Error(`Falha de rede em ${method} ${path}`);
    }
    const text = await response.text();
    let payload;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = { nonJson: true }; }
    calls.push({ method, route: path, status: response.status });
    if (response.status === 429 && attempt < 5) {
      await sleep(21000);
      continue;
    }
    const threw = payload?.statement === 'Throw Error';
    if ((threw && !allowStatus.includes(response.status)) || (!response.ok && !allowStatus.includes(response.status))) {
      throw new Error(`${method} ${path} retornou HTTP ${response.status}`);
    }
    return payload;
  }
  throw new Error('Limite de requisições persistiu após retries');
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

async function getNamed(path, name) {
  const rows = rowsOf(await request(adminBase, 'GET', path, { token: librarianToken, query: { busca: name, page: 1 } }));
  return rows.find((row) => row.nome === name) ?? null;
}

async function ensureNamed(path, name) {
  let record = await getNamed(path, name);
  if (record) return record;
  const payload = await request(adminBase, 'POST', path, { token: librarianToken, body: { nome: name } });
  record = dataOf(payload);
  if (!record?.id) throw new Error(`Não foi possível criar ${path}: ${name}`);
  return record;
}

async function ensureLibrarian() {
  const email = process.env.XANO_TEST_LIBRARIAN_EMAIL?.trim()
    || `seed-biblioteca-${Date.now()}@nossabiblioteca.test`;
  const password = process.env.XANO_TEST_LIBRARIAN_PASSWORD?.trim()
    || 'Biblioteca123!';

  try {
    const login = await request(authBase, 'POST', 'auth/bibliotecarios/login', {
      body: { email, senha: password },
    });
    librarianToken = dataOf(login)?.authToken;
  } catch {
    const signup = await request(authBase, 'POST', 'bibliotecarios', {
      body: { nome: 'Bibliotecário de carga real', email, senha: password, permissoes: 'admin', status: 'ativo' },
      allowStatus: [200, 409],
    });
    librarianToken = dataOf(signup)?.authToken ?? signup?.authToken;
  }
  if (!librarianToken) throw new Error('Não foi possível autenticar o bibliotecário de carga.');
}

async function fetchRealCatalog() {
  const terms = [
    ['Literatura brasileira', 'Literatura'],
    ['Literatura portuguesa', 'Literatura'],
    ['Machado de Assis', 'Literatura'],
    ['Clarice Lispector', 'Literatura'],
    ['Romance brasileiro', 'Romance'],
    ['Ficção científica', 'Ficção científica'],
    ['Filosofia', 'Filosofia'],
    ['História', 'História'],
    ['Biografia', 'Biografia'],
    ['Poesia', 'Poesia'],
  ];
  const books = [];
  const seen = new Set();
  for (const [term, category] of terms) {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(term)}&language=por&limit=30&fields=title,author_name,isbn,publisher`;
    let response;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        response = await fetch(url);
        break;
      } catch {
        if (attempt === 4) throw new Error(`Open Library indisponível em ${term}`);
        await sleep(5000);
      }
    }
    if (!response.ok) throw new Error(`Open Library respondeu HTTP ${response.status}`);
    const payload = await response.json();
    for (const doc of payload.docs ?? []) {
      const isbn = (doc.isbn ?? []).find((value) => /^978\d{10}$/.test(value))
        ?? (doc.isbn ?? []).find((value) => /^\d{10}(\d|X)$/.test(value));
      if (!doc.title || !doc.author_name?.length || !isbn || !doc.publisher?.length) continue;
      if (seen.has(isbn)) continue;
      seen.add(isbn);
      books.push({
        category,
        title: doc.title,
        authors: [...new Set(doc.author_name)].slice(0, 3),
        isbn,
        publisher: [...new Set(doc.publisher)].slice(0, 3).join(', '),
      });
      if (books.length >= 120) break;
    }
    if (books.length >= 120) break;
  }
  if (books.length < 100) throw new Error(`Open Library retornou apenas ${books.length} livros completos com ISBN e editora.`);
  return books.slice(0, 120);
}

const firstNames = ['Ana','Beatriz','Bruno','Caio','Carla','Daniel','Eduardo','Fernanda','Gabriel','Helena','Igor','João','Larissa','Lucas','Mariana','Mateus','Natália','Paulo','Rafael','Sofia'];
const lastNames = ['Almeida','Azevedo','Barbosa','Costa','Dias','Ferreira','Gomes','Lima','Martins','Melo','Oliveira','Pereira','Ribeiro','Rodrigues','Silva','Souza'];

async function createReaders(count = 100) {
  let created = 0;
  let reused = 0;
  for (let index = 1; index <= count; index++) {
    const name = `${firstNames[(index - 1) % firstNames.length]} ${lastNames[(index - 1) % lastNames.length]}`;
    const email = `leitor.real.${String(index).padStart(3, '0')}@nossabiblioteca.test`;
    const login = await request(authBase, 'POST', 'auth/leitores/login', {
      body: { email, senha: `Leitor!${String(index).padStart(3, '0')}` },
      allowStatus: [200],
    });
    if (dataOf(login)?.authToken) {
      reused++;
      continue;
    }
    const signup = await request(authBase, 'POST', 'auth/leitores/signup', {
      body: { nome: name, email, senha: `Leitor!${String(index).padStart(3, '0')}`, telefone: `1199999${String(index).padStart(4, '0')}` },
      allowStatus: [200, 409],
    });
    if (dataOf(signup)?.authToken || signup?.data?.authToken) created++;
  }
  return { created, reused };
}

async function createLibrarians(count = 10) {
  let created = 0;
  let reused = 0;
  for (let index = 1; index <= count; index++) {
    const email = `bibliotecario.real.${String(index).padStart(2, '0')}@nossabiblioteca.test`;
    const password = `Biblioteca!${String(index).padStart(2, '0')}`;
    const login = await request(authBase, 'POST', 'auth/bibliotecarios/login', {
      body: { email, senha: password },
      allowStatus: [200],
    });
    if (dataOf(login)?.authToken) {
      reused++;
      continue;
    }
    const signup = await request(authBase, 'POST', 'bibliotecarios', {
      body: { nome: `Bibliotecário Real ${String(index).padStart(2, '0')}`, email, senha: password, permissoes: 'admin', status: 'ativo' },
      allowStatus: [200, 409],
    });
    if (dataOf(signup)?.authToken || signup?.authToken) created++;
  }
  return { created, reused };
}

async function run() {
  await ensureLibrarian();
  const books = await fetchRealCatalog();
  const categories = new Map();
  for (const name of [...new Set(books.map((book) => book.category))]) {
    const record = await ensureNamed('categorias', name);
    categories.set(name, record.id);
  }

  let booksCreated = 0;
  let booksReused = 0;
  let copiesCreated = 0;
  let associationsCreated = 0;
  for (const book of books) {
    const authorRecords = [];
    for (const authorName of book.authors) {
      const author = await ensureNamed('autores', authorName);
      authorRecords.push(author);
    }
    const catalog = rowsOf(await request(catalogBase, 'GET', 'livros', { token: librarianToken, query: { busca: book.isbn, page: 1 } }));
    let record = catalog.find((row) => row.isbn === book.isbn);
    if (!record) {
      const payload = await request(adminBase, 'POST', 'livros', {
        token: librarianToken,
        body: {
          categoria_id: categories.get(book.category),
          titulo: book.title,
          autor: book.authors.join(', '),
          autor_ids: authorRecords.map((author) => author.id),
          isbn: book.isbn,
          editora: book.publisher,
          descricao: `Obra real publicada por ${book.publisher}.`,
        },
      });
      record = dataOf(payload);
      booksCreated++;
    } else {
      booksReused++;
    }

    const associations = rowsOf(await request(adminBase, 'GET', `livros/${record.id}/autores`, { token: librarianToken }));
    for (const author of authorRecords) {
      if (!associations.some((association) => association.autor_id === author.id)) {
        await request(adminBase, 'POST', `livros/${record.id}/autores`, { token: librarianToken, body: { autor_id: author.id } });
        associationsCreated++;
      }
    }
    const copies = rowsOf(await request(adminBase, 'GET', 'exemplares', { token: librarianToken, query: { livro_id: record.id } }));
    for (let copyIndex = 1; copyIndex <= 2; copyIndex++) {
      const code = `NB-${book.isbn}-${copyIndex}`;
      if (!copies.some((copy) => copy.codigo === code)) {
        const createdCopy = await request(adminBase, 'POST', 'exemplares', {
          token: librarianToken,
          body: { livro_id: record.id, codigo: code, situacao: 'disponivel' },
          allowStatus: [200, 409],
        });
        if (createdCopy?.statement !== 'Throw Error') {
          copiesCreated++;
        } else {
          const refreshed = rowsOf(await request(adminBase, 'GET', 'exemplares', { token: librarianToken, query: { livro_id: record.id, page: 1 } }));
          if (!refreshed.some((copy) => copy.codigo === code)) {
            throw new Error(`Exemplar ${code} não foi criado nem encontrado após conflito.`);
          }
        }
      }
    }
  }

  const readerStats = await createReaders(100);
  const librarianStats = await createLibrarians(10);
  const report = {
    generatedAt: new Date().toISOString(),
    counts: {
      booksCreated,
      booksReused,
      copiesCreated,
      associationsCreated,
      readersCreated: readerStats.created,
      readersReused: readerStats.reused,
      librariansCreated: librarianStats.created,
      librariansReused: librarianStats.reused,
    },
    requests: calls,
  };
  const reportPath = resolve(root, process.env.XANO_REPORT_PATH || 'logs/xano-real-population.json');
  await mkdir(dirname(reportPath), { recursive: true });
  await appendFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report.counts, null, 2));
  console.log(`Relatório salvo: ${process.env.XANO_REPORT_PATH || 'logs/xano-real-population.json'}`);
}

try {
  await run();
} catch (error) {
  console.error(`Carga real interrompida: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
  process.exitCode = 1;
}
