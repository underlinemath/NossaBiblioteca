# Proposal

## Why

O login do bibliotecário no Xano está rejeitando credenciais que o operador afirma serem válidas, e ainda não há evidência reproduzível de que todos os contratos, tabelas, relacionamentos e endpoints publicados correspondam ao backend versionado. É necessário identificar a causa sem expor segredos, corrigir e validar o conjunto completo, popular dados de teste isolados e publicar a versão aprovada no workspace Xano solicitado.

## What Changes

- Auditar todos os arquivos `.xs` de tabelas, grupos e endpoints, comparando entradas, campos, autenticação, status/erros, integridade referencial e estado publicado no Xano.
- Diagnosticar o login administrativo de ponta a ponta (URL/grupo/rota, formato de payload, e-mail/status da conta e verificação do hash), mantendo a mesma mensagem pública genérica e sem redefinir senha ou expor credenciais/hash.
- Executar testes de contrato positivos e negativos para autenticação, todos os endpoints documentados, autorização por perfil e gravação/leitura das entidades relacionadas.
- Corrigir divergências de XanoScript e normalizar falhas para respostas estruturadas consistentes sem esconder erros reais nem converter falhas em sucesso.
- Preparar carga repetível e isolada para categorias, autores, livros, vínculos, exemplares, leitores, reservas, empréstimos e itens; não criar nem modificar bibliotecários existentes.
- Após auditoria e testes aprovados, publicar os arquivos revisados no workspace/branch Xano solicitado e confirmar os endpoints e registros por leitura remota.
- Reaproveitar a massa e os utilitários da change `validar-e-popular-banco-biblioteca` quando compatíveis, evitando cargas duplicadas e mantendo este escopo focado em diagnóstico, correção e publicação.

## Capabilities

### New Capabilities
- Nenhuma.

### Modified Capabilities
- `apis-biblioteca`: definir comportamento diagnóstico e verificável para login administrativo e erros de autenticação/API, preservando segurança e compatibilidade.

## Impact

Afeta `xano/table/`, `xano/api/`, `docs/api-contracts.md`, `scripts/xano-seed.mjs` e os artefatos de teste/relatório. A execução remota depende de uma sessão Xano CLI ou MCP efetivamente autenticada e do workspace/branch corretos. A publicação é limitada aos arquivos revisados; não inclui exclusão de dados existentes, alteração/reset de senha, mudança de permissões ou registro de segredos em artefatos/logs.
