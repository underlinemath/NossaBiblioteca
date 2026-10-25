// Autentica um leitor
query "auth/leitores/login" verb=POST {
  api_group = "auth"

  input {
    email email
    password senha
  }

  stack {
    db.get leitores {
      field_name = "email"
      field_value = $input.email
    } as $leitor

    conditional {
      if ($leitor == null || $leitor.status != "ativo") {
        throw {
          name = "AccessDeniedError"
          value = "E-mail ou senha inválidos"
        }
      }
    }

    security.validate_password {
      plain = $input.senha
      hashed = $leitor.senha
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
      dbtable = "leitores"
      id = $leitor.id
      expiration = 86400
    } as $auth_token
  }

  response = {
    authToken: $auth_token.token
    user     : {
      id      : $leitor.id
      nome    : $leitor.nome
      email   : $leitor.email
      telefone: $leitor.telefone
      status  : $leitor.status
    }
  }
}
