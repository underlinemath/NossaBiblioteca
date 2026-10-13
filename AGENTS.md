# Instruções para agentes

Este arquivo contém instruções para agentes de IA que trabalham no projeto NossaBiblioteca.

Ele define regras operacionais para o trabalho no projeto. Não substitui nem duplica o conteúdo de `openspec/Project-Overview.md`, `docs/` ou das changes do OpenSpec.

## Documentação

- Antes de realizar alterações significativas, consultar `openspec/Project-Overview.md`.
- Consultar os documentos em `docs/` quando a mudança envolver o domínio, os dados ou a arquitetura.
- Manter a documentação sincronizada com o comportamento implementado.
- Não substituir decisões existentes por suposições; registrar decisões novas no OpenSpec.

## Arquitetura

- Respeitar as tecnologias e os limites definidos no projeto, incluindo o Xano como camada de persistência.
- Não introduzir tecnologias alternativas sem justificativa documentada.
- Consultar `docs/domain-model.md` para detalhes das entidades e relacionamentos, em vez de duplicá-los neste arquivo.

## Código

- Reutilizar código e estruturas existentes quando apropriado.
- Evitar duplicação e abstrações desnecessárias.
- Manter as alterações focadas na change atual.
- Não modificar funcionalidades não relacionadas sem justificativa.
- Preservar contratos públicos e compatibilidade existente, salvo quando a change exigir alteração explícita.

## Segurança

- Aplicar regras de autenticação e autorização no backend.
- Não confiar em permissões informadas pelo cliente.
- Restringir operações administrativas aos bibliotecários.
- Não expor credenciais, tokens ou dados sensíveis em código, logs ou documentação.
- Validar entradas antes de criar ou alterar dados.

## Desenvolvimento

- Mudanças funcionais devem utilizar OpenSpec.
- Antes de implementar uma change, conferir sua proposta, escopo e decisões pendentes.
- Manter mudanças fora do escopo separadas da implementação atual.
- Registrar no OpenSpec as decisões que alterem o comportamento do produto.

## Testes e verificação

- Toda mudança funcional deve possuir uma estratégia de verificação.
- Validar os fluxos e as regras afetados pela mudança, conforme definidos no OpenSpec e na documentação do domínio.
- Executar a validação estrita do OpenSpec para a change antes de considerá-la concluída.
- Não declarar sucesso sem uma verificação recente e reproduzível.

## Manutenção da documentação

- Manter as regras operacionais neste arquivo e os requisitos do produto no OpenSpec.
- Atualizar a documentação correspondente quando uma mudança alterar comportamento, dados ou arquitetura.
- Não copiar listas completas de requisitos, entidades ou funcionalidades para este arquivo.
- Registrar novas decisões no documento apropriado, em vez de criar regras conflitantes aqui.
