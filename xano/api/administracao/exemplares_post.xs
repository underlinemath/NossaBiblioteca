// Cadastra um exemplar
query exemplares verb=POST {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int livro_id
    text isbn filters=trim
    text situacao?=disponivel
  }

  stack {
    db.add exemplares {
      data = {
        livro_id  : $input.livro_id
        codigo    : $input.isbn
        situacao  : $input.situacao
        disponivel: true
      }
    } as $exemplar
  }

  response = {data: $exemplar, error: null}
  guid = "r8wuzFAAdygJD_t5YqwBOc1qHZs"
}
