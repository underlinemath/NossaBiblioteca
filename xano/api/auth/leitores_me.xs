// Retorna o leitor autenticado
query "auth/leitores/me" verb=GET {
  api_group = "auth"
  auth = "leitores"

  input {
  }

  stack {
    db.get leitores {
      field_name = "id"
      field_value = $auth.id
    } as $leitor
  }

  response = {
    id      : $leitor.id
    nome    : $leitor.nome
    email   : $leitor.email
    telefone: $leitor.telefone
    status  : $leitor.status
  }
  guid = "u78xgxEbp4K3UDqE5mc3FNJpro8"
}
