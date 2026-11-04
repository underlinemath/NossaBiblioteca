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

## Autenticação

Base: `nossabiblioteca-auth`.

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| POST | `/auth/leitores/signup` | nome, e-mail, senha e telefone opcional | leitor criado e token |
| POST | `/auth/leitores/login` | e-mail e senha | token e leitor |
| GET | `/auth/leitores/me` | token de leitor | identidade autenticada |
| POST | `/auth/bibliotecarios/login` | e-mail e senha | token e bibliotecário |
| GET | `/auth/bibliotecarios/me` | token de bibliotecário | identidade autenticada |

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
| GET | `/autores` | `busca?`, `page?` | Lista paginada de autores |
| POST | `/autores` | `{ "nome": "string" }` | Autor criado |
| PATCH | `/autores/{id}` | `{ "nome": "string" }` | Autor atualizado |
| DELETE | `/autores/{id}` | — | Autor excluído se não associado |
| GET | `/livros/{id}/autores` | — | Associações do livro |
| POST | `/livros/{id}/autores` | `{ "autor_id": number }` | Associação criada |
| GET | `/exemplares` | `livro_id?`, `page?` | Exemplares paginados |
| DELETE | `/livros/{id}` | — | Livro excluído conforme as regras do backend |
| DELETE | `/exemplares/{id}` | — | Exemplar excluído conforme as regras do backend |

## Circulação

Base: `nossabiblioteca-circulacao`.

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/reservas` | — | Reservas do leitor autenticado |
| POST | `/reservas` | livro/exemplar e modalidade | Reserva criada |
| GET | `/emprestimos` | — | Empréstimos do leitor autenticado |
| POST | `/emprestimos` | leitor, exemplar e data prevista | Empréstimo, item e exemplar atualizado |
| PATCH | `/itens-emprestimos/{id}/devolucao` | data efetiva opcional | Item devolvido e exemplar disponível |
| DELETE | `/reservas/{id}` | — | Reserva removida conforme as regras do backend |

Criação de empréstimo deve retornar conflito quando o exemplar não estiver
disponível. Devoluções e alterações administrativas exigem bibliotecário.

Autores são administrados como entidades próprias e relacionados a livros pela
tabela intermediária `livros_autores`. O campo textual `autor` permanece na
resposta durante a transição para não quebrar clientes existentes.

O endpoint `POST /livros` aceita `autor_ids` opcional e grava cada vínculo em
`livros_autores`. `POST /exemplares` recebe `codigo` (não ISBN); o valor é
persistido em `exemplares.codigo`. A massa repetível de demonstração e sua
política de limpeza estão em [xano-seed.md](./xano-seed.md).
