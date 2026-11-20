// Login and retrieve an authentication token
query "auth/login" verb=POST {
  api_group = "auth"

  input {
    email email filters=trim|lower
    password senha
  }

  stack {
    db.get bibliotecarios {
      field_name = "email"
      field_value = $input.email
    } as $bibliotecario
  
    precondition ($bibliotecario != null) {
      error_type = "accessdenied"
      error = "Credenciais inválidas"
    }
  
    precondition ($bibliotecario.status == "ativo") {
      error_type = "accessdenied"
      error = "Usuário inativo"
    }
  
    security.check_password {
      text_password = $input.senha
      hash_password = $bibliotecario.senha
    } as $senha_valida
  
    precondition ($senha_valida) {
      error_type = "accessdenied"
      error = "Credenciais inválidas"
    }
  
    security.create_auth_token {
      table = "bibliotecarios"
      extras = {
        nome      : $bibliotecario.nome
        email     : $bibliotecario.email
        permissoes: $bibliotecario.permissoes
      }
    
      expiration = 86400
      id = $bibliotecario.id
    } as $authToken
  }

  response = {
    authToken: $authToken
    user     : ```
      {
        id        : $bibliotecario.id
        nome      : $bibliotecario.nome
        email     : $bibliotecario.email
        permissoes: $bibliotecario.permissoes
        status    : $bibliotecario.status
      }
      ```
  }
}