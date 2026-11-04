# Design

## Context

As APIs Xano estão versionadas em `xano/api/`, as tabelas em `xano/table/` e
os contratos públicos em `docs/api-contracts.md`. A execução deve usar o
backend como fonte de autorização e preservar os relacionamentos descritos em
`docs/domain-model.md`; não há credenciais ou ambiente Xano definidos no
repositório.

## Goals / Non-Goals

**Goals:**

- Exercitar todas as rotas do contrato em uma ordem que respeite dependências.
- Usar uma massa nomeada e isolável, com criação/reuso determinístico.
- Verificar tanto a resposta HTTP quanto o registro persistido e seus vínculos.
- Cobrir caminhos positivos, validação, autenticação, autorização e conflitos.

**Non-Goals:**

- Alterar contratos ou regras de negócio apenas para facilitar os testes.
- Popular produção automaticamente ou incluir tokens em fixtures.
- Testar integrações externas, multas, notificações ou relatórios.

## Decisions

1. **Testes orientados ao contrato e ao fluxo**
   - As rotas serão enumeradas a partir de `docs/api-contracts.md` e dos
     arquivos `xano/api/`, com asserções de status e payload.
   - Alternativa rejeitada: testar apenas funções internas, pois isso não
     comprova autenticação, roteamento e serialização reais.

2. **Carga em duas fases**
   - Primeiro serão criados/reutilizados dados-raiz (categorias, autores,
     leitores); depois livros, associações, exemplares e operações de
     circulação. Cada fixture terá uma chave natural de teste e o carregador
     consultará antes de criar.
   - Alternativa rejeitada: inserir IDs fixos, pois eles variam entre
     ambientes e podem vincular dados ao registro errado.

3. **Ambiente e credenciais externos**
   - URL, tokens, identificador do conjunto de teste e modo de limpeza serão
     fornecidos por variáveis/configuração local ignorada pelo Git. A suíte
     falhará explicitamente quando uma credencial necessária estiver ausente.
   - Alternativa rejeitada: fallback silencioso ou credencial no código, que
     poderia executar mutações no ambiente errado.

4. **Verificação de persistência**
   - Após cada escrita, a suíte consultará a API de leitura disponível ou uma
     inspeção autorizada do ambiente para confirmar a tabela e as chaves
     esperadas. Operações destrutivas ficarão limitadas aos IDs da massa.
   - Alternativa rejeitada: considerar apenas HTTP 2xx como sucesso, pois isso
     não garante que associações e estados derivados foram persistidos.

## Risks / Trade-offs

- **[Ambiente Xano indisponível]** → separar testes de contrato offline dos
  testes de integração e falhar com diagnóstico claro no segundo grupo.
- **[Dados reais misturados à massa]** → exigir prefixo/chave de teste,
  ambiente isolado quando possível e nunca executar limpeza ampla.
- **[Concorrência mascarada por testes sequenciais]** → incluir dois pedidos
  concorrentes para o mesmo exemplar e verificar que no máximo um vence.
- **[Schema Xano divergir do contrato]** → tratar a divergência como falha,
  registrar rota/tabela/campo e atualizar a especificação antes de corrigir a
  implementação.
