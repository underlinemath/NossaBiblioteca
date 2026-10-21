import requests
API_TOKEN = "COLE_SEU_TOKEN_LOCALMENTE"
HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}"
}
API_CATALOGO = "https://x8ki-letl-twmt.n7.xano.io/api:nossabiblioteca-catalogo"
import streamlit as st
from datetime import date, timedelta

st.set_page_config(
    page_title="NossaBiblioteca",
    page_icon="📚",
    layout="wide"
)

if "livros" not in st.session_state:
    st.session_state.livros = [
        {"id": 1, "titulo": "Dom Casmurro", "autor": "Machado de Assis", "categoria": "Romance", "isbn": "978000000001"},
        {"id": 2, "titulo": "O Pequeno Príncipe", "autor": "Antoine de Saint-Exupéry", "categoria": "Literatura", "isbn": "978000000002"},
        {"id": 3, "titulo": "1984", "autor": "George Orwell", "categoria": "Ficção", "isbn": "978000000003"},
    ]

if "leitores" not in st.session_state:
    st.session_state.leitores = [
        {"id": 1, "nome": "Ana Silva", "email": "ana@email.com", "telefone": "(11) 99999-0001"},
        {"id": 2, "nome": "Pedro Santos", "email": "pedro@email.com", "telefone": "(11) 99999-0002"},
    ]

if "categorias" not in st.session_state:
    st.session_state.categorias = ["Romance", "Literatura", "Ficção", "Tecnologia"]

if "exemplares" not in st.session_state:
    st.session_state.exemplares = [
        {"codigo": "EX001", "livro_id": 1, "situacao": "Disponível"},
        {"codigo": "EX002", "livro_id": 2, "situacao": "Disponível"},
        {"codigo": "EX003", "livro_id": 3, "situacao": "Disponível"},
    ]

if "emprestimos" not in st.session_state:
    st.session_state.emprestimos = []

if "reservas" not in st.session_state:
    st.session_state.reservas = []

st.sidebar.title("📚 NossaBiblioteca")
st.sidebar.caption("Sistema de gerenciamento")
pagina = st.sidebar.radio(
    "Navegação",
    [
        "Painel inicial",
        "Livros",
        "Categorias",
        "Leitores",
        "Exemplares",
        "Empréstimos",
        "Devoluções",
        "Reservas",
    ]
)

st.title("📚 NossaBiblioteca")
st.caption("Sistema de gerenciamento de biblioteca")
st.divider()

livros = st.session_state.livros
leitores = st.session_state.leitores
emprestimos = st.session_state.emprestimos
reservas = st.session_state.reservas
exemplares = st.session_state.exemplares

def nome_livro(livro_id):
    for livro in livros:
        if livro["id"] == livro_id:
            return livro["titulo"]
    return "Livro não encontrado"

if pagina == "Painel inicial":
    st.subheader("Painel inicial")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Livros cadastrados", len(livros))
    c2.metric("Leitores cadastrados", len(leitores))
    c3.metric("Empréstimos ativos", sum(e["status"] == "Ativo" for e in emprestimos))
    c4.metric("Reservas", len(reservas))

    st.subheader("Acervo disponível")
    st.dataframe(
        [
            {
                "Título": livro["titulo"],
                "Autor": livro["autor"],
                "Categoria": livro["categoria"],
            }
            for livro in livros
        ],
        use_container_width=True,
        hide_index=True
    )

    st.info("Este protótipo utiliza dados fictícios mantidos durante a sessão.")


elif pagina == "Livros":
    st.subheader("Gerenciamento de livros")

    with st.expander("➕ Cadastrar livro", expanded=False):
        with st.form("form_livro_xano", clear_on_submit=True):
            titulo = st.text_input("Título")
            autor = st.text_input("Autor")
            isbn = st.text_input("ISBN")
            descricao = st.text_area("Descrição")

            cadastrar = st.form_submit_button("Cadastrar livro")

            if cadastrar:
                if not titulo.strip() or not autor.strip():
                    st.error("Preencha o título e o autor.")
                else:
                    try:
                        resposta = requests.post(
    f"{API_CATALOGO}/livros",
    headers=HEADERS,
    json={
        "titulo": titulo.strip(),
        "autor": autor.strip(),
        "isbn": isbn.strip(),
        "descricao": descricao.strip(),
    },
    timeout=15,
)

                        if resposta.status_code in (200, 201):
                            st.success("Livro cadastrado no Xano!")
                            st.rerun()
                        else:
                            st.error(
                                f"Erro ao cadastrar: HTTP {resposta.status_code}"
                            )
                            st.code(resposta.text[:1000])

                    except requests.RequestException as erro:
                        st.error(f"Não foi possível conectar ao Xano: {erro}")

    busca = st.text_input("Pesquisar por título ou autor")

    try:
        resposta = requests.get(
            f"{API_CATALOGO}/livros",
            params={"Busca": busca, "page": 1},
            timeout=15,
        )
        resposta.raise_for_status()
        resultado = resposta.json()

        lista_livros = (
            resultado.get("items", [])
            if isinstance(resultado, dict)
            else resultado
        )

        st.dataframe(
            [
                {
                    "ID": livro.get("id"),
                    "Título": livro.get("titulo", ""),
                    "Autor": livro.get("autor", ""),
                    "ISBN": livro.get("isbn", ""),
                    "Descrição": livro.get("descricao", ""),
                }
                for livro in lista_livros
            ],
            use_container_width=True,
            hide_index=True,
        )

        if not lista_livros:
            st.info("Nenhum livro encontrado no Xano.")

    except (requests.RequestException, ValueError) as erro:
        st.error(f"Erro ao consultar livros no Xano: {erro}")

