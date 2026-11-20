// Cadastra um novo bibliotecário e retorna o token de autenticação
query bibliotecarios verb=POST {
  api_group = "auth"

  input {
    // Nome completo do bibliotecário
    text nome filters=trim|min:1
  
    // Endereço de e-mail único para login
    email email filters=trim|lower
  
    // Senha de acesso
    password senha filters=min:6
  
    // Nível de permissões de acesso
    text permissoes?=admin filters=trim
  
    // Status inicial do cadastro
    text status?=ativo filters=trim
  }

  stack {
    // Verifica se já existe bibliotecário cadastrado com este e-mail
    db.get bibliotecarios {
      field_name = "email"
      field_value = $input.email
    } as $existente
  
    conditional {
      if ($existente != null) {
        throw {
          name = "ConflictError"
          value = "Já existe um bibliotecário cadastrado com este e-mail"
        }
      }
    }
  
    // Insere o novo bibliotecário no banco de dados
    db.add bibliotecarios {
      data = {
        nome      : $input.nome
        email     : $input.email
        senha     : $input.senha
        permissoes: ($input.permissoes ?? "admin")
        status    : ($input.status ?? "ativo")
      }
    } as $bibliotecario
  
    // Gera o token de autenticação JWT para o novo bibliotecário
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
        created_at: $bibliotecario.created_at
      }
      ```
  }
}