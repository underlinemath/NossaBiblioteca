query "livros" verb=GET {
  api_group = "catalogo"
  description = "Lista livros ativos, com pesquisa opcional por título, autor ou ISBN"

  input {
    text busca?
    int categoria_id?
    int page?=1
  }

  stack {
    db.query "livros" {
      where = $db.livros.ativo == true && ($db.livros.titulo includes $input.busca || $db.livros.autor includes $input.busca || $db.livros.isbn includes $input.busca || $input.busca == null) && $db.livros.categoria_id ==? $input.categoria_id
      sort = { titulo: "asc" }
      return = {
        type: "list"
        paging: { page: $input.page, per_page: 20, totals: true }
      }
    } as $livros
  }

  response = $livros
  guid = "KOR0pZSC0jlBm7awaO18ooXE660"
}
