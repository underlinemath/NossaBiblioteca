// Lista empréstimos para o painel administrativo, com os dados relacionados
query emprestimos verb=GET {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int page?=1 filters=min:1 {
      description = "Página da consulta administrativa"
    }
  }

  stack {
    db.query emprestimos {
      sort = {data_emprestimo: "desc"}
      return = {
        type  : "list"
        paging: {page: $input.page, per_page: 50, totals: true}
      }
    } as $emprestimos
    db.query itens_emprestimos {
      sort = {id: "asc"}
      return = {type: "list", paging: {page: 1, per_page: 500, totals: true}}
    } as $itens
    db.query leitores {
      sort = {id: "asc"}
      return = {type: "list", paging: {page: 1, per_page: 500, totals: true}}
    } as $leitores
    db.query exemplares {
      sort = {id: "asc"}
      return = {type: "list", paging: {page: 1, per_page: 500, totals: true}}
    } as $exemplares
  }

  response = {
    data: {
      emprestimos: $emprestimos
      itens: $itens
      leitores: $leitores
      exemplares: $exemplares
    }
    error: null
  }
  guid = "Jb-CD78T0uClEA1Vhk9eF4S-bWs"
}
