# Design

## Context

O projeto mantém o frontend em arquivos estáticos na raiz, os scripts de persistência e APIs em `xano/`, documentos de domínio em `docs/` e artefatos de planejamento em `openspec/`. Também existem diretórios de workspace e arquivos YAML/PNG produzidos durante exploração e testes. A proposta trata da organização do repositório, não de uma alteração no comportamento da biblioteca.

## Goals / Non-Goals

**Goals:**

- Estabelecer uma fonte versionada e identificável para cada parte do projeto.
- Distinguir fontes, documentação, configurações locais e evidências temporárias.
- Remover apenas itens cuja origem e finalidade temporária estejam confirmadas.
- Manter os contratos Xano e a documentação de domínio coerentes.
- Deixar uma validação reproduzível antes do commit e do push.

**Non-Goals:**

- Alterar regras de empréstimos, reservas, autenticação ou autorização.
- Excluir tabelas, APIs, dados ou workspaces remotos no Xano.
- Reescrever o frontend ou introduzir um novo framework.
- Commitar alterações pré-existentes sem revisar sua origem e seu conteúdo.

## Decisions

1. **`xano/` é a fonte oficial dos scripts Xano versionados.** `xano-backend/` e `xano-dev/` só serão mantidos se houver diferença funcional ou papel operacional documentado; caso sejam cópias locais, serão removidos ou ignorados depois de comparar seu conteúdo.
2. **Arquivos de captura não são fontes por padrão.** YAMLs de diálogos, estados de tela e imagens de inspeção serão classificados individualmente. Um arquivo só será preservado se for usado por teste reproduzível ou documentação.
3. **A limpeza será reversível até a revisão.** A remoção será feita em uma mudança isolada e registrada no diff. Nenhum recurso remoto do Xano será apagado.
4. **A documentação será atualizada com fatos observáveis.** Decisões pendentes só serão marcadas como resolvidas quando houver evidência nos contratos, scripts ou decisão explícita do projeto.
5. **Publicação remota será a última etapa.** O commit será revisado localmente, a branch será atualizada com o remoto sem sobrescrever mudanças e o push só ocorrerá após a validação do conteúdo.

## Risks / Trade-offs

- [Perda de artefato útil] → comparar nomes, conteúdo e referências antes de excluir; manter arquivos usados por testes ou documentação.
- [Divergência entre cópias Xano] → comparar scripts por caminho e conteúdo e registrar qual diretório é a fonte oficial.
- [Commit de alterações de outra sessão] → revisar `git diff` e `git diff --cached`, agrupando ou separando mudanças antes do commit.
- [Publicação de credenciais ou estado local] → procurar segredos, revisar `.gitignore` e inspecionar o diff final antes do push.

## Migration Plan

1. Inventariar fontes, artefatos derivados e diferenças entre os diretórios Xano.
2. Atualizar documentação e regras de ignore.
3. Remover apenas os artefatos aprovados pela classificação e validar a árvore final.
4. Validar XanoScript, contratos e fluxo frontend disponível.
5. Revisar o diff, criar commit e publicar no Git remoto se a autenticação estiver disponível.

Rollback: recuperar arquivos removidos pelo histórico Git antes do push, ou reverter o commit de limpeza. Não executar rollback remoto no Xano automaticamente.

## Open Questions

- Se `xano-backend/` e `xano-dev/` forem ambos necessários, qual é o ambiente oficial para desenvolvimento e qual é o de produção?
