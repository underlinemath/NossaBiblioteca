# Tasks

## 1. Preparar a execução segura

- [x] 1.1 Definir o formato das variáveis de ambiente, seleção do workspace e prefixo da massa de teste; verificar que a suíte falha explicitamente sem configuração obrigatória e não expõe tokens.
- [ ] 1.2 Enumerar as rotas de `docs/api-contracts.md` e dos grupos Xano, incluindo autenticação; verificar que a matriz de cobertura não possui rota sem caso de teste.
- [x] 1.3 Documentar no contrato o comando de execução, o isolamento da massa e a política de limpeza; verificar que a documentação não contém credenciais.
- [x] 1.4 Reconciliar os schemas com o snapshot remoto e remover definições duplicadas de grupos por GUID; verificar dry-run sem `DROP_FIELD` e publicação bem-sucedida.

## 2. Implementar a massa de dados

- [ ] 2.1 Criar fixtures idempotentes para categorias, autores e leitores; verificar por consultas que cada chave natural identifica um único registro nas tabelas correspondentes.
- [ ] 2.2 Criar fixtures de livros e associações `livros_autores`; verificar categoria, autor legado, `autor_ids` e unicidade na tabela intermediária.
- [ ] 2.3 Criar fixtures de exemplares com situações distintas; verificar que cada `livro_id` existe e que códigos repetidos não geram duplicatas.
- [ ] 2.4 Criar dados controlados de reserva, empréstimo e item de empréstimo para os cenários de circulação; verificar as chaves estrangeiras e o estado inicial dos exemplares.
- [ ] 2.5 Implementar reexecução e limpeza limitada aos identificadores da massa; verificar que duas execuções mantêm a mesma cardinalidade e não alteram registros fora do escopo.

## 3. Testar contratos e segurança

- [ ] 3.1 Testar endpoints de autenticação e obter tokens apenas em memória; verificar sucesso, credencial inválida e ausência de token sem persistência indevida.
- [ ] 3.2 Testar categorias, autores, livros, exemplares e leitores em GET/POST/PATCH/DELETE conforme o contrato; verificar status, payload, erros e tabela afetada em cada escrita.
- [ ] 3.3 Testar consultas de catálogo, paginação, busca, autores normalizados e disponibilidade; verificar que livro inativo ou inexistente retorna 404 estruturado.
- [ ] 3.4 Testar reservas, empréstimos e devoluções; verificar associação com leitor/exemplar, datas, transição de disponibilidade e conflito para exemplar ocupado.
- [ ] 3.5 Testar autorização por perfil em cada mutação administrativa e devolução; verificar 401/403 e ausência de alteração no banco quando o ator não é bibliotecário.

## 4. Integrar, validar e entregar

- [ ] 4.1 Adicionar o caso concorrente de dois empréstimos para o mesmo exemplar; verificar que no máximo uma requisição cria empréstimo ativo e a outra retorna conflito.
- [ ] 4.2 Executar a suíte completa contra um ambiente Xano configurado e gerar relatório de rotas, tabelas, IDs e falhas; verificar que todos os endpoints documentados foram exercitados.
- [x] 4.3 Executar validação OpenSpec estrita e revisar a documentação de APIs e domínio; verificar que a change passa sem inconsistências e que o resultado é reproduzível.
- [ ] 4.4 Executar a carga após autenticação válida do bibliotecário e do leitor; verificar que nenhum dado é enviado quando o login falha e que a massa completa é criada/reutilizada após o login passar.

## Workflow follow-up

- Arquivar a change somente após a implementação e a validação estrita serem concluídas.
- Confirmar no arquivo arquivado quais testes foram executados e em qual ambiente, sem registrar segredos.
- A carga permanece bloqueada até o login do bibliotecário retornar token; a senha não deve ser registrada em artifacts, relatórios ou commits.
