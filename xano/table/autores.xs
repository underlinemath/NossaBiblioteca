table autores {
  auth = false

  schema {
    int id
    text nome filters=trim
    timestamp created_at?=now
    timestamp updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "nome"}]}
  ]

  guid = "NpuOEyhwON0Nrw1zA-aTnAPcswA"
}