elif pagina == "Categorias":
    st.subheader("Gerenciamento de categorias")
    with st.form("form_categoria", clear_on_submit=True):
        categoria = st.text_input("Nome da categoria")
        adicionar = st.form_submit_button("Adicionar categoria")
        if adicionar:
            if not categoria.strip():
                st.error("Digite o nome da categoria.")
            elif categoria.strip() in st.session_state.categorias:
                st.warning("Essa categoria já existe.")
            else:
                st.session_state.categorias.append(categoria.strip())
                st.success("Categoria adicionada.")
                st.rerun()

    st.dataframe(
        [{"Categoria": c} for c in st.session_state.categorias],
        use_container_width=True,
        hide_index=True
    )

elif pagina == "Leitores":
    st.subheader("Gerenciamento de leitores")
    with st.form("form_leitor", clear_on_submit=True):
        nome = st.text_input("Nome completo")
        email = st.text_input("E-mail")
        telefone = st.text_input("Telefone")
        cadastrar = st.form_submit_button("Cadastrar leitor")
        if cadastrar:
            if not nome.strip() or not email.strip():
                st.error("Preencha o nome e o e-mail.")
            elif any(l["email"].lower() == email.strip().lower() for l in leitores):
                st.error("Este e-mail já está cadastrado.")
            else:
                novo_id = max([l["id"] for l in leitores], default=0) + 1
                leitores.append({
                    "id": novo_id,
                    "nome": nome.strip(),
                    "email": email.strip(),
                    "telefone": telefone.strip(),
                })
                st.success("Leitor cadastrado.")
                st.rerun()

    st.dataframe(leitores, use_container_width=True, hide_index=True)

elif pagina == "Exemplares":
    st.subheader("Gerenciamento de exemplares")
    if not livros:
        st.warning("Cadastre um livro primeiro.")
    else:
        opcoes = {f'{l["id"]} — {l["titulo"]}': l["id"] for l in livros}
        with st.form("form_exemplar", clear_on_submit=True):
            livro_escolhido = st.selectbox("Livro", list(opcoes))
            codigo = st.text_input("Código do exemplar")
            situacao = st.selectbox("Situação", ["Disponível", "Em manutenção"])
            cadastrar = st.form_submit_button("Cadastrar exemplar")
            if cadastrar:
                if not codigo.strip():
                    st.error("Informe o código do exemplar.")
                elif any(e["codigo"] == codigo.strip() for e in exemplares):
                    st.error("Este código já existe.")
                else:
                    exemplares.append({
                        "codigo": codigo.strip(),
                        "livro_id": opcoes[livro_escolhido],
                        "situacao": situacao,
                    })
                    st.success("Exemplar cadastrado.")
                    st.rerun()

    st.dataframe(
        [
            {
                "Código": ex["codigo"],
                "Livro": nome_livro(ex["livro_id"]),
                "Situação": ex["situacao"],
            }
            for ex in exemplares
        ],
        use_container_width=True,
        hide_index=True
    )

