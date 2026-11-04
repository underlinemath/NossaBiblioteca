# Tasks

## 1. Contratos e configuração segura

- [x] 1.1 Confirmar URLs públicas dos grupos e contratos ativos no workspace Xano, registrar configuração pública sem segredos e validar requisições preflight/CORS em ambiente de teste.
- [ ] 1.2 Implementar consulta administrativa paginada de empréstimos com itens, exemplares e leitores; validar resposta com token de bibliotecário e rejeição de token ausente/de leitor.
- [ ] 1.3 Documentar respostas, paginação, campos suportados e erros das rotas usadas pela interface; verificar exemplos contra os arquivos versionados em `xano/api/`.

## 2. Cliente e sessão Xano

- [ ] 2.1 Criar cliente HTTP vanilla para os quatro grupos com bearer token, timeout, JSON, envelope Xano e erros estruturados; validar por testes unitários sucesso, erro Xano, HTTP não-2xx e timeout.
- [ ] 2.2 Implementar login, consulta de identidade, logout e expiração de sessão; validar que credenciais não são persistidas e que 401 encerra sessão e volta ao login.
- [ ] 2.3 Criar mapeadores explícitos dos payloads Xano para livros, autores, categorias, exemplares, leitores e empréstimos; validar fixtures de todos os formatos de resposta reais.

## 3. Leituras e interface

- [ ] 3.1 Substituir carregamento local por leituras Xano nas telas de painel, livros, leitores e empréstimos, incluindo paginação e disponibilidade; validar cada tela com dados do ambiente de teste.
- [ ] 3.2 Implementar estados de carregamento, vazio, erro e nova tentativa sem mascarar falhas como listas vazias; validar interrupção de rede em cada tela.
- [ ] 3.3 Atualizar textos de status/rodapé e remover dados de demonstração como fonte de verdade; validar que recarregar a página mantém dados iguais aos retornados pelo Xano.

## 4. Escritas e integração ponta a ponta

- [ ] 4.1 Conectar criação e edição de livros, autores, categorias, exemplares e leitores às rotas administrativas, respeitando campos suportados; validar persistência e relacionamentos após cada gravação.
- [ ] 4.2 Conectar registro de empréstimo e devolução às APIs administrativas; validar conflito de exemplar indisponível, transição de situação e recarga após sucesso.
- [ ] 4.3 Tratar erros 400/401/403/404/409 e falhas de rede sem alterar dados exibidos antes de confirmação; validar cada resposta com cenários de contrato.
- [ ] 4.4 Executar validação OpenSpec estrita e testes de navegador ponta a ponta em ambiente de teste Xano; comprovar login, leitura, cadastro, empréstimo, devolução e logout sem segredos em logs.
