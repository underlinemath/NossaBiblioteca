# Design

## Context

A proposta está descrita em `proposal.md`, e os comportamentos esperados estão definidos em `specs/interface-biblioteca/spec.md`.

O projeto NossaBiblioteca utiliza Streamlit para apresentar as funcionalidades de gerenciamento de uma biblioteca. A interface deverá possuir uma identidade visual própria, inspirada em bibliotecas clássicas, combinando elementos tradicionais com uma apresentação moderna.

A implementação deverá preservar as funcionalidades existentes e manter a separação entre apresentação, regras de negócio e persistência.

## Goals / Non-Goals

**Goals:**

- Criar uma identidade visual sofisticada e acolhedora, inspirada em bibliotecas clássicas.
- Utilizar uma fotografia de biblioteca como plano de fundo da aplicação.
- Aplicar transparência e efeito de vidro nos componentes sobrepostos ao fundo.
- Definir uma paleta de cores baseada em verde-floresta, creme, dourado envelhecido e tons de madeira.
- Utilizar títulos com tipografia serifada para reforçar a identidade literária.
- Disponibilizar temas claro e escuro.
- Organizar a navegação entre as oito áreas existentes.
- Padronizar títulos, formulários, tabelas, indicadores e mensagens.
- Preservar as funcionalidades existentes.
- Facilitar a leitura e a utilização em diferentes tamanhos de tela.

**Non-Goals:**

- Implementar novas integrações com APIs do Xano.
- Alterar tabelas, endpoints ou regras de negócio do backend.
- Implementar autenticação ou controle de permissões.
- Substituir o Streamlit por outra tecnologia.
- Modificar os contratos existentes do sistema.

## Decisions

### 1. Manter o Streamlit como camada de apresentação

A interface continuará utilizando Streamlit para apresentar as páginas e permitir a navegação.

Alternativa considerada: desenvolver uma interface web separada. Essa alternativa foi descartada para evitar a introdução de uma nova estrutura de frontend.

### 2. Utilizar fotografia de biblioteca como plano de fundo

A aplicação utilizará uma imagem de biblioteca clássica, com estantes de livros, tons de madeira e iluminação acolhedora.

A imagem deverá cobrir o plano de fundo da aplicação, mantendo uma apresentação consistente durante a navegação.

Alternativa considerada: utilizar apenas uma cor sólida. Essa alternativa foi descartada por não transmitir a identidade visual desejada.

### 3. Aplicar efeito de vidro translúcido

Os painéis, cartões e áreas de conteúdo deverão utilizar fundos semitransparentes, bordas discretas e, quando suportado, desfoque do plano de fundo.

O conteúdo deverá permanecer legível sobre a fotografia.

Alternativa considerada: utilizar cartões totalmente opacos. Essa alternativa foi descartada por reduzir o efeito visual pretendido.

### 4. Definir uma paleta inspirada em bibliotecas clássicas

A identidade visual deverá priorizar:

- Verde-floresta para navegação e elementos de destaque.
- Creme e tons de papel para superfícies claras.
- Dourado envelhecido para detalhes e destaques.
- Tons de madeira para complementar a fotografia.
- Tons escuros e contrastantes para o tema escuro.

As cores deverão ser aplicadas de forma consistente entre as páginas.

### 5. Utilizar tipografia com identidade literária

Os títulos deverão utilizar uma tipografia serifada, reforçando a estética clássica.

Textos de formulários, tabelas e indicadores deverão utilizar uma tipografia de fácil leitura.

### 6. Disponibilizar tema claro e escuro

A interface deverá permitir alternar entre tema claro e tema escuro.

A alternância deverá preservar a identidade visual da aplicação, a fotografia de fundo e a legibilidade dos componentes.

Alternativa considerada: disponibilizar apenas um tema. Essa alternativa foi descartada para ampliar a flexibilidade de utilização.

### 7. Organizar a interface por áreas da biblioteca

A navegação deverá contemplar:

- Painel inicial.
- Livros.
- Categorias.
- Leitores.
- Exemplares.
- Empréstimos.
- Devoluções.
- Reservas.

A organização deverá facilitar o acesso a cada área sem remover funcionalidades existentes.

### 8. Separar apresentação e regras de negócio

A interface será responsável pela apresentação das informações, pela coleta de entradas e pela comunicação dos resultados.

As regras de negócio, a persistência e as permissões continuarão sendo responsabilidades do backend.

### 9. Tratar dados indisponíveis de forma explícita

Quando não houver dados para apresentar, a interface deverá mostrar mensagens claras, sem inventar registros ou indicadores.

Dados demonstrativos deverão ser identificados como fictícios.

## Risks / Trade-offs

- [Risco] A fotografia pode prejudicar a leitura dos componentes → [Mitigação] Aplicar transparência controlada, contraste adequado e desfoque quando suportado.
- [Risco] O efeito de vidro pode apresentar diferenças entre navegadores → [Mitigação] Utilizar estilos compatíveis e manter fundos alternativos legíveis.
- [Risco] A alternância de temas pode causar inconsistência visual → [Mitigação] Centralizar as cores e os estilos utilizados pela interface.
- [Risco] Algumas páginas podem apresentar dados demonstrativos → [Mitigação] Identificar claramente os dados fictícios.
- [Risco] Alterações visuais podem afetar funcionalidades existentes → [Mitigação] Implementar gradualmente e executar verificações após cada etapa.
- [Risco] A interface pode ser confundida com uma camada de segurança → [Mitigação] Manter validações e permissões definitivas no backend.

## Migration Plan

1. Conferir a interface existente antes de realizar alterações.
2. Implementar o plano de fundo e a identidade visual.
3. Aplicar os estilos aos componentes existentes.
4. Organizar a navegação e padronizar as páginas.
5. Implementar a alternância entre tema claro e escuro.
6. Executar a aplicação e verificar as oito áreas.
7. Verificar formulários, tabelas, mensagens e estados sem dados.
8. Corrigir problemas encontrados e validar novamente.
9. Conferir o diff do Git para confirmar que os contratos do backend não foram alterados.

Não são necessárias migrações de banco de dados nesta mudança.
