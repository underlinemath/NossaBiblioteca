// Lista os empréstimos do leitor autenticado
query emprestimos verb=GET {
  api_group = "circulacao"
  auth = "leitores"

  input {
  }

  stack {
    db.query emprestimos {
      where = $db.emprestimos.leitor_id == $auth.id
      sort = {data_emprestimo: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 50, totals: true}}
    } as $emprestimos
  }

  response = $emprestimos
  guid = "_dhiG6YcCczJEPtShpyJYSGFYe8"
}