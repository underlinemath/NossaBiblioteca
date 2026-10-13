# NossaBiblioteca

Documentação geral do sistema **NossaBiblioteca**, uma solução para organizar
o acervo de livros, cadastrar leitores e controlar reservas, empréstimos e
devoluções.

## Sumário

- [Visão geral](#visão-geral)
- [Objetivos](#objetivos)
- [Usuários e permissões](#usuários-e-permissões)
- [Escopo da primeira versão](#escopo-da-primeira-versão)
- [Fluxos principais](#fluxos-principais)
- [Modelo de domínio](#modelo-de-domínio)
- [Regras de negócio e integridade](#regras-de-negócio-e-integridade)
- [Requisitos não funcionais](#requisitos-não-funcionais)
- [Critérios de sucesso](#critérios-de-sucesso)
- [Arquitetura e tecnologia](#arquitetura-e-tecnologia)
- [Diretrizes de desenvolvimento](#diretrizes-de-desenvolvimento)
- [Decisões pendentes](#decisões-pendentes)
- [Documentos de referência](#documentos-de-referência)

## Visão geral

A NossaBiblioteca centraliza o controle do acervo, dos leitores e das
operações de circulação. O sistema deve permitir consultar a disponibilidade
dos livros, identificar o leitor associado a cada exemplar emprestado, saber a
data prevista de devolução e registrar a devolução efetiva.

A primeira versão utiliza o **Xano como camada de persistência** e não possui
integrações externas. As regras de negócio, autenticação, permissões e
garantias de integridade devem ser aplicadas no backend.

## Objetivos

### Objetivo principal

Facilitar a gestão eficiente dos empréstimos e das devoluções dos livros.

### Resultado esperado

Manter o acervo e a disponibilidade dos exemplares consistentes com as
quantidades liberadas para empréstimo e consulta, evitando registros
duplicados ou conflitantes.

## Usuários e permissões

| Perfil | Necessidade principal | Permissões previstas |
| --- | --- | --- |
| Bibliotecário | Controlar o acervo e os empréstimos | Cadastrar e administrar livros, categorias, exemplares e leitores; registrar devoluções; consultar empréstimos |
| Leitor | Consultar o acervo e utilizar livros | Pesquisar livros, consultar disponibilidade e realizar as operações permitidas para reservas e empréstimos |

As permissões devem ser verificadas no backend. O frontend não deve ser
considerado um mecanismo de segurança. Operações administrativas são
restritas a bibliotecários, e cada usuário só pode executar ações autorizadas
para o seu perfil.

## Escopo da primeira versão

### Funcionalidades incluídas

- Cadastro, edição e consulta de leitores.
- Cadastro de livros e categorias.
- Cadastro e controle de exemplares físicos.
- Pesquisa de livros por título, autor ou categoria.
- Consulta da disponibilidade dos livros e exemplares.
- Registro de reservas.
- Registro de empréstimos.
- Registro de devoluções.
- Exibição da data prevista de devolução.
- Consulta, pelo bibliotecário, do leitor associado a cada exemplar emprestado.
- Autenticação de leitores e bibliotecários.
- Controle de permissões por perfil.
- Auditoria das operações e das datas relevantes.
- Proteção contra empréstimos simultâneos do mesmo exemplar.

### Fora do escopo

Não fazem parte da primeira versão:

- Multas por atraso.
- Limite de livros por leitor ou bloqueio de leitores inadimplentes.
- Notificações automáticas por e-mail, SMS ou aplicativo.
- Integrações com catálogos, bibliotecas ou outros sistemas externos.
- Compra, descarte, doação ou manutenção física dos livros.
- Relatórios avançados e painéis de indicadores.
- Aplicativo mobile.
- Gestão administrativa da instituição, incluindo funcionários e folha de
  pagamento.

## Fluxos principais

### 1. Gerenciar o acervo

O bibliotecário cadastra ou edita livros, categorias e exemplares. O sistema
valida os dados, gera identificadores únicos quando aplicável e atualiza as
informações do acervo.

### 2. Cadastrar leitor

O bibliotecário registra os dados básicos do leitor. O sistema gera um
identificador único e disponibiliza o cadastro para reservas e empréstimos.

### 3. Consultar disponibilidade

O leitor pesquisa por título, autor ou categoria. O sistema exibe os livros
encontrados, a quantidade disponível e se os exemplares podem ser reservados
para consulta ou empréstimo.

### 4. Reservar e emprestar

O leitor seleciona um livro ou exemplar disponível. O sistema registra a
reserva e, no atendimento do empréstimo, associa o exemplar ao leitor,
registra a data do empréstimo e calcula ou armazena a data prevista de
devolução.

### 5. Registrar devolução

O bibliotecário localiza o empréstimo e registra a devolução de um exemplar.
O sistema preenche a data efetiva no item correspondente e atualiza a
disponibilidade do exemplar.

Itens de um mesmo empréstimo podem ser devolvidos em momentos diferentes. O
empréstimo só é considerado concluído quando todos os seus itens tiverem sido
devolvidos.

### 6. Tratar indisponibilidade

Quando não houver exemplar disponível, o sistema informa a indisponibilidade e
impede a reserva ou o empréstimo conforme a modalidade e as regras definidas
para o livro.

## Modelo de domínio

### Entidades

#### Leitor

Pessoa que consulta livros, realiza reservas e participa de empréstimos.

- `id`
- `nome`
- `email`
- `telefone`
- `status`

#### Bibliotecário

Usuário responsável pelas operações administrativas da biblioteca.

- `id`
- `nome`
- `credenciais`
- `permissões`

#### Livro

Título catalogado, independentemente da quantidade de exemplares físicos.

- `id`
- `título`
- `autor`
- `isbn`
- `descrição`
- `categoria_id`

#### Categoria

Classificação dos livros do acervo.

- `id`
- `nome`

#### Exemplar

Unidade física de um livro que pode ser reservada ou emprestada.

- `id`
- `livro_id`
- `código`
- `situação`

#### Reserva

Intenção de um leitor de utilizar um livro ou exemplar.

- `id`
- `leitor_id`
- `livro_id` ou `exemplar_id`
- `data_reserva`
- `modalidade`
- `situação`

#### Empréstimo

Operação de empréstimo realizada por um leitor.

- `id`
- `leitor_id`
- `data_emprestimo`

#### Item do empréstimo

Associação entre um empréstimo e um exemplar físico, controlando a devolução
individual. Todo empréstimo deve conter pelo menos um item.

- `id`
- `emprestimo_id`
- `exemplar_id`
- `data_prevista_devolução`
- `data_efetiva_devolução`
- `situação`

### Relacionamentos

- Uma `Categoria` pode possuir muitos `Livros`; cada `Livro` pertence a uma
  `Categoria`.
- Um `Livro` pode possuir muitos `Exemplares`; cada `Exemplar` pertence a um
  `Livro`.
- Um `Leitor` pode possuir muitas `Reservas`; cada `Reserva` pertence a um
  `Leitor`.
- Um `Leitor` pode possuir muitos `Empréstimos`; cada `Empréstimo` pertence a
  um `Leitor`.
- Um `Empréstimo` deve possuir um ou mais `Itens do empréstimo`.
- Cada `Item do empréstimo` referencia um único `Exemplar`.
- Um `Exemplar` pode aparecer em vários itens ao longo do tempo, mas não pode
  estar em dois empréstimos ativos simultaneamente.

## Regras de negócio e integridade

- Cada leitor possui um identificador único.
- Cada exemplar possui uma situação de disponibilidade atualizada pelo
  sistema.
- Um exemplar indisponível não pode ser emprestado simultaneamente a outro
  leitor.
- Um empréstimo deve conter pelo menos um item.
- A data efetiva de devolução permanece vazia enquanto o item não for
  devolvido.
- Cada item pode ser devolvido independentemente dos demais itens do mesmo
  empréstimo.
- O empréstimo é concluído quando todos os seus itens tiverem sido
  devolvidos.
- Somente bibliotecários podem cadastrar livros, leitores e exemplares e
  registrar devoluções.
- Entradas devem ser validadas antes da criação ou alteração de dados.
- As relações entre livros, exemplares, leitores e empréstimos devem ser
  preservadas.
- As operações relevantes devem registrar as datas e os usuários responsáveis,
  permitindo auditoria.

## Requisitos não funcionais

- **Autenticação:** leitores e bibliotecários acessam o sistema com
  credenciais próprias.
- **Autorização:** operações administrativas ficam restritas aos
  bibliotecários.
- **Persistência:** os dados são armazenados no Xano.
- **Segurança:** usuários acessam somente operações permitidas pelo seu
  perfil; credenciais, tokens e dados sensíveis não devem ser expostos em
  código, logs ou documentação.
- **Integridade:** o sistema impede que um exemplar seja disponibilizado para
  dois empréstimos ativos simultaneamente.
- **Desempenho:** pesquisas e consultas de disponibilidade devem retornar em
  poucos segundos.
- **Auditoria:** operações devem manter as datas e os usuários responsáveis.
- **Integrações:** nenhuma integração externa é prevista na primeira versão.

## Critérios de sucesso

A primeira versão será considerada alinhada ao objetivo quando:

1. Um bibliotecário conseguir cadastrar, editar e consultar livros,
   categorias, exemplares e leitores, com identificadores únicos.
2. Um leitor conseguir pesquisar livros por título, autor ou categoria e
   visualizar corretamente a disponibilidade dos exemplares.
3. O sistema impedir que um exemplar indisponível seja reservado ou
   emprestado simultaneamente para mais de um leitor.
4. Um empréstimo associar o leitor ao exemplar e armazenar a data do
   empréstimo e a data prevista de devolução.
5. Uma devolução armazenar a data efetiva no item correspondente, encerrar o
   item e atualizar a disponibilidade do exemplar.
6. Usuários executarem somente as operações autorizadas para seus perfis.
7. As operações administrativas permanecerem restritas aos bibliotecários.

## Arquitetura e tecnologia

- **Persistência:** Xano.
- **Modelagem e operações de dados:** XanoScript.
- **Camada de negócio:** backend, incluindo validações, permissões e regras de
  integridade.
- **Frontend:** interface de acesso às funcionalidades; não substitui as
  verificações de segurança do backend.
- **Integrações externas:** não previstas na primeira versão.

As mudanças funcionais devem ser desenvolvidas incrementalmente usando
OpenSpec, preservando os contratos existentes e mantendo cada alteração
focada no escopo da respectiva change.

## Diretrizes de desenvolvimento

### Antes de implementar

- Consultar a visão do produto e o modelo de domínio.
- Conferir a proposta, o escopo e as decisões pendentes da change.
- Registrar novas decisões de comportamento no OpenSpec, em vez de assumir
  regras não definidas.

### Durante a implementação

- Reutilizar estruturas e helpers existentes quando apropriado.
- Aplicar autenticação, autorização e validação no backend.
- Restringir operações administrativas aos bibliotecários.
- Preservar vínculos entre as entidades do domínio.
- Manter alterações pequenas, focadas e compatíveis com os contratos
  existentes.
- Não introduzir tecnologias alternativas sem justificativa documentada.

### Verificação

- Toda mudança funcional deve ter uma estratégia de verificação.
- Validar os fluxos e as regras de negócio afetados.
- Executar a validação estrita da change no OpenSpec.
- Não considerar uma tarefa concluída sem uma verificação reproduzível e
  recente.

### Documentação

- Manter esta documentação sincronizada com o comportamento implementado.
- Atualizar a documentação correspondente quando houver mudança de
  comportamento, dados ou arquitetura.
- Evitar duplicar neste README instruções operacionais que pertençam a
  `AGENTS.md` ou requisitos detalhados que pertençam ao OpenSpec.

## Decisões pendentes

As decisões abaixo devem ser fechadas antes da implementação dos fluxos
dependentes:

- Reservas devem ser permitidas quando todos os exemplares estiverem
  indisponíveis?
- Qual será o prazo padrão de empréstimo?
- Um leitor poderá renovar um empréstimo?
- Livros poderão ser excluídos ou deverão ser apenas marcados como inativos?
- O limite de livros por leitor será implementado em uma versão futura?
- O sistema deverá suportar mais de um bibliotecário?

Essas decisões não devem ser resolvidas por suposição. Quando definidas,
devem ser registradas na change ou na especificação OpenSpec correspondente e
refletidas no modelo de domínio e nos critérios de aceitação.

## Documentos de referência

- [Visão do produto e requisitos](docs/Project-Overview.md)
- [Modelo de domínio](docs/domain-model.md)
- [Proposta da change NossaBiblioteca](openspec/changes/NossaBiblioteca/proposal.md)
- [Instruções para agentes](AGENTS.md)
- [Configuração do OpenSpec](openspec/config.yaml)
