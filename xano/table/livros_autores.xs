table livros_autores {
  auth = false

  schema {
    int id
    int livro_id
    int autor_id
    timestamp created_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "livro_id"}]}
    {type: "btree", field: [{name: "autor_id"}]}
    {type: "btree|unique", field: [{name: "livro_id"}, {name: "autor_id"}]}
  ]
}
