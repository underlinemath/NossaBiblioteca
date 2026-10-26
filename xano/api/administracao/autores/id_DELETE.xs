// Remove um autor sem associações
query "autores/{id}" verb=DELETE {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {int id}

  stack {
    db.get autores {field_name = "id", field_value = $input.id} as $autor
    conditional {
      if ($autor == null) {throw {name: "NotFoundError", value: "Autor não encontrado"}}
    }
    db.query livros_autores {
      where = $db.livros_autores.autor_id == $input.id
      return = {type: "exists"}
    } as $tem_livros
    conditional {
      if ($tem_livros) {throw {name: "ConflictError", value: "Autor possui livros associados"}}
    }
    db.del autores {field_name = "id", field_value = $input.id}
  }

  response = {data: {deleted: true, id: $input.id}, error: null}
}
