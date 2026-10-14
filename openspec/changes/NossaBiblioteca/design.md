# Design

## Context

O projeto utiliza o Xano para persistência de dados e XanoScript para definir tabelas e operações. As regras de negócio e as permissões devem ser aplicadas no backend. Consulte `proposal.md` e as especificações em `specs/` para os requisitos funcionais.

## Goals / Non-Goals

**Goals:**
- Organizar os dados e os relacionamentos da biblioteca.
- Garantir que empréstimos e devoluções respeitem as regras de negócio.
- Restringir operações administrativas aos bibliotecários.
- Permitir validação incremental com OpenSpec.

**Non-Goals:**
- Criar integrações externas nesta versão.
- Implementar aplicativo mobile.
- Implementar multas e notificações automáticas.

## Decisions

### Persistência no Xano

O Xano será a camada de persistência. As tabelas e operações serão desenvolvidas com XanoScript, mantendo os dados relacionados por identificadores.

Alternativa considerada: utilizar arquivos locais. Essa opção não atende ao objetivo de centralizar os dados no backend.

### Regras de negócio no backend

As permissões, validações e regras de empréstimo serão aplicadas no backend, sem depender da interface para garantir segurança.

Alternativa considerada: validar somente no frontend. Essa opção não é suficiente para proteger os dados.

### Organização das entidades

O modelo deverá contemplar leitores, bibliotecários, livros, categorias, exemplares, reservas, empréstimos e itens de empréstimo.

### Prazo de empréstimo

O prazo padrão será de 7 dias, conforme definido para o projeto.

## Risks / Trade-offs

- **Dados inconsistentes:** validar os relacionamentos e as entradas antes de salvar.
- **Empréstimos duplicados:** verificar a disponibilidade do exemplar no backend antes de registrar um empréstimo.
- **Permissões incorretas:** verificar o perfil do usuário em cada operação protegida.
- **Mudanças no modelo:** validar as alterações antes de aplicá-las no ambiente do Xano.

## Migration Plan

1. Revisar as especificações e o modelo de dados.
2. Definir as tabelas e os relacionamentos no Xano.
3. Implementar as operações de backend.
4. Testar os fluxos de cadastro, empréstimo e devolução.
5. Aplicar as alterações após validar os resultados.

A implementação deverá evitar alterações destrutivas nos dados existentes. A estratégia de reversão será definida antes de mudanças que afetem dados persistidos.