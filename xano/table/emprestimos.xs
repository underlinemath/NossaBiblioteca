table emprestimos {
  auth = false

  schema {
    int id
    int leitor_id
    timestamp data_emprestimo?=now
    text situacao
    timestamp created_at?=now
    timestamp updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "leitor_id"}]}
  ]

  guid = "r7d3kCByJvcYFLidTyAFUV1aAP8"
}