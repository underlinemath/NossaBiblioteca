# Proposal

## Why

Os endpoints Xano atuais estão duplicados entre arquivos planos e subpastas, e vários fluxos não retornam erros estruturados nem validam referências e conflitos antes de persistir. A modelagem de autores também não suporta corretamente a relação entre vários livros e autores. Esta mudança consolida a fonte dos endpoints, reforça os contratos e prepara os scripts para publicação reproduzível no workspace Xano.

## What Changes

- Consolidar cada endpoint em sua pasta de responsabilidade (`auth`, `catalogo`, `administracao` e `circulacao`), removendo cópias planas duplicadas.
- Atualizar todas as APIs para usar validações, funções de consulta/mutação e respostas JSON consistentes, incluindo códigos HTTP para validação, não encontrado e conflito.
- Criar a tabela `autores` e a tabela intermediária `livros_autores`, mantendo `livros.autor` durante a compatibilidade de transição.
- Atualizar os fluxos de livros e catálogo para aceitar e retornar autores normalizados quando informados.
- Atualizar documentação de domínio e contratos e validar os artefatos XanoScript antes da publicação.
- Publicar os scripts no workspace Xano somente após o acesso ao workspace estar disponível.

## Capabilities

### New Capabilities

- `autores-catalogo`: cadastro e associação normalizada de autores aos livros.

### Modified Capabilities

- `apis-biblioteca`: validação, respostas estruturadas, consolidação de endpoints e regras de conflito dos fluxos existentes.
- `catalogo`: consultas e cadastro de livros com disponibilidade e autores normalizados.

## Impact

- Arquivos XanoScript em `xano/api/` e `xano/table/`.
- Documentos `docs/domain-model.md` e `docs/api-contracts.md`.
- Workspace remoto Xano, quando autenticado e compartilhado.
- Consumidores atuais continuam podendo usar o campo textual `autor` durante a transição.

