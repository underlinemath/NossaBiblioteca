query "livros/{id}" verb=GET {
  api_group = "catalogo"
  description = "Consulta um livro ativo pelo identificador"

  input {
    int id
  }

  stack {
    db.query "livros" {
      where = $db.livros.id == $input.id && $db.livros.ativo == true
      return = { type: "single" }
    } as $livro
  }

  response = $livro
  guid = "PuBGXUKB__50ChTOM1RYhfyRLu8"
}
