// Retorna o bibliotecário autenticado
query "auth/bibliotecarios/me" verb=GET {
  api_group = "auth"
  auth = "bibliotecarios"

  input {
  }

  stack {
    db.get bibliotecarios {
      field_name = "id"
      field_value = $auth.id
    } as $bibliotecario
  }

  response = {data: {
    id        : $bibliotecario.id
    nome      : $bibliotecario.nome
    email     : $bibliotecario.email
    permissoes: $bibliotecario.permissoes
    status    : $bibliotecario.status
  }, error: null}
  guid = "IX5HrlJt7qxGW4_DnWp_kbWyBJs"
}
