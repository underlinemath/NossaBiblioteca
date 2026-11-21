(() => {
  'use strict';

  const client = window.XanoClient;
  const state = {
    page: 'dashboard', query: '', filter: 'todos',
    books: [], readers: [], loans: [], categories: [], authors: [], copies: [],
    pages: { books: 1, readers: 1, loans: 1, categories: 1, authors: 1, copies: 1 },
    loading: {}, error: {}, identity: null,
    modalType: null, editingId: null
  };
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today = () => new Date().toISOString().slice(0,10);
  const plusDays = (n=7) => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
  const fmtDate = v => v ? new Intl.DateTimeFormat('pt-BR').format(new Date(/^\d{4}-\d{2}-\d{2}/.test(v) ? `${v.slice(0,10)}T12:00:00` : v)) : '—';

  function listPayload(value) {
    if (Array.isArray(value)) return { items: value, current: 1, remaining: 0 };
    if (value?.emprestimos) {
      const loansPayload = listPayload(value.emprestimos);
      return {
        items: loansPayload.items,
        current: loansPayload.current,
        remaining: loansPayload.remaining,
        relations: {
          itens: listPayload(value.itens).items,
          leitores: listPayload(value.leitores).items,
          exemplares: listPayload(value.exemplares).items
        }
      };
    }
    const items = value?.items ?? value?.itemsCurrentPage ?? value?.data ?? [];
    const current = value?.currentPage ?? value?.itemsCurrentPage?.currentPage ?? value?.page?.current ?? 1;
    const remaining = value?.itemsRemainingTotal ?? value?.itemsRemaining ?? value?.total ?? 0;
    return { items: Array.isArray(items) ? items : [], current: Number(current) || 1, remaining: Number(remaining) || 0 };
  }

  function mapBook(r) {
    return { id:r.id, titulo:r.titulo ?? r.title, autor:r.autor ?? r.author ?? '—', autor_ids:r.autor_ids ?? [], isbn:r.isbn,
      categoria_id:r.categoria_id, categoria:r.categoria?.nome ?? r.category?.nome ?? r.categoria_nome ?? r.category_name ?? '—',
      editora:r.editora ?? r.publisher, descricao:r.descricao ?? r.description, ativo:r.ativo !== false };
  }
  function mapReader(r) {
    return { id:r.id, nome:r.nome ?? r.name, email:r.email, telefone:r.telefone ?? r.phone, status:r.status };
  }
  function mapCopy(r) {
    return { id:r.id, livro_id:r.livro_id, codigo:r.codigo ?? r.code, situacao:r.situacao, disponivel:r.disponivel === true };
  }
  function mapCategory(r) { return { id:r.id, nome:r.nome ?? r.name }; }
  function mapAuthor(r) { return { id:r.id, nome:r.nome ?? r.name }; }
  function mapLoan(r) {
    const item = r.item ?? r.itens ?? r.item_emprestimo ?? r;
    const itemObj = Array.isArray(item) ? item[0] : item;
    return {
      id:r.id, itemId:r.item_id ?? r.itemId ?? itemObj?.id ?? r.item_id,
      leitorId:r.leitor_id ?? r.leitor?.id, leitor:r.leitor_nome ?? r.leitor?.nome ?? r.leitor?.name ?? r.reader_name ?? '—',
      bookTitle:r.livro_titulo ?? r.livro?.titulo ?? r.exemplar?.livro?.titulo ?? 'Exemplar',
      copyId:r.item_exemplar_id ?? r.exemplar_id ?? itemObj?.exemplar_id ?? r.exemplar?.id,
      copyCode:r.exemplar_codigo ?? r.exemplar?.codigo ?? r.exemplar_code ?? '—',
      due:r.item_data_prevista ?? r.data_prevista_devolucao ?? itemObj?.data_prevista_devolucao,
      returned:r.item_data_efetiva ?? r.data_efetiva_devolucao ?? itemObj?.data_efetiva_devolucao,
      status:r.item_situacao ?? r.situacao ?? itemObj?.situacao ?? r.status,
      created:r.data_emprestimo ?? r.created_at
    };
  }

  function errorText(error) {
    const labels = {
      400:'Dados inválidos. Confira os campos e tente novamente.',
      401:'Sua sessão expirou. Entre novamente.',
      403:'Você não tem autorização para esta operação.',
      404:'O registro não foi encontrado.',
      409:'Existe um conflito: o registro não pôde ser alterado.',
      0:'Não foi possível conectar ao Xano.'
    };
    return labels[error.status] || error.message || 'Falha ao comunicar com o Xano.';
  }

  function showToast(message, kind='success') {
    const el=$('#toast'); el.textContent=message; el.className=`toast show ${kind}`;
    setTimeout(()=>el.className='toast',3000);
  }

  async function runLoad(key, operation) {
    state.loading[key]=true; delete state.error[key];
    render();
    try { await operation(); } catch (e) { state.error[key]=e; if(e.status===401) showLogin(); }
    finally { state.loading[key]=false; render(); }
  }

  async function loadDashboard() {
    await Promise.all([loadBooks(false), loadReaders(false), loadCopies(false), loadLoans(false)]);
  }
  async function loadBooks(update=true) {
    const op=async()=>{ const r=await client.catalog({busca:state.query||undefined,categoria_id:state.filter==='todos'?undefined:Number(state.filter)||undefined,page:state.pages.books}); const p=listPayload(r); state.books=p.items.map(mapBook); };
    if(update) await runLoad('books',op); else await op();
  }
  async function loadReaders(update=true) {
    const op=async()=>{ const r=await client.readers({busca:state.query||undefined,page:state.pages.readers}); const p=listPayload(r); state.readers=p.items.map(mapReader); };
    if(update) await runLoad('readers',op); else await op();
  }
  async function loadLoans(update=true) {
    const op=async()=> {
      const r=await client.loans({page:state.pages.loans});
      const p=listPayload(r);
      const items=p.relations?.itens ?? [];
      const readers=p.relations?.leitores ?? [];
      const copies=p.relations?.exemplares ?? [];
      state.loans=p.items.map(loan=> {
        const item=items.find(row=>row.emprestimo_id===loan.id);
        const reader=readers.find(row=>row.id===loan.leitor_id);
        const copy=copies.find(row=>row.id===item?.exemplar_id);
        return mapLoan({
          ...loan,
          leitor: reader ? {id:reader.id,nome:reader.nome,email:reader.email} : null,
          item,
          exemplar: copy ? {id:copy.id,codigo:copy.codigo,situacao:copy.situacao,disponivel:copy.disponivel} : null
        });
      });
    };
    if(update) await runLoad('loans',op); else await op();
  }
  async function loadCopies(update=true) {
    const op=async()=>{ const r=await client.copies({livro_id:undefined,page:state.pages.copies}); const p=listPayload(r); state.copies=p.items.map(mapCopy); };
    if(update) await runLoad('copies',op); else await op();
  }
  async function loadCategories(update=true) {
    const op=async()=>{ const r=await client.categories(); state.categories=(Array.isArray(r)?r:(r?.items??r?.itemsCurrentPage??[])).map(mapCategory); };
    if(update) await runLoad('categories',op); else await op();
  }
  async function loadAuthors(update=true) {
    const op=async()=>{ const r=await client.authors({busca:state.query||undefined,page:state.pages.authors}); const p=listPayload(r); state.authors=p.items.map(mapAuthor); };
    if(update) await runLoad('authors',op); else await op();
  }

  function stateView(key, emptyText, retry=()=>loadPage()) {
    if(state.loading[key]) return `<div class="state loading">Carregando dados do Xano…</div>`;
    if(state.error[key]) return `<div class="state error-state"><strong>Não foi possível carregar.</strong><p>${esc(errorText(state.error[key]))}</p><button class="secondary" data-retry="${key}">Tentar novamente</button></div>`;
    return '';
  }

  function badge(text) {
    const t=String(text||'').toLowerCase();
    const cls=t.includes('ativo')||t.includes('dispon')||t.includes('devolv')?'green':t.includes('atras')||t.includes('inativ')?'red':t.includes('emprest')?'amber':'gray';
    return `<span class="badge ${cls}">${esc(text||'—')}</span>`;
  }

  function table(title, desc, toolbar, headers, rows, key, empty) {
    const stateHtml=stateView(key,empty);
    return `<section class="table-panel"><div class="section-head"><div><h2>${title}</h2><p>${desc}</p></div></div><div class="toolbar">${toolbar}</div>${stateHtml || `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${headers.length}"><div class="empty">${empty}</div></td></tr>`}</tbody></table></div>`}</section>`;
  }

  function searchToolbar(placeholder) {
    return `<input class="search" id="searchInput" value="${esc(state.query)}" placeholder="${esc(placeholder)}" aria-label="Buscar"><button class="secondary" data-search>Buscar</button>`;
  }

  function dashboard() {
    const available=state.copies.filter(c=>c.disponivel).length;
    const active=state.loans.filter(l=>!l.returned && String(l.status||'').toLowerCase()!=='devolvido').length;
    const overdue=state.loans.filter(l=>l.due && !l.returned && l.due < today()).length;
    return `<div class="stats">
      <div class="stat-card"><div class="stat-label">Livros ativos</div><div class="stat-number">${state.books.length}</div></div>
      <div class="stat-card"><div class="stat-label">Exemplares disponíveis</div><div class="stat-number">${available}</div></div>
      <div class="stat-card"><div class="stat-label">Empréstimos ativos</div><div class="stat-number">${active}</div></div>
      <div class="stat-card"><div class="stat-label">Em atraso</div><div class="stat-number">${overdue}</div></div>
    </div>${table('Movimentações recentes','Dados retornados pelo Xano','', ['Livro','Leitor','Situação','Devolver até'], state.loans.slice(0,5).map(l=>`<tr><td>${esc(l.bookTitle)}</td><td>${esc(l.leitor)}</td><td>${badge(l.returned?'Devolvido':l.status)}</td><td>${fmtDate(l.due)}</td></tr>`).join(''),'loans','Nenhum empréstimo encontrado.')}`;
  }

  function booksPage() {
    const rows=state.books.map(b=>`<tr><td><span class="primary-cell">${esc(b.titulo)}</span><small>ISBN: ${esc(b.isbn||'—')}</small></td><td>${esc(b.autor)}</td><td>${esc(b.categoria)}</td><td>${esc(b.editora||'—')}</td><td>${b.ativo?badge('Ativo'):badge('Inativo')}</td><td><div class="actions"><button class="action-btn" data-edit="${b.id}">Editar</button><button class="action-btn danger" data-delete="${b.id}">Excluir</button></div></td></tr>`).join('');
    return table('Catálogo de livros','Livros ativos retornados pela API pública',searchToolbar('Buscar por título, autor ou ISBN'),['Livro','Autor','Categoria','Editora','Situação','Ações'],rows,'books','Nenhum livro encontrado.');
  }
  function categoriesPage() {
    const rows=state.categories.map(c=>`<tr><td>${esc(c.nome)}</td><td><div class="actions"><button class="action-btn" data-edit="${c.id}">Editar</button><button class="action-btn danger" data-delete="${c.id}">Excluir</button></div></td></tr>`).join('');
    return table('Categorias','Cadastro administrativo',searchToolbar('Buscar categoria'),['Nome','Ações'],rows,'categories','Nenhuma categoria encontrada.');
  }
  function authorsPage() {
    const rows=state.authors.map(a=>`<tr><td>${esc(a.nome)}</td><td><div class="actions"><button class="action-btn" data-edit="${a.id}">Editar</button><button class="action-btn danger" data-delete="${a.id}">Excluir</button></div></td></tr>`).join('');
    return table('Autores','Autores relacionados aos livros',searchToolbar('Buscar autor'),['Nome','Ações'],rows,'authors','Nenhum autor encontrado.');
  }
  function readersPage() {
    const rows=state.readers.map(r=>`<tr><td><span class="primary-cell">${esc(r.nome)}</span><small>${esc(r.email)}</small></td><td>${esc(r.telefone||'—')}</td><td>${badge(r.status)}</td><td><div class="actions"><button class="action-btn" data-edit="${r.id}">Editar</button><button class="action-btn danger" data-delete="${r.id}">Excluir</button></div></td></tr>`).join('');
    return table('Leitores','Cadastro administrativo',searchToolbar('Buscar por nome ou e-mail'),['Leitor','Telefone','Situação','Ações'],rows,'readers','Nenhum leitor encontrado.');
  }
  function copiesPage() {
    const rows=state.copies.map(c=>`<tr><td>${esc(c.codigo)}</td><td>${esc(state.books.find(b=>b.id===c.livro_id)?.titulo||`Livro #${c.livro_id}`)}</td><td>${badge(c.disponivel?'Disponível':c.situacao)}</td><td><div class="actions"><button class="action-btn" data-edit="${c.id}">Editar</button><button class="action-btn danger" data-delete="${c.id}">Excluir</button></div></td></tr>`).join('');
    return table('Exemplares','Disponibilidade controlada pelo Xano',searchToolbar('Código do exemplar'),['Código','Livro','Situação','Ações'],rows,'copies','Nenhum exemplar encontrado.');
  }
  function loansPage() {
    const rows=state.loans.map(l=>`<tr><td><span class="primary-cell">${esc(l.bookTitle)}</span><small>Código: ${esc(l.copyCode)}</small></td><td>${esc(l.leitor)}</td><td>${fmtDate(l.due)}</td><td>${l.returned?fmtDate(l.returned):'—'}</td><td>${badge(l.returned?'Devolvido':l.status)}</td><td>${l.returned?'—':`<button class="action-btn" data-return="${l.itemId||l.id}">Registrar devolução</button>`}</td></tr>`).join('');
    return table('Empréstimos','Empréstimos e devoluções',searchToolbar('Buscar por livro ou leitor'),['Livro','Leitor','Devolver até','Devolvido em','Status','Ação'],rows,'loans','Nenhum empréstimo encontrado.');
  }

  function render() {
    const titles={dashboard:'Painel inicial',books:'Livros e exemplares',authors:'Autores',categories:'Categorias',copies:'Exemplares',readers:'Leitores',loans:'Empréstimos e devoluções'};
    $('#pageTitle').textContent=titles[state.page];
    document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===state.page));
    const quick={dashboard:'＋ Novo livro',books:'＋ Novo livro',authors:'＋ Novo autor',categories:'＋ Nova categoria',copies:'＋ Novo exemplar',readers:'＋ Novo leitor',loans:'＋ Novo empréstimo'};
    $('#quickAdd').textContent=quick[state.page];
    const content=$('#pageContent');
    content.innerHTML=state.page==='dashboard'?dashboard():state.page==='books'?booksPage():state.page==='authors'?authorsPage():state.page==='categories'?categoriesPage():state.page==='copies'?copiesPage():state.page==='readers'?readersPage():loansPage();
  }

  async function loadPage() {
    if(state.page==='dashboard') await runLoad('dashboard',loadDashboard);
    if(state.page==='books') await loadBooks();
    if(state.page==='readers') await loadReaders();
    if(state.page==='loans') await loadLoans();
    if(state.page==='copies') await loadCopies();
    if(state.page==='authors') await loadAuthors();
    if(state.page==='categories') await loadCategories();
  }

  function field(name,label,type='text',value='',options=[],required=true,full=false) {
    let control;
    if(type==='select') control=`<select id="f_${name}" name="${name}" ${required?'required':''}>${options.map(o=>`<option value="${esc(o.value)}" ${String(o.value)==String(value)?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`;
    else control=`<input id="f_${name}" name="${name}" type="${type}" value="${esc(value)}" ${required?'required':''}>`;
    return `<div class="field ${full?'full':''}"><label for="f_${name}">${label}${required?' *':''}</label>${control}</div>`;
  }

  async function openForm(type,id=null) {
    state.modalType=type; state.editingId=id;
    let html='', title='';
    if(type==='categories'||type==='authors') {
      await (type==='categories'?loadCategories(false):loadAuthors(false));
      const obj=(type==='categories'?state.categories:state.authors).find(x=>x.id==id)||{};
      title=(id?'Editar ':'Nova ')+(type==='categories'?'categoria':'autor');
      html=field('nome','Nome','text',obj.nome||'',[],true,true);
    } else if(type==='books') {
      await Promise.all([loadCategories(false),loadAuthors(false)]);
      const obj=state.books.find(x=>x.id==id)||{};
      title=(id?'Editar ':'Novo ')+'livro';
      html=field('titulo','Título','text',obj.titulo||'',[],true,true)+
        field('autor','Autor legado','text',obj.autor==='—'?'':(obj.autor||''),[],true)+
        field('autor_ids','Autor relacionado','select',obj.autor_ids?.[0]||'',state.authors.map(a=>({value:a.id,label:a.nome})),false)+
        field('isbn','ISBN','text',obj.isbn||'',[],true)+
        field('categoria_id','Categoria','select',obj.categoria_id||'',state.categories.map(c=>({value:c.id,label:c.nome})),true)+
        field('editora','Editora','text',obj.editora||'',[],false)+field('descricao','Descrição','text',obj.descricao||'',[],false,true)+field('ativo','Situação','select',obj.ativo===false?'false':'true',[{value:'true',label:'Ativo'},{value:'false',label:'Inativo'}],true,true);
    } else if(type==='readers') {
      const obj=state.readers.find(x=>x.id==id)||{};
      title=(id?'Editar ':'Novo ')+'leitor';
      html=field('nome','Nome','text',obj.nome||'',[],true,true)+field('email','E-mail','email',obj.email||'',[],true)+field('telefone','Telefone','tel',obj.telefone||'',[],false)+
        (!id?field('senha','Senha','password','',[],true,true):'')+field('status','Situação','select',obj.status||'ativo',[{value:'ativo',label:'Ativo'},{value:'inativo',label:'Inativo'}],true,true);
    } else if(type==='copies') {
      await loadBooks(false);
      const obj=state.copies.find(x=>x.id==id)||{};
      title=(id?'Editar ':'Novo ')+'exemplar';
      html=field('livro_id','Livro','select',obj.livro_id||'',state.books.map(b=>({value:b.id,label:b.titulo})),true,true)+field('codigo','Código','text',obj.codigo||'',[],true,true)+field('situacao','Situação','select',obj.situacao||'disponivel',[{value:'disponivel',label:'Disponível'},{value:'emprestado',label:'Emprestado'},{value:'manutencao',label:'Manutenção'}],true)+field('disponivel','Disponível','select',obj.disponivel===false?'false':'true',[{value:'true',label:'Sim'},{value:'false',label:'Não'}],true);
    } else if(type==='loans') {
      await Promise.all([loadCopies(false),loadReaders(false),loadLoans(false)]);
      const avail=state.copies.filter(c=>c.disponivel);
      const active=state.readers.filter(r=>String(r.status).toLowerCase()==='ativo');
      title='Novo empréstimo';
      html=field('exemplar_id','Exemplar','select','',avail.map(c=>({value:c.id,label:`${c.codigo} — ${state.books.find(b=>b.id===c.livro_id)?.titulo||`Livro #${c.livro_id}`}`})),true,true)+
        field('leitor_id','Leitor','select','',active.map(r=>({value:r.id,label:r.nome})),true,true)+field('data_prevista_devolucao','Devolução prevista','date',plusDays(7),[],true,true);
    }
    $('#modalTitle').textContent=title; $('#modalFields').innerHTML=html; $('#formError').textContent=''; $('#modal').showModal();
  }

  function closeForm(){ $('#modal').close(); state.modalType=null; state.editingId=null; }

  async function mutate(operation,message) {
    $('#formError').textContent='';
    try { await operation(); closeForm(); showToast(message); await loadPage(); }
    catch(e){ $('#formError').textContent=errorText(e); if(e.status===401) showLogin(); }
  }

  $('#modalForm').addEventListener('submit',async e=>{
    e.preventDefault(); const f=Object.fromEntries(new FormData(e.currentTarget).entries()); const id=state.editingId; const type=state.modalType;
    if(type==='categories'||type==='authors') {
      await mutate(()=>id?(type==='categories'?client.updateCategory(id,{nome:f.nome}):client.updateAuthor(id,{nome:f.nome})):(type==='categories'?client.createCategory({nome:f.nome}):client.createAuthor({nome:f.nome})), 'Cadastro salvo no Xano.');
    } else if(type==='books') {
      const body={categoria_id:Number(f.categoria_id),titulo:f.titulo,autor:f.autor,isbn:f.isbn,descricao:f.descricao||undefined,editora:f.editora||undefined,ativo:f.ativo==='true'};
      if(!id) body.autor_ids=f.autor_ids? [Number(f.autor_ids)] : undefined;
      await mutate(()=>id?client.updateBook(id,body):client.createBook(body),'Livro salvo no Xano.');
    } else if(type==='readers') {
      const body={nome:f.nome,email:f.email,telefone:f.telefone||undefined,status:f.status};
      if(!id) body.senha=f.senha;
      await mutate(()=>id?client.updateReader(id,body):client.createReader(body),'Leitor salvo no Xano.');
    } else if(type==='copies') {
      const body={livro_id:Number(f.livro_id),codigo:f.codigo,situacao:f.situacao,disponivel:f.disponivel==='true'};
      await mutate(()=>id?client.updateCopy(id,body):client.createCopy(body),'Exemplar salvo no Xano.');
    } else if(type==='loans') {
      await mutate(()=>client.createLoan({leitor_id:Number(f.leitor_id),exemplar_id:Number(f.exemplar_id),data_prevista_devolucao:f.data_prevista_devolucao}), 'Empréstimo registrado no Xano.');
    }
  });

  async function confirmDelete(type,id) {
    if(!confirm('Confirmar exclusão ou inativação deste registro?')) return;
    try {
      if(type==='categories') await client.deleteCategory(id);
      if(type==='authors') await client.deleteAuthor(id);
      if(type==='books') await client.deleteBook(id);
      if(type==='readers') await client.deleteReader(id);
      if(type==='copies') await client.deleteCopy(id);
      showToast('Operação confirmada pelo Xano.');
      await loadPage();
    } catch(e){ showToast(errorText(e),'error'); if(e.status===401) showLogin(); }
  }

  $('#navigation').addEventListener('click',e=>{ const b=e.target.closest('[data-page]'); if(!b)return; state.page=b.dataset.page; state.query=''; loadPage(); });
  $('#quickAdd').addEventListener('click',()=>openForm(state.page==='dashboard'?'books':state.page));
  $('#pageContent').addEventListener('click',async e=>{
    const edit=e.target.closest('[data-edit]'); if(edit) return openForm(state.page,Number(edit.dataset.edit));
    const del=e.target.closest('[data-delete]'); if(del) return confirmDelete(state.page,Number(del.dataset.delete));
    const ret=e.target.closest('[data-return]'); if(ret){ if(!confirm('Confirmar a devolução deste item?')) return; try{await client.returnItem(Number(ret.dataset.return),{data_efetiva_devolucao:today()}); showToast('Devolução confirmada pelo Xano.'); await loadPage();}catch(err){showToast(errorText(err),'error'); if(err.status===401)showLogin();}}
    if(e.target.closest('[data-retry]')) loadPage();
  });
  $('#pageContent').addEventListener('click',e=>{ if(e.target.closest('[data-search]') || e.target.id==='searchInput' && e.key==='Enter'){ state.query=$('#searchInput').value; loadPage(); }});
  $('#pageContent').addEventListener('keydown',e=>{ if(e.target.id==='searchInput' && e.key==='Enter'){ e.preventDefault(); state.query=e.target.value; loadPage(); }});
  $('#closeModal').addEventListener('click',closeForm); $('#cancelModal').addEventListener('click',closeForm);
  $('#modal').addEventListener('click',e=>{ if(e.target===$('#modal')) closeForm(); });

  function showLogin() {
    client.clearToken(); $('#loginScreen').hidden=false; $('#appMain').hidden=true; $('#sessionStatus').textContent='Xano não autenticado';
  }
  function showApp(identity){
    state.identity=identity; $('#loginScreen').hidden=true; $('#appMain').hidden=false; $('#sessionStatus').textContent=identity?.nome?`Conectado: ${identity.nome}`:'Sessão autenticada';
  }
  $('#loginForm').addEventListener('submit',async e=>{
    e.preventDefault(); const f=new FormData(e.currentTarget); $('#loginError').textContent='';
    try { const user=await client.login(f.get('email'),f.get('senha')); const me=await client.me(); showApp(me||user); e.currentTarget.reset(); await loadPage(); }
    catch(err){ $('#loginError').textContent=errorText(err); }
  });
  $('#logoutButton').addEventListener('click',()=>{client.logout(); showLogin();});
  window.addEventListener('xano:unauthorized',showLogin);

  async function start(){
    if(client.hasSession){
      try{const me=await client.me();showApp(me);await loadPage();}
      catch(e){showLogin();}
    } else showLogin();
  }
  start();
})();
