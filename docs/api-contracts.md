# Contratos das APIs

As APIs Xano são agrupadas por responsabilidade. Todas as respostas são JSON.
Erros usam o formato `{ "error": { "code": "string", "message": "string" } }`.

Os arquivos de referência versionados ficam em `xano/api/`. Cópias locais de
workspaces Xano e capturas de inspeção não são fontes de contrato e não devem
ser usadas para publicar alterações.

## Catálogo

Base: `nossabiblioteca-catalogo`

| Método | Rota | Solicitação | Resposta |
| --- | --- | --- | --- |
| GET | `/livros` | `busca?`, `categoria_id?`, `page?` | Lista paginada de livros ativos |
| GET | `/livros/{id}` | `id` no caminho | Livro ativo ou erro 404 |

## Administração

Base: `nossabiblioteca-administracao`. Requer token de bibliotecário.

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/categorias` | — | Lista de categorias |
| POST | `/categorias` | `{ "nome": "string" }` | Categoria criada |
| PATCH | `/categorias/{id}` | `{ "nome": "string" }` | Categoria atualizada |
| DELETE | `/categorias/{id}` | — | `{ "deleted": true, "id": number }` |
| POST | `/livros` | categoria, título, `autor` legado, `autor_ids?`, ISBN e descrição | Livro criado |
| PATCH | `/livros/{id}` | Campos editáveis do livro e `autor_ids?` | Livro atualizado |
| POST | `/exemplares` | `livro_id`, `codigo`, `situacao?` | Exemplar criado |
| PATCH | `/exemplares/{id}` | Campos editáveis do exemplar | Exemplar atualizado |
| GET | `/leitores` | `busca?`, `page?` | Lista paginada de leitores |
| POST | `/leitores` | nome, e-mail, telefone e status | Leitor criado |
| PATCH | `/leitores/{id}` | Dados do leitor | Leitor atualizado |
| DELETE | `/leitores/{id}` | — | Leitor inativado |

## Circulação

Base: `nossabiblioteca-circulacao`.

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/reservas` | — | Reservas do leitor autenticado |
| POST | `/reservas` | livro/exemplar e modalidade | Reserva criada |
| GET | `/emprestimos` | — | Empréstimos do leitor autenticado |
| POST | `/emprestimos` | leitor, exemplar e data prevista | Empréstimo, item e exemplar atualizado |
| PATCH | `/itens-emprestimos/{id}/devolucao` | data efetiva opcional | Item devolvido e exemplar disponível |

Criação de empréstimo deve retornar conflito quando o exemplar não estiver
disponível. Devoluções e alterações administrativas exigem bibliotecário.

Autores são administrados como entidades próprias e relacionados a livros pela
tabela intermediária `livros_autores`. O campo textual `autor` permanece na
resposta durante a transição para não quebrar clientes existentes.
