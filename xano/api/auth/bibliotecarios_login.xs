// Autentica um bibliotecário
query "auth/bibliotecarios/login" verb=POST {
  api_group = "auth"

  input {
    email email
    password senha
  }

  stack {
    db.get bibliotecarios {
      field_name = "email"
      field_value = $input.email
    } as $bibliotecario

    conditional {
      if ($bibliotecario == null || $bibliotecario.status != "ativo") {
        throw {
          name = "AccessDeniedError"
          value = "E-mail ou senha inválidos"
        }
      }
    }

    security.check_password {
      text_password = $input.senha
      hash_password = $bibliotecario.senha
    } as $senha_valida

    conditional {
      if ($senha_valida == false) {
        throw {
          name = "AccessDeniedError"
          value = "E-mail ou senha inválidos"
        }
      }
    }

    security.create_auth_token {
      table = "bibliotecarios"
      extras = {}
      id = $bibliotecario.id
      expiration = 86400
    } as $auth_token
  }

  response = {data: {
    authToken: $auth_token
    user     : {
      id         : $bibliotecario.id
      nome       : $bibliotecario.nome
      email      : $bibliotecario.email
      permissoes : $bibliotecario.permissoes
      status     : $bibliotecario.status
    }
  }, error: null}
  guid = "59sJ5fWm3dgc0-xTFeWY4vICEgM"
}
