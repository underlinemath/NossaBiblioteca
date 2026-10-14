const RULES = {
  loanDays: 7,
  maxLoansPerReader: 3
};

const STORAGE_KEY = 'biblioteca_demo_v1';

const today = () => new Date().toISOString().slice(0, 10);

const plusDays = (date, days) => {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const fmtDate = value =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')
    : '—';

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const esc = value =>
  String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

const initial = {
  books: [
    {
      id: 'b1',
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      isbn: '9788535902778',
      category: 'Literatura',
      publisher: 'Companhia das Letras',
      year: 1899,
      copies: 2
    },
    {
      id: 'b2',
      title: 'O Pequeno Príncipe',
      author: 'Antoine de Saint-Exupéry',
      isbn: '9788522031445',
      category: 'Ficção',
      publisher: 'Agir',
      year: 1943,
      copies: 3
    },
    {
      id: 'b3',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      category: 'Tecnologia',
      publisher: 'Prentice Hall',
      year: 2008,
      copies: 1
    }
  ],

  readers: [
    {
      id: 'r1',
      name: 'Ana Souza',
      email: 'ana@example.com',
      phone: '11999990001',
      status: 'Ativo'
    },
    {
      id: 'r2',
      name: 'Lucas Mendes',
      email: 'lucas@example.com',
      phone: '11999990002',
      status: 'Ativo'
    }
  ],

  loans: []
};

let data;

try {
  data =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) ||
    structuredClone(initial);
} catch {
  data = structuredClone(initial);
}

let page = 'dashboard';
let editing = null;
let modalType = null;
let query = '';
let filter = 'todos';

const $ = selector => document.querySelector(selector);

const save = () =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const copiesForBook = bookId =>
  data.books.find(b => b.id === bookId)?.copies || 0;

const activeLoansForBook = bookId =>
  data.loans.filter(
    l => l.bookId === bookId && !l.returnedAt
  ).length;

const availableCopies = bookId =>
  Math.max(
    0,
    copiesForBook(bookId) - activeLoansForBook(bookId)
  );

const activeLoansForReader = readerId =>
  data.loans.filter(
    l => l.readerId === readerId && !l.returnedAt
  ).length;

const readerName = id =>
  data.readers.find(r => r.id === id)?.name ||
  'Leitor removido';

const bookTitle = id =>
  data.books.find(b => b.id === id)?.title ||
  'Livro removido';

const isOverdue = loan =>
  !loan.returnedAt && loan.dueAt < today();

const statusBadge = status => {
  let cls =
    status === 'Disponível' ||
    status === 'Ativo' ||
    status === 'Devolvido'
      ? 'green'
      : status === 'Atrasado' || status === 'Inativo'
        ? 'red'
        : status === 'Emprestado'
          ? 'amber'
          : 'gray';

  return `<span class="badge ${cls}">${esc(status)}</span>`;
};

function showToast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');

  setTimeout(() => el.classList.remove('show'), 2500);
}

function nav() {
  document.querySelectorAll('.nav-link').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });

  $('#pageTitle').textContent = ({
    dashboard: 'Painel inicial',
    books: 'Livros e exemplares',
    readers: 'Leitores',
    loans: 'Empréstimos e devoluções'
  })[page];

  $('#quickAdd').textContent = (
    page === 'dashboard'
      ? '＋ Novo cadastro'
      : page === 'books'
        ? '＋ Novo livro'
        : page === 'readers'
          ? '＋ Novo leitor'
          : '＋ Novo empréstimo'
  );
}

function render() {
  nav();

  const content = $('#pageContent');

  if (page === 'dashboard') {
    content.innerHTML = dashboard();
  }

  if (page === 'books') {
    content.innerHTML = booksPage();
  }

  if (page === 'readers') {
    content.innerHTML = readersPage();
  }

  if (page === 'loans') {
    content.innerHTML = loansPage();
  }
}

