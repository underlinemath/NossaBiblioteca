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

    security.validate_password {
      plain = $input.senha
      hashed = $bibliotecario.senha
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
      dbtable = "bibliotecarios"
      id = $bibliotecario.id
      expiration = 86400
    } as $auth_token
  }

  response = {
    authToken: $auth_token.token
    user     : {
      id         : $bibliotecario.id
      nome       : $bibliotecario.nome
      email      : $bibliotecario.email
      permissoes : $bibliotecario.permissoes
      status     : $bibliotecario.status
    }
  }
}
