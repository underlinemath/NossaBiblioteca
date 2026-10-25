// Cria uma categoria
query categorias verb=POST {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    text nome filters=trim
  }

  stack {
    db.add categorias {
      data = {nome: $input.nome}
    } as $categoria
  }

  response = $categoria
  guid = "RU47Xq1Mmu6DIi9Q7aEquNR0-G4"
}