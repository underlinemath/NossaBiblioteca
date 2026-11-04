# Design

## Fonte dos endpoints

Cada rota terá um único arquivo dentro da pasta do grupo e do recurso. Os arquivos planos duplicados serão removidos depois que o conteúdo for consolidado, mantendo os GUIDs de endpoints quando existirem. Grupos e tabelas continuam definidos em `xano/`.

## Modelo de autores

`autores` terá `id`, `nome`, timestamps e nome único. `livros_autores` terá `id`, `livro_id`, `autor_id`, timestamps e índice único composto (`livro_id`, `autor_id`). `livros.autor` permanece somente para compatibilidade com clientes existentes; novos fluxos sincronizam esse campo com os autores normalizados quando o nome puder ser resolvido.

## Funções e respostas

Cada endpoint usará blocos de função XanoScript para validação, consulta e mutação, com falhas antecipadas antes de `db.add`/`db.edit`/`db.del`. Respostas de sucesso serão objetos JSON estáveis. Falhas usarão `error` com `code` e `message` e status HTTP coerente. Empréstimos e devoluções manterão a atualização de disponibilidade dentro de transação.

## Publicação e verificação

Os scripts serão validados localmente por sintaxe e por inspeção de referências de tabela/rota. Depois, serão publicados no workspace Xano compartilhado, sem apagar recursos remotos não representados na fonte. Os cenários críticos serão verificados: autenticação, autorização, CRUD, busca, conflito de reserva, empréstimo concorrente e devolução.

