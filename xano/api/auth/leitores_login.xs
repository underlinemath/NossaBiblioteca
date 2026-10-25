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

    security.check_password {
      text_password = $input.senha
      hash_password = $leitor.senha
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
      table = "leitores"
      extras = {}
      id = $leitor.id
      expiration = 86400
    } as $auth_token
  }

  response = {
    authToken: $auth_token
    user     : {
      id      : $leitor.id
      nome    : $leitor.nome
      email   : $leitor.email
      telefone: $leitor.telefone
      status  : $leitor.status
    }
  }
  guid = "Zoks7NOoDbRgtxhLAGkwNLhIP8A"
}
