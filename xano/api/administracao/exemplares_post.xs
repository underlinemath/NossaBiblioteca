// Cadastra um exemplar
query exemplares verb=POST {
  api_group = "administracao"
  auth = "bibliotecarios"

  input {
    int livro_id
    text codigo filters=trim
    text situacao?=disponivel
  }

  stack {
    db.get livros {field_name = "id", field_value = $input.livro_id} as $livro
    conditional {
      if ($livro == null || $livro.ativo != true) {throw {name: "ValidationError", value: "Livro não encontrado ou inativo"}}
    }
    db.get exemplares {field_name = "codigo", field_value = $input.codigo} as $existente
    conditional {
      if ($existente != null) {throw {name: "ConflictError", value: "Já existe um exemplar com este código"}}
    }
    db.add exemplares {
      data = {
        livro_id  : $input.livro_id
        codigo    : $input.codigo
        situacao  : $input.situacao
        disponivel: true
      }
    } as $exemplar
  }

  response = {data: $exemplar, error: null}
  guid = "r8wuzFAAdygJD_t5YqwBOc1qHZs"
}
