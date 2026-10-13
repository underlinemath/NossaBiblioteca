table "itens_emprestimos" {
  schema {
    int id
    int emprestimo_id
    int exemplar_id
    date data_prevista_devolucao
    date data_efetiva_devolucao
    text situacao
    timestamp created_at?=now
    timestamp updated_at?=now
  }

  index = [
    { type: "primary", field: [{ name: "id" }] },
    { type: "btree", field: [{ name: "emprestimo_id" }] },
    { type: "btree", field: [{ name: "exemplar_id" }] }
  ]
}
