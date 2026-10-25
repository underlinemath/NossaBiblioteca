// Cadastra um leitor e retorna um token de autenticação
query "auth/leitores/signup" verb=POST {
  api_group = "auth"

  input {
    text nome filters=trim
    email email
    password senha
    text telefone?
  }

  stack {
    db.get leitores {
      field_name = "email"
      field_value = $input.email
    } as $existente

    conditional {
      if ($existente != null) {
        throw {
          name = "ConflictError"
          value = "Já existe um leitor com este e-mail"
        }
      }
    }

    var $senha_hash {
      value = $input.senha|security.hash_password
    }

    db.add leitores {
      data = {
        nome    : $input.nome
        email   : $input.email
        senha   : $senha_hash
        telefone: $input.telefone
        status  : "ativo"
      }
    } as $leitor

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
