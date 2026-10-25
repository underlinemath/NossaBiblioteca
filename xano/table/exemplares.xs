table exemplares {
  auth = false

  schema {
    int id
    int livro_id
    text codigo filters=trim
    text situacao
    bool disponivel?=true
    timestamp created_at?=now
    timestamp updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "livro_id"}]}
    {type: "btree|unique", field: [{name: "codigo"}]}
  ]

  guid = "bXniuQsLk3PWnRFaXj3pEJTAMMw"
}