elif pagina == "Empréstimos":
    st.subheader("Registrar empréstimo")
    disponiveis = [
        ex for ex in exemplares
        if ex["situacao"] == "Disponível"
        and not any(
            e["exemplar_codigo"] == ex["codigo"] and e["status"] == "Ativo"
            for e in emprestimos
        )
    ]

    if not leitores:
        st.warning("Cadastre um leitor primeiro.")
    elif not disponiveis:
        st.warning("Não há exemplares disponíveis para empréstimo.")
    else:
        leitores_opcoes = {
            f'{l["id"]} — {l["nome"]}': l["id"] for l in leitores
        }
        exemplares_opcoes = {
            f'{ex["codigo"]} — {nome_livro(ex["livro_id"])}': ex["codigo"]
            for ex in disponiveis
        }
        with st.form("form_emprestimo"):
            leitor = st.selectbox("Leitor", list(leitores_opcoes))
            exemplar = st.selectbox("Exemplar", list(exemplares_opcoes))
            data_emprestimo = st.date_input("Data do empréstimo", value=date.today())
            registrar = st.form_submit_button("Registrar empréstimo")
            if registrar:
                emprestimos.append({
                    "id": max([e["id"] for e in emprestimos], default=0) + 1,
                    "leitor_id": leitores_opcoes[leitor],
                    "exemplar_codigo": exemplares_opcoes[exemplar],
                    "livro_id": next(
                        ex["livro_id"] for ex in exemplares
                        if ex["codigo"] == exemplares_opcoes[exemplar]
                    ),
                    "data": data_emprestimo,
                    "prevista": data_emprestimo + timedelta(days=7),
                    "status": "Ativo",
                })
                st.success("Empréstimo registrado. Prazo padrão: 7 dias.")
                st.rerun()

    st.subheader("Histórico de empréstimos")
    st.dataframe(
        [
            {
                "ID": e["id"],
                "Leitor": next(
                    (l["nome"] for l in leitores if l["id"] == e["leitor_id"]),
                    "Leitor não encontrado",
                ),
                "Livro": nome_livro(e["livro_id"]),
                "Exemplar": e["exemplar_codigo"],
                "Data": e["data"],
                "Devolução prevista": e["prevista"],
                "Situação": e["status"],
            }
            for e in emprestimos
        ],
        use_container_width=True,
        hide_index=True
    )

elif pagina == "Devoluções":
    st.subheader("Registrar devolução")
    ativos = [e for e in emprestimos if e["status"] == "Ativo"]
    if not ativos:
        st.info("Não há empréstimos ativos.")
    else:
        opcoes = {
            f'Empréstimo {e["id"]} — {nome_livro(e["livro_id"])} — {e["exemplar_codigo"]}': e["id"]
            for e in ativos
        }
        escolhido = st.selectbox("Empréstimo", list(opcoes))
        if st.button("Confirmar devolução"):
            emprestimo_id = opcoes[escolhido]
            for e in emprestimos:
                if e["id"] == emprestimo_id:
                    e["status"] = "Devolvido"
                    e["data_devolucao"] = date.today()
            st.success("Devolução registrada.")
            st.rerun()

    devolvidos = [e for e in emprestimos if e["status"] == "Devolvido"]
    if devolvidos:
        st.subheader("Devoluções realizadas")
        st.dataframe(
            [
                {
                    "Livro": nome_livro(e["livro_id"]),
                    "Exemplar": e["exemplar_codigo"],
                    "Data da devolução": e["data_devolucao"],
                }
                for e in devolvidos
            ],
            use_container_width=True,
            hide_index=True
        )

elif pagina == "Reservas":
    st.subheader("Gerenciamento de reservas")
    if not leitores or not livros:
        st.warning("Cadastre leitores e livros antes de criar reservas.")
    else:
        leitores_opcoes = {
            f'{l["id"]} — {l["nome"]}': l["id"] for l in leitores
        }
        livros_opcoes = {
            f'{l["id"]} — {l["titulo"]}': l["id"] for l in livros
        }
        with st.form("form_reserva", clear_on_submit=True):
            leitor = st.selectbox("Leitor", list(leitores_opcoes))
            livro = st.selectbox("Livro", list(livros_opcoes))
            data_reserva = st.date_input("Data da reserva", value=date.today())
            registrar = st.form_submit_button("Registrar reserva")
            if registrar:
                reservas.append({
                    "id": max([r["id"] for r in reservas], default=0) + 1,
                    "leitor_id": leitores_opcoes[leitor],
                    "livro_id": livros_opcoes[livro],
                    "data": data_reserva,
                    "status": "Pendente",
                })
                st.success("Reserva registrada.")
                st.rerun()

    st.dataframe(
        [
            {
                "ID": r["id"],
                "Leitor": next(
                    (l["nome"] for l in leitores if l["id"] == r["leitor_id"]),
                    "Leitor não encontrado",
                ),
                "Livro": nome_livro(r["livro_id"]),
                "Data": r["data"],
                "Situação": r["status"],
            }
            for r in reservas
        ],
        use_container_width=True,
        hide_index=True
    )

st.divider()
st.caption("NossaBiblioteca • Protótipo acadêmico • Dados fictícios")
