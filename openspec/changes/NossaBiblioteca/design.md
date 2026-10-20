# Design

## Abordagem

As APIs serão organizadas em grupos XanoScript por responsabilidade:
`catalogo` para consultas, `administracao` para CRUD protegido e `circulacao`
para reservas, empréstimos e devoluções. Os endpoints existentes de consulta do
catálogo serão preservados.

## Contratos

Todos os endpoints retornarão JSON. Sucessos de criação usarão 201; consultas e
alterações usarão 200; exclusões bem-sucedidas usarão 204 ou um objeto de
confirmação. Erros retornarão `{ "error": { "code": "...", "message": "..." } }`.

Os recursos principais serão `categorias`, `livros`, `exemplares`, `leitores`,
`reservas`, `emprestimos` e `itens-emprestimos`. Senhas e credenciais nunca serão
retornadas.

## Integridade

Antes de criar ou alterar vínculos, as APIs consultarão os registros relacionados.
A criação de empréstimo e a devolução atualizarão o status do exemplar no mesmo
fluxo transacional. A regra de cópia indisponível será validada no backend.

## Segurança

As tabelas de identidade serão configuradas para autenticação Xano. Endpoints
administrativos usarão autenticação e verificarão o perfil bibliotecário no
backend; endpoints de leitor limitarão os registros ao usuário autenticado.

## Verificação

Validar todos os arquivos `.xs` com o validador XanoScript e executar cenários
de sucesso, validação, conflito e autorização contra um workspace Xano de teste.
