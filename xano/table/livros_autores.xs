table livros_autores {
  auth = false

  schema {
    int id
    int livro_id {
      table = "livros"
    }
    int autor_id {
      table = "autores"
    }
    timestamp created_at?=now
    timestamp updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "livro_id"}]}
    {type: "btree", field: [{name: "autor_id"}]}
    {type: "btree|unique", field: [{name: "livro_id"}, {name: "autor_id"}]}
  ]
  guid = "VBQz4RIuHE62YzQbaX944iyV4As"
}
