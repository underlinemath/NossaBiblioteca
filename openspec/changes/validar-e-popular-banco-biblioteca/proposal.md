# Proposal

## Why

O contrato das APIs e os artefatos Xano já definem as entidades principais, mas
ainda falta uma validação reproduzível de todos os endpoints e uma massa
coerente que atravesse o domínio completo. Esta change cria um fluxo seguro de
teste e carga para demonstrar que cada dado chega à tabela correta e que os
vínculos entre catálogo, leitores, reservas e empréstimos permanecem íntegros.

## What Changes

- Criar uma estratégia de testes automatizados para todas as rotas documentadas
  dos grupos de catálogo, administração, circulação e autenticação relacionada.
- Definir fixtures mínimas e idempotentes para categorias, autores, livros,
  associações `livros_autores`, exemplares, leitores, reservas, empréstimos e
  itens de empréstimo.
- Validar respostas de sucesso, erros estruturados, autenticação,
  autorização, paginação, disponibilidade, conflitos e devolução.
- Confirmar, após cada operação de escrita, a persistência na tabela Xano
  correspondente e os relacionamentos esperados.
- Produzir dados de limpeza ou isolamento para que a execução possa ser
  repetida sem duplicar registros existentes.
- Manter os contratos públicos atuais e não introduzir multas, notificações,
  renovações ou relatórios fora do escopo atual.

## Capabilities

### New Capabilities

- `validacao-integracao-biblioteca`: testes de contrato, segurança, persistência
  e fluxos completos das APIs da biblioteca.

### Modified Capabilities

- `apis-biblioteca`: explicitar a verificabilidade dos contratos, dos erros e
  da persistência durante os fluxos de teste e carga.
- `catalogo`: explicitar a consistência de categorias, autores, livros e
  exemplares na carga e na consulta de disponibilidade.

## Impact

Afeta os artefatos versionados em `xano/api/`, `xano/table/` e a documentação
de contratos. Poderá adicionar scripts/fixtures de teste sem credenciais,
usando configuração externa para o ambiente Xano. A execução deve preservar
autorização no backend, não expor tokens e separar dados de teste dos dados
reais quando o ambiente oferecer essa opção.
