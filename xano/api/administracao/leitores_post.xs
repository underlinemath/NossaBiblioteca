// Cadastra um leitor
query leitores verb=POST {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    text nome filters=trim
    email email
    text telefone?
    text status?=ativo
  }

  stack {
    db.add leitores {
      data = {
        nome    : $input.nome
        email   : $input.email
        telefone: $input.telefone
        status  : $input.status
      }
    } as $leitor
  }

  response = {data: $leitor, error: null}
  guid = "w_xGzvybpSMmTtbLbWrbj1zvLuA"
}
