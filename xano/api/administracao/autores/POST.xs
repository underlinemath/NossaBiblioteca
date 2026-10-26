// Cadastra um autor
query autores verb=POST {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    text nome filters=trim
  }

  stack {
    db.get autores {
      field_name = "nome"
      field_value = $input.nome
    } as $existente

    conditional {
      if ($existente != null) {
        throw {name: "ConflictError", value: "Já existe um autor com este nome"}
      }
    }

    db.add autores {
      data = {nome: $input.nome}
    } as $autor
  }

  response = {data: $autor, error: null}
}
