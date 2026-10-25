// Retorna o leitor autenticado
query "auth/leitores/me" verb=GET {
  api_group = "auth"
  auth = "leitores"

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
}
