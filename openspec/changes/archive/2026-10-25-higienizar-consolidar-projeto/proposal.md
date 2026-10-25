# Proposal

## Why

O repositório mistura código de execução, fontes do Xano, cópias de workspace e artefatos de captura usados durante o desenvolvimento. Essa mistura dificulta identificar a fonte oficial, aumenta o risco de publicar arquivos temporários e torna a sincronização com o Git e o Xano pouco reproduzível.

## What Changes

- Definir quais diretórios e arquivos são fontes oficiais do frontend, do Xano, da documentação e do OpenSpec.
- Remover somente artefatos temporários, duplicados ou derivados cuja função não seja necessária para executar, testar ou documentar o projeto.
- Consolidar a documentação para refletir o estado real do frontend, das APIs Xano e das decisões já tomadas.
- Adicionar regras de ignorância para evitar que novas capturas, estados locais e artefatos gerados sejam versionados acidentalmente.
- Verificar a consistência dos arquivos XanoScript e preservar os contratos públicos existentes.
- Preparar um commit rastreável com a limpeza e revisar o conteúdo antes de publicar no repositório remoto.

## Capabilities

### New Capabilities

Nenhuma. Esta é uma change de manutenção, documentação e organização do repositório, sem comportamento novo para usuários ou APIs.

### Modified Capabilities

Nenhuma. Os contratos existentes de catálogo, administração e circulação não devem ser alterados por esta change.

## Impact

- **Código:** organização dos arquivos estáticos do frontend e dos diretórios Xano.
- **Documentação:** `README.md`, documentos em `docs/` e referências de operação do projeto.
- **Controle de versão:** possível remoção de arquivos não-fonte, atualização de regras de ignore e novo commit.
- **Xano:** apenas validação e identificação da fonte oficial; publicação remota só ocorrerá se houver credenciais, ambiente e autorização operacional disponíveis.
- **Fora do escopo:** novas funcionalidades, mudança de contratos de API, migração de dados, exclusão de recursos no Xano e mudanças irreversíveis sem confirmação específica.
