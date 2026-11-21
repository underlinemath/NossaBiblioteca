# Design

## Context

Consulte `proposal.md` para motivação e os deltas em `specs/` para o comportamento esperado. A interface atual é vanilla JavaScript sem build step; `scripts/xano-seed.mjs` já contém convenções de URL, envelope `{data,error}`, bearer token e paginação Xano, enquanto as APIs administrativas requerem autenticação de bibliotecário. `GET /emprestimos` hoje é exclusivo de leitores, então não deve ser reutilizado no painel administrativo.

## Goals / Non-Goals

**Goals:** introduzir um cliente HTTP pequeno para os quatro grupos Xano, carregar entidades com mapeamento explícito do contrato para o modelo de tela, autenticar operações administrativas e manter os relacionamentos por IDs remotos.

**Non-Goals:** adicionar framework/bundler, expor credenciais de serviço no browser, alterar permissões do Xano para contornar lacunas de API ou migrar os dados antigos do `localStorage` automaticamente.

## Decisions

1. **Cliente HTTP vanilla compartilhado.** Criar módulo de API reutilizável com bases de URL configuráveis sem segredos, `fetch`, timeout, JSON, bearer token e tratamento uniforme de `{data,error}` e erros Xano. Evita dependência nova e facilita execução como site estático.
2. **Sessão sem credencial persistida.** Enviar senha somente ao login e manter token administrativo em `sessionStorage`; limpar no logout e em resposta 401. Alternativas de senha em `.env` do browser ou token hardcoded são rejeitadas por serem públicas no bundle.
3. **Backend como fonte de verdade.** Formulários usam IDs e campos reais aceitos pelas APIs. Uma escrita só atualiza a tela após resposta de sucesso; conflitos/validações são exibidos e os dados são recarregados. Campos locais sem suporte no contrato (por exemplo, editora/ano se não existirem no schema) não serão enviados até contrato/schema serem confirmados.
4. **Fechar lacunas de consulta antes de ligar telas dependentes.** Criar endpoint administrativo autenticado para empréstimos e itens relacionados, com paginação; fornecer dados de disponibilidade do catálogo e/ou exemplares necessários à tela de empréstimo sem expor dados administrativos em rotas públicas. Não alterar `GET /emprestimos` de leitor.
5. **Estados de carregamento e erro explícitos.** Cada carregamento assíncrono apresenta progresso, erro recuperável e botão/tentativa de atualização; nenhuma lista vazia será exibida como sucesso quando a chamada falhar.

## Risks / Trade-offs

- [CORS ou URLs de grupo Xano divergentes] → validar preflight e as URLs de ambiente real; bases são configuração pública e separada dos segredos.
- [Divergência entre Xano publicado e arquivos versionados] → validar cada rota no workspace Xano antes de ligar a tela e registrar a divergência; não inventar resposta nem presumir implantação automática dos `.xs`.
- [XSS pode ler token no `sessionStorage`] → escapar conteúdo renderizado, não inserir HTML não confiável e limitar sessão ao ciclo da aba; migração para cookie HttpOnly exige backend compatível.
- [Paginação parcial pode ocultar registros] → consumir metadados da paginação até completar as telas que precisam de totais, ou apresentar paginação explícita.

## Migration Plan

1. Confirmar/implementar e testar contratos faltantes no Xano; publicar as APIs compatíveis.
2. Adicionar cliente e configuração pública das bases, depois fluxo de autenticação e leituras.
3. Conectar mutações e remover o caminho de escrita em `localStorage` para dados remotos.
4. Validar em ambiente Xano não produtivo primeiro; rollback consiste em reverter o front-end e os endpoints novos sem apagar registros existentes.
