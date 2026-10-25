# Change: NossaBiblioteca

## Why

A NossaBiblioteca precisa gerenciar seu acervo, usuários e empréstimos em um único sistema, evitando inconsistências nos registros referentes à disponibilidade, pedidos e devoluções.

## What Changes

- Permitir o cadastro e a consulta de livros, categorias, exemplares e leitores.
- Permitir pesquisar livros e consultar a disponibilidade dos exemplares.
- Registrar reservas, empréstimos e devoluções, incluindo as datas relevantes.
- Permitir ao bibliotecário consultar o leitor associado a cada exemplar emprestado.
- Aplicar autenticação, permissões por perfil, integridade contra empréstimos simultâneos e auditoria das operações.
- Persistir os dados no Xano, sem integrações externas na primeira versão.

## Scope Notes

Ficam fora da primeira versão multas por atraso, bloqueios de leitores, notificações automáticas, integrações externas, relatórios avançados, aplicativo mobile e gestão administrativa da instituição.

As seguintes decisões ainda precisam ser fechadas antes da implementação: reservas para livros indisponíveis, prazo padrão de empréstimo, renovação, exclusão ou inativação de livros e suporte a múltiplos bibliotecários.

## Impact

- **Código:** serão necessários modelos e operações para leitores, livros, categorias, exemplares, reservas, empréstimos e itens de empréstimo.
- **APIs e dados:** persistência no Xano, com vínculos entre leitores, exemplares e empréstimos.
- **Acesso:** operações administrativas restritas a bibliotecários; leitores poderão consultar e realizar as operações permitidas.
- **Próxima etapa:** resolver as decisões pendentes e detalhar os critérios de aceitação por fluxo.

## Capabilities

- `catalogo`: cadastro e consulta de livros, categorias e exemplares.
- `leitores`: cadastro e consulta de leitores.
- `circulacao`: reservas, empréstimos, devoluções e disponibilidade dos exemplares.
- `acesso`: autenticação, permissões por perfil e auditoria das operações.

## Capabilities

### New Capabilities
- `catalogo`: cadastro e consulta de livros, categorias e exemplares.
- `leitores`: cadastro e consulta de leitores.
- `circulacao`: reservas, empréstimos, devoluções e disponibilidade dos exemplares.
- `acesso`: autenticação, permissões por perfil e auditoria das operações.

### Modified Capabilities

Nenhuma.