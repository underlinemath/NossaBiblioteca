// Consulta a contagem de registros em todas as tabelas para confirmação remota
// Bloco de entradas vazio
query confirmar_dados verb=GET {
  api_group = "administracao"

  input {
  }

  stack {
    // Conta o total de categorias
    db.query categorias {
      return = {type: "count"}
    } as $cnt_categorias
  
    // Conta o total de autores
    db.query autores {
      return = {type: "count"}
    } as $cnt_autores
  
    // Conta o total de livros
    db.query livros {
      return = {type: "count"}
    } as $cnt_livros
  
    // Conta as associações de livros e autores
    db.query livros_autores {
      return = {type: "count"}
    } as $cnt_livros_autores
  
    // Conta o total de exemplares
    db.query exemplares {
      return = {type: "count"}
    } as $cnt_exemplares
  
    // Conta o total de leitores cadastrados
    db.query leitores {
      return = {type: "count"}
    } as $cnt_leitores
  
    // Conta o total de empréstimos
    db.query emprestimos {
      return = {type: "count"}
    } as $cnt_emprestimos
  
    // Conta o total de itens de empréstimos
    db.query itens_emprestimos {
      return = {type: "count"}
    } as $cnt_itens_emprestimos
  
    // Conta exemplares disponíveis
    db.query exemplares {
      where = $db.exemplares.disponivel == true
      return = {type: "count"}
    } as $cnt_exemplares_disponiveis
  
    // Conta exemplares emprestados
    db.query exemplares {
      where = $db.exemplares.disponivel == false
      return = {type: "count"}
    } as $cnt_exemplares_emprestados
  
    // Lista amostra dos livros com categorias
    db.query livros {
      return = {type: "list", paging: {page: 1, per_page: 20}}
    } as $amostra_livros
  
    // Lista amostra dos leitores
    db.query leitores {
      return = {type: "list", paging: {page: 1, per_page: 20}}
    } as $amostra_leitores
  }

  response = {
    tabelas            : ```
      {
        categorias       : $cnt_categorias
        autores          : $cnt_autores
        livros           : $cnt_livros
        livros_autores   : $cnt_livros_autores
        exemplares       : $cnt_exemplares
        leitores         : $cnt_leitores
        emprestimos      : $cnt_emprestimos
        itens_emprestimos: $cnt_itens_emprestimos
      }
      ```
    situacao_exemplares: ```
      {
        disponiveis: $cnt_exemplares_disponiveis
        emprestados: $cnt_exemplares_emprestados
      }
      ```
    amostra_livros     : $amostra_livros.items
    amostra_leitores   : $amostra_leitores.items
  }
}