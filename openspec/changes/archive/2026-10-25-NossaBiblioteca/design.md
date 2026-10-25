# Design

## Contexto

O projeto utiliza o Xano para persistência de dados e XanoScript para definir
tabelas e operações. As regras de negócio e as permissões devem ser aplicadas
no backend. A implementação evita alterações destrutivas nos dados existentes.

## Objetivos e fora do escopo

**Objetivos:**

- Organizar os dados e os relacionamentos da biblioteca.
- Garantir que empréstimos e devoluções respeitem as regras de negócio.
- Restringir operações administrativas aos bibliotecários.
- Permitir validação incremental com OpenSpec.

**Fora do escopo:**

- Criar integrações externas nesta versão.
- Implementar aplicativo mobile.
- Implementar multas e notificações automáticas.

## Abordagem

As APIs serão organizadas em grupos XanoScript por responsabilidade:
`catalogo` para consultas, `administracao` para CRUD protegido e `circulacao`
para reservas, empréstimos e devoluções. Os endpoints existentes de consulta do
catálogo serão preservados.

## Persistência e entidades

O Xano será a camada de persistência. O modelo deverá contemplar leitores,
bibliotecários, livros, categorias, exemplares, reservas, empréstimos e itens de
empréstimo, mantendo os relacionamentos por identificadores.

O prazo padrão de empréstimo será de 7 dias, conforme definido para o projeto.

## Contratos

Todos os endpoints retornarão JSON. Sucessos de criação usarão 201; consultas e
alterações usarão 200; exclusões bem-sucedidas usarão 204 ou um objeto de
confirmação. Erros retornarão
`{ "error": { "code": "...", "message": "..." } }`.

Os recursos principais serão `categorias`, `livros`, `exemplares`, `leitores`,
`reservas`, `emprestimos` e `itens-emprestimos`. Senhas e credenciais nunca serão
retornadas.

## Integridade e segurança

Antes de criar ou alterar vínculos, as APIs consultarão os registros
relacionados. A criação de empréstimo e a devolução atualizarão o status do
exemplar no mesmo fluxo transacional. A regra de cópia indisponível será
validada no backend.

As tabelas de identidade serão configuradas para autenticação Xano. Endpoints
administrativos usarão autenticação e verificarão o perfil bibliotecário no
backend; endpoints de leitor limitarão os registros ao usuário autenticado.

## Verificação

Validar todos os arquivos `.xs` com o validador XanoScript e executar cenários
de sucesso, validação, conflito e autorização contra um workspace Xano de teste.

## Riscos e compensações

- **Dados inconsistentes:** validar os relacionamentos e as entradas antes de salvar.
- **Empréstimos duplicados:** verificar a disponibilidade do exemplar no backend antes de registrar um empréstimo.
- **Permissões incorretas:** verificar o perfil do usuário em cada operação protegida.
- **Mudanças no modelo:** validar as alterações antes de aplicá-las no ambiente do Xano.

## Plano de migração

1. Revisar as especificações e o modelo de dados.
2. Definir as tabelas e os relacionamentos no Xano.
3. Implementar as operações de backend.
4. Testar os fluxos de cadastro, empréstimo e devolução.
5. Aplicar as alterações após validar os resultados.
