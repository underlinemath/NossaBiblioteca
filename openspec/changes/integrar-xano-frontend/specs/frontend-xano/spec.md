# Spec Delta

## Purpose

Define como a interface NossaBiblioteca consome dados persistidos no Xano, apresenta o estado real do sistema e permite operações administrativas autenticadas sem duplicar regras de negócio no navegador.

## ADDED Requirements

### Requirement: Sessão de bibliotecário
A interface SHALL autenticar bibliotecários pelo endpoint do Xano, usar o token nas operações administrativas e permitir encerrar a sessão sem armazenar credenciais no código-fonte.

#### Scenario: Login válido
- **WHEN** um bibliotecário envia credenciais válidas
- **THEN** a interface SHALL abrir as áreas administrativas e consultar a identidade autenticada

#### Scenario: Credenciais inválidas
- **WHEN** o Xano rejeita as credenciais
- **THEN** a interface SHALL mostrar erro compreensível sem iniciar uma sessão autenticada

### Requirement: Leitura sincronizada com Xano
A interface SHALL obter catálogo, leitores e demais dados exibidos por meio das APIs Xano, refletindo estados de carregamento, paginação, busca e falhas sem substituir respostas por dados locais fictícios.

#### Scenario: Carregar catálogo
- **WHEN** o usuário abre a tela de livros ou pesquisa o catálogo
- **THEN** a interface SHALL renderizar os dados retornados pelo Xano e a disponibilidade fornecida pelo backend

#### Scenario: Falha de consulta
- **WHEN** uma consulta ao Xano falha ou expira
- **THEN** a interface SHALL informar a falha e oferecer nova tentativa sem declarar os dados como atualizados

### Requirement: Escritas administrativas persistentes
A interface SHALL enviar cadastros, alterações, empréstimos e devoluções às rotas autorizadas do Xano e atualizar a tela somente após confirmação da API.

#### Scenario: Cadastro confirmado
- **WHEN** uma mutação administrativa válida é aceita pelo Xano
- **THEN** a interface SHALL exibir o registro persistido com o identificador retornado pelo backend

#### Scenario: Mutação recusada
- **WHEN** o backend rejeita uma mutação por validação, conflito ou autorização
- **THEN** a interface SHALL preservar o estado confirmado anterior e apresentar a mensagem de erro sem simular sucesso

### Requirement: Dados relacionados consistentes
A interface SHALL preservar relações de livro, categoria, autor, exemplar, leitor e empréstimo usando identificadores retornados pelo backend, sem criar vínculos por índices ou IDs locais.

#### Scenario: Empréstimo com exemplar indisponível
- **WHEN** o backend retorna conflito ao registrar empréstimo
- **THEN** a interface SHALL manter o exemplar indisponível e informar que a operação não foi concluída
