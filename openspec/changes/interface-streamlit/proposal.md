# Proposal

## Why

O sistema NossaBiblioteca precisa de uma interface gráfica organizada, intuitiva e visualmente acolhedora. A identidade visual deve remeter ao ambiente de uma biblioteca clássica, transmitindo conhecimento, elegância e aconchego, sem abrir mão da modernidade e da facilidade de utilização.

A interface será desenvolvida com Streamlit, utilizando uma fotografia de biblioteca como plano de fundo e componentes visuais sobrepostos com transparência, criando uma experiência visual sofisticada e coerente com a proposta do sistema.

## What Changes

- Organizar a interface principal da NossaBiblioteca.
- Disponibilizar navegação clara entre as seções do sistema.
- Apresentar telas para painel inicial, livros, categorias, leitores, exemplares, empréstimos, devoluções e reservas.
- Criar uma identidade visual inspirada em bibliotecas clássicas.
- Utilizar fotografia de biblioteca como plano de fundo da interface.
- Aplicar efeito de vidro translúcido nos painéis e componentes sobrepostos ao fundo.
- Utilizar uma paleta de verde-floresta, creme, dourado envelhecido e tons de madeira.
- Padronizar títulos, formulários, tabelas, indicadores e mensagens.
- Disponibilizar tema claro e escuro.
- Preservar as funcionalidades existentes e facilitar a utilização em navegadores.

Fora do escopo desta change: integração de novas APIs, autenticação, alterações no banco de dados e implementação ou modificação de regras de negócio.

## Capabilities

### New Capabilities

- `interface-biblioteca`: navegação, identidade visual, organização e apresentação das telas do sistema de biblioteca.

### Modified Capabilities

Nenhuma.

## Impact

- Interface Python desenvolvida com Streamlit.
- Arquivo principal da interface: `streamlit_app.py`.
- Estilização visual por CSS.
- Dependência principal: Streamlit.
- Possível utilização de imagem local como plano de fundo.
- Não altera os contratos das APIs, as tabelas do Xano ou as regras de negócio.
