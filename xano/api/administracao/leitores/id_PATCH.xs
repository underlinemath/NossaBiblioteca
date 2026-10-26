// Atualiza um leitor
query "leitores/{id}" verb=PATCH {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int id
    text nome filters=trim
    email email
    text telefone?
    text status
  }

  stack {
    db.edit leitores {
      field_name = "id"
      field_value = $input.id
      data = {
        nome      : $input.nome
        email     : $input.email
        telefone  : $input.telefone
        status    : $input.status
        updated_at: now
      }
    } as $leitor
  }

  response = {data: $leitor, error: null}
  guid = "ik9vPLvA0_AMixn6TiKxYJzS7fg"
}
