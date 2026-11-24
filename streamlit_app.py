import base64
from datetime import date, timedelta
from pathlib import Path

import streamlit as st


st.set_page_config(
    page_title="NossaBiblioteca",
    page_icon="📚",
    layout="wide",
)


ROOT = Path(__file__).resolve().parent
CSS_PATH = ROOT / "assets" / "interface.css"
BACKGROUND_PATH = ROOT / "assets" / "biblioteca-fundo.png"

PAGES = [
    "Painel inicial",
    "Livros",
    "Categorias",
    "Leitores",
    "Exemplares",
    "Empréstimos",
    "Devoluções",
    "Reservas",
]


def image_data_uri(path):
    if not path.exists():
        return ""
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"url('data:image/png;base64,{encoded}')"


def apply_theme(theme):
    css = CSS_PATH.read_text(encoding="utf-8")
    background = image_data_uri(BACKGROUND_PATH)

    if theme == "Claro":
        colors = {
            "LIBRARY_BG": background,
            "PAGE_OVERLAY": "rgba(245, 239, 222, 0.72)",
            "GLASS_BG": "rgba(255, 250, 238, 0.82)",
            "GLASS_STRONG": "rgba(255, 250, 238, 0.94)",
            "TEXT_COLOR": "#26352a",
            "MUTED_COLOR": "#647263",
            "BORDER_COLOR": "rgba(111, 91, 53, 0.22)",
            "INPUT_BG": "rgba(255, 255, 248, 0.92)",
            "SHADOW_COLOR": "rgba(35, 45, 30, 0.12)",
        }
    else:
        colors = {
            "LIBRARY_BG": background,
            "PAGE_OVERLAY": "rgba(10, 19, 13, 0.78)",
            "GLASS_BG": "rgba(20, 31, 24, 0.84)",
            "GLASS_STRONG": "rgba(20, 31, 24, 0.95)",
            "TEXT_COLOR": "#f0eadc",
            "MUTED_COLOR": "#c0b8a5",
            "BORDER_COLOR": "rgba(197, 161, 90, 0.28)",
            "INPUT_BG": "rgba(25, 38, 29, 0.95)",
            "SHADOW_COLOR": "rgba(0, 0, 0, 0.30)",
        }

    for name, value in colors.items():
        css = css.replace("{{" + name + "}}", value)
    st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)


