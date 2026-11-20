# Tasks

## 1. Acesso remoto e inventário do Xano

- [x] 1.1 Confirmar servidor MCP/CLI autenticado, workspace, instância e branch alvo; validar identidade e leitura somente, sem executar mutações se ambiente/branch não corresponderem ao workspace esperado.
- [x] 1.2 Inventariar os dez schemas de tabela, atributos, índices e todas as APIs/grupos publicados; gerar matriz local-remoto (rota, método, inputs, auth, response, status e tabela afetada) e verificar que nenhum arquivo versionado ficou de fora.
- [x] 1.3 Validar sintaxe dos arquivos `.xs` por CLI/MCP e documentar contratos reais em `docs/api-contracts.md`; verificar relatório de parsing com erros e warnings por caminho/linha sem valores sensíveis.

## 2. Diagnóstico e correção da autenticação e erros

- [x] 2.1 Reproduzir login usando valores locais sem imprimir e-mail, senha, token ou payload; testar rota/grupo, nomes dos campos, conta ativa e caso inválido, verificando status e formato de resposta.
- [x] 2.2 Comparar fluxo de criação/hash de bibliotecário com `security.check_password` e versão publicada; corrigir a causa confirmada e adicionar testes de regressão para login válido, inválido, conta inativa e resposta sem segredo.
- [x] 2.3 Normalizar erros esperados em `{error:{code,message}}` e preservar status HTTP, transação e integridade; verificar validação, 401/403, 404, 409 e 5xx sem stack traces nem falso sucesso.
- [x] 2.4 Atualizar documentação e testes dos contratos de autenticação/erro; validar compatibilidade dos clientes existentes e cobertura dos cenários negativos.

## 3. Testes completos de APIs e persistência

- [x] 3.1 Implementar matriz automatizada para cada endpoint publicado: sucesso quando aplicável, payload inválido, ausência de token, token de perfil incorreto, recurso inexistente e conflito; verificar rota/método/status sem registrar segredos.
- [x] 3.2 Testar os dez schemas e cada atributo gravável/leitura segura por meio das APIs apropriadas; verificar IDs, unicidade, obrigatoriedade, tipo, status e vínculos conforme o modelo de domínio.
- [x] 3.3 Testar atomicidade e segurança de categorias, autores, livros, `livros_autores`, exemplares e leitores; verificar persistência nas tabelas corretas e ausência de gravação parcial em erro.
- [x] 3.4 Testar reservas, empréstimos, itens e devoluções, incluindo duas tentativas concorrentes no mesmo exemplar; verificar que no máximo uma vence e as situações/datas remotas ficam coerentes.
- [x] 3.5 Testar DELETE e outras operações destrutivas apenas em fixtures criadas pela execução; verificar remoção/soft-delete correta e que nenhum registro preexistente foi alterado.
- [x] 3.6 Emitir relatório de cobertura rota/tabela/atributo com IDs de teste, status e falhas sanitizados; validar reexecução do conjunto de testes e idempotência das chaves prefixadas.

## 4. Carga de fixtures e publicação física

- [x] 4.1 Ajustar a carga idempotente para preencher categorias, autores, livros com um ou mais autores, exemplares, leitores, reservas, empréstimos e itens; verificar prefixo exclusivo e zero mutações em bibliotecários ou registros fora da massa.
- [x] 4.2 Executar carga e testes completos primeiro em branch/ambiente isolado; consultar remotamente cada tabela e validar contagens, atributos e relações antes de qualquer publicação Live.
- [x] 4.3 Exportar/snapshot do estado publicado, revisar diff exato e plano de rollback; verificar que mudanças remotas limitam-se aos arquivos aprovados e que a carga é somente aditiva.
- [x] 4.4 Publicar XanoScript e endpoints aprovados no workspace/branch físico solicitado; executar smoke tests remotos de login, leitura, escrita e autorização e confirmar persistência pós-publicação.
- [x] 4.5 Executar `openspec validate auditar-corrigir-publicar-xano --strict` e validar relatório final com rotas, tabelas, IDs, resultado e rollback sem segredos.

## Workflow follow-up

- A change `validar-e-popular-banco-biblioteca` continua sendo referência para fixtures e carga repetível; sincronizar seu status/relatório somente após validar que os cenários são cobertos por esta execução.
- Arquivar esta change somente após revisão do relatório remoto e validação estrita concluída.
