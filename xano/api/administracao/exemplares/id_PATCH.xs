// Atualiza um exemplar
query "exemplares/{id}" verb=PATCH {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int id
    int livro_id
    text codigo filters=trim
    text situacao
    bool disponivel
  }

  stack {
    db.edit exemplares {
      field_name = "id"
      field_value = $input.id
      data = {
        livro_id  : $input.livro_id
        codigo    : $input.codigo
        situacao  : $input.situacao
        disponivel: $input.disponivel
        updated_at: now
      }
    } as $exemplar
  }

  response = {data: $exemplar, error: null}
  guid = "wkmXFT0xMF5kMR6GJ2e58E_r4OE"
}
