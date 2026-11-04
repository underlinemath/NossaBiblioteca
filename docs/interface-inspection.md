# Inspeção da interface — NossaBiblioteca

## Arquivos e pastas identificados

- `streamlit_app.py`: arquivo principal da interface Streamlit.
- `docs/domain-model.md`: documentação das entidades, relacionamentos e regras de integridade.
- `openspec/changes/interface-streamlit/`: documentos de planejamento da mudança.
- `xano-backend`, `xano-dev` e `xano`: pastas relacionadas ao backend.

## Áreas de navegação identificadas

1. Painel inicial
2. Livros
3. Categorias
4. Leitores
5. Exemplares
6. Empréstimos
7. Devoluções
8. Reservas

## Observações iniciais

- O painel inicial apresenta indicadores e informa que utiliza dados fictícios mantidos durante a sessão.
- Livros possuem operações de consulta e tentativa de cadastro por meio de chamadas ao Xano.
- Categorias, leitores e exemplares utilizam dados mantidos em sessão no trecho inspecionado.
- A integração das demais áreas precisa ser verificada antes de qualquer conclusão.
- O token de API aparece como um marcador de preenchimento no código inspecionado; nenhum token real deve ser colocado no Git.
- Esta inspeção registra o estado observado, sem modificar a implementação da interface.

## Próximo passo

Verificar o restante do código e identificar quais funcionalidades já existem antes de alterar a navegação ou os componentes visuais.
