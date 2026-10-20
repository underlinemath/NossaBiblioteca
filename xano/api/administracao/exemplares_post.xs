query "exemplares" verb=POST {
  api_group = "administracao"
  auth = "bibliotecarios"
  description = "Cadastra um exemplar"

  input {
    int livro_id
    text codigo filters=trim
    text situacao?="disponivel"
  }

  stack {
    db.add "exemplares" {
      data = {
        livro_id: $input.livro_id,
        codigo: $input.codigo,
        situacao: $input.situacao,
        disponivel: true
      }
    } as $exemplar
  }

  response = $exemplar
}
