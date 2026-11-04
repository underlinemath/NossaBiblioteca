# Proposal

## Why

A interface atual em `index.html`/`app.js` mantém livros, leitores e empréstimos apenas no `localStorage`, por isso os cadastros não são compartilhados nem persistidos no Xano. A integração permitirá que bibliotecários autenticados consultem e operem dados reais pela interface, mantendo autorização e regras de negócio no backend.

## What Changes

- Substituir a persistência local por chamadas às APIs Xano documentadas para catálogo, administração, autenticação e circulação.
- Adicionar fluxo de login/logout de bibliotecário, armazenando token somente no navegador e sem credenciais embutidas no código.
- Carregar dados reais de livros, leitores, categorias, autores, exemplares e empréstimos, com busca, disponibilidade, estados de carregamento e erros.
- Conectar criação/edição permitida na interface às APIs e atualizar a tela após sucesso; não simular sucesso local quando a API falhar.
- Ajustar contratos/backend se a interface administrativa precisar de consultas hoje indisponíveis, especialmente listagem de empréstimos e dados agregados de exemplares.
- Preservar o backend Xano como autoridade para validação, autorização e integridade dos relacionamentos.

## Capabilities

### New Capabilities
- `frontend-xano`: comportamento do front-end integrado às APIs Xano, incluindo sessão administrativa, consultas, mutações e estados de erro.

### Modified Capabilities
- `apis-biblioteca`: ampliar ou corrigir contratos somente onde forem necessários para suportar os fluxos efetivamente expostos pela interface administrativa, sem relaxar autorização.

## Impact

Afeta `app.js`, `index.html`, `style.css`, `docs/api-contracts.md` e potencialmente os endpoints versionados em `xano/api/`. Não inclui credenciais, carga de dados de produção nem alteração de permissões para leitores.
