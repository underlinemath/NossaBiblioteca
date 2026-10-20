query "emprestimos" verb=POST {
  api_group = "circulacao"
  auth = "bibliotecarios"
  description = "Registra um empréstimo de um exemplar"

  input {
    int leitor_id
    int exemplar_id
    date data_prevista_devolucao
  }

  stack {
    db.transaction {
      stack {
        db.get "exemplares" {
          field_name = "id"
          field_value = $input.exemplar_id
        } as $exemplar

        conditional {
          if ($exemplar == null || $exemplar.disponivel != true) {
            throw {
              name = "ConflictError"
              value = "Exemplar indisponível para empréstimo"
            }
          }
        }

        db.add "emprestimos" {
          data = { leitor_id: $input.leitor_id, situacao: "ativo" }
        } as $emprestimo

        db.add "itens_emprestimos" {
          data = {
            emprestimo_id: $emprestimo.id,
            exemplar_id: $input.exemplar_id,
            data_prevista_devolucao: $input.data_prevista_devolucao,
            situacao: "ativo"
          }
        } as $item

        db.edit "exemplares" {
          field_name = "id"
          field_value = $input.exemplar_id
          data = { disponivel: false, situacao: "emprestado", updated_at: now }
        } as $exemplar_atualizado
      }
    }
  }

  response = { emprestimo: $emprestimo, item: $item, exemplar: $exemplar_atualizado }
}