function dashboard() {
  const total = data.books.reduce(
    (n, b) => n + Number(b.copies || 0),
    0
  );

  const available = data.books.reduce(
    (n, b) => n + availableCopies(b.id),
    0
  );

  const active = data.loans.filter(
    l => !l.returnedAt
  ).length;

  const overdue = data.loans.filter(isOverdue).length;

  const recent = [...data.loans]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return `
    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">
          Títulos cadastrados
          <span class="stat-icon">▤</span>
        </div>
        <div class="stat-number">${data.books.length}</div>
        <div class="stat-note">Títulos diferentes no catálogo</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">
          Exemplares disponíveis
          <span class="stat-icon">✓</span>
        </div>
        <div class="stat-number">${available}</div>
        <div class="stat-note">De ${total} exemplares cadastrados</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">
          Empréstimos ativos
          <span class="stat-icon">⇄</span>
        </div>
        <div class="stat-number">${active}</div>
        <div class="stat-note">Livros fora da biblioteca</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">
          Em atraso
          <span class="stat-icon">!</span>
        </div>
        <div class="stat-number">${overdue}</div>
        <div class="stat-note">Precisam de acompanhamento</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Movimentações recentes</h2>
            <p>Últimos empréstimos registrados</p>
          </div>
          <button class="text-button" data-go="loans">
            Ver todos →
          </button>
        </div>

        <div class="activity-list">
          ${
            recent.length
              ? recent.map(l => `
                <div class="activity-item">
                  <div class="activity-icon">⇄</div>
                  <div>
                    <strong>${esc(bookTitle(l.bookId))}</strong>
                    <small>
                      ${esc(readerName(l.readerId))} ·
                      ${fmtDate(l.createdAt)}
                    </small>
                  </div>
                  <span style="margin-left:auto">
                    ${
                      l.returnedAt
                        ? statusBadge('Devolvido')
                        : isOverdue(l)
                          ? statusBadge('Atrasado')
                          : statusBadge('Emprestado')
                    }
                  </span>
                </div>
              `).join('')
              : '<div class="empty">Nenhum empréstimo registrado ainda.</div>'
          }
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Regras da biblioteca</h2>
            <p>Configuração atual do protótipo</p>
          </div>
        </div>

        <div class="rule-list">
          <div class="rule">
            <div>
              <strong>Prazo padrão</strong><br>
              <span>Por empréstimo</span>
            </div>
            <strong>${RULES.loanDays} dias</strong>
          </div>

          <div class="rule">
            <div>
              <strong>Limite por leitor</strong><br>
              <span>Empréstimos simultâneos</span>
            </div>
            <strong>${RULES.maxLoansPerReader} livros</strong>
          </div>

          <div class="rule">
            <div>
              <strong>Disponibilidade</strong><br>
              <span>Somente exemplares livres podem sair</span>
            </div>
            ${statusBadge('Ativo')}
          </div>
        </div>

        <div style="margin-top:18px">
          <button class="primary" data-go="loans">
            Registrar empréstimo
          </button>
        </div>
      </section>
    </div>
  `;
}