def initialize_state():
    defaults = {
        "livros": [
            {"id": 1, "titulo": "Dom Casmurro", "autor": "Machado de Assis", "categoria": "Romance", "isbn": "978000000001", "descricao": ""},
            {"id": 2, "titulo": "O Pequeno Príncipe", "autor": "Antoine de Saint-Exupéry", "categoria": "Literatura", "isbn": "978000000002", "descricao": ""},
            {"id": 3, "titulo": "1984", "autor": "George Orwell", "categoria": "Ficção", "isbn": "978000000003", "descricao": ""},
        ],
        "leitores": [
            {"id": 1, "nome": "Ana Silva", "email": "ana@email.com", "telefone": "(11) 99999-0001"},
            {"id": 2, "nome": "Pedro Santos", "email": "pedro@email.com", "telefone": "(11) 99999-0002"},
        ],
        "categorias": ["Romance", "Literatura", "Ficção", "Tecnologia"],
        "exemplares": [
            {"codigo": "EX001", "livro_id": 1, "situacao": "Disponível"},
            {"codigo": "EX002", "livro_id": 2, "situacao": "Disponível"},
            {"codigo": "EX003", "livro_id": 3, "situacao": "Disponível"},
        ],
        "emprestimos": [],
        "reservas": [],
        "tema_biblioteca": "Claro",
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


initialize_state()

st.sidebar.markdown(
    """
    <div class="nb-brand">
        <span>📚</span>
        <div>
            <strong>NossaBiblioteca</strong>
            <small>Sistema de gerenciamento</small>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

theme = st.sidebar.selectbox(
    "Tema visual",
    ["Claro", "Escuro"],
    key="tema_biblioteca",
)
apply_theme(theme)

page = st.sidebar.radio(
    "Navegação",
    PAGES,
    key="pagina_atual",
)

livros = st.session_state.livros
leitores = st.session_state.leitores
emprestimos = st.session_state.emprestimos
reservas = st.session_state.reservas
exemplares = st.session_state.exemplares


def book_name(book_id):
    return next((book["titulo"] for book in livros if book["id"] == book_id), "Livro não encontrado")


def reader_name(reader_id):
    return next((reader["nome"] for reader in leitores if reader["id"] == reader_id), "Leitor não encontrado")


def page_header(title, description):
    st.markdown(
        f'<div class="nb-page-eyebrow">NOSSABIBLIOTECA · {title.upper()}</div>',
        unsafe_allow_html=True,
    )
    st.title(title)
    st.caption(description)


def empty_message(message):
    st.info(message)


page_header(
    page,
    "Organização clara do acervo, dos leitores e das movimentações da biblioteca.",
)

if page == "Painel inicial":
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Livros cadastrados", len(livros))
    c2.metric("Leitores cadastrados", len(leitores))
    c3.metric("Empréstimos ativos", sum(item["status"] == "Ativo" for item in emprestimos))
    c4.metric("Reservas pendentes", sum(item["status"] == "Pendente" for item in reservas))

    st.markdown("### Acervo disponível")
    if livros:
        st.dataframe(
            [{"Título": book["titulo"], "Autor": book["autor"], "Categoria": book["categoria"]} for book in livros],
            width="stretch",
            hide_index=True,
        )
    else:
        empty_message("Não há livros cadastrados para apresentar no painel.")
    st.info("Dados de demonstração mantidos somente durante a sessão.")

elif page == "Livros":
    with st.expander("Cadastrar novo livro", expanded=False):
        with st.form("form_livro", clear_on_submit=True):
            title = st.text_input("Título")
            author = st.text_input("Autor")
            category = st.selectbox(
                "Categoria",
                st.session_state.categorias,
                index=0 if st.session_state.categorias else None,
            )
            isbn = st.text_input("ISBN")
            description = st.text_area("Descrição")
            submitted = st.form_submit_button("Salvar livro")
            if submitted:
                if not title.strip() or not author.strip():
                    st.error("Preencha o título e o autor.")
                elif isbn.strip() and any(book["isbn"].strip().lower() == isbn.strip().lower() for book in livros):
                    st.warning("Já existe um livro cadastrado com este ISBN.")
                else:
                    new_id = max((book["id"] for book in livros), default=0) + 1
                    livros.append({
                        "id": new_id,
                        "titulo": title.strip(),
                        "autor": author.strip(),
                        "categoria": category,
                        "isbn": isbn.strip(),
                        "descricao": description.strip(),
                    })
                    st.success("Livro cadastrado com sucesso.")
                    st.rerun()

    search = st.text_input("Pesquisar por título, autor ou ISBN")
    filtered = [
        book for book in livros
        if search.lower() in f'{book["titulo"]} {book["autor"]} {book["isbn"]}'.lower()
    ]
    if filtered:
        st.dataframe(
            [{
                "ID": book["id"],
                "Título": book["titulo"],
                "Autor": book["autor"],
                "Categoria": book["categoria"],
                "ISBN": book["isbn"] or "—",
            } for book in filtered],
            width="stretch",
            hide_index=True,
        )
    else:
        empty_message("Nenhum livro corresponde aos critérios informados.")

elif page == "Categorias":
    with st.form("form_categoria", clear_on_submit=True):
        category = st.text_input("Nome da categoria")
        submitted = st.form_submit_button("Adicionar categoria")
        if submitted:
            if not category.strip():
                st.error("Digite o nome da categoria.")
            elif category.strip().lower() in {item.lower() for item in st.session_state.categorias}:
                st.warning("Essa categoria já existe.")
            else:
                st.session_state.categorias.append(category.strip())
                st.success("Categoria adicionada.")
                st.rerun()

    if st.session_state.categorias:
        st.dataframe(
            [{"Categoria": item} for item in st.session_state.categorias],
            width="stretch",
            hide_index=True,
        )
    else:
        empty_message("Não há categorias cadastradas.")

elif page == "Leitores":
    with st.form("form_leitor", clear_on_submit=True):
        name = st.text_input("Nome completo")
        email = st.text_input("E-mail")
        phone = st.text_input("Telefone")
        submitted = st.form_submit_button("Cadastrar leitor")
        if submitted:
            if not name.strip() or not email.strip():
                st.error("Preencha o nome e o e-mail.")
            elif any(reader["email"].lower() == email.strip().lower() for reader in leitores):
                st.warning("Este e-mail já está cadastrado.")
            else:
                leitores.append({
                    "id": max((reader["id"] for reader in leitores), default=0) + 1,
                    "nome": name.strip(),
                    "email": email.strip(),
                    "telefone": phone.strip(),
                })
                st.success("Leitor cadastrado.")
                st.rerun()

    if leitores:
        st.dataframe(leitores, width="stretch", hide_index=True)
    else:
        empty_message("Não há leitores cadastrados.")

elif page == "Exemplares":
    if not livros:
        st.warning("Cadastre pelo menos um livro antes de adicionar exemplares.")
    else:
        book_options = {f'{book["id"]} — {book["titulo"]}': book["id"] for book in livros}
        with st.form("form_exemplar", clear_on_submit=True):
            book_label = st.selectbox("Livro", list(book_options))
            code = st.text_input("Código do exemplar")
            situation = st.selectbox("Situação", ["Disponível", "Em manutenção"])
            submitted = st.form_submit_button("Cadastrar exemplar")
            if submitted:
                if not code.strip():
                    st.error("Informe o código do exemplar.")
                elif any(item["codigo"].lower() == code.strip().lower() for item in exemplares):
                    st.warning("Este código já existe.")
                else:
                    exemplares.append({
                        "codigo": code.strip(),
                        "livro_id": book_options[book_label],
                        "situacao": situation,
                    })
                    st.success("Exemplar cadastrado.")
                    st.rerun()

    if exemplares:
        st.dataframe(
            [{"Código": item["codigo"], "Livro": book_name(item["livro_id"]), "Situação": item["situacao"]} for item in exemplares],
            width="stretch",
            hide_index=True,
        )
    else:
        empty_message("Não há exemplares cadastrados.")

elif page == "Empréstimos":
    available_copies = [
        item for item in exemplares
        if item["situacao"] == "Disponível"
        and not any(
            loan["exemplar_codigo"] == item["codigo"] and loan["status"] == "Ativo"
            for loan in emprestimos
        )
    ]

    if not leitores:
        st.warning("Cadastre um leitor antes de registrar empréstimos.")
    elif not available_copies:
        st.warning("Não há exemplares disponíveis para empréstimo.")
    else:
        reader_options = {f'{reader["id"]} — {reader["nome"]}': reader["id"] for reader in leitores}
        copy_options = {f'{item["codigo"]} — {book_name(item["livro_id"])}': item["codigo"] for item in available_copies}
        with st.form("form_emprestimo", clear_on_submit=True):
            reader_label = st.selectbox("Leitor", list(reader_options))
            copy_label = st.selectbox("Exemplar", list(copy_options))
            loan_date = st.date_input("Data do empréstimo", value=date.today())
            submitted = st.form_submit_button("Registrar empréstimo")
            if submitted:
                copy_code = copy_options[copy_label]
                copy = next(item for item in exemplares if item["codigo"] == copy_code)
                copy["situacao"] = "Emprestado"
                emprestimos.append({
                    "id": max((loan["id"] for loan in emprestimos), default=0) + 1,
                    "leitor_id": reader_options[reader_label],
                    "exemplar_codigo": copy_code,
                    "livro_id": copy["livro_id"],
                    "data": loan_date,
                    "prevista": loan_date + timedelta(days=7),
                    "status": "Ativo",
                })
                st.success("Empréstimo registrado. Prazo padrão: 7 dias.")
                st.rerun()

    if emprestimos:
        st.markdown("### Histórico de empréstimos")
        st.dataframe(
            [{
                "ID": loan["id"],
                "Leitor": reader_name(loan["leitor_id"]),
                "Livro": book_name(loan["livro_id"]),
                "Exemplar": loan["exemplar_codigo"],
                "Data": loan["data"],
                "Devolução prevista": loan["prevista"],
                "Situação": loan["status"],
            } for loan in emprestimos],
            width="stretch",
            hide_index=True,
        )
    else:
        empty_message("Não há empréstimos registrados.")

elif page == "Devoluções":
    active_loans = [loan for loan in emprestimos if loan["status"] == "Ativo"]
    if not active_loans:
        st.info("Não há empréstimos ativos para devolução.")
    else:
        loan_options = {
            f'Empréstimo {loan["id"]} — {book_name(loan["livro_id"])} — {loan["exemplar_codigo"]}': loan["id"]
            for loan in active_loans
        }
        selected = st.selectbox("Empréstimo", list(loan_options))
        if st.button("Confirmar devolução", width="content"):
            loan_id = loan_options[selected]
            loan = next(item for item in emprestimos if item["id"] == loan_id)
            loan["status"] = "Devolvido"
            loan["data_devolucao"] = date.today()
            copy = next((item for item in exemplares if item["codigo"] == loan["exemplar_codigo"]), None)
            if copy:
                copy["situacao"] = "Disponível"
            st.success("Devolução registrada.")
            st.rerun()

    returned_loans = [loan for loan in emprestimos if loan["status"] == "Devolvido"]
    if returned_loans:
        st.markdown("### Devoluções realizadas")
        st.dataframe(
            [{"Livro": book_name(loan["livro_id"]), "Exemplar": loan["exemplar_codigo"], "Data da devolução": loan["data_devolucao"]} for loan in returned_loans],
            width="stretch",
            hide_index=True,
        )

elif page == "Reservas":
    if not leitores or not livros:
        st.warning("Cadastre leitores e livros antes de criar reservas.")
    else:
        reader_options = {f'{reader["id"]} — {reader["nome"]}': reader["id"] for reader in leitores}
        book_options = {f'{book["id"]} — {book["titulo"]}': book["id"] for book in livros}
        with st.form("form_reserva", clear_on_submit=True):
            reader_label = st.selectbox("Leitor", list(reader_options))
            book_label = st.selectbox("Livro", list(book_options))
            reserve_date = st.date_input("Data da reserva", value=date.today())
            submitted = st.form_submit_button("Registrar reserva")
            if submitted:
                reservas.append({
                    "id": max((reservation["id"] for reservation in reservas), default=0) + 1,
                    "leitor_id": reader_options[reader_label],
                    "livro_id": book_options[book_label],
                    "data": reserve_date,
                    "status": "Pendente",
                })
                st.success("Reserva registrada.")
                st.rerun()

    if reservas:
        st.dataframe(
            [{
                "ID": reservation["id"],
                "Leitor": reader_name(reservation["leitor_id"]),
                "Livro": book_name(reservation["livro_id"]),
                "Data": reservation["data"],
                "Situação": reservation["status"],
            } for reservation in reservas],
            width="stretch",
            hide_index=True,
        )
    else:
        empty_message("Não há reservas registradas.")

st.divider()
st.caption("NossaBiblioteca • Interface acadêmica • Dados demonstrativos da sessão")
