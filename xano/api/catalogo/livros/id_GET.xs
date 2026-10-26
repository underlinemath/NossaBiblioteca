// Consulta um livro ativo pelo identificador
query "livros/{id}" verb=GET {
  api_group = "catalogo"

  input {
    int id
  }

  stack {
    db.query livros {
      where = $db.livros.id == $input.id && $db.livros.ativo == true
      return = {type: "single"}
    } as $livro
    conditional {
      if ($livro == null) {throw {name: "NotFoundError", value: "Livro não encontrado"}}
    }
  }

  response = {data: $livro, error: null}
  guid = "PuBGXUKB__50ChTOM1RYhfyRLu8"
}
