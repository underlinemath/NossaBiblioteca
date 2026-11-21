# Spec Delta

## ADDED Requirements

### Requirement: Falha de autenticação administrativa segura e diagnosticável
A API de login de bibliotecário SHALL aceitar o contrato documentado e rejeitar credenciais inválidas com resposta estruturada e mensagem pública genérica, sem revelar se o e-mail existe, o status da conta ou detalhes do hash.

#### Scenario: Credenciais administrativas válidas
- **WHEN** uma conta bibliotecária ativa envia e-mail e senha válidos no contrato documentado
- **THEN** a API SHALL responder sucesso com token e identidade pública do bibliotecário, sem incluir senha ou hash

#### Scenario: Credenciais ou conta inválidas
- **WHEN** e-mail, senha ou status da conta não permite autenticação
- **THEN** a API SHALL responder erro de autenticação estruturado e genérico sem criar token nem revelar qual condição falhou

### Requirement: Erros de API preservam semântica e formato
As APIs da biblioteca SHALL converter erros esperados em respostas JSON estruturadas com código e mensagem, mantendo status HTTP apropriado e sem converter falhas em respostas de sucesso.

#### Scenario: Entrada inválida
- **WHEN** uma requisição viola validação de campo, relacionamento ou unicidade
- **THEN** a API SHALL retornar erro estruturado de validação e não persistir alterações parciais

#### Scenario: Conflito de integridade ou disponibilidade
- **WHEN** a operação conflita com um registro existente ou exemplar indisponível
- **THEN** a API SHALL retornar erro estruturado de conflito e preservar os registros confirmados antes da solicitação

#### Scenario: Falha interna inesperada
- **WHEN** uma execução falha por condição interna não prevista
- **THEN** a API SHALL retornar erro 5xx estruturado sem expor stack trace, segredos ou dados sensíveis
