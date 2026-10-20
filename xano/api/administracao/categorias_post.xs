query "categorias" verb=POST {
  api_group = "administracao"
  auth = "bibliotecarios"
  description = "Cria uma categoria"

  input {
    text nome filters=trim
  }

  stack {
    db.add "categorias" {
      data = { nome: $input.nome }
    } as $categoria
  }

  response = $categoria
}
