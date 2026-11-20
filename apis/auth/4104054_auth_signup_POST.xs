// Signup and retrieve an authentication token
query "auth/signup" verb=POST {
  api_group = "auth"

  input {
    text nome filters=trim|min:1
    email email filters=lower|trim
    text telefone? filters=trim
    text status?=ativo filters=trim
    password senha filters=min:6
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
          value = "Já existe um leitor cadastrado com este e-mail"
        }
      }
    }
  
    db.add leitores {
      data = {
        nome    : $input.nome
        email   : $input.email
        senha   : $input.senha
        telefone: $input.telefone
        status  : ($input.status ?? "ativo")
      }
    } as $leitor
  
    security.create_auth_token {
      table = "leitores"
      extras = {nome: $leitor.nome, email: $leitor.email}
      expiration = 86400
      id = $leitor.id
    } as $authToken
  }

  response = {
    authToken: $authToken
    user     : ```
      {
        id      : $leitor.id
        nome    : $leitor.nome
        email   : $leitor.email
        telefone: $leitor.telefone
        status  : $leitor.status
      }
      ```
  }
}