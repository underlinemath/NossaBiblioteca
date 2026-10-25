// Lista as reservas do leitor autenticado
query reservas verb=GET {
  api_group = "circulacao"
  auth = "leitores"

  input {
  }

  stack {
    db.query reservas {
      where = $db.reservas.leitor_id == $auth.id
      sort = {data_reserva: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 50, totals: true}}
    } as $reservas
  }

  response = $reservas
  guid = "CLZ4szlkMEyxbURAVYOjzyZzxGA"
}