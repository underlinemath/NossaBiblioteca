query "itens-emprestimos/{id}/devolucao" verb=PATCH {
  api_group = "circulacao"
  auth = "bibliotecarios"
  description = "Registra a devolução de um item"

  input {
    int id
    date data_efetiva_devolucao?=today
  }

  stack {
    db.edit "itens_emprestimos" {
      field_name = "id"
      field_value = $input.id
      data = {
        data_efetiva_devolucao: $input.data_efetiva_devolucao,
        situacao: "devolvido",
        updated_at: now
      }
    } as $item

    db.edit "exemplares" {
      field_name = "id"
      field_value = $item.exemplar_id
      data = { disponivel: true, situacao: "disponivel", updated_at: now }
    } as $exemplar
  }

  response = { item: $item, exemplar: $exemplar }
}
