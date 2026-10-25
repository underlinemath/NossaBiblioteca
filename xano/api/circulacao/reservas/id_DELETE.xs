// Cancela uma reserva do leitor autenticado
query "reservas/{id}" verb=DELETE {
  api_group = "circulacao"
  auth = "leitores"

  input {
    int id
  }

  stack {
    db.get reservas {
      field_name = "id"
      field_value = $input.id
    } as $reserva
  
    conditional {
      if ($reserva == null || $reserva.leitor_id != $auth.id) {
        throw {
          name = "NotFoundError"
          value = "Reserva não encontrada"
        }
      }
    }
  
    db.edit reservas {
      field_name = "id"
      field_value = $input.id
      data = {situacao: "cancelada", updated_at: now}
    } as $cancelada
  }

  response = $cancelada
  guid = "3igfPa-DA4FhhqwSwnje2CyZzm0"
}