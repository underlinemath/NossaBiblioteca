# NossaBiblioteca

## Visão do produto

A NossaBiblioteca é um software para organizar seu acervo de livros, cadastrar leitores e controlar os empréstimos e as devoluções. O sistema deverá permitir consultar a disponibilidade dos livros, verificar quem está com cada exemplar, identificar a data prevista de devolução e registrar quando o livro for devolvido.

## Objetivo

- Objetivo principal: facilitar a gestão eficiente dos empréstimos e devoluções dos livros
- Resultado esperado: controlar o acervo e a disponibilidade dos itens de acordo com as quantidades liberadas para empréstimo e consulta

## Usuários

| Usuário       | Necessidade principal |
| -------       | -------               |
| bibliotecário | controlar o acervo e os empréstimos |
| leitor 1      | consultar livros e reservar apenas os que estão disponíveis para empréstimo |
| leitor 2      | reservar livros disponíveis para consulta e para empréstimos |

## Escopo inicial
- Cadastrar livros e exemplares
- Cadastrar leitores
- Consultar disponibilidade dos livros
- Reservar livros disponíveis
- Registrar empréstimos
- Registrar devoluções
- Informar a data prevista de devolução
- Permitir ao bibliotecário consultar quem está com cada exemplar

### Incluído

- Cadastro, edição e consulta de leitores.
- Cadastro de livros e categorias.
- Registro de empréstimos e devoluções.
- Consulta de livros disponíveis e emprestados.
- Pesquisa de livros por título, autor ou categoria.

### Fora do escopo

- Multas por atraso.
- Limite de livros por leitor e bloqueio de leitor com atraso.
- Notificações automáticas por e-mail, SMS ou aplicativo
- Integração com catálogos, bibliotecas ou sistemas externos.
- Compra, descarte, doação ou manutenção física dos livros.
- Relatórios avançados e painéis de indicadores.
- Controle de funcionários, folha de pagamento ou gestão administrativa da instituição.

## Fluxos principais

1. **Gerenciar o acervo:** o bibliotecário cadastra ou edita livros, exemplares e categorias; o sistema valida os dados e atualiza o acervo.
2. **Cadastrar leitor:** o bibliotecário registra os dados do leitor; o sistema gera um identificador único e disponibiliza o cadastro para empréstimos e reservas.
3. **Consultar disponibilidade:** o leitor pesquisa por título, autor ou categoria; o sistema exibe os livros, a quantidade disponível e se cada exemplar pode ser reservado para consulta ou empréstimo.
4. **Reservar e emprestar:** o leitor seleciona um livro disponível; o sistema registra a reserva e, no atendimento do empréstimo, associa o exemplar ao leitor, registra a data do empréstimo e calcula a data prevista de devolução.
5. **Registrar devolução:** o bibliotecário localiza o empréstimo e registra a devolução do exemplar; o sistema preenche a data efetiva no item correspondente e atualiza a disponibilidade do exemplar.
6. **Tratar indisponibilidade:** quando não houver exemplar disponível, o sistema informa a indisponibilidade e impede a reserva ou o empréstimo, conforme a modalidade do livro.

## Regras de negócio conhecidas

- Cada leitor possui um identificador único e seus dados básicos de contato.
- Um leitor pode realizar nenhum, um ou vários empréstimos; cada empréstimo pertence a apenas um leitor. 
- Um empréstimo deve conter pelo menos um livro.
- Um livro pode ser emprestado várias vezes ao longo do tempo, mas cada registro de item pertence a um empréstimo específico. 
- Cada livro pertence a uma categoria; uma categoria pode agrupar vários livros. 
- A data efetiva de devolução fica vazia enquanto o item do empréstimo não tiver sido devolvido.
- Cada item do empréstimo deve guardar a data prevista e a data efetiva de devolução.
- Um empréstimo pode conter vários itens, que podem ser devolvidos em momentos diferentes.

## Dados principais

- **Leitor:** identificador, nome, e-mail, telefone e status do cadastro.
- **Bibliotecário:** identificador, nome e dados de autenticação e permissão.
- **Livro:** identificador, título, autor, ISBN, descrição e categoria.
- **Categoria:** identificador e nome da categoria.
- **Exemplar:** identificador, livro associado, código de identificação e situação de disponibilidade.
- **Reserva:** identificador, leitor, exemplar ou livro solicitado, data da reserva, modalidade e situação.
- **Empréstimo:** identificador, leitor e data do empréstimo.
- **Item do empréstimo:** empréstimo associado, exemplar emprestado, data prevista de devolução, data efetiva de devolução e situação do item.

## Requisitos não funcionais

- Autenticação: leitores e bibliotecários devem acessar o sistema com credenciais próprias.
- Permissões: somente bibliotecários podem cadastrar livros, leitores, exemplares e registrar devoluções.
- Persistência: os dados devem ser armazenados no Xano.
- Segurança: cada usuário só pode acessar as operações permitidas para seu perfil.
- Integridade: um exemplar emprestado não pode ser disponibilizado para outro empréstimo simultaneamente.
- Desempenho: pesquisas e consultas de disponibilidade devem retornar em poucos segundos.
- Auditoria: o sistema deve registrar as datas e os usuários responsáveis pelas operações.
- Integrações: não haverá integração externa na primeira versão.

## Critérios de sucesso

- Um bibliotecário consegue cadastrar, editar e consultar livros, categorias, exemplares e leitores, e cada registro recebe um identificador único.
- Um leitor consegue pesquisar livros por título, autor ou categoria e visualizar corretamente a disponibilidade dos exemplares.
- O sistema impede que um exemplar indisponível seja reservado ou emprestado simultaneamente para mais de um leitor.
- Ao registrar um empréstimo, o sistema associa o leitor ao exemplar e armazena as datas do empréstimo e da devolução prevista.
- Ao registrar uma devolução, o sistema armazena a data efetiva no item correspondente, encerra esse item e atualiza a disponibilidade do exemplar.
- Usuários só conseguem executar operações autorizadas para seu perfil, e as operações administrativas ficam restritas aos bibliotecários.

## Decisões pendentes

- O sistema deverá permitir reservas para livros indisponíveis?
- Qual será o prazo padrão de empréstimo?
- Um leitor poderá renovar um empréstimo?
- Bibliotecários poderão excluir livros ou apenas marcá-los como inativos?
- O limite de livros por leitor será implementado em uma versão futura?
- Será necessário permitir mais de um bibliotecário no sistema?