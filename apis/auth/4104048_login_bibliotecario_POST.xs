// Autentica um bibliotecário e retorna o token de acesso JWT
query login_bibliotecario verb=POST {
  api_group = "auth"

  input {
    // Endereço de e-mail do bibliotecário
    email email filters=trim|lower
  
    // Senha de acesso
    password senha
  }

  stack {
    // Busca o registro do bibliotecário pelo e-mail
    db.get bibliotecarios {
      field_name = "email"
      field_value = $input.email
    } as $bibliotecario
  
    // Verifica se o bibliotecário foi encontrado
    precondition ($bibliotecario != null) {
      error_type = "accessdenied"
      error = "Credenciais inválidas"
    }
  
    // Valida a senha fornecida comparando com o hash gravado
    security.check_password {
      text_password = $input.senha
      hash_password = $bibliotecario.senha
    } as $senha_valida
  
    // Interrompe se a senha estiver incorreta
    precondition ($senha_valida) {
      error_type = "accessdenied"
      error = "Credenciais inválidas"
    }
  
    // Verifica se o bibliotecário está com status ativo
    precondition ($bibliotecario.status == "ativo") {
      error_type = "accessdenied"
      error = "Usuário inativo. Entre em contato com o suporte."
    }
  
    // Gera o token de autenticação JWT
    security.create_auth_token {
      table = "bibliotecarios"
      extras = {
        nome      : $bibliotecario.nome
        email     : $bibliotecario.email
        permissoes: $bibliotecario.permissoes
      }
    
      expiration = 86400
      id = $bibliotecario.id
    } as $token
  }

  response = {
    authToken    : $token
    bibliotecario: ```
      {
        id: $bibliotecario.id
        nome: $bibliotecario.nome
        email: $bibliotecario.email
        permissoes: $bibliotecario.permissoes
        status: $bibliotecario.status
      }
      ```
  }
}