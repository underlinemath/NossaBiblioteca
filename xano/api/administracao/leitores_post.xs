query "leitores" verb=POST {
  api_group = "administracao"
  auth = "bibliotecarios"
  description = "Cadastra um leitor"

  input {
    text nome filters=trim
    email email
    text telefone?
    text status?="ativo"
  }

  stack {
    db.add "leitores" {
      data = {
        nome: $input.nome,
        email: $input.email,
        telefone: $input.telefone,
        status: $input.status
      }
    } as $leitor
  }

  response = $leitor
}
