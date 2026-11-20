// Autentica um leitor e retorna o token de acesso JWT
query login_leitor verb=POST {
  api_group = "auth"

  input {
    // Endereço de e-mail do leitor
    email email filters=trim|lower
  
    // Senha de acesso
    password senha
  }

  stack {
    // Busca o cadastro do leitor pelo e-mail
    db.get leitores {
      field_name = "email"
      field_value = $input.email
    } as $leitor
  
    // Verifica se o leitor existe
    precondition ($leitor != null) {
      error_type = "accessdenied"
      error = "Credenciais inválidas"
    }
  
    // Verifica se o leitor possui senha cadastrada
    precondition ($leitor.senha != null) {
      error_type = "accessdenied"
      error = "Leitor ainda não possui senha configurada. Solicite o cadastro de senha."
    }
  
    // Valida a senha informada com o hash armazenado
    security.check_password {
      text_password = $input.senha
      hash_password = $leitor.senha
    } as $senha_valida
  
    // Interrompe se a senha informada for incorreta
    precondition ($senha_valida) {
      error_type = "accessdenied"
      error = "Credenciais inválidas"
    }
  
    // Garante que apenas leitores com status ativo possam efetuar login
    precondition ($leitor.status == "ativo") {
      error_type = "accessdenied"
      error = "Usuário inativo. Entre em contato com a biblioteca."
    }
  
    // Gera o token de autenticação JWT para o leitor
    security.create_auth_token {
      table = "leitores"
      extras = {nome: $leitor.nome, email: $leitor.email}
      expiration = 86400
      id = $leitor.id
    } as $token
  }

  response = {
    authToken: $token
    leitor   : ```
      {
        id: $leitor.id
        nome: $leitor.nome
        email: $leitor.email
        telefone: $leitor.telefone
        status: $leitor.status
      }
      ```
  }
}