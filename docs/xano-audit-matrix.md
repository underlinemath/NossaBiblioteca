# Matriz de auditoria Xano

- Workspace: 151812
- Branch: v1
- Tabelas locais/remotas: 10/10
- APIs locais/remotas: 38/63

## Tabelas remotas

| Tabela | Campos | Índices |
| --- | --- | --- |
| autores | int id, text nome, text nome_autor, text livro_id, timestamp created_at, timestamp updated_at | primary, btree, btree |
| bibliotecarios | int id, text nome, email email, password senha, text permissoes, text status, timestamp created_at, timestamp updated_at | primary, btree |
| categorias | int id, text nome, timestamp created_at, timestamp updated_at | primary, btree |
| emprestimos | int id, int leitor_id, timestamp data_emprestimo, text situacao, timestamp created_at, timestamp updated_at | primary, btree |
| exemplares | int id, int livro_id, text codigo, text situacao, bool disponivel, timestamp created_at, timestamp updated_at | primary, btree, btree |
| itens_emprestimos | int id, int emprestimo_id, int exemplar_id, date data_prevista_devolucao, date data_efetiva_devolucao, text situacao, timestamp created_at, timestamp updated_at | primary, btree, btree |
| leitores | int id, text nome, email email, password senha, text telefone, text status, timestamp created_at, timestamp updated_at | primary, btree |
| livros | int id, int categoria_id, text titulo, text autor, text isbn, text descricao, text editora, bool ativo, timestamp created_at, timestamp updated_at | primary, btree, btree |
| livros_autores | int id, int livro_id | primary, btree, btree, btree |
| reservas | int id, int leitor_id, int livro_id, int exemplar_id, date data_reserva, text modalidade, text situacao, timestamp created_at, timestamp updated_at | primary, btree, btree, btree |

## APIs ausentes da versão local

- UNKNOWN api/administracao/administracao.xs
- GET autores
- POST autores
- POST carga_dados
- GET categorias
- POST categorias
- GET confirmar_dados
- GET exemplares
- POST exemplares
- GET leitores
- POST leitores
- GET livros/{id}/autores
- POST livros/{id}/autores
- DELETE livros/{livro_id}/autores/{autor_id}
- GET livros/{livro_id}/autores
- POST livros/{livro_id}/autores
- DELETE livros_autores/{id}
- GET livros_autores
- POST livros_autores
- POST livros
- POST auth/bibliotecarios/login
- GET auth/bibliotecarios/me
- POST auth/leitores/login
- GET auth/leitores/me
- POST auth/leitores/signup
- POST auth/login
- POST auth/signup
- UNKNOWN api/auth/auth.xs
- DELETE bibliotecarios/{bibliotecarios_id}
- GET bibliotecarios/{bibliotecarios_id}
- PATCH bibliotecarios/{bibliotecarios_id}
- PUT bibliotecarios/{bibliotecarios_id}
- GET bibliotecarios
- POST bibliotecarios
- DELETE leitores/{leitores_id}
- GET leitores/{leitores_id}
- PATCH leitores/{leitores_id}
- PUT leitores/{leitores_id}
- GET leitores
- POST leitores
- POST login_bibliotecario
- POST login_leitor
- UNKNOWN api/catalogo/catalogo.xs
- GET livros/{id}/autores
- GET livros
- UNKNOWN api/circulacao/circulacao.xs
- GET emprestimos
- POST emprestimos
- GET reservas
- POST reservas

## APIs locais sem equivalente remoto por caminho

- UNKNOWN api/administracao/api_group.xs
- GET autores
- POST autores
- GET categorias
- POST categorias
- GET exemplares
- POST exemplares
- GET leitores
- POST leitores
- GET livros/{id}/autores
- POST livros/{id}/autores
- POST livros
- UNKNOWN api/auth/api_group.xs
- POST auth/bibliotecarios/login
- GET auth/bibliotecarios/me
- POST auth/leitores/login
- GET auth/leitores/me
- POST auth/leitores/signup
- UNKNOWN api/catalogo/api_group.xs
- GET livros
- UNKNOWN api/circulacao/api_group.xs
- GET emprestimos
- POST emprestimos
- GET reservas
- POST reservas
