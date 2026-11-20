# Design

## Context

Consulte `proposal.md` e o delta de `apis-biblioteca`. O backend versionado contém dez esquemas de tabela e rotas distribuídas em autenticação, catálogo, administração e circulação. `docs/api-contracts.md` documenta parte das rotas; `scripts/xano-seed.mjs` oferece fixtures prefixadas e não destrutivas, mas ainda não comprova cada endpoint nem cada atributo remoto. O endpoint local de login busca e-mail exatamente, exige `status == "ativo"` e verifica `senha` com `security.check_password`; qualquer um desses pontos ou divergência com a publicação pode explicar a mensagem genérica observada.

O arquivo `.vscode/mcp.json` declara `@xano/developer-mcp`, mas a disponibilidade de ferramentas operacionais não é garantida por essa declaração. Nesta execução não há comando `xano` instalado nem ferramentas de leitura/publicação de workspace expostas; a execução deve estabelecer e verificar autenticação Xano antes de qualquer chamada remota.

## Goals / Non-Goals

**Goals:** gerar uma matriz rastreável tabela/campo e rota/método/autenticação; encontrar a causa do login rejeitado com verificações que não revelem dados secretos; corrigir e executar testes de contrato incluindo persistência; e publicar de forma rastreável a versão aprovada no workspace/branch físico indicado.

**Non-Goals:** resetar senha ou permissões, criar ou editar bibliotecários, expor a senha/hash/token em relatório, limpar dados preexistentes, migrar frontend, ou redefinir regras de negócio sem especificação aprovada.

## Decisions

1. **Fonte de verdade dupla e diff antes de publicar.** Comparar arquivos locais com tabelas, grupos e endpoints do workspace/branch Xano ativo; classificar diferenças como intencionais ou defeitos. Alternativa rejeitada: publicar todo o diretório sem inventário, pois isso pode sobrescrever recursos remotos não versionados.
2. **Diagnóstico do login por etapas sem revelar segredo.** Validar host/grupo/rota e payload; tentar autenticação com as variáveis locais sem imprimi-las; inspecionar, com acesso administrativo, existência/estado da conta sem retornar e-mail completo ou hash; e comparar a estratégia de gravação/verificação de senha e o endpoint publicado com o código versionado. A resposta externa permanece genérica para impedir enumeração. Não modificar credenciais automaticamente.
3. **Matriz de contrato gerada a partir das rotas.** Para cada rota/método: sucesso quando seguro, entrada inválida, sem token, token de perfil incorreto, inexistência, conflito e persistência/ausência de persistência esperada. Endpoints destrutivos só podem operar em fixtures criadas pela própria execução e identificadas por prefixo exclusivo.
4. **Carga idempotente e aditiva.** Usar chave natural com prefixo exclusivo para categorias, autores, livros e exemplares; autenticar um leitor de teste dedicado; preservar leitor/bibliotecário existentes; criar vínculos e registros de circulação pela API. A execução não atualiza nem remove registros não pertencentes à massa.
5. **Erros estruturados sem mascaramento.** Mapear erros esperados para código/status estáveis e log seguro com rota, método, status e correlação. Falhas inesperadas seguem como 5xx, sem stack trace ou segredo no cliente; não serão transformadas em 200.
6. **Publicação controlada após validação.** Validar XanoScript, rodar testes numa branch/ambiente de validação quando disponível, revisar diff remoto e executar suíte contra o workspace físico. Publicar no branch Live somente após todos os checks e confirmar leitura pós-publicação. Se não houver branch de teste, realizar export/snapshot e preparar rollback antes da publicação.

## Risks / Trade-offs

- [MCP configurado, mas ferramenta não autenticada/operacional] → verificar presença do servidor, versão, perfil/CLI e workspace alvo antes de testes; parar sem escrita se a identidade/ambiente não puder ser confirmada.
- [Credenciais informadas parecem corretas, mas o login falha] → testar rota, payload, conta/status, hash e código publicado separadamente; não inferir nem expor qual dado secreto divergiu.
- [Fixtures misturadas a dados de uso real] → exigir prefixo exclusivo, leitura antes de criação, relatório de IDs e proibir limpeza ampla; não inserir bibliotecários nem sobrescrever registros existentes.
- [Publicação quebra APIs ativas] → comparar antes/depois, validar em branch de teste, exportar estado, publicar arquivos selecionados e manter plano de rollback.
- [Falhas técnicas do Xano divergem de status esperados] → validar comportamento real publicado e documentar mapeamento; não tratar parser local como prova de execução remota.

## Migration Plan

1. Confirmar acesso Xano autenticado, workspace, branch, URLs e estado publicado sem fazer mutações.
2. Inventariar e validar todos os esquemas, grupos e endpoints; reproduzir login e gerar relatório inicial sem segredos.
3. Corrigir XanoScript/contratos e testes; validar sintaxe, unitários e cenários remotos em ambiente isolado.
4. Carregar fixtures prefixadas e conferir contagens, atributos e chaves estrangeiras por consultas remotas.
5. Revisar diff/snapshot e publicar os recursos aprovados no branch Xano alvo; executar smoke tests e leitura pós-publicação.
6. Em falha, reverter apenas os recursos publicados nesta mudança e preservar todos os dados; remover somente fixtures próprias quando isso for seguro e explicitamente suportado.
