table autores {
  auth = false

  schema {
    int id
    text nome filters=trim
    text nome_autor filters=trim
    text livro_id?
    timestamp created_at?=now
    timestamp updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "nome"}]}
    {type: "btree", field: [{name: "nome_autor"}]}
  ]

  guid = "NpuOEyhwON0Nrw1zA-aTnAPcswA"
}
