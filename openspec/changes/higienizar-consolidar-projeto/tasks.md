# Tasks

## 1. Inventário e classificação

- [x] 1.1 Inventariar arquivos fonte, documentação, configuração local e artefatos derivados, registrando o resultado no diff ou na documentação de manutenção.
- [x] 1.2 Comparar `xano/`, `xano-backend/` e `xano-dev/` por caminho e conteúdo e verificar se há diferenças funcionais antes de escolher a fonte oficial.
- [x] 1.3 Procurar referências aos YAMLs, PNGs, workspaces e diretórios candidatos à remoção; verificar que nenhum arquivo usado por teste ou documentação será descartado.

## 2. Consolidação e documentação

- [x] 2.1 Atualizar `README.md` com a estrutura oficial, comandos de validação e limites do projeto; verificar os comandos a partir de uma cópia limpa do repositório.
- [x] 2.2 Atualizar os documentos em `docs/` para refletir os contratos e decisões confirmadas, sem inventar decisões pendentes; revisar links e caminhos.
- [x] 2.3 Adicionar ou ajustar `.gitignore` para estados locais, capturas e artefatos gerados; verificar que nenhuma fonte Xano ou documento necessário ficou ignorado.

## 3. Limpeza segura

- [x] 3.1 Remover somente artefatos classificados como temporários ou duplicados, preservando uma lista verificável no diff e validando que o frontend continua abrindo.
- [x] 3.2 Remover ou manter `xano-backend/` e `xano-dev/` conforme a comparação funcional e documentar a decisão; verificar que a fonte Xano escolhida contém todos os contratos necessários.
- [x] 3.3 Procurar credenciais, tokens, URLs privadas e estados locais no conjunto versionado; corrigir qualquer exposição antes do commit.

## 4. Validação e entrega

- [x] 4.1 Executar a validação estrita do OpenSpec e confirmar que a change está completa.
- [x] 4.2 Validar os arquivos XanoScript e os fluxos documentados de catálogo, administração e circulação; registrar limitações quando o ambiente Xano não estiver disponível.
- [x] 4.3 Revisar `git diff`, `git diff --cached` e a lista de arquivos a publicar; criar um commit focado e verificar seu conteúdo.
- [x] 4.4 Atualizar a branch a partir de `origin/main` sem sobrescrever alterações e enviar o commit ao repositório remoto; verificar o estado final do remoto.

## Workflow follow-up

- Arquivar esta change após a implementação e a validação completa.
- Avaliar a sincronização com o Xano somente se houver ambiente e credenciais disponíveis; não apagar recursos remotos automaticamente.