function tableShell(title, desc, toolbar, headers, rows, empty) {
  return `
    <section class="table-panel">
      <div class="section-head">
        <div>
          <h2>${title}</h2>
          <p style="color:var(--muted);font-size:13px;margin:6px 0 0">
            ${desc}
          </p>
        </div>
      </div>

      <div class="toolbar">${toolbar}</div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${
              rows ||
              `<tr><td colspan="${headers.length}">
                <div class="empty">${empty}</div>
              </td></tr>`
            }
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function searchToolbar(placeholder, filterOptions = '') {
  return `
    <input
      class="search"
      id="searchInput"
      value="${esc(query)}"
      placeholder="${placeholder}"
      aria-label="Buscar"
    >
    ${
      filterOptions
        ? `<select class="filter" id="filterSelect">${filterOptions}</select>`
        : ''
    }
  `;
}

function booksPage() {
  let list = data.books.filter(b =>
    `${b.title} ${b.author} ${b.isbn} ${b.category}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  if (filter !== 'todos') {
    list = list.filter(b =>
      filter === 'disponiveis'
        ? availableCopies(b.id) > 0
        : availableCopies(b.id) === 0
    );
  }

  const rows = list.map(b => `
    <tr>
      <td>
        <span class="primary-cell">${esc(b.title)}</span>
        <span class="sub-cell">
          ISBN: ${esc(b.isbn || 'não informado')}
        </span>
      </td>
      <td>${esc(b.author)}</td>
      <td>${esc(b.category || '—')}</td>
      <td>${b.copies}</td>
      <td>${availableCopies(b.id)}</td>
      <td>
        ${
          availableCopies(b.id) > 0
            ? statusBadge('Disponível')
            : statusBadge('Emprestado')
        }
      </td>
      <td>
        <div class="actions">
          <button class="action-btn" data-edit="${b.id}">Editar</button>
          <button class="action-btn danger" data-delete="${b.id}">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');

  return tableShell(
    'Catálogo de livros',
    'Cadastre títulos e acompanhe os exemplares.',
    searchToolbar(
      'Buscar por título, autor, ISBN...',
      `
        <option value="todos">Todos os livros</option>
        <option value="disponiveis" ${filter === 'disponiveis' ? 'selected' : ''}>
          Disponíveis
        </option>
        <option value="indisponiveis" ${filter === 'indisponiveis' ? 'selected' : ''}>
          Sem disponibilidade
        </option>
      `
    ),
    [
      'Livro',
      'Autor',
      'Categoria',
      'Exemplares',
      'Disponíveis',
      'Status',
      'Ações'
    ],
    rows,
    'Nenhum livro encontrado.'
  );
}

function readersPage() {
  const list = data.readers.filter(r =>
    `${r.name} ${r.email} ${r.phone}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const rows = list.map(r => `
    <tr>
      <td>
        <span class="primary-cell">${esc(r.name)}</span>
        <span class="sub-cell">${esc(r.email || 'Sem e-mail')}</span>
      </td>
      <td>${esc(r.phone || '—')}</td>
      <td>${activeLoansForReader(r.id)} / ${RULES.maxLoansPerReader}</td>
      <td>${statusBadge(r.status)}</td>
      <td>
        <div class="actions">
          <button class="action-btn" data-edit="${r.id}">Editar</button>
          <button class="action-btn danger" data-delete="${r.id}">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');

  return tableShell(
    'Cadastro de leitores',
    'Gerencie os leitores e veja quantos empréstimos ativos possuem.',
    searchToolbar('Buscar por nome, e-mail ou telefone'),
    ['Leitor', 'Telefone', 'Empréstimos ativos', 'Situação', 'Ações'],
    rows,
    'Nenhum leitor cadastrado.'
  );
}

function loansPage() {
  let list = data.loans.filter(l =>
    `${bookTitle(l.bookId)} ${readerName(l.readerId)}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  if (filter === 'ativos') {
    list = list.filter(l => !l.returnedAt);
  }

  if (filter === 'atrasados') {
    list = list.filter(isOverdue);
  }

  if (filter === 'devolvidos') {
    list = list.filter(l => l.returnedAt);
  }

  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const rows = list.map(l => {
    const status = l.returnedAt
      ? 'Devolvido'
      : isOverdue(l)
        ? 'Atrasado'
        : 'Emprestado';

    return `
      <tr>
        <td>
          <span class="primary-cell">${esc(bookTitle(l.bookId))}</span>
          <span class="sub-cell">Retirada: ${fmtDate(l.createdAt)}</span>
        </td>
        <td>${esc(readerName(l.readerId))}</td>
        <td>${fmtDate(l.dueAt)}</td>
        <td>${l.returnedAt ? fmtDate(l.returnedAt) : '—'}</td>
        <td>${statusBadge(status)}</td>
        <td>
          ${
            !l.returnedAt
              ? `<button class="action-btn" data-return="${l.id}">
                   Registrar devolução
                 </button>`
              : '—'
          }
        </td>
      </tr>
    `;
  }).join('');

  return tableShell(
    'Controle de empréstimos',
    'Prazo padrão de 7 dias · Limite de 3 livros ativos por leitor.',
    searchToolbar(
      'Buscar por livro ou leitor',
      `
        <option value="todos" ${filter === 'todos' ? 'selected' : ''}>Todos</option>
        <option value="ativos" ${filter === 'ativos' ? 'selected' : ''}>Ativos</option>
        <option value="atrasados" ${filter === 'atrasados' ? 'selected' : ''}>Atrasados</option>
        <option value="devolvidos" ${filter === 'devolvidos' ? 'selected' : ''}>Devolvidos</option>
      `
    ),
    [
      'Livro',
      'Leitor',
      'Devolver até',
      'Devolvido em',
      'Status',
      'Ação'
    ],
    rows,
    'Nenhum empréstimo encontrado.'
  );
}

function field(
  name,
  label,
  type = 'text',
  value = '',
  opts = [],
  required = true,
  full = false
) {
  let control = type === 'select'
    ? `
      <select name="${name}" ${required ? 'required' : ''}>
        ${opts.map(o => `
          <option
            value="${esc(o.value)}"
            ${String(o.value) === String(value) ? 'selected' : ''}
          >
            ${esc(o.label)}
          </option>
        `).join('')}
      </select>
    `
    : `
      <input
        name="${name}"
        type="${type}"
        value="${esc(value)}"
        ${required ? 'required' : ''}
        ${type === 'number' ? 'min="0"' : ''}
      >
    `;

  return `
    <div class="field ${full ? 'full' : ''}">
      <label for="f_${name}">
        ${label}${required ? ' *' : ''}
      </label>
      ${
        control
          .replace(`<select name="${name}"`, `<select id="f_${name}" name="${name}"`)
          .replace(`<input name="${name}"`, `<input id="f_${name}" name="${name}"`)
      }
    </div>
  `;
}

function openForm(type, id = null) {
  modalType = type;
  editing = id;

  const obj = id
    ? data[type].find(x => x.id === id)
    : {};

  const fields = $('#modalFields');
  let html = '';

  if (type === 'books') {
    html =
      field('title', 'Título', 'text', obj.title || '', [], true, true) +
      field('author', 'Autor', 'text', obj.author || '') +
      field('isbn', 'ISBN', 'text', obj.isbn || '', [], false) +
      field('category', 'Categoria', 'text', obj.category || '') +
      field('publisher', 'Editora', 'text', obj.publisher || '', [], false) +
      field('year', 'Ano de publicação', 'number', obj.year || '', [], false) +
      field('copies', 'Quantidade de exemplares', 'number', obj.copies ?? 1, [], true);
  } else if (type === 'readers') {
    html =
      field('name', 'Nome completo', 'text', obj.name || '', [], true, true) +
      field('email', 'E-mail', 'email', obj.email || '', [], false) +
      field('phone', 'Telefone', 'tel', obj.phone || '', [], false) +
      field(
        'status',
        'Situação',
        'select',
        obj.status || 'Ativo',
        [
          { value: 'Ativo', label: 'Ativo' },
          { value: 'Inativo', label: 'Inativo' }
        ],
        true,
        true
      );
  } else if (type === 'loans') {
    const available = data.books.filter(
      b => availableCopies(b.id) > 0
    );

    const readers = data.readers.filter(
      r =>
        r.status === 'Ativo' &&
        activeLoansForReader(r.id) < RULES.maxLoansPerReader
    );

    html = available.length
      ? field(
          'bookId',
          'Livro / exemplar',
          'select',
          available[0].id,
          available.map(b => ({
            value: b.id,
            label: `${b.title} (${availableCopies(b.id)} disponível(is)`
          })),
          true,
          true
        )
      : '<div class="field full"><p class="error">Não há exemplares disponíveis para empréstimo.</p></div>';

    html += readers.length
      ? field(
          'readerId',
          'Leitor',
          'select',
          readers[0].id,
          readers.map(r => ({
            value: r.id,
            label: `${r.name} (${activeLoansForReader(r.id)}/${RULES.maxLoansPerReader} empréstimos)`
          })),
          true,
          true
        )
      : '<div class="field full"><p class="error">Não há leitores ativos elegíveis. Verifique o cadastro e o limite de empréstimos.</p></div>';

    html +=
      field('createdAt', 'Data do empréstimo', 'date', today(), [], true) +
      field('dueAt', 'Data prevista de devolução', 'date', plusDays(today(), RULES.loanDays), [], true);
  }

  $('#modalTitle').textContent =
    (id ? 'Editar ' : 'Novo ') +
    ({
      books: 'livro',
      readers: 'leitor',
      loans: 'empréstimo'
    })[type];

  fields.innerHTML = html;
  $('#formError').textContent = '';
  $('#modal').showModal();
}

function closeForm() {
  $('#modal').close();
  editing = null;
  modalType = null;
}

$('#navigation').addEventListener('click', e => {
  const b = e.target.closest('[data-page]');

  if (b) {
    page = b.dataset.page;
    query = '';
    filter = 'todos';
    render();
  }
});

$('#quickAdd').addEventListener('click', () => {
  openForm(
    page === 'books'
      ? 'books'
      : page === 'readers'
        ? 'readers'
        : page === 'loans'
          ? 'loans'
          : 'books'
  );
});

$('#pageContent').addEventListener('click', e => {
  const go = e.target.closest('[data-go]');

  if (go) {
    page = go.dataset.go;
    query = '';
    render();
    return;
  }

  const edit = e.target.closest('[data-edit]');

  if (edit) {
    openForm(page, edit.dataset.edit);
    return;
  }

  const del = e.target.closest('[data-delete]');

  if (del) {
    const type = page;
    const id = del.dataset.delete;

    if (
      type === 'books' &&
      data.loans.some(l => l.bookId === id)
    ) {
      showToast('Este livro tem histórico de empréstimos e não pode ser excluído.');
      return;
    }

    if (
      type === 'readers' &&
      data.loans.some(l => l.readerId === id)
    ) {
      showToast('Este leitor tem histórico de empréstimos e não pode ser excluído.');
      return;
    }

    if (confirm('Tem certeza que deseja excluir este cadastro?')) {
      data[type] = data[type].filter(x => x.id !== id);
      save();
      render();
      showToast('Cadastro excluído.');
    }

    return;
  }

  const ret = e.target.closest('[data-return]');

  if (ret) {
    const loan = data.loans.find(
      l => l.id === ret.dataset.return
    );

    if (loan && !loan.returnedAt) {
      loan.returnedAt = today();
      save();
      render();
      showToast('Devolução registrada com sucesso.');
    }
  }
});

$('#pageContent').addEventListener('input', e => {
  if (e.target.id === 'searchInput') {
    query = e.target.value;

    const pos = e.target.selectionStart;

    render();

    const el = $('#searchInput');
    el.focus();
    el.setSelectionRange(pos, pos);
  }
});

$('#pageContent').addEventListener('change', e => {
  if (e.target.id === 'filterSelect') {
    filter = e.target.value;
    render();
  }
});

$('#modalForm').addEventListener('submit', e => {
  e.preventDefault();

  const form = new FormData(e.currentTarget);
  const obj = Object.fromEntries(form.entries());

  $('#formError').textContent = '';

  if (modalType === 'books') {
    obj.copies = Number(obj.copies);
    obj.year = obj.year ? Number(obj.year) : null;

    if (obj.copies < 1) {
      $('#formError').textContent = 'Cadastre pelo menos um exemplar.';
      return;
    }

    if (
      data.books.some(
        b =>
          b.isbn &&
          obj.isbn &&
          b.isbn === obj.isbn &&
          b.id !== editing
      )
    ) {
      $('#formError').textContent = 'Já existe um livro cadastrado com este ISBN.';
      return;
    }
  }

  if (modalType === 'loans') {
    const book = data.books.find(b => b.id === obj.bookId);
    const reader = data.readers.find(r => r.id === obj.readerId);

    if (!book || !reader) {
      $('#formError').textContent = 'Selecione um livro e um leitor válidos.';
      return;
    }

    if (availableCopies(book.id) < 1) {
      $('#formError').textContent = 'Este livro não possui exemplar disponível.';
      return;
    }

    if (reader.status !== 'Ativo') {
      $('#formError').textContent = 'O leitor não está ativo.';
      return;
    }

    if (
      activeLoansForReader(reader.id) >=
      (editing
        ? RULES.maxLoansPerReader + 1
        : RULES.maxLoansPerReader)
    ) {
      $('#formError').textContent =
        `O limite é de ${RULES.maxLoansPerReader} empréstimos ativos por leitor.`;
      return;
    }

    if (obj.dueAt < obj.createdAt) {
      $('#formError').textContent =
        'A devolução prevista não pode ser anterior ao empréstimo.';
      return;
    }

    obj.returnedAt = null;
    obj.id = uid();

    data.loans.push(obj);
    save();
    closeForm();

    page = 'loans';
    query = '';
    filter = 'todos';

    render();
    showToast('Empréstimo registrado. Prazo padrão: 7 dias.');
    return;
  }

  if (editing) {
    const index = data[modalType].findIndex(
      x => x.id === editing
    );

    data[modalType][index] = {
      ...data[modalType][index],
      ...obj
    };
  } else {
    obj.id = uid();

    if (modalType === 'loans') {
      obj.returnedAt = null;
    }

    data[modalType].push(obj);
  }

  save();
  closeForm();
  render();
  showToast('Cadastro salvo com sucesso.');
});

$('#closeModal').addEventListener('click', closeForm);
$('#cancelModal').addEventListener('click', closeForm);

$('#modal').addEventListener('click', e => {
  if (e.target === $('#modal')) {
    closeForm();
  }
});

render();