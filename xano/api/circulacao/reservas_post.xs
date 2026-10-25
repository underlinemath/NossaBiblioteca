// Cria uma reserva para o leitor autenticado
query reservas verb=POST {
  api_group = "circulacao"
  auth = "leitores"

  input {
    int livro_id?
    int exemplar_id?
    text modalidade
  }

  stack {
    db.query reservas {
      where = $db.reservas.leitor_id == $auth.id && $db.reservas.situacao == "pendente" && (($input.livro_id != null && $db.reservas.livro_id == $input.livro_id) || ($input.exemplar_id != null && $db.reservas.exemplar_id == $input.exemplar_id))
      return = {type: "exists"}
    } as $duplicada

    conditional {
      if ($duplicada) {
        throw {
          name = "ConflictError"
          value = "Já existe uma reserva pendente para este recurso"
        }
      }
    }

    db.add reservas {
      data = {
        leitor_id  : $auth.id
        livro_id   : $input.livro_id
        exemplar_id: $input.exemplar_id
        modalidade : $input.modalidade
        situacao   : "pendente"
      }
    } as $reserva
  }

  response = $reserva
  guid = "iJXnBQsDnn0CFvdjWFboIUF1KTw"
}
